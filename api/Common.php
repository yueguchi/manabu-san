<?php

namespace api;

class Common {

    /**
     * api
     * @var string
     */
    protected $api = 'http://jlp.yahooapis.jp/MAService/V1/parse';
    /**
     * YahooアプリID
     * @var string
     */
    protected $appid = 'dj0zaiZpPXVzYzh2bVhoWXNCeSZzPWNvbnN1bWVyc2VjcmV0Jng9ZWE-';
    /**
     * apiパラメータ
     * @var array
     */
    protected $params = [];

    /**
     * コンストラクタ
     * Common constructor
     */
    public function __construct()
    {
        // TODO ここにlisence keyと一致しないと使えない仕組みを施して、keyを商品として得る。
        date_default_timezone_set('Asia/Tokyo');
        header("Content-Type: text/json; charset=utf-8");
    }

    /**
     * API実行クラス
     *
     * @return mixed
     */
    public function exec()
    {
        $ch = curl_init($this->api.'?'.http_build_query($this->params));
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERAGENT      => "Yahoo AppID: $this->appid"
        ));
        $result = curl_exec($ch);
        curl_close($ch);
        return $this->parseXmlToJson($result);
    }

    /**
     * XMLをJSONに変換する
     * @param $xmlPbj
     * @return mixed
     */
    private function parseXmlToJson($xmlPbj)
    {
        $xmlPbj = simplexml_load_string($xmlPbj, NULL, LIBXML_NOCDATA);
        return json_encode($xmlPbj);
    }
}