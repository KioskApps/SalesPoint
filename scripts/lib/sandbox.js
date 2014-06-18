(function(window, document) {    
    //Sandbox Scope
    var sandbox = {};
    window.sandbox = sandbox;
    
    //Indicates whether or not sandbox-scripts.html has loaded
    var loaded = false;
    //Indicates whether or not an iframe with the ID of '#sandbox-scripts' was found
    var iframeNotFound = false;
    
    /**
     * Sends a message to a sandboxed script.
     * <p>
     * The message should AT LEAST contain a 'source' property, which should 
     * be any uniquely identifying String, and a 'script' property, which 
     * indicates the script to load.
     * <p>
     * The 'script' property should be equal to the scope object declared in 
     * the sandbox script's file. Usually this is a lowercase name of the 
     * script.
     * <p>
     * For the sandbox script 'sandbox-myscript.js', the 'script' parameter 
     * should be 'myscript'.
     * <p>
     * Any additional properties can be set as needed for the individual 
     * sandboxed script.
     * @param {Object} message the message to send to the sandboxed script
     * @returns {undefined}
     */
    sandbox.message = function(message) {
        if (loaded) {
            postMessage(message);
        }
        else if (iframeNotFound) {
            //If we can't find the sandbox, throw an error, don't try it again
            throw new Error('Cannot send a message when iframe "sandbox-scripts" was not found.');
        }
        else {
            //Keep trying to send the message if the sandbox has not loaded
            setTimeout(function() {
                sandbox.message(message);
            }, 100);
        }
    };

    /**
     * Sends a message to the sandbox-scripts.html content window.
     * @param {Object} message the message to send
     * @returns {undefined}
     */
    var postMessage = function(message) {
        var iframe = document.getElementById('sandbox-scripts');
        if (iframe) {
            var win = iframe.contentWindow;
            if (win !== null) {
                win.postMessage(message, '*');
            }
        }
        else {
            iframeNotFound = true;
            throw new Error('Warning: No iframe with "sandbox-scripts" ID was found, include it for sandbox scripts to work.');
        }
    };

    /**
     * Initialize the sandbox.
     * @returns {undefined}
     */
    var initialize = function() {
        //Add a listener to determine if the sandbox is loaded
        window.addEventListener('message', function(e) {
            if (e.data.loaded) {
                loaded = true;
            }
        });
        //Start the load check as soon as the window is done loading
        window.addEventListener('load', loadCheck);
    };
    /**
     * A load check function that will repeatedly message sandbox-scripts.html 
     * until it receives a response that sandbox-scripts.js is completely 
     * loaded.
     * @returns {undefined}
     */
    var loadCheck = function() {
        if (!loaded && !iframeNotFound) {
            postMessage({
                'loadCheck': true
            });
            setTimeout(loadCheck, 100);
        }
    };
    initialize();    
})(window, document);