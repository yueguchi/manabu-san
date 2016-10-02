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
            $cleardb = parse_url(getenv('CLEARDB_DATABASE_URL'));
            $dbh = new PDO(
                    sprintf(
                        "mysql:dbname=%s;host=%s",
                        substr($cleardb['path'], 1),
                        $cleardb['host']),
                        $cleardb['user'],
                        $cleardb['pass']
                    );
            // SELECT文を変数に格納
            $sql = "SELECT * FROM manabu";
             
            // SQLステートメントを実行し、結果を変数に格納
            $stmt = $dbh->query($sql);
             
            // foreach文で配列の中身を一行ずつ出力
            foreach ($stmt as $row) {
                // データベースのフィールド名で出力
                echo $row['id'] . '：' . $row['word1'] . $row['word2'] . $row['word3'];
                // 改行を入れる
                echo '<br>';
            }
            
        } catch (PDOException $e) {
             exit('データベース接続失敗。'.$e->getMessage());
        }
        var_dump($words);
    }
}