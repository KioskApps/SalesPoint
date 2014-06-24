//Locales Scope
var locales = {};
window.locales = locales;

/**
 * The supported locales.
 */
locales.Languages = {
    'ENGLISH': 'en',
    'SPANISH': 'es'
};

/**
 * Sets the language of the app to the specified locale.
 * @param {string|Object} locale the locale or the JSON locale file
 * @returns {undefined}
 */
locales.setLanguage = function(locale) {
    if (typeof locale === 'string') {
        $.getJSON('_locales/' + locale + '/messages.json', locales.setLanguage);
        return;
    }
    $('.store-name').html(locale.storeName.message);
    $('.start-button.english').html(locale.startButtonEnglish.message);
    $('.start-button.spanish').html(locale.startButtonSpanish.message);
    $('.call-attendant .title').html(locale.callAttendent.message);
    $('.return-main-menu .title').html(locale.returnMainMenu.message);
    $('.return-checkout .title').html(locale.returnCheckout.message);
    $('.return-payment-methods').html(locale.returnPaymentTypes.message);
    $('input').attr('placeholder', locale.touchToType.message);

    $('.receipt-container header').html(locale.receiptHeader.message);
    $('.receipt-subtotal .title').html(locale.subtotalTitle.message);
    $('.receipt-tax .title').html(locale.taxTitle.message);
    $('.receipt-total .title').html(locale.totalTitle.message);

    $('#page-checkout .page-title').html(locale.pageCheckoutTitle.message);
    $('#page-checkout .instructions').html(locale.pageCheckoutInstructions.message);

    $('#lookup-item .title').html(locale.lookupItemTitle.message);
    $('#lookup-item .description').html(locale.lookupItemDescription.message);
    $('#large-item .title').html(locale.largeItemTitle.message);
    $('#large-item .description').html(locale.largeItemDescription.message);
    $('#type-in-sku .title').html(locale.typeInSkuTitle.message);
    $('#type-in-sku .description').html(locale.typeInSkuDescription.message);
    $('#pay-now').html(locale.payNow.message);

    $('#page-lookup .page-title').html(locale.pageLookupTitle.message);
    $('#page-lookup .instructions').html(locale.pageLookupInstructions.message);

    $('#page-payment-options .page-title').html(locale.pagePaymentOptionsTitle.message);
    $('#page-payment-options .instructions').html(locale.pagePaymentOptionsInstructions.message);
    $('#page-payment-options .card .title').html(locale.pagePaymentCard.message);
    $('#page-payment-options .card .description').html(locale.pagePaymentCardDescription.message);
    $('#page-payment-options .cash .title').html(locale.pagePaymentCash.message);
    $('#page-payment-options .cash .description').html(locale.pagePaymentCashDescription.message);
    $('#page-payment-options .check .title').html(locale.pagePaymentCheck.message);
    $('#page-payment-options .check .description').html(locale.pagePaymentCheckDescription.message);
    $('#page-payment-options .other .title').html(locale.pagePaymentOther.message);
    $('#page-payment-options .other .description').html(locale.pagePaymentOtherDescription.message);

    $('#page-invalid-payment-type .page-title').html(locale.pageInvalidPaymentTitle.message);
    $('#page-invalid-payment-type .instructions').html(locale.pageInvalidPaymentInstructions.message);

    $('#page-payment .page-title').html(locale.pagePaymentTitle.message);
    $('#page-payment .instructions').html(locale.pagePaymentInstructions.message);

    $('#page-complete .complete-thanks').html(locale.pageCompleteThanks.message);
    $('#page-complete .complete-remove-bags').html(locale.pageCompleteBags.message);

    $('#overlays .cancel').html(locale.overlayCancel.message);
    $('#overlays .continue').html(locale.overlayContinue.message);
    $('#overlays .return').html(locale.overlayReturn.message);
    $('#overlays .confirm').html(locale.overlayConfirm.message);

    $('#overlay-large-item .message').html(locale.overlayLargeItem.message);
    $('#overlay-type-in-sku .message').html(locale.overlaySku.message);
    $('#overlay-call-attendant .message').html(locale.overlayCallAttendant.message);
    $('#overlay-scale .message').html(locale.overlayScale.message);
    $('#overlay-scale .wait p').html(locale.overlayScaleWait.message);
    $('#overlay-cancel .message').html(locale.overlayCancelTransaction.message);
};