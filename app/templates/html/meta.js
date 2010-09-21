jQuery.templates[jQuery.env("templates")+"html/meta.tmpl"]=
function anonymous(jQuery, $data, $i) {
    var $ = jQuery, T = [], asArray = arguments.length > 3 ? arguments[3] : false, partial = arguments.length > 4 ? arguments[4] : false, _ = $.tmpl.filters;
    _.data = T.data = $data;
    _.$i = T.index = $i || 0;
    T._ = null;
    function pushT(value, _this, encode) {
        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
    }
    with ($.extend(true, {}, _, $data)) {
        try {
            T.push("<meta \tcontent=\"en-us\" \n\t\thttp-equiv=\"Content-Language\"/>\n<meta \tcontent=\"text/html; charset=utf-8\" \n\t\thttp-equiv=\"Content-Type\"/>\n<meta \tname=\"keywords\"\n\t\tcontent=\"records of existence, records, records label, albums,\n\t\t         releases, ep, lp, cd, hand printed, limited edition,\n\t\t\t\t vox populi, music, artists, musicians, thenurbs, nagato,\n\t\t\t\t hovel, shepherstown\"/>\n<meta \tname=\"description\"\n\t\tcontent=\"Records of Existence is an artist run label of \n                 underground independent artists.  We specialize \n                 in doing limited edition Hand-Printed and \n                 Hand-Assembled releases to make the release \n                 as unique as the artists.\" />\n<meta   name=\"google-site-verification\" \n        content=\"TXTKjI0eSKAeIALYTE0lW3j5zTzeEN2wgBJmR9RR3hw\" />");
        }
        catch (e) {
            if ($.tmpl.debug) {
                T.push(" " + e + " ");
            } else {
                T.push("");
            }
        }
    }
    _.data = null;
    return asArray ? T : T.join("");
}
