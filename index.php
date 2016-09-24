<?php

require_once 'api/ReplApi.php';

use \api2\ReplApi;

// useしているので、\api2\ReplApiと正フルに確にコールしなくても呼べる
$api = new ReplApi();
echo json_encode($api->callExec());
