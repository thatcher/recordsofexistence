/**
 * @author thatcher
 */

(function($){ 
    
   $.logging([
        { category:"RecordsOfExistence",               level:"INFO" },
        { category:"RecordsOfExistence.Filters",       level:"INFO" },
        { category:"RecordsOfExistence.Models",        level:"INFO" },
        { category:"RecordsOfExistence.Views",         level:"INFO"  },
        { category:"RecordsOfExistence.Controllers",   level:"INFO"  },
        { category:"RecordsOfExistence.Services",      level:"INFO" },
        { category:"Claypool.Router",                  level:"WARN"  },
        { category:"Claypool.MVC",                     level:"WARN"  },
        { category:"Claypool.Server",                  level:"WARN"  },
        { category:"Claypool.Models",                  level:"WARN" },
        { category:"Claypool",                         level:"WARN"  },
        { category:"Claypool.Services",                level:"WARN"  },
        { category:"jQuery.plugins.gdb",               level:"INFO" },
        { category:"jQuery",                           level:"INFO"  },
        { category:"root",                             level:"WARN"  }
    ]);     
	
	//$.tmpl.debug = true;
	
})(jQuery);