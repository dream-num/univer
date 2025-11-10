# 重构权限系统 API

## 重构的原则
1. facade只是对源码逻辑的调用，请不要在facade中去实现业务逻辑
2. 最终需要编写一套完整的测试用例来测试这些api

## 🔍 关键发现

### 批量操作底层已支持

**重要发现**：在代码审查过程中发现，底层 Command 层（`AddRangeProtectionMutation`）已经支持批量创建多个保护规则，但当前 Facade API 没有暴露这个能力。

```typescript
// 底层 Command 定义（已支持批量）
export interface IAddRangeProtectionMutationParams {
    rules: IRangeProtectionRule[];  // ✅ 数组参数
    unitId: string;
    subUnitId: string;
}

// Handler 实现
handler: (accessor, params) => {
    rules.forEach((rule) => {  // ✅ 循环处理多个规则
        selectionProtectionRuleModel.addRule(unitId, subUnitId, rule);
    });
}
```

**现状**：当前 `addRangeBaseProtection()` 在调用时只传入单个规则元素
```typescript
// 当前 Facade 实现（只传单个规则）
this._commandService.syncExecuteCommand(AddRangeProtectionMutation.id, {
    rules: [{ /* 单个规则 */ }],  // ❌ 数组中只有一个元素
});
```

**影响**：
- ✅ **好消息**：实现批量操作的成本很低，底层基础设施已就绪
- 🎯 **实现路径**：只需在 Facade/新 API 层封装批量逻辑
- ⚡ **性能提升**：可一次性创建多个独立规则，减少网络请求和 Command 执行次数

---

## 一、现有权限系统分析

### 1.1 当前 Facade API 结构

#### 核心类：FPermission

**位置**: `submodules/univer/packages/sheets/src/facade/f-permission.ts`

**主要方法**:

##### Workbook 级别
- `setWorkbookPermissionPoint(unitId, FPointClass, value)` - 设置工作簿权限点
- `checkWorkbookPermissionPoint(unitId, FPointClass)` - 检查工作簿权限点
- `setWorkbookEditPermission(unitId, value)` - 便捷方法：设置编辑权限

##### Worksheet 级别
- `addWorksheetBasePermission(unitId, subUnitId)` - 添加工作表基础权限（返回 permissionId）
- `removeWorksheetPermission(unitId, subUnitId)` - 移除工作表权限
- `setWorksheetPermissionPoint(unitId, subUnitId, FPointClass, value)` - 设置工作表权限点
- `checkWorksheetPermissionPoint(unitId, subUnitId, FPointClass)` - 检查工作表权限点

##### Range 级别
- `addRangeBaseProtection(unitId, subUnitId, ranges)` - 添加范围保护（返回 {permissionId, ruleId}）
- `removeRangeProtection(unitId, subUnitId, ruleIds)` - 移除范围保护
- `setRangeProtectionPermissionPoint(unitId, subUnitId, permissionId, FPointClass, value)` - 设置范围权限点
- `setRangeProtectionRanges(unitId, subUnitId, ruleId, ranges)` - 更新保护范围
- `getPermissionInfoWithCell(unitId, subUnitId, row, column)` - 获取单元格权限信息

##### 公开属性
- `permissionPointsDefinition` - 权限点定义常量
- `rangeRuleChangedAfterAuth$` - 范围规则变更 Observable
- `sheetRuleChangedAfterAuth$` - 工作表规则变更 Observable
- `unitPermissionInitStateChange$` - 单元权限初始化状态 Observable

### 1.2 现有权限点枚举

#### Workbook 权限点（22个）
- WorkbookEditablePermission - 编辑
- WorkbookViewPermission - 查看
- WorkbookPrintPermission - 打印
- WorkbookExportPermission - 导出
- WorkbookSharePermission - 分享
- WorkbookCopyPermission - 复制内容
- WorkbookDuplicatePermission - 整本复制
- WorkbookCopySheetPermission - 复制工作表
- WorkbookCommentPermission - 评论
- WorkbookManageCollaboratorPermission - 管理协作者
- WorkbookCreateSheetPermission - 创建工作表
- WorkbookDeleteSheetPermission - 删除工作表
- WorkbookRenameSheetPermission - 重命名工作表
- WorkbookMoveSheetPermission - 移动工作表
- WorkbookHideSheetPermission - 隐藏工作表
- WorkbookViewHistoryPermission - 查看历史
- WorkbookHistoryPermission - 管理历史
- WorkbookRecoverHistoryPermission - 恢复历史
- WorkbookCreateProtectPermission - 创建保护
- WorkbookInsertRowPermission - 插入行
- WorkbookInsertColumnPermission - 插入列
- WorkbookDeleteRowPermission - 删除行
- WorkbookDeleteColumnPermission - 删除列

#### Worksheet 权限点（18个）

**基础权限点**（4个）:
- WorksheetEditPermission - 编辑
- WorksheetViewPermission - 查看
- WorksheetManageCollaboratorPermission - 管理协作者
- WorksheetDeleteProtectionPermission - 删除保护

**面板权限点**（14个）:
- WorksheetCopyPermission - 复制
- WorksheetSetCellValuePermission - 设置单元格值
- WorksheetSetCellStylePermission - 设置单元格样式
- WorksheetSetRowStylePermission - 设置行样式
- WorksheetSetColumnStylePermission - 设置列样式
- WorksheetInsertRowPermission - 插入行
- WorksheetInsertColumnPermission - 插入列
- WorksheetDeleteRowPermission - 删除行
- WorksheetDeleteColumnPermission - 删除列
- WorksheetSortPermission - 排序
- WorksheetFilterPermission - 筛选
- WorksheetPivotTablePermission - 数据透视表
- WorksheetInsertHyperlinkPermission - 插入超链接
- WorksheetEditExtraObjectPermission - 编辑额外对象

**存在但未在 `getAllWorksheetPermissionPoint()` 中列出的权限点**:
- WorksheetSelectProtectedCellsPermission（选择受保护单元格）- ⚠️ 存在于代码中，但未在工具函数中导出
- WorksheetSelectUnProtectedCellsPermission（选择未保护单元格）- ⚠️ 存在于代码中，但未在工具函数中导出

**说明**: 这两个权限点的类定义存在于 `permission-point/worksheet/` 目录下，但没有被包含在 `getAllWorksheetPermissionPoint()` 或 `getAllWorksheetPermissionPointByPointPanel()` 函数中，这可能是有意为之（因为它们用于特殊场景），也可能是遗漏。

#### Range 权限点（4个）
- RangeProtectionPermissionEditPoint - 编辑
- RangeProtectionPermissionViewPoint - 查看
- RangeProtectionPermissionManageCollaPoint - 管理协作者
- RangeProtectionPermissionDeleteProtectionPoint - 删除保护

### 1.3 核心底层服务

#### IAuthzIoService - 授权 I/O 服务
```typescript
interface IAuthzIoService {
    create(config: ICreateRequest): Promise<string>  // 创建权限对象，返回 objectID
    allowed(config: IAllowedRequest): Promise<IActionInfo[]>  // 检查权限
    batchAllowed(config: IAllowedRequest[]): Promise<IBatchAllowedResponse>  // 批量检查
    list(config: IListPermPointRequest): Promise<IPermissionPoint[]>  // 列出权限对象
    listCollaborators(config: IListCollaboratorRequest): Promise<ICollaborator[]>  // 列出协作者
    updateCollaborator(config: IUpdateCollaboratorRequest): Promise<void>  // 更新协作者
    deleteCollaborator(config: IDeleteCollaboratorRequest): Promise<void>  // 删除协作者
    createCollaborator(config: ICreateCollaboratorRequest): Promise<void>  // 创建协作者
    putCollaborators(config: IPutCollaboratorsRequest): Promise<void>  // 批量设置协作者
}
```

