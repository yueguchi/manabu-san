$(function() {
    // 定期不定量発注
    setInterval(function() {
        var items = alasql('SELECT * FROM stock JOIN item ON stock.item = item.id WHERE stock.method = 3');
        $.each(items, function(index, data) {
            var stock = alasql('SELECT * FROM stock WHERE id = ?', [data.stock.id])[0].stock;
            // 「5」などの分単位の発注タイミングがINT型で格納されている
            var hattyuuInterval = parseInt(stock.routine_order_minutes);
            // yyyymmddHHii形式のINT型
            var lastTime = stock.last_routine_date;

            var now = new Date();
            var yyyymmddHHii = now.getFullYear() +
                ( "0"+( now.getMonth()+1 ) ).slice(-2) +
                ( "0"+now.getDate() ).slice(-2) +
                toDoubleDigits(now.getHours()) +
                toDoubleDigits(now.getMinutes());
            var yyyymmdd = now.getFullYear()+ "-" +
                ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
                ( "0"+now.getDate() ).slice(-2);
            // yyyymmddHHiiで比較する
            // 現在時間から定期発注間隔(分)を引いた時間が最終発注時刻よりも未来であれば、自動発注をかける
            if (yyyymmddHHii - hattyuuInterval > lastTime) {
                // 決まった日に発注するが、発注量はその都度必要量を検討して決める
                var ave = parseInt(stock.ave) === 0 ? 1 : parseInt(stock.ave); // 0除算対策で、0なら1を入れる
                var balance = parseInt(stock.balance);

                // ユーザーに入力値を決めさせる
                //var hattyuuCount = prompt(data.item.detail + "の発注数を入力してください。");
                //var reg = new RegExp("^[0-9]+$");
                //// 0以上の数値の時だけ発注をかける
                //if (reg.test(hattyuuCount)) {
                //    hattyuuCount = parseInt(hattyuuCount);
                //    // stock更新(最終自動「定期不定量」発注の実行時間も更新)
                //    var id = stock.id;
                //    alasql('UPDATE stock SET balance = ?, last_routine_date = ? WHERE id = ?', [ balance + hattyuuCount, yyyymmddHHii, id ]);
                //    // trans更新
                //    var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                //    // トランザクションの更新
                //    alasql('INSERT INTO trans VALUES (?,?,?,?,?,?)', [ trans_id, id, yyyymmdd, hattyuuCount, balance + hattyuuCount, "[定期不定量]自動発注"]);
                //}
            }
        });
    }, 1000);

    /**
     * 0埋め処理
     * @param num
     * @returns {string}
     */
    var toDoubleDigits = function(num) {
        num += "";
        if (num.length === 1) {
            num = "0" + num;
        }
        return num;
    };
});