(function(window, document, $, Date) {
    //Swiper Score
    var swiper = {};
    window.swiper = swiper;
    
    /**
     * The swiper event type
     */
    swiper.EVENT = 'card-swipe';
    /**
     * The character key that indicates a line end (default 13, carriage return)
     * <p>
     * This can be set if the card reader uses a different line end key.
     */
    swiper.LINE_END = 13;
    /**
     * Splits line data into three tracks
     * @type RegExp
     */
    var TRACK_REGEX = /(%.*?\?)?(;.*?\?)?/;
    /**
     * Splits track one into its sub-components
     * @type RegExp
     */
    var TRACK_1_REGEX = /%([A-Z])([0-9]{1,19})\^([^\^]{2,26})\^([0-9]{4}|\^)([0-9]{3}|\^)([^\?]+)\?/;
    /**
     * Splits track two into its sub-components
     * @type RegExp
     */
    var TRACK_2_REGEX = /;([0-9]{1,19})=([0-9]{4}|=)([0-9]{3}|=)([^\?]+)\?/;
    /**
     * Dummy card buffer (4242-4242-4242-4242 John Doe 01/15
     */
    var DUMMY_CARD = '%B4242424242424242^DOE/JOHN^15011011000?;B4242424242424242=15011011000?'.split('');
    
    /**
     * Indicates that the swiper is scanning for card data.
     * <p>
     * Set to true before swiping a card.
     */
    swiper.scanning = false;
    /**
     * Configurable delay (ms) before the swiper buffer is cleared.
     * <p>
     * This delay ensures a user cannot type on a keyboard and submit a card 
     * swipe. It should not be lower than however long it takes the card 
     * reader to submit a full line of data to the computer.
     */
    swiper.delay = 250;
    /**
     * Bypass key to submit a dummy card swipe (default back-tick (tilde) ` key)
     */
    swiper.bypass = 96;
    /**
     * When true, the bypass key will submit a dummy card swipe.
     * <p>
     * Set to false for deployment.
     */
    swiper.enableBypass = true;
    
    /**
     * Timestamp when a swipe event started, used with swiper.delay to 
     * determine valid card swipes.
     */
    var swipeStart = 0;
    /**
     * Array of jQuery selectors that will be triggered when a swipe event 
     * occurs.
     */
    var triggers = [];
    /**
     * jQuery focus selector that can be set using swiper.setFocus().
     * <p>
     * If multiple triggers are used, and a situation occurs where only one 
     * needs to be triggered, the focus can be set. Whenever the focus is 
     * set, a card swipe event is triggered on that focus instead of the 
     * triggers added via swiper.addTrigger.
     * <p>
     * Focus is lost on a card swipe, so it must be reset every time it is 
     * needed.
     */
    var focus;
    /**
     * Buffer of character keys for the swipe event.
     */
    var buffer = [];
    
    window.addEventListener('load', function() {
        //Register global keypress listener
        document.addEventListener('keypress', swiped);        
    });
    
    /**
     * Add a jQuery selector to be triggered when a swipe event occurs
     * @param {jQuery|string} selector the jQuery selector to be triggered
     * @returns {undefined}
     */
    swiper.addTrigger = function(selector) {
        triggers.push(selector);
    };
    /**
     * Set a jQuery selector to be focused for the next swipe event.
     * <p>
     * The next swipe event will only trigger the provided selector. It will 
     * not trigger any previous selectors added by swiper.addTrigger() until 
     * the next swipe event.
     * <p>
     * Focus is lost after a swipe event (even failed attempts). It must be 
     * reset each time as needed.
     * @param {jQuery|string} selector the jQuery selector to trigger next
     * @returns {undefined}
     */
    swiper.setFocus = function(selector) {
        focus = selector;
    };
    /**
     * Removes the previous set focus. The next swipe event will trigger 
     * all jQuery selectors added by swiper.addTrigger().
     * @returns {undefined}
     */
    swiper.removeFocus = function() {
        focus = undefined;
    };

    /**
     * The global keyboard listener
     * @param {Event} e keypress event
     */
    var swiped = function(e) {
        if (swiper.scanning) {
            e.preventDefault();
            var keyCode = e.keyCode;

            if (swipeStart === 0) {
                swipeStart = Date.now();
            }
            //If more time has passed since the swipe started (swiper.delay), 
            //reset the buffer.
            if ((Date.now() - swipeStart) > swiper.delay) {
                swipeStart = 0;
                buffer = [];
            }

            //If using a bypass key, set the buffer to dummy card info and 
            //change the key to indicate line end
            if (swiper.enableBypass && keyCode === swiper.bypass) {
                buffer = DUMMY_CARD;
                keyCode = swiper.LINE_END;
            }

            //When the line end key is detected, trigger the swipe event 
            //and reset the buffer
            if (keyCode === swiper.LINE_END) {
                //Check if the delay is valid
                if ((Date.now() - swipeStart) < swiper.delay) {
                    var card = new swiper.Card(buffer.join(''));
                    var event = document.createEvent('HTMLEvents');
                    event.initEvent(swiper.EVENT, true, true);
                    
                    if (focus) {
                        $(focus).trigger(swiper.EVENT, card);
                    }
                    else {
                        for (var i = 0; i < triggers.length; i++) {
                            $(triggers[i]).trigger(swiper.EVENT, card);
                        }
                    }
                }
                swipeStart = 0;
                buffer = [];
            }
            else {
                //Add keypress character to buffer
                buffer.push(String.fromCharCode(e.keyCode));
            }
        }
    };

    /**
     * The Card object represents a card read by the card reader.
     * <p>
     * A card is always returned by the card reader and card.isValid() should 
     * be checked before using the card object.
     * @param {string} line card reader track data
     * @returns {undefined}
     */
    swiper.Card = function(line) {

        //Protected this scope
        var self = this;

        //Card tracks (only track 1 and track 2 are supported)
        this.track1 = {};
        this.track1.valid = false;
        this.track2 = {};
        this.track2.valid = false;
        this.track3 = {};
        this.track3.valid = false;
        this.line = line;

        /**
         * Indicates if the card has valid track data. This method should be 
         * called before using the card.
         * <p>
         * Note that this method only indicates if the card contains 
         * properly formatted track data. It does not indicate the validity of 
         * the card number, expiration date, or any information contained on 
         * the card.
         * @returns {boolean} true if the track data is valid, or false if not
         */
        this.isValid = function() {
            return self.track1.valid || self.track2.valid;
        };
        /**
         * Retrieves the primary account number for the card, or -1 if the 
         * card is not valid.
         * @returns {number} primary account number, usually 16 digits long
         */
        this.getNumber = function() {
            if (self.track1.valid) {
                return self.track1.number;
            }
            else if (self.track2.valid) {
                return self.track2.number;
            }
            return -1;
        };
        /**
         * Retrieves the last four digits of the primary account number, or 
         * -1 if the card is not valid.
         * @returns {number} last 4 digits of the primary account number
         */
        this.getLast4 = function() {
            var numString = self.getNumber().toString();
            if (numString.length > 4) {
                return parseInt(numString.substring(numString.length - 4));
            }
            return -1;
        };
        /**
         * Retrieves the expiration month (1-12) of the card, or -1 if the 
         * card is invalid.
         * <p>
         * Note that this method returns a number, so there is no formatting 
         * for single digit months (1 is returned instead of 01 for January).
         * @returns {number} expiration month
         */
        this.getExpMonth = function() {
            if (self.track1.valid) {
                return self.track1.expMonth;
            }
            else if (self.track2.valid) {
                return self.track2.expMonth;
            }
            return -1;
        };
        /**
         * Retrieves the expiration year of the card, or -1 
         * if the card is invalid.
         * <p>
         * Note that this method returns the four digit year, not that last 
         * two digits retrieved from the card. The last two digits can be 
         * retrieved by subtracting 2000 from this value.
         * @returns {number} four digit expiration year
         */
        this.getExpYear = function() {
            if (self.track1.valid) {
                return self.track1.expYear;
            }
            else if (self.track2.valid) {
                return self.track2.expYear;
            }
            return -1;
        };
        /**
         * Retrieves the last name on the card, or an empty String if the 
         * card is invalid.
         * <p>
         * Note that most all card name data is uppercase and will need 
         * formatting if this is a problem.
         * @returns {string} last name
         */
        this.getLastName = function() {
            if (self.track1.valid) {
                return self.track1.nameParts[0];
            }
            return '';
        };
        /**
         * Retrieves the first name on the card, or an empty String if the 
         * card is invalid.
         * <p>
         * Note that most all card name data is uppercase and will need 
         * formatting if this is a problem.
         * @returns {string} first name
         */
        this.getFirstName = function() {
            if (self.track1.valid) {
                return self.track1.nameParts[1];
            }
            return '';
        };

        /**
         * Parses line data from a card reader into this Card object.
         * @param {string} line line data from card reader
         * @returns {Card} this card the line was parsed into
         */
        this.parse = function(line) {
            var tracks = line.match(TRACK_REGEX);
            self.track1.data = tracks[1];
            self.track2.data = tracks[2];
            self.track3.data = tracks[3];

            if (self.track1.data) {
                var t1 = self.track1.data.match(TRACK_1_REGEX);
                if (t1 !== null && t1.length === 7) {
                    self.track1.valid = true;
                    self.track1.format = t1[1];
                    self.track1.number = parseFloat(t1[2]);
                    self.track1.name = t1[3];
                    self.track1.nameParts = self.track1.name.split('/');
                    self.track1.exp = parseInt(t1[4]);
                    self.track1.expYear = parseInt('20' + t1[4].substring(0, 2));
                    self.track1.expMonth = parseInt(t1[4].substring(3));
                    self.track1.service = parseInt(t1[5]);
                    self.track1.discretionary = t1[6];
                }
            }
            if (self.track2.data) {
                var t2 = self.track2.data.match(TRACK_2_REGEX);
                if (t2 !== null && t2.length === 5) {
                    self.track2.valid = true;
                    self.track2.number = parseFloat(t2[1]);
                    self.track2.exp = parseInt(t2[2]);
                    self.track2.expYear = parseInt('20' + t2[2].substring(0, 2));
                    self.track2.expMonth = parseInt(t2[2].substring(3));
                    self.track2.service = parseInt(t2[3]);
                    self.track2.discretionary = t2[4];
                }
            }
            return self;
        };

        if (line) {
            //Parse the card if line data is provided
            self.parse(line);
        }
    };

    /**
     * Generates a unique hash number for the provided card. This number 
     * may be negative.
     * <p>
     * The hash can be used to uniquely identify a card across applications, 
     * though it is not a substitute for a third-party card hash/fingerprint. 
     * If the library being used to charge cards has a built-in hash/fingerprint 
     * system, that should be used instead.
     * @param {Card} card the card to generate a hash for
     * @returns {number} unique hash number (may be negative)
     */
    swiper.generateCardHash = function(card) {
        if (card && card.line) {
            var s = card.line;
            var hash = 0;
            for (var i = 0; i < s.length; i++) {
                var c = s.charCodeAt(i);
                hash = ((hash << 5) - hash) + c;
                hash = hash & hash;
            }
            return hash;
        }
        return 0;
    };
})(window, document, jQuery, Date);