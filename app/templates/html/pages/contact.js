jQuery.templates[jQuery.env("templates")+"html/pages/contact.tmpl"]=
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
                    T.push("\nRecords of Existence Contact\n");
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
                    T.push("\n<div class=\"span-16 column first\">\n    <div id='contact'>\n        <h3>contact</h3>\n\t\t<div class='prepend-1'>\n        \t<p>\n\t            <img src='");
                    pushT($.env("root") + "images/goldrecord.png", this);
                    T.push("' \n\t                 alt='records of existence'\n\t                 height='70px'/>\n\t            If you'ld like to get in touch, please do. We will try to respond quickly. \n\t            We gladly accept submissions.  However, keep in mind that we are a small \n\t            label with a limited amount of resources and time to put into our releases.  \n\t            So many of our releases are done by hand with sizable investment of time.  \n\t            This is a labor of love that we do to make the releases as unique as the \n\t            bands they showcase.  So if we LOVE it, we will put it out if we think \n\t            its a good fit.  \n\t        </p>\n\t        <p>\n\t            We mostly focus on projects from our regional area in \n\t            the mid-atlantic as these are more often those we have come to call friends.  \n\t            Our interests and tastes are diverse.  If you're a fan of what we do, we may\n\t            very well be a good match.  stop by sometime.\n\t        </p>\n\t        <p align=\"center\">\n\t            <em>\n\t                Records of Existence<br/>\n\t                  P.O. Box 995<br/>\n\t               Shepherdstown, WV 25443\n\t            </em><br/>\n\t          <!--/**a href=\"mailto:info@recordsofexistence.org\">\n\t              info@recordsofexistence.org\n\t          </a*/-->\n\t       </p>\n\t\t</div>\n    </div>\n</div>\n<div class=\"span-7 column last\">\n    <div id='mailing_list'>\n        <h3>mailing list</h3>\n        <p>Please join our list to keep up to date!</p>\n        <span>\n            <a href=\"mailto:recordsofexistence@hotmail.com\" \n                target=\"new\">\n                  recordsofexistence mailing list\n            </a>\n        </span>\n        <!--/**form action=\"mailinglist/subscribe\" method=\"get\">\n            <input name=\"email\" size=\"13\" value=\"you@it.com\" type=\"text\"/>\n            <input class=\"button\" value=\"ok\" type=\"submit\"/>\n        </form*/-->\n    </div>\n </div>\n");
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
