<?php

namespace api;

use \api\APIError;

require_once 'api/Common.php';
require_once 'api/APIError.php';

/**
/**
 * 形態素解析APIへのリクエストサンプル（GET）
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=%E5%BA%AD%E3%81%AB%E3%81%AF%E4%BA%8C%E7%BE%BD%E3%83%8B%E3%83%AF%E3%83%88%E3%83%AA%E3%81%8C%E3%81%84%E3%82%8B%E3%80%82
 *
 * ↓
 *
 * http://jlp.yahooapis.jp/MAService/V1/parse?appid=dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-&results=ma&sentence=庭には二羽ニワトリがいる。
 *
 */
class ReplApi extends Common {

    public function __construct($words)
    {
        if (empty($words)) {
            throw new APIError("wordsは必須です", 400);
        }
        $this->params["sentence"] = $words;
        parent::__construct();
    }
}