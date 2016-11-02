# manabu-san
Chatterbot

# ディレクトリ構成

- api
    - 実際にYahooAPIに問い合わせを行う

- front
    - クライアントに画面を見せる

- window
    - api窓口
    
# モジュール構成

- リファレンス
    - https://manabu-san.herokuapp.com/
    
- 自己学習(フロント)
    - https://manabu-san.herokuapp.com/front/manabu.php
    
- 会話API
    - https://manabu-san.herokuapp.com/window/chat.php?words=【会話文】
    
# local環境構築

- mysql
    - root:root
    
- DESC

```
create database manabu_san;
create table manabu (id int(11) primary key auto_increment, word1 varchar(255), word2 varchar(255), word3 varchar(255), hash varchar(255) UNIQUE KEY);
```