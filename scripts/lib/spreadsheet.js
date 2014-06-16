(function(window, JSON) {
    //Spreadsheet Scope
    var spreadsheet = {};
    window.spreadsheet = spreadsheet;
    
    /* This should be the web app URL that spreadsheet.gs is deployed to */
    spreadsheet.MACRO_URL = 'https://script.google.com/macros/s/AKfycbw4AvoXKYaURCkaCmjwi7zQO54GCP45YaNnGQ0d8slA0ZGxiEw/exec';
    /* Specify a default spreadsheet if the app is only communicating with one spreadsheet */
    spreadsheet.defaultSpreadsheetId;

    spreadsheet.getAllRows = function(callback, spreadsheetId) {
        spreadsheetId = spreadsheetId || spreadsheet.defaultSpreadsheetId;
        var params = {
            'spreadsheetId': spreadsheetId,
            'action': 'get'
        };
        var url = [];
        url.push(spreadsheet.MACRO_URL);
        url.push('?');
        for (var key in params) {
            url.push(key);
            url.push('=');
            url.push(params[key]);
            url.push('&');
        }
        url.pop();
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var rows = [];
                var message = xhr.statusText;
                var status = xhr.status;
                
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    message = response.message;
                    status = xhr.status;
                    
                    if (response.status === 200) {
                        rows = response.data;
                    }
                }
                if (typeof callback === 'function') {
                    callback(rows, message, status);
                }
            }
        };
        xhr.open('GET', url.join(''), true);
        xhr.send();        
    };
    
    spreadsheet.appendRow = function(row, callback, spreadsheetId) {
        if (typeof callback === 'string') {
            spreadsheetId = callback;
        }
        spreadsheetId = spreadsheetId || spreadsheet.defaultSpreadsheetId;
        var params = {
            'spreadsheetId': spreadsheetId,
            'action': 'post',
            'row': JSON.stringify(row)
        };
        var url = [];
        url.push(spreadsheet.MACRO_URL);
        url.push('?');
        for (var key in params) {
            url.push(key);
            url.push('=');
            url.push(params[key]);
            url.push('&');
        }
        url.pop();
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var message = xhr.statusText;
                var status = xhr.status;
                
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    message = response.message;
                    status = response.status;
                }
                if (typeof callback === 'function') {
                    callback(message, status);
                }
            }
        };
        xhr.open('GET', url.join(''), true);
        xhr.send(); 
    };
})(window, JSON);