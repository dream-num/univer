# Protected Range Shadow Demo

这是一个完整的 demo，用于测试 Univer 的 Protected Range Shadow 功能。

## 📚 文档索引

1. **[TEST_GUIDE.md](./TEST_GUIDE.md)** - 快速测试指南
   - 启动步骤
   - 测试流程
   - 验证点清单
   - 常见问题排查

2. **[PROTECTED_RANGE_SHADOW_DEMO.md](./PROTECTED_RANGE_SHADOW_DEMO.md)** - 完整用户文档
   - 功能特性说明
   - 使用方法
   - Facade API 使用示例
   - 技术实现细节
   - 调试技巧

3. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 实现总结
   - 任务完成情况
   - 文件结构说明
   - 技术实现要点
   - 扩展建议

## 🚀 快速开始

```bash
# 1. 启动开发服务器
pnpm dev:examples

# 2. 在浏览器中打开 Sheets 示例

# 3. 在右上角找到 "Protected Range Shadow Demo" 面板

# 4. 点击 "🛡️ Setup Protected Ranges" 开始测试
```

## 🎯 功能概览

### 三种权限级别
- **A1:C3** - 可编辑（可查看 + 可编辑）
- **E1:G3** - 不可编辑（可查看 + 不可编辑）
- **A5:C7** - 不可查看（不可查看 + 不可编辑）

### 四种阴影策略
- **always** - 总是显示阴影
- **non-editable** - 只显示不可编辑区域的阴影
- **non-viewable** - 只显示不可查看区域的阴影
- **none** - 不显示阴影

### 测试的 Facade API
```typescript
// 策略管理
univerAPI.setProtectedRangeShadowStrategy(strategy)
univerAPI.getProtectedRangeShadowStrategy()
univerAPI.getProtectedRangeShadowStrategy$()

// 权限管理
permission.addRangeBaseProtection(unitId, subUnitId, ranges)
permission.setRangeProtectionPermissionPoint(...)
permission.getPermissionInfoWithCell(unitId, subUnitId, row, col)
```

## 📁 文件结构

```
custom/
├── protected-range-shadow-demo.tsx      # React 组件（UI）
├── protected-range-shadow-plugin.tsx    # 初始化插件
├── README.md                            # 本文件
├── TEST_GUIDE.md                        # 测试指南
├── PROTECTED_RANGE_SHADOW_DEMO.md      # 完整文档
└── IMPLEMENTATION_SUMMARY.md           # 实现总结
```

## 🔗 相关链接

- [Univer 文档](https://github.com/dream-num/univer)
- [Permission API](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission)
- [Facade API](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/facade)

## 💬 反馈

如有问题或建议，请查看 [常见问题](./PROTECTED_RANGE_SHADOW_DEMO.md#常见问题) 或提交 Issue。
