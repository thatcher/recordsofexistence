jQuery.templates[jQuery.env("templates")+"html/forms/artist.tmpl"]=
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
            T.push("\n<form id='editArtist' \n    method='post' \n    action='");
            pushT($.env("root") + "admin/save/artists/" + artist.$id, this);
            T.push("'>\n    \n        <div class='first column span-7 prepend-2 colborder'>\n            <span class=\"ss_sprite  ss_comment_add\">\n              edit artist name  \n            </span>\n            <h4>\n                <input \n                    id='name' \n                    type='text' \n                    name='name'\n                    value='");
            pushT(artist.name, this);
            T.push("'\n                />\n            </h4>\n            <span  class=\"ss_sprite  ss_image_add\">\n                edit artist id |\n            </span>\n            <br/>\n            <input \n                id=    '$id'\n                type=  'text' \n                name=  '$id'\n                value= '");
            pushT(artist.$id, this);
            T.push("'\n            />\n            <br/>\n            <br/>\n            <span class=\"ss_sprite  ss_image_add\">\n              edit artist image \n            </span>\n            <br/>\n            <input\n                id='image' \n                type='text'\n                name='image'\n                value='");
            pushT(artist.image, this);
            T.push("'\n            />\n            <img src='");
            pushT($.env("data") + artist.image, this);
            T.push("' \n                 alt='");
            pushT(artist.image, this);
            T.push("'  \n                 height='150px'/>\n            <strong>releases</strong>\n            <ul>\n                ");
            jQuery.each(releases, function ($i) {
                with (this) {
                    T.push("\n                <li>\n                    <span class=\"ss_sprite  ss_delete\">\n                        <a href='");
                    pushT($.env("root") + "admin/remove/releases/" + this.$id, this);
                    T.push("'>\n                             remove this release \n                        </a> | \n                    </span>\n                    <span class=\"ss_sprite  ss_comment_add\">\n                        <a href='");
                    pushT($.env("root") + "release/" + this.$id + "?admin", this);
                    T.push("'>\n                             edit this release \n                        </a> \n                    </span>\n                    <br/>\n                    ");
                    pushT(this.name, this);
                    T.push("\n                </li>\n                <li>\n                     <a href='");
                    pushT($.env("root") + "admin/add/releases/?artist=" + artist.$id, this);
                    T.push("'></a>\n                         <span class=\"ss_sprite  ss_add\">\n                             Add Release\n                         </span>\n                     </a>\n                 </li>\n                 ");
                }
            });
            T.push("\n            </ul>\n        </div>\n        <div class=' last column span-12'>\n            <span class=\"ss_sprite  ss_comment_add\">\n                  edit artist description  \n            </span>\n            <textarea id='description'\n                name='description'\n            >");
            pushT(artist.description + "", this);
            T.push("</textarea>\n            <input\n                type='submit' \n                value='save' \n                class='submit'\n            />\n        </div>    \n</form>");
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
