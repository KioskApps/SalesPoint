/**
 * The Session object represents a user's session with the app.
 * <p>
 * Primarily the Session object is used to house the Receipt and any 
 * other information that needs to be shared across objects.
 * @returns {Session}
 */
function Session() {
    
    /**
     * The current Session's Receipt.
     * @type Receipt
     */
    this.receipt = new Receipt();
    /**
     * The current Session's currency sign (default $)
     * @type String
     */
    this.currency = '$';    
}