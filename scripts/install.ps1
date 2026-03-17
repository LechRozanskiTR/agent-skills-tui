param(
  [string]$Version = "",
  [string]$Repo = "LechRozanskiTR/agent-skills-tui",
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA "agent-skills-tui"),
  [string]$BinDir = (Join-Path $HOME ".local\bin")
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  throw $Message
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js 20+ is required but 'node' was not found in PATH."
}

$nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
if ($nodeMajor -lt 20) {
  Fail "Node.js 20+ is required. Found Node.js $nodeMajor."
}

$assetName = "agent-skills-tui-windows.zip"
if ($Version) {
  $downloadUrl = "https://github.com/$Repo/releases/download/$Version/$assetName"
} else {
  $downloadUrl = "https://github.com/$Repo/releases/latest/download/$assetName"
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("agent-skills-tui-" + [System.Guid]::NewGuid())
$archivePath = Join-Path $tempRoot $assetName
$extractDir = Join-Path $tempRoot "extract"

try {
  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
  New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

  Write-Host "Downloading $downloadUrl"
  Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath
  Expand-Archive -Path $archivePath -DestinationPath $extractDir -Force

  $extractedAppDir = Join-Path $extractDir "agent-skills-tui-windows"
  if (-not (Test-Path $extractedAppDir)) {
    Fail "Release archive did not contain agent-skills-tui-windows/"
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $InstallDir) | Out-Null
  if (Test-Path $InstallDir) {
    Remove-Item -Recurse -Force $InstallDir
  }
  Move-Item -Path $extractedAppDir -Destination $InstallDir

  New-Item -ItemType Directory -Force -Path $BinDir | Out-Null

  $cmdTarget = Join-Path $InstallDir "bin\agent-skills-tui.js"
  $cmdWrapperPath = Join-Path $BinDir "agent-skills-tui.cmd"
  $ps1WrapperPath = Join-Path $BinDir "agent-skills-tui.ps1"

  @"
@echo off
node "$cmdTarget" %*
exit /b %ERRORLEVEL%
"@ | Set-Content -Path $cmdWrapperPath -Encoding ASCII

  @"
param(
  [Parameter(ValueFromRemainingArguments = `$true)]
  [string[]]`$Arguments
)

& node "$cmdTarget" @Arguments
exit `$LASTEXITCODE
"@ | Set-Content -Path $ps1WrapperPath -Encoding ASCII

  $currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $pathEntries = @()
  if ($currentUserPath) {
    $pathEntries = $currentUserPath -split ";"
  }

  if ($pathEntries -notcontains $BinDir) {
    $newUserPath = if ($currentUserPath) { "$currentUserPath;$BinDir" } else { $BinDir }
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-Host "Added $BinDir to your user PATH. Open a new terminal to pick it up."
  }

  Write-Host "Installed agent-skills-tui to $InstallDir"
  Write-Host "Created wrappers in $BinDir"
} finally {
  if (Test-Path $tempRoot) {
    Remove-Item -Recurse -Force $tempRoot
  }
}
