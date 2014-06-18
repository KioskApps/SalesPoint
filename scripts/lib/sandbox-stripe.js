(function(window) {
    //Check if sandbox-scripts.js exists
    if (!window.sandbox) {
        throw new Error('sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Stripe Scope
    var stripe = {};
    window.stripe = stripe;
    
    /**
     * Stripe.com JavaScript API script URL
     */
    stripe.API_URL = 'https://js.stripe.com/v2/';
    /**
     * Stripe.com account test publishable key.
     * <p>
     * Be sure to use the publishable key and not the secret key. For 
     * deployment, change this to the live publishable key.
     */
    stripe.API_KEY = 'pk_test_Mh1oKuE9T1kalP8Stm9bzFee';
    
    /**
     * Indicates whether or not the sandboxed script has been loaded.
     * <p>
     * For this script, the global variable 'Stripe' (uppercase S is different 
     * from the sandboxe global variable 'stripe') will be undefined until 
     * the Stripe.com script is loaded. This can be used to indicate whether 
     * or not the sandboxed script is ready.
     * @returns {boolean} true if the Stripe.com script is loaded and ready
     */
    stripe.checkScript = function() {
        return typeof Stripe !== 'undefined';
    };
    /**
     * Retrieves the API script URL that needs to be loaded.
     * <p>
     * This function is called by sandbox-scripts.js, and refers to the 
     * Stripe.com script for this library.
     * @returns {string} the Stripe.com API script URL
     */
    stripe.getScriptUrl = function() {
        return stripe.API_URL;
    };
    /**
     * Stripe sandboxed message handler.
     * @param {Event} e message event
     * @returns {undefined}
     */
    stripe.messageHandler = function(e) {
        //Note: when using a sandboxed script with sandbox-scripts.js, there 
        //is no need to check the event's source/script parameters, or even 
        //check if this sandboxed script is loaded and ready. 
        //Sandbox-scripts.js takes care of the event source/script checking, 
        //it can be safely assume that this script will only receive events with 
        //the 'stripe' source property.
        //Since this scripts implements checkScript() and getScriptUrl(), it 
        //is also safe to assume that the global variable 'Stripe' will always 
        //be defined and ready since sandbox-scripts.js will automatically 
        //initialize and load the Stripe.com API script
        Stripe.setPublishableKey(stripe.API_KEY);
        chargeCard(e);    
    };
    
    /**
     * Charges a card from the provided event.
     * @param {Event} event
     * @returns {undefined}
     */
    var chargeCard = function(event) {
        //The response to send back over the sandbox
        var eventResponse = {};

        //Card information
        var number = event.data.number;
        var expMonth = event.data.expMonth.toString();
        var expYear = event.data.expYear.toString();
        //The amount to be charged
        var amount = event.data.amount;

        //Use Stripe.com's card validation functions to ensure the card's 
        //expiration is valid and the number is a valid credit card number
        if (Stripe.validateCardNumber(number) && Stripe.validateExpiry(expMonth, expYear)) {
            //Create a charge token
            Stripe.card.createToken({
                number: number,
                exp_month: expMonth,
                exp_year: expYear
            }, function(status, response) {
                if (response.error) {
                    eventResponse.success = false;
                    eventResponse.message = response.error;
                }
                else {
                    var token = response.id;
                    //This is where you would send the token and the amount to your 
                    //own server which would charge the Stripe single-use token
                    /*$.ajax('https://mystripeserver.com/', {
                        data: {
                            token: token,
                            amount: amount
                        }
                    }).success(function(data) {
                        //Charge was successful
                    }).fail(function(jqXHR) {
                        //Charge failed
                    });*/
                    //For testing purposes, assume the transaction was successful
                    eventResponse.success = true;
                    eventResponse.message = 'Charge successful';
                    
                    //Send the response back over the sandbox
                    window.sandbox.returnMessage(event, eventResponse);
                }
            });
        }
        else {
            eventResponse.success = false;
            eventResponse.message = 'Invalid card';
            
            //Send the response back over the sandbox
            window.sandbox.returnMessage(event, eventResponse);
        }
    };
})(window);