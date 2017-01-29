$(function() {
    var sql = 'SELECT * \
        FROM stock \
        JOIN whouse ON whouse.id = stock.whouse \
        JOIN item ON item.id = stock.item \
        JOIN kind ON kind.id = item.kind';
    var stocks = alasql(sql);
    var tbody = $('#tbody-stocks');
    var reStocks = [];
    var amount = 0;

    // 売上高を求め、表示用のreStocksに詰め直す
    for(var i = 0; i < stocks.length; i++) {
        var stock = stocks[i];
        // stockにひもづくtransを取得
        var trans = alasql('SELECT * FROM trans WHERE stock = ?', [ parseInt(stock.stock.id) ]);
        var uriage = 0;
        for(var j = 0; j < trans.length; j++) {
            if (trans[j]) {
                var qty = trans[j].trans.qty;
                if (qty < 0) {
                    uriage += qty;
                }
            }
        }
        stock.uriage = (uriage*-1) * stock.item.price;
        reStocks[i] = stock;
        amount += stock.uriage;
    }

    // sort 売り上げ高の降順でsort
    reStocks.sort(function(pre, next) {
        if(pre.uriage > next.uriage) {
            return -1;
        }
        if(pre.uriage < next.uriage) {
            return 1;
        }
        return 0;
    });

    // 表示
    var kouseihi = 0; // 構成比
    var uriageRuikei = 0;// 売上累計
    for(var i = 0; i < reStocks.length; i++) {
        var stock = reStocks[i];
        var tr = $('<tr data-href="stock.html?id=' + stock.stock.id + '"></tr>');
        tr.append('<td>' + (i+1) + '</td>');
        tr.append('<td>' + stock.item.code + '</td>');
        tr.append('<td>' + stock.item.detail + '</td>');
        tr.append('<td>' + numberWithCommas(stock.item.price) + '円</td>'); // 単価
        tr.append('<td>' + numberWithCommas(stock.uriage) + '円</td>'); // 売り上げ
        tr.append('<td>' + numberWithCommas(uriageRuikei) + '円</td>'); // 売上累計
        tr.append('<td>' + (stock.uriage > 0 ? Math.floor((stock.uriage / amount) * 100) : 0) + '%</td>'); // 構成比
        tr.append('<td>' + (uriageRuikei > 0 ? Math.floor((uriageRuikei / amount) * 100) : 0) + '%</td>'); // 累積構成比

        // 累積構成比が70%以下ならA
        // 71以上 ~ 95%以下ならB
        // 96以上ならグループC
        // Cを複数回続けていた場合はグループD
        var groupName = "";
        if (Math.floor((uriageRuikei / amount * 100) <= 70)) {
            tr.append('<td>グループA</td>');
            groupName = "A";
        } else if (Math.floor((uriageRuikei / amount * 100) >= 71 && Math.floor((uriageRuikei / amount * 100) <= 95))) {
            tr.append('<td>グループB</td>');
            groupName = "B";
        } else if (Math.floor((uriageRuikei / amount * 100) > 95) && parseInt(stock.stock.ccount) === 0) {
            tr.append('<td>グループC</td>');
            groupName = "C";
        } else {
            tr.append('<td>グループD</td>');
            groupName = "D";
        }
        // グループ情報の更新(C以外なら、Cカウントを０に。Cならカウントを++する。)
        var ccount = 0;
        if (groupName === "C" || groupName === "D") {
            ccount = 1;
        }
        alasql('update stock set ccount = ? where id = ?', [ccount, stock.stock.id]);
        // 提案の表示
        if (groupName === "D") {
            tr.append('<td style="text-align: right;">' +
                '<button ' +
                'data-stock-id="' + stock.stock.id + '"' +
                'data-group="' + groupName + '"' +
                'class="btn btn-danger d-delete-btn"' +
                'style="font-size: 10px; width: 100px">取扱中止にする</button>' +
                '</td>');
        } else {
            tr.append('<td style="text-align: right;">' +
                '<button ' +
                'data-stock-id="' + stock.stock.id + '"' +
                'data-group="' + groupName + '"' +
                'class="btn btn-primary method-select-btn"' +
                'style="font-size: 10px; width: 100px">提案を受け入れる</button>' +
                '</td>');
        }

        tr.appendTo(tbody);
        // 最後に売上累計を更新する
        uriageRuikei += stock.uriage;
    }


    // クリック動作
    $('tbody > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href')
    });

    // 発注方法選択
    $(".method-select-btn").each(function(index, element) {
        $(element).off("click").on("click", function(event) {
            // tr親要素へのイベントバブリングを停止する
            event.stopPropagation();
            // アイテムIDをダイアログのdata属性に渡しておくことで、ダイアログでmethodボタンを押した時に更新したいアイテムidが特定できるようにする
            var stockId = $(this).attr("data-stock-id");
            var groupName = $(this).attr("data-group");
            if (groupName === "A") {
                // Aグループには定期不定量か不定期不定量
                $(".method-select-item").show();
                $($(".method-select-item")[2]).hide()
            } else if (groupName === "B") {
                //  Bグループには不定期定量発注
                $(".method-select-item").show();
                $($(".method-select-item")[0]).hide()
                $($(".method-select-item")[2]).hide()
            } else if (groupName === "C") {
                // Cグループには不定期不定量発注方式
                $(".method-select-item").show();
                $($(".method-select-item")[1]).hide()
                $($(".method-select-item")[2]).hide()
            }

            $(".method-item-modal-body").attr("data-stock-id", stockId);
            $('#modal_box').modal('show');
        });
    });
    // 発注方法更新
    $(".method-select-item").off("click").on("click", function(event) {
        var methodId = parseInt($(this).attr("data-method-id"));
        var stockId = parseInt($(".method-item-modal-body").attr("data-stock-id"));
        console.log("選択したmethod: " + methodId);
        console.log("選択したstock-id: " + stockId);
        // 更新
        alasql('UPDATE stock SET method = ? where id = ?', [methodId, stockId]);
        location.href = "./index.html";
    });

    // Dグループの取扱中止ボタン
    $(".d-delete-btn").off("click").on("click", function(event) {
        // tr親要素へのイベントバブリングを停止する
        event.stopPropagation();
        var id = $(this).attr("data-stock-id");
        alasql('delete from stock where id = ?', [parseInt(id)]);
        location.href = "./index.html";
    });
});