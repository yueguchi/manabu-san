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
        "今はどんな気分？？",
        "好きな異性のタイプは？？",
        "休日は何してすごす？？",
        "将来の夢はなーに？？",
        "好きな食べ物はなーに？？",
        "オススメの遊び教えて？？",
        "オススメのお出かけ先教えて？？",
        "何かオモシロイ話して？？",
        "好きな人いる??",
        "好きな人の名前なんだったっけ??",
        "人に言えない秘密ある??聞いてあげるよ!",
        "特技を教えて？？",
        "何か悲しいことあった??",
        "大丈夫??辛いことあった??",
        "お、なにやら嬉しそう!!",
        "大丈夫",
        "心配ない",
        "いける！！",
        "やれる！！",
        "無理しないでね",
        "逃恥終わっちゃったね。。。",
        "恋ダンス踊れる??",
        "PPAPも聞かなくなったね・・・",
        "トランプ大統領についてどう思う??",
        "最後いつトリミング行った??",
        "忘れ物ない？",
        "今日なんか忘れてない？",
        "今日の予定を挙げてみよ〜",
        "野菜が高いよ。。。",
        "健康診断でLDLコレステロールがちょっと高かった。。",
        "でも大丈夫!!",
        "パルを撫でると、なつくかも?!",
        "食事をパルまで運んであげてね??",
        "パルを撫でると、なつくかも?!",
        "食事をパルまで運んであげてね??",
        "女子高生に人気のTTポーズって知ってる??",
        "花粉症がひどくて。。。",
        "主食はパンです！",
        "斎藤佑樹選手のあだ名はセクシー",
        "インスタやってる??",
        "パール、パール、モコモコの犬〜(ポニョ風に)",
        "(・ω・) ",
        "モー娘。はゴマキ派でした",
        "円高の内に円をドルに変えるのってあり？？",
        "ドンキホーテをよくうろつきます",
        "パル集めってゲームあったら欲しいな〜",
        "残業撲滅！！",
        "話のわかりやすい人は先に結論を話すらしいよ",
        "勇者ヨシヒコのファンです。",
        "ブラズーレ！！",
        "スイーツ!!",
        "週休3日制にしたら生産性上がるのかな？",
        "どんな機能が欲しい？？",
        "褒めて褒めて",
        "叱って叱って",
        "耳かきは綿棒派??",
        "パルはお風呂で歯を磨くよ〜",
        "オススメの海外旅行教えて？？",
        "無人島に行くなら何持ってく？？",
        "バルス!!",
        "目が〜！目が〜・・・!!かゆい。",
        "お笑いはサンドイッチマンさんが好きです。",
        "ちょっと何言ってるのかわからないですね",
        "神ってる??",
        "チョベリバ",
        "MK5",
        "あなたのアモーレです",
        "シンゴジラがみたい",
        "PS4欲しい",
        "君の名はって面白い？見るか悩むの",
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
                $chat = $word . "〜";
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