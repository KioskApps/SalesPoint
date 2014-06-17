(function(window, document, Date, $) {
    //Scanner Score
    var scanner = {};
    window.scanner = scanner;
    
    scanner.EVENT = 'barcode-scan';
    
    scanner.scanning = false;
    scanner.delay = 250;
    
    var scanStart = 0;
    var triggers = [];
    var focus;
    var buffer = [];
    
    window.addEventListener('load', function() {
        document.addEventListener('keypress', swiped);        
    });
    
    scanner.addTrigger = function(selector) {
        triggers.push(selector);
    };
    scanner.setFocus = function(selector) {
        focus = selector;
    };
    scanner.removeFocus = function() {
        focus = undefined;
    };

    var swiped = function(e) {
        if (scanner.scanning) {
            e.preventDefault();
            var keyCode = e.keyCode;

            if (scanStart === 0) {
                scanStart = Date.now();
            }
            if ((Date.now() - scanStart) > scanner.delay) {
                scanStart = 0;
                buffer = [];
            }

            if (keyCode === 13) {
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
                buffer.push(String.fromCharCode(e.keyCode));
            }
        }
    };
})(window, document, Date, jQuery);