jQuery.templates[jQuery.env("templates")+"html/pages/home.tmpl"]=
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
                    T.push("\nRecords of Existence\n");
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
                    T.push("\n<div class=\"span-17 column first\">\n    <div id='welcome'>\n        <h3>welcome</h3>\n        <div class='span-4 push-2 column first colborder'>\n            <img src='");
                    pushT($.env("root") + "images/goldrecord.png", this);
                    T.push("' \n                 alt='records of existence'\n                 style='float:right;'/>\n        </div>\n        <div class='span-9 column last'>\n            <p>\n                 Records of Existence is an artist run label of \n                 underground independent artists.  We specialize \n                 in doing limited edition Hand-Printed and \n                 Hand-Assembled releases to make the release \n                 as unique as the artists.  \n            </p>\n        </div>\n    </div>\n    <div id='recentnews' >\n        <h3>recent <a href='");
                    pushT($.env("root") + "news", this);
                    T.push("'>news</a></h3>\n        <ul class='roe_recent_news'>\n            ");
                    jQuery.each(news, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n               <h4>");
                            pushT(this.title, this);
                            T.push("<br/><em>");
                            pushT(this.date, this);
                            T.push("</em></h4>\n               <p>");
                            pushT(this.description, this);
                            T.push("</p>\n            </li>\n           ");
                        }
                    });
                    T.push("\n        </ul>\n        <a href='");
                    pushT($.env("root") + "news", this);
                    T.push("'>news archives</a>\n    </div>\n</div>\n<div class=\"span-6 column last\">\n    <div id='newreleases'>\n        <h3>new <a href='");
                    pushT($.env("root") + "releases", this);
                    T.push("'>releases</a></h3>\n        <ul>\n            ");
                    jQuery.each(recent, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <a href='");
                            pushT($.env("root") + "release/" + this.$id, this);
                            T.push("'>\n                    <span class='small'>");
                            pushT(this.name, this);
                            T.push("</span>\n                    <img src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                         alt='");
                            pushT(this.name, this);
                            T.push("'\n                         height='80px'\n                    />\n                </a>\n                <p>");
                            pushT(this.description.substring(0, 128) + "...", this);
                            T.push("</p>\n                <br/>\n            </li>\n            ");
                        }
                    });
                    T.push("\n         </ul>\n    </div>\n    <div id='upcomingevents'>\n        <h3>upcoming <a href='");
                    pushT($.env("root") + "events", this);
                    T.push("'>events</a></h3>\n        <p><em>click on an event for more information</em></p>\n        <ul>\n            ");
                    jQuery.each(events, function ($i) {
                        with (this) {
                            T.push("\n            <li>\n                <h6 style='color:white;'>");
                            pushT(this.date, this);
                            T.push("</h6>\n                <a href='");
                            pushT($.env("root") + "events", this);
                            T.push("'>\n                    <img\n                        src='");
                            pushT($.env("data") + this.image, this);
                            T.push("'\n                        alt='");
                            pushT(this.title + "  " + this.location, this);
                            T.push("'\n                        title='");
                            pushT(this.title + "  " + this.location, this);
                            T.push("'\n                        height='30px'\n                    />\n                    <span class='small'>");
                            pushT(this.title, this);
                            T.push("</span>\n                </a>\n            </li>\n            ");
                        }
                    });
                    T.push("\n         </ul>\n    </div>\n</div>\n");
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
