$env:CNC_CONFIG = "config/config.host-local.yaml"
Set-Location -Path $PSScriptRoot
& ".\cnc-edge.exe"
