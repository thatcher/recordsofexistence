load('lib/env.rhino.js');
load('lib/jquery.js');

jQuery(function($){
	var scripts = '';
	$('head > script[type=text/javascript]').each(function(i, script){
		
		console.log('loading: %s', script.src);
		$.ajax({
			url: script.src,
			async: false,
			dataType: 'text',
			success: function(text){
				scripts += '\n'+text;
			},
			error: function(){
				console.log('Error! Could not load script: %s', script.src);
			}
		});
		
	});
	
	Envjs.writeToFile(
		scripts, 
		'file:///opt/tomcat/webapps/recordsofexistence/dist/app.js'
	);
});

window.location = 'http://localhost:8080/';