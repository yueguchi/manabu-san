<?php
$url = "https://api.instagram.com/oauth/authorize/?client_id=af44a9449105494580468e3f96177d6c&redirect_uri=https://manabu-san.herokuapp.com/validated.php&response_type=code&scope=public_content";

header("Location: {$url}");
exit;