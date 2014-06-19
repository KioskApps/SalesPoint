//Main Scope
var main = {};
main.session;

//Global Vars
var SearchIntervalID;
var scaleActive = false;

$(document).ready(Init);

//Process
function Init()
{
    data.initialize();
    InitStillThere();
    AddListeners();
    flipper.openPage('#page-startup');
    startup.startTesting();
    $(".helper-images > div:gt(0)").hide();
}
function InitStillThere() {    
    stillthere.timeoutStillThere = 120000; //2 minutes
    stillthere.timeout = 150000; //2.5 minutes
    stillthere.addEventListener(stillthere.Event.STILL_THERE, function() {
        stillthere.overlay.find('.message').html('Are you still there?');
    });
    stillthere.addEventListener(stillthere.Event.TIMEOUT, function() {
        stillthere.overlay.find('.message').html('Touch to Begin');
        ReturnMainMenu_ClickHandler();
    });
}
function Reinit()
{
    main.session = new Session();
    scanner.scanning = true;
    swiper.scanning = false;
    scaleActive = false;
    
    $('.receipt').empty();
    $('.total .amount').html('$0.00');
    
    $('#page-checkout #pay-now').removeClass('active');
}

function AddListeners()
{
    scanner.addTrigger('.current');
    swiper.addTrigger('.current');
    
    $('#page-startup .start').click(function() {
        startup.stopTesting();
        ReturnMainMenu_ClickHandler();
    });
    
    $('#page-initial .start-button.english').click(Initial_StartEnglish_ClickHandler);
    $('#page-initial .start-button.spanish').click(Initial_StartSpanish_ClickHandler);
    $('#page-initial').on(scanner.EVENT, Initial_ScannerHandler);
    $('#page-initial').on(flipper.Event.BEFORE_OPEN, Initial_BeforeOpenHandler);
    $('#page-initial').on(flipper.Event.AFTER_CLOSE, Initial_AfterCloseHandler);
    
    $('#page-checkout').on(flipper.Event.BEFORE_OPEN, Checkout_BeforeOpenHandler);
    $('#page-checkout').on(flipper.Event.AFTER_CLOSE, Checkout_AfterCloseHandler);
    $('#page-checkout').on(scanner.EVENT, Checkout_ScannerHandler);
    $('#page-checkout #lookup-item').click(Checkout_LookupItem_ClickHandler);
    $('#page-checkout #large-item').click(Checkout_LargeItem_ClickHandler);
    $('#page-checkout #type-in-sku').click(Checkout_TypeInSKU_ClickHandler);
    $('#page-checkout #pay-now').click(Checkout_PayNow_ClickHandler);
    
    $('#page-lookup').on(flipper.Event.BEFORE_OPEN, Lookup_BeforeOpenHandler);
    $('#page-lookup').on('beforesearch', Lookup_BeforeSearchHandler);
    $('#page-lookup').on('aftersearch', Lookup_AfterSearchHandler);
    $('#page-lookup #item-search-query').keyup(Lookup_ItemSearchQuery_KeyUpHandler);
    
    $('#page-payment-options .payment-method.invalid').click(PaymentOptions_Cash_ClickHandler);
    $('#page-payment-options .payment-method.card').click(PaymentOptions_Card_ClickHandler);
    
    $('#page-payment').on(flipper.Event.BEFORE_OPEN, Payment_BeforeOpenHandler);
    $('#page-payment').on(flipper.Event.AFTER_CLOSE, Payment_AfterCloseHandler);
    $('#page-payment').on(swiper.EVENT, Payment_CardReaderHandler);
    
    $('#page-complete').on(flipper.Event.AFTER_OPEN, Complete_AfterOpenHandler);
    $('#page-complete').on(flipper.Event.BEFORE_OPEN, Complete_BeforeOpenHandler);
    $('#page-complete').on(flipper.Event.AFTER_CLOSE, Complete_AfterCloseHandler);
    
    $('.return-checkout').click(ReturnCheckout_ClickHandler);
    $('.return-main-menu').unbind('click').click(ReturnMainMenu_ClickHandler);
    $('.call-attendant').unbind('click').click(CallAttendent_ClickHandler);
    $('.return-payment-methods').click(InvalidPaymentType_ReturnPaymentMethods_ClickHandler);
    
    $('#overlay-error .continue').click(Error_Continue_ClickHandler);
    $('#overlay-large-item').click(LargeItem_Cancel_ClickHandler);
    $('#overlay-large-item').on(scanner.EVENT, LargeItem_Cancel_ClickHandler);
    $('#overlay-large-item .cancel').click(LargeItem_Cancel_ClickHandler);
    $('#overlay-type-in-sku .cancel').click(TypeInSKU_Cancel_ClickHandler);
    $('#overlay-type-in-sku .continue').click(TypeInSKU_Continue_ClickHandler);
    $('#overlay-call-attendant .continue').click(CallAttendent_Continue_ClickHandler);
    
    $('#overlay-scale .cancel').click(Scale_Cancel_ClickHandler);
    scale.addEventListener(scale.Event.ADDED, Scale_ItemAdded);
    scale.addEventListener(scale.Event.REMOVED, Scale_ItemRemoved);
}

