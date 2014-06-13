(function(window, document) {    
    //Sandbox Scope
    var sandbox = {};
    window.sandbox = sandbox;
    
    var loaded = false;
    var iframeNotFound = false;
    
    sandbox.message = function(message) {
        if (loaded) {
            postMessage(message);
        }
        else if (iframeNotFound) {
            throw new Error('Cannot send a message when iframe "sandbox-scripts" was not found.');
        }
        else {
            setTimeout(function() {
                sandbox.message(message);
            }, 100);
        }
    };

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
            throw new Error('Warning: No iframe with "sandbox-scripts" id was found, include it for sandbox scripts to work.');
        }
    };

    var initialize = function() {
        window.addEventListener('message', function(e) {
            if (e.data.loaded) {
                loaded = true;
            }
        });
        window.addEventListener('load', loadCheck);
    };
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