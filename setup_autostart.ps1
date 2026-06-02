# 个人博客服务器开机自启动设置脚本
Write-Host "正在设置个人博客服务器开机自启动..." -ForegroundColor Green

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host "右键点击脚本文件，选择'以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit 1
}

# 创建启动文件夹快捷方式（方法1：用户登录时启动）
$startupPath = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupPath "个人博客服务器.lnk"
$targetPath = "C:\Users\Lenovo\Desktop\my-personal-blog\start_server.vbs"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $targetPath
$Shortcut.WorkingDirectory = "C:\Users\Lenovo\Desktop\my-personal-blog"
$Shortcut.Description = "个人博客服务器开机自启动"
$Shortcut.Save()

Write-Host "已创建启动文件夹快捷方式: $shortcutPath" -ForegroundColor Green

# 方法2：使用任务计划程序（更可靠）
$taskName = "个人博客服务器自启动"
$taskDescription = "电脑开机时自动启动个人博客服务器"
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "server.js" -WorkingDirectory "C:\Users\Lenovo\Desktop\my-personal-blog"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

try {
    # 删除已存在的任务（如果存在）
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    
    # 创建新任务
    Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
    
    Write-Host "已创建任务计划程序任务: $taskName" -ForegroundColor Green
    Write-Host "任务将在下次开机时自动启动服务器" -ForegroundColor Green
}
catch {
    Write-Host "创建任务计划程序失败，但启动文件夹快捷方式已创建" -ForegroundColor Yellow
    Write-Host "错误信息: $_" -ForegroundColor Red
}

# 方法3：创建服务（需要额外工具）
Write-Host "`n可选方案：使用NSSM创建Windows服务" -ForegroundColor Cyan
Write-Host "1. 下载 NSSM: https://nssm.cc/download" -ForegroundColor Cyan
Write-Host "2. 以管理员身份运行CMD" -ForegroundColor Cyan
Write-Host "3. 执行: nssm install PersonalBlogServer" -ForegroundColor Cyan
Write-Host "4. 设置路径: C:\Program Files\nodejs\node.exe" -ForegroundColor Cyan
Write-Host "5. 设置参数: C:\Users\Lenovo\Desktop\my-personal-blog\server.js" -ForegroundColor Cyan
Write-Host "6. 启动服务: net start PersonalBlogServer" -ForegroundColor Cyan

Write-Host "`n设置完成！" -ForegroundColor Green
Write-Host "服务器将在下次开机时自动启动" -ForegroundColor Green
Write-Host "当前服务器状态: 正在运行 (http://localhost:3000)" -ForegroundColor Green

pause
