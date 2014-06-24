/*
 * chrome.hid API Notice
 * 
 * Currently (6/18/2014) the chrome.hid API is not working on ChromeOS. This is 
 * because the ChromeOS only supports a limited number of USB HID devices, and 
 * those are generally limited to keyboards and mice. 
 * 
 * The scale used in this library uses HID Point-of-Sale Scale specification. 
 * Windows (not tested on Mac or Linux) natively has these drivers and running 
 * the application in Windows will result in the scale working properly. 
 * 
 * Until support for more generic HID drivers is added to the ChromeOS, this 
 * library using the chrome.hid API will not work, the device will never be 
 * found.
 * 
 * Interestingly, the scale can still be communicated with using the 
 * chrome.usb API on ChromeOS. However, this is low-level USB calls instead of 
 * the higher-level HID implementation.
 */

(function(window) {
    //Scale Scope
    var scale = {};
    window.scale = scale;
    
    /**
     * Defines event types when an item is added to or removed from the scale.
     */
    scale.Event = {
        'ADDED': 'item-added',
        'REMOVED': 'item-removed',
        'READ': 'scale-read',
        'STABLE': 'scale-stable'
    };
    
    /**
     * How many consecutive weight amount reads before a weight is deemed 
     * stable.
     */
    scale.accuracyConsecutive = 3;
    /**
     * Indicates whether or not the app has permission to access the scale.
     */
    scale.hasPermission = false;
    /**
     * Indicates whether or not the scale is connected to the app.
     */
    scale.isConnected = false;
    /**
     * Indicates whether or not there was an error while attempting to 
     * connect the app to the scale.
     */
    scale.errorConnecting = false;
    
    /**
     * M25 Dymo Digital Scale vendor/product ID
     */
    var DEVICE_INFO = {
        'vendorId': 2338, //0x0922
        'productId': 32772 //0x8004
    };
    /**
     * Conversion from grams to ounces
     */
    var GRAMS_TO_OUNCES = 0.035274;
    
    /**
     * Map of listener functions.
     */
    var listeners = {};
    /**
     * The current HidConnectInfo connection to the scale. 
     * @type HidConnectInfo
     */
    var connection;
    /**
     * Tracks the last recorded weight, used to fire item added/removed 
     * events.
     * @type Number
     */
    var lastWeight = 0;
    /**
     * Number of consecutive weight readings, used to fire stable weight 
     * read events.
     * @type Number
     */
    var consecutive = 0;
    
    /**
     * Adds an event listener to the scale.
     * <p>
     * The type parameter may be "item-added" or "item-removed", as 
     * defined in the scale.Event object.
     * @param {string} type the type of event to listen to
     * @param {function)} listener the listener to add
     * @returns {undefined}
     */
    scale.addEventListener = function(type, listener) {
        if (typeof listener === 'function') {
            listeners[listener] = {
                'type': type,
                'listener': listener
            };
        }
    };
    /**
     * Removes an event listener from the scale.
     * <p>
     * If a listener is not provided, all listeners of the provided type 
     * are removed.
     * <p>
     * The type parameter may be "item-added" or "item-removed", as 
     * defined in the scale.Event object.
     * @param {string} type the type of event to listen to
     * @param {function} listener the listener to remove
     * @returns {undefined}
     */
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
    /**
     * Fires all listeners of the specified type.
     * @param {string} type the type of event to fire
     * @param {object} args any arguments to pass to the listener
     * @returns {undefined}
     */
    var fireListeners = function(type, args) {
        for (var key in listeners) {
            if (listeners[key].type === type) {
                listeners[key].listener(args);
            }
        }
    };
    
    /**
     * Request a stable reading in ounces of the current scale's weight.
     * <p>
     * The returned object in the provided callback will have the following 
     * properties:
     * <ul>
     * <li>grams (boolean set to false)</li>
     * <li>ounces (boolean set to true)</li>
     * <li>valid (boolean set to true)</li>
     * <li>stable (boolean set to true)</li>
     * <li>amount (number representing weight in ounces)</li>
     * </ul>
     * If there was a problem connecting to the scale, or the read request 
     * timed out, the returned weight object will be undefined.
     * @param {function(object)} callback callback to receive stable weight 
     *      reading object
     * @returns {undefined}
     */
    scale.getWeightOunces = function(callback) {
        if (!scale.isConnected && typeof callback === 'function') {
            callback();
            return;
        }
        var tempListener = function(weight) {
            if (weight && weight.grams) {
                weight.amount = weight.amount * GRAMS_TO_OUNCES;
                weight.grams = false;
                weight.ounces = true;
            }
            
            if (typeof callback === 'function') {
                callback(weight);
            }
            scale.removeEventListener(scale.Event.STABLE, tempListener);
        };
        scale.addEventListener(scale.Event.STABLE, tempListener);
    };
    
    /**
     * Reads weight data from the scale.
     * @returns {undefined}
     */
    var startReading = function() {
        if (connection) {
            //Read 6-byte data packet from HID scale
            chrome.hid.receive(connection.connectionId, 6, function(buffer) {
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
                
                fireListeners(scale.Event.READ, weight);
                if (lastWeight === 0 && weight.amount > 0) {
                    fireListeners(scale.Event.ADDED);
                }
                if (lastWeight > 0 && weight.amount === 0) {
                    fireListeners(scale.Event.REMOVED);
                }
                
                if (weight.stable && lastWeight === weight.amount) {
                    consecutive++;
                }
                else {
                    consecutive = 0;
                }
                
                if (consecutive === scale.accuracyConsecutive) {
                    fireListeners(scale.Event.STABLE, weight);
                    consecutive = 0;
                }
                
                lastWeight = weight.amount;
                startReading();
            });
        }
    };
    
    /**
     * Initialize the scale connection.
     * @returns {undefined}
     */
    scale.initialize = function() {
        chrome.hid.getDevices(DEVICE_INFO, function(devices) {
            if (devices) {
                scale.hasPermission = true;
                if (devices.length > 0) {
                    chrome.hid.connect(devices[0].deviceId, function(hidConnectInfo) {
                        if (hidConnectInfo) {
                            connection = hidConnectInfo;
                            scale.isConnected = true;
                            startReading();
                        }
                        else {
                            scale.errorConnecting = true;
                            throw new Error('There was an error trying to connect to the scale device');
                        }
                    });
                }
                else {
                    scale.errorConnecting = true;
                    throw new Error('Scale device could not be found, check the OS HID drivers');
                }
            }
            else {
                //If the scale does not have permission, add a click listener
                //to the main window. Next time a user clicks on something, 
                //they will be prompted to add scale permission.
                scale.hasPermission = false;
                window.addEventListener('click', scale.requestPermission);
            }
        });
    };
    
    /**
     * Requests permission to access the scale device.
     * @returns {undefined}
     */
    scale.requestPermission = function() {
        //Note that permission has to come from a "user gesture", which 
        //is why this function is bound to the window "click" event instead 
        //of on the "load" event
        if (!scale.hasPermission) {
            chrome.permissions.request({
                'permissions': [
                    {
                        'usbDevices': [DEVICE_INFO]
                    }
                ]
            }, function(result) {
                if (result) {
                    //Now with permission, initialize the scale again
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
})(window);