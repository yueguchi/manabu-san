<?php

$code = $_GET["code"];

/*
curl -F 'client_id=af44a9449105494580468e3f96177d6c' -F 'client_secret=c20db343d14447b2b5e379d781ab3767' -F 'grant_type=authorization_code' -F 'redirect_uri=https://manabu-san.herokuapp.com/validated.php' -F 'code=【上記で取得したcode】’ https://api.instagram.com/oauth/access_token
*/

$url = 'https://api.instagram.com/oauth/access_token';
$data = array(
    'client_id' => 'af44a9449105494580468e3f96177d6c',
    'client_secret' => 'c20db343d14447b2b5e379d781ab3767',
    'grant_type' => 'authorization_code',
    'redirect_uri' => 'https://manabu-san.herokuapp.com/validated.php',
    'code' => $code
);
$options = array('http' => array(
    'method' => 'POST',
    'content' => http_build_query($data),
));
$contents = file_get_contents($url, false, stream_context_create($options));
var_dump($contents)
