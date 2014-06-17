(function(window, Math) {
    //Scale Scope
    var scale = {};
    window.scale = scale;
    
    scale.Event = {
        'ADDED': 'item-added',
        'REMOVED': 'item-removed'
    };
    
    scale.accuracyDelay = 500;
    scale.accuracyConsecutive = 3;
    scale.accuracyAttemptLimit = 20;
    scale.hasPermission = false;
    scale.isConnected = false;
    
    var DEVICE_INFO = {
        'vendorId': 2338, //0x0922
        'productId': 32772 //0x8004
    };
    var GRAMS_TO_OUNCES = 0.035274;
    
    var listeners = {};
    var connection;
    var weightAttempts = {};
    
    scale.addEventListener = function(type, listener) {
        if (typeof listener === 'function') {
            listeners[listener] = {
                'type': type,
                'listener': listener
            };
        }
    };
    scale.removeEventListener = function(type, listener) {
        var removeAll = typeof listener === 'undefined';
        for (var key in listeners) {
            if (listeners[key].type === type) {
                if (removeAll || listeners[key].listener === listener) {
                    delete listeners[key];
                }
            }
        }
    };
    
    scale.getWeightOunces = function(callback) {
        getStableWeight(function(weight) {
            if (weight && weight.grams) {
                weight.amount = weight.amount * GRAMS_TO_OUNCES;
                weight.grams = false;
                weight.ounces = true;
            }
            
            if (typeof callback === 'function') {
                callback(weight);
            }
        });
    };
    
    var getStableWeight = function(callback, attemptId) {
        if (typeof attemptId === 'undefined') {
            attemptId = 'ScaleRead' + Math.floor((Math.random() * 899) + 100);
        }
        if (typeof weightAttempts[attemptId] === 'undefined') {
            weightAttempts[attemptId] = {
                'attempt': 0,
                'lastWeight': 0.0,
                'consecutive': 0
            };
        }
        
        var attempt = weightAttempts[attemptId];
        
        setTimeout(function() {
            read(function(weight) {
                if (attempt.attempt < scale.accuracyAttemptLimit && weight) {
                    if (weight.valid) {
                        if (weight.stable) {
                            if (attempt.lastWeight === 0 && weight.amount > 0) {
                                for (var key in listeners) {
                                    if (listeners[key].type === scale.Event.ADDED) {
                                        listeners[key].listener();
                                    }
                                }
                            }
                            if (attempt.lastWeight > 0 && weight.amount === 0) {
                                for (var key in listeners) {
                                    if (listeners[key].type === scale.Event.REMOVED) {
                                        listeners[key].listener();
                                    }
                                }
                            }
                            
                            if (weight.amount === attempt.lastWeight) {
                                attempt.consecutive = attempt.consecutive + 1;
                            }
                            else {
                                attempt.consecutive = 0;
                            }
                            attempt.lastWeight = weight.amount;

                            if (attempt.consecutive < scale.accuracyConsecutive) {
                                getStableWeight(callback, attemptId);
                            }
                            else if (typeof callback === 'function') {
                                callback(weight);
                            }
                        }
                        else {
                            getStableWeight(callback, attemptId);
                        }
                    }
                    else {
                        delete weightAttempts[attemptId];
                        throw new Error('There is a problem with the scale');
                    }
                }
                else if (typeof callback === 'function') {
                    callback();
                }
                attempt.attempt = attempt.attempt + 1;
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
        else if (typeof callback === 'function') {
            callback();
        }
    };
    
    scale.initialize = function() {
        chrome.hid.getDevices(DEVICE_INFO, function(devices) {
            if (devices) {
                scale.hasPermission = true;
                if (devices.length > 0) {
                    chrome.hid.connect(devices[0].deviceId, function(hidConnectInfo) {
                        if (hidConnectInfo) {
                            connection = hidConnectInfo;
                            scale.isConnected = true;
                        }
                        else {
                            throw new Error('There was an error trying to connect to the scale device');
                        }
                    });
                }
                else {
                    throw new Error('Scale device is not connected');
                }
            }
            else {
                scale.hasPermission = false;
                window.addEventListener('click', scale.requestPermission);
            }
        });
    };
    
    scale.requestPermission = function(e) {
        if (!scale.hasPermission) {
            chrome.permissions.request({
                'permissions': [
                    {
                        'usbDevices': [DEVICE_INFO]
                    }
                ]
            }, function(result) {
                if (result) {
                    scale.initialize();
                    window.removeEventListener('click', scale.requestPermission);
                }
                else {
                    throw new Error('App was not granted permission to the scale device, check your manifest.json permissions');
                }
            });
        }
    };
    
    window.addEventListener('load', scale.initialize);    
})(window, Math);