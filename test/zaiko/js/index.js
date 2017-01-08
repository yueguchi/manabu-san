// 検索ボックス作成
var rows = alasql('SELECT * FROM whouse');
for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var option = $('<option>');
    option.attr('value', row.whouse.id);
    option.text(row.whouse.name);
    $('select[name="q1"]').append(option);
}

var rows = alasql('SELECT * FROM kind');
for(var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var option = $('<option>');
    option.attr('value', row.kind.id);
    option.text(row.kind.text);
    $('select[name="q2"]').append(option);
}

// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * \
    FROM stock \
    JOIN whouse ON whouse.id = stock.whouse \
    JOIN item ON item.id = stock.item \
    JOIN kind ON kind.id = item.kind \
    WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var stocks = alasql(sql, [ q3 + '%']);

// HTML作成
var tbody = $('#tbody-stocks');
for(var i = 0; i < stocks.length; i++) {
    var stock = stocks[i];
    var tr = $('<tr data-href="stock.html?id=' + stock.stock.id + '"></tr>');
    tr.append('<td>' + stock.whouse.name + '</td>');
    tr.append('<td>' + stock.kind.text + '</td>');
    tr.append('<td>' + stock.item.code + '</td>');
    tr.append('<td>' + stock.item.maker + '</td>');
    tr.append('<td>' + stock.item.detail + '</td>');
    tr.append('<td style="text-align: right;">' + numberWithCommas(stock.item.price) + '</td>');
    tr.append('<td style="text-align: right;">' + stock.stock.balance + '</td>');
    tr.append('<td>' + stock.item.unit + '</td>');
    tr.append('<td style="text-align: right;">' + stock.stock.ave + '個</td>');
    tr.append('<td style="text-align: right;">' + (stock.stock.ave !== 0 ? Math.floor(stock.stock.balance / stock.stock.ave) + '日' : '-') + '</td>');
    tr.append('<td style="text-align: right;">' + stock.stock.readdate + '日</td>');
    var methoName = "不定期不定量";
    if (stock.stock.method === 2) {
        methoName = "不定期定量";
    } else if (stock.stock.method === 3) {
        methoName = "定期不定量";
    }
    tr.append(
        '<td style="text-align: right;">' +
            '<button ' +
                'data-stock-id="' + stock.stock.id + '"' +
                'class="btn btn-primary method-select-btn"' +
                'style="font-size: 10px; width: 100px">' + methoName + '' +
            '</button>' +
        '</td>');
    tr.appendTo(tbody);
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
    window.location = $(this).attr('data-href')
});

// 発注方法選択
$(".method-select-btn").each(function(index, element) {
    $(element).off("click").on("click", function(event) {
        // tr親要素へのイベントバブリングを停止する
        event.stopPropagation();
        // アイテムIDをダイアログのdata属性に渡しておくことで、ダイアログでmethodボタンを押した時に更新したいアイテムidが特定できるようにする
        var stockId = $(this).attr("data-stock-id");
        $(".method-item-modal-body").attr("data-stock-id", stockId);
        $('#modal_box').modal('show');
    });
});
// 発注方法更新
$(".method-select-item").off("click").on("click", function(event) {
    var methodId = parseInt($(this).attr("data-method-id"));
    var stockId = parseInt($(".method-item-modal-body").attr("data-stock-id"));
    console.log("選択したmethod: " + methodId);
    console.log("選択したstock-id: " + stockId);
    // 更新
    alasql('UPDATE stock SET method = ? where id = ?', [methodId, stockId]);
    location.reload();
});