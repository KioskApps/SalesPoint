//Data Namespace
var data = {};

data.SPREADSHEET_ID = '1-ZzeKWI1VCYCUWVveI4KZVWHaMdhOy50yHyzFDmARJs';

data.products = {};
data.productsSku = {};
data.productsUpc = {};
data.productsPlu = {};
data.productArray = [];


data.initialize = function() {
    spreadsheet.getAllRows(function(rows) {
        if (rows.length > 1) {
            var properties = rows[0];
            
            for (var i = 1; i < rows.length; i++) {
                var p = new Product();
                for (var j = 0; j < properties.length; j++) {
                    p[properties[j]] = rows[i][j];
                }
                data.products[p.sku] = p;
                data.productsSku[p.sku] = p;
                data.productsUpc[p.upc] = p;
                if (p.plu > 0) {
                    data.productsPlu[p.plu] = p;
                }
                data.productArray.push(p);
            }
        }
    }, data.SPREADSHEET_ID);
};