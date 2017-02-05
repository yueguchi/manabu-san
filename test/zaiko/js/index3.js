// 入荷された商品に対して、検品リストを作成する(システム都合上、初期在庫を除く) status = 1は返品済み商品
var nyukos = alasql('SELECT * FROM trans JOIN stock ON trans.stock = stock.id JOIN item ON stock.item = item.id WHERE trans.qty > 0 AND trans.memo != "初期在庫" AND trans.status = 0');

var tbody = $('#tbody-kenpins');
for(var i = 0; i < nyukos.length; i++) {
    var nyuko = nyukos[i];
    var tr = $('<tr></tr>');
    tr.append('<td>' + nyuko.trans.company + '</td>');
    tr.append('<td>' + nyuko.item.detail + '</td>');
    tr.append('<td>' + nyuko.trans.qty + '</td>');
    tr.append('<td>'+ returnCount(nyuko.trans.id, nyuko.trans.qty) + '</td>');
    tr.append('<td><button class="returnBtn btn btn-sm btn-danger" data-transid="' + nyuko.trans.id + '">返品する</button></td>');
    tr.append('<td><input type="text" placeholder="理由を記載" class="henpin-reason-' + nyuko.trans.id + '"></td>');
    tr.appendTo(tbody);
}

/**
 * 返品ボタン押下処理
 */
$(".returnBtn").on("click", function() {
    var tranid = parseInt($(this).attr("data-transid"));

    var nyuko = alasql('SELECT * FROM trans JOIN stock ON trans.stock = stock.id JOIN item ON stock.item = item.id WHERE trans.id = ?', [tranid])[0];

    var ret = confirm("返品します。よろしいですか？");
    if (ret) {
        var returnCount = parseInt($(".henpin-count-" + tranid + " > option:selected").val());
        var memo = $(".henpin-reason-" + tranid).val();

        // 現在在庫 - 返品数 = 更新したい在庫数
        var balance = nyuko.stock.balance - returnCount;

        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance, nyuko.stock.id ]);
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        var now = new Date();
        var yyyymmdd = now.getFullYear()+ "-" +
            ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
            ( "0"+now.getDate() ).slice(-2);

        // 新規で追加するtransに最新の在庫とstatus=2(=返品処理から追加されたtrans)をセットする
        alasql('INSERT INTO trans VALUES (?,?,?,?,?,?,?,?)', [ trans_id, nyuko.stock.id, yyyymmdd, (-1*returnCount), balance, nyuko.trans.company, memo, 2]);
        // 操作したtransのstatusを1(=返品処理済み)にする
        alasql('UPDATE trans SET status = 1 WHERE id = ?', [nyuko.trans.id]);

        // リロード
        location.reload();
    }
});

/**
 * 返品数セレクトボックスを生成する
 *
 * @param  qty 発注数
 * @returns {string}
 */
function returnCount(id, qty) {
    var selectStr = "<select class='henpin-count-" + id + "'>";
    for(var i = 1; i <= qty; i++) {
        selectStr += "<option value='" + i + "'>" + i + "</option>";
    }
    selectStr += "</select>";
    return selectStr;
}