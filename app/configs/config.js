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
	Services:{}
};
(function($){
 	
    $.scan([
        "RecordsOfExistence.Models",    
        "RecordsOfExistence.Views",     
        "RecordsOfExistence.Services",
        "Claypool.Services",
        "GAE.Services"
    ]);
    
})(jQuery, RecordsOfExistence);
    
