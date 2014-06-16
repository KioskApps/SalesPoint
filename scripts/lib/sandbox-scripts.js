(function(window, document, JSON) {
    //Sandbox scope
    var sandbox = {};
    window.sandbox = sandbox;
    
    sandbox.initsCalled = {};
    
    sandbox.returnMessage = function(event, message) {
        message = sandbox.deepCopySafeMessage(message || {});
        message.source = event.data.source;
        message.script = event.data.script;
        
        event.source.postMessage(message, event.origin);
    };
    
    /* Used to remove functions when passing an object with window.postMessage */
    sandbox.deepCopySafeMessage = function(object) {
        return JSON.parse(JSON.stringify(object));
    };
    
    sandbox.initializeScript = function(url) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.body.appendChild(script);
    };
    
    var eventAttempts = {};
    
    function messageHandler(e) {
        if (e.data.loadCheck) {
            e.source.postMessage({
                'loaded': true
            }, e.origin);
        }
        else if (e.data.script) {
            if (!e.data.source) {
                e.data.source = 'Unknown' + Math.floor((Math.random() * 899) + 100);
            }
            
            var script = window[e.data.script];
            if (script && script.messageHandler) {
                if (script.checkScript && script.getScriptUrl) {
                    if (script.checkScript()) {
                        script.messageHandler(e);
                    }
                    else {
                        if (!sandbox.initsCalled[script]) {
                            sandbox.initsCalled[script] = true;
                            sandbox.initializeScript(script.getScriptUrl());
                        }
                        
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
                    script.messageHandler(e);
                }
            }
        }
    }

    var initialize = function() {
        window.addEventListener('message', messageHandler);
    };
    initialize();        
}(window, document, JSON));
