<?php
    $completeMessage = "";
    $errorMsg = "";
    if (isset($_GET["status"])) {
        $status = $_GET["status"];
        if ($status === "1") {
            $completeMessage = "マナブさんがまた一つ賢くなりました。";
        } else if ($status === "0") {
            $completeMessage = "マナブさんが賢くなるために会話文を入れてみましょう。";
        }
    }
    if (isset($_GET["status"]) && isset($_GET["errorMsg"])) {
        $status = $_GET["status"];
        if ($status === "1") {
            $errorMsg = $_GET["errorMsg"];
        }
    }
    
    // DBアクセス
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
    $from = isset($_GET["from"]) ? $_GET["from"] : 0;
    $from = (empty($from) || $from < 0) ? 0 : $from;
    $sql = 'select id, word1, word2, word3 from manabu limit ' . $from . ', 5';
    $stmt = $dbh->query($sql);
    $count = count($stmt->fetch(PDO::FETCH_ASSOC));
?>
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8">
        <style>
            ul > li {
                list-style: none;
            }
            ul.word-list > li {
                border: solid 1px #000;
            }
            ul.word-list > li:after {
                content: "";
            }
            .flex {
                display: flex;
            }
        </style>
    </head>
    <title>マナブさん ~自己学習~</title>
    <body>
        <header>
            <div>
                ヘッダー
            </div>
        </header>
        <section>
            <div>
                <small class="manabu_complete"><?php echo($completeMessage) ?></small>
                <small class="manabu_error"><?php echo($errorMsg) ?></small>
                <form method="post" action="../window/learn.php">
                    <div>
                        <input type="text" value="" name="words" placeholder="覚えさせたい会話文を入力してください">
                    </div>
                    <input type="submit" value="送信">
                </form>
            </div>
            <div class="manabi-list">
                <ul>
                    <?php while($result = $stmt->fetch(PDO::FETCH_ASSOC)){ ?>
                        <li>
                            <ul class="flex word-list">
                                <li>
                                    <?php echo $result['id']; ?>
                                </li>
                                <li>
                                    <?php echo $result['word1']; ?>
                                </li>
                                <li>
                                    <?php echo $result['word2']; ?>
                                </li>
                                <li>
                                    <?php echo $result['word3']; ?>
                                </li>
                            </ul>
                        </li>
                    <?php } ?>
                </ul>
                <?php if ($count > 1 && $from <= 0) { ?>
                    <span>
                        <small><a href="./manabu.php?from=<?php echo $from + 5 ?>">さらに見る>></a></small>
                    </span>
                <?php } elseif ($count > 1) { ?>
                    <span>
                        <small><a href="./manabu.php?from=<?php echo $from - 5 ?>"><<戻る</a></small>
                        <small><a href="./manabu.php?from=<?php echo $from + 5 ?>">さらに見る>></a></small>
                    </span>
                <?php } else { ?>
                    <span>
                        <small><a href="./manabu.php?from=<?php echo $from - 5 ?>"><<戻る</a></small>
                    </span>
                <?php } ?>
            </div>
        </section>
        <footer>
            <div>
                フッター
            </div>
        </footer>
    </body>
</html>