<?php
/**
/**
 * 形態素解析APIへのリクエストサンプル（GET）
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=%E5%BA%AD%E3%81%AB%E3%81%AF%E4%BA%8C%E7%BE%BD%E3%83%8B%E3%83%AF%E3%83%88%E3%83%AA%E3%81%8C%E3%81%84%E3%82%8B%E3%80%82
 *
 * ↓
 *
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=庭には二羽ニワトリがいる。
 *
 */
$targetWord = $_GET["sentence"];
$api = 'http://jlp.yahooapis.jp/FuriganaService/V1/furigana';
$appid = 'dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-';
$params = array(
    'sentence' => $targetWord
);

$ch = curl_init($api.'?'.http_build_query($params));
curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT      => "Yahoo AppID: $appid"
));

$result = curl_exec($ch);
curl_close($ch);
?>
<pre>
<?php echo htmlspecialchars(
    print_r(new SimpleXMLElement($result), true)
) ?>
</pre>