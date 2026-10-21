# Copies only the live site files into dist\ and deploys them to Cloudflare Pages.
# Usage:  .\publish.ps1            (build + deploy)
#         .\publish.ps1 -BuildOnly (just rebuild dist\ to check it)
param(
  [string]$Project = "james-fartro",
  [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dist = Join-Path $root "dist"

# Everything that goes online. Mockups, old versions, and .claude stay local.
$files = @(
  "index.html",
  "resume.html",
  "style.css",
  "script.js",
  "James-Fartro-Resume.pdf",
  "images\avatar.svg"
)

if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
foreach ($f in $files) {
  $target = Join-Path $dist $f
  New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
  Copy-Item (Join-Path $root $f) $target
}
Write-Host "Built dist\ with $($files.Count) files."

if (-not $BuildOnly) {
  npx --yes wrangler@4 pages deploy $dist --project-name $Project --branch main
}