function Initial_StartEnglish_ClickHandler(e)
{ 
    locales.setLanguage(locales.Languages.ENGLISH);
    flipper.openPage('#page-checkout');
}
function Initial_StartSpanish_ClickHandler(e)
{
    locales.setLanguage(locales.Languages.SPANISH);
    flipper.openPage('#page-checkout');
}
function Initial_ScannerHandler(e, sku) 
{
    Initial_StartEnglish_ClickHandler(e);
    AddItemToReceipt(sku);
}
function Initial_BeforeOpenHandler(e)
{
    document.getElementById('background-video').play();
}
function Initial_AfterCloseHandler(e)
{
    document.getElementById('background-video').pause();
}
function Checkout_BeforeOpenHandler(e) 
{
    scanner.scanning = true;
}
function Checkout_AfterCloseHandler(e) 
{
    scanner.scanning = false;
}
function Checkout_ScannerHandler(e, sku) 
{
    LargeItem_Cancel_ClickHandler();
    AddItemToReceipt(sku);
}
function Checkout_LookupItem_ClickHandler(e)
{
    flipper.openPage('#page-lookup');
}
function Checkout_LargeItem_ClickHandler(e)
{
    flipper.openOverlay('#overlay-large-item');
}
function Checkout_TypeInSKU_ClickHandler(e)
{
    scanner.scanning = false;
    $('#overlay-type-in-sku #sku-query').val('');
    flipper.openOverlay('#overlay-type-in-sku');
}
function Checkout_PayNow_ClickHandler(e)
{
    flipper.openPage('#page-payment-options');
}
function Lookup_BeforeOpenHandler(e)
{
    ProductSearch();
}
function Lookup_BeforeSearchHandler(e)
{
    if($('#page-lookup .search-results .search-result').length > 0)
    {
        $('#page-lookup .search-results .search-result').addClass('search-result-animation-out');
        setTimeout(function()
        {
            $('#page-lookup .search-results').empty();
            $('#modules .loading-animation').clone().appendTo('#page-lookup .search-results');
        }, 1000);
    }
    else
    {
        $('#page-lookup .search-results').empty();
        $('#modules .loading-animation').clone().appendTo('#page-lookup .search-results');
    }
}
function Lookup_AfterSearchHandler(e)
{
    $('#page-lookup .search-results .loading-animation').remove();
    $('#page-lookup .search-results .search-result').addClass('search-result-animation-in');
    setTimeout(function()
    {
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-in');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-1');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-2');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-3');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-4');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-5');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-6');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-7');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-8');
    }, 1000);
}
function Lookup_SearchItem_ClickHandler(e)
{
    var sku = $('.title .sku', $(this)).html();    

    flipper.openPage('#page-checkout');
    $('#page-lookup #item-search-query').val('');
    
    AddItemToReceipt(sku);
}
function Lookup_ItemSearchQuery_KeyUpHandler(e)
{
    var i = 0;
    clearInterval(SearchIntervalID);
    SearchIntervalID = setInterval(function(){UpdateProgress_SearchTimer(i);i++;}, 1);
}
function PaymentOptions_Card_ClickHandler(e)
{
    flipper.openPage('#page-payment');
}
function PaymentOptions_Cash_ClickHandler(e)
{
    flipper.openPage('#page-invalid-payment-type');
}
function InvalidPaymentType_ReturnPaymentMethods_ClickHandler(e)
{
    flipper.openPage('#page-payment-options');
}
function Payment_BeforeOpenHandler(e) 
{
    swiper.scanning = true;
}
function Payment_AfterCloseHandler(e) 
{
    swiper.scanning = false;
}
function Payment_CardReaderHandler(e, card)
{
    var amount = FormatDecimalFromCurrency($('#page-payment .receipt-total .amount').html());
    stripe.chargeCard(card, amount, function(response) {
        if (response.success) {
            flipper.openPage('#page-complete');
        }
        else {
            ShowError('There was a problem accepting your card: ' + response.message);
        }
    });
}
function Complete_AfterOpenHandler(e)
{
    setTimeout(function()
    {
       ReturnMainMenu_ClickHandler(); 
    }, 3000);
}
function Complete_BeforeOpenHandler(e)
{
    document.getElementById('complete-video').play();
}
function Complete_AfterCloseHandler(e)
{
    document.getElementById('complete-video').pause();
}