#### PermissionService - 本地权限管理
- 管理权限点的注册、更新和查询
- 通过 RxJS 管理权限点状态变化

#### 保护规则模型
- **RangeProtectionRuleModel** - 管理范围保护规则
- **WorksheetProtectionRuleModel** - 管理工作表保护规则
- **WorksheetProtectionPointModel** - 管理工作表权限点规则

### 1.4 现有 API 的问题

#### 1. 复杂性高，学习成本大
- 需要理解 `permissionId` vs `ruleId` 的区别
- 必须先调用 `addXxxBasePermission` 再设置权限点
- 需要手动管理 unitId、subUnitId、permissionId、ruleId

#### 2. API 不一致
- Workbook 级别有便捷方法 `setWorkbookEditPermission`
- Worksheet/Range 级别没有对应的便捷方法
- 缺少高层抽象（如 setMode）

#### 3. 缺少面向场景的 API
- 没有"只读模式"、"评论模式"等快捷设置
- 没有批量配置接口
- 没有预设模板（Owner/Editor/Viewer）

#### 4. Range 保护缺少规则对象抽象
- 返回的是 {permissionId, ruleId}，而不是规则对象
- 无法通过规则对象直接操作（更新、删除等）

#### 5. 协作者管理分离
- 协作者管理在 IAuthzIoService 中
- Facade 层没有暴露协作者管理接口
- 无法在 Facade 层方便地管理协作者

#### 6. 调试能力弱
- 缺少 `debugCellPermission` 类似的调试接口
- 难以追踪权限规则的来源和优先级

---

## 二、新设计 API 评估

### 2.1 优点分析

#### ✅ 1. 分层清晰
- WorkbookPermission / WorksheetPermission / RangePermission 三层结构清晰
- 每层都有明确的职责边界

#### ✅ 2. 易用性提升
- 提供高层 `setMode()` 方法（owner/editor/viewer）
- 提供快捷方法 `setReadOnly()` / `setEditable()`
- 简化常见场景的使用

#### ✅ 3. 规则对象化
- `RangeProtectionRule` 接口封装了规则操作
- 提供 `updateRanges()` / `updateOptions()` / `remove()` 方法
- 隐藏内部 permissionId/ruleId

#### ✅ 4. 协作者管理集成
- 在 WorkbookPermission 中直接提供协作者管理方法
- 统一的 API 接口

#### ✅ 5. 调试支持增强
- `debugCellPermission()` 方法
- 返回命中的规则信息

#### ✅ 6. 响应式设计
- 统一使用 `subscribe()` 订阅变化
- 返回 `UnsubscribeFn` 取消订阅

### 2.2 API 设计规范

基于对现有代码的分析，新 API 设计需要遵循以下规范：

#### 2.2.1 权限点映射机制

**问题**: 新设计使用枚举字符串，但现有系统使用类构造器

**解决方案**: 内部维护枚举到类的映射表

```typescript
// WorkbookPermission 实现中的映射
class WorkbookPermissionImpl {
  private static readonly POINT_CLASS_MAP = {
    [WorkbookPermissionPoint.Edit]: WorkbookEditablePermission,
    [WorkbookPermissionPoint.Print]: WorkbookPrintPermission,
    [WorkbookPermissionPoint.Export]: WorkbookExportPermission,
    // ... 其他映射
  };
  
  setPoint(point: WorkbookPermissionPoint, value: boolean): void {
    const PointClass = WorkbookPermissionImpl.POINT_CLASS_MAP[point];
    const instance = new PointClass(this._unitId);
    this._permissionService.updatePermissionPoint(instance.id, value);
  }
}
```

**注意事项**:
- ✅ WorksheetSelectProtectedCells 和 WorksheetSelectUnProtectedCells 权限点存在但未在工具函数中列出（需确认是否应该暴露）

#### 2.2.2 批量操作支持

**关键发现**: 底层 Command 已支持批量，只需在 Facade 层暴露

**Range 保护批量创建**:
```typescript
// ✅ 底层支持（AddRangeProtectionMutation）
interface IAddRangeProtectionMutationParams {
  rules: IRangeProtectionRule[];  // 数组参数
  unitId: string;
  subUnitId: string;
}

// 新 API 实现
class WorksheetPermissionImpl {
  async protectRanges(configs: Array<{
    ranges: FRange[];
    options?: RangeProtectionOptions;
  }>): Promise<RangeProtectionRule[]> {
    // 1. 并行创建 permissionId
    const permissionIds = await Promise.all(
      configs.map(c => this._authzIoService.create({...}))
    );
    
    // 2. 一次性添加多个规则（复用底层批量能力）
    const ruleParams = configs.map((c, i) => ({
      permissionId: permissionIds[i],
      ranges: c.ranges.map(r => r.getRange()),
      id: `ruleId_${generateRandomId(6)}`,
      // ...
    }));
    
    await this._commandService.executeCommand(
      AddRangeProtectionMutation.id,
      { unitId, subUnitId, rules: ruleParams }  // ← 多个规则
    );
  }
}
```

**协作者批量管理**:
```typescript
// ✅ 底层支持（IAuthzIoService.putCollaborators）
interface IPutCollaboratorsRequest {
  objectID: string;
  unitID: string;
  collaborators: Collaborator[];  // 数组参数
}

// 新 API 实现
class WorkbookPermissionImpl {
  async setCollaborators(collaborators: Array<{ 
    userId: string; 
    role: UnitRole 
  }>): Promise<void> {
    await this._authzIoService.putCollaborators({
      objectID: this._permissionId,
      unitID: this._unitId,
      collaborators: collaborators.map(c => ({
        id: c.userId,
        role: c.role,
        subject: this._userManager.getUser(c.userId)
      }))
    });
  }
}
```

**实现成本**: 🟢 低（底层已支持，只需 Facade 层封装）

#### 2.2.3 单元格权限判断

**关键发现**: 源码中已有完整实现，不要重复造轮子

**复用现有服务**:
```typescript
class WorksheetPermissionImpl {
  constructor(
    @Inject(RangeProtectionCache) private _cache: RangeProtectionCache,
    @Inject(IPermissionService) private _permissionService: IPermissionService
  ) {}
  
  // ✅ 使用 RangeProtectionCache（已有缓存机制）
  canEditCell(row: number, col: number): boolean {
    const cellInfo = this._cache.getCellInfo(
      this._unitId, this._subUnitId, row, col
    );
    
    if (!cellInfo) {
      // 无保护规则，检查上层权限
      return this._checkWorkbookAndWorksheetEdit();
    }
    
    return cellInfo[UnitAction.Edit] ?? false;
  }
  
  // ✅ 使用 checkRangesEditablePermission 工具函数
  canEditRange(range: FRange): boolean {
    return checkRangesEditablePermission(
      this._injector,
      this._unitId,
      this._subUnitId,
      [range.getRange()]
    );
  }
}
```

