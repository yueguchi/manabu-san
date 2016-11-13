// 都道府県
var states = DB.choices('states');
for (var i = 0; i < states.length; i++) {
    var state = states[i];
    $('<option>').attr('value', state.id).text(state.text).appendTo($('#state select'));
}

// 住宅区分
var houses = DB.choices('house');
for(var i = 0; i < houses.length; i++) {
    var house = houses[i];
    $('<option>').attr('value', house.id).text(house.text).appendTo($('#house select'));
}

var id = parseInt($.url().param('id'));
if (id) {
    // 住所情報読み込み
    var addr = alasql('SELECT * FROM addr WHERE id=?', [ id ])[0];
    var zips = addr.zip.split("-");
    $("#zip input")[0].value = zips[0];
    $("#zip input")[1].value = zips[1] || '';
    $("#state select").val(addr.state);
    $("#city input").val(addr.city);
    $("#street input").val(addr.street);
    $("#bldg input").val(addr.bldg);
    $("#house input").val(addr.house);
}

// 画像・氏名更新
var empId = addr ? addr.emp : parseInt($.url().param('emp'));
var emp = alasql('SELECT * FROM emp WHERE id=?', [ empId ])[0];
$("#img-emp").attr("src", "img/" + emp.id + ".jpg");
$("#div-name_kanji").text(emp.name_kanji);
$("#div-name_kana").text(emp.name_kana);
$("#div-number").text(emp.number);
$("#nav-emp").attr("href", "emp.html?id=" + empId).text(emp.name_kanji);

// 保存
function update() {
    var addr = [];
    addr.push($("#zip input")[0].value + "-" + $("#zip input")[1].value);
    addr.push(parseInt($("#state select").val()));
    addr.push($("#city input").val());
    addr.push($("#street input").val());
    addr.push($("#bldg input").val());
    addr.push(parseInt($("#house select").val()));
    
    if (id) {
        addr.push(id);
        alasql(
            'UPDATE addr SET \
            zip = ?, \
            state = ?, \
            city = ?, \
            street = ?, \
            bldg = ?, \
            house = ? \
            WHERE id = ?',
            addr);
    } else {
        addr.unshift(empId);
        id = alasql('SELECT MAX(id) + 1 as id FROM addr')[0].id;
        addr.unshift(id);
        alasql(
            'INSERT INTO addr(\
            id, \
            emp, \
            zip, \
            state, \
            city, \
            street, \
            bldg, \
            house) \
            VALUES(?,?,?,?,?,?,?,?,?);',
            addr);
    }
    window.location.assign('emp.html?id=' + emp.id);
}