function ReturnMainMenu_ClickHandler(e)
{
    Reinit();
    flipper.openPage('#page-initial');
}
function ReturnCheckout_ClickHandler(e)
{
    flipper.openPage('#page-checkout');
}
function CallAttendent_ClickHandler(e)
{
    flipper.openOverlay('#overlay-call-attendant');
}

function Error_Continue_ClickHandler(e) 
{
     flipper.closeOverlay('#overlay-large-item');
}
function LargeItem_Cancel_ClickHandler(e)
{
    flipper.closeOverlay('#overlay-large-item');
}
function TypeInSKU_Cancel_ClickHandler(e)
{
    scanner.scanning = true;
    flipper.closeOverlay('#overlay-type-in-sku'); 
}
function TypeInSKU_Continue_ClickHandler(e)
{
    scanner.scanning = true;
    var sku = $('#overlay-type-in-sku #sku-query').val();
    flipper.closeOverlay('#overlay-type-in-sku');
    AddItemToReceipt(sku);
}
function CallAttendent_Continue_ClickHandler(e)
{
    flipper.closeOverlay('#overlay-call-attendant');
}
function Scale_Cancel_ClickHandler(e)
{
    scaleActive = false;
    flipper.closeOverlay('#overlay-scale');
}
function Scale_ItemAdded() {
    $('#overlay-scale .message').hide();
    $('#overlay-scale .wait').show();
}
function Scale_ItemRemoved() {
    $('#overlay-scale .wait').hide();  
    $('#overlay-scale .message').show();
}

