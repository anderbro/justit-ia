<?php
$prefix = isset($assetsBase) ? $assetsBase : '../';
$pageTitle = isset($pageTitle) ? $pageTitle : 'Affaires Juridiques';
$extraStylesheets = isset($extraStylesheets) ? $extraStylesheets : [];
$extraScriptsHead = isset($extraScriptsHead) ? $extraScriptsHead : [];

if (!function_exists('asset_url')) {
    function asset_url($webPath)
    {
        $root = dirname(__DIR__);
        $normalized = str_replace('\\', '/', $webPath);
        $diskPath = null;
        if (preg_match('#((?:styles|js|libs|img|fonts)/[^?]+)$#', $normalized, $matches)) {
            $diskPath = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $matches[1]);
        }
        $version = ($diskPath && is_file($diskPath)) ? filemtime($diskPath) : time();
        $separator = strpos($webPath, '?') !== false ? '&' : '?';
        return $webPath . $separator . 'v=' . $version;
    }
}
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title><?php echo htmlspecialchars($pageTitle); ?> — Affaires Juridiques</title>
<link rel="icon" type="image/svg+xml" href="<?php echo $prefix; ?>img/favicon.svg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="<?php echo asset_url($prefix . 'libs/bootstrap/css/bootstrap.min.css'); ?>">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

<?php foreach ($extraStylesheets as $stylesheet): ?>
<link rel="stylesheet" href="<?php echo asset_url($prefix . $stylesheet); ?>">
<?php endforeach; ?>

<link rel="stylesheet" href="<?php echo asset_url($prefix . 'styles/theme.css'); ?>">

<script src="<?php echo asset_url($prefix . 'libs/jquery/jquery.js'); ?>"></script>
<script src="<?php echo asset_url($prefix . 'libs/bootstrap/js/bootstrap.bundle.min.js'); ?>"></script>
<script src="<?php echo asset_url($prefix . 'libs/sweetalert/sweetalert2.all.min.js'); ?>"></script>

<?php foreach ($extraScriptsHead as $script): ?>
<script src="<?php echo asset_url($prefix . $script); ?>"></script>
<?php endforeach; ?>
