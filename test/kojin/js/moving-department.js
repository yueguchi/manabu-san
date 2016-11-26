/**
 * Created by eguchi on 2016/11/26.
 */

var departments = alasql('SELECT * FROM department');
var emps = alasql('SELECT * FROM emp');
for (var i = 0; i < departments.length; i++) {
    var target = $(".sample").clone();
    target.removeClass("hidden").removeClass("sample");
    // DnDのためにclass名を降っておく
    target.addClass(departments [i].code + "-area");
    target.attr("data-department-id", departments[i].id);

    target.find(".department-name").text(departments[i].name);
    // 社員情報を初期化。空にしておく
    target.find(".emps-list").empty();
    // 社員情報のdepartment名と部門情報のnameが一致すれば、画面に表示させる
    for (var y = 0; y < emps.length; y++) {
        var emp = emps[y];
        var departmenrName = DB.getDepartment(emp.department);
        if (departmenrName === departments[i].name) {
            var tag = "<li data-emp-id='" + emp.id + "' data-department-id='" + departments[i].id + "'>" + "<img class='small-emp-img' src='../img/" + emp.id +  ".jpg'>" + emp.name_kanji + "</li>";
            target.find(".emps-list").append(tag);
        }
    }
    target.appendTo($(".department-list"));
}

// DnD処理
$(".emps-list").find("li").draggable(
    {
        axis: "x"
    }
);

$(".department-list").find("li").droppable(
    {
        drop : function(event , ui){ // ドロップされた時に動きます
            console.log("部署ID: " +  $(this).attr("data-department-id"));
            console.log("社員ID: " + ui.draggable.first().attr("data-emp-id"));
            // DB操作
            var ret = alasql("update emp set department = ? where id = ?;", [parseInt($(this).attr("data-department-id")), parseInt(ui.draggable.first().attr("data-emp-id"))]);
            location.reload();
        }
    }
);
