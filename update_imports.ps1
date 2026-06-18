$replacements = @{
    "~/hooks/use-upload" = "~/hooks/shared/use-upload"
    "~/hooks/use-debounce" = "~/hooks/shared/use-debounce"
    "~/hooks/use-data-table" = "~/hooks/shared/use-data-table"
    "~/hooks/use-copy-product-link" = "~/hooks/shared/use-copy-product-link"
    "~/hooks/use-webinar" = "~/hooks/creator/use-webinar"
    "~/hooks/use-create-webinar" = "~/hooks/creator/use-create-webinar"
    "~/hooks/use-produk-digital-kelas" = "~/hooks/creator/use-produk-digital-kelas"
    "~/hooks/use-create-produk-digital" = "~/hooks/creator/use-create-produk-digital"
    "~/hooks/use-create-kelas" = "~/hooks/creator/use-create-kelas"
}
$files = Get-ChildItem -Path C:\TA\CuanIN\src -Filter *.ts* -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $newContent = $newContent -replace "['`"]$old['`"]", "'$new'"
    }
    if ($newContent -ne $content) {
        $newContent | Set-Content $file.FullName -Encoding UTF8
    }
}
