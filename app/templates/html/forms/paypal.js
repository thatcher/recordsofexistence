jQuery.templates[jQuery.env("templates")+"html/forms/paypal.tmpl"]=
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
            T.push("\n<form id='paypal-");
            pushT(this.ska, this);
            T.push("'\n      method='post'\n      action='https://www.paypal.com/cgi-bin/webscr'\n      target='paypal'>\n    \n    <div class='last column box span-4'>\n        <br/>\n        <h6>purchase this pressing</h6>\n        <p align='center'>\n            <em>");
            pushT(this.format, this);
            T.push("</em>\n            <br/>\n            <span class='cost'> $ ");
            pushT(this.price, this);
            T.push("</span>\n            <br/>\n            <input\n                type='hidden'\n                name='cmd'\n                value='_s-xclick'\n            />\n            <input\n                type='hidden'\n                name='hosted_button_id'\n                value='");
            pushT(this.ska, this);
            T.push("'\n            />\n            <input\n                id=    '");
            pushT(this.ska, this);
            T.push("'\n                class= 'addtocart'\n                type=  'image'\n                src=   'https://www.paypal.com/en_US/i/btn/btn_cart_LG.gif'\n                alt=   'PayPal - The safer, easier way to pay online!'\n                name=  'submit'\n            />\n        </p>\n    </div>\n\n</form>\n    ");
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
