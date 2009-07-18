/**
 * @author thatcher
 */
(function($, $$, $S){
    
    var log;
    
    $S.Contact = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Services.Contact');
    };
    
    $.extend($S.Contact.prototype, new $$.Servlet(), {
        handleGet: function(request, response){
            log.debug('Serving page.');
            response.render();
        }
    });
    
})(jQuery, Claypool.Server, RecordsOfExistence.Services);
