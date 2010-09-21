jQuery.templates[jQuery.env("templates")+"html/forms/pressing.tmpl"]=
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
            T.push("<form id='editPressings-");
            pushT(this.$id, this);
            T.push("'\n      method='post'\n      action='/admin/save/pressings/");
            pushT(this.$id, this);
            T.push("'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />   \n    <div class='pressing span-22 ");
            pushT(this.deleted ? "deleted" : "", this);
            T.push("'>\n        \n        <div class='first column span-13 prepend-2 colborder'>\n            <span style= \"float:left;\"\n                  class= \"ss_sprite  ss_delete\" >\n                <a  id='pressings/");
            pushT(this.$id, this);
            T.push("' \n                    href='");
            pushT($.env("root"), this);
            T.push("admin/");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push("/pressings/");
            pushT(this.$id, this);
            T.push("?release=");
            pushT(this.release, this);
            T.push("'>\n                     | ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" release \n                </a>\n            </span>\n            <span class= \"ss_sprite  ss_comment_add\">\n               edit pressing description | \n            </span>\n            <textarea\n                id=    'description'\n                name=  'description'\n            >");
            pushT(this.description, this);
            T.push("</textarea>\n            <input\n                type=  'hidden' \n                name=  'release'\n                value= '");
            pushT(this.release, this);
            T.push("'\n            />\n            <input\n                type=  'submit'\n                value= 'save'\n                class= 'submit'\n            />\n        </div>\n        <div class='last column small box span-4'>\n            <h6>purchase this pressing</h6>\n            <p align='center'>\n                    <span class= \"ss_sprite  ss_cd\">\n                       edit release format | \n                    </span>\n                    <input\n                        id=    'format' \n                        type=  'text'\n                        name=  'format'\n                        value= '");
            pushT(this.format, this);
            T.push("'\n                    />\n                    <br/>\n                    <span class= \"ss_sprite  ss_money\">\n                        edit release price | \n                    </span>\n                    <input\n                        id=    'price' \n                        type=  'text'\n                        name=  'price'\n                        value= '");
            pushT(this.price, this);
            T.push("'\n                    />\n                    <br/>\n                    <span class= \"ss_sprite  ss_creditcards \">\n                        edit release ska | \n                    </span>\n                    <input\n                        id=    'ska' \n                        type=  'text'\n                        name=  'ska'\n                        value= '");
            pushT(this.ska, this);
            T.push("'\n                    />\n            </p>\n        </div>\n                \n    </div>\n    \n</form>");
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
