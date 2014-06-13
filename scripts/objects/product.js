function Product()
{
    var self = this;
    
    this.sku = '';
    
    this.name = '';
    this.description = '';
    this.unitPrice = 0.00;
    this.weightPrice = 0.00;
    this.weightUnit = 'lbs';
    this.discount = 0.00;
    
    this.upc = -1;
    this.plu = -1;
    
    this.imageUrl = '';
    
    this.getSearchResult = function()
    {
        var priceData = '';
        
        if(self.unitPrice > 0.00)
        {
           priceData = '<span class="currency">' + CurrentSession.currency + '</span><span class="price">' + self.unitPrice + '</span><span class="per"></span><span class="unit">each</span>';
        }
        else if(self.weightPrice > 0.00)
        {
             priceData = '<span class="currency">$</span><span class="price">' + self.weightPrice + '</span><span class="per">per</span><span class="unit">' + self.weightUnit + '</span>';
        }
        else
        {
            priceData = 'Price data not found';
        }
        
        var searchResultHTML = ['<div class="search-result">',
                                    '<img class="product-image" src="' + self.imageUrl + '" />',
                                    '<div class="product-data">',
                                        '<div class="title">',
                                            '<span class="name">' + self.name + '</span>',
                                            '<span class="sku">' + self.sku + '</span>',
                                        '</div>',
                                        '<div class="description">' + self.description + '</div>',
                                        '<div class="price-data">' + priceData + '</div>',
                                    '</div>',
                                '</div>'];
        
        var searchResultString = searchResultHTML.join('');
        return searchResultString;
    }
}