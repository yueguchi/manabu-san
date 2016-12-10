//loginFormのsubmitをハンドリング
$('#loginForm').submit(function () {
    //データベース読み込み
    var userid = $('input[name="id"]').val();
    var userpassword = $('input[name="pw"]').val();

    var emps;
    if (userid && userpassword) {
        try {
            emps = alasql('SELECT * FROM emp WHERE number LIKE ? AND password LIKE ?', [userid, userpassword]);
        } catch (e) {
            alert(e + "");
            return false;
        }
    }

    //社員情報が存在すればログインとみなす。
    //認証キーを引き継ぐ
    if (emps.length > 0) {
        var emp = emps[0];
        var loginForm = $('#loginForm');
        loginForm.method = "GET";

        $('<input>').attr({
            type: 'hidden',
            id: 'userid',
            name: 'userid',
            value: userid
        }).appendTo(loginForm);
        $('<input>').attr({
            type: 'hidden',
            id: 'password',
            name: 'password',
            value: userpassword
        }).appendTo(loginForm);
        // ログインした人のnumberを保存
        localStorage.setItem("loginId", emp.number);
        return true;
    } else {
        $('#errMessage').text("そのような社員は存在しません。");
        return false;
    }


});

