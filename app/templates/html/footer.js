jQuery.templates[jQuery.env("templates")+"html/footer.tmpl"]=
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
            T.push("<div style='text-align:center;'>\n\t<em class='small'>\n\t&copy; 2009-2010 recordsofexistence\n\t</em>\n</div>\n<div id='copyright' style='text-align:center;'>\n    <img id=\"claypool-logo\" \n         src='");
            pushT($.env("root") + "images/claypool-button.png", this);
            T.push("' \n         alt=\"jquery-claypool\" \n         title=\"This site uses jquery-claypool\" \n         width=\"80\" \n         height=\"15\"\n         style='float:left;'/>\n    <img id=\"blueprint-logo\" \n\t\t src='");
            pushT($.env("root") + "images/button.png", this);
            T.push("' \n         alt=\"blueprint\" \n\t     title=\"This site uses blueprint-css\" \n\t\t width=\"80\" \n\t\t height=\"15\"\n         style='float:right;'/> \n</div>\n\n");
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
