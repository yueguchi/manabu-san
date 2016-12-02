var id = parseInt($.url().param('id'));
if (id) {
    // 家族情報読み込み
    var dept = alasql('SELECT * FROM department WHERE id=?', [ id ])[0];
}

// 画像・氏名更新
var empId = dept ? dept.emp : parseInt($.url().param('emp'));
var emp = alasql('SELECT * FROM emp WHERE id=?', [ empId ])[0];
$("#img-emp").attr("src", "img/" + emp.id + ".jpg");
$("#div-name_kanji").text(emp.name_kanji);
$("#div-name_kana").text(emp.name_kana);
$("#div-number").text(emp.number);
$("#nav-emp").attr("href", "emp.html?id=" + empId).text(emp.name_kanji);

// 部署選択肢生成
var departments = DB.choices('department');
for (var i = 0; i < departments.length; i++) {
    var department = departments[i];
    $('<option>').attr('value', department.id).text(department.text).appendTo($('#dept select'));
}

// 保存
function update() {
    var dept = [];
    dept.push(parseInt($("#dept select").val()));
    if (id) {
        dept.push(empId);
        alasql(
            'UPDATE department SET \
            department = ? \
            WHERE id = ?',
            dept);
    } else {
        dept.unshift(empId);
        id = alasql('SELECT MAX(id) + 1 as id FROM department')[0].id;
        dept.unshift(id);
        alasql(
            'INSERT INTO department(\
            id, \
            emp, \
            department) \
            VALUES(?,?,?);',
            dept);
    }
    window.location.assign('emp.html?id=' + emp.id);
}