//Actions
function ShowError(message) {
    $('#overlay-error .error').html(message);
    flipper.openOverlay('#overlay-error');
}
function ProductSearch(query)
{
    $('#page-lookup').trigger('beforesearch');
    if(typeof query === 'undefined')
    {
        //mock delay for loading animation
        setTimeout(function()
        {
            for(var i=0; i<data.productsArray.length; i++)
            {
                var product = data.productsArray[i];
                var productElement = product.getSearchResult();
                
                if(i < 8)
                {
                    productElement.addClass('search-result-animation-' + (i+1).toString());
                }
                
                productElement.click(Lookup_SearchItem_ClickHandler);
                $('#page-lookup .search-results').append(productElement);
            }
            $('#page-lookup').trigger('aftersearch');
        }, 2000);
    }
    else
    {
        setTimeout(function()
        {
            for(var i=0; i<data.productsArray.length; i++)
            {
                var product = data.productsArray[i];

                var searchTerm = query.toLowerCase();
                var matchTerm = product.name.toLowerCase();
                if(matchTerm.indexOf(searchTerm) > -1)
                {
                    var productElement = product.getSearchResult();

                    if(i < 8)
                    {
                        productElement.addClass('search-result-animation-' + (i+1).toString());
                    }

                    productElement.click(Lookup_SearchItem_ClickHandler);
                    $('#page-lookup .search-results').append(productElement);
                }
            }
            $('#page-lookup').trigger('aftersearch');
        }, 2000);
    }
    
    
}

function AddItemToReceipt(sku)
{
    var product = sku;
    if (typeof sku === 'string') {
        product = data.productsSku[sku];
        if (typeof product === 'undefined') {
            product = data.productsPlu[sku];
        }
    }
    
    if (typeof product === 'undefined') {
        ShowError('Invalid product, please see an attendant for assistance');
        return;
    }
    
    if (product.weightPrice > 0) {
        scaleActive = true;
        scanner.scanning = false;
        Scale_ItemRemoved();
        setTimeout(function() {
            //Allow for CSS transitions
            flipper.openOverlay('#overlay-scale');
        }, 1000);
        
        var attempts = 0;
        var getWeight = function() {
            if (!scaleActive) {
                return;
            }
            scale.getWeightOunces(function(weight) {
                if (weight && weight.amount > 0) {
                    var receiptItem = new ReceiptItem(product);
                    receiptItem.weight = weight.amount;

                    flipper.closeOverlay('#overlay-scale');
                    scanner.scanning = true;
                    if (scaleActive) {
                        AddItemToReceipt(receiptItem);
                        scaleActive = false;
                    }
                }
                else {
                    attempts++;
                    if (attempts < 5) {
                        setTimeout(getWeight, 1000);
                    }
                    else {
                        scaleActive = false;
                        scanner.scanning = true;
                        flipper.closeOverlay('#overlay-scale');
                        //Allow for CSS transitions
                        setTimeout(function() {
                            ShowError('An item was not placed on the scale');
                        }, 1000);
                    }
                }
            });
        };
        setTimeout(getWeight, 1000);
    }
    else {
        main.session.receipt.addItem(sku);
        var receipt = $('.receipt-container .receipt');
        receipt.scrollTop(receipt.prop("scrollHeight"));
        $('.receipt-container .receipt-totals .receipt-subtotal .amount').html(FormatCurrency(main.session.receipt.getSubTotal()));
        $('.receipt-container .receipt-totals .receipt-tax .amount').html(FormatCurrency(main.session.receipt.getTaxes()));
        $('.receipt-container .receipt-totals .receipt-total .amount').html(FormatCurrency(main.session.receipt.getGrandTotal()));

        if(main.session.receipt.recieptItems.length > 0)
        {
            $('#page-checkout #pay-now').addClass('active');
        }
        else
        {
            $('#page-checkout #pay-now').removeClass('active');
        }
    }
}

function UpdateProgress_SearchTimer(interval)
{
    if(interval < 200)
    {
        $('#page-lookup #search-timer-progress').val(interval);
    }
    else
    {
        clearInterval(SearchIntervalID);
        $('#page-lookup #search-timer-progress').val(0);
        var searchQuery = $('#page-lookup #item-search-query').val();
        ProductSearch(searchQuery);
    }
}

//Helper Functions
function FormatCurrency(value, hideCurrencyType)
{
    var formattedCurrency = '';
    if(hideCurrencyType === true)
    {
        formattedCurrency =  parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    else
    {
        formattedCurrency = main.session.currency + parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    return formattedCurrency;
}
function FormatDecimalFromCurrency(value)
{
    return parseFloat(value.substr(1));
}

