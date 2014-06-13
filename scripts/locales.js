function InitializeLocales() {
    return;
    $('.store-name').html(chrome.i18n.getMessage('storeName'));
    $('.start-button.english').html(chrome.i18n.getMessage('startButtonEnglish'));
    $('.start-button.spanish').html(chrome.i18n.getMessage('startButtonSpanish'));
    $('.call-attendant .title').html(chrome.i18n.getMessage('callAttendent'));
    $('.return-main-menu .title').html(chrome.i18n.getMessage('returnMainMenu'));
    $('.return-checkout .title').html(chrome.i18n.getMessage('returnCheckout'));
    
    $('#page-checkout .page-title').html(chrome.i18n.getMessage('pageCheckoutTitle'));
    $('#page-checkout .receipt-container header').html(chrome.i18n.getMessage('pageCheckoutReceiptHeader'));
    $('#page-checkout .receipt-subtotal .title').html(chrome.i18n.getMessage('pageCheckoutSubtotalTitle'));
    $('#page-checkout .receipt-tax .title').html(chrome.i18n.getMessage('pageCheckoutTaxTitle'));
    $('#page-checkout .receipt-total .title').html(chrome.i18n.getMessage('pageCheckoutTotalTitle'));
    
    $('#lookup-item .title').html(chrome.i18n.getMessage('lookupItemTitle'));
    $('#lookup-item .description').html(chrome.i18n.getMessage('lookupItemDescription'));
    $('#large-item .title').html(chrome.i18n.getMessage('largeItemTitle'));
    $('#large-item .description').html(chrome.i18n.getMessage('largeItemDescription'));
    $('#type-in-sku .title').html(chrome.i18n.getMessage('typeInSkuTitle'));
    $('#type-in-sku .description').html(chrome.i18n.getMessage('typeInSkuDescription'));
    $('#pay-now').html(chrome.i18n.getMessage('payNow'));
    
    //TODO: Continue at #page-lookup
}