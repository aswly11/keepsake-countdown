# Resizes/compresses the original photos from the project root into site/media/compressed.
# Re-run this only if you add new original photos to the root folder.
# Pass -Only "a.jpg","b.jpg" to process just those files and leave the rest alone.
param([string[]]$Only)
Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot "..\..\"
$outDir = Join-Path $PSScriptRoot "..\media\compressed"
$maxDim = 1280
$quality = 72L

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

$files = Get-ChildItem -Path $srcDir -File | Where-Object { $_.Extension -match '\.(jpg|jpeg)$' }
if ($Only) { $files = $files | Where-Object { $Only -contains $_.Name } }

$results = @()

foreach ($f in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)

        $orientationId = 0x0112
        if ($img.PropertyIdList -contains $orientationId) {
            $prop = $img.GetPropertyItem($orientationId)
            $orientation = [int]$prop.Value[0]
            switch ($orientation) {
                2 { $img.RotateFlip('RotateNoneFlipX') }
                3 { $img.RotateFlip('Rotate180FlipNone') }
                4 { $img.RotateFlip('Rotate180FlipX') }
                5 { $img.RotateFlip('Rotate90FlipX') }
                6 { $img.RotateFlip('Rotate90FlipNone') }
                7 { $img.RotateFlip('Rotate270FlipX') }
                8 { $img.RotateFlip('Rotate270FlipNone') }
            }
        }

        $w = $img.Width
        $h = $img.Height
        $scale = 1.0
        if ($w -gt $maxDim -or $h -gt $maxDim) {
            if ($w -ge $h) { $scale = $maxDim / $w } else { $scale = $maxDim / $h }
        }
        $newW = [int]($w * $scale)
        $newH = [int]($h * $scale)

        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($img, 0, 0, $newW, $newH)
        $g.Dispose()

        $outName = [System.IO.Path]::GetFileNameWithoutExtension($f.Name) -replace '[^a-zA-Z0-9_-]', '_'
        $outPath = Join-Path $outDir ("$outName.jpg")
        $bmp.Save($outPath, $jpegCodec, $encParams)

        $bmp.Dispose()
        $img.Dispose()

        $outSize = (Get-Item $outPath).Length
        $results += [PSCustomObject]@{ Source = $f.Name; Output = "$outName.jpg"; OrigKB = [math]::Round($f.Length/1KB,1); NewKB = [math]::Round($outSize/1KB,1) }
    } catch {
        $results += [PSCustomObject]@{ Source = $f.Name; Output = "FAILED: $($_.Exception.Message)"; OrigKB=[math]::Round($f.Length/1KB,1); NewKB=0 }
    }
}

$results | Format-Table -AutoSize | Out-String -Width 200
Write-Output ("TOTAL NEW KB: {0}" -f (($results | Measure-Object -Property NewKB -Sum).Sum))
