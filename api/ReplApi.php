<?php

namespace api;

use \api\APIError;

require_once 'Common.php';
require_once 'LearnApi.php';
require_once 'APIError.php';

/**
 * manabuテーブルから単語の連続性を参照し、会話を生成する
 */
class ReplApi extends Common {

    protected $defaultPalChatWords = [
        "調子どう？？",
        "何してたの？",
        "趣味はなに？？"
    ];
    
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
        // 抽出した$wordをDB検索にかけて、会話を生成する
        // ここからマルコフ理論
        $chat = $word;
        if ($word) {
            // 一つ目
            $sql = "SELECT word1, word2, word3 FROM manabu WHERE word1 = ?";
            $stmt = $dbh->prepare($sql);
            if ($stmt->execute([$word])) {
                $randomWord = [];
                while($row = $stmt->fetch()) {
                    // $rowは「word1, word2, word3の配列」
                    array_push($randomWord, $row["word2"]);
                }
                // 複数あるfetch結果からランダムで選択する
                $chatRandomWord = $randomWord[rand(0, count($randomWord) - 1)];
                $chat .= $chatRandomWord;
                $whereWord = $chatRandomWord;
            }
            
            // 二つ目
            $sql = "SELECT word1, word2, word3 FROM manabu WHERE word2 = ?";
            $stmt = $dbh->prepare($sql);
            if ($stmt->execute([$whereWord])) {
                $randomWord = [];
                while($row = $stmt->fetch()) {
                    // $rowは「word1, word2, word3の配列」
                    array_push($randomWord, $row["word3"]);
                }
                $chatRandomWord = $randomWord[rand(0, count($randomWord) - 1)];
                $chat .= $chatRandomWord;
                $whereWord = $chatRandomWord;
            }
            // 三つ目
            $sql = "SELECT word3 FROM manabu WHERE word2 = ?";
            $stmt = $dbh->prepare($sql);
            if ($stmt->execute([$whereWord])) {
                $randomWord = [];
                while($row = $stmt->fetch()) {
                    // $rowは「word1, word2, word3の配列」
                    array_push($randomWord, $row["word3"]);
                }
                $chatRandomWord = $randomWord[rand(0, count($randomWord) - 1)];
                $chat .= $chatRandomWord;
                $whereWord = $chatRandomWord;
            }
            // 最後にword1単語だったら、未登録の単語なので、その単語について学習するために、それが何かを聞く
            if (strlen($chat) === strlen($word)) {
                $chat = $word . "ってなーに？";
            }
        }
        
        // 最後に学習させる
        $api = new LearnApi($this->params["sentence"]);
        $api->registWords($ret);
        
        return [
            "word" => $word,
            "result" => [
                "chat" => $chat ?  $chat : $this->defaultPalChatWords[rand(0, count($this->defaultPalChatWords) - 1)]
            ]
        ];
    }
    
    /**
     * 形態素解析したクライアントの言葉の中から一つをランダムで抽出し、返却する
     * posから名詞のみを抽出する
     */
    protected function getRandomWord($jsonWord)
    {
        $randomArray = [];
        if (count($jsonWord->ma_result->word_list->word) === 1) {
            if ($jsonWord->ma_result->word_list->word->pos === "名詞") {
                array_push($randomArray, $jsonWord->ma_result->word_list->word->surface);
            }
        } else {
            foreach ($jsonWord->ma_result->word_list->word as $words) {
                if ($words->pos === "名詞") {
                    array_push($randomArray, $words->surface);
                }
            }
        }
        $ret = "";
        if (count($randomArray) > 0) {
            $ret = $randomArray[rand(0, count($randomArray) - 1)];
        }
        return $ret;
    }
}