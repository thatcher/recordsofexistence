jQuery.templates[jQuery.env("templates")+"html/scripts.tmpl"]=
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
            T.push("\n<!-- \n/**\n *  The common libraries and plugins\n *  may be useful to the client as well\n *  so we simply include them from the \n *  public server path\n */ -->\n\t\n");
            if ($.env("minify")) {
                T.push(" \n<script src='");
                pushT($.env("root") + "dist/app.min.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n");
            } else {
                T.push("\n<script src='");
                pushT($.env("root") + "lib/firebug/firebug.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.js", this);
                T.push("'        \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.claypool.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "lib/jquery.livequery.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "plugins/jquery.json.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/jquery.tmpl.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.blocks.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.extend.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.filters.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/tmpl.switch.js", this);
                T.push("'   type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "plugins/creole.js", this);
                T.push("'   \t\ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/configs/config.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/environments.js", this);
                T.push("'  type=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/logging.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/configs/routes.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/models/artists.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/events.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/news.js", this);
                T.push("'     \t\ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/pressings.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/models/releases.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/views/site.js", this);
                T.push("'     \t\ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/controllers/site.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n<script src='");
                pushT($.env("root") + "app/services/site.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "app/boot/client.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n<script src='");
                pushT($.env("root") + "scripts/admin.js", this);
                T.push("'     \ttype=\"text/javascript\" ></script>\n\n");
                if ($.env("preload")) {
                    T.push("\n<script src='");
                    pushT($.env("root") + "dist/data.js", this);
                    T.push("'     \ttype=\"text/javascript\" ></script>\n");
                }
                T.push("\n\n");
                if ($.env("precompile")) {
                    T.push("\n");
                    T.include = true;
                    T._ = $.env("templates") + "html/templates.tmpl";
                    if (T._.match("#") && (!partial || T.include)) {
                        if (!(T._ in $.templates)) {
                            $.templates[T._] = $.tmpl($(T._).text());
                        }
                    } else {
                        if (!(T._ in $.templates) && (!partial || T.include)) {
                            $.ajax({url:T._, type:"GET", dataType:"text", async:false, success:function (text) {
                                $.templates[T._] = $.tmpl(text);
                            }, error:function (xhr, status, e) {
                                $.templates[T._] = $.tmpl(xhr.responseText);
                            }});
                        }
                    }
                    if (!partial || T.include) {
                        Array.prototype.push.apply(T, $.templates[T._].call(this, jQuery, $.extend({}, $data, this), 0, true, false));
                    }
                    T._ = null;
                    T.push("\n");
                }
                T.push("\n\n");
            }
            T.push("\n");
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
