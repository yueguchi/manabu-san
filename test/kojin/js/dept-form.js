var empId = parseInt($.url().param('id'));

// 画像・氏名更新
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
    if (empId) {
        dept.push(empId);
        alasql(
            'UPDATE emp SET \
            department = ? \
            WHERE id = ?',
            dept);
    }
    window.location.assign('emp.html?id=' + emp.id);
}
