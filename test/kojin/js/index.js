// リクエストパラメータを取得
var searchTarget = $.url().param("t") ? $.url().param("t") : "emp";
$('select[name="t"]').val(searchTarget);
var q0 = $.url().param("q0");
$('input[name="q0"]').val(q0);
var q1 = $.url().param("q1");
$('input[name="q1"]').val(q1);
var q2 = $.url().param("q2");
$('input[name="q2"]').val(q2);
var q3 = $.url().param("q3");
$('input[name="q3"]').val(q3);
var searchSex = $.url().param("s");
$('select[name="s"]').val(searchSex);

// データベース読み込み
var emps = [];
// and or複合検索
if (q0) {
    var orRet = getOrKeywordEmps(q0, searchTarget, searchSex);
    // andで絞りこむ
    var deleteIndexes = [];
    $.each(orRet, function (index1, emp) {
        $.each(q0.split(" "), function (index2, q) {
            var isContainFlg = false;
            $.each(Object.keys(emp), function (index3, key) {
                if (parseInt(("" + emp[key]).indexOf(q)) >= 0) {
                    isContainFlg = true;
                }
            });
            if (isContainFlg === false) {
                if (deleteIndexes.indexOf(index1) === -1) {
                    deleteIndexes.push(index1);
                }
            }
        });
    });
    $.each(deleteIndexes, function (index, deleteIndex) {
        delete orRet[deleteIndex];
    });
    var andRet = [];
    $.each(orRet, function (index, emp) {
        if (emp !== undefined) {
            andRet.push(emp);
        }
    });
    // or
    orRet = getOrKeywordEmps(q0, searchTarget, searchSex);
    // and
    // andとまーじ
    var orIds = [];
    $.each(orRet, function(index, emp) {
        orIds.push(emp["id"]);
    });

    $.each(andRet, function(index, emp) {
        // 存在しなければマージする
        if (orIds.indexOf(emp["id"]) < 0) {
            orRet.push(emp);
        }
    });
    emps = orRet;
} else if (q1) {
    var orRet = getOrKeywordEmps(q1, searchTarget, searchSex);
    // andで絞りこむ
    var deleteIndexes = [];
    $.each(orRet, function(index1, emp) {
        $.each(q1.split(" "), function(index2, q) {
            var isContainFlg = false;
            $.each(Object.keys(emp), function(index3, key) {
                if (parseInt(("" + emp[key]).indexOf(q)) >= 0) {
                    isContainFlg = true;
                }
            });
            if (isContainFlg === false) {
                if (deleteIndexes.indexOf(index1) === -1) {
                    deleteIndexes.push(index1);
                }
            }
        });
    });
    $.each(deleteIndexes, function(index, deleteIndex) {
        delete orRet[deleteIndex];
    });
    var andRet = [];
    $.each(orRet, function(index, emp) {
        if (emp !== undefined) {
            andRet.push(emp);
        }
    });
    emps = andRet;
} else if (q2) {
    // or検索
    emps = getOrKeywordEmps(q2, searchTarget, searchSex);
} else if (q3) {
    // not検索
    var orEmps = getOrKeywordEmps(q3, searchTarget, searchSex);
    var orIds = [];
    $.each(orEmps, function(index, orEmp) {
        orIds.push(orEmp.id);
    });
    var allEmps = alasql('SELECT * FROM emp');
    var notEmps = [];
    $.each(allEmps, function(index, emp) {
        if (orIds.indexOf(emp.id) === -1) {
            notEmps.push(emp);
        }
    });
    emps = notEmps;
} else {
    // デフォルト
    emps = alasql('SELECT * FROM emp');
    // 性別 (1 or 2)で絞り込む
    var sexEmps = [];
    if (searchSex && emps.length > 0) {
        $.each(emps, function(index, emp) {
            if (searchSex == emp.sex) {
                sexEmps.push(emp);
            }
        });
        emps = sexEmps;
    }
}

emps = emps.filter(function (x, i, self) {
        return self.indexOf(x) === i;
});

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

