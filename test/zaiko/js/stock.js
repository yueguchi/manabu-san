// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 商品情報読みこみ
var sql = 'SELECT * \
    FROM stock \
    JOIN whouse ON whouse.id = stock.whouse \
    JOIN item ON item.id = stock.item \
    JOIN kind ON kind.id = item.kind \
    WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
$('#image').attr('src', 'img/' + row.item.id + '.jpg');
$('#whouse').text(row.whouse.name);
$('#code').text(row.item.code);
$('#maker').text(row.item.maker);
$('#detail').text(row.item.detail);
$('#price').text(numberWithCommas(row.item.price));
var balance = row.stock.balance; // 入出庫で利用
$('#balance').text(balance);

// トランザクション読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-transs');
for(var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var tr = $('<tr>').appendTo(tbody);
    tr.append('<td>' + row.trans.date + '</td>');
    tr.append('<td>' + row.trans.qty + '</td>');
    tr.append('<td>' + row.trans.balance + '</td>');
    tr.append('<td>' + row.trans.memo + '</td>');
}

// 出入庫処理
$('#update').on('click', function() {
    var date = $('input[name="date"]').val();
    var qty = parseInt($('input[name="qty"]').val());
    balance = balance + qty;
    if (balance < 0) {
        alert("在庫が足りません");
        // 在庫を元の数に戻す
        balance = balance - qty;
        return false;
    }
    var memo = $('textarea[name="memo"]').val();

    alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance, id ]);
    var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
    alasql('INSERT INTO trans VALUES (?,?,?,?,?,?,?,?)', [ trans_id, id, date, qty, balance, "取引会社A", memo, 0]);

    window.location.assign('stock.html?id=' + id);
});
