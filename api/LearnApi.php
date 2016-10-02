<?php

namespace api;

use \api\APIError;

require_once 'Common.php';
require_once 'APIError.php';

/**
/**
 * manabu-sanに言葉を覚えさせる、自己学習api
 *
 */
class LearnApi extends Common {

    public function __construct($words)
    {
        if (empty($words)) {
            throw new APIError("wordsは必須です", 400);
        }
        $this->params["sentence"] = $words;
        parent::__construct();
    }
}