// 別ウィンドウで社員リストを開くボタン
$("#empsListBtn").on("click", function(event) {
    if ($("#empsListBtn").attr("disabled")) {
        return false;
    }
    var empIds = [];
    $(".emps-checks:checked").each(function(index, element) {
        empIds.push($(element).parent().parent().attr("data-emp-id"));
    });
    window.open("emps-list.html?ids=" + empIds.join(","), "_blank");
});
// チェックボックスチェック処理
$("#tbody-emps").on("change", ".emps-checks", function() {
    if ($(".emps-checks:checked").length > 0) {
        $("#empsListBtn").attr("disabled", false);
    } else {
        $("#empsListBtn").attr("disabled", true);
    }
});

// サジェスト候補生成
var empsSuggests = alasql('SELECT number, name_kanji, name_kana FROM emp');
var addrSuggests = alasql('SELECT zip, city, street, bldg FROM addr');
var eduSuggests = alasql('SELECT school, major FROM edu');
var familySuggests = alasql('SELECT name_kanji, name_kana, relation FROM family');
var choiceSuggests = alasql('SELECT text FROM choice');

// フリーワードサジェスト生成
var andOrSuggestArea = $("#andor-suggest");
var andSuggestArea = $("#and-suggest");
var orSuggestArea = $("#or-suggest");
var notSuggestArea = $("#not-suggest");
$.each(empsSuggests, function(index, emp) {
    andOrSuggestArea.append('<option value="' + emp.name_kanji + '">');
    andOrSuggestArea.append('<option value="' + emp.name_kana + '">');

    andSuggestArea.append('<option value="' + emp.name_kanji + '">');
    andSuggestArea.append('<option value="' + emp.name_kana + '">');
    
    orSuggestArea.append('<option value="' + emp.name_kanji + '">');
    orSuggestArea.append('<option value="' + emp.name_kana + '">');
    
    notSuggestArea.append('<option value="' + emp.name_kanji + '">');
    notSuggestArea.append('<option value="' + emp.name_kana + '">');
});
$.each(addrSuggests, function(index, addr) {
    andOrSuggestArea.append('<option value="' + addr.zip + '">');
    andOrSuggestArea.append('<option value="' + addr.city + '">');
    andOrSuggestArea.append('<option value="' + addr.street + '">');
    andOrSuggestArea.append('<option value="' + addr.bldg + '">');

    andSuggestArea.append('<option value="' + addr.zip + '">');
    andSuggestArea.append('<option value="' + addr.city + '">');
    andSuggestArea.append('<option value="' + addr.street + '">');
    andSuggestArea.append('<option value="' + addr.bldg + '">');
    
    orSuggestArea.append('<option value="' + addr.zip + '">');
    orSuggestArea.append('<option value="' + addr.city + '">');
    orSuggestArea.append('<option value="' + addr.street + '">');
    orSuggestArea.append('<option value="' + addr.bldg + '">');
    
    notSuggestArea.append('<option value="' + addr.zip + '">');
    notSuggestArea.append('<option value="' + addr.city + '">');
    notSuggestArea.append('<option value="' + addr.street + '">');
    notSuggestArea.append('<option value="' + addr.bldg + '">');
});
$.each(eduSuggests, function(index, edu) {
    andOrSuggestArea.append('<option value="' + edu.school + '">');
    andOrSuggestArea.append('<option value="' + edu.major + '">');

    andSuggestArea.append('<option value="' + edu.school + '">');
    andSuggestArea.append('<option value="' + edu.major + '">');
    
    orSuggestArea.append('<option value="' + edu.school + '">');
    orSuggestArea.append('<option value="' + edu.major + '">');
    
    notSuggestArea.append('<option value="' + edu.school + '">');
    notSuggestArea.append('<option value="' + edu.major + '">');
});
$.each(familySuggests, function(index, family) {
    andOrSuggestArea.append('<option value="' + family.name_kanji + '">');
    andOrSuggestArea.append('<option value="' + family.name_kana + '">');
    andOrSuggestArea.append('<option value="' + family.relation + '">');

    andSuggestArea.append('<option value="' + family.name_kanji + '">');
    andSuggestArea.append('<option value="' + family.name_kana + '">');
    andSuggestArea.append('<option value="' + family.relation + '">');
    
    orSuggestArea.append('<option value="' + family.name_kanji + '">');
    orSuggestArea.append('<option value="' + family.name_kana + '">');
    orSuggestArea.append('<option value="' + family.relation + '">');
    
    notSuggestArea.append('<option value="' + family.name_kanji + '">');
    notSuggestArea.append('<option value="' + family.name_kana + '">');
    notSuggestArea.append('<option value="' + family.relation + '">');
});
$.each(choiceSuggests, function(index, choice) {
    andOrSuggestArea.append('<option value="' + choice.text + '">');

    andSuggestArea.append('<option value="' + choice.text + '">');
    
    orSuggestArea.append('<option value="' + choice.text + '">');
    
    notSuggestArea.append('<option value="' + choice.text + '">');
});

