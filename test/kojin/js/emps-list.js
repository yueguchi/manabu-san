var ids = $.url().param("ids");
var emps = [];
$.each(ids.split(","), function(index, id) {
    var emp = alasql('SELECT * from emp WHERE id = ?', parseInt(id))[0];
    if (!emp) {
        alert("id = " + id + "の従業員は存在しません。");
    } else {
        emps.push(emp);
    }
});
// 社員一覧の表示
var tbody = $("#tbody-emps");
for (var i = 0; i < emps.length; i++) {
    var emp = emps[i];
    var tr = $('<tr data-emp-id="' + emp.id + '"></tr>');
    tr.append('<td><img height=40 class="img-circle" src="img/' + emp.id + '.jpg"></td>');
    tr.append('<td><a href="emp.html?id=' + emp.id + '">' + emp.number + '</a></td>');
    tr.append('<td>' + emp.name_kanji + '</td>');
    tr.append('<td>' + emp.name_kana + '</td>');
    tr.append('<td>' + DB.choice(emp.sex) + '</td>');
    tr.append('<td>' + emp.birthday + '</td>');
    tr.append('<td>' + emp.tel + '</td>');
    tr.appendTo(tbody);
}

// 一括詳細ボタン
$("#empsListBtn").on("click", function(event) {
    var empIds = [];
    $(".emps-checks:checked").each(function(index, element) {
        empIds.push($(element).parent().parent().attr("data-emp-id"));
    });
    location.href = "emps-list.html?ids=" + empIds.join(",");
});

$("#tbody-emps").on("change", ".emps-checks", function() {
    if ($(".emps-checks:checked").length > 0) {
        $("#empsDetailBtn").attr("disabled", false);
    } else {
        $("#empsDetailBtn").attr("disabled", true);
    }
});