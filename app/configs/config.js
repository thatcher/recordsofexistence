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
 	
    $.scan([
        "RecordsOfExistence.Models",    
        "RecordsOfExistence.Views",     
        "RecordsOfExistence.Services",
        "GAE.Services"
    ]);
    
})(jQuery, RecordsOfExistence);
    