**权限判断优先级**（已由 `checkRangesEditablePermission` 实现）:
1. Workbook 级别（短路：不可编辑则直接返回 false）
2. Worksheet 级别（短路：不可编辑则直接返回 false）
3. Range 级别（所有规则都允许才允许 - 最严格策略）

**相关工具**:
- `RangeProtectionCache.getCellInfo()` - 单元格权限缓存
- `checkRangesEditablePermission()` - 范围权限检查（位于 `/packages/sheets/src/services/permission/util.ts`）
- `SheetPermissionCheckController` - 权限检查控制器

#### 2.2.4 权限变更同步机制

**要求**: 协作模式下，权限变更需要通过 Command 模式同步

**实现方式**:
```typescript
class WorkbookPermissionImpl {
  async setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void> {
    // ❌ 错误：直接修改本地状态
    // this._permissionService.updatePermissionPoint(pointId, value);
    
    // ✅ 正确：通过 Command 执行（支持 undo/redo 和协作同步）
    await this._commandService.executeCommand(
      SetWorkbookPermissionPointCommand.id,
      { unitId: this._unitId, point, value }
    );
  }
}
```

**现有 Command**:
- `AddRangeProtectionMutation` - 添加范围保护
- `DeleteRangeProtectionMutation` - 删除范围保护
- `SetRangeProtectionMutation` - 修改范围保护
- `AddWorksheetProtectionMutation` - 添加工作表保护
- `SetWorksheetPermissionPointsMutation` - 设置工作表权限点

#### 2.2.5 响应式更新订阅

**当前 API**:
```typescript
// 现有的 Observable（已使用 RxJS）
class FPermission {
  rangeRuleChangedAfterAuth$: Observable<IRuleChange>;
  sheetRuleChangedAfterAuth$: Observable<ISheetRuleChange>;
  unitPermissionInitStateChange$: Observable<IUnitPermissionInitState>;
}
```

**新 API 设计（完全基于 RxJS）**:
```typescript
import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, filter, distinctUntilChanged, shareReplay } from 'rxjs/operators';

interface WorksheetPermission {
  /**
   * 权限快照变化流（BehaviorSubject，立即提供初始值）
   * 订阅时会立即得到当前状态
   */
  readonly permission$: Observable<WorksheetPermissionSnapshot>;
  
  /**
   * 单个权限点变化流
   * 适用于只关心特定权限点的场景
   */
  readonly pointChange$: Observable<{
    point: WorksheetPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>;
  
  /**
   * Range 保护规则变化流（增删改）
   */
  readonly rangeProtectionChange$: Observable<{
    type: 'add' | 'update' | 'delete';
    rules: RangeProtectionRule[];
  }>;
  
  /**
   * 当前所有 Range 保护规则列表流（BehaviorSubject）
   * 订阅时会立即得到当前规则列表
   */
  readonly rangeProtectionRules$: Observable<RangeProtectionRule[]>;
}

// 实现示例
class WorksheetPermissionImpl {
  private readonly _permissionSubject: BehaviorSubject<WorksheetPermissionSnapshot>;
  private readonly _pointChangeSubject = new Subject<{
    point: WorksheetPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>();
  private readonly _rangeProtectionChangeSubject = new Subject<{
    type: 'add' | 'update' | 'delete';
    rules: RangeProtectionRule[];
  }>();
  
  // 公开的 Observable（防止外部 next）
  readonly permission$: Observable<WorksheetPermissionSnapshot>;
  readonly pointChange$: Observable<any>;
  readonly rangeProtectionChange$: Observable<any>;
  readonly rangeProtectionRules$: Observable<RangeProtectionRule[]>;
  
  constructor(
    @Inject(WorksheetProtectionRuleModel) private _ruleModel: WorksheetProtectionRuleModel,
    @Inject(WorksheetProtectionPointModel) private _pointModel: WorksheetProtectionPointModel
  ) {
    // 初始化 BehaviorSubject（带初始值）
    this._permissionSubject = new BehaviorSubject(this._buildSnapshot());
    this.permission$ = this._permissionSubject.asObservable();
    
    // 监听底层模型变化，更新快照
    this._pointModel.pointChange$
      .pipe(
        filter(change => change.unitId === this._unitId && change.subUnitId === this._subUnitId)
      )
      .subscribe(() => {
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
      });
    
    // 转发权限点变化
    this.pointChange$ = this._pointChangeSubject.asObservable();
    
    // 转发规则变化
    this.rangeProtectionChange$ = this._rangeProtectionChangeSubject.asObservable();
    
    // Range 规则列表流（基于 ruleChange$ 构建）
    this.rangeProtectionRules$ = this._ruleModel.ruleChange$
      .pipe(
        filter(change => change.unitId === this._unitId && change.subUnitId === this._subUnitId),
        map(() => this.listRangeProtectionRules()),
        shareReplay(1) // 缓存最新值，新订阅者立即获得
      );
  }
  
  /**
   * 兼容性方法：提供类似旧 API 的简化订阅接口
   * 但底层仍然使用 RxJS
   */
  subscribe(listener: (snapshot: WorksheetPermissionSnapshot) => void): UnsubscribeFn {
    const subscription = this.permission$.subscribe(listener);
    return () => subscription.unsubscribe();
  }
}
```

**使用示例**:
```typescript
// 方式 1: 直接订阅 Observable（推荐，RxJS 原生）
const worksheet = workbook.getActiveSheet();
const permission = worksheet.getPermission();

// 使用 RxJS 操作符
permission.permission$
  .pipe(
    map(snapshot => snapshot.canEdit),
    distinctUntilChanged()
  )
  .subscribe(canEdit => {
    console.log('Can edit changed:', canEdit);
  });

// 组合多个流
combineLatest([
  permission.permission$,
  permission.rangeProtectionRules$
])
  .pipe(
    debounceTime(300), // 防抖
    filter(([snapshot, rules]) => rules.length > 0)
  )
  .subscribe(([snapshot, rules]) => {
    console.log('Permission and rules changed:', snapshot, rules);
  });

// 方式 2: 简化订阅（兼容不熟悉 RxJS 的用户）
const unsubscribe = permission.subscribe(snapshot => {
  console.log('Permission snapshot:', snapshot);
});

// 取消订阅
unsubscribe();

// 方式 3: 只监听特定权限点变化
permission.pointChange$
  .pipe(
    filter(change => change.point === WorksheetPermissionPoint.Edit)
  )
  .subscribe(change => {
    console.log('Edit permission changed:', change.value);
  });
```

**设计优势**:
1. ✅ **深度 RxJS 集成**: 所有响应式接口都基于 Observable/Subject
2. ✅ **立即获取初始值**: 使用 BehaviorSubject 确保订阅时立即得到当前状态
3. ✅ **强大的组合能力**: 可使用 RxJS 全套操作符（map、filter、debounce 等）
4. ✅ **细粒度订阅**: 提供多个 Observable，用户按需订阅
5. ✅ **向后兼容**: 保留简化的 `subscribe()` 方法供不熟悉 RxJS 的用户使用
6. ✅ **性能优化**: 使用 `shareReplay(1)` 避免重复计算
7. ✅ **类型安全**: 所有 Observable 都有明确的泛型类型

#### 2.2.6 错误处理规范

**原则**: 让底层服务处理错误，Facade 层只做必要的参数校验

