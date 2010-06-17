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
        write: function(model){
            log.info("Rendering html template %s ", model.template);
            $.render({
                async:false,
                url: model.template,
                templateData: model,
                success: function(response){
                    log.debug("Rendered template %s ", response);
                    rendered = response;
                },
                error: function(xhr, status, e){
                    log.error('failed to render : %s ', model.template).
                        exception(e);
                    throw('Error Rendering template '+ model.template);
                }
            });
            log.info("Finsihed rendering html template %s ", model.template);
            return rendered;
        }
    });
    
    $.tmpl.filters.fn.extend({
        even: function(){
            return this.map(function(index){
                if(index % 2 == 0){
                    return this;
                }
            });
        },
        odd: function(){
            return this.map(function(index){
                if(index % 2 == 1){
                    return this;
                }
            });
        },
        every_third_from: function(from){
            if(!from || from % 3 == 0){
                return this.map(function(index){
                    if(index % 3 == 0){
                        return this;
                    }
                });
            }else if( from % 3 == 1){
                return this.map(function(index){
                    if(index % 3 == 1){
                        return this;
                    }
                });
            }else{
                return this.map(function(index){
                    if(index % 3 == 2){
                        return this;
                    }
                });
            }
        }
    });
    
})(jQuery, RecordsOfExistence.Views);
