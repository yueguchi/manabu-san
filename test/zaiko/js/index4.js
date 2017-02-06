// 発注入力フォーム作成
var tbody = $("#tbody-input");
var tr = $('<tr></tr>');
tr.append('<td>' + getOrderCompany() + '</td>');
tr.append('<td>' + getOrderItem() + '</td>');
tr.append('<td>' + getOrderQty() + '</td>');
tr.append('<td><input id="order-nyuka-date" type="number">日後</td>');
tr.append('<td><input id="order-memo" type="text" placeholder="発注メモ"></td>');
tr.append('<td><button id="addOrderBtn" class="btn btn-sm btn-success">発注書発行</button></td>');
tr.appendTo(tbody);

function getOrderCompany() {
    return "<select id='order-company'>" +
        "<option value='仕入先A'>仕入先A</option>" +
        "<option value='仕入先B'>仕入先B</option>" +
        "<option value='仕入先C'>仕入先C</option>";
}

function getOrderItem() {
    var items = alasql('SELECT * FROM item');
    var $select = "<select id='order-item'>";
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        $select += "<option value='" + item.item.detail + "'>" + item.item.detail + "</option>";
    }
    $select += "</select>";
    return $select;
}

function getOrderQty() {
    var $select = "<select id='order-qty'>";
    for (var i = 1; i < 100; i++) {
        $select += "<option value='" + i + "'>" + i + "</option>";
    }
    $select += "</select>";
    return $select;
}

$("#addOrderBtn").on("click", function() {
    var ans = confirm("発注書を送付します。よろしいですか？");
    if (ans) {
        var companyName = $("#order-company > option:selected").val();
        var itemName = $("#order-item > option:selected").val();
        var qty = $("#order-qty > option:selected").val();
        var nyukaDate = $("#order-nyuka-date").val();
        var memo = $("#order-memo").val();
        if (companyName && itemName && qty && nyukaDate && parseInt(nyukaDate) > 0) {
            var orderid = alasql('SELECT MAX(id) + 1 as id FROM porder')[0].id;
            if (!orderid) {
                orderid = 1;
            }
            alasql('INSERT INTO porder(id, company, item, qty, nyukadate, memo, status) values(?,?,?,?,?,?,?)', [orderid, companyName, itemName, qty, nyukaDate, memo, 0]);
            location.reload();
        } else {
            alert("値が不正です");
        }
    }
});


// 発注書一覧の取得・表示
var orders = alasql('SELECT * FROM porder');
// HTML作成
var tbody = $('#tbody-orders');
for(var i = 0; i < orders.length; i++) {
    var order = orders[i];
    var tr = $('<tr></tr>');
    tr.append('<td>' + order.company + '</td>');
    tr.append('<td>' + order.item + '</td>');
    tr.append('<td>' + order.qty + '</td>');
    tr.append('<td>' + calcNyukaDate(order.nyukadate) + '</td>');
    tr.append('<td>' + order.memo + '</td>');
    tr.append('<td>' + getStatusStr(order.status) + '</td>');
    tr.appendTo(tbody);
}

/**
 * 発注可能日はn日後で格納されているため、現在日付から計算
 *
 * @param nyukaNum
 * @returns {string}
 */
function calcNyukaDate(nyukaNum) {
    var nyukaNum = parseInt(nyukaNum);
    var now = new Date();
    now.setDate(now.getDate() + nyukaNum);
    return now.getFullYear() + "-" +
    ( "0"+( now.getMonth()+1 ) ).slice(-2) + "-" +
    ( "0"+now.getDate() ).slice(-2);
}

function getStatusStr(status) {
    status = parseInt(status);
    var ret = "";
    switch (status) {
        case 0:
            ret = "未処理";
            break;
        case 1:
            ret = "発注済み";
            break;
        case 2:
            ret = "エラー";
            break;
    }
    return ret;
}