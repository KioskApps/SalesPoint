//Data Scope
var data = {};
window.data = data;

/**
 * Google Drive spreadsheet ID where product data is located
 */
data.SPREADSHEET_ID = '1-ZzeKWI1VCYCUWVveI4KZVWHaMdhOy50yHyzFDmARJs';

/**
 * Map of Product objects by their SKU.
 */
data.productsSku = {};
/**
 * Map of Product objects by their PLU.
 */
data.productsPlu = {};
/**
 * Array of all Product objects
 */
data.productsArray = [];

/**
 * Loads product data from Google Drive spreadsheet and initializes 
 * product maps.
 * @returns {undefined}
 */
data.initialize = function() {
    spreadsheet.getAllRows(function(rows) {
        if (rows.length > 1) {
            //The first row contains the property key names for Product objects
            var properties = rows[0];

            for (var i = 1; i < rows.length; i++) {
                var p = new Product();
                for (var j = 0; j < properties.length; j++) {
                    p[properties[j]] = rows[i][j];
                }
                //Add product to sku/upc/plu maps
                data.productsSku[p.sku] = p;
                if (p.plu > 0) {
                    data.productsPlu[p.plu] = p;
                }
                data.productsArray.push(p);
            }
        }
    }, data.SPREADSHEET_ID);
};