/**
 * @author thatcher
 */
(function($, $V){
    
    var log,
		templates;
    
    $V.Site = function(options){
        $.extend(true, this, options);
        log = $.logger('RecordsOfExistence.Views.Site');
		templates = {};
    };
    
    
    $.extend($V.Site.prototype, {
        write: function(model){
			var rendered = '';
            log.info("Rendering html template %s ", model.template);
           	$.render({
                async:false,
                url: model.template,
                templateData: model,
                success: function(response){
                    log.debug("Rendered template");
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
        },
		update: function(model){
			log.debug('updating view');
			//basic 'partial' rendering
			var tmpl;
           	$.render({
                async:false,
                url: model.template,
                templateData: model,
				partial: true,
				asArray: true,
                success: function(response){
                    log.debug("Rendered template");
                    tmpl = response;
                },
                error: function(xhr, status, e){
                    log.error('failed to render : %s ', model.template).
                        exception(e);
                    throw('Error Rendering template '+ model.template);
                }
            });
	        log.info("Finsihed rendering html template %s ", model.template);
			
			document.title = tmpl.slice(tmpl.blocks.title.start,tmpl.blocks.title.end).
				join('');
			$('#main').empty().append(tmpl.slice(tmpl.blocks.main.start,tmpl.blocks.main.end).
				join(''));
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
