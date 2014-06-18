/**
 * A Product object is any purchasable item sold by the app.
 * <p>
 * Every Product MUST have an SKU identifier. Additionally, some Products 
 * such as produce may have a PLU number in addition to their SKU.
 * <p>
 * A Product may have either a unit price or a weight price. If the Product 
 * has a unit price, it will be charged the full unit price each time it is 
 * scanned. If a Product has a weight price, it's total price will depend 
 * on the weight of the item.
 * @returns {Product}
 */
function Product() {
    //Protected this scope
    var self = this;
    
    /**
     * Product SKU
     * @type String
     */
    this.sku = '';
    /**
     * Product PLU
     * @type Number
     */
    this.plu = -1;
    /**
     * Product name
     * @type String
     */
    this.name = '';
    /**
     * Product description
     * @type String
     */
    this.description = '';
    /**
     * Product unit price
     * @type Number
     */
    this.unitPrice = 0.00;
    /**
     * Product weight price
     * @type Number
     */
    this.weightPrice = 0.00;
    /**
     * Product weight unit (oz, lbs, etc)
     * @type String
     */
    this.weightUnit = 'oz';
    /**
     * Image URL for Product
     * @type String
     */
    this.imageUrl = '';
    
    /**
     * Retrieves a search result jQuery div for use in the product lookup 
     * page.
     * @returns {jQuery} search result div
     */
    this.getSearchResult = function() {
        var priceData = $('<div/>').addClass('price-data');
        priceData.append($('<span/>').addClass('currency').html(main.session.currency));
        if (self.unitPrice > 0) {
            priceData.append($('<span/>').addClass('price').html(self.unitPrice));
            priceData.append($('<span/>').addClass('per'));
            priceData.append($('<span/>').addClass('unit').html(' each'));
        }
        else if (self.weightPrice > 0) {
            priceData.append($('<span/>').addClass('price').html(self.weightPrice));
            priceData.append($('<span/>').addClass('per').html(' per '));
            priceData.append($('<span/>').addClass('unit').html(self.weightUnit));
        }
        else {
            priceData.append($('<span/>').addClass('price').html('Price Data Not Found'));
        }
        
        var div = $('<div/>').addClass('search-result');
        div.append($('<img/>').addClass('product-image').attr('src', self.imageUrl));
        div.append($('<div/>').addClass('product-data')
                .append($('<div/>').addClass('title')
                    .append($('<span/>').addClass('name').html(self.name))
                    .append($('<span/>').addClass('sku').html(self.sku)))
                .append($('<div/>').addClass('description').html(self.description))
                .append(priceData));
        
        return div;
    };
}