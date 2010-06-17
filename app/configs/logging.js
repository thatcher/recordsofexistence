/**
 * @author thatcher
 */

(function($){ 
    
   $.logging([
        { category:"RecordsOfExistence",               level:"INFO" },
        { category:"RecordsOfExistence.Filters",       level:"INFO" },
        { category:"RecordsOfExistence.Models",        level:"DEBUG" },
        { category:"RecordsOfExistence.Views",         level:"INFO"  },
        { category:"RecordsOfExistence.Controllers",   level:"INFO"  },
        { category:"RecordsOfExistence.Services",      level:"DEBUG" },
        { category:"Claypool.Router",                  level:"INFO"  },
        { category:"Claypool.MVC",                     level:"INFO"  },
        { category:"Claypool.Server",                  level:"INFO"  },
        { category:"Claypool.Models",                  level:"INFO" },
        { category:"Claypool",                         level:"WARN"  },
        { category:"Claypool.Services",                level:"DEBUG"  },
        { category:"jQuery.plugins.gdb",               level:"INFO" },
        { category:"jQuery",                           level:"INFO"  },
        { category:"root",                             level:"INFO"  }
    ]);     
	
})(jQuery);