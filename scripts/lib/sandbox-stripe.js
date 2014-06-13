(function(window) {
    if (!window.sandbox) {
        throw new Error('sandbox-scripts.js is not loaded in the "sandbox-scripts" iframe.');
    }
    
    //Stripe Scope
    var stripe = {};
    window.stripe = stripe;
    
    stripe.API_URL = 'https://js.stripe.com/v2/';
    stripe.API_KEY = 'pk_test_Mh1oKuE9T1kalP8Stm9bzFee';
    
    stripe.messageHandler = function(e) {
        Stripe.setPublishableKey(stripe.API_KEY);
        chargeCard(e);    
    };
    
    stripe.checkScript = function() {
        return typeof Stripe !== 'undefined';
    };
    
    stripe.getScriptUrl = function() {
        return stripe.API_URL;
    };
    
    var chargeCard = function(event) {
        var eventResponse = {};

        var number = event.data.number;
        var expMonth = event.data.expMonth.toString();
        var expYear = event.data.expYear.toString();
        var amount = event.data.amount;

        if (Stripe.validateCardNumber(number) && Stripe.validateExpiry(expMonth, expYear)) {        
            Stripe.card.createToken({
                number: number,
                exp_month: expMonth,
                exp_year: expYear
            }, function(status, response) {
                //Print Stripe response to screen for testing
                console.log('Stripe Response: ' + JSON.stringify(response));
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
                    window.sandbox.returnMessage(event, eventResponse);
                }
            });
        }
        else {
            eventResponse.success = false;
            eventResponse.message = 'Invalid card';
            window.sandbox.returnMessage(event, eventResponse);
        }
    };

})(window);