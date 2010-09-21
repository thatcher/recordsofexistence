/**
 * @author thatcher
 */
(function(){
    
    jQuery.tmpl.blocks = {};

    jQuery.extend(jQuery.tmpl.tags,{

block: {
    
    _default: [ null, null ],
    prefix: "\n\
	(function(){\n\
		var name = '$1',\n\
			tmp, diff1, diff2;\n\
		if(!T.blocks){\n\
			T.blocks = $.tmpl.blocks;\n\
		}\n\
		if(!T.blocks[name]){\n\
			T.blocks[name] = {start:T.length};\n\
		}\n\
        var B = (function(){\n\
           	var T = [];\n\
            function pushT(value, _this, encode){\n\
                return encode === false ? \n\
                    T.push(typeof value ==='function'?value.call(_this):value) : \n\
                    T.push($.encode(typeof( value )==='function'?value.call(_this):value));\n\
            }\n",
    suffix:"\n\
			return T;\n\
		})();\n\
		diff1 = T.blocks[name].end ? \n\
			T.blocks[name].end - T.blocks[name].start : 0;\n\
		Array.prototype.splice.apply(T,[\n\
			T.blocks[name].start+1,\n\
			diff1 \n\
		].concat(B));\n\
		T.blocks[name].end = T.blocks[name].start + B.length;\n\
		diff2 = T.blocks[name].end - T.blocks[name].start;\n\
		for(tmp in T.blocks){\n\
			if(T.blocks[tmp].start > T.blocks[name].start){\n\
				T.blocks[tmp].start += diff2 - diff1;\n\
				T.blocks[tmp].end += diff2 - diff1;\n\
			}\n\
		}\n\
	})();\n\
		"
	/*
	prefix: "\n\
        T.push('<!--block-$1--><!--endblock-$1-->');\n\
        for(var b=0;b<T.length;b++){\n\
            if(T[b].match('<!--block-$1-->')){\n\
                var r = /<\!--block-$1-->.*<\!--endblock-$1-->/,\n\
					block = '$1';\n\
                T[b] = T[b].replace(/[\\r\\n]/g, \" $n \").replace(r, (function(){\n\
                    var T = ['<!--block-$1-->'],\n\
                        end = '<!--endblock-$1-->';\n\
                    function pushT(value, _this, encode){\n\
                        return encode === false ? \n\
                            T.push(typeof value ==='function'?value.call(_this):value.replace(/ \\$n /g, '\\n')) : \n\
                            T.push($.encode(typeof( value )==='function'?value.call(_this):value).replace(/ \\$n /g, '\\n'));\n\
                    }\n",
    suffix:"\n\
                    T.push(end);\n\
					jQuery.tmpl.blocks[block] = T.join('').replace(/ \\$n /g, '\\n');\n\
                    return jQuery.tmpl.blocks[block];\n\
                })()).replace(/ \\$n /g, '\\n');\n\
                break;\n\
            };\n\
        }"
	*/
}

});

})();