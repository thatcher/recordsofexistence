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
	    defaults:{
            root:'/',
			context_dir:cwd,
			templates:'app/templates/',
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
	    appengine:{
	        server:{
                root:'/',
	            templates:'http://recordsofexistence.appspot.com/app/templates/',
                //data:'http://recordsofexistence.appspot.com/app/data/'
	            data:'http://roe-data.s3.amazonaws.com/'
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
	    //  -   PRODUCTION CONFIGURATION   -
	    //______________________________________________________________________________________//
	    prod:{
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
    