```typescript
class WorksheetPermissionImpl {
  async protect(options?: RangeProtectionOptions): Promise<RangeProtectionRule> {
    // ✅ 参数校验（Facade 层责任）
    if (!this._ranges || this._ranges.length === 0) {
      throw new Error('Cannot protect empty range');
    }
    
    try {
      // ✅ 委托给底层服务（让它处理业务逻辑和协作错误）
      const permissionId = await this._authzIoService.create({...});
      // ...
    } catch (error) {
      // ✅ 保留原始错误信息，不做过度包装
      throw error;
    }
  }
}
```

**常见错误场景**（底层已处理）:
- 工作表保护与范围保护冲突（`addRangeBaseProtection` 会检查并抛出错误）
- 范围保护重叠（`addRangeBaseProtection` 会检查并抛出错误）
- 权限不足（`IAuthzIoService` 会返回失败）

#### 2.2.7 类型定义补充

**需要新增的类型**:
```typescript
// 权限点枚举
enum WorkbookPermissionPoint {
  Edit = 'edit',
  View = 'view',
  Print = 'print',
  Export = 'export',
  Share = 'share',
  CopyContent = 'copy-content',
  Duplicate = 'duplicate',
  // ... 其他 22 个权限点
}

enum WorksheetPermissionPoint {
  Edit = 'edit',
  View = 'view',
  Copy = 'copy',
  SetCellValue = 'set-cell-value',
  SetCellStyle = 'set-cell-style',
  // ... 其他 18 个权限点
}

// 保护规则选项
interface RangeProtectionOptions {
  name?: string;
  description?: string;
  allowEdit?: boolean;
  allowedUsers?: string[];
}

// 权限快照
interface WorksheetPermissionSnapshot {
  canEdit: boolean;
  canView: boolean;
  protectionRules: RangeProtectionRule[];
  permissionPoints: Record<WorksheetPermissionPoint, boolean>;
}
```

#### 2.2.8 向后兼容策略

**原则**: 新旧 API 共存，逐步迁移

```typescript
// 保留旧 API（标记为 deprecated）
class FPermission {
  /** @deprecated Use workbook.getPermission() instead */
  setWorkbookPermissionPoint(unitId: string, FPointClass: any, value: boolean): void {
    // 内部转发给新 API
    const workbook = this._univerInstanceService.getUnit(unitId);
    workbook.getPermission().setPoint(/* 映射到新枚举 */, value);
  }
}

// 新 API
class FWorkbook {
  getPermission(): WorkbookPermission {
    return new WorkbookPermissionImpl(this._unitId, this._injector);
  }
}
```

#### 2.2.9 性能优化建议

1. **缓存利用**
   - 复用 `RangeProtectionCache` 的单元格权限缓存
   - 避免重复查询 `PermissionService`

2. **批量操作优先**
   - 使用 `protectRanges()` 而非循环调用 `protect()`
   - 使用 `setCollaborators()` 而非循环调用 `addCollaborator()`

3. **延迟加载**
   - `listCollaborators()` 和 `listRangeProtectionRules()` 按需调用
   - 不要在初始化时自动加载

4. **防抖处理**
   - 高频权限点变更需要防抖（由业务层决定）

---

## 三、新设计 API 规范

### 3.1 WorkbookPermission 接口

```typescript
import type { Observable } from 'rxjs';

interface WorkbookPermission {
  // 权限模式设置
  setMode(mode: 'owner' | 'editor' | 'viewer'): Promise<void>;
  
  // 权限点控制
  setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void>;
  getPoint(point: WorkbookPermissionPoint): boolean;
  
  // 协作者管理（✅ 底层支持批量）
  setCollaborators(collaborators: Array<{ userId: string; role: UnitRole }>): Promise<void>;
  addCollaborator(userId: string, role: UnitRole): Promise<void>;
  updateCollaborator(userId: string, role: UnitRole): Promise<void>;
  removeCollaborator(userId: string): Promise<void>;
  listCollaborators(): Promise<ICollaborator[]>;
  
  // 响应式订阅（RxJS Observable）
  readonly permission$: Observable<WorkbookPermissionSnapshot>;
  readonly pointChange$: Observable<{
    point: WorkbookPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>;
  readonly collaboratorChange$: Observable<{
    type: 'add' | 'update' | 'delete';
    collaborator: ICollaborator;
  }>;
  
  // 兼容性方法（简化订阅）
  subscribe(listener: (snapshot: WorkbookPermissionSnapshot) => void): UnsubscribeFn;
}
```

### 3.2 WorksheetPermission 接口

```typescript
import type { Observable } from 'rxjs';

interface WorksheetPermission {
  // 权限模式设置
  setMode(mode: 'protected' | 'editable'): Promise<void>;
  setReadOnly(): Promise<void>;
  setEditable(): Promise<void>;
  
  // 权限点控制
  setPoint(point: WorksheetPermissionPoint, value: boolean): Promise<void>;
  getPoint(point: WorksheetPermissionPoint): boolean;
  
  // 单元格权限判断（✅ 复用 RangeProtectionCache）
  canEditCell(row: number, col: number): boolean;
  canViewCell(row: number, col: number): boolean;
  
  // 范围保护管理（✅ 底层支持批量）
  protectRanges(configs: Array<{
    ranges: FRange[];
    options?: RangeProtectionOptions;
  }>): Promise<RangeProtectionRule[]>;
  listRangeProtectionRules(): Promise<RangeProtectionRule[]>;
  
  // 响应式订阅（RxJS Observable）
  readonly permission$: Observable<WorksheetPermissionSnapshot>;
  readonly pointChange$: Observable<{
    point: WorksheetPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>;
  readonly rangeProtectionChange$: Observable<{
    type: 'add' | 'update' | 'delete';
    rules: RangeProtectionRule[];
  }>;
  readonly rangeProtectionRules$: Observable<RangeProtectionRule[]>;
  
  // 兼容性方法（简化订阅）
  subscribe(listener: (snapshot: WorksheetPermissionSnapshot) => void): UnsubscribeFn;
}
```

### 3.3 RangePermission 接口

```typescript
import type { Observable } from 'rxjs';

interface RangePermission {
  // 保护控制
  protect(options?: RangeProtectionOptions): Promise<RangeProtectionRule>;
  unprotect(): Promise<void>;
  
  // 状态查询
  isProtected(): boolean;
  canEdit(): boolean;
  
  // 规则列表
  getProtectionRules(): RangeProtectionRule[];
  
  // 响应式订阅（RxJS Observable）
  readonly permission$: Observable<RangePermissionSnapshot>;
  readonly protectionChange$: Observable<{
    type: 'protected' | 'unprotected';
    rules: RangeProtectionRule[];
  }>;
  
  // 兼容性方法（简化订阅）
  subscribe(listener: (snapshot: RangePermissionSnapshot) => void): UnsubscribeFn;
}
```

### 3.4 RangeProtectionRule 接口

```typescript
interface RangeProtectionRule {
  readonly id: string;
  readonly ranges: FRange[];
  readonly options: RangeProtectionOptions;
  
  // 修改操作
  updateRanges(ranges: FRange[]): Promise<void>;
  updateOptions(options: Partial<RangeProtectionOptions>): Promise<void>;
  remove(): Promise<void>;
}
```

---

## 四、新旧 API 对比

### 4.1 Workbook 权限

