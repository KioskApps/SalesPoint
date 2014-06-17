var startup = {};
startup.testing = false;

startup.scannerTest = false;
startup.swiperTest = false;
startup.scaleTest = {};
startup.scaleTest.itemAdded = false;
startup.scaleTest.itemRemoved = false;
startup.scaleTest.weightRunning = true;
startup.scaleTest.stableWeight = false;

startup.startTesting = function() {
    startup.testing = true;
    startup.startScannerTest();
    startup.startSwiperTest();
    startup.startScaleConnectedTest();
    startup.startScaleTest();
};
startup.stopTesting = function() {
    startup.testing = false;
    
    scanner.scanning = false;
    scanner.removeFocus();
    swiper.scanning = false;
    swiper.removeFocus();
    startup.scaleTest.weightRunning = false;
};

startup.startScannerTest = function() {
    if (!startup.testing || startup.scannerTest) {
        return;
    }
    var focus = $('#page-startup');
    scanner.scanning = true;
    scanner.setFocus(focus);
    focus.on(scanner.EVENT, startup.scanEvent);
};
startup.scanEvent = function(e, value) {
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
};

startup.startSwiperTest = function() {
    if (!startup.testing || startup.swiperTest) {
        return;
    }
    var focus = $('#page-startup');    
    swiper.scanning = true;
    swiper.setFocus(focus);
    focus.on(swiper.EVENT, startup.swipeEvent);
};
startup.swipeEvent = function(e, card) {
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
};

startup.startScaleConnectedTest = function() {
    if (!startup.testing) {
        return;
    }
    if (!scale.isConnected) {
        $('#page-startup .scaleconnect .status').removeClass('success').addClass('fail');  
        scale.initialize();
        setTimeout(startup.startScaleConnectedTest, 500);
    }
    else {
        $('#page-startup .scaleconnect .status').removeClass('fail').addClass('success');  
    }
};
startup.startScaleTest = function() {
    if (!startup.testing) {
        return;
    }
    if (scale.hasPermission) {
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
startup.scaleAdded = function() {
    if (!startup.testing) {
        return;
    }
    startup.scaleTest.itemAdded = true;
    $('#page-startup .scaleadd .status').removeClass('fail').addClass('success');
};
startup.scaleRemoved = function() {
    if (!startup.testing) {
        return;
    }
    startup.scaleTest.itemRemoved = true;
    $('#page-startup .scaleremove .status').removeClass('fail').addClass('success');
};
startup.scaleWeight = function(weight) {
    if (!startup.testing) {
        return;
    }
    if (weight && weight.stable && weight.amount > 0) {
        startup.scaleTest.stableWeight = true;
        $('#page-startup .scaleweight .status').removeClass('fail').addClass('success');
        if (!startup.scaleTest.itemRemoved) {
            startup.scaleTest.weightRunning = false;
            scale.getWeightOunces(startup.scaleWeight);
        }
    }
    else if (startup.scaleTest.weightRunning) {
        scale.getWeightOunces(startup.scaleWeight);
    }
};