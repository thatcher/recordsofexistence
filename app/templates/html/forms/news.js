jQuery.templates[jQuery.env("templates")+"html/forms/news.tmpl"]=
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
            T.push("<form action='");
            pushT("admin/save/news/" + this.$id, this);
            T.push("'\n      method='post'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />\n    <span class=  \"title ss_sprite  ss_image_add\">\n        edit news title | \n        <span class= \"ss_sprite  ss_delete\">\n            <a href='");
            pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/news/" + this.$id, this);
            T.push("'>\n                 ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" news \n            </a>\n        </span>\n        <br/>\n        <input\n            class= 'title' \n            type=  'text'\n            name=  'title'\n            value= '");
            pushT(this.title, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"date ss_sprite  ss_comment_add\"\n        >edit news date | \n        <br/>\n        <input\n            class= 'date' \n            type=  'text'\n            name=  'date' \n            value= '");
            pushT(this.date, this);
            T.push("'\n        />\n    </span>\n    <p>\n        <span class=\"ss_sprite  ss_comment_add\">\n            edit news description\n            <textarea\n                class='description'\n                name='description'\n                style='border-bottom:1px dotted #567'>\n                ");
            pushT(this.description, this);
            T.push("\n            </textarea>\n        </span>\n    </p>\n                    \n    <input\n        id=    '");
            pushT("submit/news/" + this.$id, this);
            T.push("'\n        type=  'submit', \n        value= 'save', \n        class= 'submit'\n    />\n    <hr/>\n</form>");
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
