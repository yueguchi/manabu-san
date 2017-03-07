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

</head>
<body>
<section>
  <div>
    <h2>楽天総合ランキング</h2>
      <table width="600" border="1">
        <thead>
          <tr>
            <th>位</th>
            <th>画像</th>
            <th>商品名</th>
          </tr>
        </thead>
        <tbody>
        <?php foreach ($items as $index => $item) { ?>
          <tr>
            <td>
              <div>
                <?php echo $item->rank ?>
              </div>
            </td>
            <td>
              <div>
                <img src=<?php echo $images[$item->itemName]; ?>>
              </div>
            </td>
            <td>
              <div>
                <?php echo $item->itemName ?>
              </div>
            </td>
          </tr>
        <?php } ?>
        </tbody>
      </table>
  </div>
</section>
<script
    src="https://code.jquery.com/jquery-1.12.4.js"
    integrity="sha256-Qw82+bXyGq6MydymqBxNPYTaUXXq7c8v3CwiYwLLNXU="
    crossorigin="anonymous"></script>
<script>
  $(function() {
    setInterval(function(){
      $("tr:last").children('td').wrapInner('<div />').children().hide();
      $("tr:last").children('td').children('div').animate({opacity: 0}, 0);
      $("tr:last").prependTo("tbody");
      $("tr").eq(1).children('td').children('div').animate( { height: 'toggle' }, 500, 'swing');
      $("tr").eq(1).children('td').children('div').animate( { opacity: 1 }, 1000 );
    }, 8000);
  });
</script>
</body>
</htML>
