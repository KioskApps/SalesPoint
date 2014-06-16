function SetLanguage(json) {
    $('.store-name').html(json.storeName.message);
    $('.start-button.english').html(json.startButtonEnglish.message);
    $('.start-button.spanish').html(json.startButtonSpanish.message);
    $('.call-attendant .title').html(json.callAttendent.message);
    $('.return-main-menu .title').html(json.returnMainMenu.message);
    $('.return-checkout .title').html(json.returnCheckout.message);
    $('.return-payment-methods').html(json.returnPaymentTypes.message);
    $('input').attr('placeholder', json.touchToType.message);
    
    $('.receipt-container header').html(json.receiptHeader.message);
    $('.receipt-subtotal .title').html(json.subtotalTitle.message);
    $('.receipt-tax .title').html(json.taxTitle.message);
    $('.receipt-total .title').html(json.totalTitle.message);
    
    $('#page-checkout .page-title').html(json.pageCheckoutTitle.message);
    $('#page-checkout .instructions').html(json.pageCheckoutInstructions.message);
    
    $('#lookup-item .title').html(json.lookupItemTitle.message);
    $('#lookup-item .description').html(json.lookupItemDescription.message);
    $('#large-item .title').html(json.largeItemTitle.message);
    $('#large-item .description').html(json.largeItemDescription.message);
    $('#type-in-sku .title').html(json.typeInSkuTitle.message);
    $('#type-in-sku .description').html(json.typeInSkuDescription.message);
    $('#pay-now').html(json.payNow.message);
    
    $('#page-lookup .page-title').html(json.pageLookupTitle.message);
    $('#page-lookup .instructions').html(json.pageLookupInstructions.message);
    
    $('#page-payment-options .page-title').html(json.pagePaymentOptionsTitle.message);
    $('#page-payment-options .instructions').html(json.pagePaymentOptionsInstructions.message);
    $('#page-payment-options .card .title').html(json.pagePaymentCard.message);
    $('#page-payment-options .card .description').html(json.pagePaymentCardDescription.message);
    $('#page-payment-options .cash .title').html(json.pagePaymentCash.message);
    $('#page-payment-options .cash .description').html(json.pagePaymentCashDescription.message);
    $('#page-payment-options .check .title').html(json.pagePaymentCheck.message);
    $('#page-payment-options .check .description').html(json.pagePaymentCheckDescription.message);
    $('#page-payment-options .other .title').html(json.pagePaymentOther.message);
    $('#page-payment-options .other .description').html(json.pagePaymentOtherDescription.message);
    
    $('#page-invalid-payment-type .page-title').html(json.pageInvalidPaymentTitle.message);
    $('#page-invalid-payment-type .instructions').html(json.pageInvalidPaymentInstructions.message);
    
    $('#page-payment .page-title').html(json.pagePaymentTitle.message);
    $('#page-payment .instructions').html(json.pagePaymentInstructions.message);
    
    $('#page-complete .complete-thanks').html(json.pageCompleteThanks.message);
    $('#page-complete .complete-remove-bags').html(json.pageCompleteBags.message);
    
    $('.overlays .cancel').html(json.overlayCancel.message);
    $('.overlays .continue').html(json.overlayContinue.message);
    
    $('#overlay-large-item .message').html(json.overlayLargeItem.message);
    $('#overlay-type-in-sku .message').html(json.overlaySku.message);
    $('#overlay-call-attendant .message').html(json.overlayCallAttendant.message);
    $('#overlay-scale .message').html(json.overlayScale.message);
    $('#overlay-scale .wait p').html(json.overlayScaleWait.message);
}