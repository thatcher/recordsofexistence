/**
 * @author thatcher
 */
/**
 * @author thatcher
 */
(function($, $V){
    
    var log;
    
    $V.Site = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Views.Site');
    };
    
    $.extend($V.Site.prototype, {
        render: function(model){
            log.info("Rendering html template %s ", model.template); 
            var doc = $.e4x(model.template,  model, true);
            log.debug('result of template :\n\n %s \n\n', doc);
            this.write(doc);
        }
    });
    
})(jQuery, RecordsOfExistence.Views);
