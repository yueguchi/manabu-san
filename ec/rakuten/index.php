<?php
// ライブラリロード
require 'vendor/autoload.php';
use GuzzleHttp\Client;

// クライアント
$client = new Client([
    "base_uri" => "https://app.rakuten.co.jp/services/api/",
]);

// 楽天総合ランキングリクエスト(サービス固有パラメーターを無指定)
$res = $client->request('GET', 'IchibaItem/Ranking/20120927', [
    'query' => [
        'format' => 'json',
        'applicationId' => '1056039870604524114',
    ]
]);

// API取得結果から、商品一覧のみをitems配列に格納する
$results = json_decode($res->getBody());
$items = [];
$images = []; // "商品名" => "url"

foreach ($results as $key => $value) {
  if ($key === "Items") {
    foreach ($value as $item) {
      array_push($items, $item->Item);
      if (count($item->Item->smallImageUrls) > 0) {
        $images[$item->Item->itemName] = $item->Item->smallImageUrls[0]->imageUrl;
      } else {
        // NoImage
        $images[$item->Item->itemName] = "";
      }
    }
  }
}

?>
<htML>
<head>
  <style>
    .flex {
      display: flex;
    }

    .flex.none > li {
      list-style: none;
    }

    .items {
      border: solid 1px;
      margin: 3px;
    }

    .fadeout {
      animation: fadeOut 4s ease 0s 1 normal;
      -webkit-animation: fadeOut 2s ease 0s 1 normal;
    }

    @keyframes fadeOut {
      0% {opacity: 1}
      100% {opacity: 0}
    }

    @-webkit-keyframes fadeOut {
      0% {opacity: 1}
      100% {opacity: 0}
    }
  </style>
</head
<body>
<section>
  <div>
    <h2>楽天総合ランキング</h2>
    <?php foreach ($items as $index => $item) { ?>
      <ul class="flex none items">
        <li><?php echo $item->rank ?>位</li>
        <li><img src=<?php echo $images[$item->itemName]; ?>></li>
        <li><?php echo $item->itemName ?></li>
      </ul>
    <?php } ?>
  </div>
</section>
<script>
  // DOM構築が完了したら、スクリプトをロードする
  document.addEventListener('DOMContentLoaded', function () {
    var rakutenEc = {
      /**
       * ランキング商品を10件までしか表示させないメソッド
       */
      showRanking: function () {
        var items = document.getElementsByClassName("items");
        for (var i = 0; i < items.length; i++) {
          if (i >= 10) {
            items[i].style.display = "none";
          }
        }
      },
      carouselItems: function () {
        var _this = this;
        setInterval(function () {
          var items = document.getElementsByClassName("items");
          var lastIndx = 0;
          // 現在表示されている商品だけの配列を作成
          var dispItems = [];
          for (var i = 0; i < items.length; i++) {
            // 見ている商品のみを抽出
            if (items[i].style.display !== "none") {
              dispItems.push(items[i]);
              lastIndx = i;
            }
          }
          // 今見えている先頭の商品を見えなくし
          dispItems[0].classList.remove("fadeout");
          dispItems[0].classList.add("fadeout");
          var __this = _this;
          setTimeout(function() {
            dispItems[0].style.display = "none";
            // 今見えている商品の次の商品を表示させる
            var showNextIndex = lastIndx + 1;
            // 最後まで来たら、最初に戻す
            if (showNextIndex >= items.length) {
              for (var i = 0; i < items.length; i++) {
                items[i].style.display = "";
              }
              __this.showRanking();
            } else {
              dispItems[0].classList.remove("fadeout");
              items[showNextIndex].style.display = "";
            }
          }, 2000);
        }, 5000);
      }
    };
    rakutenEc.showRanking();
    setTimeout(function () {
      rakutenEc.carouselItems();
    }, 5000);
  });
</script>
</body>
</htML>
