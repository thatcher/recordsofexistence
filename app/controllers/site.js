(function($,$C){
	
	var log,
		hash = '',
		inaction = false,
		cache = RecordsOfExistence.Data||{},
		guid = $.uuid();
	
	$C.Site = function(options){
		$.extend(true, this, options);
		log = $.logger('RecordsOfExistence.Controllers.Site');
	};
	
	$.extend($C.Site.prototype, {
		handle: function(event){
			var _this = this,
				url = event.params('url');
			log.debug('handling event for url %s', url);
			inaction = true;	
			if(url.match('admin')){
				cache = {};
			}else if(cache[url]){
				success(url, cache[url]);
				event.m(cache[url]).render(function(){
					document.location.hash = hash = "#"+url;
				});
				return;
			}
			$.ajax({
				url: url + (url.match('\\?')?"&"+guid:"?"+guid),
				dataType: 'json',
				success: function(data){
					cache[url] = data;
					success(url, data);
					event.m(data).render(function(){
						document.location.hash = hash = "#"+url;
					});
				},
				error: function(xhr, status, e){
					inaction = false;
					log.error('failed to load data for url %s', url).
						exception(e);
				}
			});
		},
		submit: function(event){
			var _this = this,
				url = event.params('url');
			log.debug('handling event for url %s', url)	;	
			inaction = true;
			if(url.match('admin')){
				cache = {};
			}else if(cache[url]){
				success(url, cache[url]);
				event.m(cache[url]).render(function(){
					document.location.hash = hash = "#"+url;
				});
				return;
			}
			$.ajax({
				url: url,
				dataType: 'json',
				type: event.target.method||'GET',
				data: event.params(),
				success: function(data, status, xhr){
					cache[url] = data;
					success(url, data);
					document.location.hash = hash = "#"+url;
				},
				error: function(xhr, status, e){
					inaction = false;
					log.error('failed to load data for url %s', url).
						exception(e);
				}
			});
		},
		go: function(){
			var a = document.location.hash,
				_this = this;
			if(hash !== a  && !inaction){	
				hash = a;
				a = $('<a href="'+a.substring(1)+'" style="display:none">'+a+'</a>');
				$(document.body).append(a);
				setTimeout(function(){
					a.click().remove();
				}, 100 );
			}
		}
	});
	
	var success = function(url, data, status, xhr){
			inaction = false;
			cache[url] = data;
			log.debug('posted form for url %s rendering %s', url);
			url = data.request.requestURI + 
				(data.request.queryString ? 
					"?"+data.request.queryString.replace('&fo=json','') : "");
			log.debug('resulting url %s', url);
	};
	
	
})(jQuery, RecordsOfExistence.Controllers);