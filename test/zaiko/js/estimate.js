var id = parseInt($.url().param('id'));
var est = alasql('SELECT * FROM request request JOIN item item ON request.id = item.id WHERE request.id = ?', [id])[0];

var tbody = $('#tbody-estimate');
var tr = $('<tr></tr>');
tr.append('<td>' + est.rcompany + '</td>');
tr.append('<td>' + getSokoSelect() + '</td>');
tr.append('<td>' + est.item.code + '</td>');
tr.append('<td>' + est.item.maker + '</td>');
tr.append('<td>' + est.item.detail + '</td>');
tr.append('<td id="nouki"></td>');
tr.append('<td>' + numberWithCommas(est.item.price) + '</td>');
tr.append('<td>' + est.rcount + '</td>');
tr.appendTo(tbody);

// 見積もり請求金額
$("#sum-yen").text(" ¥" + numberWithCommas(parseInt(est.item.price) * parseInt(est.rcount)) + "円也");

function getSokoSelect() {
    var soukos = alasql('SELECT * FROM whouse');
    var $select = "<select name='souko'>";
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
}


// 初期値を宣言しておく
var now = new Date();
var yyyymmdd = now.getFullYear()+ "-" +
    ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
    ( "0"+now.getDate() ).slice(-2);

// 初期値で倉庫のselectイベントを発動させておく
setTimeout(function() {
    $("select").trigger("change");
}, 100);

// 倉庫変更イベント
$("select").change(function() {
    // ここで、納品予定日を更新する
    // 在庫引き当て判定
    var soukoId = parseInt($("select > option:selected").val());
    var soukoName = $("select > option:selected").text();
    var count = est.rcount;
    var price = est.item.price;
    // 選択された倉庫に出荷できるだけの在庫があるか確認
    var hikiate = alasql('SELECT * FROM stock JOIN item ON stock.item = item.id JOIN request ON request.item = item.id JOIN whouse ON whouse.id = stock.whouse WHERE request.id = ? AND stock.whouse = ?', [id, soukoId])[0];

    // 納品予定日の算出
    var now = new Date();
    yyyymmdd = now.getFullYear()+ "-" +
        ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
        ( "0"+now.getDate() ).slice(-2);
    if (hikiate) {
        // 在庫が足りない場合の納品予定日
        if (count > hikiate.stock.balance) {
            // 現在の在庫数から、出荷対応日数を算出
            // TODO 一度もマイナス値で出荷されてない商品の対応出荷日数は0になってしまう。。如何するべきか。。現状は現在日付をデフォルトで入れている。
            var taiouNissuu = (hikiate.stock.ave !== 0 ? Math.floor(hikiate.stock.balance / hikiate.stock.ave) : 0);
            var now = new Date();
            now.setDate(now.getDate() + taiouNissuu);
            yyyymmdd = now.getFullYear()+ "-" +
                ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
                ( "0"+now.getDate() ).slice(-2);
        }
        $("#nouki").text(yyyymmdd);
        $(".est-decide-btn").attr("disabled", false);
    } else {
        // 倉庫に一個もない場合、例えば、id=1で倉庫が大阪はレコードがない場合は、見積もり送信が押せない
        alert("在庫情報が取得できないため、見積もり送信が行えません");
        $(".est-decide-btn").attr("disabled", true);
    }
});

// 見積もり送信
$(".est-decide-btn").on("click", function() {
    // 在庫引き当て判定
    var soukoName = $("select > option:selected").text();
    // 依頼情報の更新
    alasql('UPDATE request SET souko = ?, deliverydate = ?, status = 1 WHERE id = ?', [soukoName, yyyymmdd, id]);
    alert("見積もりを送信しました。");
    location.href = "index2.html";
});