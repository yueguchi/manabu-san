// リクエストパラメータを取得
var q1 = $.url().param("q1");
$('input[name="q1"]').val(q1);
var q2 = $.url().param("q2");
$('input[name="q2"]').val(q2);

// データベース読み込み
var emps;
if(q1) {
    emps = alasql('SELECT * FROM emp WHERE number LIKE ? ', ['%' + q1 + '%']);
} else if (q2) {
    q2 = '%' + q2 + '%';
    emps = alasql('SELECT * FROM emp WHERE name_kanji LIKE ? OR name_kana LIKE ?', [q2, q2]);
} else {
    emps = alasql('SELECT * FROM emp', []);
}

// 社員一覧の表示
var tbody = $("#tbody-emps");
for (var i = 0; i < emps.length; i++) {
    var emp = emps[i];
    var tr = $('<tr data-emp-id="' + emp.id + '"></tr>');
    tr.append('<td><input type="checkbox" value="1" class="emps-checks" name="employees-checks"></td>');
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
$("#empsDetailBtn").on("click", function(event) {
    var empIds = [];
    $(".emps-checks:checked").each(function(index, element) {
        empIds.push($(element).parent().parent().attr("data-emp-id"));
    });
    location.href = "emps-detail.html?ids=" + empIds.join(",");
});

$("#tbody-emps").on("change", ".emps-checks", function() {
    if ($(".emps-checks:checked").length > 0 ) {
        $("#empsDetailBtn").attr("disabled", false);
    } else {
        $("#empsDetailBtn").attr("disabled", true);
    }
});