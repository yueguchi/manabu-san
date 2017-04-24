<?php

if($_SERVER["REQUEST_METHOD"] == "GET") {
    $code = $_GET["code"];

    /*
    curl -F 'client_id=af44a9449105494580468e3f96177d6c' -F 'client_secret=c20db343d14447b2b5e379d781ab3767' -F 'grant_type=authorization_code' -F 'redirect_uri=https://manabu-san.herokuapp.com/validated.php' -F 'code=【上記で取得したcode】’ https://api.instagram.com/oauth/access_token
    */

    $url = 'https://api.instagram.com/oauth/access_token';
    $data = array(
        'client_id' => 'af44a9449105494580468e3f96177d6c',
        'client_secret' => 'c20db343d14447b2b5e379d781ab3767',
        'grant_type' => 'authorization_code',
        'redirect_uri' => 'https://manabu-san.herokuapp.com/validated.php',
        'code' => $code
    );
    $options = array('http' => array(
        'method' => 'POST',
        'content' => http_build_query($data),
    ));
    $contents = file_get_contents($url, false, stream_context_create($options));
    $jsonRet = json_decode($contents);
    $token = $jsonRet->access_token;
} else if($_SERVER["REQUEST_METHOD"] == "POST") {
    $q = $_POST["q"];
    $tq = $_POST["tq"];
    if (strlen($q) > 0) {
        // ユーザー検索
        $token = $_POST["hidden_token"];
        // https://api.instagram.com/v1/users/search?q=【ユーザー名】&access_token=【ACCESS-TOKEN】
        $url = "https://api.instagram.com/v1/users/search?q={$q}&access_token={$token}";
        $ret = file_get_contents($url);
        $jsonRet = json_decode($ret);
        $id = $jsonRet->data[0]->id;
        // idにひもづく記事一覧
        // https://api.instagram.com/v1/users/{user-id}/media/recent/?access_token=ACCESS-TOKEN
        var_dump($jsonRet);
        $url = "https://api.instagram.com/v1/users/{$id}/media/recent/?access_token={$token}";
        $ret = file_get_contents($url);
        $jsonRet = json_decode($ret);
        var_dump($jsonRet);
    } else if (strlen($tq) > 0) {
        // タグ一覧
        $token = $_POST["hidden_token"];
        $url = "https://api.instagram.com/v1/tags/search?q={$tq}&access_token={$token}";
        $ret = file_get_contents($url);
        $jsonRet = json_decode($ret);
        $tagList = $jsonRet->data;
    } else {
        // tag検索
        $tagName = $_POST["tag"];
        $token = $_POST["hidden_token"];
        // https://api.instagram.com/v1/tags/{tag-name}/media/recent?access_token=ACCESS-TOKEN
        var_dump($tagName);
    }
}

?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8" />
    <title>インスタAPI連携</title>
    <style>
        ul.flex {
            display: flex;
        }
        ul.flex > li {
            list-style: none;
        }
    </style>
</head>
<body>
    <section>
        <h1>ユーザー情報取得</h1>
        <form method="post">
            <input type="hidden" value="<?php echo $token; ?>" name="hidden_token">
            <p><input type="text" value="<?php echo $q; ?>" name="q" placeholder="ユーザー名を記述"></p>
            <p><input type="submit" value="送信"></p>
        </form>
    </section>
    <section>
        <h1>tagで取得</h1>
        <form method="post">
            <input type="hidden" value="<?php echo $token; ?>" name="hidden_token">
            <p><input type="text" value="<?php echo $tagName; ?>" name="tag" placeholder="tagを記述"></p>
            <p><input type="submit" value="送信"></p>
        </form>
    </section>
    <section>
        <h1>タグ検索</h1>
        <form method="post">
            <input type="hidden" value="<?php echo $token; ?>" name="hidden_token">
            <p><input type="text" value="<?php echo $tq; ?>" name="tq" placeholder="tagを記述"></p>
            <p><input type="submit" value="送信"></p>
        </form>
        <ul class="flex">
            <?php foreach ($tagList as $key => $tagObj) { ?>
                <li><?php echo $tagObj->name; ?>(<?php echo $tagObj->media_count; ?>)</li>
            <?php } ?>
        </ul>
    </section>
</body>
</html>
