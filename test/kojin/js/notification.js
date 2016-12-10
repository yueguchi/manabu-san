/**
 * Created by eguchi on 2016/12/10.
 */
function notify() {
    if (localStorage.getItem("notifyIds")) {
        alert("社員ID: " + localStorage.getItem("notifyIds") + "がチームに登録されました。");
        localStorage.removeItem("notifyIds");
    }
}
notify();