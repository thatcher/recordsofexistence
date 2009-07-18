/**
 * @author thatcher
 */

(function($){ 
    
   $.config("logging",[
        { category:"RecordsOfExistence",               level:"INFO" },
        { category:"RecordsOfExistence.Models",        level:"INFO" },
        { category:"RecordsOfExistence.Views",         level:"INFO" },
        { category:"RecordsOfExistence.Controllers",   level:"INFO" },
        { category:"RecordsOfExistence.Service",       level:"INFO" },
        { category:"Claypool.Router",                  level:"WARN"  },
        { category:"Claypool.MVC",                     level:"WARN" },
        { category:"root",                             level:"WARN"  }
    ]);     
	
})(jQuery);