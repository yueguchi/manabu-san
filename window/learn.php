<?php

/*
 * POSTで受けっとたwordをYahooAPIにかけて品詞分解し、DBに登録させる。
 * マナブさんの語彙を増やす役割を担う。
 */

require_once '../api/LearnApi.php';
use \api\LearnApi;

// manabu-sanに言葉を覚えさせる、自己学習api
$postWords = $_POST["words"];
if ($postWords === null || $postWords === "" || strlen($postWords) < 1) {
    header("Location: /front/manabu.php?status=0");
}
$api = new LearnApi($postWords);
$api->exec();

// 登録が終わったら入力画面に戻す
//header("Location: /front/manabu.php?status=1");