function ReceiptItem(product)
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
        var productTotal = $('<span/>').addClass('product-total');
        if (self.weight > 0) {
            var weight = self.weight + '' + self.product.weightUnit + ' ';
            productTotal.append($('<span/>').addClass('weight').html(weight));
        }
        productTotal.append($('<span/>').addClass('total').html(FormatCurrency(self.getTotalPrice()), true));
        receiptItem.append(productTotal);
        return receiptItem;
    };
}