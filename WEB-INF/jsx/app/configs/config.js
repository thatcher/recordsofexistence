/**
 * Records of Existence @VERSION - 
 *
 * Copyright (c) 2008-2009 Records of Existence
 * @author thatcher
 */
var RecordsOfExistence = {
	Models:{},
	Views:{},
	Controllers:{},
	Services:{},
    Metadata:{}
};
(function($){
 	
   $.config("ioc", [
            {scan:"RecordsOfExistence.Models",    factory:$.mvc_scanner}, 
            {scan:"RecordsOfExistence.Views",     factory:$.mvc_scanner},
            {scan:"RecordsOfExistence.Services",  factory:$.mvc_scanner},
            //
            //  This is a built in proxy controller for server-side claypool.  It makes it easy 
            //  to consume resources through ajax via other domains.  The url and the rewrite are
            //  required parameter, and you can optionally override the returned contentType
            //  set in the response headers.
	        { id:"#webProxyService",    clazz:"Claypool.Server.WebProxyServlet", 
	            options:[{
	                proxyHost:"localhost",
	                rewriteMap:
	                    [{ urls:         "fooblah",
	                       rewrite:      "fooblahblah",
	                       contentType:  "text/xml"
	                     }]
	            }]
	        }
            
    ]);
})(jQuery, RecordsOfExistence);
    
