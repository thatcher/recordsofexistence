jQuery.templates[jQuery.env("templates")+"html/header.tmpl"]=
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
            T.push("<div class=\"column span-7 first\">\n    <a href='");
            pushT($.env("root") + "home", this);
            T.push("'>\n\t    <img \tsrc='");
            pushT($.env("root") + "images/logo.png", this);
            T.push("' \n\t\t\t    alt=\"Records of Existence \" \n                height='80px'/>\n    </a> \n</div> \n<div class=\"column span-15 prepend-top last\" id='global-nav' >\n\t<ul >\n        <li><a href='");
            pushT($.env("root") + "home", this);
            T.push("'>home</a></li> |\n        <li><a href='");
            pushT($.env("root") + "releases", this);
            T.push("'>releases</a></li> | \n        <li><a href='");
            pushT($.env("root") + "artists", this);
            T.push("'>artists</a></li> | \n        <li><a href='");
            pushT($.env("root") + "contact", this);
            T.push("'>contact</a></li>  \n        <!--li>\n        <span id=\"sharethisbutton\">\n            <script type=\"text/javascript\" src=\"http://w.sharethis.com/widget/?tabs=web%2Cpost%2Cemail&amp;charset=utf-8&amp;style=default&amp;publisher=b0f530fc-b206-4fb8-b8a8-478191e675c2&amp;headerbg=%23c20000&amp;linkfg=%23c20000\">\n                    \n            </script>\n        </span>\n        </li-->\n    </ul>\n</div>\n\t");
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
