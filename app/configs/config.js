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
	Data:{}
};
(function($){
 	
    $.scan([
        "RecordsOfExistence.Models",    
        "RecordsOfExistence.Views",     
        "RecordsOfExistence.Services", 
        "RecordsOfExistence.Controllers",
        "Claypool.Services",
        "GAE.Services"
    ]);
    
})(jQuery, RecordsOfExistence);
    
