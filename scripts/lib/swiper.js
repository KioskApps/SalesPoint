(function(window, document, console, $, Date) {
    //Swiper Score
    var swiper = {};
    window.swiper = swiper;
    
    swiper.EVENT = 'card-swipe';
    
    var TRACK_REGEX = /(%.*?\?)?(;.*?\?)?/;
    var TRACK_1_REGEX = /%([A-Z])([0-9]{1,19})\^([^\^]{2,26})\^([0-9]{4}|\^)([0-9]{3}|\^)([^\?]+)\?/;
    var TRACK_2_REGEX = /;([0-9]{1,19})=([0-9]{4}|=)([0-9]{3}|=)([^\?]+)\?/;
    var DUMMY_CARD = '%B4242424242424242^DOE/JOHN^15011011000?;B4242424242424242=15011011000?'.split('');
    
    swiper.scanning = false;
    swiper.delay = 250;
    swiper.bypass = 96;
    
    var swipeStart = 0;
    var triggers = [];
    var focus;
    var buffer = [];
    
    window.addEventListener('load', function() {
        document.addEventListener('keypress', swiped);        
    });
    
    swiper.addTrigger = function(selector) {
        triggers.push(selector);
    };
    swiper.setFocus = function(selector) {
        focus = selector;
    };
    swiper.removeFocus = function() {
        focus = undefined;
    };

    var swiped = function(e) {
        if (swiper.scanning) {
            e.preventDefault();
            var keyCode = e.keyCode;

            if (swipeStart === 0) {
                swipeStart = Date.now();
            }
            if ((Date.now() - swipeStart) > swiper.delay) {
                swipeStart = 0;
                buffer = [];
            }

            if (keyCode === swiper.bypass) {
                buffer = DUMMY_CARD;
                keyCode = 13;
            }

            if (keyCode === 13) {
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
                buffer.push(String.fromCharCode(e.keyCode));
            }
        }
    };

    swiper.Card = function(line) {

        var self = this;

        this.track1 = {};
        this.track1.valid = false;
        this.track2 = {};
        this.track2.valid = false;
        this.track3 = {};
        this.track3.valid = false;
        this.line = line;

        this.isValid = function() {
            return self.track1.valid || self.track2.valid;
        };
        this.getNumber = function() {
            if (self.track1.valid) {
                return self.track1.number;
            }
            else if (self.track2.valid) {
                return self.track2.number;
            }
            return -1;
        };
        this.getLast4 = function() {
            var numString = self.getNumber().toString();
            return parseInt(numString.substring(numString.length - 4));
        };
        this.getExpMonth = function() {
            if (self.track1.valid) {
                return self.track1.expMonth;
            }
            else if (self.track2.valid) {
                return self.track2.expMonth;
            }
            return -1;
        };    
        this.getExpYear = function() {
            if (self.track1.valid) {
                return self.track1.expYear;
            }
            else if (self.track2.valid) {
                return self.track2.expYear;
            }
            return -1;
        };
        this.getLastName = function() {
            if (self.track1.valid) {
                return self.track1.nameParts[0];
            }
            return '';
        };
        this.getFirstName = function() {
            if (self.track1.valid) {
                return self.track1.nameParts[1];
            }
            return '';
        };

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
        };

        if (line) {
            self.parse(line);
        }
    };

    swiper.generateCardHash = function(card) {
        var s = card.line;
        var hash = 0;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash = hash & hash;
        }
        //TODO: Make sure this hash is always the same, if not, use Stripe's fingerprint
        console.log('Card Hash (x' + card.getLast4() + '): ' + hash);
        return hash;
    };

})(window, document, console, jQuery, Date);