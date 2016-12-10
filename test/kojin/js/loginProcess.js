var userid = $.url().param('userid');
$('input[name="userid"]').val(userid);
var password = $.url().param('password');
$('input[name="password"]').val(password);

if (location.href.indexOf("emps-detail.html") == -1) {
    if (userid == null || password == null) {
        document.location.href = "./login.html";
    } else {
        var confirmobj = alasql('SELECT * FROM emp WHERE number LIKE ? and password LIKE ? ', [userid, password]);
        if (confirmobj.length == 0) {
            document.location.href = "./login.html";
        }
    }
}

$(function () {
    $('a').on('click', function (e) {
        e.preventDefault();
        if (e.currentTarget.attributes["disabled"]) {
            e.stopImmediatePropagation();
            return false;
        }
        if (e.currentTarget.href.indexOf('?') >= 0) {
            location.href = e.currentTarget.href + '&password=' + password + '&userid=' + userid;
        }
        else {
            location.href = e.currentTarget.href + '?password=' + password + '&userid=' + userid;
        }
    });
    $('form').on('submit', function (e) {
        if (e.currentTarget.action.indexOf('?') >= 0) {
            e.currentTarget.action = e.currentTarget.action + '&password=' + password + '&userid=' + userid;
        }
        else {
            e.currentTarget.action = e.currentTarget.action + '?password=' + password + '&userid=' + userid;
        }
    });
});

