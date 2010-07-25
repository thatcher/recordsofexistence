/**
 *
 * Copyright (c) 2008-2009 RecordsOfExistenceJS
 *
 */
(function($){

    var log;
    
    $.filters([{

        id        : "#requestResponseParamFilter",
        target    : "RecordsOfExistence.Services.*",
        before    : "([a-z]*)",
        advice    : function(event, response){
            log = log||$.logger('RecordsOfExistence.Filters');
            log.debug( 'Adding normalized event state to event scoped model' );
            var params = event.params( 'parameters' );
            
            if('admin' in params){
                log.info('userPrincipals %s',event.request.userPrincipal);
                if( !event.request.userPrincipal ){
                    event.response.headers =  {
                        status:   302,
                        "Location": Packages.com.google.appengine.api.users.
                            UserServiceFactory.
                                getUserService().
                                createLoginURL(event.request.requestURI+'?admin')
                    }
                }else{
                    event.m({ admin: true });
                }
            }else{
                event.m({ admin: false });
            }
        }
        
    },{

        id        : "#contentNegotiationFilter",
        target    : "RecordsOfExistence.Views.*",
        around    : "(write)",
        advice    : function(invocation){

            var model = invocation.arguments[0],
                event = invocation.arguments[1],
                view =  invocation.object;
                
            log = log||$.logger('RecordsOfExistence.Filters');
            log.debug('Intercepted call to render');
                
            switch( event.params('fo') ){
                case 'json':
                    event.response.headers['Content-Type']='text/plain; charset=utf-8';
                    return  $.json(model, null, '    ');
                    break;//do not proceed
                case 'xml':
                    event.response.headers['Content-Type']='application/xml; charset=utf-8';
                    return $.x({x:model});
                    break;//do not proceed
                default:
                    if('template' in model)
                        model.template += '?'+new Date().getTime();
                    return invocation.proceed();
            }    
        }
    }]);

})(jQuery);

