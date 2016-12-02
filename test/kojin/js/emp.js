// 身上読込
var id = parseInt($.url().param("id"));
var emp = alasql('SELECT * FROM emp WHERE id=?', [ id ])[0];

$("#number").text(emp.number);
$("#name_kanji").text(emp.name_kanji);
$("#name_kana").text(emp.name_kana);
$("#sex").text(DB.choice(emp.sex));
$("#birthday").text(emp.birthday);
$("#tel").text(emp.tel);
$("#ctct_name").text(emp.ctct_name);
$("#ctct_addr").text(emp.ctct_addr);
$("#ctct_tel").text(emp.ctct_tel);
$("#pspt_no").text(emp.pspt_no);
$("#pspt_date").text(emp.pspt_date);
$("#pspt_name").text(emp.pspt_name);
$("#rental").text(DB.choice(emp.rental));

// 画像・氏名変更
$("#img-emp").attr("src", 'img/' + emp.id + '.jpg');
$('#div-name_kanji').text(emp.name_kanji);
$('#div-name_kana').text(emp.name_kana);
$('#div-number').text(emp.number);
$('#nav-emp').text(emp.name_kanji);
$('#form-emp').attr("href", "emp-form.html?id=" + id);

// 住所情報読み込み
var addrs = alasql('SELECT * FROM addr WHERE emp=?', [ id ]);
for(var i = 0; i < addrs.length; i++) {
    var addr = addrs[i];
    var tr = $('<tr>').appendTo('#tbody-addr');
    tr.append('<td>' + addr.zip + '</td>');
    tr.append('<td>' + DB.choice(addr.state) + '</td>');
    tr.append('<td>' + addr.city + '</td>');
    tr.append('<td>' + addr.street + '</td>');
    tr.append('<td>' + addr.bldg + '</td>');
    tr.append('<td>' + DB.choice(addr.house) + '</td>');
    var td = $('<td class="text-right">').appendTo(tr);
    $('<a href="addr-form.html?id=' + addr.id + '" class="btn btn-xs btn-primary">').html(
        '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
    $('<span> </span>').appendTo(td);
    $('<a class="btn btn-xs btn-danger">').html('<span class="glyphicon glyphicon-remove"></span> 削除').appendTo(td);
}
$('#ins-addr').attr('href', 'addr-form.html?emp=' + id);

// 家族情報読み込み
var families = alasql('SELECT * FROM family WHERE emp=?', [ id ]);
for(var i = 0; i < families.length; i++) {
    var family = families[i];
    var tr = $('<tr>').appendTo('#tbody-family');
    tr.append('<td>' + family.name_kanji + '</td>');
    tr.append('<td>' + family.name_kana + '</td>');
    tr.append('<td>' + DB.choice(family.sex) + '</td>');
    tr.append('<td>' + family.birthday + '</td>');
    tr.append('<td>' + family.relation + '</td>');
    tr.append('<td>' + DB.choice(family.cohabit) + '</td>');
    tr.append('<td>' + DB.choice(family.care) + '</td>');
    var td = $('<td class="text-right">').appendTo(tr);
    $('<a href="family-form.html?id=' + family.id + '" class="btn btn-xs btn-primary">').html(
        '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
    $('<span> </span>').appendTo(td);
    $('<a class="btn btn-xs btn-danger">').html('<span class="glyphicon glyphicon-remove"></span> 削除').appendTo(td);
}
$('#ins-family').attr("href", 'family-form.html?emp=' + id);

// 学歴情報読み取り
var edus = alasql('SELECT * FROM edu WHERE emp = ?', [ id ]);
for (var i = 0; i < edus.length; i++) {
    var edu = edus[i];
    var tr = $('<tr>').appendTo('#tbody-edu');
    tr.append('<td>' + edu.school + '</td>');
    tr.append('<td>' + edu.major + '</td>');
    tr.append('<td>' + edu.grad + '</td>');
    var td = $('<td class="text-right">').appendTo(tr);
    $('<a href="edu-form.html?id=' + edu.id + '" class="btn btn-xs btn-primary">').html(
        '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
    $('<span> </span>').appendTo(td);
    $('<a class="btn btn-xs btn-danger">').html('<span class="glyphicon glyphicon-remove"></span> 削除').appendTo(td);
}
$('#ins-edu').attr("href", 'edu-form.html?emp=' + id);

// 部署情報取得
var depts = alasql('SELECT * FROM department WHERE emp = ?', [ id ]);
for (var i = 0; i < depts.length; i++) {
    var dept = depts[i];
    var deptName = DB.getDepartment(dept.department);
    var tr = $('<tr>').appendTo('#tbody-dept');
    tr.append('<td>' + deptName + '</td>');
    var td = $('<td class="text-right">').appendTo(tr);
    $('<a href="dept-form.html?id=' + dept.id + '" class="btn btn-xs btn-primary">').html(
        '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
    $('<span> </span>').appendTo(td);
}
$('#ins-dept').attr("href", 'dept-form.html?emp=' + id);

// 社員削除
function destroy() {
    if (window.confirm('削除は取り消せません。よろしいですか？')) {
        alasql('DELETE FROM emp WHERE id=?', [ id ]);
        window.location.assign('index.html');
    }
}