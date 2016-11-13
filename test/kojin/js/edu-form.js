var id = parseInt($.url().param('id'));
if (id) {
    // 家族情報読み込み
    var edu = alasql('SELECT * FROM edu WHERE id=?', [ id ])[0];
    $("#school input").val(edu.school);
    $("#major input").val(edu.major);
    $("#grad input").val(edu.grad);
}

// 画像・氏名更新
var empId = edu ? edu.emp : parseInt($.url().param('emp'));
var emp = alasql('SELECT * FROM emp WHERE id=?', [ empId ])[0];
$("#img-emp").attr("src", "img/" + emp.id + ".jpg");
$("#div-name_kanji").text(emp.name_kanji);
$("#div-name_kana").text(emp.name_kana);
$("#div-number").text(emp.number);
$("#nav-emp").attr("href", "emp.html?id=" + empId).text(emp.name_kanji);

// 保存
function update() {
    var edu = [];
    edu.push($("#school input").val());
    edu.push($("#major input").val());
    edu.push($("#grad input").val());
    
    if (id) {
        edu.push(id);
        alasql(
            'UPDATE edu SET \
            school = ?, \
            major = ?, \
            grad = ? \
            WHERE id = ?',
            edu);
    } else {
        edu.unshift(empId);
        id = alasql('SELECT MAX(id) + 1 as id FROM edu')[0].id;
        edu.unshift(id);
        alasql(
            'INSERT INTO edu(\
            id, \
            emp, \
            school, \
            major, \
            grad) \
            VALUES(?,?,?,?,?);',
            edu);
    }
    window.location.assign('emp.html?id=' + emp.id);
}
