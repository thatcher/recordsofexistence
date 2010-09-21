jQuery.templates[jQuery.env("templates")+"html/pages/events.tmpl"]=
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
            T.push("\n\n");
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
                    T.push("\nRecords of Existence Events\n");
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
                    T.push("\n<div id='events' >\n    <h3>events</h3>\n    \n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "admin/add/events/", this);
                        T.push("'>\n            Add event\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted events\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted events\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n    \n    <div style='width:auto;overflow-x:auto;'>\n        ");
                    jQuery.each(events, function ($i) {
                        with (this) {
                            T.push("\n        \n        <div class='event column span-5 ");
                            pushT(admin ? "" : "colborder", this);
                            T.push(" ");
                            pushT((this.deleted.length ? "deleted" : ""), this);
                            T.push("'>\n        ");
                            if (admin) {
                                T.push("\n            ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/event.tmpl";
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
                                T.push("\n        ");
                            } else {
                                T.push("\n            <span>");
                                pushT(this.date, this);
                                T.push("</span>\n            <br/>\n\n                <img \n                    src='");
                                pushT($.env("data") + this.image, this);
                                T.push("'\n                    alt='");
                                pushT(this.title, this);
                                T.push("'\n                    width='60px'\n                />\n            <br/>\n            <strong>");
                                pushT(this.title, this);
                                T.push("</strong>\n            <p>");
                                pushT(this.location, this);
                                T.push("</p>\n            <p>");
                                pushT(this.description, this);
                                T.push("</p>\n        ");
                            }
                            T.push("        \n         </div>\n        \n        ");
                            if (($i + 1) % 4 == 0) {
                                T.push("\n        <div style='margin-top:8em;clear:both;'>\n        <br/>\n        </div>\n        ");
                            }
                            T.push("\n        \n        ");
                        }
                    });
                    T.push("\n    </div>      \n    \n</div>\n");
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
