(function(window, $) {
    //Flipper Scope
    var flipper = {};
    window.flipper = flipper;
    
    /**
     * Defines before/after open/close event types.
     * <p>
     * For example:
     * <pre>
     * $(mypage).on(flipper.Event.BEFORE_OPEN, functionToCallBefore);
     * </pre>
     */
    flipper.Event = {
        BEFORE_OPEN: 'before-open',
        AFTER_OPEN: 'after-open',
        BEFORE_CLOSE: 'before-close',
        AFTER_CLOSE: 'after-close'
    };
    /**
     * The default flipper used if a flipper is not specified for opening 
     * pages.
     * <p>
     * By default, this is set to '.flipper', which will use any and all 
     * flippers in the document. It can be set to a jQuery selector or an 
     * ID string, such as '#my-main-flipper'.
     * @type {(string|jQuery)}
     */
    flipper.flipper = '.flipper';
    /**
     * The overlay div that is used to display overlays.
     * <p>
     * By default, flipper.js will look for a div the ID of '#overlay'.
     */
    flipper.overlay = '#overlay';
    /**
     * The overlay storage div. This should be a hidden div in the document 
     * that overlays will be stored in.
     * <p>
     * By default, flipper.js will look for a div with the ID of '#overlays'.
     */
    flipper.overlays = '#overlays';
    
    //jQuery selectors for overlay and overlays
    var $overlay;
    var $overlays;
    //The animation speed defined in flipper.css
    var cssSpeed = 700;
    
    /**
     * Opens the provided page under the specified flipper.
     * <p>
     * If the flipper is not provided, the default flipper will be used.
     * @param {string|jQuery} page jQuery selector for the page
     * @param {string|jQuery} flip jQuery selector for the flipper
     * @returns {undefined}
     */
    flipper.openPage = function(page, flip) {
        if (!flip) {
            flip = flipper.flipper;
        }
        var $flip = $(flip);
        var $page = $(page);
                
        //If trying to open the current page again, just return
        if ($page.hasClass('current')) {
            return;
        }
                
        //Close the current page
        var $current = $flip.find('.current');
        $current.trigger(flipper.Event.BEFORE_CLOSE);
        $current.addClass('out');
        setTimeout(function() {
            $current.removeClass('current');
            $current.removeClass('out');
            $current.trigger(flipper.Event.AFTER_CLOSE);
        }, cssSpeed);

        //Open the new page
        $page.trigger(flipper.Event.BEFORE_OPEN);
        $page.addClass('current');
        $page.addClass('in');
        setTimeout(function() {
            $page.removeClass('in');
            $page.trigger(flipper.Event.AFTER_OPEN);
        }, cssSpeed);
    };
    
    /**
     * Opens the provided overlay.
     * @param {string|jQuery} overlay jQuery selector of the overlay to open
     * @param afterOpen {function} optional function to call after opening the 
     *      overlay
     * @returns {undefined}
     */
    flipper.openOverlay = function(overlay, afterOpen) {
        //Initialize the jQuery overlay/overlays selectors
        if (!$overlay) {
            $overlay = $(flipper.overlay);
        }
        if (!$overlays) {
            $overlays = $(flipper.overlays);
        }
        
        var $o = $(overlay);
        $o.trigger(flipper.Event.BEFORE_OPEN);
        
        if ($overlay.is(':visible')) {
            flipper.closeOverlay('', function() {
                flipper.openOverlay(overlay, afterOpen);
            });
            return;
        }
        
        //Open the main overlay
        $overlay.addClass('open');
        //Attach the provided overlay into the main overlay
        $o.detach().appendTo($overlay.find('.foreground-container'));
        
        //Animate in
        $overlay.find('.foreground-container').addClass('foreground-in');
        $overlay.find('.background').addClass('background-in');
        setTimeout(function() {
            $overlay.find('.foreground-container').removeClass('foreground-in');
            $overlay.find('.background').removeClass('background-in');
            $o.trigger(flipper.Event.AFTER_OPEN);
            if (typeof afterOpen === 'function') {
                afterOpen();
            }
        }, cssSpeed);
    };
    /**
     * Closes the specified overlay.
     * @param {string|jQuery} overlay jQuery selector of the overlay to close
     * @param afterClose {function} optional function to call after closing the 
     *      overlay
     * @returns {undefined}
     */
    flipper.closeOverlay = function(overlay, afterClose) {
        //Initialize the jQuery overlay/overlays selectors
        if (!$overlay) {
            $overlay = $(flipper.overlay);
        }
        if (!$overlays) {
            $overlays = $(flipper.overlays);
        }
        
        var $o = $(overlay);
        if ($o.length === 0) {
            //If an overlay is not provided, try to find the currently open overlay
            $o = $overlay.find('.foreground-container').children();
        }
        
        $o.trigger(flipper.Event.BEFORE_CLOSE);
        //Animate out
        $overlay.find('.foreground-container').addClass('foreground-out');
        $overlay.find('.background').addClass('background-out');        
        setTimeout(function() {
            //Close the main overlay
            $overlay.removeClass('open');
            //Detatch the overlay from the main overlay and place it back 
            //into the overlays storage
            $o.detach().appendTo($overlays);
            
            $overlay.find('.foreground-container').removeClass('foreground-out');
            $overlay.find('.background').removeClass('background-out');
            $o.trigger(flipper.Event.AFTER_CLOSE);
            if (typeof afterClose === 'function') {
                afterClose();
            }
        }, cssSpeed);
    };
    
    //Initialize the "perspective" CSS attribute. This gives the flipper its
    //3D "folding down" effect and should be the height of the flipper. This 
    //can't be dynamically assigned in CSS
    var initialize = function() {
        $('.flipper').each(function() {
            var $flip = $(this);
            $flip.css('perspective', $flip.height() + 'px');
        });
    };
    
    window.addEventListener('load', initialize);
})(window, jQuery);