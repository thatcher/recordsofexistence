jQuery.templates[jQuery.env("templates")+"html/pages/release.tmpl"]=
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
                    T.push("\nRecords of Existence Release ");
                    pushT(release.name, this);
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
                    T.push("\n<div id='release'>\n\n    <h3><a href='");
                    pushT($.env("root") + "releases", this);
                    T.push("'>&lt; releases</a></h3>\n    ");
                    if (admin) {
                        T.push("\n        ");
                        T.include = true;
                        T._ = $.env("templates") + "html/forms/release.tmpl";
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
                        T.push("\n    <div class='first column span-5 colborder'>\n        <br/><br/>\n        <h4>");
                        pushT(release.name, this);
                        T.push("</h4>\n        <h5>\n            <a href='");
                        pushT($.env("root") + "artist/" + artist.$id, this);
                        T.push("'>\n                ");
                        pushT(artist.name, this);
                        T.push("\n            </a>\n        </h5>\n        <em>Release</em><br/>\n        <span>");
                        pushT(release.label_id, this);
                        T.push("</span> \n        <br/><br/>\n    </div>\n     \n    <div id='cover' \n         class='column span-6 colborder'>\n        <img src='");
                        pushT($.env("data") + release.image, this);
                        T.push("' \n             alt='release image'  \n             height='150px'\n        />\n    </div>\n    <div id='media' \n         class='column span-9'>\n        <ol class='clear'>\n            ");
                        jQuery.each(release.tracks, function (i, title) {
                            with (this) {
                                T.push("\n            <li>\n                <a target='_blank'\n                    href='");
                                pushT($.env("data") + "releases/" + release.$id + "/web/mp3/" + title.substring(0, 2) + ".mp3", this);
                                T.push("'>\n                    ");
                                pushT(title, this);
                                T.push("\n                    <img src='");
                                pushT($.env("root") + "images/audio_bullet.gif", this);
                                T.push("'/>\n                </a>\n            </li>\n            ");
                            }
                        });
                        T.push("\n        </ol>\n    </div>\n    \n    <div class='column span-18 push-3' >\n        <p>");
                        pushT(release.description, this);
                        T.push("</p>\n    </div>\n    ");
                    }
                    T.push("\n    \n    <div  class='column span-22'>\n        <h3> pressings </h3>\n        ");
                    if (admin) {
                        T.push("\n            ");
                        jQuery.each(pressings, function ($i) {
                            with (this) {
                                T.push("\n            ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/pressing.tmpl";
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
                                T.push("    \n            ");
                            }
                        });
                        T.push("\n            <div style='clear:both;text-align:center;'>\n                <span  class= \"ss_sprite  ss_add\" >\n                    <a href='");
                        pushT($.env("root"), this);
                        T.push("admin/add/pressings/?release=");
                        pushT(release.$id, this);
                        T.push("'>\n                        Add a new pressing\n                    </a>\n                </span>\n            </div>\n        ");
                    } else {
                        T.push("\n            ");
                        jQuery.each(pressings, function ($i) {
                            with (this) {
                                T.push("\n            <div class='pressing span-16'>\n                <div class='first column span-13 prepend-2 colborder'>\n                    <p>");
                                pushT(this.description, this);
                                T.push("</p> \n                </div>\n            </div>\n            <div class='last column small box span-4'>\n                ");
                                T.include = true;
                                T._ = $.env("templates") + "html/forms/paypal.tmpl";
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
                                T.push("\n            </div>  \n            ");
                            }
                        });
                        T.push("\n        ");
                    }
                    T.push("\n    </div>\n</div>\n");
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
