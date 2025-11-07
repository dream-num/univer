# 🧪 Protected Range Shadow Demo - 快速测试指南

## 🚀 启动步骤

```bash
cd /Users/zw/univer
pnpm dev:examples
```

然后在浏览器中打开 Sheets 示例页面。

## 🎯 Demo 位置

页面右上角会自动显示 **"Protected Range Shadow Demo"** 面板。

## 🧪 测试流程

### 1️⃣ 设置测试数据
点击 **🛡️ Setup Protected Ranges** 按钮

**预期结果：**
- 状态显示：✅ Setup complete! Three protected ranges created.
- 单元格中会出现三个受保护区域，包含示例文本：
  - **A1:C3**: "Editable\nA1:C3\nCan Edit"
  - **E1:G3**: "Non-Editable\nE1:G3\nCannot Edit"
  - **A5:C7**: "Non-Viewable\nA5:C7\nCannot View"

### 2️⃣ 测试阴影策略

点击四个策略按钮，观察阴影变化：

#### **always** (默认策略)
- ✅ A1:C3 显示阴影
- ✅ E1:G3 显示阴影
- ✅ A5:C7 显示阴影

#### **non-editable**
- ❌ A1:C3 不显示阴影（可编辑）
- ✅ E1:G3 显示阴影（不可编辑）
- ✅ A5:C7 显示阴影（不可编辑）

#### **non-viewable**
- ❌ A1:C3 不显示阴影（可查看）
- ❌ E1:G3 不显示阴影（可查看）
- ✅ A5:C7 显示阴影（不可查看）

#### **none**
- ❌ A1:C3 不显示阴影
- ❌ E1:G3 不显示阴影
- ❌ A5:C7 不显示阴影

### 3️⃣ 测试 Facade API

点击 **🔍 Test Get Permission Info** 按钮

**预期控制台输出：**
```
[ProtectedRangeShadow] A1 (Editable) - Permission ID: xxx, Rule ID: xxx
[ProtectedRangeShadow] E1 (Non-Editable) - Permission ID: xxx, Rule ID: xxx
[ProtectedRangeShadow] A5 (Non-Viewable) - Permission ID: xxx, Rule ID: xxx
[ProtectedRangeShadow] K11 (No Protection) - No protection found
```

## 🔍 验证点

### ✅ UI 功能
- [ ] 面板显示在右上角
- [ ] 当前策略正确显示并高亮
- [ ] 按钮点击后策略立即切换
- [ ] 状态信息正确更新

### ✅ 权限设置
- [ ] A1:C3 可以编辑和查看
- [ ] E1:G3 只能查看，不能编辑
- [ ] A5:C7 不能查看和编辑

### ✅ 阴影显示
- [ ] "always" 策略显示所有阴影
- [ ] "non-editable" 只显示不可编辑区域阴影
- [ ] "non-viewable" 只显示不可查看区域阴影
- [ ] "none" 不显示任何阴影

### ✅ API 测试
- [ ] `setProtectedRangeShadowStrategy()` 正常工作
- [ ] `getProtectedRangeShadowStrategy()` 返回正确值
- [ ] `getProtectedRangeShadowStrategy$()` 正确触发订阅
- [ ] `getPermissionInfoWithCell()` 返回正确信息

## 💡 测试技巧

### 在控制台中手动测试

```javascript
// 获取当前策略
window.univerAPI.getProtectedRangeShadowStrategy()

// 切换策略
window.univerAPI.setProtectedRangeShadowStrategy('non-editable')

// 订阅策略变化
const sub = window.univerAPI.getProtectedRangeShadowStrategy$().subscribe(console.log)

// 获取单元格权限
const wb = window.univerAPI.getActiveWorkbook()
const perm = wb.getPermission()
perm.getPermissionInfoWithCell(wb.getId(), wb.getActiveSheet().getSheetId(), 0, 0)
```

## 🐛 常见问题排查

### 问题：看不到 Demo 面板
- 检查控制台是否有错误
- 确认 `initProtectedRangeShadowDemo` 已在 main.ts 中调用

### 问题：阴影不显示
- 确认已点击 "Setup Protected Ranges"
- 检查当前策略是否为 'none'
- 查看控制台日志确认设置成功

### 问题：策略切换无效
- 刷新页面重试
- 检查控制台错误信息
- 确认 `SheetPermissionRenderManagerService` 已注册

## 📊 测试覆盖

✅ **功能测试**
- 三种权限级别的区域创建
- 四种阴影策略切换
- 权限信息查询

✅ **API 测试**
- setProtectedRangeShadowStrategy
- getProtectedRangeShadowStrategy
- getProtectedRangeShadowStrategy$
- addRangeBaseProtection
- setRangeProtectionPermissionPoint
- getPermissionInfoWithCell

✅ **UI 测试**
- 面板渲染
- 按钮交互
- 状态更新
- 实时反馈

## 📝 测试报告模板

```markdown
## 测试结果

- 测试日期：____
- 测试环境：____
- 浏览器版本：____

### 功能测试
- [ ] 受保护区域创建
- [ ] 策略切换
- [ ] 权限查询
- [ ] UI 交互

### 发现的问题
1. ____
2. ____

### 建议改进
1. ____
2. ____
```
