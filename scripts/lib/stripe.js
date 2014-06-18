(function(window) {
    //Check if sandbox-scripts.js exists
    if (!window.sandbox) {
        throw new Error('stripe.js requires sandbox. sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Stripe Scope
    var stripe = {};
    window.stripe = stripe;
    
    /**
     * This object contains callback functions for different calls to 
     * stripe.chargeCard().
     * <p>
     * When a charge is requested, the passed callback function is assigned 
     * a unique source identifier, which is passed as the 'source' property in 
     * the sandbox message, and used to retrieve the callback when a response 
     * has been received.
     */
    stripe.callbacks = {};

    /**
     * Charges a credit card.
     * <p>
     * Note that for testing purposes, this function does not actually charge 
     * the provided card.
     * @param {Card} card the Card to charge (received from swiper.js library)
     * @param {number} amount the amount to charge
     * @param {function(object)} callback callback function that receives an 
     *      object with a boolean property 'success' that indicates the status 
     *      of the charge, and a String property 'message' that contains a short
     *      description of the success or failure of a charge 
     * @returns {undefined}
     */
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
    
    //Add message listener for sandbox messages
    window.addEventListener('message', function(e) {
        //Verify that the message is from sandbox-stripe.js
        if (e.data.script === 'stripe') {
            //Retrieve the callback associate with the event's source
            var callback = stripe.callbacks[e.data.source];
            if (callback !== undefined) {
                callback(e.data);
            }
        }
    });
})(window);