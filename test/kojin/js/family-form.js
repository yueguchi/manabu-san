// 性別
var sexes = DB.choices('sex');
for (var i = 0; i < sexes.length; i++) {
    var sex = sexes[i];
    $('<option>').attr('value', sex.id).text(sex.text).appendTo($('#sex select'));
}

// 同居区分
var cohabits = DB.choices('cohabit');
for(var i = 0; i < cohabits.length; i++) {
    var cohabit = cohabits[i];
    $('<option>').attr('value', cohabit.id).text(cohabit.text).appendTo($('#cohabit select'));
}

// 扶養区分
var cares = DB.choices('care');
for(var i = 0; i < cares.length; i++) {
    var care = cares[i];
    $('<option>').attr('value', care.id).text(care.text).appendTo($('#care select'));
}

var id = parseInt($.url().param('id'));
if (id) {
    // 家族情報読み込み
    var family = alasql('SELECT * FROM family WHERE id=?', [ id ])[0];
    $("#name_kanji input").val(family.name_kanji);
    $("#name_kana input").val(family.name_kana);
    $("#sex select").val(family.sex);
    $("#birthday input").val(family.birthday);
    $("#relation input").val(family.relation);
    $("#cohabit select").val(family.cohabit);
    $("#care select").val(family.care);
}

// 画像・氏名更新
var empId = family ? family.emp : parseInt($.url().param('emp'));
var emp = alasql('SELECT * FROM emp WHERE id=?', [ empId ])[0];
$("#img-emp").attr("src", "img/" + emp.id + ".jpg");
$("#div-name_kanji").text(emp.name_kanji);
$("#div-name_kana").text(emp.name_kana);
$("#div-number").text(emp.number);
$("#nav-emp").attr("href", "emp.html?id=" + empId).text(emp.name_kanji);

// 保存
function update() {
    var family = [];
    family.push($("#name_kanji input").val());
    family.push($("#name_kana input").val());
    family.push(parseInt($("#sex select").val()));
    family.push($("#birthday input").val());
    family.push($("#relation input").val());
    family.push(parseInt($("#cohabit select").val()));
    family.push(parseInt($("#care select").val()));
    
    if (id) {
        family.push(id);
        alasql(
            'UPDATE family SET \
            name_kanji = ?, \
            name_kana = ?, \
            sex = ?, \
            birthday = ?, \
            relation = ?, \
            cohabit = ?, \
            care = ? \
            WHERE id = ?',
            family);
    } else {
        family.unshift(empId);
        id = alasql('SELECT MAX(id) + 1 as id FROM family')[0].id;
        family.unshift(id);
        alasql(
            'INSERT INTO family(\
            id, \
            emp, \
            name_kanji, \
            name_kana, \
            sex, \
            birthday, \
            relation, \
            cohabit, \
            care) \
            VALUES(?,?,?,?,?,?,?,?,?);',
            family);
    }
    window.location.assign('emp.html?id=' + emp.id);
}
