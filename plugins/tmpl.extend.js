/**
 * @author thatcher
 */

(function($){


jQuery.extend(jQuery.tmpl.tags,{
    extend: {
        _default: [ null, null ],
        prefix: "\n\
        T._ = $1;\n\
        if( T._.match('#') && (!partial||T.include)){\n\
            if(!( T._ in $.templates )){\n\
                /*pre-compile template*/\n\
                $.templates[ T._ ] = $.tmpl($( T._ ).text());\n\
            }\n\
        }else{\n\
            if(!( T._ in $.templates) && (!partial||T.include)){\n\
                $.ajax({\n\
                    url: T._,\n\
                    type: 'GET',\n\
                    dataType: 'text',\n\
                    async: false,\n\
                    success: function(text){\n\
                        $.templates[ T._ ] = $.tmpl( text );\n\
                    },\n\
                    error: function(xhr, status, e){\n\
                        $.templates[ T._ ] = $.tmpl( xhr.responseText );\n\
                    }\n\
                });\n\
            }\n\
        }\n\
        /*finally render partial*/\n\
		if(!partial||T.include){\n\
	        Array.prototype.push.apply(T, $.templates[ T._ ].\n\
				call(this, jQuery, $.extend({},$data,this), 0, true, false) );\n\
		}\n\
        T._ = null;\n\
        "
    }
});

// extend may also work basically like what most folks would think of
// as 'include'
jQuery.tmpl.tags.include = {
	_default: jQuery.tmpl.tags.extend._default,
    prefix: "\n\
		T.include = true;\n\
		"+jQuery.tmpl.tags.extend.prefix
};


})(jQuery);
