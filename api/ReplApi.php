<?php

namespace api;

use \api\APIError;

require_once 'Common.php';
require_once 'APIError.php';

/**
 * manabuテーブルから単語の連続性を参照し、会話を生成する
 */
class ReplApi extends Common {

    public function __construct($words)
    {
        if (empty($words)) {
            throw new APIError("wordsは必須です", 400);
        }
        $this->params["sentence"] = $words;
        parent::__construct();
    }
    
    public function exec()
    {
        // Commonからjson化された解析結果を受け取る。
        $ret = json_decode(parent::exec());
        // 名刺を一つランダムに抽出し、会話を行う。
        $word = $this->getRandomWord($ret);
        var_dump($word);
        $dbh = null;
        if (getenv('PHP_ENV') === 'heroku') {
            $cleardb = parse_url(getenv('CLEARDB_DATABASE_URL'));
            $dbh = new \PDO(
                    sprintf("mysql:dbname=%s;host=%s;charset=utf8;",substr($cleardb['path'], 1),$cleardb['host']),
                    $cleardb['user'],
                    $cleardb['pass']
                );
        } else {
            $dbh = new \PDO(
                    "mysql:dbname=manabu_san;host=localhost;charset=utf8;",
                    "root",
                    "root"
                );
        }
        // TODO 抽出した$wordをDB検索にかけて、会話を生成する
        // ここからマルコフ理論
        $sql = "SELECT word1, word2, word3 FROM manabu WHERE word1 = ? OR word2 = ? OR word3 = ?";
        $stmt = $dbh->prepare($sql);
        if ($stmt->execute([$word, $word, $word])) {
            while ($row = $stmt->fetch()) {
                print_r($row);
            }
        }
    }
    
    /**
     * 形態素解析したクライアントの言葉の中から一つをランダムで抽出し、返却する
     */
    protected function getRandomWord($jsonWord)
    {
        $ret = "";
        $randomArray = [];
        foreach ($jsonWord->Result->WordList as $words) {
            // 形態素解析結果が1つだった場合
            if (count($jsonWord->Result->WordList->Word) === 1) {
                $ret = $words->Surface;
            } else {
                foreach ($words as $word) {
                    array_push($randomArray, $word->Surface);
                }
            }
        }
        return count($randomArray) === 0 ? $ret : $randomArray[rand(0, count($randomArray) - 1)];
    }
}