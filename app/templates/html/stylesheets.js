jQuery.templates[jQuery.env("templates")+"html/stylesheets.tmpl"]=
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
            T.push("<!--Print Stylesheets-->\n<link \thref='");
            pushT($.env("root") + "css/blueprint/print.css", this);
            T.push("' \n\t\trel=\"stylesheet\"         \n\t\ttype=\"text/css\" \n\t\tmedia=\"print\"/>\n\n<!--Screen Stylesheets-->\t\t\n\n<link \thref='");
            pushT($.env("root") + "css/blueprint/screen.css", this);
            T.push("'   \n\t\ttype=\"text/css\" \n\t\tmedia=\"screen, projection\"\n\t\trel=\"stylesheet\" />\n<link   href='");
            pushT($.env("root") + "css/sprite.css", this);
            T.push("'   \n        type=\"text/css\" \n        media=\"screen, projection\"\n        rel=\"stylesheet\" />\n<link   href='");
            pushT($.env("root") + "css/site.css", this);
            T.push("' \n        type=\"text/css\" \n        rel=\"stylesheet\" />\n\n\n<!--Quirks Mode Stylesheets-->\t\t\t\t\n<!--[if lt IE 8]>\n<link \thref=\"/css/blueprint/ie.css\"\n\t\ttype=\"text/css\" \n\t\tmedia=\"screen, projection\"\n\t\trel=\"stylesheet\" />\n <![endif]-->\n");
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
