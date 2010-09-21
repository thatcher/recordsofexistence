jQuery.templates[jQuery.env("templates")+"html/forms/event.tmpl"]=
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
            pushT($.env("root") + "admin/save/events/" + this.$id, this);
            T.push("'\n      method='post'>\n    <input\n        type='hidden'\n        name='$id'\n        value='");
            pushT(this.$id, this);
            T.push("'\n    />\n    <span class=\"date ss_sprite  ss_image_add\">\n      edit event date | \n    </span> <br/>\n    <input \n        class='date' \n        type='text'\n        name='date' \n        value='");
            pushT(this.date, this);
            T.push("'\n    />\n    <br/>\n    <span  class=\"ss_sprite  ss_delete\">\n        <a href='");
            pushT($.env("root") + "admin/" + (this.deleted.length ? "restore" : "remove") + "/events/" + this.$id, this);
            T.push("'>\n        | ");
            pushT((this.deleted.length ? "restore" : "remove"), this);
            T.push(" event\n        </a>\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_image_add\">\n        edit artist image\n        <br/>\n        <input\n            id=    'image' \n            type=  'text'\n            name=  'image' \n            value= '");
            pushT(this.image, this);
            T.push("'\n        />\n    </span>\n    <a href='#'>\n        <img \n            src='");
            pushT($.env("data") + this.image, this);
            T.push("'\n            alt='");
            pushT(this.title, this);
            T.push("'\n            width='60px'\n        />\n    </a>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event title\n        <br/>\n        <input \n            type=  'text'\n            name=  'title' \n            value= '");
            pushT(this.title, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event location\n        <br/>\n        <input\n            class= 'location' \n            type=  'text'\n            name=  'location' \n            value= '");
            pushT(this.location, this);
            T.push("'\n        />\n    </span>\n    <br/>\n    <span class=\"ss_sprite  ss_comment_edit\">\n        edit event description\n        <br/>\n        <textarea\n            class= 'description' \n            name=  'description'\n        >");
            pushT(this.description, this);
            T.push("</textarea>\n    </span>\n    <br/>\n    <input\n        type=  'submit' \n        value= 'save'\n        class= 'submit'\n    />\n    \n</form>");
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
