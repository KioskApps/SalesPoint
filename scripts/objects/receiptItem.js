function RecieptItem(product)
{
    var self = this;
    
    this.id = CurrentSession.receipt.recieptItems.length;
    this.product = product;    
    this.weight = 0;
    
    this.getTotalPrice = function()
    {
        var total = 0;
        if(self.product.unitPrice > 0.00)
        {
            total = self.product.unitPrice;
        }
        else if(self.product.weightPrice > 0.00)
        {
            total = self.product.weightPrice * self.weight;
        }
        
        return total;
    };
    
    this.setWeight = function(weight)
    {
        self.weight = weight;
    };
    
    this.getReceiptItem = function()
    {
        var receiptItem = $('<div class="receipt-item"></div>');
        receiptItem.append('<span class="product-name">' + self.product.name + '</span>');
        receiptItem.append('<span class="product-total"><span class="currency">' + CurrentSession.currency + '</span><span class="total">' + FormatCurrency(self.getTotalPrice(), true) + '</span></span>');
        return receiptItem;
    };
}