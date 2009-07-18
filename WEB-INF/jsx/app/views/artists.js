/**
 * @author thatcher
 */
(function($,$V){
    
    var log;
    
    $V.Artists = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Views.Artists');
    };
    
    $.extend($V.Artists.prototype, {
        render: function(model){
            log.debug("Rendering html templates "); 
            var page = model.id?'artist':'artists';
            this.write( $.e4x(
                'html/pages/'+page+'.js'+(model.id?'?'+model.id:''), 
                    model, true) );
        }
    });
    
})(jQuery, RecordsOfExistence.Views);
