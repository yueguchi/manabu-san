
$(function() {
    // 身上読込
    var ids = $.url().param("ids");
    $.each(ids.split(","), function(index, id) {
        console.log("debug....");
        // 社員情報
        var emp = alasql('SELECT*FROM emp WHERE id=?', parseInt(id))[0];
        var target = $(".copy-hidden-area").clone();
        target.removeClass("copy-hidden-area");
        target.find("#number").attr("id", "number_" + emp.id).text(emp.number);
        target.find("#name_kanji").attr("id", "name_kanji_" + emp.id).text(emp.name_kanji);;
        target.find("#name_kana").attr("id", "name_kana_" + emp.id).text(emp.name_kana);;
        target.find("#sex").attr("id", "sex_" + emp.id).text(DB.choice(emp.sex));
        target.find("#birthday").attr("id", "birthday_" + emp.id).text(emp.birthday);
        target.find("#tel").attr("id", "tel_" + emp.id).text(emp.tel);
        target.find("#ctct_name").attr("id", "ctct_name_" + emp.id).text(emp.ctct_name);
        target.find("#ctct_addr").attr("id", "ctct_addr_" + emp.id).text(emp.ctct_addr);
        target.find("#ctct_tel").attr("id", "ctct_tel_" + emp.id).text(emp.ctct_tel);
        target.find("#pspt_no").attr("id", "pspt_no_" + emp.id).text(emp.pspt_no);
        target.find("#pspt_date").attr("id", "pspt_date_" + emp.id).text(emp.pspt_date);
        target.find("#pspt_name").attr("id", "pspt_name_" + emp.id).text(emp.pspt_name);
        target.find("#rental_name").attr("id", "rental_" + emp.id).text(DB.choice(emp.rental));
        // 各ボタンにid属性を付与しておく
        target.find(".emp-remove-btn").attr("data-emp-id", emp.id);
        target.find(".addr-adding-btn").attr("data-emp-id", emp.id);
        target.find(".family-adding-btn").attr("data-emp-id", emp.id);
        target.find(".edu-adding-btn").attr("data-emp-id", emp.id);
        
        // 画像・氏名変更
        target.find("#img-emp").attr("id", "img-emp_" + emp.id).attr("src", 'img/' + emp.id + '.jpg');
        target.find('#div-name_kanji').attr("id", "div-name_kanji_" + emp.id).text(emp.name_kanji);
        target.find('#div-name_kana').attr("id", "div-name_kana_" + emp.id).text(emp.name_kana);
        target.find('#div-number').attr("id", "div-number_" + emp.id).text(emp.number);
        target.find('#nav-emp').attr("id", "nav-emp_" + emp.id).text(emp.name_kanji);
        target.find('#form-emp').attr("id", "form-emp_" + emp.id).attr("href", "emp-form.html?id=" + emp.id);
        // tab操作
        target.find("#copy-profile-tab").attr("id", "copy-profile-tab_" + emp.id).attr("href", "#profile_" + emp.id);
        target.find("#copy-addr-tab").attr("id", "copy-addr-tab_" + emp.id).attr("href", "#addr_" + emp.id);
        target.find("#copy-family-tab").attr("id", "copy-family-tab_" + emp.id).attr("href", "#family_" + emp.id);
        target.find("#copy-education-tab").attr("id", "copy-education-tab_" + emp.id).attr("href", "#education_" + emp.id);
        target.find("#copy-department-tab").attr("id", "copy-department-tab_" + emp.id).attr("href", "#department_" + emp.id);
        // tabの中身も操作
        target.find("#profile").attr("id", "profile_" + emp.id);
        target.find("#addr").attr("id", "addr_" + emp.id);
        target.find("#family").attr("id", "family_" + emp.id);
        target.find("#education").attr("id", "education_" + emp.id);
        target.find("#department").attr("id", "department_" + emp.id);
        
        // 住所情報
        // 住所情報読み込み
        var addrs = alasql('SELECT * FROM addr WHERE emp=?', [ emp.id ]);
        for(var i = 0; i < addrs.length; i++) {
            var addr = addrs[i];
            var tr = $('<tr>').appendTo(target.find('#tbody-addr'));
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
        target.find('#ins-addr').attr('href', 'addr-form.html?emp=' + emp.id);
        // idの書き換え
        target.find("#tbody-addr").attr("id", "tbody-addr_" + emp.id);
        target.find("#ins-addr").attr("id", "ins-addr_" + emp.id);
        
        // 家族情報
        var families = alasql('SELECT * FROM family WHERE emp=?', [ emp.id ]);
        for(var i = 0; i < families.length; i++) {
            var family = families[i];
            var tr = $('<tr>').appendTo(target.find('#tbody-family'));
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
        target.find('#ins-family').attr("href", 'family-form.html?emp=' + emp.id);
        // id書き換え
        target.find("#tbody-family").attr("id", "tbody-family" + emp.id);
        target.find("#ins-family").attr("id", "ins-family" + emp.id);
        
        // 学歴情報読み取り
        var edus = alasql('SELECT * FROM edu WHERE emp = ?', [ emp.id ]);
        for (var i = 0; i < edus.length; i++) {
            var edu = edus[i];
            var tr = $('<tr>').appendTo(target.find('#tbody-edu'));
            tr.append('<td>' + edu.school + '</td>');
            tr.append('<td>' + edu.major + '</td>');
            tr.append('<td>' + edu.grad + '</td>');
            var td = $('<td class="text-right">').appendTo(tr);
            $('<a href="edu-form.html?id=' + edu.id + '" class="btn btn-xs btn-primary">').html(
                '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
            $('<span> </span>').appendTo(td);
            $('<a class="btn btn-xs btn-danger">').html('<span class="glyphicon glyphicon-remove"></span> 削除').appendTo(td);
        }
        target.find('#ins-edu').attr("href", 'edu-form.html?emp=' + emp.id);
        // id書き換え
        target.find("#tbody-edu").attr("id", "tbody-edu" + emp.id);
        target.find("#ins-edu").attr("id", "ins-edu" + emp.id);

        // 部署情報
        // 部署情報取得
        var dept = DB.getDepartment(emp.department);
        var tr = $('<tr>').appendTo(target.find('#tbody-dept'));
        tr.append('<td>' + dept + '</td>');
        var td = $('<td class="text-right">').appendTo(tr);
        $('<a href="dept-form.html?id=' + emp.id + '" class="btn btn-xs btn-primary">').html(
            '<span class="glyphicon glyphicon-pencil"></span> 編集').appendTo(td);
        
        // id書き換え
        target.find("#tbody-dept").attr("id", "tbody-dept" + emp.id);

        
        target.show();
        $(".emps-area").append(target);
    });

    // 社員削除ボタン
    $(".emp-remove-btn").each(function(index, element) {
        $(element).on("click", function() {
            var id = parseInt($(this).attr("data-emp-id"));
            if (window.confirm('削除は取り消せません。よろしいですか？')) {
                alasql('DELETE FROM emp WHERE id=?', [ id ]);
                window.location.assign('index.html');
            }
        });
    });
    // 住所追加ボタン
    $(".addr-adding-btn").each(function(index, element) {
        $(element).on("click", function() {
            var id = parseInt($(this).attr("data-emp-id"));
            location.href = "addr-form.html?emp=" + id;
        });
    });
    // 家族追加
    $(".family-adding-btn").each(function(index, element) {
        $(element).on("click", function() {
            var id = parseInt($(this).attr("data-emp-id"));
            location.href = "family-form.html?emp=" + id;
        });
    });
    // 学歴
    $(".edu-adding-btn").each(function(index, element) {
        $(element).on("click", function() {
            var id = parseInt($(this).attr("data-emp-id"));
            location.href = "edu-form.html?emp=" + id;
        });
    });
});