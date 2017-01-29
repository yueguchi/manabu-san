var id = parseInt($.url().param('id'));
var est = alasql('SELECT * FROM request request JOIN item item ON request.id = item.id WHERE request.id = ?', [id])[0];

var tbody = $('#tbody-estimate');
var tr = $('<tr></tr>');
tr.append('<td>' + est.rcompany + '</td>');
tr.append('<td>' + getSokoSelect() + '</td>');
tr.append('<td>' + est.item.code + '</td>');
tr.append('<td>' + est.item.maker + '</td>');
tr.append('<td>' + est.item.detail + '</td>');
tr.append('<td>納期</td>');
tr.append('<td>' + numberWithCommas(est.item.price) + '</td>');
tr.append('<td>' + est.rcount + '</td>');
tr.appendTo(tbody);

// 見積もり請求金額
$("#sum-yen").text(" ¥" + numberWithCommas(parseInt(est.item.price) * parseInt(est.rcount)) + "円也");

function getSokoSelect() {
    var soukos = alasql('SELECT * FROM whouse');
    var $select = "<select name='souko>";
    $.each(soukos, function(index, souko) {
        var soukoId = souko.whouse.id;
        var soukoName = souko.whouse.name;
        $select += "<option value='" + soukoId + "'>" + soukoName + "</option>";
    });
    $select += "</select>";
    return $select;
}

// 桁区切り
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 見積もり送信
$(".est-decide-btn").on("click", function() {
    alasql('UPDATE request SET souko = ?, status = 1 WHERE id = ?', [$("select > option:selected").text(), id]);
    alert("見積もりを送信しました。");
    location.href = "index2.html";
});