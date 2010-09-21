/**
 * @author thatcher
 */
load('lib/env.rhino.js');
load('lib/jquery.js');
load('plugins/jquery.json.js');

var cache = {};

console.log('syncing data');
$.ajax({
    async:false,
    url: 'http://localhost:8080/sitemap.xml',
    dataType:'xml',
    success: function(xml){
        $('loc', xml).each(function(i,location){
			var url = $(location).text();
			console.log('syncing data for %s', url);
			$.ajax({
				async:false,
				url: url.replace('www.recordsofexistence.com', 'localhost:8080'),
				dataType: 'json',
				success: function(data){
					cache[url.replace('http://www.recordsofexistence.com', '')] = data;
				},
				error: function(xhr, status, e){
					console.log('failed (%s:%s) to load data for url %s', xhr.status, status, url);
				}
			});
		});
    },
    error: function(xhr, status, e){
        console.log('Error syncing data %s', e);
    }
});
	
Envjs.writeToFile(
	'RecordsOfExistence.Data = '+ 
		$.js2json(cache).replace('http://localhost:8080','www.recordsofexistence.com','g'), 
	'file:///opt/tomcat/webapps/recordsofexistence/dist/data.js'
);
            
        

	