| 功能 | 旧 API | 新 API |
|------|--------|--------|
| 设置编辑权限 | `permission.setWorkbookEditPermission(unitId, false)` | `workbook.getPermission().setMode('viewer')` |
| 设置权限点 | `permission.setWorkbookPermissionPoint(unitId, FPointClass, value)` | `workbook.getPermission().setPoint(point, value)` |
| 检查权限点 | `permission.checkWorkbookPermissionPoint(unitId, FPointClass)` | `workbook.getPermission().getPoint(point)` |
| 管理协作者 | `authzIoService.createCollaborator(...)` | `workbook.getPermission().addCollaborator(userId, role)` |

### 4.2 Worksheet 权限

| 功能 | 旧 API | 新 API |
|------|--------|--------|
| 添加基础权限 | `permission.addWorksheetBasePermission(unitId, subUnitId)` | 自动处理（透明） |
| 设置只读 | `permission.setWorksheetPermissionPoint(unitId, subUnitId, WorksheetEditPermission, false)` | `worksheet.getPermission().setReadOnly()` |
| 设置权限点 | `permission.setWorksheetPermissionPoint(unitId, subUnitId, FPointClass, value)` | `worksheet.getPermission().setPoint(point, value)` |
| 检查单元格权限 | ❌ 不存在 | `worksheet.getPermission().canEditCell(row, col)` |

### 4.3 Range 权限

| 功能 | 旧 API | 新 API |
|------|--------|--------|
| 创建保护 | `permission.addRangeBaseProtection(unitId, subUnitId, ranges)` 返回 `{permissionId, ruleId}` | `range.getPermission().protect(options)` 返回 `RangeProtectionRule` |
| 更新范围 | `permission.setRangeProtectionRanges(unitId, subUnitId, ruleId, ranges)` | `rule.updateRanges(ranges)` |
| 删除保护 | `permission.removeRangeProtection(unitId, subUnitId, [ruleId])` | `rule.remove()` |
| 设置权限点 | `permission.setRangeProtectionPermissionPoint(unitId, subUnitId, permissionId, FPointClass, value)` | `rule.updateOptions({allowEdit: false})` |

---

## 五、重构 TODO 清单

### 阶段一：设计完善（当前阶段）

- [x] 1. 分析现有权限系统实现
- [x] 2. 梳理现有 Facade API
- [x] 3. 对比新旧设计
- [ ] 4. 完善新设计细节
  - [ ] 4.1 补充缺失的权限点枚举
  - [ ] 4.2 明确权限点枚举与实现类的映射
  - [ ] 4.3 定义错误类型
  - [ ] 4.4 明确默认值策略
  - [ ] 4.5 设计批量操作 API（✅ 已发现底层支持，只需 Facade 层封装）
- [ ] 5. 编写详细的 API 设计文档
- [ ] 6. 设计迁移策略（向后兼容方案）

### 阶段二：核心实现

- [ ] 7. 实现权限点枚举与类构造器的映射层
- [ ] 8. 实现 WorkbookPermission Facade
  - [ ] 8.1 setMode() / setPoint() / getPoint()
  - [ ] 8.2 协作者管理方法
  - [ ] 8.3 RxJS Observable 流（permission$, pointChange$, collaboratorChange$）
  - [ ] 8.4 subscribe() 兼容性方法
- [ ] 9. 实现 WorksheetPermission Facade
  - [ ] 9.1 setMode() / setReadOnly() / setEditable()
  - [ ] 9.2 canEditCell() / canViewCell()
  - [ ] 9.3 applyConfig()
  - [ ] 9.4 范围保护规则列表
  - [ ] 9.5 RxJS Observable 流（permission$, pointChange$, rangeProtectionChange$, rangeProtectionRules$）
  - [ ] 9.6 subscribe() 兼容性方法
- [ ] 10. 实现 RangePermission Facade
  - [ ] 10.1 protect() / unprotect()
  - [ ] 10.2 isProtected() / canEdit()
  - [ ] 10.3 规则列表
  - [ ] 10.4 RxJS Observable 流（permission$, protectionChange$）
  - [ ] 10.5 subscribe() 兼容性方法
- [ ] 11. 实现 RangeProtectionRule 对象
  - [ ] 11.1 updateRanges() / updateOptions() / remove()
  - [ ] 11.2 封装内部 permissionId/ruleId

### 阶段三：集成与测试

- [ ] 12. 集成到 FWorkbook / FWorksheet / FRange
- [ ] 13. 更新现有 FPermission（标记为 deprecated）
- [ ] 14. 编写单元测试
  - [ ] 14.1 WorkbookPermission 测试
  - [ ] 14.2 WorksheetPermission 测试
  - [ ] 14.3 RangePermission 测试
  - [ ] 14.4 权限组合逻辑测试
- [ ] 15. 编写集成测试

### 阶段四：文档与示例

- [ ] 16. 编写 API 文档
- [ ] 17. 编写迁移指南
- [ ] 18. 编写示例代码
- [ ] 19. 更新 TypeScript 类型定义

### 阶段五：发布与维护

- [ ] 20. Code Review
- [ ] 21. 性能测试与优化
- [ ] 22. 发布 Beta 版本
- [ ] 23. 收集反馈并迭代
- [ ] 24. 正式发布
- [ ] 25. 逐步废弃旧 API

---

## 六、关键设计决策

### 5.1 是否保留全局 FPermission？

**选项 A**: 保留，但标记为 deprecated
```typescript
univerAPI.getPermission() -> FPermission (deprecated)
workbook.getPermission() -> WorkbookPermission
```

**选项 B**: 移除，完全迁移到对象绑定
```typescript
workbook.getPermission() -> WorkbookPermission
worksheet.getPermission() -> WorksheetPermission
range.getPermission() -> RangePermission
```

**建议**: 选项 A，渐进式迁移

### 5.2 权限点访问方式

**选项 A**: 使用枚举字符串
```typescript
permission.setPoint(WorkbookPermissionPoint.Edit, false)
```

**选项 B**: 使用构造器类（现有方式）
```typescript
permission.setPointByClass(WorkbookEditablePermission, false)
```

**选项 C**: 两者都支持
```typescript
permission.setPoint(WorkbookPermissionPoint.Edit, false)
permission.setPointByClass(WorkbookEditablePermission, false)
```

**建议**: 选项 C，兼容性最好

### 5.3 协作者管理的位置

**当前**: 在 IAuthzIoService
**新设计**: 在 WorkbookPermission

**建议**: 
- WorkbookPermission 提供高层 API
- 内部委托给 IAuthzIoService
- 保持底层服务的独立性

### 5.4 权限变更是否走 Command？

**建议**: 
- 所有权限变更都应该走 Command 模式
- 支持 undo/redo
- 支持协作同步

### 5.5 Range 保护规则的管理方式

**当前**: 返回 {permissionId, ruleId}
**新设计**: 返回 RangeProtectionRule 对象

**建议**:
- RangeProtectionRule 内部持有 permissionId 和 ruleId
- 提供方法操作规则
- 隐藏底层实现细节

---

## 七、风险与挑战

### 6.1 向后兼容性
- **风险**: 现有代码大量使用旧 API
- **对策**: 保留旧 API，标记 deprecated，提供迁移工具

### 6.2 性能影响
- **风险**: 新增抽象层可能影响性能
- **对策**: 性能测试，必要时优化

### 6.3 测试覆盖
- **风险**: 权限系统逻辑复杂，测试用例多
- **对策**: 自动化测试，高覆盖率

