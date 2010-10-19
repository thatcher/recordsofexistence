jQuery.templates[jQuery.env("templates")+"html/pages/releases.tmpl"]=
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
                    T.push("\nRecords of Existence Releases\n");
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
            T.push("\n    \n");
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
                    T.push("\n<div id='releases'>\n    <h3>releases</h3>\n    ");
                    if (admin) {
                        T.push("\n    <div style='clear:both;text-align:center;'>\n        <span  class=\"ss_sprite  ss_add\">\n            <a href='");
                        pushT($.env("root") + "artists?admin", this);
                        T.push("'>\n            Add release (via artist)\n            </a>\n        </span><br/>\n        <a id='show_deleted'\n           href='#show/deleted'>\n           show deleted releases\n        </a>\n        <span> | </span>\n        <a id='hide_deleted'\n           href='#hide/deleted'>\n           hide deleted releases\n        </a>\n    </div>\n    ");
                    }
                    T.push(" \n    \n    <div class='first column span-7 prepend-1'>\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(0), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n    <div class=\"column span-7\">\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(1), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br/>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n    <div class='last column span-7'>\n        <ul>\n            ");
                    jQuery.each(_(releases).every_third_from(2), function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <div class='span-7  ");
                            pushT(this.deleted.length ? "deleted" : "", this);
                            T.push("'>\n                    ");
                            if (admin) {
                                T.push("  \n                    \n                        <span class=\"ss_sprite  ss_comment_edit\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("release/");
                                pushT(this.$id, this);
                                T.push("?admin'>\n                                | edit release \n                            </a>\n                            <br/>\n                        </span>\n                        \n                        <span class= \"ss_sprite  ss_delete\">\n                            <a href='");
                                pushT($.env("root"), this);
                                T.push("admin/");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push("/releases/");
                                pushT(this.$id, this);
                                T.push("'>\n                                 | ");
                                pushT((this.deleted.length ? "restore" : "remove"), this);
                                T.push(" release \n                            </a>\n                            <br/>\n                        </span>\n                    ");
                            }
                            T.push("\n                    <a href='");
                            pushT($.env("root"), this);
                            T.push("release/");
                            pushT(this.$id, this);
                            T.push("'\n                       style=''>\n                       <img\n                            src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                            alt='");
                            pushT(this.name, this);
                            T.push("' \n                            height='100px'\n                        />\n                        <br/>\n                        <span class='quiet small'>release # ");
                            pushT(this.label_id, this);
                            T.push("</span>\n                    </a>\n                    <strong>");
                            pushT(this.name, this);
                            T.push("</strong>\n                    <br/>\n                    <span>");
                            pushT(this.description.substring(0, 128), this);
                            T.push("...</span>\n                </div>\n            </li>\n            ");
                        }
                    });
                    T.push("\n        </ul>\n    </div>\n</div>\n");
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
