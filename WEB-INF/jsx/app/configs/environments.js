/**
 * @author thatcher
 */
(function($){

	//-------------------------------------------------------------------------------------//
	//  -   ENVIRONMENTAL CONFIGURATION   -
	//______________________________________________________________________________________//
	$.config("env", {
	    defaults:{
            root:'/recordsofexistence/',
			context_dir:cwd,
            app_dir:'/WEB-INF/jsx/',
			templates:'../../templates/',
            data:'../../data/',
	        rest: {
	            SERVICE: "Any",
	            URL: "/rest",
	            AJAX: "jQuery"
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   APPENGINE CONFIGURATION   -
	    //______________________________________________________________________________________//
	    appengine:{
	        server:{
                root:'/',
	            templates:'http://recordsofexistence.appspot.com/templates/',
	            data:'http://recordsofexistence.appspot.com/data/'
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   DEVELOPMENT CONFIGURATION   -
	    //______________________________________________________________________________________//
	    dev:{
	        server:{
	            db: {
	                DRIVER 	: "org.sqlite.JDBC",
	                PROVIDER:"JDBC",
	                DIALECT:"SQLite",
	                HOST:"jdbc:sqlite:recordesofexistence.db",
	                NAME:"example",
	                USER:"sa",
	                PASS:""
	            }
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   PRODUCTION CONFIGURATION   -
	    //______________________________________________________________________________________//
	    prod:{
	        server:{
	            db: {
	                DRIVER 	: "com.mysql.jdbc.Driver",
	                PROVIDER:"JDBC",
	                DIALECT:"MySQL",
	                HOST:"jdbc:mysql://127.0.0.1:3306/recordesofexistence",
	                USER:"example",
	                PASS:"example"
	            }
	        }
	    },
	    //-------------------------------------------------------------------------------------//
	    //  -   TEST CONFIGURATION   -
	    //______________________________________________________________________________________//
	    test:{
	        server:{
	            db: {
	                DRIVER 	: "org.sqlite.JDBC",
	                PROVIDER:"JDBC",
	                DIALECT:"SQLite",
	                HOST:"jdbc:sqlite:recordesofexistence-tests.db",
	                NAME:"example",
	                USER:"sa",
	                PASS:""
	            }
	        }
	    }
	}); 
    
})(jQuery);
    
