# alasql-sample
```
・alasql.js
・purl.js
```

## 2016/11/27 部署異動の修正点

```
▼修正点

・db.js

// 身上情報
alasql('DROP TABLE IF EXISTS emp;');
alasql('CREATE TABLE emp(id INT IDENTITY, number STRING, name_kanji STRING, name_kana STRING, sex INT, birthday DATE, tel STRING, ctct_name STRING, ctct_addr STRING, ctct_tel STRING, pspt_no STRING, pspt_date STRING, pspt_name STRING, rental STRING, department INT);');
var pemp = alasql.promise('SELECT MATRIX * FROM CSV("data/EMP-EMP.csv", {headers: true})').then(function(emps) {
    for(var i = 0; i < emps.length; i++) {
        alasql('INSERT INTO emp VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', emps[i]);
    }
});

// 部署情報
alasql('DROP TABLE IF EXISTS department;');
alasql('CREATE TABLE department(id INT IDENTITY, name STRING, code STRING);');
var pdepartment = alasql.promise('SELECT MATRIX * FROM CSV("data/DEPARTMENT-DEPARTMENT.csv", {headers: true})').then(
    function(departments) {
        for (var i = 0; i < departments.length; i++) {
            alasql('INSERT INTO department VALUES(?,?,?);', departments[i]);
        }
    });

// 社員番号にひもづく部署情報の取得
DB.getDepartment = function(departmentId) {
    var departments = alasql('SELECT name FROM department WHERE id = ?', [ departmentId ]);
    if (departments.length) {
        return departments[0].name;
    } else {
        return '';
    }
};

・EMP-EMP.csv

id,number,name_kanji,name_kana,sex,birthday,tel,ctct_name,ctct_addr,ctct_tel,pspt_no,pspt_date,pspt_name,rental,department
1,WAP00104,山田太郎,ヤマダタロウ,1,1986-05-26,000-0000-0000,山田隆,東京都千代田区,02-0000-0000,1234,2014-12-12,パスポート名,3,1
2,WAP00105,山田太郎2,ヤマダタロウ2,2,1986-05-26,000-0000-0000,山田隆,東京都千代田区,02-0000-0000,1234,2014-12-12,パスポート名,3,2
3,WAP00106,山田太郎3,ヤマダタロウ3,2,1986-05-26,000-0000-0000,山田隆,東京都千代田区,02-0000-0000,1234,2014-12-12,パスポート名,3,3

・index.html

<div class="collapse navbar-collapse" id="navbar-collapse">
    <ul class="nav navbar-nav">
        <li class="active">
            <a href="index.html">個人情報管理</a>
        </li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
        <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-cog"></span>システム</a>
            <ul class="dropdown-menu">
                <li>
                    <a onclick="window.location.reload(true);"><span class="glyphicon glyphicon-refresh"></span>リロード</a>
                </li>
                <li>
                    <a onclick="DB.init();"><span class="glyphicon glyphicon-repeat"></span>DB初期化</a>
                </li>
                <li>
                    <a onclick="DB.remove();"><span class="glyphicon glyphicon-trash"></span>DB削除</a>
                </li>
                <li>
                    <a href="moving-department.html"><span class="glyphicon glyphicon-random"></span>部署異動</a>
                </li>
            </ul>
        </li>
    </ul>
</div>

▼新規作成

・DEPARTMENT-DEPARTMENT.csv

id,name,code
1,管理,kanri
2,技術,gijutu
3,総務,somu
4,人事,jinji
5,営業,eigyo

・moving-department.html
省略


```