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
        { category:"Claypool.Router",                  level:"INFO"  },
        { category:"Claypool.MVC",                     level:"WARN"  },
        { category:"Claypool.Server",                  level:"INFO"  },
        { category:"Claypool.Models",                  level:"INFO" },
        { category:"Claypool",                         level:"WARN"  },
        { category:"jQuery.plugins.gdb",               level:"INFO" },
        { category:"jQuery.E4X",                       level:"INFO"  },
        { category:"jQuery",                           level:"INFO"  },
        { category:"root",                             level:"INFO"  }
    ]);     
	
})(jQuery);