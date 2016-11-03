<?php
$replApiUrl = "http://{$_SERVER["HTTP_HOST"]}/window/chat.php?words=【会話文を入力】";
$learnApiUrl = "http://{$_SERVER["HTTP_HOST"]}/window/learn.php?words=【会話文を入力】";
$learnedListUrl = "http://{$_SERVER["HTTP_HOST"]}/front/manabu.php";
 ?>
 <!DOCTYPE html>
 <html lang="ja">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width,initial-scale=1">
         <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css" />
         <link rel="stylesheet" type="text/css" href="/css/style.css" />
         <script src="https://use.fontawesome.com/79145639ef.js"></script>
     </head>
     <title>マナブさん リファレンス ~自己学習~</title>
     <body>
         <nav class="navbar navbar-inverse">
             <img class="service-icon" src="/image/manabu-san.png" />
             マナブさん リファレンス
         </nav>
         <section class="api-list">
            <h2>機能紹介</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>API名</th>
                        <th>TYPE</th>
                        <th>URL</th>
                        <th>備考</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td class="api-name-area">対話API<br>【REPL API】</td>
                        <td>GET</td>
                        <td class="url-area"><a href=<?php echo $replApiUrl; ?>><?php echo $replApiUrl; ?></a></td>
                        <td class="biko-area">wordsに会話文を指定することで、返答を返すAPI。会話文を分かち書きを行う。
                            分かち書きされた単語の中から名詞をランダムに1つ抽出し、マルコフ連鎖で関連性のある言葉を導き出した生成した会話を返却する</td>
                    </tr>
                    <tr>
                        <th scope="row">2</th>
                        <td class="api-name-area">学習API<br>【LEARN API】</td>
                        <td>POST</td>
                        <td class="url-area"><a href=<?php echo $learnApiUrl; ?>><?php echo $learnApiUrl; ?></a></td></td>
                        <td class="biko-area">wordsに会話文を指定することで、そのすべての単語を学習するAPI。
                            マルコフ連鎖で3分割に分かち書きを行った形でDBに登録する。ただし、3連続の言葉をつなげたhashを保持し、一意性を保っている。</td>
                    </tr>
                    <tr>
                        <th scope="row">2</th>
                        <td class="api-name-area">マナブさん<br>学習状況一覧</td>
                        <td>GET</td>
                        <td class="url-area"><a href=<?php echo $learnedListUrl; ?>><?php echo $learnedListUrl; ?></a></td>
                        <td class="biko-area"></td>
                    </tr>
                </tbody>
            </table>
         </section>
         <br><br>
         <section>
             <div class="chat-example" data-repl-url=<?php echo "http://{$_SERVER["HTTP_HOST"]}/window/chat.php";?>>
                 <div class="loading">
                     <i class="fa fa-spinner fa-spin fa-5x"></i>
                </div>
                 <div class="arrow_box arrow_box_left hidden copy">
                     left
                 </div>
                 <div class="arrow_box arrow_box_right hidden copy">
                     right
                 </div>
             </div>
         </section>
         <footer class="footer">
           <div class="container">
               <div class="communication chat">
                   <input id="chat-text" type="text" placeholder="会話してね">
                   <i class="fa fa-weixin fa-5x chat-icon" aria-hidden="true"></i>
               </div>
               <p class="text-muted">manabu san is jinkoh-munoh by nanayu ©palcom.inc</p>
           </div>
         </footer>
         <script src="/js/jquery-3.1.1.min.js"></script>
         <script src="/js/script.js"></script>
    </body>
</html>
