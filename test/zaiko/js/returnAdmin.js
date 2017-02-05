var items = alasql('SELECT * FROM trans JOIN stock ON trans.stock = stock.id JOIN item ON stock.item = item.id WHERE trans.qty > 0 AND trans.memo != "初期在庫" AND trans.status = 1');

var tbody = $('#tbody-items');
for(var i = 0; i < items.length; i++) {
    var item = items[i];
    var returnCount = alasql('SELECT * FROM trans WHERE stock = ? AND status = 2', [parseInt(item.trans.stock)])[0].trans.qty;
    var tr = $('<tr></tr>');
    tr.append('<td>' + item.trans.company + '</td>');
    tr.append('<td>' + item.item.detail + '</td>');
    tr.append('<td>' + item.stock.balance + '</td>');
    tr.append('<td>' + item.trans.qty + '</td>');
    tr.append('<td>' + (-1) * returnCount + '</td>');
    tr.append('<td>' + (parseInt(item.trans.qty) - ((-1) * returnCount)) + '</td>');
    tr.append('<td>'+ retryHattyu(item.trans.id, (-1) * returnCount) + '</td>');
    tr.append('<td><button class="btn btn-success btn-sm retry-btn" data-id="' + item.trans.id + '">再発注</button> </td>');
    tr.appendTo(tbody);
}

$(".retry-btn").on("click", function() {
    var id = parseInt($(this).attr("data-id"));
    var item = alasql('SELECT * FROM trans JOIN stock ON trans.stock = stock.id JOIN item ON stock.item = item.id WHERE trans.id = ?', [id])[0];
    var retryCount = parseInt($("#retry-count-" + id).val());
    var ret = confirm(retryCount + "個を再発注かけます。よろしいですか？");
    if (ret) {
        // 現在在庫 - 返品数 = 更新したい在庫数
        var balance = item.stock.balance + retryCount;
        // 在庫更新
        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance, id ]);

        var now = new Date();
        var yyyymmdd = now.getFullYear()+ "-" +
            ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
            ( "0"+now.getDate() ).slice(-2);

        // 新規で追加するtransに最新の在庫とstatus=3(=再発注処理済み)をセットする
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES (?,?,?,?,?,?,?,?)', [ trans_id, item.stock.id, yyyymmdd, (retryCount), balance, item.trans.company, "再発注", 3]);
        // 操作したtransのstatusを3(=再発注処理済み)にする
        alasql('UPDATE trans SET status = 3 WHERE id = ?', [id]);
        // 返品したtransのstatusも3(=再発注処理済み)に変更する
        var retItemTrans = alasql('SELECT * FROM trans WHERE stock = ? AND status = 2', [parseInt(item.trans.stock)])[0];
        alasql('UPDATE trans SET status = 3 WHERE id = ?', [retItemTrans.trans.id]);
        location.reload();
    }
});

function retryHattyu(id, retCount)
{
    var selectStr = "<select id='retry-count-" + id + "'>";
    for(var i = retCount; i > 0; i--) {
        selectStr += "<option value='" + i + "'>" + i + "</option>";
    }
    selectStr += "</select>";
    return selectStr;
}
