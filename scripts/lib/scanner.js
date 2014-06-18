(function(window, document, $, Date) {
    //Scanner Score
    var scanner = {};
    window.scanner = scanner;
    
    /**
     * The scanner event type
     */
    scanner.EVENT = 'barcode-scan';
    /**
     * The character key that indicates a line end (default 13, carriage return)
     * <p>
     * This can be set if the barcode scanner uses a different line end key.
     */
    scanner.LINE_END = 13;
    
    /**
     * Indicates that the scanner is listening for a barcode scan.
     * <p>
     * Set to true to enable the barcode scanner.
     */
    scanner.scanning = false;
    /**
     * Configurable delay (ms) before the scanner buffer is cleared.
     * <p>
     * This delay ensures a user cannot type on a keyboard and submit a 
     * barcode. It should not be lower than however long it takes the barcode 
     * scanner to submit a full line of data to the computer.
     */
    scanner.delay = 250;
    
    /**
     * Timestamp when a scanner event started, used with scanner.delay to 
     * determine valid barcode scan.
     */
    var scanStart = 0;
    /**
     * Array of jQuery selectors that will be triggered when a scanner event 
     * occurs.
     */
    var triggers = [];
    /**
     * jQuery focus selector that can be set using scanner.setFocus().
     * <p>
     * If multiple triggers are used, and a situation occurs where only one 
     * needs to be triggered, the focus can be set. Whenever the focus is 
     * set, a scan event is triggered on that focus instead of the 
     * triggers added via scanner.addTrigger.
     * <p>
     * Focus is lost on barcode scan, so it must be reset every time it is 
     * needed.
     */
    var focus;
    /**
     * Buffer of character keys for the scan event.
     */
    var buffer = [];
    
    window.addEventListener('load', function() {
        //Register global keypress listener
        document.addEventListener('keypress', scanned);        
    });
    
    /**
     * Add a jQuery selector to be triggered when a scan event occurs
     * @param {jQuery|string} selector the jQuery selector to be triggered
     * @returns {undefined}
     */
    scanner.addTrigger = function(selector) {
        triggers.push(selector);
    };
    /**
     * Set a jQuery selector to be focused for the next scan event.
     * <p>
     * The next scan event will only trigger the provided selector. It will 
     * not trigger any previous selectors added by scanner.addTrigger() until 
     * the next scan event.
     * <p>
     * Focus is lost after a scan event (even failed attempts). It must be 
     * reset each time as needed.
     * @param {jQuery|string} selector the jQuery selector to trigger next
     * @returns {undefined}
     */
    scanner.setFocus = function(selector) {
        focus = selector;
    };
    /**
     * Removes the previous set focus. The next scan event will trigger 
     * all jQuery selectors added by scanner.addTrigger().
     * @returns {undefined}
     */
    scanner.removeFocus = function() {
        focus = undefined;
    };

    /**
     * The global keyboard listener
     * @param {Event} e keypress event
     */
    var scanned = function(e) {
        if (scanner.scanning) {
            e.preventDefault();
            var keyCode = e.keyCode;

            if (scanStart === 0) {
                scanStart = Date.now();
            }
            //If more time has passed since the scan started (scanner.delay), 
            //reset the buffer.
            if ((Date.now() - scanStart) > scanner.delay) {
                scanStart = 0;
                buffer = [];
            }

            //When the line end key is detected, trigger the scan event 
            //and reset the buffer
            if (keyCode === scanner.LINE_END) {
                //Check if the delay is valid
                if ((Date.now() - scanStart) < scanner.delay) {
                    var line = buffer.join('');
                    var event = document.createEvent('HTMLEvents');
                    event.initEvent(scanner.EVENT, true, true);
                    
                    if (focus) {
                        $(focus).trigger(scanner.EVENT, line);
                    }
                    else {
                        for (var i = 0; i < triggers.length; i++) {
                            $(triggers[i]).trigger(scanner.EVENT, line);
                        }
                    }
                }
                scanStart = 0;
                buffer = [];
            }
            else {
                //Add keypress character to buffer
                buffer.push(String.fromCharCode(e.keyCode));
            }
        }
    };
})(window, document, jQuery, Date);