<?php
    $completeMessage = "";
    if (isset($_GET["status"])) {
        $status = $_GET["status"];
        if ($status === "1") {
            $completeMessage = "マナブさんがまた一つ賢くなりました。";
        }
    }
?>
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8">
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
                <form method="post" action="../window/learn.php">
                    <div>
                        <input type="text" value="" name="words" placeholder="覚えさせたい会話文を入力してください">
                    </div>
                    <input type="submit" value="送信">
                </form>
            </div>
        </section>
        <footer>
            <div>
                フッター
            </div>
        </footer>
    </body>
</html>