### 6.4 文档更新
- **风险**: 文档量大，容易遗漏
- **对策**: 逐模块更新，review 机制

---

## 八、优先级建议

### P0（必须）
1. 完善权限点枚举定义
2. 实现 WorkbookPermission / WorksheetPermission / RangePermission 核心功能
3. 实现 RangeProtectionRule 对象
4. 基础测试覆盖

### P1（重要）
5. 协作者管理集成
6. 批量操作 API
7. 调试功能（debugCellPermission）
8. 迁移指南

### P2（可选）
9. 性能优化
10. 高级特性（预设模板等）
11. 更丰富的错误处理

---

## 附录：完整的新设计 API

```ts
/**
 * ========================
 * 基础类型 / 枚举
 * ========================
 */

export enum UnitRole {
  Reader = 0,
  Editor = 1,
  Owner = 2,
}

export interface IUserRef {
  id: string;          // user id（由宿主系统定义）
  displayName?: string;
  email?: string;
}

export interface ICollaborator {
  user: IUserRef;
  role: UnitRole;
}

/**
 * Workbook 级权限点
 */
export enum WorkbookPermissionPoint {
  Edit = 'WorkbookEdit',                      // 原 WorkbookEditablePermission
  View = 'WorkbookView',
  Print = 'WorkbookPrint',
  Export = 'WorkbookExport',
  Share = 'WorkbookShare',

  CopyContent = 'WorkbookCopy',               // 原 WorkbookCopyPermission，复制内容
  DuplicateFile = 'WorkbookDuplicate',        // 原 WorkbookDuplicatePermission，整本复制

  Comment = 'WorkbookComment',
  ManageCollaborator = 'WorkbookManageCollaborator',

  CreateSheet = 'WorkbookCreateSheet',
  DeleteSheet = 'WorkbookDeleteSheet',
  RenameSheet = 'WorkbookRenameSheet',
  MoveSheet = 'WorkbookMoveSheet',
  HideSheet = 'WorkbookHideSheet',

  ViewHistory = 'WorkbookViewHistory',
  ManageHistory = 'WorkbookHistory',
  RecoverHistory = 'WorkbookRecoverHistory',

  CreateProtection = 'WorkbookCreateProtect',
}

/**
 * Worksheet 级权限点
 */
export enum WorksheetPermissionPoint {
  Edit = 'WorksheetEdit',
  View = 'WorksheetView',
  Copy = 'WorksheetCopy',

  SetCellValue = 'WorksheetSetCellValue',
  SetCellStyle = 'WorksheetSetCellStyle',
  SetRowStyle = 'WorksheetSetRowStyle',
  SetColumnStyle = 'WorksheetSetColumnStyle',

  InsertRow = 'WorksheetInsertRow',
  InsertColumn = 'WorksheetInsertColumn',
  DeleteRow = 'WorksheetDeleteRow',
  DeleteColumn = 'WorksheetDeleteColumn',

  Sort = 'WorksheetSort',
  Filter = 'WorksheetFilter',
  PivotTable = 'WorksheetPivotTable',

  InsertHyperlink = 'WorksheetInsertHyperlink',
  EditExtraObject = 'WorksheetEditExtraObject',

  ManageCollaborator = 'WorksheetManageCollaborator',
  DeleteProtection = 'WorksheetDeleteProtection',
  
  // 选择控制（Excel 的工作表保护特性）
  SelectProtectedCells = 'WorksheetSelectProtectedCells',
  SelectUnProtectedCells = 'WorksheetSelectUnProtectedCells',
}

/**
 * Range 级权限点
 */
export enum RangePermissionPoint {
  Edit = 'RangeEdit',   // 原 RangeProtectionPermissionEditPoint
  View = 'RangeView',   // 原 RangeProtectionPermissionViewPoint
}

/**
 * 模式枚举（高层 API 用）
 */
export type WorkbookMode = 'owner' | 'editor' | 'viewer' | 'commenter';

export type WorksheetMode =
  | 'editable'      // 完全可编辑
  | 'readOnly'      // 完全只读
  | 'filterOnly'    // 只能筛选 / 排序
  | 'commentOnly';  // 只能评论，不改值

/**
 * 通用 Snapshot 类型
 */

export type WorkbookPermissionSnapshot = Record<WorkbookPermissionPoint, boolean>;
export type WorksheetPermissionSnapshot = Record<WorksheetPermissionPoint, boolean>;
export type RangePermissionSnapshot = Record<RangePermissionPoint, boolean>;

/**
 * 变更订阅函数类型（用于兼容性 subscribe 方法）
 */
export type UnsubscribeFn = () => void;

/**
 * RxJS Observable 导入
 */
import type { Observable } from 'rxjs';

/**
 * ========================
 * Range 保护配置与规则
 * ========================
 */

export interface RangeProtectionOptions {
  /** 是否允许当前用户编辑（默认 false = 受保护不可编辑） */
  allowEdit?: boolean;

  /** 允许编辑的用户白名单；为空则按角色或全局策略判断 */
  allowedUsers?: string[];

  /** 规则名称，方便 UI 显示与管理 */
  name?: string;

  /** 自定义元数据（日志 / 标签等） */
  metadata?: Record<string, unknown>;
}

/**
 * Range 保护规则 Facade
 * 把内部的 permissionId / ruleId 封装起来
 */
export interface RangeProtectionRule {
  /** 内部规则 id，用于调试/日志，调用方一般不直接使用 */
  readonly id: string;

  /** 当前规则覆盖的 Range 列表 */
  readonly ranges: FRange[];

  /** 当前规则的配置 */
  readonly options: RangeProtectionOptions;

  /** 更新保护范围 */
  updateRanges(ranges: FRange[]): Promise<void>;

  /** 局部更新配置 */
  updateOptions(options: Partial<RangeProtectionOptions>): Promise<void>;

  /** 删除当前保护规则 */
  remove(): Promise<void>;
}

/**
 * Cell 权限调试信息（可选，给高级用户 / 开发者用）
 */
export interface CellPermissionDebugRuleInfo {
  ruleId: string;
  rangeRefs: string[];              // ['A1:B10', 'D1:D5'] 等
  options: RangeProtectionOptions;
}

export interface CellPermissionDebugInfo {
  row: number;
  col: number;
  hitRules: CellPermissionDebugRuleInfo[];
}

/**
 * ========================
 * Facade: WorkbookPermission
 * ========================
 */

export interface WorkbookPermission {
  /**
   * 高层模式设置：按照 Owner / Editor / Viewer / Commenter 的语义
   * 内部会自动组合多个 WorkbookPermissionPoint
   */
  setMode(mode: WorkbookMode): Promise<void>;

  /** 快捷：整本只读（等价于 setMode('viewer')） */
  setReadOnly(): Promise<void>;

  /** 快捷：整本可编辑（等价于 setMode('editor') 或 owner 子集） */
  setEditable(): Promise<void>;

  /** 当前用户是否可以编辑此工作簿（综合点位计算） */
  canEdit(): boolean;

  /**
   * 协作者管理（封装 IAuthzIoService）
   * ✅ 批量操作：底层 IAuthzIoService.putCollaborators 已支持数组参数
   */
  
  /** 批量设置协作者（替换式，会覆盖现有协作者列表） */
  setCollaborators(collaborators: Array<{ userId: string; role: UnitRole }>): Promise<void>;
  
  /** 单个添加协作者 */
  addCollaborator(userId: string, role: UnitRole): Promise<void>;
  
  /** 更新协作者角色 */
  updateCollaborator(userId: string, role: UnitRole): Promise<void>;
  
  /** 删除协作者 */
  removeCollaborator(userId: string): Promise<void>;
  
  /** 批量删除协作者 */
  removeCollaborators(userIds: string[]): Promise<void>;
  
  /** 列出所有协作者 */
  listCollaborators(): Promise<ICollaborator[]>;

  /**
   * 底层点状操作：直接设置某个 WorkbookPermissionPoint 的布尔值
   */
  setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void>;

  /** 读取某个点位当前的值（同步，从本地状态读取） */
  getPoint(point: WorkbookPermissionPoint): boolean;

  /** 获取当前所有点位的快照 */
  getSnapshot(): WorkbookPermissionSnapshot;

  /**
   * ========================
   * RxJS Observable 响应式接口
   * ========================
   */
  
  /**
   * 权限快照变化流（BehaviorSubject，订阅时立即获得当前状态）
   * 当任何权限点变化时触发
   */
  readonly permission$: Observable<WorkbookPermissionSnapshot>;
  
  /**
   * 单个权限点变化流
   * 适用于只关心特定权限点变化的场景
   */
  readonly pointChange$: Observable<{
    point: WorkbookPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>;
  
  /**
   * 协作者变化流
   */
  readonly collaboratorChange$: Observable<{
    type: 'add' | 'update' | 'delete';
    collaborator: ICollaborator;
  }>;

  /**
   * 兼容性方法：简化订阅（不熟悉 RxJS 的用户使用）
   * 内部基于 permission$ Observable 实现
   */
  subscribe(listener: (snapshot: WorkbookPermissionSnapshot) => void): UnsubscribeFn;
}

/**
 * ========================
 * Facade: WorksheetPermission
 * ========================
 */

export interface WorksheetPermissionConfig {
  /** 一次性设置模式 */
  mode?: WorksheetMode;

  /** 点位级配置补丁 */
  points?: Partial<Record<WorksheetPermissionPoint, boolean>>;

  /** 批量范围保护配置（可选，简化场景） */
  rangeProtections?: Array<{
    rangeRefs: string[];              // 例如 ['A1:B10', 'D1:D5']
    options?: RangeProtectionOptions; // 不填则默认“受保护不可编辑”
  }>;
}

export interface WorksheetPermission {
  /**
   * 设置工作表的整体模式：
   * - 'readOnly'       → 锁掉写入类 point
   * - 'filterOnly'     → 只开 Filter/Sort，其它写入相关关闭
   * - 'commentOnly'    → 关闭写入，保留评论
   * - 'editable'       → 大部分写入类 point 打开
   */
  setMode(mode: WorksheetMode): Promise<void>;

  /** 快捷：只读 */
  setReadOnly(): Promise<void>;

  /** 快捷：可编辑 */
  setEditable(): Promise<void>;

  /** 当前用户是否“整体上”可以编辑此表（不考虑局部 Range 保护） */
  canEdit(): boolean;

  /**
   * Cell 级高层判断（综合表级 & 范围级规则）
   */
  canEditCell(row: number, col: number): boolean;
  canViewCell(row: number, col: number): boolean;

  /**
   * 调试用：查看某个单元格命中的保护规则信息
   */
  debugCellPermission(row: number, col: number): CellPermissionDebugInfo | null;

  /**
   * 点状操作（底层）
   */
  setPoint(point: WorksheetPermissionPoint, value: boolean): Promise<void>;
  getPoint(point: WorksheetPermissionPoint): boolean;
  getSnapshot(): WorksheetPermissionSnapshot;

  /**
   * 批量应用权限配置（用于“按配置驱动”的场景）
   * 内部可以走 Command，保证 undo/redo
   */
  applyConfig(config: WorksheetPermissionConfig): Promise<void>;

  /**
   * 范围保护管理
   * ✅ 批量操作：底层 AddRangeProtectionMutation 已支持 rules 数组参数
   */
  
  /** 批量创建多个范围保护规则（一次性操作，性能更好） */
  protectRanges(configs: Array<{
    ranges: FRange[];
    options?: RangeProtectionOptions;
  }>): Promise<RangeProtectionRule[]>;
  
  /** 批量删除多个保护规则 */
  unprotectRules(ruleIds: string[]): Promise<void>;

  /**
   * 列出当前表上的所有 Range 保护规则
   * （实现可以委托给内部 RangeProtectionRuleModel）
   */
  listRangeProtectionRules(): Promise<RangeProtectionRule[]>;

  /**
   * ========================
   * RxJS Observable 响应式接口
   * ========================
   */
  
  /**
   * 权限快照变化流（BehaviorSubject，订阅时立即获得当前状态）
   * 当任何权限点变化时触发
   */
  readonly permission$: Observable<WorksheetPermissionSnapshot>;
  
  /**
   * 单个权限点变化流
   * 适用于只关心特定权限点变化的场景
   */
  readonly pointChange$: Observable<{
    point: WorksheetPermissionPoint;
    value: boolean;
    oldValue: boolean;
  }>;
  
  /**
   * Range 保护规则变化流（增删改）
   * type: 'add' - 新增规则, 'update' - 更新规则, 'delete' - 删除规则
   */
  readonly rangeProtectionChange$: Observable<{
    type: 'add' | 'update' | 'delete';
    rules: RangeProtectionRule[];
  }>;
  
  /**
   * 当前所有 Range 保护规则列表流（BehaviorSubject）
   * 订阅时会立即得到当前规则列表，规则变化时自动更新
   */
  readonly rangeProtectionRules$: Observable<RangeProtectionRule[]>;

  /**
   * 兼容性方法：简化订阅（不熟悉 RxJS 的用户使用）
   * 内部基于 permission$ Observable 实现
   */
  subscribe(listener: (snapshot: WorksheetPermissionSnapshot) => void): UnsubscribeFn;
}

/**
 * ========================
 * Facade: RangePermission
 * ========================
 */

export interface RangePermission {
  /**
   * 在当前 Range 上创建保护规则
   * - 默认 options.allowEdit = false → 视为“锁定”
   */
  protect(options?: RangeProtectionOptions): Promise<RangeProtectionRule>;

  /**
   * 取消当前 Range 覆盖到的所有保护规则
   * （内部可以按 range → ruleId 映射计算）
   */
  unprotect(): Promise<void>;

  /**
   * 当前 Range 是否处于受保护状态（对当前用户）
   * = !canEdit 或有命中规则
   */
  isProtected(): boolean;

  /** 当前用户是否可以编辑此 Range（综合 Worksheet / Workbook / Range 层级） */
  canEdit(): boolean;

  /**
   * Range 级点位读取（一般给调试 / 高级场景使用）
   * 通常只需要 Edit/View 两点
   */
  getPoint(point: RangePermissionPoint): boolean;
  getSnapshot(): RangePermissionSnapshot;

  /**
   * 获取当前工作表所有保护规则的快照（透传 worksheet 的接口也可以）
   */
  listRules(): Promise<RangeProtectionRule[]>;

  /**
   * ========================
   * RxJS Observable 响应式接口
   * ========================
   */
  
  /**
   * 权限快照变化流（BehaviorSubject，订阅时立即获得当前状态）
   */
  readonly permission$: Observable<RangePermissionSnapshot>;
  
  /**
   * 保护状态变化流
   * type: 'protected' - 已保护, 'unprotected' - 已解除保护
   */
  readonly protectionChange$: Observable<{
    type: 'protected' | 'unprotected';
    rules: RangeProtectionRule[];
  }>;

  /**
   * 兼容性方法：简化订阅（不熟悉 RxJS 的用户使用）
   * 内部基于 permission$ Observable 实现
   */
  subscribe(listener: (snapshot: RangePermissionSnapshot) => void): UnsubscribeFn;
}

/**
 * ========================
 * Facade: FWorkbook / FWorksheet / FRange
 * ========================
 * 只包含跟权限相关、上下文需要的最小接口
 */

export interface FRange {
  /** A1:B2 这种地址字符串 */
  getAddress(): string;

  /** 所属工作表 */
  getWorksheet(): FWorksheet;

  /** Range 级权限 Facade */
  getPermission(): RangePermission;
}

export interface FWorksheet {
  getSheetId(): string;
  getName(): string;

  /** 所属工作簿 */
  getWorkbook(): FWorkbook;

  /** 获取 Range（Univer 已有的能力，这里只保留签名） */
  getRange(ref: string): FRange;

  /** Worksheet 级权限 Facade */
  getPermission(): WorksheetPermission;
}

export interface FWorkbook {
  getId(): string;
  getName(): string;

  getActiveSheet(): FWorksheet;
  getSheetById(id: string): FWorksheet | undefined;
  getSheets(): FWorksheet[];

  /** Workbook 级权限 Facade */
  getPermission(): WorkbookPermission;
}

/**
 * ========================
 * 顶层入口（示意）
 * ========================
 */

export interface UniverAPI {
  getActiveWorkbook(): FWorkbook | undefined;
  getWorkbookById(id: string): FWorkbook | undefined;
}

// ========================
// 使用示例
// ========================

declare const univerAPI: UniverAPI;

// 示例 1: 基础设置（Promise 风格）
async function basicExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const wPerm = workbook.getPermission();
  await wPerm.setMode('viewer');

  const sheet = workbook.getActiveSheet();
  const sPerm = sheet.getPermission();
  await sPerm.setMode('filterOnly');

  const headerRange = sheet.getRange('A1:D1');
  const rPerm = headerRange.getPermission();
  await rPerm.protect({ allowEdit: true, name: 'Header Editable' });
}

// 示例 2: RxJS 响应式订阅（推荐）
function reactiveExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const sheet = workbook.getActiveSheet();
  const permission = sheet.getPermission();

  // 2.1 订阅权限快照变化（自动获取初始值）
  permission.permission$
    .pipe(
      map(snapshot => snapshot[WorksheetPermissionPoint.Edit]),
      distinctUntilChanged()
    )
    .subscribe(canEdit => {
      console.log('Can edit changed:', canEdit);
      // 更新 UI 状态
    });

  // 2.2 只监听特定权限点变化
  permission.pointChange$
    .pipe(
      filter(change => change.point === WorksheetPermissionPoint.Edit)
    )
    .subscribe(change => {
      console.log(`Edit permission: ${change.oldValue} -> ${change.value}`);
    });

  // 2.3 监听 Range 保护规则变化
  permission.rangeProtectionChange$
    .pipe(
      filter(change => change.type === 'add')
    )
    .subscribe(change => {
      console.log('New protection rules added:', change.rules);
    });

  // 2.4 获取并监听当前所有规则（BehaviorSubject，立即获得当前值）
  permission.rangeProtectionRules$
    .pipe(
      tap(rules => console.log('Current rules count:', rules.length)),
      switchMap(rules => 
        // 对每个规则进行处理
        from(rules).pipe(
          filter(rule => rule.options.allowEdit === false)
        )
      )
    )
    .subscribe(protectedRule => {
      console.log('Protected rule:', protectedRule.id);
    });
}

// 示例 3: 组合多个 Observable
function advancedReactiveExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const sheet = workbook.getActiveSheet();
  const permission = sheet.getPermission();

  // 3.1 组合多个流
  combineLatest([
    permission.permission$,
    permission.rangeProtectionRules$
  ])
    .pipe(
      debounceTime(300), // 防抖 300ms
      map(([snapshot, rules]) => ({
        canEdit: snapshot[WorksheetPermissionPoint.Edit],
        protectedRangesCount: rules.filter(r => !r.options.allowEdit).length
      }))
    )
    .subscribe(state => {
      console.log('Combined state:', state);
      // 更新复杂的 UI 状态
    });

  // 3.2 响应式权限检查 + 自动更新
  merge(
    permission.permission$,
    permission.rangeProtectionChange$
  )
    .pipe(
      debounceTime(100),
      switchMap(() => 
        // 每次权限变化时重新检查特定单元格
        of(permission.canEditCell(0, 0))
      ),
      distinctUntilChanged()
    )
    .subscribe(canEditA1 => {
      console.log('Cell A1 edit permission:', canEditA1);
    });
}

// 示例 4: 简化订阅（兼容模式，不熟悉 RxJS 的用户）
function simpleSubscribeExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const sheet = workbook.getActiveSheet();
  const permission = sheet.getPermission();

  // 使用简化的 subscribe 方法（内部基于 Observable）
  const unsubscribe = permission.subscribe(snapshot => {
    console.log('Permission changed:', snapshot);
    // 立即收到初始值，后续自动更新
  });

  // 取消订阅
  setTimeout(() => {
    unsubscribe();
  }, 60000);
}

// 示例 5: 批量操作 + 响应式监听
async function batchOperationExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const sheet = workbook.getActiveSheet();
  const permission = sheet.getPermission();

  // 订阅规则变化
  const subscription = permission.rangeProtectionRules$
    .pipe(
      tap(rules => console.log('Rules updated, count:', rules.length))
    )
    .subscribe();

  // 批量创建多个保护规则（一次性操作）
  const rules = await permission.protectRanges([
    {
      ranges: [sheet.getRange('A1:A10')],
      options: { name: 'Column A Protected', allowEdit: false }
    },
    {
      ranges: [sheet.getRange('B1:B10')],
      options: { name: 'Column B Protected', allowEdit: false }
    },
    {
      ranges: [sheet.getRange('C1:C10')],
      options: { name: 'Column C Editable', allowEdit: true }
    }
  ]);

  // 上述操作会自动触发 rangeProtectionRules$ 的更新
  console.log('Created rules:', rules.length);

  // 清理订阅
  subscription.unsubscribe();
}

// 示例 6: 协作者管理 + 响应式监听
async function collaboratorExample() {
  const workbook = univerAPI.getActiveWorkbook();
  if (!workbook) return;

  const permission = workbook.getPermission();

  // 订阅协作者变化
  permission.collaboratorChange$
    .subscribe(change => {
      console.log(`Collaborator ${change.type}:`, change.collaborator);
      // 自动更新协作者列表 UI
    });

  // 批量设置协作者
  await permission.setCollaborators([
    { userId: 'user1', role: UnitRole.Editor },
    { userId: 'user2', role: UnitRole.Reader },
    { userId: 'user3', role: UnitRole.Owner }
  ]);

  // 单个添加协作者
  await permission.addCollaborator('user4', UnitRole.Editor);
}
```