/**
 * q = フリーワード検索文字列
 * searchTarget = 検索対象テーブル(emp|edu|addr|dept|family)
 * searchSex = 検索対象性別(男性|女性|男女)
 */
function getOrKeywordEmps(q, searchTarget, searchSex) {
    var refines = q.split(" ");
    var rets = [];
    var emps = [];
    var eduEmps = [];
    var addrEmps = [];
    var familyEmps = [];
    var sexEmps = [];
    var houseEmps = [];
    var stateEmps = [];
    var deptEmps = [];

    $.each(refines, function(index, q) {
        if (searchTarget === "emp") {
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
                "OR rental LIKE ?", [
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                ]);
        }
        // eduを見に行く
        if (searchTarget === "edu") {
            eduEmps = alasql(
                'SELECT emp.*, edu.school, edu.major FROM emp JOIN edu ON emp.id = edu.emp WHERE edu.school LIKE ? OR edu.major LIKE ?', [
                    '%' + q + '%',
                    '%' + q + '%',
                ]
            );
            if (emps.length === 0) {
                emps = eduEmps;
            }
        }
        // addrも見に行く
        if (searchTarget === "addr") {
            addrEmps = alasql(
                'SELECT emp.*, addr.city, addr.street, addr.bldg FROM emp JOIN addr ON emp.id = addr.emp WHERE addr.city LIKE ? OR addr.street LIKE ? OR addr.bldg LIKE ?', [
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                ]
            );
            if (emps.length === 0) {
                emps = addrEmps;
            }
        }
        if (searchTarget === "family") {
            // ファミリー
            familyEmps = alasql(
                'SELECT emp.*, family.name_kanji as family_kanji, family.name_kana as family_kana, family.relation FROM emp JOIN family ON emp.id = family.emp WHERE family.name_kanji LIKE ? OR family.name_kana LIKE ? OR family.relation LIKE ?', [
                    '%' + q + '%',
                    '%' + q + '%',
                    '%' + q + '%',
                ]
            );
            if (emps.length === 0) {
                emps = familyEmps;
            }
        }

        // その他(CHOICE関連)
        if (searchTarget === "other") {
            // house
            houseEmps = alasql(
                'select emp.*, choice.text as house_name from emp join addr ON emp.id = addr.emp JOIN choice ON addr.house = choice.id where choice.text LIKE ?', ['%' + q + '%']
            );
            if (emps.length === 0) {
                emps = houseEmps;
            }
            // state
            stateEmps = alasql(
                'select emp.*, choice.text as state_name from emp join addr ON emp.id = addr.emp JOIN choice ON addr.state = choice.id where choice.text LIKE ?', ['%' + q + '%']
            );
            if (emps.length === 0) {
                emps = stateEmps;
            }
            // 所属部署
            deptEmps = alasql(
                'select emp.*, choice.text as dept_name from emp join department ON emp.id = department.emp JOIN choice ON department.department = choice.id where choice.text LIKE ?', ['%' + q + '%']
            );
            if (emps.length === 0) {
                emps = deptEmps;
            }
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
        // retsに存在しないempなら、retsに詰める
        var retIds = [];
        $.each(rets, function(index, ret) {
            retIds.push(ret.id);
        });
        if (retIds.length > 0) {
            $.each(emps, function(index, emp) {
                if (retIds.indexOf(emp.id) < 0) {
                    rets.push(emp);
                }
            });
        } else {
            rets = emps;
        }
        
        // 性別 (1 or 2)で絞り込む
        if (searchSex && rets.length > 0) {
            $.each(rets, function(index, emp) {
                if (searchSex == emp.sex) {
                    sexEmps.push(emp);
                }
            });
        }
        rets = sexEmps;
    });
    return rets;
}