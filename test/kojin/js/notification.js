/**
 * Created by eguchi on 2016/12/10.
 */
function notify() {
    // ログイン時のIDを取得
    var loginId = localStorage.getItem("loginId");
    if (localStorage.getItem("notifyIds") && localStorage.getItem("notifyIds").split(",").indexOf(loginId) > -1) {
        alert("社員ID: " + loginId + "さんはチームに登録されました。");
        localStorage.removeItem("notifyIds");
    }
}
notify();