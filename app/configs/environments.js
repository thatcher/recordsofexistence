/**
 * @author thatcher
 */
(function($){
    //dummy aws settings if none provided
    //AWS=AWS||{};
    
	//-------------------------------------------------------------------------------------//
	//  -   ENVIRONMENTAL CONFIGURATION   -
	//______________________________________________________________________________________//
	$.env({
        automap:{
            'file:///opt':          	'dev.server',
            'file:///base':         	'prod.server',
            'http://localhost':     	'dev.client',
            'recordsofexistence.com':   'prod.client',
			'4.latest.recordsofexistence.appspot.com':'v4.client',
			'3.latest.recordsofexistence.appspot.com':'v3.client',
			'2.latest.recordsofexistence.appspot.com':'v2.client'
        },
	    defaults:{
            root:'/',
			precompile: false,
			preload: false,
			minify: false,
			templates:'http://localhost:8080/app/templates/',
            initialdata:'http://localhost:8080/data/',
			data:'http://roe-prod.s3.amazonaws.com/',
            dataType:'text',
            db:'jQuery.gdb',
            dbconnection:{'default':{
                /*
	            host:'sdb.amazonaws.com',
                endpoint:'https://sdb.amazonaws.com/',
                accessKeyId:AWS.accessKeyId,
                secretKey:AWS.secretKey,
                method:'POST'
                */
                //raw:true //returns raw aws response
            }}
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   APPENGINE CONFIGURATION   -
	    //______________________________________________________________________________________//
	    prod:{
	        server:{
				precompile: true,
				preload: false,
				minify: true,
            	dbclient:'direct',
                root:'/',
	            templates:'http://www.recordsofexistence.com/app/templates/',
                initialdata:'http://www.recordsofexistence.com/data/',
                data:'http://roe-prod.s3.amazonaws.com/'
	        },
			client:{
				data:'http://roe-prod.s3.amazonaws.com/',
	            templates:'http://www.recordsofexistence.com/app/templates/'
			}
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   DEVELOPMENT CONFIGURATION   -
	    //______________________________________________________________________________________//
	    dev:{
	        server:{
            	dbclient:'direct'
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   TEST CONFIGURATION   -
	    //______________________________________________________________________________________//
	    test:{
	        server:{

	        }
	    }
	}); 
    
})(jQuery);
    
