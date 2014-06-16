chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 1280,
            'height': 1024
        }
    });
  
    if(chrome.accessibilityFeatures) {
        chrome.accessibilityFeatures.virtualKeyboard.set({ 
            value: true 
        });
    }  
});