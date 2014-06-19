(function(window, Date, $) {
    //StillThere scope
    var stillthere = {};
    window.stillthere = stillthere;
    
    /**
     * Defines event types when a user has timed out.
     * <p>
     * The LOADED event is fired once when stillthere is finished loading. 
     * This should be listened to whenever modifying the contents of 
     * stillthere.overlay.
     * <p>
     * The STILL_THERE event is fired once when the user has not made a gesture 
     * for however long (ms) specified in stillthere.timeoutStillThere. A 
     * progress bar will be displayed indicating the amount of time left 
     * before the timeout event is triggered.
     * <p>
     * The TIMEOUT event is fired once after the STILL_THERE event and 
     * indicates that an app session should be reset.
     */
    stillthere.Event = {
        'TIMEOUT': 'timeout',
        'STILL_THERE': 'still-there',
        'LOADED': 'loaded'
    };
    
    /**
     * The jQuery overlay selector
     */
    stillthere.overlay;
    /**
     * Timestamp of the last user gesture
     */
    stillthere.lastGesture;
    /**
     * Amount of time (ms) until the overlay asks if the user is still there
     */
    stillthere.timeoutStillThere = 30000;
    /**
     * Amount of time (ms) until the overlay times out
     */
    stillthere.timeout = 60000;
    /**
     * How often to check for user gesture updates
     */
    stillthere.checkInterval = 1000;
    
    /**
     * Map of listener functions.
     */
    var listeners = {};
    /**
     * Indicates that the STILL_THERE event has fired at least once
     * @type Boolean
     */
    var stillThereFired = false;
    /**
     * Indicates that the TIMEOUT event has fired at least once
     * @type Boolean
     */
    var timeoutFired = false;
    
    /**
     * Adds an event listener to the stillthere overlay.
     * <p>
     * The type parameter may be "timeout", "still-there", or "loaded" as 
     * defined in the stillthere.Event object.
     * @param {string} type the type of event to listen to
     * @param {function)} listener the listener to add
     * @returns {undefined}
     */
    stillthere.addEventListener = function(type, listener) {
        if (typeof listener === 'function') {
            listeners[listener] = {
                'type': type,
                'listener': listener
            };
        }
    };
    /**
     * Removes an event listener from the stillthere overlay.
     * <p>
     * If a listener is not provided, all listeners of the provided type 
     * are removed.
     * <p>
     * The type parameter may be "timeout", "still-there", or "loaded" as 
     * defined in the stillthere.Event object.
     * @param {string} type the type of event to listen to
     * @param {function} listener the listener to remove
     * @returns {undefined}
     */
    stillthere.removeEventListener = function(type, listener) {
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
     * @returns {undefined}
     */
    var fireListeners = function(type) {
        for (var key in listeners) {
            if (listeners[key].type === type) {
                listeners[key].listener();
            }
        }
    };
    
    /**
     * Forces the display of the "timeout" overlay and triggers the 
     * TIMEOUT event.
     * @returns {undefined}
     */
    stillthere.showTimeout = function() {
        stillthere.lastGesture = stillthere.timeout + 1;
    };
    /**
     * Indicates whether or not the overlay is currently visible.
     * @returns {boolean} true if the overlay is visible, or false if not
     */
    stillthere.isOverlayVisible = function() {
        return stillthere.overlay.is(':visible');
    };
    /**
     * Shows the overlay if it is not already visible.
     * @returns {undefined}
     */
    var showOverlay = function() {
        if (!stillthere.isOverlayVisible()) {
            stillthere.overlay.show();
        }
    };
    /**
     * Hides the overlay if it is not already hidden.
     * @returns {undefined}
     */
    var hideOverlay = function() {
        if (stillthere.isOverlayVisible()) {
            stillthere.overlay.hide();
        }
    };
    
    /**
     * Checks to see if enough time has passed since the last user gesture 
     * to trigger a STILL_THERE or TIMEOUT event.
     * @returns {undefined}
     */
    var checkTimeout = function() {
        var timePassed = Date.now() - stillthere.lastGesture;
        
        showOverlay();
        if (timePassed > stillthere.timeout) {
            if (!timeoutFired) {
                //Only fire event once
                fireListeners(stillthere.Event.TIMEOUT);
                timeoutFired = true;
                stopProgress();
            }
        }
        else if (timePassed > stillthere.timeoutStillThere) {
            if (!stillThereFired) {
                //Only fire event once
                fireListeners(stillthere.Event.STILL_THERE);
                stillThereFired = true;
                startProgress();
            }
        }
        else {
            //User still active, reset things
            stillThereFired = false;
            timeoutFired = false;
            hideOverlay();
        }
        setTimeout(checkTimeout, stillthere.checkInterval);
    };
    /**
     * Hides the progress bar.
     * @returns {undefined}
     */
    var stopProgress = function() {
        stillthere.overlay.find('.progress').hide();        
    };
    /**
     * Displays the progress bar and starts it.
     * @param {boolean} update if true, update the progress bar, 
     *          if false, start the progress bar
     * @returns {undefined}
     */
    var startProgress = function(update) {
        var progress = stillthere.overlay.find('.progress');
        var updateInterval = 100;
        if (update) {
            var value = parseInt(progress.attr('value'));
            if (value < progress.attr('max')) {
                progress.attr('value', value + 1);
                setTimeout(function() {
                    startProgress(true);
                }, updateInterval);
            }
        }
        else {
            var max = (stillthere.timeout - stillthere.timeoutStillThere) / updateInterval;
            progress.attr('value', 0).attr('max', max);
            progress.show();
            startProgress(true);
        }
    };
    
    /**
     * Updates the user's last gesture timestamp.
     * @returns {undefined}
     */
    var updateLastGesture = function() {
        stillthere.lastGesture = Date.now();
    };
    
    /**
     * Initializes the stillthere overlay, appends it to the body of the 
     * app, and adds listeners for user gestures.
     * @returns {undefined}
     */
    var initialize = function() {     
        stillthere.overlay = $('<div/>').addClass('still-there');
        stillthere.overlay.append($('<div/>').addClass('background'));
        stillthere.overlay.append($('<div/>').addClass('foreground')
                .append($('<div/>').addClass('message'))
                .append($('<progress/>').addClass('progress')));
        stillthere.overlay.appendTo($('body'));
        
        window.addEventListener('click', updateLastGesture);
        window.addEventListener('mousemove', updateLastGesture);
        window.addEventListener('touchmove', updateLastGesture);
        window.addEventListener('keydown', updateLastGesture);
        
        updateLastGesture();
        checkTimeout();
        fireListeners(stillthere.Event.LOADED);
    };
    
    window.addEventListener('load', initialize);
})(window, Date, jQuery);