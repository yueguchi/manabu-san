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
    var memo = $('textarea[name="memo"]').val();
    alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, id ]);
    var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
    alasql('INSERT INTO trans VALUES (?,?,?,?,?,?)', [ trans_id, id, date, qty, balance + qty, memo]);

    // 1日平均出荷数を算出
    // 本当はSQLでbetweenで範囲抽出したかったが、alasqlがクソなので、出荷itemだけを抽出する
    var shukko = alasql('SELECT * FROM trans WHERE stock = ? AND qty < 0', [ id ]);
    // jsで日付絞り込みを行う
    var now = new Date();
    var yyyymmdd = now.getFullYear()+ "-" +
        ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
        ( "0"+now.getDate() ).slice(-2);
    var nowDate = new Date(yyyymmdd);
    var targetTransQty = [];
    $.each(shukko, function(index, data) {
        if (data.trans.date) {
            var targetDate = new Date(data.trans.date);
            // 今日の日付 - 対象日付が一週間前以内なら対象とする
            if ((nowDate.getTime() - targetDate.getTime()) /(1000*60*60*24) <= 7) {
                targetTransQty.push(data.trans.qty*-1); // 個数を純粋に確保したいので、ここでマイナスを消す
            }
        }
    });
    // 1週間の平均出荷数を求めるため、sizeが7に満たない場合は、配列を0で埋めてから計算する
    if (targetTransQty.length < 7) {
        targetTransQty = zeroUme(targetTransQty);
    }
    // 平均値の算出
    var sum = 0;
    $.each(targetTransQty, function(index, qty) {
        sum += qty;
    });
    var ave = Math.floor(sum / 7);
    console.log(targetTransQty);
    console.log(ave);
    // 1日平均出荷数の更新
    alasql('UPDATE stock SET ave = ? WHERE id = ?', [ ave, id ]);

    // 自動発注処理
    // 出荷対応日数(現在在庫 / 1日平均出荷数)がリードタイム日数を下回っていたら、自動で発注(=入荷)をかける
    var readTimeNissuu = alasql("select readdate from item where id = ?;", [id])[0].readdate;
    if (ave != 0 && Math.floor(balance / ave) < readTimeNissuu) {
        // 自動発注処理
        // 発注する数は 1日当たりの平均出荷数 * 出荷対応日数 = 発注量(ただし、出荷対応日数が0なら、aveをそのまま発注かける)
        var hattyuuCount = ave * (Math.floor(balance / ave) === 0 ? 1 : Math.floor(balance / ave));
        // stock更新
        alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + hattyuuCount, id ]);
        // trans更新
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES (?,?,?,?,?,?)', [ trans_id, id, yyyymmdd, hattyuuCount, balance + hattyuuCount, "自動発注"]);
    }
    window.location.assign('stock.html?id=' + id);

    function zeroUme(target) {
        switch (target.length) {
            case 0:
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
            case 1:
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
            case 2:
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
            case 3:
                target.push(0);
                target.push(0);
                target.push(0);
                target.push(0);
            case 4:
                target.push(0);
                target.push(0);
                target.push(0);
            case 5:
                target.push(0);
                target.push(0);
            case 6:
                target.push(0);
        }
        return target;
    }
});
