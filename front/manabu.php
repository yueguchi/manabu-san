<?php
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
    $from = isset($_GET["from"]) ? intval($_GET["from"]) : 0;
    $from = (empty($from) || $from < 0) ? 0 : $from;
    // 結果リスト取得
    $sql = 'select id, word1, word2, word3 from manabu limit ' . ($from > 0 ? $from : 0) . ', 50';
    $stmt = $dbh->query($sql);
    // 全件数
    $sql = 'select count(*) from manabu';
    $count = intval($dbh->query($sql)->fetchAll()[0][0]);

?>
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" href="/css/style.css" />
    </head>
    <title>マナブさん ~自己学習~</title>
    <body>
        <nav class="navbar navbar-inverse">
            <img class="service-icon" src="/image/manabu-san.png" />
            <a href="/">マナブさん</a> is 人工無能
        </nav>
        <section class="container">
            <div class="manabi-list">
                <span><?php echo($count); ?>件</span>
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>WORD1</th>
                            <th>WORD2</th>
                            <th>WORD3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $resultCount = 0?>
                        <?php while($result = $stmt->fetch(PDO::FETCH_ASSOC)){ $resultCount++ ?>
                            <tr>
                                <th scope="row"><?php echo $result['id']; ?></th>
                                <td><?php echo $result['word1']; ?></td>
                                <td><?php echo $result['word2']; ?></td>
                                <td><?php echo $result['word3']; ?></td>
                            </tr>
                        <?php } ?>
                    </tbody>
                </table>
            </div>
        </section>
        <footer class="footer">
          <div class="container">
            <?php if ($count > 50 && $from <= 0) { ?>
                <nav aria-label="...">
                  <ul class="pager">
                    <li class="next"><a href="./manabu.php?from=<?php echo $from + 50 ?>">次へ <span aria-hidden="true">&rarr;</span></a></li>
                  </ul>
                </nav>
            <?php } elseif ($count > 50 && $resultCount >= 50) { ?>
                <nav aria-label="...">
                  <ul class="pager">
                    <li class="previous"><a href="./manabu.php?from=<?php echo $from - 50 ?>"><span aria-hidden="true">&larr;</span> 前へ</a></li>
                    <li class="next"><a href="./manabu.php?from=<?php echo $from + 50 ?>">次へ <span aria-hidden="true">&rarr;</span></a></li>
                  </ul>
                </nav>
            <?php } else if($from > 0) { ?>
                <nav aria-label="...">
                  <ul class="pager">
                    <li class="previous"><a href="./manabu.php?from=<?php echo $from - 50 ?>"><span aria-hidden="true">&larr;</span> 前へ</a></li>
                  </ul>
                </nav>
            <?php } ?>
            <p class="text-muted">manabu san is jinkoh-munoh by nanayu ©palcom.inc</p>
          </div>
        </footer>
    </body>
</html>
