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
            'file:///opt':              'dev.server',
            'file:///base':             'prod.server',
            'http://localhost':         'dev.client',
            'recordsofexistence.com':   'prod.client'
        },
	    defaults:{
            root:'/',
			context_dir:cwd,
			templates:'app/templates/',
            initialdata:'http://localhost:8080/data/',
            data:'http://localhost:8080/data/',
            host:'sdb.amazonaws.com',
            dataType:'text',
            db:'jQuery.gdb',
            dbclient:'direct',
            dbconnection:{'default':{
                /*
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
                root:'/',
	            templates:'http://recordsofexistence.appspot.com/app/templates/',
                initialdata:'http://recordsofexistence.appspot.com/data/',
	            //data:'http://roe-data.s3.amazonaws.com/'
                data:'http://roe-prod.s3.amazonaws.com/'
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   DEVELOPMENT CONFIGURATION   -
	    //______________________________________________________________________________________//
	    dev:{
	        server:{
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
    
