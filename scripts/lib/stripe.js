(function(window) {
    if (!window.sandbox) {
        throw new Error('stripe.js requires sandbox. sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Stripe Scope
    var stripe = {};
    window.stripe = stripe;
    
    stripe.callbacks = {};

    stripe.chargeCard = function(card, amount, callback) {
        var source = 'ChargeMessage' + Math.floor((Math.random() * 899) + 100);
        stripe.callbacks[source] = callback;
        var message = {
            'source': source,
            'script': 'stripe',
            'number': card.getNumber(),
            'expMonth': card.getExpMonth(),
            'expYear': card.getExpYear(),
            'amount': amount
        };
        window.sandbox.message(message);
    };
    
    window.addEventListener('message', function(e) {
        if (e.data.script === 'stripe') {
            var callback = stripe.callbacks[e.data.source];
            if (callback !== undefined) {
                //Print Stripe response to screen for testing
                console.log('Stripe Message: ' + JSON.stringify(e.data));
                callback(e.data);
            }
        }
    });
})(window);