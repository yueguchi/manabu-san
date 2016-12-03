// リクエストパラメータを取得
var q1 = $.url().param("q1");
$('input[name="q1"]').val(q1);
var q2 = $.url().param("q2");
$('input[name="q2"]').val(q2);
var q3 = $.url().param("q3");
$('input[name="q3"]').val(q3);

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
if (q3) {
    emps = alasql(
        "select * from emp " +
        "WHERE name_kanji LIKE ? " +
        "OR name_kana LIKE ? " +
        "OR number LIKE ? " +
        "OR birthday LIKE ? " +
        "OR tel LIKE ? " +
        "OR ctct_name LIKE ? " +
        "OR ctct_addr LIKE ? " +
        "OR ctct_tel LIKE ? " +
        "OR pspt_no LIKE ? " +
        "OR pspt_date LIKE ? " +
        "OR pspt_name LIKE ? " +
        "OR rental LIKE ?"
        ,
        [
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
        ]);
    // empを見に行く
    eduEmps = alasql(
        'SELECT emp.* FROM emp JOIN edu ON emp.id = edu.emp WHERE edu.school LIKE ? OR edu.major LIKE ?'
        ,
        [
            '%' + q3 + '%',
            '%' + q3 + '%',
        ]
    );
    if (emps.length === 0) {
        emps = eduEmps;
    }
    // addrも見に行く
    addrEmps = alasql(
        'SELECT emp.* FROM emp JOIN addr ON emp.id = addr.emp WHERE addr.city LIKE ? OR addr.street LIKE ? OR addr.bldg LIKE ?'
        ,
        [
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
        ]
    );
    if (emps.length === 0) {
        emps = addrEmps;
    }
    // ファミリー
    familyEmps = alasql(
        'SELECT emp.* FROM emp JOIN family ON emp.id = family.emp WHERE family.name_kanji LIKE ? OR family.name_kana LIKE ? OR family.relation LIKE ?'
        ,
        [
            '%' + q3 + '%',
            '%' + q3 + '%',
            '%' + q3 + '%',
        ]
    );
    if (emps.length === 0) {
        emps = familyEmps;
    }
    
    // その他(CHOICE関連)
    // sex
    sexEmps = alasql(
        'select emp.* from emp join choice ON emp.sex = choice.id where choice.text LIKE ?'
        , ['%' + q3 + '%']
    );
    if (emps.length === 0) {
        emps = sexEmps;
    }
    // house
    houseEmps = alasql(
        'select emp.* from emp join addr ON emp.id = addr.emp JOIN choice ON addr.house = choice.id where choice.text LIKE ?'
        , ['%' + q3 + '%']
    );
    if (emps.length === 0) {
        emps = houseEmps;
    }
    // state
    stateEmps = alasql(
        'select emp.* from emp join addr ON emp.id = addr.emp JOIN choice ON addr.state = choice.id where choice.text LIKE ?'
        , ['%' + q3 + '%']
    );
    if (emps.length === 0) {
        emps = stateEmps;
    }
    // 所属部署
    deptEmps = alasql(
        'select emp.* from emp join department ON emp.id = department.emp JOIN choice ON department.department = choice.id where choice.text LIKE ?'
        , ['%' + q3 + '%']
    );
    if (emps.length === 0) {
        emps = deptEmps;
    }
    
    
    // マージ
     var ids = [];
     $.each(emps, function(index, emp) {
         ids.push(emp.id);
     });
    // edu
    $.each(eduEmps, function(index, eduEmp) {
        if (ids.indexOf(eduEmp.id) < 0) {
            emps.push(eduEmp);
        }
    });
    // addr
    $.each(addrEmps, function(index, addrEmp) {
        if (ids.indexOf(addrEmp.id) < 0) {
            emps.push(addrEmp);
        }
    });
    // sex
    $.each(sexEmps, function(index, sexEmp) {
        if (ids.indexOf(sexEmp.id) < 0) {
            emps.push(sexEmp);
        }
    });
    // house
    $.each(houseEmps, function(index, houseEmp) {
        if (ids.indexOf(houseEmp.id) < 0) {
            emps.push(houseEmp);
        }
    });
    // state
    $.each(stateEmps, function(index, stateEmp) {
        if (ids.indexOf(stateEmp.id) < 0) {
            emps.push(stateEmp);
        }
    });
    // 所属部署
    $.each(deptEmps, function(index, deptEmp) {
        if (ids.indexOf(deptEmp.id) < 0) {
            emps.push(deptEmp);
        }
    });
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