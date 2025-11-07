# Protected Range Shadow Demo

这个演示展示了如何使用 Univer 的 Protected Range Shadow 功能，该功能允许您为受保护的单元格区域显示视觉阴影效果。

## 功能特性

### 1. 三种不同权限的单元格区域

Demo 会创建三个具有不同权限级别的受保护区域：

- **A1:C3 - 可编辑区域**
  - Edit Permission: ✅ 允许
  - View Permission: ✅ 允许
  - 用户可以查看和编辑此区域

- **E1:G3 - 不可编辑区域**
  - Edit Permission: ❌ 禁止
  - View Permission: ✅ 允许
  - 用户只能查看，不能编辑此区域

- **A5:C7 - 不可查看区域**
  - Edit Permission: ❌ 禁止
  - View Permission: ❌ 禁止
  - 用户无法查看或编辑此区域

### 2. 四种阴影策略

通过 Facade API 可以切换四种不同的阴影显示策略：

- **always** (默认)
  - 总是显示所有受保护区域的阴影
  - 无论权限如何，所有受保护区域都会有视觉标识

- **non-editable**
  - 只为不可编辑的区域显示阴影
  - 可编辑区域不显示阴影
  - 适合突出显示受限区域

- **non-viewable**
  - 只为不可查看的区域显示阴影
  - 可编辑和只读区域都不显示阴影
  - 适合隐私保护场景

- **none**
  - 不显示任何阴影
  - 所有受保护区域都没有视觉标识
  - 适合需要干净界面的场景

## 使用方法

### 1. 启动 Demo

在浏览器中打开 Univer Sheets example 页面后，右上角会自动显示 "Protected Range Shadow Demo" 面板。

### 2. 设置受保护区域

点击 **🛡️ Setup Protected Ranges** 按钮，Demo 会：
1. 创建三个不同权限的受保护区域
2. 为每个区域设置相应的权限点
3. 填充示例数据
4. 显示设置状态

### 3. 测试权限信息获取

点击 **🔍 Test Get Permission Info** 按钮，在控制台查看：
- A1 单元格的权限信息（可编辑区域）
- E1 单元格的权限信息（不可编辑区域）
- A5 单元格的权限信息（不可查看区域）
- K11 单元格的权限信息（无保护区域）

### 4. 切换阴影策略

使用四个策略切换按钮来测试不同的显示效果：
- 点击按钮后立即应用新策略
- 当前激活的策略会高亮显示
- 画布会自动刷新以显示新效果

## Facade API 使用示例

### 设置阴影策略

```typescript
// 获取 univerAPI 实例
const univerAPI = window.univerAPI;

// 设置策略
univerAPI.setProtectedRangeShadowStrategy('always');
univerAPI.setProtectedRangeShadowStrategy('non-editable');
univerAPI.setProtectedRangeShadowStrategy('non-viewable');
univerAPI.setProtectedRangeShadowStrategy('none');
```

### 获取当前策略

```typescript
// 同步获取
const currentStrategy = univerAPI.getProtectedRangeShadowStrategy();
console.log('Current strategy:', currentStrategy); // 'always' | 'non-editable' | 'non-viewable' | 'none'
```

### 监听策略变化

```typescript
// 订阅策略变化
const subscription = univerAPI.getProtectedRangeShadowStrategy$().subscribe((strategy) => {
    console.log('Strategy changed to:', strategy);
    // 更新 UI 或执行其他操作
});

// 取消订阅
subscription.unsubscribe();
```

### 添加受保护区域

```typescript
const workbook = univerAPI.getActiveWorkbook();
const worksheet = workbook.getActiveSheet();
const permission = workbook.getPermission();

const unitId = workbook.getId();
const subUnitId = worksheet.getSheetId();

// 1. 创建受保护区域
const range = worksheet.getRange('A1:C3');
const result = await permission.addRangeBaseProtection(unitId, subUnitId, [range]);

if (result) {
    const { permissionId, ruleId } = result;
    
    // 2. 设置权限点
    // 设置为不可编辑
    permission.setRangeProtectionPermissionPoint(
        unitId,
        subUnitId,
        permissionId,
        permission.permissionPointsDefinition.RangeProtectionPermissionEditPoint,
        false // 禁止编辑
    );
    
    // 设置为可查看
    permission.setRangeProtectionPermissionPoint(
        unitId,
        subUnitId,
        permissionId,
        permission.permissionPointsDefinition.RangeProtectionPermissionViewPoint,
        true // 允许查看
    );
}
```

### 获取单元格权限信息

```typescript
const workbook = univerAPI.getActiveWorkbook();
const permission = workbook.getPermission();

const unitId = workbook.getId();
const subUnitId = workbook.getActiveSheet().getSheetId();

// 获取 A1 单元格的权限信息
const info = permission.getPermissionInfoWithCell(unitId, subUnitId, 0, 0);

if (info) {
    console.log('Permission ID:', info.permissionId);
    console.log('Rule ID:', info.ruleId);
} else {
    console.log('No protection found for this cell');
}
```

## 技术实现细节

### 组件结构

- `protected-range-shadow-demo.tsx` - React 组件，提供 UI 界面
- `protected-range-shadow-plugin.tsx` - 初始化函数，将组件挂载到 DOM
- 集成在 `main.ts` 中，随应用启动自动加载

### 依赖服务

- `SheetPermissionRenderManagerService` - 管理阴影渲染策略的全局服务
- `RangeProtectionRuleModel` - 存储和管理区域保护规则
- `IPermissionService` - 权限点管理服务

### 阴影渲染机制

1. 策略设置通过 `SheetPermissionRenderManagerService` 全局生效
2. 服务通过 `BehaviorSubject` 发布策略变化事件
3. 渲染扩展 (`RangeProtectionRenderExtension`) 监听策略变化
4. 根据策略和权限点决定是否渲染阴影
5. 画布标记为 dirty 触发重新渲染

## 调试技巧

1. **查看控制台日志**
   - 所有操作都会输出带 `[ProtectedRangeShadow]` 前缀的日志
   - 包括策略切换、权限设置、错误信息等

2. **检查权限点**
   ```typescript
   // 在控制台中检查权限服务
   const injector = window.univer.__getInjector();
   const permissionService = injector.get(IPermissionService);
   
   // 查看所有权限点
   console.log(permissionService.getPermissionPoints());
   ```

3. **查看保护规则**
   ```typescript
   // 获取所有区域保护规则
   const rangeRuleModel = injector.get(RangeProtectionRuleModel);
   const rules = rangeRuleModel.getSubunitRuleList(unitId, subUnitId);
   console.log('Protection rules:', rules);
   ```

## 常见问题

### Q: 为什么看不到阴影？
A: 检查以下几点：
1. 确认已执行 "Setup Protected Ranges"
2. 确认当前策略不是 'none'
3. 确认权限点已正确设置
4. 查看控制台是否有错误信息

### Q: 策略切换后没有效果？
A: 策略切换应该立即生效。如果没有：
1. 检查控制台错误
2. 确认已创建受保护区域
3. 尝试刷新页面重新加载

### Q: 如何移除受保护区域？
A: 使用 `removeRangeProtection` API：
```typescript
permission.removeRangeProtection(unitId, subUnitId, [ruleId]);
```

## 相关文档

- [Permission API 文档](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission)
- [Facade API 文档](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/facade)
- [Range Protection 文档](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission/range-permission)
