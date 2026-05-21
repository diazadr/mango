@echo off
setlocal
cd /d "%~dp0"

if not exist "logs" mkdir "logs"

set "CNC_CONFIG=config\config.host-local.yaml"

.\cnc-edge.exe >> "logs\edge-host.out.log" 2>> "logs\edge-host.err.log"
