<?php

namespace api;

use \api\APIError;

require_once 'Common.php';
require_once 'APIError.php';

/**
 * manabu-sanに言葉を覚えさせる、自己学習api
 *
 * 形態素解析APIへのリクエストサンプル（GET）
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=%E5%BA%AD%E3%81%AB%E3%81%AF%E4%BA%8C%E7%BE%BD%E3%83%8B%E3%83%AF%E3%83%88%E3%83%AA%E3%81%8C%E3%81%84%E3%82%8B%E3%80%82
 *
 * ↓
 *
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=庭には二羽ニワトリがいる。
 *
 */
class LearnApi extends Common {

    public function __construct($words)
    {
        if (empty($words)) {
            throw new APIError("wordsは必須です", 400);
        }
        $this->params["sentence"] = strip_tags(trim($words));
        parent::__construct();
    }

    public function exec()
    {
        // Commonからjson化された解析結果を受け取る。
        $ret = json_decode(parent::exec());
        return $this->registWords($ret);
    }

    /**
     * 単語を登録する
     */
    public function registWords($ret)
    {
        // 最後の要素に文章の終わりを示すための空文字を代入する
        if (count($ret->ma_result->word_list->word) > 1) {
            $obj = new \stdClass;
            $obj->surface = "";
            array_push($ret->ma_result->word_list->word, $obj);
        }

        // 単語を3連続にしたものを一塊とし、DBに登録する。
        $marcoph = [];
        $dbInsertArray = [];
        foreach ($ret->ma_result->word_list->word as $words) {
            // wordsがcount=1だと、配列ではなく、直下で「Surface」が返却される
            if (count($ret->ma_result->word_list->word) === 1) {
                array_push($marcoph, $ret->ma_result->word_list->word->surface);
                array_push($dbInsertArray, $marcoph);
                break;
            } elseif (count($ret->ma_result->word_list->word) === 2) {
                array_push($marcoph, $words->surface);
                array_push($dbInsertArray, $marcoph);
                break;
            } else {
                // 3連続の単語が完成してたなら、先頭をpopする
                if (count($marcoph) >= 3) {
                    array_shift($marcoph);
                }
                array_push($marcoph, $words->surface);
                if (count($marcoph) >= 3) {
                    array_push($dbInsertArray, $marcoph);
                }
            }
        }

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
        $dbh->beginTransaction();
        try {
            $insertHashes = [];
            $i = 0;
            foreach ($dbInsertArray as $words) {
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
                array_push($insertHashes, hash("sha256", implode($words, "")));
                $dbInsertArray[$i] = $words;
                $i++;
            }
            $registHashes = $this->excludeRegisteredWords($insertHashes);
            foreach ($dbInsertArray as $words) {
                // 確実にindex2まであるため、順繰りにinsertする
                $this->insertManabu($dbh, $words);
            }
        } catch(Exception $e) {
            var_dump("error");
            $dbh->rollBack();
            return $e->getMessage();
        }
        $dbh->commit();
    }

    /**
     * 登録済みのhashを除外し、新しいhashのみを返却する
     */
    protected function excludeRegisteredWords($newHashes)
    {
        return $newHashes;
    }

    /**
     * insert into manabu (word1, word2, word3) values($words[0], $words[1], $words[2]);
     */
    protected function insertManabu($dbh, $words)
    {
        try {
            // PHPのエラーを表示するように設定
            $stmt = $dbh -> prepare("INSERT INTO manabu (hash, word1, word2, word3) VALUES (:hash, :word1, :word2, :word3)");
            // 重複データを挿入しないため、3単語をsha256でhash化して、DBに入れておく。
            $hash = hash("sha256", implode($words, ""));
            $stmt->bindParam(':hash', $hash);
            $stmt->bindParam(':word1', $words[0], \PDO::PARAM_STR);
            $stmt->bindParam(':word2', $words[1], \PDO::PARAM_STR);
            $stmt->bindParam(':word3', $words[2], \PDO::PARAM_STR);
            $stmt->execute();
        } catch (Exception $e) {
             throw $e;
        }
    }
}
