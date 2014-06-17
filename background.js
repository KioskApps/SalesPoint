chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'state': 'fullscreen',
        'bounds': {
            'width': 1280,
            'height': 1024
        }
    }, function(window) {
        window.onClosed.addListener(function() {
            setBounds(true);
            setKeyboard(false);
        });
        setBounds(false);
        setKeyboard(true);
    });
});

function setBounds(restore) {
    chrome.system.display.getInfo(function(displays) {
        var display;
        for (var i = 0; i < displays.length; i++) {
            if (displays[i].isPrimary) {
                display = displays[i];
                break;
            }
        }

        if (display) {
            var targetWidth = 1280;
            var targetHeight = 1024;

            var width = display.bounds.width;
            var height = display.bounds.height;

            var overscan = {
                'left': 0,
                'right': 0,
                'top': 0,
                'bottom': 0
            };

            if (!restore) {
                if (width > targetWidth) {
                    overscan.left = (width - targetWidth) / 2;
                    overscan.right = overscan.left;
                }
                if (height > targetHeight) {
                    overscan.top = (height - targetHeight) / 2;
                    overscan.bottom = overscan.top;
                }
            }

            var info = {
                'overscan': overscan
            };
            chrome.system.display.setDisplayProperties(display.id, info);
        }
    });
};

function setKeyboard(enable) {
    if(chrome.accessibilityFeatures) {
        chrome.accessibilityFeatures.virtualKeyboard.set({ 
            value: enable 
        });
    }
}