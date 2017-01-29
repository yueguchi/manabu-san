// 見積もり依頼一覧取得(みなし)
var reqs = alasql('SELECT * FROM request req JOIN item item ON req.item = item.id');

var tbody = $('#tbody-reqs');
for(var i = 0; i < reqs.length; i++) {
    var req = reqs[i];
    var tr = $('<tr></tr>');
    tr.append('<td>' + req.rcompany + '</td>');
    tr.append('<td>' + req.item.detail + '</td>');
    tr.append('<td>' + req.rcount + '</td>');
    tr.append('<td>' + req.souko + '</td>');
    var status = "未処理";
    if (req.status === 1) {
        status = "送信済";
    }
    tr.append('<td>' + status + '</td>');
    var disabledStr = status === "送信済" ? "disabled" : "";
    tr.append('<td><button class="btn btn-success make-estimate-btn" ' + disabledStr + ' data-id="' + req.id + '">見積もり作成</td>');
    tr.appendTo(tbody);
}

$(".make-estimate-btn").on("click", function() {
    var id = $(this).attr("data-id");
    location.href = "estimate.html?id=" + id;
});