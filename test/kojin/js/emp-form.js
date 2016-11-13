// 住所
var sexes = DB.choices('sex');
for(var i = 0; i < sexes.length; i++) {
    var sex = sexes[i];
    $('<option>').attr('value', sex.id).text(sex.text).appendTo($('#sex select'));
}

// 貸与区分
var rentals = DB.choices('rental');
for (var i = 0; i < rentals.length; i++) {
    var rental = rentals[i];
    $('<option>').attr('value', rental.id).text(rental.text).appendTo($('#rental select'));
}

var id = parseInt($.url().param('id'));

if (id) {
    // 身上情報読み込み
    var emp = alasql('SELECT * FROM emp WHERE id=?', [ id ])[0];
    $('#number input').val(emp.number);
    $('#name_kanji input').val(emp.name_kanji);
    $('#name_kana input').val(emp.name_kana);
    $('#sex select').val(emp.sex);
    $('#birthday input').val(emp.birthday);
    $('#tel input').val(emp.tel);
    $('#ctct_name input').val(emp.ctct_name);
    $('#ctct_addr input').val(emp.ctct_addr);
    $('#ctct_tel input').val(emp.ctct_tel);
    $('#pspt_no input').val(emp.pspt_no);
    $('#pspt_date input').val(emp.pspt_date);
    $('#pspt_name input').val(emp.pspt_name);
    $('#rental select').val(emp.rental);
    
    // 画像・氏名更新
    $('#img-emp').attr('src', 'img/' + emp.id + '.jpg');
    $('#div-name_kanji').text(emp.name_kanji);
    $('#div-name_kana').text(emp.name_kana);
    $('#div-number').text(emp.number);
    $('#nav-emp').attr('href', 'emp.html?id=' + id).text(emp.name_kanji);
}

// 保存
function update() {
    var emp = [];
    emp.push($('#number input').val());
    emp.push($('#name_kanji input').val());
    emp.push($('#name_kana input').val());
    emp.push(parseInt($('#sex select').val()));
    emp.push($('#birthday input').val());
    emp.push($('#tel input').val());
    emp.push($('#ctct_name input').val());
    emp.push($('#ctct_addr input').val());
    emp.push($('#ctct_tel input').val());
    emp.push($('#pspt_no input').val());
    emp.push($('#pspt_date input').val());
    emp.push($('#pspt_name input').val());
    emp.push(parseInt($('#rental select').val()));
    
    if (id) {
        emp.push(id);
        alasql(
            'UPDATE emp SET \
            number = ?, \
            name_kanji = ?, \
            name_kana = ?, \
            sex = ?, \
            birthday = ?, \
            tel = ?, \
            ctct_name = ?, \
            ctct_addr = ?, \
            ctct_tel = ?, \
            pspt_no = ?, \
            pspt_date = ?, \
            pspt_name = ?, \
            rental = ? \
            WHERE id = ?',
            emp);
    } else {
        id = alasql('SELECT MAX(id) + 1 as id FROM emp')[0].id;
        emp.unshift(id);
        alasql('INSERT INTO emp VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?);', emp);
        // alasql(
        //     'INSERT INTO emp(\
        //     id, \
        //     number, \
        //     name_kanji, \
        //     name_kana, \
        //     sex, \
        //     birthday, \
        //     tel, \
        //     ctct_name, \
        //     ctct_addr, \
        //     ctct_tel, \
        //     pspt_no, \
        //     pspt_date, \
        //     pspt_name, \
        //     rental) \
        //     VALUES(?,?,?,,?,?,?,?,?,?,?,?,?,?,?);',
        //     emp);
    }
    window.location.assign('emp.html?id=' + id);
}