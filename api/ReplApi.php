<?php

namespace api2;

require_once 'api/Common.php';

// ReplApiはnamespaceが「api2」で、Commonと異なるので、
// \api\Commonと正確にコールする必要がある
class ReplApi extends \api\Common {
    
    public function callExec() {
        return $this->exec();
    }
    
    protected function exec()
    {
        parent::exec();
        $ret = ["status" => 200];
        return $ret;
    }
}