//Startup Scope
var startup = {};

/**
 * Indicates if the startup page is currently testing
 */
startup.testing = false;

//Boolean value to indicate success/failure of hardware tests
startup.scannerTest = false;
startup.swiperTest = false;
startup.scaleTest = {};
startup.scaleTest.itemAdded = false;
startup.scaleTest.itemRemoved = false;
startup.scaleTest.weightRunning = true;
startup.scaleTest.stableWeight = false;

/**
 * Begins hardware testing for startup page.
 * @returns {undefined}
 */
startup.startTesting = function() {
    startup.testing = true;
    startup.startScannerTest();
    startup.startSwiperTest();
    startup.startScaleConnectedTest();
    startup.startScaleTest();
};
/**
 * Stops hardware testing.
 * @returns {undefined}
 */
startup.stopTesting = function() {
    startup.testing = false;

    scanner.scanning = false;
    scanner.removeFocus();
    swiper.scanning = false;
    swiper.removeFocus();
    startup.scaleTest.weightRunning = false;
};

/**
 * Start barcode scanning test.
 * @returns {undefined}
 */
startup.startScannerTest = function() {
    //Stop if no longer testing or if the test was a success
    if (!startup.testing || startup.scannerTest) {
        return;
    }
    var focus = $('#page-startup');
    scanner.scanning = true;
    scanner.setFocus(focus);
    focus.on(scanner.EVENT, function(e, value) {
        //Stop if no longer testing or if the test was a success
        if (!startup.testing || startup.scannerTest) {
            return;
        }
        if (typeof value === 'string' && value.length > 0) {
            $('#page-startup .barcode .status').removeClass('fail').addClass('success');
            scanner.removeFocus();
            scanner.scanning = false;
            startup.scannerTest = true;
        }
        else {
            $('#page-startup .barcode .status').removeClass('success').addClass('fail');
        }
    });
};

/**
 * Start card reader test.
 * @returns {undefined}
 */
startup.startSwiperTest = function() {
    //Stop if no longer testing or if the test was a success
    if (!startup.testing || startup.swiperTest) {
        return;
    }
    var focus = $('#page-startup');    
    swiper.scanning = true;
    swiper.setFocus(focus);
    focus.on(swiper.EVENT, function(e, card) {
        if (!startup.testing || startup.swiperTest) {
            return;
        }
        if (card && card.isValid && card.isValid()) {
            $('#page-startup .swiper .status').removeClass('fail').addClass('success');
            swiper.removeFocus();
            swiper.scanning = false;
            startup.swiperTest = true;
        }
        else {
            $('#page-startup .swiper .status').removeClass('success').addClass('fail');
        }
    });
};

/**
 * Start test to determine if the scale is connected
 * @returns {undefined}
 */
startup.startScaleConnectedTest = function() {
    //Stop if no longer testing
    if (!startup.testing) {
        return;
    }
    if (!scale.isConnected) {
        $('#page-startup .scaleconnect .status').removeClass('success').addClass('fail'); 
        scale.initialize();
        if (!scale.errorConnecting) {
            setTimeout(startup.startScaleConnectedTest, 500);
        }
    }
    else {
        $('#page-startup .scaleconnect .status').removeClass('fail').addClass('success');  
    }
};
/**
 * Start scale weight and permission testing
 * @returns {undefined}
 */
startup.startScaleTest = function() {
    //Stop if no longer testing
    if (!startup.testing) {
        return;
    }
    if (scale.hasPermission && !scale.errorConnecting) {
        $('#page-startup .scalepermission .status').removeClass('fail').addClass('success');
        scale.addEventListener(scale.Event.ADDED, startup.scaleAdded);
        scale.addEventListener(scale.Event.REMOVED, startup.scaleRemoved);
        scale.getWeightOunces(startup.scaleWeight);      
    }
    else {
        $('#page-startup .scalepermission .status').removeClass('success').addClass('fail');  
        $('#page-startup .scaleadd .status').removeClass('success').addClass('fail');  
        $('#page-startup .scaleweight .status').removeClass('success').addClass('fail');  
        $('#page-startup .scaleremove .status').removeClass('success').addClass('fail');
        setTimeout(startup.startScaleTest, 500);
    }
};
/**
 * Called when an item has been added to the scale.
 * @returns {undefined}
 */
startup.scaleAdded = function() {
    //Stop if no longer testing or if the test was a success
    if (!startup.testing || startup.scaleTest.itemAdded) {
        return;
    }
    startup.scaleTest.itemAdded = true;
    $('#page-startup .scaleadd .status').removeClass('fail').addClass('success');
};
/**
 * Called when an item has been removed from the scale.
 * @returns {undefined}
 */
startup.scaleRemoved = function() {
    //Stop if no longer testing or if the test was a success
    if (!startup.testing || startup.scaleTest.itemRemoved) {
        return;
    }
    startup.scaleTest.itemRemoved = true;
    $('#page-startup .scaleremove .status').removeClass('fail').addClass('success');
};
/**
 * Called when a weight is provided to the scale.
 * @param {Object} weight weight object from scale.js
 * @returns {undefined}
 */
startup.scaleWeight = function(weight) {
    //Stop if no longer testing
    if (!startup.testing) {
        return;
    }
    if (weight && weight.stable && weight.amount > 0) {
        startup.scaleTest.stableWeight = true;
        $('#page-startup .scaleweight .status').removeClass('fail').addClass('success');
        //If we haven't gotten a valid item removed event yet, keep going
        if (!startup.scaleTest.itemRemoved) {
            startup.scaleTest.weightRunning = false;
            scale.getWeightOunces(startup.scaleWeight);
        }
    }
    else if (startup.scaleTest.weightRunning) {
        scale.getWeightOunces(startup.scaleWeight);
    }
};