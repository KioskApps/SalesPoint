(function(window, document, JSON) {
    /* Remember that we are within the sandbox-scripts.html window scope */
    //Sandbox scope
    var sandbox = {};
    window.sandbox = sandbox;
    
    /*
     * Returns a message from the provided event.
     * <p>
     * This is the main and only function that sandboxed script implementations 
     * should call. Upon receiving an event with their messageHandler() 
     * function, implementations should process the event and return an 
     * object message using this function.
     * @param {Event} event the original Event a message was recieved from
     * @param {Object} message the return message
     * @returns {undefined}
     */
    sandbox.returnMessage = function(event, message) {
        message = sandbox.deepCopySafeMessage(message || {});
        //Assign the source/script to the original event's source/script
        message.source = event.data.source;
        message.script = event.data.script;
        
        //Send the message back to sandbox.js
        event.source.postMessage(message, event.origin);
    };    
    /**
     * Sandbox messages are not allowed to contain functions. This function 
     * will quickly remove any function objects by stringifying and parsing 
     * the message as a JSON object.
     * @param {Object} object
     * @returns {unresolved}
     */
    sandbox.deepCopySafeMessage = function(object) {
        return JSON.parse(JSON.stringify(object));
    };
    
    /**
     * This object keeps track of which sandboxed scripts have been 
     * initialized.
     */
    sandbox.initsCalled = {};
    /**
     * This object keeps track of the number of attempts an event has been 
     * posted to a script after initialization. If too many attempts are made, 
     * the event is dropped.
     */
    var eventAttempts = {};
    /**
     * Initializes a script from the provided URL.
     * <p>
     * This function should only be called by sandbox-scripts.js. Individual 
     * sandboxed script implementations should implement the checkScript() and
     * getScriptUrl() functions and let the sandbox do the work.
     * <p>
     * Note that this is only used for externally loaded scripts, and is 
     * different from the sandboxed script implementation. An implementation 
     * (for instance, Google Maps API), may require additional assets to be 
     * loaded that are hosted externally. These assets are what should be 
     * passed in the getScriptUrl() function.
     * @param {string} url the URL of the script to load
     * @returns {undefined}
     */
    sandbox.initializeScript = function(url) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.body.appendChild(script);
    };
    
    /**
     * The sandbox-scripts message handler. This is where most all of the 
     * processing takes place.
     * @param {Event} e 'message' event that may be from a sandboxed script or 
     *      from the main window's sandbox.js
     * @returns {undefined}
     */
    function messageHandler(e) {
        //If this is a load check from sandbox.js, let it know we're loaded
        if (e.data.loadCheck) {
            e.source.postMessage({
                'loaded': true
            }, e.origin);
        }
        else if (e.data.script) {
            //If 'source' is not specified, generate a random source string
            if (!e.data.source) {
                e.data.source = 'Unknown' + Math.floor((Math.random() * 899) + 100);
            }
            
            /*
             * This is where sandbox-scripts tries to locate the global 
             * variable for the requested script.
             * <p>
             * In the case of our example sandboxed script, 'sandbox-myscript.js',
             * a global variable 'myscript' should be defined.
             * <p>
             * Additionally, 'myscript' should implement AT LEAST a function 
             * defined as messageHandler(Event). It SHOULD implement 
             * checkScript() and getScriptUrl() as needed. See  
             * 'sandbox-stripe.js' for an example implementation.
             */
            var script = window[e.data.script];
            if (script && script.messageHandler) {
                //If the script requires loading via a URL,
                if (script.checkScript && script.getScriptUrl) {
                    if (script.checkScript()) {
                        //If the script is loaded, pass the event to the message
                        //handler
                        script.messageHandler(e);
                    }
                    else {
                        //If it is not loaded, check to see whether or not we 
                        //have already called tried to initialize the script
                        if (!sandbox.initsCalled[script]) {
                            //If we have not, attempt to initialize the script 
                            //using the provided URL
                            sandbox.initsCalled[script] = true;
                            sandbox.initializeScript(script.getScriptUrl());
                        }
                        
                        //Resend the event while we wait for the script to load,
                        //but timeout if it takes too long and the script 
                        //still has not loaded. This is usually due to a 
                        //manifest issue.
                        var attempt = eventAttempts[e.data.source] || 0;
                        if (attempt > 10) {
                            throw new Error('Could not send message after too many failed attempts, make sure manifest.json has specified the correct scripts-sandbox.html sandbox permission.')
                        }
                        else {
                            attempt++;
                            eventAttempts[e.data.source] = attempt;
                            setTimeout(function() {
                                messageHandler(e);
                            }, 100);
                        }
                        
                    }
                }
                else {
                    //If the script does not require initialization, pass
                    //the event to the handler
                    script.messageHandler(e);
                }
            }
        }
    }

    /**
     * Initialize the sandbox-scripts and add the message handler.
     * @returns {undefined}
     */
    var initialize = function() {
        window.addEventListener('message', messageHandler);
    };
    initialize();        
}(window, document, JSON));
