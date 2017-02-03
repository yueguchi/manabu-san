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
                //    alasql('INSERT INTO trans VALUES (?,?,?,?,?,?, ?)', [ trans_id, id, yyyymmdd, hattyuuCount, balance + hattyuuCount, "[定期不定量]自動発注", 0]);
                //}
            }
        });
    }, 1000);

    // 在庫引当情報から出荷対応日を見て、自動出荷する
    setInterval(function() {
        var requests = alasql('SELECT * FROM request where status = 1');
        $.each(requests, function(index, request) {
            var request = request.request;
            var itemId = request.item;
            var companyName = request.rcompany;
            var count = request.rcount;
            var soukoName = request.souko;
            var soukoId = alasql('SELECT * FROM whouse WHERE name = ?', [soukoName])[0].whouse.id;
            var yyyymmdd_shukka = request.deliverydate;

            var now = new Date();
            var yyyymmdd = now.getFullYear()+ "-" +
                ( "0"+( now.getMonth()+1 ) ).slice(-2)+ "-" +
                ( "0"+now.getDate() ).slice(-2);

            if (yyyymmdd >= yyyymmdd_shukka) {
                // 現在在庫情報
                var zaiko = alasql('SELECT * FROM stock JOIN item ON stock.item = item.id JOIN request ON request.item = item.id JOIN whouse ON whouse.id = stock.whouse WHERE request.id = ? AND stock.whouse = ?', [request.id, soukoId])[0];

                // 在庫更新
                alasql('UPDATE stock SET balance = ? WHERE id = ?', [ zaiko.stock.balance - count, zaiko.stock.id ]);
                // trans更新
                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                alasql('INSERT INTO trans VALUES (?,?,?,?,?,?,?,?)', [ trans_id, zaiko.stock.id, yyyymmdd_shukka, (-1 * count), zaiko.stock.balance - count, "-", companyName + "様へ出荷", 0]);
                // requestのstatus更新
                alasql('UPDATE request SET status = 2 WHERE id = ?', [request.id]);


                // 1日平均出荷数を算出
                // 本当はSQLでbetweenで範囲抽出したかったが、alasqlがクソなので、出荷itemだけを抽出する
                var shukko = alasql('SELECT * FROM trans WHERE stock = ? AND qty < 0', [ zaiko.stock.id ]);
                // jsで日付絞り込みを行う
                var nowDate = new Date(yyyymmdd);
                var targetTransQty = [];
                $.each(shukko, function(index, data) {
                    if (data.trans.date) {
                        var targetDate = new Date(data.trans.date);
                        // 今日の日付 - 対象日付が一週間前以内なら対象とする
                        if ((nowDate.getTime() - targetDate.getTime()) /(1000*60*60*24) <= 7) {
                            targetTransQty.push(data.trans.qty*-1); // 個数を純粋に確保したいので、ここでマイナスを消す
                        }
                    }
                });
                // 1週間の平均出荷数を求めるため、sizeが7に満たない場合は、配列を0で埋めてから計算する
                if (targetTransQty.length < 7) {
                    targetTransQty = zeroUme(targetTransQty);
                }
                // 平均値の算出
                var sum = 0;
                $.each(targetTransQty, function(index, qty) {
                    sum += qty;
                });
                var ave = Math.floor(sum / 7);
                // 1日平均出荷数の更新
                alasql('UPDATE stock SET ave = ? WHERE id = ?', [ ave, zaiko.stock.id ]);

                console.log(companyName + "様: 出荷処理完了(" + count + ")");
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

function zeroUme(target) {
    switch (target.length) {
        case 0:
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            break;
        case 1:
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            break;
        case 2:
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            break;
        case 3:
            target.push(0);
            target.push(0);
            target.push(0);
            target.push(0);
            break;
        case 4:
            target.push(0);
            target.push(0);
            target.push(0);
            break;
        case 5:
            target.push(0);
            target.push(0);
            break;
        case 6:
            target.push(0);
            break;
    }
    return target;
}