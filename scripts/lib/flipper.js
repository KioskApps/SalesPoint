(function(window, $) {
    //Flipper Scope
    var flipper = {};
    window.flipper = flipper;
    
    flipper.Event = {
        BEFORE_OPEN: 'before-open',
        AFTER_OPEN: 'after-open',
        BEFORE_CLOSE: 'before-close',
        AFTER_CLOSE: 'after-close'
    };
    
    flipper.flipper = '.flipper';
    flipper.overlay = '#overlay';
    flipper.overlays = '#overlays';
    
    var $overlay;
    var $overlays;
    
    flipper.openPage = function(flip, page) {
        if (!page) {
            page = flip;
            flip = flipper.flipper;
        }
        var $flip = $(flip);
        var $page = $(page);
        
        var cssSpeed = 700;
        
        var $current = $flip.find('.current');
        $current.trigger(flipper.Event.BEFORE_CLOSE);
        $current.addClass('out');
        setTimeout(function() {
            $current.removeClass('current');
            $current.removeClass('out');
            $current.trigger(flipper.Event.AFTER_CLOSE);
        }, cssSpeed);

        $page.trigger(flipper.Event.BEFORE_OPEN);
        $page.addClass('current');
        $page.addClass('in');
        setTimeout(function() {
            $page.removeClass('in');
            $page.trigger(flipper.Event.AFTER_OPEN);
        }, cssSpeed);
    };
    
    flipper.openOverlay = function(overlay) {
        if (!$overlay) {
            $overlay = $(flipper.overlay);
        }
        if (!$overlays) {
            $overlays = $(flipper.overlays);
        }
        var cssSpeed = 700;
        
        var $o = $(overlay);
        $o.trigger(flipper.Event.BEFORE_OPEN);
        
        $overlay.addClass('open');
        $o.detach().appendTo($overlay.find('.foreground-container'));
        
        $overlay.find('.foreground-container').addClass('foreground-in');
        $overlay.find('.background').addClass('background-in');

        setTimeout(function() {
            $overlay.find('.foreground-container').removeClass('foreground-in');
            $overlay.find('.background').removeClass('background-in');
            $o.trigger(flipper.Event.AFTER_OPEN);
        }, cssSpeed);
    };
    flipper.closeOverlay = function(overlay) {
        if (!$overlay) {
            $overlay = $(flipper.overlay);
        }
        if (!$overlays) {
            $overlays = $(flipper.overlays);
        }
        var cssSpeed = 700;
        
        var $o = $(overlay);
        if ($o.length === 0) {
            $o = $overlay.find('.foreground-container').children();
        }
        
        $o.trigger(flipper.Event.BEFORE_CLOSE);
        $overlay.find('.foreground-container').addClass('foreground-out');
        $overlay.find('.background').addClass('background-out');
        
        setTimeout(function() {
            $overlay.removeClass('open');
            $o.detach().appendTo($overlays);
            
            $overlay.find('.foreground-container').removeClass('foreground-out');
            $overlay.find('.background').removeClass('background-out');
        }, cssSpeed);
    };
    
    var initialize = function() {
        $('.flipper').each(function() {
            var $flip = $(this);
            $flip.css('perspective', $flip.height() + 'px');
        });
    };
    
    window.addEventListener('load', initialize);
})(window, jQuery);