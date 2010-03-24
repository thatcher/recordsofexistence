/**
 * @author thatcher
 */

(function($){

   $.routes({
        "hijax:server": [{
            id: "#recordsofexistence-rest-routes",
            hijaxMap:
                [{ urls :"/rest/$",                                             controller:"#restService"},
                 { urls :"/rest/<:domain(\\w+):>/?$",                           controller:"#restService"},
                 { urls :"/rest/<:domain(\\w+):>/<:id(\\w+):>/?$",              controller:"#restService"}]    
        },{
            id: "#recordsofexistence-admin-routes",
            hijaxMap:
                [
                 { urls :"/admin/|:action|/?$",                                 controller:"#adminService"},
                 { urls :"/admin/|:action|/|:domain|/?$",                       controller:"#adminService"},
                 { urls :"/admin/|:action|/|:domain|/|:id|/?$",                 controller:"#adminService"}] 
        },{
            id: "#recordsofexistence-management-routes",
            hijaxMap:
                [{ urls :"/manage/<:command(\\w+):>(/<:target(\\w+):>)?(/)?$",  controller:"#manageService"}]
        },{
            id:"#recordsofexistence-site-routes",
            hijaxMap:
                [{ urls :"/jsx/$",                controller:"#siteService",    action:"home"},
                 { urls :"/artists$",    	      controller:"#siteService",    action:"artists"},
                 { urls :"/artist/|:id|/?$",      controller:"#siteService",    action:"artist"},
                 { urls :"/contact$",    	      controller:"#siteService",    action:"contact"},
                 { urls :"/events$",    	      controller:"#siteService",    action:"events"},
                 { urls :"/home$",                controller:"#siteService",    action:"home"},
                 { urls :"/news$",    	          controller:"#siteService",    action:"news"},
                 { urls :"/releases$",    	      controller:"#siteService",    action:"releases"},
                 { urls :"/release/|:id|",        controller:"#siteService",    action:"release"},
                 { urls :"/pressings",            controller:"#siteService",    action:"pressings"},
                 { urls :"/pressing/|:id|",       controller:"#siteService",    action:"pressing"}]
        },{
            id:"#recordsofexistence-proxy-routes",
            hijaxMap:
                [{ urls :"/sdb/$",                                              controller:"#sdbProxyService"}]
        }]   
    });
    
})(jQuery);
