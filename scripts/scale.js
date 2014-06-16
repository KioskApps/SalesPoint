(function(window) {
    //Scale Scope
    var scale = {};
    window.scale = scale;
    
    scale.accuracyDelay = 1000;
    
    var DEVICE_INFO = {
        'vendorId': 2338, //0x0922
        'productId': 32772 //0x8004
    };
    var GRAMS_TO_OUNCES = 0.035274;
    
    var connection;
    
    scale.getWeightOunces = function(callback) {
        getStableWeight(function(weight) {
            if (weight.grams) {
                weight.amount = weight.amount * GRAMS_TO_OUNCES;
                weight.grams = false;
                weight.ounces = true;
            }
            
            if (typeof callback === 'function') {
                callback(weight);
            }
        });
    };
    
    var getStableWeight = function(callback) {
        setTimeout(function() {
            read(function(weight) {
                if (weight.valid) {
                    if (weight.stable) {
                        if (typeof callback === 'function') {
                            callback(weight);
                        }
                    }
                    else {
                        getStableWeight(callback);
                    }
                }
                else {
                    throw new Error('There is a problem with the scale');
                }
            });
        }, scale.accuracyDelay);
    };
    
    var read = function(callback) {
        if (connection) {
            chrome.hid.receive(connection.connectionId, 255, function(buffer) {
                if (!buffer) {
                    throw new Error('There was a problem reading from the device');
                }
                var weight = {};
                weight.grams = false;
                weight.ounces = false;
                weight.valid = true;
                weight.stable = false;
                weight.amount = 0.0;
                
                var data = new DataView(buffer);
                /*
                 * 0 : Report ID
                 *      3 = Data Report
                 * 1 : Scale Status
                 *      1 = Fault
                 *      2 = Stable at 0
                 *      3 = In Motion
                 *      4 = Stable
                 *      5 = Stable, weight less than 0
                 *      6 = Over Limit
                 *      7 = Requires Calibration
                 *      8 = Requires Re-zeroing
                 * 2 : Weight Unit
                 *      2 = Grams
                 *      11 = Ounces
                 * 3 : Data Scaling (0 or 255, unsure what this is used for)
                 * 4 : Data Weight Less Significant Bit
                 * 5 : Data Weight More Significant Bit (multiply by 256)
                 */
                
                switch (data.getUint8(1)) {
                    case 1:
                    case 6:
                    case 7:
                    case 8:
                        weight.valid = false;
                        break;
                    case 2:
                    case 4:
                        weight.stable = true;
                        break;
                }
                
                switch (data.getUint8(2)) {
                    case 2:
                        weight.grams = true;
                        break;
                    case 11:
                        weight.ounces = true;
                        break;
                }
                
                weight.amount = (data.getUint8(5) * 256) + data.getUint8(4);
                if (weight.ounces) {
                    weight.amount = parseFloat((weight.amount * 0.1).toFixed(1));
                }
                
                if (typeof callback === 'function') {
                    callback(weight);
                }
            });
        }
    };
    
    var initialize = function() {
        chrome.hid.getDevices(DEVICE_INFO, function(devices) {
            if (devices) {
                if (devices.length > 0) {
                    chrome.hid.connect(devices[0].deviceId, function(hidConnectInfo) {
                        if (hidConnectInfo) {
                            connection = hidConnectInfo;
                        }
                        else {
                            console.log('could not connect to device');
                            console.log(chrome.app.runtime.lastError);
                        }
                    });
                }
                else {
                    console.log('device not connected');
                    console.log(chrome.app.runtime.lastError);
                }
            }
            else {
                console.log('app not given permission');
                console.log(chrome.app.runtime.lastError);
            }
        });
    };
    
    //TODO: Device requires one-time authorization for USB device
    /*window.addEventListener('click', function() {
        chrome.permissions.request({
            'permissions': [
                {
                    'usbDevices': [
                        {
                            'vendorId': VENDOR_ID,
                            'productId': PRODUCT_ID
                        }
                    ]
                }
            ]
        }, function(result) {
            if (result) {
                initialize();
            }
            else {
                throw new Error('App was not granted permission to the scale device, check your manifest.json permissions');
            }
        }); 
    });*/
    window.addEventListener('load', initialize);    
})(window);