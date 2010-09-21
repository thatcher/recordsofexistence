jQuery.templates[jQuery.env("templates")+"html/pages/artist.tmpl"]=
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
            T.push("");
            T._ = $.env("templates") + "html/base.tmpl";
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
            T.push("\n    \n");
            (function () {
                var name = "title", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n    Records of Existence Artist ");
                    pushT(artist.name, this);
                    T.push("\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
            T.push("\n\n");
            (function () {
                var name = "main", tmp, diff1, diff2;
                if (!T.blocks) {
                    T.blocks = $.tmpl.blocks;
                }
                if (!T.blocks[name]) {
                    T.blocks[name] = {start:T.length};
                }
                var B = (function () {
                    var T = [];
                    function pushT(value, _this, encode) {
                        return encode === false ? T.push(typeof value === "function" ? value.call(_this) : value) : T.push($.encode(typeof (value) === "function" ? value.call(_this) : value));
                    }
                    T.push("\n<div id='artist'>\n    <h3>\n        <a href='");
                    pushT($.env("root") + "artists", this);
                    T.push("'>\n            &lt; artists\n        </a>\n    </h3>\n    ");
                    if (admin) {
                        T.push("\n        ");
                        T.include = true;
                        T._ = $.env("templates") + "html/forms/artist.tmpl";
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
                        T.push("\n    ");
                    } else {
                        T.push("\n    <div class='first column span-7 push-2 colborder'>\n        \n        <h4>\n            ");
                        pushT(artist.name, this);
                        T.push("\n        </h4>\n        <img src='");
                        pushT($.env("data") + artist.image, this);
                        T.push("' \n             alt='");
                        pushT(artist.image, this);
                        T.push("'  \n             height='150px'/>\n        <strong>releases</strong>\n        <ul>\n            ");
                        jQuery.each(releases, function ($i) {
                            with (this) {
                                T.push("\n            <li>\n                <a href='");
                                pushT($.env("root") + "release/" + this.$id, this);
                                T.push("'>\n                    ");
                                pushT(this.name, this);
                                T.push("\n                </a>\n            </li>\n             ");
                            }
                        });
                        T.push("\n        </ul>\n    </div>\n    <div class=' last column span-12'>\n        <p>");
                        pushT(artist.description, this);
                        T.push("</p>\n    </div>\n    ");
                    }
                    T.push("\n</div>\n");
                    return T;
                })();
                diff1 = T.blocks[name].end ? T.blocks[name].end - T.blocks[name].start : 0;
                Array.prototype.splice.apply(T, [T.blocks[name].start + 1, diff1].concat(B));
                T.blocks[name].end = T.blocks[name].start + B.length;
                diff2 = T.blocks[name].end - T.blocks[name].start;
                for (tmp in T.blocks) {
                    if (T.blocks[tmp].start > T.blocks[name].start) {
                        T.blocks[tmp].start += diff2 - diff1;
                        T.blocks[tmp].end += diff2 - diff1;
                    }
                }
            })();
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
