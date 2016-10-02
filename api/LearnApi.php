<?php

namespace api;

use \api\APIError;

require_once 'Common.php';
require_once 'APIError.php';

/**
/**
 * manabu-sanに言葉を覚えさせる、自己学習api
 *
 */
class LearnApi extends Common {

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
        // 単語を3連続にしたものを一塊とし、DBに登録する。
        $marcoph = [];
        $dbInsertArray = [];
        foreach ($ret->Result->WordList as $words) {
            // wordsがcount=1だと、配列ではなく、直下で「Surface」が返却される
            if (count($ret->Result->WordList->Word) === 1) {
                array_push($marcoph, $words->Surface);
                array_push($dbInsertArray, $marcoph);
                break;
            } elseif (count($ret->Result->WordList->Word) === 2) {
                foreach ($words as $word) {
                    array_push($marcoph, $word->Surface);
                }
                array_push($dbInsertArray, $marcoph);
                break;
            } else {
                foreach ($words as $word) {
                    // 3連続の単語が完成してたなら、先頭をpopする
                    if (count($marcoph) >= 3) {
                        array_shift($marcoph);
                    }
                    array_push($marcoph, $word->Surface);
                    if (count($marcoph) >= 3) {
                        array_push($dbInsertArray, $marcoph);
                    }
                }
            }
        }
        // var_dump($dbInsertArray);
        foreach ($dbInsertArray as $words) {
            echo "------\n";
            if (count($words) < 3) {
                    switch (count($words)) {
                        case 1:
                            $words[1] = "";
                            $words[2] = "";
                            break;
                        case 2:
                            $words[2] = "";
                        default:
                            break;
                    }
            }
            // debug
            // foreach ($words as $index => $word) {
            //     var_dump(" {$word}");
            // }
            // 確実にindex2まであるため、順繰りにinsertする
            $this->insertManabu($words);
        }
    }
    
    /**
     * insert into manabu (word1, word2, word3) values($words[0], $words[1], $words[2]);
     */
    protected function insertManabu($words)
    {
        try {
            // PHPのエラーを表示するように設定
            error_reporting(E_ALL & ~E_NOTICE);
            $url = parse_url(getenv('DATABASE_URL'));
            var_dump($url);
            $dsn = sprintf('mysql:host=%s;dbname=%s', $url['host'], substr($url['path'], 1));
            $pdo = new PDO($dsn, $url['user'], $url['pass']);
            var_dump($pdo->getAttribute(PDO::ATTR_SERVER_VERSION));
        } catch (PDOException $e) {
             exit('データベース接続失敗。'.$e->getMessage());
        }
        var_dump($words);
    }
}