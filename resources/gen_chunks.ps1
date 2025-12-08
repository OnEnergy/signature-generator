$base64 = Get-Content "resources/on-yellow-profile.png.base64" -Raw
$builder = New-Object System.Text.StringBuilder
for ($i = 0; $i -lt $base64.Length; $i += 100) {
    $chunk = $base64.Substring($i, [Math]::Min(100, $base64.Length - $i))
    if ($i + 100 -ge $base64.Length) {
        [void]$builder.AppendLine('    "' + $chunk + '";')
    } else {
        [void]$builder.AppendLine('    "' + $chunk + '" +')
    }
}
$builder.ToString() | Out-File -Encoding ascii "resources/fallbackLogoDataUrl.txt"
