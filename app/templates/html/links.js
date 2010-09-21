jQuery.templates[jQuery.env("templates")+"html/links.tmpl"]=
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
            T.push("<!--link \ttitle=\"jquery-claypool\" \n\t\thref=\"describe\" \n\t\ttype=\"application/opensearchdescription+xml\" \n\t\trel=\"search\"/-->\n\t\t\n<link \trel=\"shortcut icon\" \n\t\thref='");
            pushT($.env("root"), this);
            T.push("images/favicon.ico' />\n\t\t");
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
