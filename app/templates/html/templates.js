jQuery.templates[jQuery.env("templates")+"html/templates.tmpl"]=
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
            T.push("\n<script src='");
            pushT($.env("root") + "app/templates/html/analytics.js", this);
            T.push("'   type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/base.js", this);
            T.push("'     \t type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/footer.js", this);
            T.push("'      type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/header.js", this);
            T.push("'      type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/links.js", this);
            T.push("'     \t type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/meta.js", this);
            T.push("'     \t type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/scripts.js", this);
            T.push("'     type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/stylesheets.js", this);
            T.push("' type=\"text/javascript\" ></script>\n\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/artist.js", this);
            T.push("'   type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/event.js", this);
            T.push("'    type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/news.js", this);
            T.push("' \ttype=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/paypal.js", this);
            T.push("'   type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/pressing.js", this);
            T.push("' type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/forms/release.js", this);
            T.push("'  type=\"text/javascript\" ></script>\n\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/artist.js", this);
            T.push("'   type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/artists.js", this);
            T.push("'  type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/contact.js", this);
            T.push("'  type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/error.js", this);
            T.push("'    type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/events.js", this);
            T.push("'   type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/home.js", this);
            T.push("'     type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/news.js", this);
            T.push("'     type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/release.js", this);
            T.push("'  type=\"text/javascript\" ></script>\n<script src='");
            pushT($.env("root") + "app/templates/html/pages/releases.js", this);
            T.push("' type=\"text/javascript\" ></script>");
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
