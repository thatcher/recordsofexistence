/**
 * <: @VERSION@ :>
 * 
 * Copyright (c) 2008-2009 Chris Thatcher (claypooljs.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * jQuery.jsPath E4X Templates  
 * 
 * A Django Style Templating language leveraging the 
 * power of e4x and jQuery and jQuery.jsPath
 * 
 *         depends on jquery-jspath 
 * ( http://github.com/thatcher/jquery-jspath )
 */
 
(function($, _){
 
    var cache = {},
		stateMapCache = {},
		blockMapCache = {},
		log;
	
    _.e4x = function(o){
        return new XMLList(_.x(o));
    };
    
    _.fn.e4x = function(){
        return new XMLList(_(this).x());
    };
    
    $.e4x = function(url, model, is_root){
        var e4x, nullfunction = function(){return this;};
        log = $.logger?$.logger('jQuery.E4X'):{
            debug:nullfunction,
            info:nullfunction,
            warn:nullfunction,
            error:nullfunction,
            exception:nullfunction
        };
        url = (  $.env ? $.env('templates') : '' ) + url;
		if(!cache[url]){
            log.info('loading template %s', url);
	        $.ajax({
	            url: url,
	            type: "GET",
	            dataType:"text",
	            async:false,
	            success: function(text){
                    text = text+'';
                    log.info('loaded %s', url).
                        debug('template text looks like \n\n%s\n\n', 
                            (text).substring(0, text.length<50?text.length:50));
	                var base, block, blockMap = {};
					if(is_root){
						//we need to render out the block hierarchy
						//and cache the result so we don't waste time on each 
						//actual render with static block logic
						cache[url] = e4x_eval(text, blockMap, model, false).toString();
					}else{
						cache[url] =  e4x_eval(text, blockMap, model, false);
					} 
					blockMapCache[url] = blockMap;
					
					//causes template to be added to file monitor
					//try{load(url)}catch(e){};           
	            }, 
				error:function(xhr, status, e){
                    log.error('error loading %s (%s)', url, status).
                        exception(e);
	                cache[url] = e4x_eval("<e4x>"+
                            "<h3>Error Loading: "+url+"</h3>"+
                        "</e4x>", 
                        null, model, false).toXMLString();  
				}
	        });  
		}

	    return is_root ? 
            e4x_eval(cache[url], blockMapCache[url], model, true) :
            cache[url];
    };
    
    var e4x_eval = function(text, blockMap, model, deep){
        text = text.replace(/\n/,'','g');
		var xml_settings = XML.settings();
        XML.ignoreWhitespace = true;
		
    	var extend = function(url){
    		return $.e4x(url, model, deep);
    	}
        var _$ = model;
        
        //replace {{_: and }}: with {"{ and }"} respectively so that
        //we evalute truely dynamic content on the second pass
        //of the cached template
        if(!deep){
            text = text.replace(/(\{\{_\:|\}\}\:)/g, function(){
		        return (arguments[0].indexOf('{')>-1)?'{"{':'}"}';
		    });
        }
        
        var evaluated;
		evaluated = eval("(function(){"+
            "return new XMLList("+text+");"+
        "})();"); 
					
		//all blocks are treated in document order
		var blocks = evaluated..block,
			compiled,
			rendered,
			parent,
			block, id; 
			
		if(deep){
			//first loop through and make sure we know
			//which blocks are part of the final cascade
			for each(block in blocks){
				if( !block.@id ){
					//if it doesn't have an id it's not
					//a valid block and we throw it out
					//with the bath water
					delete block;
				}else{
					id = block.@id .toString();
					if(!blockMap[id]){
						//store the default block
						blockMap[id] = block.*.copy();
						delete block.*;
					}else{
						//replace the default block
						blockMap[id] = block.*.copy();
						delete block.*;
						delete block;
					}
				}
			}
			//now loop through the final remaining blocks
			if(evaluated.elements().length() > 0){
				compiled = evaluated.*[0].copy();
				blocks = compiled..block;
				delete evaluated;
				for each(block in blocks){
					id = block.@id. toString();
					//step 2: check block
					if(!blockMap[id]){
						//step 2: deleting block 
						delete block;
					}
					//step 2: replacing block
					compiled..block.(@id == id)[0] = blockMap[id]||'';
				}
				
				//finally replace each <e4x> element with it's children
				for each(var e4x in compiled..e4x){
					e4x = e4x.children();
				}
				
				rendered = compiled.copy();
				delete compiled;
			}
			
		}
		rendered = rendered||evaluated;
		XML.setSettings(xml_settings);
		return rendered;
		
    };

})(jQuery, jsPath);