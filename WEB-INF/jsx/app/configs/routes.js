/**
 * @author thatcher
 */

(function($){
   $.config("mvc",{
        "hijax:server" : [{
            id:"#recordsofexistence-server-routes",
            hijaxMap:
              [{ urls :"/jsx/$",    	     controller:"#homeService"},
              { urls :"/artists$",    	     controller:"#artistsService"},
              { urls :"/artist/<:id(.*):>",  controller:"#artistsService"},
              { urls :"/contact$",    	     controller:"#contactService"},
              { urls :"/error$",    	     controller:"#errorService"},
              { urls :"/events$",    	     controller:"#eventsService"},
              { urls :"/event/<:id(.*):>",    	 controller:"#eventsService"},
              { urls :"/home$",    	         controller:"#homeService"},
              { urls :"/news$",    	         controller:"#newsService"},
              { urls :"/news/<:id(.*):>",    	 controller:"#newsService"},
              { urls :"/releases$",    	     controller:"#releasesService"},
              { urls :"/release/<:id(.*):>",     controller:"#releasesService"}]
           }]   
    });
})(jQuery);
