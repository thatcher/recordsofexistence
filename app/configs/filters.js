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
            var params = event.params( 'parameters' ),
				request = event.request;
            
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
			event.m({request: {
				pathTranslated: request.pathTranslated,//
				characterEncoding: request.characterEncoding,//
				servletPath: request.servletPath,// 	/home/
				contentType: request.contentType,//	null
				remoteUser: request.remoteUser,// 	null
				serverPort: request.serverPort,// 	80
				authType: request.authType,// 	null
				//locale: request.locale,// 	en_US
				pathInfo: request.pathInfo,// 	null
				protocol: request.protocol,// 	HTTP/1.1
				contextPath: request.contextPath,// 	
				requestURI: request.requestURI,// 	/home/
				body: request.body,// 	
				requestURL: request.requestURL,// 	http://rhino-for-webapps.appspot.com/home/
				requestedSessionId: request.requestedSessionId,// 	null
				//attributes: request.attributes,// 	[object Object]
				remoteHost: request.remoteHost,// 	68.50.188.253
				contentLength: request.contentLength,// 	-1
				//locales: request.locales,// 	[object Object]
				serverName: request.serverName,// 	rhino-for-webapps.appspot.com
				//parameters: request.parameters,// 	[object Object]
				queryString: request.queryString,// 	null
				//cookies: request.cookies,// 	[Ljavax.servlet.http.Cookie;@33c78b
				remoteAddr: request.remoteAddr,// 	68.50.188.253
				method: request.method// 	GET
				//headers: request.headers// 	[object Object] 
			}});
        }
        
    },{

        id        : "#contentNegotiationFilter",
        target    : "RecordsOfExistence.Views.*",
        around    : "(write)",
        advice    : function(invocation){

            var model = invocation.arguments[0],
                event = invocation.arguments[1],
                view =  invocation.object,
				accept = event.request.headers['Accept'];
                
            log = log||$.logger('RecordsOfExistence.Filters');
            log.debug('Intercepted call to render (%s)', accept);
            
    		//go for a param first
            switch( event.params('fo') ){
                case 'json':
                    event.response.headers['Content-Type']='text/plain; charset=utf-8';
					log.debug('rendering json %s', event.response.headers['Content-Type']);
                    return  $.json(model, null, '    ');
                    break;//do not proceed
                case 'xml':
                    event.response.headers['Content-Type']='application/xml; charset=utf-8';
					log.debug('rendering json %s', event.response.headers['Content-Type']);
                    return $.x({x:model});
                    break;//do not proceed
                default:
					if(accept){
						if(accept.match('json')){
		                    event.response.headers['Content-Type']='text/plain; charset=utf-8';
							log.debug('rendering json %s', event.response.headers['Content-Type']);
		                    return  $.json(model, null, '    ');
						}else if(accept.match('html')){
		                   	if('template' in model)
		                        model.template += '?'+new Date().getTime();
							log.debug('rendering default %s', event.response.headers['Content-Type']);
		                    return invocation.proceed();
						}/*else if(accept.match('xml')){
			                event.response.headers['Content-Type']='application/xml; charset=utf-8';
							log.debug('rendering json %s', event.response.headers['Content-Type']);
		                    return $.x({x:model});
						}*/else{
		                   	if('template' in model)
		                        model.template += '?'+new Date().getTime();
							log.debug('rendering default %s', event.response.headers['Content-Type']);
		                    return invocation.proceed();
						}
					}else{
                   		if('template' in model)
	                        model.template += '?'+new Date().getTime();
						log.debug('rendering default %s', event.response.headers['Content-Type']);
	                    return invocation.proceed();
					}
            }    
        }
    }]);

})(jQuery);

