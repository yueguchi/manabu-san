<?php

require_once 'api/ReplApi.php';
use \api\ReplApi;

try {
    if (isset($_GET["words"]) === false) {
        throw new \api\APIError("wordsは必須です。", 400);
    }
    $api = new ReplApi($_GET["words"]);
    echo $api->exec();
} catch(Exception $e) {
    http_response_code($e->getCode());
    echo json_encode(["status" => $e->getCode(), "message" => $e->getMessage()]);
}
