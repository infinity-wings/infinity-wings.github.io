## Alpha 8.56 Adaptive Fullscreen

- Phones and tablets remain portrait-only.
- The game now fills the complete available portrait screen.
- The logical playfield expands for tall phones and wide tablets instead of stretching or leaving black bars.
- Background rendering extends beneath safe areas while HUD and menus respect notches and home indicators.
- Desktop layout and Alpha 8.50 stability / 8.50.1 mouse fixes are preserved.

## Alpha 8.51 Mobile Portrait

- 手机与平板统一为竖屏游玩。
- 横屏时自动暂停并显示旋转提示。
- 支持 PWA/浏览器可用时请求锁定 portrait。
- 保留 Alpha 8.50.1 鼠标控制修复与稳定性更新。

# 无限之翼 Alpha 8.50.1 Mouse Hotfix

本版在 Alpha 8.50 稳定性更新基础上，专门修复电脑版鼠标控制不跟手的问题。

- 鼠标移动改为真正的一比一位置控制
- 鼠标不再错误复用触控灵敏度
- X/Y 使用统一缩放比例，避免方向速度不一致
- 优先启用原始鼠标输入，减少系统鼠标加速度影响
- 合并高频鼠标采样，改善高刷新率屏幕下的细碎跳动
- 保留异常位移保护，防止锁屏恢复或浏览器事件造成瞬移
