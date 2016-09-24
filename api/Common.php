<?php

namespace api;

class Common {
    protected function exec()
    {
        date_default_timezone_set('Asia/Tokyo');
        header("Content-Type: text/json; charset=utf-8");
    }
}