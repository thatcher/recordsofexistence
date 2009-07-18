/**
 * @author thatcher
 */
(function($,$V){
    
    var log;
    
    $V.Contact = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Views.Contact');
    };
    
    $.extend($V.Contact.prototype, {
        render: function(model){
            log.debug("Rendering html templates "); 
            var e4x = $.e4x("html/pages/contact.js", model, true);  
            //log.debug('response: %s', e4x.toXMLString());
            this.write( e4x );
        }
    });
    
})(jQuery, RecordsOfExistence.Views);
