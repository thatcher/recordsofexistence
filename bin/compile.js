/**
 * @author thatcher
 */
//env-js is our simulated browser environments so we can use all of
//our favorite client side libraries and tricks.  Right now
//the html parser is too big for the rhino compiler to optimize.
load('lib/env.rhino.js');
load('lib/jquery.js');
load('plugins/jquery.tmpl.js');
load('plugins/tmpl.blocks.js');
load('plugins/tmpl.extend.js');
load('plugins/tmpl.filters.js');
load('plugins/tmpl.lorem.js');
load('plugins/tmpl.switch.js');

var templates = [
	'html/analytics',
	'html/base',
	'html/footer',
	'html/forms/artist',
	'html/forms/event',
	'html/forms/news',
	'html/forms/paypal',
	'html/forms/pressing',
	'html/forms/release',
	'html/header',
	'html/links',
	'html/meta',
	'html/pages/artists',
	'html/pages/artist',
	'html/pages/contact',
	'html/pages/error',
	'html/pages/events',
	'html/pages/home',
	'html/pages/news',
	'html/pages/release',
	'html/pages/releases',
	'html/scripts',
	'html/stylesheets',
	'html/templates'
];

$(templates).each(function(i, id){

    console.log('compiling %s', id);
    $.ajax({
        async:false,
        url: 'http://localhost:8080/app/templates/'+id+'.tmpl',
        dataType:'text',
        success: function(text){
            $.templates[id] = $.tmpl( text );
        },
        error: function(xhr, status, e){
            $.templates[id] = $.tmpl( xhr.responseText );
        }
    });
	
	Envjs.writeToFile(
		'jQuery.templates[jQuery.env("templates")+"'+id+'.tmpl"]='+ $.templates[id].toString(), 
		'file:///opt/tomcat/webapps/recordsofexistence/app/templates/'+id+'.js'
	);
});
            
        

	
