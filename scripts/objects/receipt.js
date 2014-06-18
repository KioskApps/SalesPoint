/**
 * A Receipt object represents the receipt viewed on the app's screen. It 
 * contains an array of ReceiptItem objects, which loosely wraps the Product 
 * object.
 * @returns {Receipt}
 */
function Receipt() {
    //Protected this scope
    var self = this;
    
    /**
     * Array of ReceiptItem objects
     * @type Array
     */
    this.recieptItems = [];
    
    /**
     * Adds an item to this Receipt.
     * <p>
     * If the passed parameter is a String, the appropriate Product will 
     * be retrieved by its SKU or PLU.
     * <p>
     * Additionally, this function will create a receipt item div and 
     * append it to every receipt container.
     * @param {ReceiptItem|string} id the ReceiptItem to add, or the 
     *      Product SKU or PLU
     * @returns {undefined}
     */
    this.addItem = function(item) {
        var receiptItem = item;
        if (typeof item === 'string') {
            var product = data.productsSku[item];
            if (product === undefined) {
                product = data.productsPlu[item];
            }
            receiptItem = new ReceiptItem(product);
        }
        
        self.recieptItems.push(receiptItem);
        
        $('.receipt-container .receipt').append(receiptItem.getReceiptItemDiv());
    };
    /**
     * Retrieves the sub total of this Receipt.
     * @returns {Number} Receipt sub total
     */
    this.getSubTotal = function() {
        var sub = 0;
        for (var i = 0; i < self.recieptItems.length; i++) {
            sub += self.recieptItems[i].getPrice();
        }
        return sub;
    };
    /**
     * Retrieves the tax of this Receipt.
     * @returns {Number} Receipt tax
     */
    this.getTaxes = function() {
        var sub = self.getSubTotal();
        return sub * 0.0825;
    };
    /**
     * Retrieves the grand total of this Receipt.
     * @returns {Number} Receipt grand total
     */
    this.getGrandTotal = function() {
        return self.getSubTotal() + self.getTaxes();
    };
}