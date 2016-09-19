<?php
date_default_timezone_set('Asia/Tokyo');
header("Content-Type: text/json; charset=utf-8");
$ret = ["status" => 200];
echo json_encode($ret);
