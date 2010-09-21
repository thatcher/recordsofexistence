jQuery.templates[jQuery.env("templates")+"html/forms/release.tmpl"]=
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
            T.push("<form id='editRelease' \n      method='post' \n      action='");
            pushT($.env("root") + "admin/save/releases/" + release.$id, this);
            T.push("'>\n    <div class='first column span-5 colborder push-1'>\n        \n        <span class=\"ss_sprite  ss_comment_add\">\n            edit release name |\n        </span>\n        <em>Release</em><br/>\n        <input \n            type=  'text' \n            name=  'name'\n            value= '");
            pushT(release.name, this);
            T.push("'\n        />\n        <h5>\n            <a href='#'>\n                ");
            pushT(artist.name, this);
            T.push("\n            </a>\n        </h5>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            edit release id |\n        </span>\n        <input \n            id=    '$id'\n            type=  'text' \n            name=  '$id'\n            value= '");
            pushT(release.$id, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            feature? true or blank |\n        </span>\n        <input \n            id=    'featured'\n            type=  'text' \n            name=  'featured'\n            value= '");
            pushT(release.featured, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_comment_add\">\n            edit label id |\n        </span>\n        <input \n            id=    'label_id'\n            type=  'text' \n            name=  'label_id'\n            value= '");
            pushT(release.label_id, this);
            T.push("'\n        />\n        <br/>\n        <span  class=\"ss_sprite  ss_image_add\">\n            edit release image |\n        </span>\n        <input \n            id=    'image'\n            type=  'text' \n            name=  'image'\n            value= '");
            pushT(release.image, this);
            T.push("'\n        />\n        <br/>\n        <input \n            type=  'hidden' \n            name=  'artist'\n            value= '");
            pushT(artist.$id, this);
            T.push("'\n        />\n        <br/>\n        <input \n            id=    'submitRelease'\n            type=  'submit' \n            value= 'save'\n            class= 'submit'\n        />\n    </div>\n       \n    <div id='cover' \n         class='column span-6 colborder'>\n        <img src='");
            pushT($.env("data") + release.image, this);
            T.push("' \n             alt='release image'  \n             height='150px'\n        />\n    </div>\n    \n    <div id='media' \n         class='column span-9'>\n        \n        <ul>\n            ");
            jQuery.each(release.tracks, function (index, title) {
                with (this) {
                    T.push("\n            <li>\n                <span class= \"ss_sprite  ss_delete\">\n                <a href='");
                    pushT($.env("root") + "admin/remove/tracks/" + "?release=" + release.$id + "&index=" + index, this);
                    T.push("'>\n                    remove track | \n                </a>\n                <input \n                    id=    '");
                    pushT("tracks." + index, this);
                    T.push("'\n                    type=  'text' \n                    name=  '");
                    pushT("tracks." + index, this);
                    T.push("'\n                    value= '");
                    pushT(title, this);
                    T.push("'\n                />\n                </span>\n            </li>\n            ");
                }
            });
            T.push("\n        \n            <li>\n            <span class= \"ss_sprite  ss_add\">\n                <a id=    '");
            pushT("track." + release.tracks.length, this);
            T.push("' \n                   href=  '");
            pushT($.env("root") + "admin/add/tracks/?release=" + release.$id, this);
            T.push("'\n                   name=  '");
            pushT("track." + release.tracks.length, this);
            T.push("'> \n                    Add a new track\n                </a>\n            </span>\n            </li>\n        </ul>\n    </div>\n    \n    <div class='column span-18 push-3' >\n        <span class= \"ss_sprite  ss_comment_add\">\n            edit release description |\n        </span>\n        <textarea\n            id='description'\n            name='description'\n            style='border-bottom:1px dotted #567'\n        >");
            pushT(release.description, this);
            T.push("</textarea>\n    </div>\n    \n    \n</form>");
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
