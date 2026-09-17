import {
  EditingRenderController,
  HoverManagerService,
  IEditorBridgeService,
  ISheetClipboardService,
  ISheetSelectionRenderService,
  PREDEFINED_HOOK_NAME_PASTE,
  SetCellEditVisibleOperation,
  SetScrollOperation,
  SetZoomRatioOperation,
  SheetCanvasPopManagerService,
  SheetPrintInterceptorService,
  SheetSkeletonManagerService,
  getCurrentRangeDisable$,
  useHighlightRange,
  virtualizeDiscreteRanges
} from "./chunk-BHQGV2VJ.js";
import {
  DRAWING_IMAGE_ALLOW_IMAGE_LIST,
  DRAWING_IMAGE_COUNT_LIMIT,
  DRAWING_IMAGE_HEIGHT_LIMIT,
  DRAWING_IMAGE_WIDTH_LIMIT,
  IDrawingManagerService,
  InnerPasteCommand,
  ReplaceSnapshotCommand,
  SetDrawingSelectedOperation,
  UnitDrawingService,
  UniverDrawingPlugin,
  docDrawingPositionToTransform,
  getDrawingImageAllowSize,
  getDrawingShapeKeyByDrawingSearch,
  getImageSize
} from "./chunk-7ZOWWEOA.js";
import {
  AutofillDoubleIcon,
  BottomIcon,
  Button,
  CanvasFloatDomService,
  Checkbox,
  CheckboxGroup,
  ComponentManager,
  CreateCopyIcon,
  DeleteIcon,
  DocSettingIcon,
  Dropdown,
  DropdownMenu,
  FormLayout,
  GroupIcon,
  IClipboardInterfaceService,
  IContextMenuService,
  IDialogService,
  IGalleryService,
  ILocalFileService,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  ISidebarService,
  InputNumber,
  MoreDownIcon,
  MoveDownIcon,
  MoveUpIcon,
  PrintFloatDomSingle,
  Radio,
  RadioGroup,
  Select,
  Tooltip,
  TopmostIcon,
  UngroupIcon,
  borderClassName,
  clsx,
  connectInjector,
  getMenuHiddenObservable,
  render,
  require_jsx_runtime,
  require_react,
  unmount,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  COMMAND_LISTENER_SKELETON_CHANGE,
  CopySheetCommand,
  DeleteRangeMoveLeftCommand,
  DeleteRangeMoveUpCommand,
  DeltaColumnWidthCommand,
  DeltaRowHeightCommand,
  IAutoFillService,
  INTERCEPTOR_POINT,
  InsertColCommand,
  InsertRangeMoveDownCommand,
  InsertRangeMoveRightCommand,
  InsertRowCommand,
  MoveColsCommand,
  MoveRangeCommand,
  MoveRowsCommand,
  RangeProtectionPermissionEditPoint,
  RemoveColCommand,
  RemoveRowCommand,
  RemoveSheetCommand,
  SetColHiddenCommand,
  SetColHiddenMutation,
  SetColVisibleMutation,
  SetColWidthCommand,
  SetFrozenMutation,
  SetRangeValuesCommand,
  SetRowHeightCommand,
  SetRowHiddenCommand,
  SetRowHiddenMutation,
  SetRowVisibleMutation,
  SetSelectionsOperation,
  SetSpecificColsVisibleCommand,
  SetSpecificRowsVisibleCommand,
  SetWorksheetActiveOperation,
  SetWorksheetColWidthMutation,
  SetWorksheetRowAutoHeightMutation,
  SetWorksheetRowHeightMutation,
  SetWorksheetRowIsAutoHeightMutation,
  SheetInterceptorService,
  SheetPermissionCheckController,
  SheetSkeletonService,
  SheetsSelectionsService,
  WorkbookEditablePermission,
  WorkbookViewPermission,
  WorksheetEditPermission,
  WorksheetViewPermission,
  attachRangeWithCoord,
  convertPositionSheetOverGridToAbsolute,
  discreteRangeToRange,
  getSheetCommandTarget
} from "./chunk-Q6Y4PHRI.js";
import {
  Canvas,
  DRAWING_OBJECT_LAYER_INDEX,
  DrawingGroupObject,
  Group,
  IRenderManagerService,
  Image,
  Rect,
  Shape,
  Vector2,
  degToRad,
  getCurrentTypeOfRenderer,
  getGroupState,
  precisionTo,
  transformObjectOutOfGroup
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  BuildTextUtils,
  DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
  DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  DependentOn,
  Disposable,
  DisposableCollection,
  EMPTY,
  FOCUSING_COMMON_DRAWINGS,
  FOCUSING_FX_BAR_EDITOR,
  FOCUSING_PANEL_EDITOR,
  FOCUSING_SHAPE_TEXT_EDITOR,
  FOCUSING_SHEET,
  ICommandService,
  IConfigService,
  IContextService,
  IImageIoService,
  IPermissionService,
  IResourceManagerService,
  IURLImageService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  LifecycleService,
  LocaleService,
  ObjectMatrix,
  Observable,
  PRINT_CHART_COMPONENT_KEY,
  Plugin,
  Rectangle,
  RxDisposable,
  Subject,
  Tools,
  UserManagerService,
  bufferTime,
  checkIfMove,
  combineLatest,
  createDocumentModelWithStyle,
  createIdentifier,
  debounce_default,
  distinctUntilChanged,
  filter,
  fromEventSubject,
  generateRandomId,
  map,
  merge_default,
  of,
  registerDependencies,
  sequenceExecute,
  switchMap,
  take,
  tap,
  throttleTime,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-drawing/package.json
var package_default = {
  name: "@univerjs/sheets-drawing",
  version: "0.25.2",
  private: false,
  description: "Drawing model integration for Univer Sheets.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "sheets",
    "drawing",
    "spreadsheet",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./facade": "./src/facade/index.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/sheets": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-drawing/src/config/config.ts
var SHEETS_DRAWING_PLUGIN_CONFIG_KEY = "sheets-drawing.config";
var configSymbol = Symbol(SHEETS_DRAWING_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-drawing/src/services/sheet-drawing.service.ts
var SheetDrawingAnchorType = /* @__PURE__ */ ((SheetDrawingAnchorType2) => {
  SheetDrawingAnchorType2["Position"] = "0";
  SheetDrawingAnchorType2["Both"] = "1";
  SheetDrawingAnchorType2["None"] = "2";
  return SheetDrawingAnchorType2;
})(SheetDrawingAnchorType || {});
var SheetDrawingService = class extends UnitDrawingService {
};
var ISheetDrawingService = createIdentifier("sheets-drawing.sheet-drawing.service");

// ../packages/sheets-drawing/src/commands/mutations/set-drawing-apply.mutation.ts
var SetDrawingApplyMutation = {
  id: "sheet.mutation.set-drawing-apply",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const drawingManagerService = accessor.get(IDrawingManagerService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const { op, unitId, subUnitId, type, objects } = params;
    drawingManagerService.applyJson1(unitId, subUnitId, op);
    sheetDrawingService.applyJson1(unitId, subUnitId, op);
    switch (type) {
      case 0 /* INSERT */:
        drawingManagerService.addNotification(objects);
        sheetDrawingService.addNotification(objects);
        break;
      case 1 /* REMOVE */:
        drawingManagerService.removeNotification(objects);
        sheetDrawingService.removeNotification(objects);
        break;
      case 2 /* UPDATE */:
        drawingManagerService.updateNotification(objects);
        sheetDrawingService.updateNotification(objects);
        break;
      case 3 /* ARRANGE */:
        drawingManagerService.orderNotification(objects);
        sheetDrawingService.orderNotification(objects);
        break;
      case 4 /* GROUP */:
        drawingManagerService.groupUpdateNotification(objects);
        sheetDrawingService.groupUpdateNotification(objects);
        break;
      case 5 /* UNGROUP */:
        drawingManagerService.ungroupUpdateNotification(objects);
        sheetDrawingService.ungroupUpdateNotification(objects);
        break;
    }
    return true;
  }
};

// ../packages/sheets-drawing/src/commands/operations/clear-drawing-transformer.operation.ts
var ClearSheetDrawingTransformerOperation = {
  id: "sheet.operation.clear-drawing-transformer",
  type: 2 /* MUTATION */,
  handler: (accessor, params) => {
    const renderManagerService = accessor.get(IRenderManagerService);
    params.forEach((unitId) => {
      var _a, _b;
      (_b = (_a = renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.scene.getTransformer()) == null ? void 0 : _b.debounceRefreshControls();
    });
    return true;
  }
};

// ../packages/sheets-drawing/src/commands/commands/insert-sheet-drawing.command.ts
var InsertSheetDrawingCommand = {
  id: "sheet.command.insert-sheet-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const drawings = params.drawings;
    const jsonOp = sheetDrawingService.getBatchAddOp(drawings);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    const intercepted = sheetInterceptorService.onCommandExecute({ id: InsertSheetDrawingCommand.id, params });
    const redoMutations = [
      ...(_a = intercepted.preRedos) != null ? _a : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: redo,
          objects,
          type: 0 /* INSERT */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.redos
    ];
    const undoMutations = [
      ...(_b = intercepted.preUndos) != null ? _b : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: undo,
          objects,
          type: 1 /* REMOVE */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.undos
    ];
    const result = sequenceExecute(redoMutations, commandService);
    if (result.result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing/src/commands/commands/remove-sheet-drawing.command.ts
var RemoveSheetDrawingCommand = {
  id: "sheet.command.remove-sheet-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const { drawings } = params;
    const jsonOp = sheetDrawingService.getBatchRemoveOp(drawings);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    const intercepted = sheetInterceptorService.onCommandExecute({ id: RemoveSheetDrawingCommand.id, params });
    const redoMutations = [
      ...(_a = intercepted.preRedos) != null ? _a : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: redo,
          objects,
          type: 1 /* REMOVE */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.redos
    ];
    const undoMutations = [
      ...(_b = intercepted.preUndos) != null ? _b : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: undo,
          objects,
          type: 0 /* INSERT */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.undos
    ];
    const result = sequenceExecute(redoMutations, commandService);
    if (result.result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing/src/commands/commands/set-drawing-arrange.command.ts
var SetDrawingArrangeCommand = {
  id: "sheet.command.set-drawing-arrange",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    if (!params) return false;
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const { unitId, subUnitId, drawingIds, arrangeType } = params;
    const drawingOrderMapParam = { unitId, subUnitId, drawingIds };
    let jsonOp;
    if (arrangeType === 0 /* forward */) {
      jsonOp = sheetDrawingService.getForwardDrawingsOp(drawingOrderMapParam);
    } else if (arrangeType === 1 /* backward */) {
      jsonOp = sheetDrawingService.getBackwardDrawingOp(drawingOrderMapParam);
    } else if (arrangeType === 2 /* front */) {
      jsonOp = sheetDrawingService.getFrontDrawingsOp(drawingOrderMapParam);
    } else if (arrangeType === 3 /* back */) {
      jsonOp = sheetDrawingService.getBackDrawingsOp(drawingOrderMapParam);
    }
    if (jsonOp == null) {
      return false;
    }
    const { objects, redo, undo } = jsonOp;
    const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: 3 /* ARRANGE */ });
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: 3 /* ARRANGE */ } }
        ],
        redoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: 3 /* ARRANGE */ } }
        ]
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing/src/commands/commands/set-sheet-drawing.command.ts
var SetSheetDrawingCommand = {
  id: "sheet.command.set-sheet-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);
    const { drawings } = params;
    const jsonOp = sheetDrawingService.getBatchUpdateOp(drawings);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    const intercepted = sheetInterceptorService.onCommandExecute({ id: SetSheetDrawingCommand.id, params });
    const redoMutations = [
      ...(_a = intercepted.preRedos) != null ? _a : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: redo,
          objects,
          type: 2 /* UPDATE */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.redos
    ];
    const undoMutations = [
      ...(_b = intercepted.preUndos) != null ? _b : [],
      {
        id: SetDrawingApplyMutation.id,
        params: {
          unitId,
          subUnitId,
          op: undo,
          objects,
          type: 2 /* UPDATE */
        }
      },
      {
        id: ClearSheetDrawingTransformerOperation.id,
        params: [unitId]
      },
      ...intercepted.undos
    ];
    const result = sequenceExecute(redoMutations, commandService);
    if (result.result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations,
        redoMutations
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing/src/controllers/sheet-drawing.controller.ts
var SHEET_DRAWING_PLUGIN = "SHEET_DRAWING_PLUGIN";
var SheetsDrawingLoadController = class extends Disposable {
  constructor(_sheetInterceptorService, _univerInstanceService, _commandService, _sheetDrawingService, _drawingManagerService, _resourceManagerService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    this._initCommands();
    this._initSnapshot();
    this._initSheetChange();
    this.disposeWithMe(this._commandService.registerCommand(SetDrawingApplyMutation));
  }
  _initCommands() {
    [
      SetSheetDrawingCommand,
      InsertSheetDrawingCommand,
      RemoveSheetDrawingCommand,
      SetDrawingArrangeCommand,
      ClearSheetDrawingTransformerOperation
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _initSnapshot() {
    const toJson = (unitId, model) => {
      const map2 = model || this._sheetDrawingService.getDrawingDataForUnit(unitId);
      if (map2) {
        return JSON.stringify(map2);
      }
      return "";
    };
    const parseJson = (json) => {
      if (!json) {
        return {};
      }
      try {
        return JSON.parse(json);
      } catch {
        return {};
      }
    };
    this.disposeWithMe(
      this._resourceManagerService.registerPluginResource({
        pluginName: SHEET_DRAWING_PLUGIN,
        businesses: [2 /* UNIVER_SHEET */],
        toJson: (unitId, model) => toJson(unitId, model),
        parseJson: (json) => parseJson(json),
        onUnLoad: (unitId) => {
          this._sheetDrawingService.removeDrawingDataForUnit(unitId);
          this._drawingManagerService.removeDrawingDataForUnit(unitId);
        },
        onLoad: (unitId, value) => {
          this._sheetDrawingService.registerDrawingData(unitId, value);
          this._drawingManagerService.registerDrawingData(unitId, value);
        }
      })
    );
  }
  // eslint-disable-next-line max-lines-per-function
  _initSheetChange() {
    this.disposeWithMe(
      this._sheetInterceptorService.interceptCommand({
        // eslint-disable-next-line max-lines-per-function
        getMutations: (commandInfo) => {
          var _a;
          if (commandInfo.id === RemoveSheetCommand.id) {
            const params = commandInfo.params;
            const unitId = params.unitId || this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
            const subUnitId = params.subUnitId || ((_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId());
            if (!unitId || !subUnitId) {
              return { redos: [], undos: [] };
            }
            const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
            const drawings = Object.values(drawingData).filter((drawing) => {
              if (drawing.drawingType === 2 /* DRAWING_CHART */) {
                return false;
              }
              return true;
            });
            if (drawings.length === 0) {
              return { redos: [], undos: [] };
            }
            const jsonOp = this._sheetDrawingService.getBatchRemoveOp(drawings);
            const { unitId: jsonOpUnitId, subUnitId: jsonOpSubUnitId, undo, redo, objects } = jsonOp;
            return {
              redos: [
                {
                  id: SetDrawingApplyMutation.id,
                  params: {
                    op: redo,
                    unitId: jsonOpUnitId,
                    subUnitId: jsonOpSubUnitId,
                    objects,
                    type: 1 /* REMOVE */
                  }
                }
              ],
              undos: [
                {
                  id: SetDrawingApplyMutation.id,
                  params: {
                    op: undo,
                    unitId: jsonOpUnitId,
                    subUnitId: jsonOpSubUnitId,
                    objects,
                    type: 0 /* INSERT */
                  }
                }
              ]
            };
          } else if (commandInfo.id === CopySheetCommand.id) {
            const params = commandInfo.params;
            const { unitId, subUnitId, targetSubUnitId } = params;
            if (!unitId || !subUnitId || !targetSubUnitId) {
              return { redos: [], undos: [] };
            }
            const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
            const drawings = Object.values(drawingData).filter((drawing) => {
              if (drawing.drawingType === 2 /* DRAWING_CHART */) {
                return false;
              }
              return true;
            }).map((drawing) => {
              return {
                ...drawing,
                subUnitId: targetSubUnitId,
                drawingId: generateRandomId(6)
              };
            });
            if (drawings.length === 0) {
              return { redos: [], undos: [] };
            }
            const jsonOp = this._sheetDrawingService.getBatchAddOp(drawings);
            const { unitId: jsonOpUnitId, subUnitId: jsonOpSubUnitId, undo, redo, objects } = jsonOp;
            return {
              redos: [
                {
                  id: SetDrawingApplyMutation.id,
                  params: {
                    op: redo,
                    unitId: jsonOpUnitId,
                    subUnitId: jsonOpSubUnitId,
                    objects,
                    type: 0 /* INSERT */
                  }
                }
              ],
              undos: [
                {
                  id: SetDrawingApplyMutation.id,
                  params: {
                    op: undo,
                    unitId: jsonOpUnitId,
                    subUnitId: jsonOpSubUnitId,
                    objects,
                    type: 1 /* REMOVE */
                  }
                }
              ]
            };
          }
          return { redos: [], undos: [] };
        }
      })
    );
  }
};
SheetsDrawingLoadController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, ISheetDrawingService),
  __decorateParam(4, IDrawingManagerService),
  __decorateParam(5, IResourceManagerService)
], SheetsDrawingLoadController);

// ../packages/sheets-drawing/src/plugin.ts
var UniverSheetsDrawingPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(SHEETS_DRAWING_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsDrawingLoadController],
      [ISheetDrawingService, { useClass: SheetDrawingService }]
    ].forEach((dependency) => this._injector.add(dependency));
    this._injector.get(SheetsDrawingLoadController);
  }
};
__publicField(UniverSheetsDrawingPlugin, "pluginName", SHEET_DRAWING_PLUGIN);
__publicField(UniverSheetsDrawingPlugin, "packageName", package_default.name);
__publicField(UniverSheetsDrawingPlugin, "version", package_default.version);
__publicField(UniverSheetsDrawingPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsDrawingPlugin = __decorateClass([
  DependentOn(UniverDrawingPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsDrawingPlugin);

// ../packages/sheets-drawing/src/basics/transform-position.ts
function drawingPositionToTransform(position, sheetSkeletonParam) {
  if (!sheetSkeletonParam) return;
  const { unitId, sheetId, skeleton } = sheetSkeletonParam;
  const { from, to, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = position;
  const absolutePosition = convertPositionSheetOverGridToAbsolute(unitId, sheetId, { from, to }, skeleton);
  let { left, top, width, height } = absolutePosition;
  const sheetWidth = skeleton.rowHeaderWidth + skeleton.columnTotalWidth;
  const sheetHeight = skeleton.columnHeaderHeight + skeleton.rowTotalHeight;
  if (left + width > sheetWidth) {
    left = sheetWidth - width;
  }
  if (top + height > sheetHeight) {
    top = sheetHeight - height;
  }
  return {
    flipY,
    flipX,
    angle,
    skewX,
    skewY,
    left,
    top,
    width,
    height
  };
}
function transformToDrawingPosition(transform, skeleton) {
  const { left = 0, top = 0, width = 0, height = 0, flipY = false, flipX = false, angle = 0, skewX = 0, skewY = 0 } = transform;
  const startSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left, top);
  const endSelectionCell = skeleton.getCellIndexAndOffsetByPosition(left + width, top + height);
  return {
    flipY,
    flipX,
    angle,
    skewX,
    skewY,
    from: startSelectionCell,
    to: endSelectionCell
  };
}
function transformToAxisAlignPosition(transform, skeleton) {
  const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = transform;
  const norm = (angle % 360 + 360) % 360;
  const useSwappedAxis = norm >= 45 && norm < 135 || norm >= 225 && norm < 315;
  if (!useSwappedAxis) {
    return transformToDrawingPosition(transform, skeleton);
  }
  const rotatedTransform = {
    ...transform,
    left: left + width / 2 - height / 2,
    top: top + height / 2 - width / 2,
    width: height,
    height: width
  };
  return transformToDrawingPosition(rotatedTransform, skeleton);
}

// ../packages/docs-drawing/src/services/doc-drawing.service.ts
var DocDrawingService = class extends UnitDrawingService {
};
var IDocDrawingService = createIdentifier("univer.doc.plugin.doc-drawing.service");

// ../packages/docs-drawing/src/controllers/doc-drawing.controller.ts
var DOCS_DRAWING_PLUGIN = "DOC_DRAWING_PLUGIN";
var DocDrawingController = class extends Disposable {
  constructor(_docDrawingService, _drawingManagerService, _resourceManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_docDrawingService", _docDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._init();
  }
  _init() {
    this._initSnapshot();
  }
  _initSnapshot() {
    const toJson = (unitId) => {
      const doc = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
      if (doc) {
        const drawings = doc.getSnapshot().drawings;
        const drawingOrder = doc.getSnapshot().drawingsOrder;
        const data = {
          data: drawings != null ? drawings : {},
          order: drawingOrder != null ? drawingOrder : []
        };
        return JSON.stringify(data);
      }
      return "";
    };
    const parseJson = (json) => {
      if (!json) {
        return { data: {}, order: [] };
      }
      try {
        return JSON.parse(json);
      } catch (err) {
        return { data: {}, order: [] };
      }
    };
    this.disposeWithMe(
      this._resourceManagerService.registerPluginResource({
        pluginName: DOCS_DRAWING_PLUGIN,
        businesses: [1 /* UNIVER_DOC */],
        toJson: (unitId) => toJson(unitId),
        parseJson: (json) => parseJson(json),
        onUnLoad: (unitId) => {
          this._setDrawingDataForUnit(unitId, { data: {}, order: [] });
        },
        onLoad: (unitId, value) => {
          var _a, _b;
          this._setDrawingDataForUnit(unitId, { data: (_a = value.data) != null ? _a : {}, order: (_b = value.order) != null ? _b : [] });
        }
      })
    );
  }
  _setDrawingDataForUnit(unitId, drawingMapItem) {
    const documentDataModel = this._univerInstanceService.getUnit(unitId);
    if (documentDataModel == null) {
      return;
    }
    documentDataModel.resetDrawing(drawingMapItem.data, drawingMapItem.order);
    this.loadDrawingDataForUnit(unitId);
  }
  loadDrawingDataForUnit(unitId) {
    const dataModel = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
    if (!dataModel) {
      return false;
    }
    const subUnitId = unitId;
    const drawingDataModels = dataModel.getDrawings();
    const drawingOrderModel = dataModel.getDrawingsOrder();
    if (!drawingDataModels || !drawingOrderModel) {
      return false;
    }
    Object.keys(drawingDataModels).forEach((drawingId) => {
      const drawingDataModel = drawingDataModels[drawingId];
      drawingDataModels[drawingId] = { ...drawingDataModel };
    });
    const subDrawings = {
      [subUnitId]: {
        unitId,
        subUnitId,
        data: drawingDataModels,
        order: drawingOrderModel
      }
    };
    this._docDrawingService.registerDrawingData(unitId, subDrawings);
    this._drawingManagerService.registerDrawingData(unitId, subDrawings);
    return true;
  }
};
DocDrawingController = __decorateClass([
  __decorateParam(0, IDocDrawingService),
  __decorateParam(1, IDrawingManagerService),
  __decorateParam(2, IResourceManagerService),
  __decorateParam(3, IUniverInstanceService)
], DocDrawingController);

// ../packages/docs-drawing/package.json
var package_default2 = {
  name: "@univerjs/docs-drawing",
  version: "0.25.2",
  private: false,
  description: "Drawing model integration for Univer Docs.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "docs",
    "drawing",
    "document",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/drawing": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/docs-drawing/src/config/config.ts
var DOCS_DRAWING_PLUGIN_CONFIG_KEY = "docs-drawing.config";
var configSymbol2 = Symbol(DOCS_DRAWING_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/docs-drawing/src/plugin.ts
var UniverDocsDrawingPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    this._configService.setConfig(DOCS_DRAWING_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [DocDrawingController],
      [DocDrawingService],
      [IDocDrawingService, { useClass: DocDrawingService }]
    ].forEach((dependency) => this._injector.add(dependency));
    touchDependencies(this._injector, [
      [DocDrawingController]
    ]);
  }
};
__publicField(UniverDocsDrawingPlugin, "pluginName", DOCS_DRAWING_PLUGIN);
__publicField(UniverDocsDrawingPlugin, "packageName", package_default2.name);
__publicField(UniverDocsDrawingPlugin, "version", package_default2.version);
__publicField(UniverDocsDrawingPlugin, "type", 1 /* UNIVER_DOC */);
UniverDocsDrawingPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverDocsDrawingPlugin);

// ../packages/drawing-ui/src/commands/operations/drawing-align.operation.ts
var SetDrawingAlignOperation = {
  id: "sheet.operation.set-image-align",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    return true;
  }
};
var SetDrawingAlignLeftOperation = {
  id: "sheet.operation.set-drawing-align-left",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "1" /* left */ });
  }
};
var SetDrawingAlignCenterOperation = {
  id: "sheet.operation.set-drawing-align-center",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "2" /* center */ });
  }
};
var SetDrawingAlignRightOperation = {
  id: "sheet.operation.set-drawing-align-right",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "3" /* right */ });
  }
};
var SetDrawingAlignTopOperation = {
  id: "sheet.operation.set-drawing-align-top",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "4" /* top */ });
  }
};
var SetDrawingAlignMiddleOperation = {
  id: "sheet.operation.set-drawing-align-middle",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "5" /* middle */ });
  }
};
var SetDrawingAlignBottomOperation = {
  id: "sheet.operation.set-drawing-align-bottom",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "6" /* bottom */ });
  }
};
var SetDrawingAlignHorizonOperation = {
  id: "sheet.operation.set-drawing-align-horizon",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "7" /* horizon */ });
  }
};
var SetDrawingAlignVerticalOperation = {
  id: "sheet.operation.set-drawing-align-vertical",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: "8" /* vertical */ });
  }
};

// ../packages/drawing-ui/src/commands/operations/drawing-arrange.operation.ts
var SetDrawingArrangeOperation = {
  id: "drawing.operation.set-drawing-arrange",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const drawingManagerService = accessor.get(IDrawingManagerService);
    const { arrangeType } = params;
    const drawings = params.drawings || drawingManagerService.getFocusDrawings();
    const { unitId, subUnitId } = drawings[0];
    const drawingIds = drawings.map((drawing) => drawing.drawingId);
    drawingManagerService.featurePluginOrderUpdateNotification({ unitId, subUnitId, drawingIds, arrangeType });
    return true;
  }
};
var SetDrawingArrangeFrontOperation = {
  id: "drawing.operation.set-drawing-arrange-front",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: 2 /* front */ });
  }
};
var SetDrawingArrangeForwardOperation = {
  id: "drawing.operation.set-drawing-arrange-forward",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: 0 /* forward */ });
  }
};
var SetDrawingArrangeBackOperation = {
  id: "drawing.operation.set-drawing-arrange-back",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: 3 /* back */ });
  }
};
var SetDrawingArrangeBackwardOperation = {
  id: "drawing.operation.set-drawing-arrange-backward",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: 1 /* backward */ });
  }
};

// ../packages/drawing-ui/src/commands/operations/drawing-group.operation.ts
var DRAWING_GROUP_TYPES = [0 /* DRAWING_IMAGE */, 1 /* DRAWING_SHAPE */, 6 /* DRAWING_GROUP */];
var SetDrawingGroupOperation = {
  id: "drawing.operation.set-drawing-group",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const drawingManagerService = accessor.get(IDrawingManagerService);
    const drawings = params.drawings || drawingManagerService.getFocusDrawings();
    if (drawings.length < 2) return false;
    if (!drawings.every((drawing) => DRAWING_GROUP_TYPES.includes(drawing.drawingType))) return false;
    const { unitId, subUnitId } = drawings[0];
    const groupId = generateRandomId(10);
    const groupTransform = getGroupState(0, 0, drawings.map((o) => o.transform || {}));
    const groupParam = {
      unitId,
      subUnitId,
      drawingId: groupId,
      drawingType: 6 /* DRAWING_GROUP */,
      transform: groupTransform,
      groupBaseBound: {
        left: groupTransform.left,
        top: groupTransform.top,
        width: groupTransform.width,
        height: groupTransform.height
      }
    };
    const children = drawings.map((drawing) => {
      const transform = drawing.transform || { left: 0, top: 0 };
      const { unitId: unitId2, subUnitId: subUnitId2, drawingId } = drawing;
      return {
        unitId: unitId2,
        subUnitId: subUnitId2,
        drawingId,
        transform: {
          ...transform
          // left: transform.left! - groupTransform.left,
          // top: transform.top! - groupTransform.top,
        },
        groupId
      };
    });
    drawingManagerService.featurePluginGroupUpdateNotification([{
      parent: groupParam,
      children
    }]);
    return true;
  }
};
var CancelDrawingGroupOperation = {
  id: "drawing.operation.cancel-drawing-group",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const drawingManagerService = accessor.get(IDrawingManagerService);
    const drawings = params.drawings || drawingManagerService.getFocusDrawings();
    const groupParams = drawings.map((drawing) => {
      if (drawing.drawingType !== 6 /* DRAWING_GROUP */) return null;
      const { unitId, subUnitId, drawingId, transform: groupTransform = { width: 0, height: 0 }, groupBaseBound } = drawing;
      if (groupTransform === null) return null;
      const objects = drawingManagerService.getDrawingsByGroup({ unitId, subUnitId, drawingId });
      if (objects.length === 0) return null;
      const children = objects.map((object) => {
        const { transform } = object;
        const { unitId: unitId2, subUnitId: subUnitId2, drawingId: drawingId2 } = object;
        const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0, groupBaseBound);
        return {
          unitId: unitId2,
          subUnitId: subUnitId2,
          drawingId: drawingId2,
          transform: {
            ...transform,
            ...newTransform
          },
          groupId: void 0
        };
      });
      return {
        parent: drawing,
        children
      };
    }).filter((o) => o !== null);
    if (groupParams.length === 0) return false;
    drawingManagerService.featurePluginUngroupUpdateNotification(groupParams);
    return true;
  }
};

// ../packages/drawing-ui/src/commands/operations/image-crop.operation.ts
var OpenImageCropOperation = {
  id: "sheet.operation.open-image-crop",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    return true;
  }
};
var CloseImageCropOperation = {
  id: "sheet.operation.close-image-crop",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    return true;
  }
};
var AutoImageCropOperation = {
  id: "sheet.operation.Auto-image-crop",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    return true;
  }
};

// ../packages/drawing-ui/src/commands/operations/image-reset-size.operation.ts
var ImageResetSizeOperation = {
  id: "sheet.operation.image-reset-size",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    return true;
  }
};

// ../packages/drawing-ui/src/controllers/utils.ts
function insertGroupObject(objectParam, object, scene, drawingManagerService) {
  const groupParam = drawingManagerService.getDrawingByParam(objectParam);
  if (groupParam == null) {
    return;
  }
  const groupKey = getDrawingShapeKeyByDrawingSearch(objectParam);
  const groupObject = scene.getObjectIncludeInGroup(groupKey);
  if (groupObject && !(groupObject instanceof Group)) {
    return;
  }
  if (groupObject != null) {
    const objects = groupObject.getObjects();
    for (const obj of objects) {
      if (obj.oKey === object.oKey) {
        return;
      }
    }
    groupObject.addObject(object);
    return;
  }
  const group = new DrawingGroupObject(groupKey);
  scene.addObject(group, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(group);
  group.addObject(object);
  const { transform, groupBaseBound } = groupParam;
  if (groupBaseBound) {
    group.setBaseBound(groupBaseBound);
  }
  if (groupParam.groupId) {
    group.isInGroup = true;
    insertGroupObject(
      { drawingId: groupParam.groupId, unitId: objectParam.unitId, subUnitId: objectParam.subUnitId },
      group,
      scene,
      drawingManagerService
    );
  }
  transform && group.transformByState(
    {
      left: transform.left,
      top: transform.top,
      angle: transform.angle,
      width: transform.width,
      height: transform.height
    }
  );
}
function getCurrentUnitInfo(currentUniverService, propUnitId) {
  var _a;
  const current = propUnitId ? currentUniverService.getUnit(propUnitId) : currentUniverService.getFocusedUnit();
  if (current == null) {
    return;
  }
  const unitId = current.getUnitId();
  let subUnitId;
  if (current.type === 2 /* UNIVER_SHEET */) {
    subUnitId = (_a = current.getActiveSheet()) == null ? void 0 : _a.getSheetId();
  } else if (current.type === 1 /* UNIVER_DOC */) {
    subUnitId = unitId;
  } else if (current.type === 3 /* UNIVER_SLIDE */) {
    subUnitId = unitId;
  }
  return { unitId, subUnitId, current };
}

// ../packages/drawing-ui/package.json
var package_default3 = {
  name: "@univerjs/drawing-ui",
  version: "0.25.2",
  private: false,
  description: "Shared drawing UI components and services for Univer.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "drawing",
    "graphics",
    "ui",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./locale/*": "./src/locale/*.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./locale/*": {
        import: "./lib/es/locale/*.js",
        require: "./lib/cjs/locale/*.js",
        types: "./lib/types/locale/*.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/drawing-ui/src/config/config.ts
var DRAWING_UI_PLUGIN_CONFIG_KEY = "drawing-ui.config";
var configSymbol3 = Symbol(DRAWING_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig3 = {};

// ../packages/drawing-ui/src/menu/align.menu.ts
var getMenuStateByDrawingFocusChangedObservable$ = (accessor) => {
  const drawingManagerService = accessor.get(IDrawingManagerService);
  return new Observable((subscriber) => {
    const update = (drawings) => {
      if (!drawings || drawings.length === 0) {
        return subscriber.next(true);
      }
      if (drawings.length < 2) {
        return subscriber.next(true);
      }
      subscriber.next(false);
    };
    const subscription = drawingManagerService.focus$.subscribe((drawings) => {
      if (!drawings || drawings.length === 0) {
        return subscriber.next(true);
      }
      update(drawings);
    });
    update(drawingManagerService.getFocusDrawings());
    return () => subscription.unsubscribe();
  });
};
var DRAWING_ALIGN_CONTEXT_MENU_ID = "contextMenu.drawing-align";
function DrawingAlignContextMenuItemFactory(accessor) {
  return {
    id: DRAWING_ALIGN_CONTEXT_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "HorizontallyIcon",
    title: "drawing-ui.image-panel.align.title",
    hidden$: getMenuStateByDrawingFocusChangedObservable$(accessor)
  };
}
function SetDrawingAlignLeftMenuItemFactory() {
  return {
    id: SetDrawingAlignLeftOperation.id,
    type: 0 /* BUTTON */,
    icon: "LeftJustifyingIcon",
    title: "drawing-ui.image-panel.align.left"
  };
}
function SetDrawingAlignCenterMenuItemFactory() {
  return {
    id: SetDrawingAlignCenterOperation.id,
    type: 0 /* BUTTON */,
    icon: "HorizontallyIcon",
    title: "drawing-ui.image-panel.align.center"
  };
}
function SetDrawingAlignRightMenuItemFactory() {
  return {
    id: SetDrawingAlignRightOperation.id,
    type: 0 /* BUTTON */,
    icon: "RightJustifyingIcon",
    title: "drawing-ui.image-panel.align.right"
  };
}
function SetDrawingAlignTopMenuItemFactory() {
  return {
    id: SetDrawingAlignTopOperation.id,
    type: 0 /* BUTTON */,
    icon: "AlignTopIcon",
    title: "drawing-ui.image-panel.align.top"
  };
}
function SetDrawingAlignMiddleMenuItemFactory() {
  return {
    id: SetDrawingAlignMiddleOperation.id,
    type: 0 /* BUTTON */,
    icon: "VerticalCenterIcon",
    title: "drawing-ui.image-panel.align.middle"
  };
}
function SetDrawingAlignBottomMenuItemFactory() {
  return {
    id: SetDrawingAlignBottomOperation.id,
    type: 0 /* BUTTON */,
    icon: "AlignBottomIcon",
    title: "drawing-ui.image-panel.align.bottom"
  };
}
function SetDrawingAlignHorizonMenuItemFactory() {
  return {
    id: SetDrawingAlignHorizonOperation.id,
    type: 0 /* BUTTON */,
    icon: "HorizontallyIcon",
    title: "drawing-ui.image-panel.align.horizon"
  };
}
function SetDrawingAlignVerticalMenuItemFactory() {
  return {
    id: SetDrawingAlignVerticalOperation.id,
    type: 0 /* BUTTON */,
    icon: "VerticalCenterIcon",
    title: "drawing-ui.image-panel.align.vertical"
  };
}

// ../packages/drawing-ui/src/menu/arrange.menu.ts
var DRAWING_ARRANGE_CONTEXT_MENU_ID = "contextMenu.drawing-arrange";
function DrawingArrangeContextMenuItemFactory() {
  return {
    id: DRAWING_ARRANGE_CONTEXT_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "TopmostIcon",
    title: "drawing-ui.image-panel.arrange.title"
  };
}
function SetDrawingArrangeFrontMenuItemFactory() {
  return {
    id: SetDrawingArrangeFrontOperation.id,
    type: 0 /* BUTTON */,
    icon: "TopmostIcon",
    title: "drawing-ui.image-panel.arrange.front"
  };
}
function SetDrawingArrangeForwardMenuItemFactory() {
  return {
    id: SetDrawingArrangeForwardOperation.id,
    type: 0 /* BUTTON */,
    icon: "MoveUpIcon",
    title: "drawing-ui.image-panel.arrange.forward"
  };
}
function SetDrawingArrangeBackMenuItemFactory() {
  return {
    id: SetDrawingArrangeBackOperation.id,
    type: 0 /* BUTTON */,
    icon: "BottomIcon",
    title: "drawing-ui.image-panel.arrange.back"
  };
}
function SetDrawingArrangeBackwardMenuItemFactory() {
  return {
    id: SetDrawingArrangeBackwardOperation.id,
    type: 0 /* BUTTON */,
    icon: "MoveDownIcon",
    title: "drawing-ui.image-panel.arrange.backward"
  };
}

// ../packages/drawing-ui/src/menu/group.menu.ts
var getMenuStateByDrawingFocusChangedObservable$2 = (accessor, type) => {
  const drawingManagerService = accessor.get(IDrawingManagerService);
  return new Observable((subscriber) => {
    const update = (drawings) => {
      if (!drawings || drawings.length === 0) {
        return subscriber.next(true);
      }
      if (type === "group") {
        if (drawings.length < 2) {
          return subscriber.next(true);
        }
        if (!drawings.every((drawing) => DRAWING_GROUP_TYPES.includes(drawing.drawingType))) {
          return subscriber.next(true);
        }
      } else if (type === "unGroup") {
        const groups = drawings.filter((drawing) => drawing.drawingType === 6 /* DRAWING_GROUP */);
        if (groups.length === 0) {
          return subscriber.next(true);
        }
      } else {
        if (!drawings.every((drawing) => DRAWING_GROUP_TYPES.includes(drawing.drawingType))) {
          return subscriber.next(true);
        }
      }
      subscriber.next(false);
    };
    const subscription = drawingManagerService.focus$.subscribe((drawings) => {
      if (!drawings || drawings.length === 0) {
        return subscriber.next(true);
      }
      update(drawings);
    });
    update(drawingManagerService.getFocusDrawings());
    return () => subscription.unsubscribe();
  });
};
var DRAWING_GROUP_CONTEXT_MENU_ID = "contextMenu.drawing-group";
function DrawingGroupContextMenuItemFactory(accessor) {
  return {
    id: DRAWING_GROUP_CONTEXT_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "GroupIcon",
    title: "drawing-ui.image-panel.group.title",
    hidden$: getMenuStateByDrawingFocusChangedObservable$2(accessor)
  };
}
function SetDrawingGroupMenuItemFactory(accessor) {
  return {
    id: SetDrawingGroupOperation.id,
    type: 0 /* BUTTON */,
    icon: "GroupIcon",
    title: "drawing-ui.image-panel.group.group",
    disabled$: getMenuStateByDrawingFocusChangedObservable$2(accessor, "group")
  };
}
function CancelDrawingGroupMenuItemFactory(accessor) {
  return {
    id: CancelDrawingGroupOperation.id,
    type: 0 /* BUTTON */,
    icon: "UngroupIcon",
    title: "drawing-ui.image-panel.group.unGroup",
    disabled$: getMenuStateByDrawingFocusChangedObservable$2(accessor, "unGroup")
  };
}

// ../packages/drawing-ui/src/menu/schema.ts
var menuSchema = {
  ["contextMenu.drawing" /* DRAWING */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [DRAWING_GROUP_CONTEXT_MENU_ID]: {
        order: 1,
        menuItemFactory: DrawingGroupContextMenuItemFactory,
        [SetDrawingGroupOperation.id]: {
          order: 0,
          menuItemFactory: SetDrawingGroupMenuItemFactory
        },
        [CancelDrawingGroupOperation.id]: {
          order: 1,
          menuItemFactory: CancelDrawingGroupMenuItemFactory
        }
      },
      [DRAWING_ARRANGE_CONTEXT_MENU_ID]: {
        order: 2,
        menuItemFactory: DrawingArrangeContextMenuItemFactory,
        [SetDrawingArrangeFrontOperation.id]: {
          order: 0,
          menuItemFactory: SetDrawingArrangeFrontMenuItemFactory
        },
        [SetDrawingArrangeForwardOperation.id]: {
          order: 1,
          menuItemFactory: SetDrawingArrangeForwardMenuItemFactory
        },
        [SetDrawingArrangeBackOperation.id]: {
          order: 2,
          menuItemFactory: SetDrawingArrangeBackMenuItemFactory
        },
        [SetDrawingArrangeBackwardOperation.id]: {
          order: 3,
          menuItemFactory: SetDrawingArrangeBackwardMenuItemFactory
        }
      },
      [DRAWING_ALIGN_CONTEXT_MENU_ID]: {
        order: 3,
        menuItemFactory: DrawingAlignContextMenuItemFactory,
        [SetDrawingAlignLeftOperation.id]: {
          order: 0,
          menuItemFactory: SetDrawingAlignLeftMenuItemFactory
        },
        [SetDrawingAlignCenterOperation.id]: {
          order: 1,
          menuItemFactory: SetDrawingAlignCenterMenuItemFactory
        },
        [SetDrawingAlignRightOperation.id]: {
          order: 2,
          menuItemFactory: SetDrawingAlignRightMenuItemFactory
        },
        [SetDrawingAlignTopOperation.id]: {
          order: 3,
          menuItemFactory: SetDrawingAlignTopMenuItemFactory
        },
        [SetDrawingAlignMiddleOperation.id]: {
          order: 4,
          menuItemFactory: SetDrawingAlignMiddleMenuItemFactory
        },
        [SetDrawingAlignBottomOperation.id]: {
          order: 5,
          menuItemFactory: SetDrawingAlignBottomMenuItemFactory
        },
        [SetDrawingAlignHorizonOperation.id]: {
          order: 6,
          menuItemFactory: SetDrawingAlignHorizonMenuItemFactory
        },
        [SetDrawingAlignVerticalOperation.id]: {
          order: 7,
          menuItemFactory: SetDrawingAlignVerticalMenuItemFactory
        }
      }
    }
  }
};

// ../packages/drawing-ui/src/views/image-popup-menu/component-name.ts
var COMPONENT_IMAGE_POPUP_MENU = "COMPONENT_IMAGE_POPUP_MENU";

// ../packages/drawing-ui/src/views/image-popup-menu/ImagePopupMenu.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
function ImagePopupMenu(props) {
  var _a, _b;
  const { popup } = props;
  const menuItems = (_a = popup == null ? void 0 : popup.extraProps) == null ? void 0 : _a.menuItems;
  if (!menuItems) return null;
  if (((_b = popup.extraProps) == null ? void 0 : _b.variant) === "doc-floating-toolbar" && popup.extraProps.unitId && popup.extraProps.subUnitId && popup.extraProps.drawingId) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      DocImageFloatingToolbar,
      {
        menuItems,
        unitId: popup.extraProps.unitId,
        subUnitId: popup.extraProps.subUnitId,
        drawingId: popup.extraProps.drawingId
      }
    );
  }
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const [visible, setVisible] = (0, import_react.useState)(false);
  const [isHovered, setHovered] = (0, import_react.useState)(false);
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };
  const onVisibleChange = (visible2) => {
    setVisible(visible2);
  };
  const handleClick = (item) => {
    commandService.executeCommand(item.commandId, item.commandParams);
    setVisible(false);
  };
  const showMore = visible || isHovered;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        DropdownMenu,
        {
          align: "start",
          items: menuItems.map((item) => ({
            type: "item",
            children: localeService.t(item.label),
            disabled: item.disable,
            onSelect: () => handleClick(item)
          })),
          open: visible,
          onOpenChange: onVisibleChange,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: clsx(`univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1 hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-800`, borderClassName, {
                "univer-bg-gray-100 dark:!univer-bg-gray-800": visible,
                "univer-bg-white dark:!univer-bg-gray-900": !visible
              }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  AutofillDoubleIcon,
                  {
                    className: `univer-fill-primary-600 univer-text-gray-900 dark:!univer-text-white`
                  }
                ),
                showMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreDownIcon, { className: "dark:!univer-text-white" })
              ]
            }
          )
        }
      )
    }
  );
}
var UPDATE_DOC_DRAWING_WRAPPING_STYLE_COMMAND_ID = "doc.command.update-doc-drawing-wrapping-style";
function getWrappingStyle(documentDataModel, drawingId) {
  var _a;
  const drawing = (_a = documentDataModel == null ? void 0 : documentDataModel.getSnapshot().drawings) == null ? void 0 : _a[drawingId];
  if (!drawing) {
    return "inline" /* INLINE */;
  }
  if (drawing.layoutType === 1 /* WRAP_NONE */) {
    return drawing.behindDoc === 1 /* TRUE */ ? "behindText" /* BEHIND_TEXT */ : "inFrontOfText" /* IN_FRONT_OF_TEXT */;
  }
  if (drawing.layoutType === 3 /* WRAP_SQUARE */) {
    return "wrapSquare" /* WRAP_SQUARE */;
  }
  if (drawing.layoutType === 6 /* WRAP_TOP_AND_BOTTOM */) {
    return "wrapTopAndBottom" /* WRAP_TOP_AND_BOTTOM */;
  }
  return "inline" /* INLINE */;
}
function Divider() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      className: "\n              univer-h-5 univer-w-px univer-bg-gray-200\n              dark:!univer-bg-gray-700\n            "
    }
  );
}
function ToolbarGroup(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-flex univer-h-7 univer-items-center univer-gap-1 univer-px-1", children: props.children });
}
function ToolbarButton(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { title: props.title, placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      disabled: props.disabled,
      onClick: props.onClick,
      className: clsx(`univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md univer-border-none univer-bg-transparent univer-p-0 univer-text-sm univer-text-gray-700 univer-transition-colors hover:univer-bg-gray-100 disabled:univer-cursor-not-allowed disabled:univer-opacity-40 dark:!univer-text-gray-100 dark:hover:!univer-bg-gray-700`, {
        "univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300": props.active
      }),
      children: props.children
    }
  ) });
}
function TextWrapShapeIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 20 20", width: "1em", height: "1em", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 4.5H8.2", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.8 4.5H17.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 10H5.7", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M14.3 10H17.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 15.5H8.2", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.8 15.5H17.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "6.8", y: "7", width: "6.4", height: "6", rx: "1", stroke: "currentColor", strokeWidth: "1.4" })
  ] });
}
function CropIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 20 20", width: "1em", height: "1em", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 2.8V12.5C5 13.9 6.1 15 7.5 15H17.2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.8 5H12.5C13.9 5 15 6.1 15 7.5V17.2", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8.3 8.3H11.7V11.7H8.3V8.3Z", stroke: "currentColor", strokeWidth: "1.2" })
  ] });
}
function ToolbarDropdownButton(props) {
  var _a;
  const [open, setOpen] = (0, import_react.useState)(false);
  const activeOption = (_a = props.options.find((option) => option.value === props.value)) != null ? _a : props.options[0];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Dropdown,
    {
      open,
      onOpenChange: setOpen,
      overlay: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: `univer-min-w-32 univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1 univer-shadow-lg dark:!univer-border-gray-700 dark:!univer-bg-gray-900`,
          children: props.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => {
                props.onChange(option.value);
                setOpen(false);
              },
              className: clsx(`univer-flex univer-h-8 univer-w-full univer-items-center univer-gap-2 univer-rounded-md univer-border-none univer-bg-transparent univer-px-2 univer-text-left univer-text-sm univer-text-gray-700 univer-transition-colors hover:univer-bg-gray-100 dark:!univer-text-gray-100 dark:hover:!univer-bg-gray-800`, {
                "univer-bg-primary-50 univer-text-primary-600 dark:!univer-bg-gray-800 dark:!univer-text-primary-300": option.value === props.value
              }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "univer-flex univer-size-4 univer-items-center univer-justify-center", children: option.icon }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "univer-flex-1", children: option.label })
              ]
            },
            option.value
          ))
        }
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { title: props.title, placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: clsx(`univer-flex univer-h-6 univer-min-w-9 univer-items-center univer-justify-center univer-gap-1 univer-rounded-md univer-border-none univer-bg-transparent univer-px-1.5 univer-text-sm univer-text-gray-700 univer-transition-colors hover:univer-bg-gray-100 dark:!univer-text-gray-100 dark:hover:!univer-bg-gray-700`, {
            "univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300": open
          }),
          children: [
            activeOption.icon,
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreDownIcon, { className: "univer-text-xs" })
          ]
        }
      ) }) })
    }
  );
}
function DocImageFloatingToolbar(props) {
  var _a, _b, _c;
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const documentDataModel = (_a = univerInstanceService.getUnit(props.unitId, 1 /* UNIVER_DOC */)) != null ? _a : void 0;
  const [wrappingStyle, setWrappingStyle] = (0, import_react.useState)(() => getWrappingStyle(documentDataModel, props.drawingId));
  const [hidden, setHidden] = (0, import_react.useState)(false);
  const getMenuItem = (label) => props.menuItems.find((item) => item.label === label);
  const editItem = getMenuItem("drawing-ui.image-popup.edit");
  const cropItem = getMenuItem("drawing-ui.image-popup.crop");
  const deleteItem = getMenuItem("drawing-ui.image-popup.delete");
  const wrappingStyleOptions = [
    { label: localeService.t("drawing-ui.image-text-wrap.inline"), value: "inline" /* INLINE */, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextWrapShapeIcon, {}) },
    { label: localeService.t("drawing-ui.image-text-wrap.square"), value: "wrapSquare" /* WRAP_SQUARE */, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextWrapShapeIcon, {}) },
    { label: localeService.t("drawing-ui.image-text-wrap.topAndBottom"), value: "wrapTopAndBottom" /* WRAP_TOP_AND_BOTTOM */, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextWrapShapeIcon, {}) },
    { label: localeService.t("drawing-ui.image-text-wrap.behindText"), value: "behindText" /* BEHIND_TEXT */, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextWrapShapeIcon, {}) },
    { label: localeService.t("drawing-ui.image-text-wrap.inFrontText"), value: "inFrontOfText" /* IN_FRONT_OF_TEXT */, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextWrapShapeIcon, {}) }
  ];
  const executeMenuItem = (item) => {
    if (!item || item.disable) {
      return;
    }
    commandService.executeCommand(item.commandId, item.commandParams);
  };
  const updateWrappingStyle = (value) => {
    setWrappingStyle(value);
    commandService.executeCommand(UPDATE_DOC_DRAWING_WRAPPING_STYLE_COMMAND_ID, {
      unitId: props.unitId,
      subUnitId: props.subUnitId,
      drawings: [{ unitId: props.unitId, subUnitId: props.subUnitId, drawingId: props.drawingId }],
      wrappingStyle: value
    });
  };
  if (hidden) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "data-u-comp": "doc-image-floating-toolbar",
      onMouseDown: (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
      className: clsx(`univer-box-border univer-flex univer-items-center univer-rounded univer-bg-white univer-px-1 univer-py-1 univer-shadow-sm dark:!univer-border-gray-700 dark:!univer-bg-gray-900`, borderClassName),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ToolbarDropdownButton,
          {
            title: (_c = (_b = wrappingStyleOptions.find((option) => option.value === wrappingStyle)) == null ? void 0 : _b.label) != null ? _c : localeService.t("drawing-ui.image-text-wrap.inline"),
            value: wrappingStyle,
            options: wrappingStyleOptions,
            onChange: updateWrappingStyle
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToolbarGroup, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ToolbarButton,
            {
              title: editItem ? localeService.t(editItem.label) : localeService.t("drawing-ui.image-popup.edit"),
              disabled: !editItem || editItem.disable,
              onClick: () => {
                setHidden(true);
                executeMenuItem(editItem);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSettingIcon, {})
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ToolbarButton,
            {
              title: cropItem ? localeService.t(cropItem.label) : localeService.t("drawing-ui.image-popup.crop"),
              disabled: !cropItem || cropItem.disable,
              onClick: () => executeMenuItem(cropItem),
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CropIcon, {})
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarGroup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ToolbarButton,
          {
            title: deleteItem ? localeService.t(deleteItem.label) : localeService.t("drawing-ui.image-popup.delete"),
            disabled: !deleteItem || deleteItem.disable,
            onClick: () => executeMenuItem(deleteItem),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteIcon, {})
          }
        ) })
      ]
    }
  );
}

// ../packages/drawing-ui/src/controllers/drawing-ui.controller.ts
var DrawingUIController = class extends Disposable {
  constructor(_componentManager, _commandService, _menuManagerService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    this._init();
  }
  _init() {
    this._initMenus();
    this._initCommands();
    this._initComponents();
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initCommands() {
    [
      OpenImageCropOperation,
      CloseImageCropOperation,
      ImageResetSizeOperation,
      SetDrawingAlignOperation,
      SetDrawingAlignLeftOperation,
      SetDrawingAlignCenterOperation,
      SetDrawingAlignRightOperation,
      SetDrawingAlignTopOperation,
      SetDrawingAlignMiddleOperation,
      SetDrawingAlignBottomOperation,
      SetDrawingAlignHorizonOperation,
      SetDrawingAlignVerticalOperation,
      AutoImageCropOperation,
      SetDrawingGroupOperation,
      CancelDrawingGroupOperation,
      SetDrawingArrangeOperation,
      SetDrawingArrangeFrontOperation,
      SetDrawingArrangeForwardOperation,
      SetDrawingArrangeBackOperation,
      SetDrawingArrangeBackwardOperation
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _initComponents() {
    [
      [COMPONENT_IMAGE_POPUP_MENU, ImagePopupMenu],
      ["BottomIcon", BottomIcon],
      ["GroupIcon", GroupIcon],
      ["MoveDownIcon", MoveDownIcon],
      ["MoveUpIcon", MoveUpIcon],
      ["TopmostIcon", TopmostIcon],
      ["UngroupIcon", UngroupIcon]
    ].forEach(([key, component]) => {
      this.disposeWithMe(this._componentManager.register(key, component));
    });
  }
};
DrawingUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IMenuManagerService)
], DrawingUIController);

// ../packages/drawing-ui/src/utils/get-update-params.ts
function getUpdateParams(objects, drawingManagerService) {
  const params = [];
  objects.forEach((object) => {
    const { oKey, left, top, height, width, angle } = object;
    const searchParam = drawingManagerService.getDrawingOKey(oKey);
    if (searchParam == null) {
      params.push(null);
      return true;
    }
    const { unitId, subUnitId, drawingId, drawingType } = searchParam;
    const param = {
      unitId,
      subUnitId,
      drawingId,
      drawingType,
      transform: {
        left,
        top,
        height,
        width,
        angle
      }
    };
    if (drawingType === 0 /* DRAWING_IMAGE */) {
      param.srcRect = object.srcRect;
    }
    params.push(param);
  });
  return params;
}

// ../packages/drawing-ui/src/controllers/drawing-update.controller.ts
var DrawingUpdateController = class extends Disposable {
  constructor(_currentUniverService, _commandService, _renderManagerService, _drawingManagerService) {
    super();
    __publicField(this, "_currentUniverService", _currentUniverService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_sceneListenerOnDrawingMap", /* @__PURE__ */ new WeakSet());
    this._initialize();
  }
  dispose() {
    super.dispose();
  }
  _initialize() {
    this._recoveryImages();
    this._drawingAddListener();
    this._drawingRemoveListener();
    this._drawingUpdateListener();
    this._commandExecutedListener();
    this._drawingArrangeListener();
    this._drawingGroupListener();
    this._drawingRefreshListener();
    this._drawingVisibleListener();
  }
  _recoveryImages() {
    const drawingList = this._drawingManagerService.drawingManagerData;
    const info = getCurrentUnitInfo(this._currentUniverService);
    if (info == null) {
      return;
    }
    const { unitId: currentUnitId, subUnitId: currentSubUnitId } = info;
    Object.keys(drawingList).forEach((unitId) => {
      Object.keys(drawingList[unitId]).forEach((subUnitId) => {
        const drawingMap = drawingList[unitId][subUnitId].data;
        if (drawingMap == null || unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
          return;
        }
        Object.keys(drawingMap).forEach((drawingId) => {
          const drawing = drawingMap[drawingId];
          if (drawing) {
            this._insertDrawing([{ unitId, subUnitId, drawingId }]);
          }
        });
      });
    });
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id === SetDrawingAlignOperation.id) {
          const params = command.params;
          if (params == null) {
            return;
          }
          this._drawingAlign(params);
        }
      })
    );
  }
  _drawingGroupListener() {
    this.disposeWithMe(
      this._drawingManagerService.group$.subscribe((params) => {
        this._groupDrawings(params);
      })
    );
    this.disposeWithMe(
      this._drawingManagerService.ungroup$.subscribe((params) => {
        this._ungroupDrawings(params);
      })
    );
  }
  // private _drawingGroup(params: ISetImageGroupOperationParams) {
  //     const { groupType } = params;
  //     const drawings = this._drawingManagerService.getFocusDrawings();
  //     if (drawings.length === 0) {
  //         return;
  //     }
  //     switch (groupType) {
  //         case GroupType.group:
  //             this._groupDrawings(drawings);
  //             break;
  //         case GroupType.regroup:
  //             this._regroupDrawings(drawings);
  //             break;
  //         case GroupType.ungroup:
  //             this._ungroupDrawings(drawings);
  //             break;
  //         default:
  //             break;
  //     }
  // }
  _getSceneAndTransformerByDrawingSearch(unitId) {
    if (unitId == null) {
      return;
    }
    const renderObject = this._renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return null;
    }
    const transformer = scene.getTransformerByCreate();
    return { scene, transformer };
  }
  _groupDrawings(drawings) {
    drawings.forEach((drawing) => {
      this._groupDrawing(drawing);
    });
  }
  _groupDrawing(params) {
    const { parent, children } = params;
    const { unitId, subUnitId, drawingId } = parent;
    const renderObject = this._getSceneAndTransformerByDrawingSearch(parent.unitId);
    if (renderObject == null) {
      return;
    }
    const { scene, transformer } = renderObject;
    this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
    const objects = [];
    children.forEach((drawing) => {
      const drawingShapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
      const object = scene.getObjectIncludeInGroup(drawingShapeKey);
      if (object == null || objects.includes(object)) {
        return;
      }
      objects.push(object);
      const { transform } = drawing;
      if (transform == null) {
        return;
      }
      if (object.classType === "Group" /* GROUP */) {
        object.transformByState({ left: transform.left, top: transform.top });
      } else {
        object.transformByState(transform);
      }
    });
    if (objects.length === 0) {
      return;
    }
    const groupKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
    const group = new DrawingGroupObject(groupKey);
    scene.addObject(group, DRAWING_OBJECT_LAYER_INDEX).attachTransformerTo(group);
    group.addObjects(...objects);
    if (parent.groupBaseBound) {
      group.setBaseBound(parent.groupBaseBound);
    }
    if (parent.groupId) {
      group.isInGroup = true;
      insertGroupObject(
        { drawingId: parent.groupId, unitId, subUnitId },
        group,
        scene,
        this._drawingManagerService
      );
    }
    parent.transform && group.transformByState({ left: parent.transform.left, top: parent.transform.top, width: parent.transform.width, height: parent.transform.height, angle: parent.transform.angle });
    transformer.clearSelectedObjects();
    transformer.setSelectedControl(group);
  }
  // private _regroupDrawings(drawings: IDrawingSearch[]) {
  //     const renderObject = this._getSceneAndTransformerByDrawingSearch(drawings[0].unitId);
  //     if (renderObject == null) {
  //         return;
  //     }
  //     const { scene, transformer } = renderObject;
  //     const objects: BaseObject[] = [];
  //     let firstGroup: Nullable<Group> = null;
  //     drawings.forEach((drawing) => {
  //         const imageShapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
  //         const o = scene.getObject(imageShapeKey);
  //         if (o == null) {
  //             return true;
  //         }
  //         const group = o.ancestorGroup as Nullable<Group>;
  //         if (group != null && firstGroup == null) {
  //             firstGroup = group;
  //         } else if (group != null && !objects.includes(group)) {
  //             objects.push(group);
  //         } else if (!objects.includes(o)) {
  //             objects.push(o);
  //         }
  //     });
  //     if (firstGroup == null) {
  //         return;
  //     }
  //     if (objects.length === 0) {
  //         return;
  //     }
  //     (firstGroup as Group).addObjects(...objects);
  //     (firstGroup as Group).reCalculateObjects();
  //     transformer.clearSelectedObjects();
  //     transformer.setSelectedControl(firstGroup);
  // }
  _ungroupDrawings(drawings) {
    drawings.forEach((drawing) => {
      this._ungroupDrawing(drawing);
    });
  }
  _ungroupDrawing(drawing) {
    const { parent, children } = drawing;
    const renderObject = this._getSceneAndTransformerByDrawingSearch(parent.unitId);
    if (renderObject == null) {
      return;
    }
    const { scene, transformer } = renderObject;
    children.forEach((drawing2) => {
      const drawingKey = getDrawingShapeKeyByDrawingSearch(drawing2);
      const object = scene.getObjectIncludeInGroup(drawingKey);
      if (object == null) {
        return true;
      }
      if (object == null) {
        return;
      }
      const { transform } = drawing2;
      if (transform == null) {
        return;
      }
      if (object.classType === "Group" /* GROUP */) {
        object.transformByState({ left: transform.left, top: transform.top });
      } else {
        object.transformByState(transform);
      }
    });
    const groupKey = getDrawingShapeKeyByDrawingSearch(parent);
    const group = scene.getObject(groupKey);
    const { width, height } = group;
    group.getObjects().forEach((object) => {
      group.removeSelfObjectAndTransform(object.oKey, width, height);
    });
    group.dispose();
    transformer.clearSelectedObjects();
  }
  _drawingAlign(params) {
    const { alignType } = params;
    const drawings = params.drawings || this._drawingManagerService.getFocusDrawings();
    if (alignType === "0" /* default */) {
      return;
    }
    const drawingTransformCaches = [];
    let minLeft = Number.POSITIVE_INFINITY;
    let minTop = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;
    let drawingCount = 0;
    drawings.forEach((drawing) => {
      const { unitId, subUnitId, drawingId, drawingType } = drawing;
      const drawingParam = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });
      if (drawingParam == null || drawingParam.transform == null) {
        return;
      }
      drawingTransformCaches.push({
        unitId,
        subUnitId,
        drawingId,
        drawingType,
        transform: drawingParam.transform
      });
      const { left = 0, top = 0, width = 0, height = 0 } = drawingParam.transform;
      minLeft = Math.min(minLeft, left);
      minTop = Math.min(minTop, top);
      maxRight = Math.max(maxRight, left + width);
      maxBottom = Math.max(maxBottom, top + height);
      drawingCount++;
    });
    if (drawingCount === 0) {
      return;
    }
    this._sortDrawingTransform(drawingTransformCaches, alignType);
    this._applyAlignType(drawingTransformCaches, alignType, minLeft, minTop, maxRight, maxBottom, drawingCount);
  }
  _applyAlignType(drawingTransformCaches, alignType, minLeft, minTop, maxRight, maxBottom, drawingCount) {
    const averageHorizon = Math.round((maxRight - minLeft) / drawingCount * 10) / 10;
    const averageVertical = Math.round((maxBottom - minTop) / drawingCount * 10) / 10;
    const updateParams = [];
    const renderObject = this._getSceneAndTransformerByDrawingSearch(drawingTransformCaches[0].unitId);
    if (renderObject == null) {
      return;
    }
    const { scene, transformer } = renderObject;
    drawingTransformCaches.forEach((drawingTransformCache, index) => {
      const { unitId, subUnitId, drawingId, transform, drawingType } = drawingTransformCache;
      const { left = 0, top = 0, width = 0, height = 0 } = transform;
      let newLeft = left;
      let newTop = top;
      switch (alignType) {
        case "1" /* left */:
          newLeft = minLeft;
          break;
        case "2" /* center */:
          newLeft = minLeft + (maxRight - minLeft) / 2 - width / 2;
          break;
        case "3" /* right */:
          newLeft = maxRight - width;
          break;
        case "4" /* top */:
          newTop = minTop;
          break;
        case "5" /* middle */:
          newTop = minTop + (maxBottom - minTop) / 2 - height / 2;
          break;
        case "6" /* bottom */:
          newTop = maxBottom - height;
          break;
        case "7" /* horizon */:
          newLeft = minLeft + averageHorizon * index;
          break;
        case "8" /* vertical */:
          newTop = minTop + averageVertical * index;
          break;
        default:
          break;
      }
      if (newLeft !== left || newTop !== top) {
        updateParams.push({
          unitId,
          subUnitId,
          drawingId,
          drawingType,
          transform: {
            left: newLeft,
            top: newTop
          }
        });
      }
    });
    this._drawingManagerService.featurePluginUpdateNotification(updateParams);
    transformer.refreshControls().changeNotification();
  }
  _sortDrawingTransform(drawingTransformCaches, alignType) {
    drawingTransformCaches.sort((a, b) => {
      const aTransform = a.transform;
      const bTransform = b.transform;
      const {
        left: aLeft = 0,
        top: aTop = 0,
        width: aWidth = 0,
        height: aHeight = 0
      } = aTransform;
      const {
        left: bLeft = 0,
        top: bTop = 0,
        width: bWidth = 0,
        height: bHeight = 0
      } = bTransform;
      switch (alignType) {
        case "1" /* left */:
          return aLeft - bLeft;
        case "2" /* center */:
          return aLeft + aWidth / 2 - (bLeft + bWidth / 2);
        case "3" /* right */:
          return aLeft + aWidth - (bLeft + bWidth);
        case "4" /* top */:
          return aTop - bTop;
        case "5" /* middle */:
          return aTop + aHeight / 2 - (bTop + bHeight / 2);
        case "6" /* bottom */:
          return aTop + aHeight - (bTop + bHeight);
        case "7" /* horizon */:
          return aLeft + aWidth / 2 - (bLeft + bWidth / 2);
        case "8" /* vertical */:
          return aTop + aHeight / 2 - (bTop + bHeight / 2);
        default:
          return 0;
      }
    });
  }
  _drawingArrangeListener() {
    this.disposeWithMe(
      this._drawingManagerService.order$.subscribe((params) => {
        this._drawingArrange(params);
      })
    );
  }
  _drawingArrange(params) {
    const { unitId, subUnitId, drawingIds } = params;
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (renderObject == null) {
      return;
    }
    const { scene } = renderObject;
    drawingIds.forEach((drawingId) => {
      const oKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
      const drawingShapes = scene.fuzzyMathObjects(oKey, true);
      if (drawingShapes == null || drawingShapes.length === 0) {
        return;
      }
      const index = this._drawingManagerService.getDrawingOrder(unitId, subUnitId).indexOf(drawingId);
      for (const shape of drawingShapes) {
        shape.setProps({ zIndex: index });
        shape.makeDirty();
      }
    });
  }
  _drawingAddListener() {
    this.disposeWithMe(
      this._drawingManagerService.add$.subscribe((params) => {
        this._insertDrawing(params);
      })
    );
  }
  _insertDrawing(params) {
    const sceneList = [];
    params.forEach((param) => {
      const { unitId } = param;
      const drawingParam = this._drawingManagerService.getDrawingByParam(param);
      if (drawingParam == null) {
        return;
      }
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      if (renderObject == null) {
        return;
      }
      const { scene } = renderObject;
      if (!sceneList.includes(scene)) {
        sceneList.push(scene);
      }
    });
    sceneList.forEach((scene) => {
      if (this._sceneListenerOnDrawingMap.has(scene)) {
        return;
      }
      this._addListenerOnDrawing(scene);
      this._sceneListenerOnDrawingMap.add(scene);
    });
  }
  _drawingRemoveListener() {
    this.disposeWithMe(
      this._drawingManagerService.remove$.subscribe((params) => {
        params.forEach((param) => {
          var _a;
          const { unitId, subUnitId, drawingId } = param;
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const { scene } = renderObject;
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const drawingShapes = scene.fuzzyMathObjects(drawingShapeKey, true);
          if (drawingShapes.length > 0) {
            for (const drawingShape of drawingShapes) {
              drawingShape.dispose();
            }
            (_a = scene.getTransformer()) == null ? void 0 : _a.clearSelectedObjects();
          }
        });
      })
    );
  }
  _drawingUpdateListener() {
    this.disposeWithMe(
      this._drawingManagerService.update$.subscribe((params) => {
        params.forEach((param) => {
          var _a;
          const { unitId, subUnitId, drawingId } = param;
          const drawingParam = this._drawingManagerService.getDrawingByParam(param);
          if (drawingParam == null) {
            return;
          }
          const { transform, drawingType } = drawingParam;
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const { scene, transformer } = renderObject;
          if (transform == null) {
            return true;
          }
          const { left = 0, top = 0, width = 0, height = 0, angle = 0, flipX = false, flipY = false, skewX = 0, skewY = 0 } = transform;
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const drawingShape = scene.getObject(drawingShapeKey);
          if (drawingShape == null) {
            return true;
          }
          drawingShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
          (_a = scene.getTransformer()) == null ? void 0 : _a.debounceRefreshControls();
        });
      })
    );
  }
  _drawingRefreshListener() {
    this.disposeWithMe(
      this._drawingManagerService.refreshTransform$.subscribe((params) => {
        params.forEach((param) => {
          const { unitId, subUnitId, drawingId } = param;
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const drawingParam = this._drawingManagerService.getDrawingByParam(param);
          if (drawingParam == null) {
            return;
          }
          const { transform } = drawingParam;
          const { scene } = renderObject;
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const drawingShape = scene.getObject(drawingShapeKey);
          if (drawingShape == null || transform == null) {
            return true;
          }
          const {
            left = 0,
            top = 0,
            width = 0,
            height = 0,
            angle = 0,
            flipX = false,
            flipY = false,
            skewX = 0,
            skewY = 0
          } = transform;
          drawingShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
        });
      })
    );
  }
  _drawingVisibleListener() {
    this.disposeWithMe(
      this._drawingManagerService.visible$.subscribe((params) => {
        params.forEach((param) => {
          const { unitId, subUnitId, drawingId, visible } = param;
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const { scene } = renderObject;
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const drawingShape = scene.getObject(drawingShapeKey);
          if (drawingShape == null) {
            return true;
          }
          if (visible) {
            drawingShape.show();
          } else {
            drawingShape.hide();
          }
        });
      })
    );
  }
  _filterUpdateParams(params, startTransforms) {
    return params.filter((param, index) => {
      if (param == null) {
        return false;
      }
      const { transform } = param;
      return checkIfMove(transform, startTransforms == null ? void 0 : startTransforms[index]);
    });
  }
  // group?.getObjects().forEach((o) => {
  //     const drawing = this._drawingManagerService.getDrawingOKey(o.oKey);
  //     if (drawing != null) {
  //         const { unitId, subUnitId, drawingId } = drawing;
  //         drawings.push({ unitId, subUnitId, drawingId });
  //     }
  // });
  _addListenerOnDrawing(scene) {
    const transformer = scene.getTransformerByCreate();
    let startTransforms = null;
    this.disposeWithMe(
      toDisposable(
        transformer.changeStart$.subscribe((state) => {
          const { objects } = state;
          const objectArray = Array.from(objects.values());
          const drawings = [];
          startTransforms = objectArray.map((object) => {
            const { left, top, height, width, angle, oKey, isInGroup } = object;
            const drawing = this._drawingManagerService.getDrawingOKey(oKey);
            if (isInGroup || object instanceof Group) {
              let group = object.ancestorGroup;
              if (group == null && object instanceof Group) {
                group = object;
              }
              if (group == null) {
                return null;
              }
              const groupDrawing = this._drawingManagerService.getDrawingOKey(group.oKey);
              if (groupDrawing) {
                const { unitId, subUnitId, drawingId } = groupDrawing;
                drawings.push({ unitId, subUnitId, drawingId });
                const { left: left2, top: top2, height: height2, width: width2, angle: angle2 } = group;
                return { left: left2, top: top2, height: height2, width: width2, angle: angle2 };
              }
            } else if (drawing != null) {
              const { unitId, subUnitId, drawingId } = drawing;
              drawings.push({ unitId, subUnitId, drawingId });
              return { left, top, height, width, angle };
            }
            return null;
          }).filter((transform) => transform != null);
          if (drawings.length > 0) {
            this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, drawings);
          } else {
            this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
          }
        })
      )
    );
    this.disposeWithMe(
      toDisposable(
        transformer.changeEnd$.subscribe((state) => {
          const { objects } = state;
          const params = this._filterUpdateParams(getUpdateParams(objects, this._drawingManagerService), startTransforms);
          if (params.length > 0) {
            this._drawingManagerService.featurePluginUpdateNotification(params);
          }
        })
      )
    );
  }
};
DrawingUpdateController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IDrawingManagerService)
], DrawingUpdateController);

// ../packages/drawing-ui/src/views/crop/image-cropper-object.ts
var ImageCropperObject = class extends Shape {
  constructor(key, props) {
    if (props == null) {
      props = {};
    }
    props.transformerConfig = {
      keepRatio: false,
      isCropper: true,
      anchorFill: "rgb(0, 0, 0)",
      anchorStroke: "rgb(255, 255, 255)",
      anchorSize: 24
    };
    super(key, props);
    __publicField(this, "_srcRect");
    __publicField(this, "_prstGeom");
    __publicField(this, "_applyTransform");
    __publicField(this, "_dragPadding", 8);
    __publicField(this, "_cacheCanvas");
    if (props == null ? void 0 : props.srcRect) {
      this._srcRect = props.srcRect;
    }
    if (props == null ? void 0 : props.prstGeom) {
      this._prstGeom = props.prstGeom;
    }
    if (props == null ? void 0 : props.applyTransform) {
      this._applyTransform = props.applyTransform;
    }
    if (props == null ? void 0 : props.dragPadding) {
      this._dragPadding = props.dragPadding;
    }
    this._applyProps();
  }
  refreshSrcRect(value, transform) {
    this._srcRect = value;
    this._applyTransform = transform;
    this._applyProps();
  }
  get srcRect() {
    return this._srcRect;
  }
  dispose() {
    var _a;
    super.dispose();
    (_a = this._cacheCanvas) == null ? void 0 : _a.dispose();
    this._srcRect = null;
  }
  isHit(coord) {
    const oCoord = this.getInverseCoord(coord);
    if (oCoord.x >= -this.strokeWidth / 2 && oCoord.x <= this.width + this.strokeWidth / 2 && oCoord.y >= -this.strokeWidth / 2 && oCoord.y <= this.height + this.strokeWidth / 2 && !this._inSurround(oCoord)) {
      return true;
    }
    return false;
  }
  _inSurround(oCoord) {
    const padding = this._dragPadding;
    if (oCoord.x >= padding - this.strokeWidth / 2 && oCoord.x <= this.width + this.strokeWidth / 2 - padding && oCoord.y >= padding - this.strokeWidth / 2 && oCoord.y <= this.height + this.strokeWidth / 2 - padding) {
      return true;
    }
    return false;
  }
  render(mainCtx, bounds) {
    if (!this.visible) {
      this.makeDirty(false);
      return this;
    }
    mainCtx.save();
    this._draw(mainCtx);
    mainCtx.restore();
    this.makeDirty(false);
    return this;
  }
  _draw(ctx) {
    var _a, _b;
    const scene = this.getScene();
    const engine = scene.getEngine();
    const { width: engineWidth, height: engineHeight } = engine;
    this._initialCacheCanvas();
    (_a = this._cacheCanvas) == null ? void 0 : _a.clear();
    const cacheCtx = (_b = this._cacheCanvas) == null ? void 0 : _b.getContext();
    if (cacheCtx == null) {
      return;
    }
    cacheCtx.save();
    Rect.drawWith(cacheCtx, {
      left: 0,
      top: 0,
      width: engineWidth,
      height: engineHeight,
      fill: "rgba(0, 0, 0, 0.5)"
    });
    cacheCtx.setTransform(ctx.getTransform());
    this._clipForApplyObject(cacheCtx);
    this._applyCache(ctx);
    cacheCtx.restore();
  }
  _clipForApplyObject(cacheCtx) {
    let objectType = 0 /* RECT */;
    if (this._prstGeom != null) {
      objectType = 1 /* PATH */;
    }
    cacheCtx.globalCompositeOperation = "destination-out";
    cacheCtx.beginPath();
    if (objectType === 0 /* RECT */) {
      const m = this.transform.getMatrix();
      cacheCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      cacheCtx.rect(0, 0, this.width, this.height);
      cacheCtx.fill();
    } else {
    }
  }
  _applyProps() {
    if (this._applyTransform == null) {
      return;
    }
    let cropLeft = 0;
    let cropTop = 0;
    let cropRight = 0;
    let cropBottom = 0;
    const { left: applyLeft = 0, top: applyTop = 0, width: applyWidth = 0, height: applyHeight = 0, angle } = this._applyTransform;
    if (this._srcRect != null) {
      const { left: left2 = 0, top: top2 = 0, right = 0, bottom = 0 } = this._srcRect;
      cropLeft = left2;
      cropTop = top2;
      cropRight = right;
      cropBottom = bottom;
    }
    const left = applyLeft + cropLeft;
    const top = applyTop + cropTop;
    this.transformByState({
      left,
      top,
      width: applyLeft + applyWidth - cropRight - left,
      height: applyTop + applyHeight - cropBottom - top,
      angle
    });
  }
  _applyCache(ctx) {
    if (!ctx || this._cacheCanvas == null) {
      return;
    }
    const cacheCtx = this._cacheCanvas.getContext();
    cacheCtx.save();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this._cacheCanvas.getCanvasEle(), 0, 0);
    ctx.restore();
    cacheCtx.restore();
  }
  _initialCacheCanvas() {
    if (this._cacheCanvas != null) {
      return;
    }
    const scene = this.getScene();
    if (scene == null) return;
    this._cacheCanvas = new Canvas();
    const engine = scene.getEngine();
    this._cacheCanvas.setSize(engine.width, engine.height);
    engine.onTransformChange$.subscribeEvent(() => {
      var _a;
      (_a = this._cacheCanvas) == null ? void 0 : _a.setSize(engine.width, engine.height);
      this.makeDirty(true);
    });
  }
};

// ../packages/drawing-ui/src/controllers/image-cropper.controller.ts
var ImageCropperController = class extends Disposable {
  constructor(_commandService, _drawingManagerService, _renderManagerService, _univerInstanceService, _messageService, _localeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sceneListenerOnImageMap", /* @__PURE__ */ new WeakSet());
    this._init();
  }
  _init() {
    this._initOpenCrop();
    this._initCloseCrop();
    this._initAutoCrop();
  }
  _initAutoCrop() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id !== AutoImageCropOperation.id) {
          return;
        }
        const params = command.params;
        if (params == null) {
          return;
        }
        const { cropType } = params;
        const drawingParams = this._drawingManagerService.getFocusDrawings();
        if (drawingParams.length !== 1) {
          return;
        }
        const drawingParam = drawingParams[0];
        const { unitId, subUnitId, drawingId } = drawingParam;
        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject == null ? void 0 : renderObject.scene;
        if (scene == null) {
          return true;
        }
        const imageCropperObject = this._searchCropObject(scene);
        if (imageCropperObject != null) {
          this._commandService.syncExecuteCommand(CloseImageCropOperation.id, { isAuto: true });
        }
        const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
        const imageShape = scene.getObject(imageShapeKey);
        if (!(imageShape instanceof Image)) {
          this._messageService.show({
            type: "error" /* Error */,
            content: this._localeService.t("drawing-ui.image-cropper.error")
          });
          return;
        }
        if (imageShape == null) {
          return;
        }
        this._updateCropperObject(cropType, imageShape);
        this._commandService.executeCommand(OpenImageCropOperation.id, { unitId, subUnitId, drawingId });
      })
    );
  }
  _calculateSrcRectByRatio(left, top, width, height, numerator, denominator) {
    const srcRatio = width / height;
    const ratio = numerator / denominator;
    let newWidth = width;
    let newHeight = height;
    if (srcRatio > ratio) {
      newWidth = height * ratio;
    } else {
      newHeight = width / ratio;
    }
    const newLeft = (width - newWidth) / 2;
    const newTop = (height - newHeight) / 2;
    return {
      left: precisionTo(newLeft, 1),
      top: precisionTo(newTop, 1),
      right: precisionTo(width - (newLeft + newWidth), 1),
      bottom: precisionTo(height - (newTop + newHeight), 1)
    };
  }
  _updateCropperObject(cropType, imageShape) {
    const { left, top, width, height } = imageShape.calculateTransformWithSrcRect();
    let newSrcRect;
    switch (cropType) {
      case "1" /* R1_1 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 1, 1);
        break;
      case "2" /* R16_9 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 16, 9);
        break;
      case "3" /* R9_16 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 9, 16);
        break;
      case "4" /* R5_4 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 5, 4);
        break;
      case "5" /* R4_5 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 5);
        break;
      case "6" /* R4_3 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 4, 3);
        break;
      case "7" /* R3_4 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 4);
        break;
      case "8" /* R3_2 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 3, 2);
        break;
      case "9" /* R2_3 */:
        newSrcRect = this._calculateSrcRectByRatio(left, top, width, height, 2, 3);
        break;
      case "0" /* FREE */:
      default:
        break;
    }
    if (newSrcRect == null) {
      return;
    }
    imageShape.setSrcRect(newSrcRect);
    const { left: newLeft = 0, top: newTop = 0, bottom: newBottom = 0, right: newRight = 0 } = newSrcRect;
    imageShape.transformByStateCloseCropper({
      left: left + newLeft,
      top: top + newTop,
      width: width - newRight - newLeft,
      height: height - newBottom - newTop
    });
  }
  _initOpenCrop() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id !== OpenImageCropOperation.id) {
          return;
        }
        const params = command.params;
        if (params == null) {
          return;
        }
        const { unitId, subUnitId, drawingId } = params;
        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject == null ? void 0 : renderObject.scene;
        if (scene == null) {
          return true;
        }
        if (!this._sceneListenerOnImageMap.has(scene)) {
          this._addListenerOnImage(scene);
          this._sceneListenerOnImageMap.add(scene);
        }
        const imageData = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId });
        if (imageData == null) {
          return;
        }
        const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
        const imageShape = scene.getObject(imageShapeKey);
        if (imageShape == null) {
          return;
        }
        if (!(imageShape instanceof Image)) {
          this._messageService.show({
            type: "error" /* Error */,
            content: this._localeService.t("drawing-ui.image-cropper.error")
          });
          return;
        }
        const transformer = scene.getTransformer();
        transformer == null ? void 0 : transformer.clearControls();
        const imageCropperObject = new ImageCropperObject(`${imageShapeKey}-crop`, {
          srcRect: imageShape.srcRect,
          prstGeom: imageShape.prstGeom,
          applyTransform: imageShape.calculateTransformWithSrcRect()
        });
        scene.addObject(imageCropperObject, imageShape.getLayerIndex() + 1).attachTransformerTo(imageCropperObject);
        transformer == null ? void 0 : transformer.createControlForCopper(imageCropperObject);
        this._addHoverForImageCopper(imageCropperObject);
        imageShape.openRenderByCropper();
        transformer == null ? void 0 : transformer.refreshControls();
        imageCropperObject.makeDirty(true);
        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
      })
    );
  }
  _searchCropObject(scene) {
    const objects = scene.getAllObjectsByOrder();
    for (const object of objects) {
      if (object instanceof ImageCropperObject) {
        return object;
      }
    }
  }
  _initCloseCrop() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id !== CloseImageCropOperation.id) {
          return;
        }
        const currentUnit = this._univerInstanceService.getFocusedUnit();
        if (currentUnit == null) {
          return;
        }
        const unitId = currentUnit.getUnitId();
        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject == null ? void 0 : renderObject.scene;
        if (scene == null) {
          return true;
        }
        const imageCropperObject = this._searchCropObject(scene);
        if (imageCropperObject == null) {
          return;
        }
        const imageShape = this._getApplyObjectByCropObject(imageCropperObject);
        if (imageShape == null) {
          return;
        }
        const transformer = scene.getTransformerByCreate();
        transformer.detachFrom(imageCropperObject);
        transformer.clearCopperControl();
        const srcRect = this._getSrcRectByTransformState(imageShape, imageCropperObject);
        const drawingParam = this._drawingManagerService.getDrawingOKey(imageShape.oKey);
        if (drawingParam != null) {
          const { left, top, height, width } = imageCropperObject;
          this._drawingManagerService.featurePluginUpdateNotification([{
            ...drawingParam,
            transform: {
              ...drawingParam.transform,
              left,
              top,
              height,
              width
            },
            srcRect: srcRect.srcRectAngle
          }]);
        }
        imageShape.setSrcRect({ ...srcRect.srcRectAngle });
        imageShape.closeRenderByCropper();
        imageShape.makeDirty(true);
        imageCropperObject == null ? void 0 : imageCropperObject.dispose();
      })
    );
    const sheetUnit$ = this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(
      switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null))
    );
    this.disposeWithMe(sheetUnit$.subscribe(() => {
      this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
    }));
  }
  _getApplyObjectByCropObject(cropObject) {
    const cropOKey = cropObject.oKey;
    const applyOKey = cropOKey.slice(0, cropOKey.length - 5);
    const scene = cropObject.getScene();
    if (!scene) return null;
    const applyObject = scene.getObject(applyOKey);
    if (applyObject == null) {
      return null;
    }
    return applyObject;
  }
  _addListenerOnImage(scene) {
    const transformer = scene.getTransformerByCreate();
    let startTransform = null;
    this.disposeWithMe(
      transformer.changeStart$.subscribe((state) => {
        const { objects } = state;
        const cropObject = objects.values().next().value;
        if (cropObject == null || !(cropObject instanceof ImageCropperObject)) {
          return;
        }
        const { left, top, height, width, angle } = cropObject;
        startTransform = { left, top, height, width, angle };
        transformer.clearCopperControl();
      })
    );
    this.disposeWithMe(
      transformer.changeEnd$.subscribe((state) => {
        const { objects } = state;
        const cropObject = objects.values().next().value;
        if (cropObject == null || !(cropObject instanceof ImageCropperObject)) {
          return;
        }
        const { left, top, height, width, angle } = cropObject;
        if (!checkIfMove({ left, top, height, width, angle }, startTransform)) {
          return;
        }
        const applyObject = this._getApplyObjectByCropObject(cropObject);
        if (applyObject == null) {
          return;
        }
        const srcRect = this._getSrcRectByTransformState(applyObject, cropObject);
        cropObject.refreshSrcRect(srcRect.srcRect, applyObject.getState());
        transformer.createControlForCopper(cropObject);
      })
    );
    this._endCropListener(scene);
  }
  _addHoverForImageCopper(o) {
    this.disposeWithMe(
      o.onPointerEnter$.subscribeEvent(() => {
        o.cursor = "move" /* MOVE */;
      })
    );
    this.disposeWithMe(
      o.onPointerLeave$.subscribeEvent(() => {
        o.cursor = "default" /* DEFAULT */;
      })
    );
  }
  _endCropListener(scene) {
    const transformer = scene.getTransformerByCreate();
    this.disposeWithMe(
      transformer.clearControl$.subscribe((changeSelf) => {
        if (changeSelf === true) {
          this._commandService.syncExecuteCommand(CloseImageCropOperation.id);
        }
      })
    );
  }
  _getSrcRectByTransformState(applyObject, imageCropperObject) {
    const { left, top, height, width, strokeWidth, angle: copperAngle } = imageCropperObject;
    const { left: applyLeft, top: applyTop, width: applyWidth, height: applyHeight, angle: applyAngle, strokeWidth: applyStrokeWidth } = applyObject;
    const newLeft = left - applyLeft;
    const newTop = top - applyTop;
    const srcRect = {
      left: newLeft,
      top: newTop,
      right: applyWidth - newLeft - width,
      bottom: applyHeight - newTop - height
    };
    const srcRectAngle = { ...srcRect };
    if (applyAngle !== 0) {
      const cx = left + width / 2;
      const cy = top + height / 2;
      const centerPoint = new Vector2(cx, cy);
      const newCx = applyWidth / 2 + applyLeft;
      const newCy = applyHeight / 2 + applyTop;
      const newCenterPoint = new Vector2(newCx, newCy);
      const vertexPoint = new Vector2(applyLeft, applyTop);
      vertexPoint.rotateByPoint(degToRad(applyAngle), newCenterPoint);
      const applyFinalPoint = vertexPoint.clone();
      applyFinalPoint.rotateByPoint(degToRad(-applyAngle), centerPoint);
      const newAngleLeft = left - applyFinalPoint.x;
      const newAngleTop = top - applyFinalPoint.y;
      srcRectAngle.left = newAngleLeft;
      srcRectAngle.top = newAngleTop;
      srcRectAngle.right = applyWidth - newAngleLeft - width;
      srcRectAngle.bottom = applyHeight - newAngleTop - height;
    }
    return {
      srcRect,
      srcRectAngle
    };
  }
};
ImageCropperController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IDrawingManagerService),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService),
  __decorateParam(4, IMessageService),
  __decorateParam(5, Inject(LocaleService))
], ImageCropperController);

// ../packages/drawing-ui/src/services/drawing-image-clip.service.ts
var IMAGE_CLIP_SHAPE_PICKER_COMPONENT = "sheet.image-clip.shape.picker.component";
var DrawingImageClipService = class extends Disposable {
  constructor() {
    super();
    __publicField(this, "_clipDelegate", null);
    __publicField(this, "_canUseShapeClip$", new BehaviorSubject(false));
    __publicField(this, "canUseShapeClip$", this._canUseShapeClip$.asObservable());
  }
  setCanUseShapeClip(canUse) {
    this._canUseShapeClip$.next(canUse);
  }
  /**
   * Register a clip delegate that knows how to build shape clip paths.
   * Typically called by the pro-side plugin with a ShapeModel-based implementation.
   * @returns IDisposable to unregister the delegate
   */
  registerClipDelegate(delegate) {
    this._clipDelegate = delegate;
    return toDisposable(() => {
      if (this._clipDelegate === delegate) {
        this._clipDelegate = null;
      }
    });
  }
  applyShapeClip(ctx, prstGeom, width, height, adjustValues) {
    if (this._clipDelegate) {
      return this._clipDelegate(ctx, prstGeom, width, height, adjustValues);
    }
    return false;
  }
  dispose() {
    this._clipDelegate = null;
    this._canUseShapeClip$.complete();
    super.dispose();
  }
};

// ../packages/drawing-ui/src/services/drawing-render.service.ts
var DrawingRenderService = class {
  constructor(_drawingManagerService, _imageIoService, _galleryService, _urlImageService, _univerInstanceService, _drawingImageClipService) {
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_imageIoService", _imageIoService);
    __publicField(this, "_galleryService", _galleryService);
    __publicField(this, "_urlImageService", _urlImageService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_drawingImageClipService", _drawingImageClipService);
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  async renderImages(imageParam, scene) {
    const {
      transform: singleTransform,
      drawingType,
      source,
      imageSourceType,
      srcRect,
      prstGeom,
      groupId,
      unitId,
      subUnitId,
      drawingId,
      isMultiTransform,
      transforms: multiTransforms,
      adjustValues,
      hidden
    } = imageParam;
    if (drawingType !== 0 /* DRAWING_IMAGE */) {
      return;
    }
    if (!this._drawingManagerService.getDrawingVisible()) {
      return;
    }
    if (this._univerInstanceService.getUnitType(unitId) === 2 /* UNIVER_SHEET */ && subUnitId !== this._getActiveSheetId()) {
      return;
    }
    if (singleTransform == null) {
      return;
    }
    const transforms = isMultiTransform && multiTransforms ? multiTransforms : [singleTransform];
    const images = [];
    for (const transform of transforms) {
      const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
      const index = transforms.indexOf(transform);
      const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId }, isMultiTransform ? index : void 0);
      const imageShape = scene.getObject(imageShapeKey);
      if (imageShape != null) {
        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
        continue;
      }
      const orders = this._drawingManagerService.getDrawingOrder(unitId, subUnitId);
      const zIndex = orders.indexOf(drawingId);
      const imageConfig = { ...transform, zIndex: zIndex === -1 ? orders.length - 1 : zIndex };
      const imageNativeCache = this._imageIoService.getImageSourceCache(source, imageSourceType);
      let shouldBeCache = false;
      if (imageNativeCache != null) {
        imageConfig.image = imageNativeCache;
      } else {
        if (imageSourceType === "UUID" /* UUID */) {
          try {
            imageConfig.url = await this._imageIoService.getImage(source);
          } catch (error) {
            console.error(error);
            continue;
          }
        } else if (imageSourceType === "URL" /* URL */) {
          try {
            imageConfig.url = await this._urlImageService.getImage(source);
          } catch (error) {
            console.error(error);
            imageConfig.url = source;
          }
          shouldBeCache = true;
        } else {
          imageConfig.url = source;
          shouldBeCache = true;
        }
      }
      if (hidden) {
        imageConfig.visible = false;
      }
      if (scene.getObject(imageShapeKey)) {
        continue;
      }
      imageConfig.printable = true;
      const image = new Image(imageShapeKey, imageConfig);
      image.setClipService(this._drawingImageClipService);
      if (shouldBeCache) {
        this._imageIoService.addImageSourceCache(source, imageSourceType, image.getNative());
      }
      scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX);
      if (this._drawingManagerService.getDrawingEditable()) {
        scene.attachTransformerTo(image);
      }
      groupId && insertGroupObject({ drawingId: groupId, unitId, subUnitId }, image, scene, this._drawingManagerService);
      if (prstGeom != null) {
        image.setPrstGeom(prstGeom);
      }
      if (adjustValues != null) {
        image.setPrstGeomAdjValues(adjustValues);
      }
      if (srcRect != null) {
        image.setSrcRect(srcRect);
      }
      images.push(image);
    }
    return images;
  }
  _getActiveSheetId() {
    var _a, _b;
    return (_b = (_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getActiveSheet()) == null ? void 0 : _b.getSheetId();
  }
  renderFloatDom(param, scene) {
    const {
      transform: singleTransform,
      drawingType,
      groupId,
      unitId,
      subUnitId,
      drawingId,
      isMultiTransform,
      transforms: multiTransforms
    } = param;
    if (drawingType !== 8 /* DRAWING_DOM */) {
      return;
    }
    if (!this._drawingManagerService.getDrawingVisible()) {
      return;
    }
    if (singleTransform == null) {
      return;
    }
    const transforms = isMultiTransform && multiTransforms ? multiTransforms : [singleTransform];
    const rects = [];
    for (const transform of transforms) {
      const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
      const index = transforms.indexOf(transform);
      const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId }, isMultiTransform ? index : void 0);
      const imageShape = scene.getObject(imageShapeKey);
      if (imageShape != null) {
        imageShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
        continue;
      }
      const orders = this._drawingManagerService.getDrawingOrder(unitId, subUnitId);
      const zIndex = orders.indexOf(drawingId);
      const rectConfig = { ...transform, zIndex: zIndex === -1 ? orders.length - 1 : zIndex };
      if (scene.getObject(imageShapeKey)) {
        continue;
      }
      rectConfig.printable = false;
      const rect = new Rect(imageShapeKey, rectConfig);
      if (!this._drawingManagerService.getDrawingVisible()) {
        continue;
      }
      scene.addObject(rect, DRAWING_OBJECT_LAYER_INDEX);
      if (this._drawingManagerService.getDrawingEditable() && param.allowTransform !== false) {
        scene.attachTransformerTo(rect);
      }
      groupId && insertGroupObject({ drawingId: groupId, unitId, subUnitId }, rect, scene, this._drawingManagerService);
      rects.push(rect);
    }
    return rects;
  }
  renderDrawing(param, scene) {
    const drawingParam = this._drawingManagerService.getDrawingByParam(param);
    if (drawingParam == null) {
      return;
    }
    switch (drawingParam.drawingType) {
      case 0 /* DRAWING_IMAGE */:
        return this.renderImages(drawingParam, scene);
      default:
    }
  }
  previewImage(key, src, width, height) {
    this._galleryService.open({
      images: [src],
      onOpenChange: (open) => {
        if (!open) {
          this._galleryService.close();
        }
      }
    });
  }
  _adjustImageSize(nativeWidth, nativeHeight, screenWidth, screenHeight) {
    if (nativeWidth <= screenWidth && nativeHeight <= screenHeight) {
      return {
        width: nativeWidth,
        height: nativeHeight
      };
    }
    const widthRatio = screenWidth / nativeWidth;
    const heightRatio = screenHeight / nativeHeight;
    const scale = Math.min(widthRatio, heightRatio);
    return {
      width: Math.floor(nativeWidth * scale),
      height: Math.floor(nativeHeight * scale)
    };
  }
};
DrawingRenderService = __decorateClass([
  __decorateParam(0, IDrawingManagerService),
  __decorateParam(1, IImageIoService),
  __decorateParam(2, IGalleryService),
  __decorateParam(3, IURLImageService),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, Inject(DrawingImageClipService))
], DrawingRenderService);

// ../packages/drawing-ui/src/controllers/image-update.controller.ts
var ImageUpdateController = class extends Disposable {
  constructor(_commandService, _renderManagerService, _drawingManagerService, _dialogService, _imageIoService, _currentUniverService, _drawingRenderService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_imageIoService", _imageIoService);
    __publicField(this, "_currentUniverService", _currentUniverService);
    __publicField(this, "_drawingRenderService", _drawingRenderService);
    this._initialize();
  }
  dispose() {
    super.dispose();
  }
  _initialize() {
    this._drawingAddListener();
    this._commandExecutedListener();
    this._imageUpdateListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id === ImageResetSizeOperation.id) {
          const params = command.params;
          if (params == null) {
            return;
          }
          this._resetImageSize(params);
        }
      })
    );
  }
  _getSceneAndTransformerByDrawingSearch(unitId) {
    if (unitId == null) {
      return;
    }
    const renderObject = this._renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return null;
    }
    const transformer = scene.getTransformerByCreate();
    return { scene, transformer };
  }
  _resetImageSize(params) {
    const updateParams = [];
    const sceneList = [];
    params.forEach((param) => {
      const { unitId, subUnitId, drawingId } = param;
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      if (renderObject == null) {
        return;
      }
      const { scene } = renderObject;
      const imageShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
      const imageShape = scene.getObject(imageShapeKey);
      if (imageShape == null) {
        return true;
      }
      const imageData = this._drawingManagerService.getDrawingByParam(param);
      if (imageData == null) {
        return true;
      }
      if (imageData.drawingType !== 0 /* DRAWING_IMAGE */) {
        return;
      }
      imageShape.resetSize();
      const { width, height } = imageShape.getNativeSize();
      if (sceneList.includes(scene) === false) {
        sceneList.push(scene);
      }
      updateParams.push({
        ...imageData,
        transform: {
          ...imageData.transform,
          height,
          width,
          angle: 0
        },
        srcRect: null,
        prstGeom: null
      });
    });
    this._drawingManagerService.featurePluginUpdateNotification(updateParams);
    sceneList.forEach((scene) => {
      const transformer = scene.getTransformerByCreate();
      transformer.refreshControls().changeNotification();
    });
    this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, params);
  }
  _drawingAddListener() {
    this.disposeWithMe(
      this._drawingManagerService.add$.pipe(
        bufferTime(33),
        filter((batches) => batches.length > 0),
        map((batches) => batches.flat()),
        map((items) => {
          const map2 = /* @__PURE__ */ new Map();
          for (const it of items) {
            map2.set(`${it.unitId}|${it.subUnitId}|${it.drawingId}`, it);
          }
          return [...map2.values()];
        }),
        filter((items) => items.length > 0)
      ).subscribe((uniqueParams) => {
        void this._insertImages(uniqueParams);
      })
    );
  }
  _insertImages(params) {
    params.forEach(async (param) => {
      var _a;
      const { unitId, subUnitId } = param;
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      const currentSubUnitId = (_a = getCurrentUnitInfo(this._currentUniverService, unitId)) == null ? void 0 : _a.subUnitId;
      if (renderObject == null || currentSubUnitId !== subUnitId) {
        return;
      }
      const imageParam = this._drawingManagerService.getDrawingByParam(param);
      if (imageParam == null) {
        return;
      }
      const images = await this._drawingRenderService.renderImages(imageParam, renderObject.scene);
      this._drawingManagerService.refreshTransform([imageParam]);
      if (images == null || images.length === 0) {
        return;
      }
      for (const image of images) {
        this._addHoverForImage(image);
        this._addDialogForImage(image);
      }
    });
  }
  _imageUpdateListener() {
    this.disposeWithMe(
      this._drawingManagerService.update$.subscribe((params) => {
        params.forEach((param) => {
          const { unitId, subUnitId, drawingId } = param;
          const drawingParam = this._drawingManagerService.getDrawingByParam(param);
          if (drawingParam == null) {
            return;
          }
          const { transform, drawingType, srcRect, prstGeom, source, imageSourceType } = drawingParam;
          if (drawingType !== 0 /* DRAWING_IMAGE */) {
            return;
          }
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const { scene, transformer } = renderObject;
          if (transform == null) {
            return true;
          }
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const imageShape = scene.getObject(drawingShapeKey);
          if (imageShape == null) {
            return true;
          }
          imageShape.setSrcRect(srcRect);
          imageShape.setPrstGeom(prstGeom);
          if (source != null && source.length > 0 && (imageSourceType === "BASE64" /* BASE64 */ || imageSourceType === "URL" /* URL */)) {
            imageShape.changeSource(source);
          }
        });
      })
    );
  }
  _addHoverForImage(o) {
    this.disposeWithMe(
      toDisposable(
        o.onPointerEnter$.subscribeEvent(() => {
          o.cursor = "grab" /* GRAB */;
        })
      )
    );
    this.disposeWithMe(
      toDisposable(
        o.onPointerLeave$.subscribeEvent(() => {
          o.cursor = "default" /* DEFAULT */;
        })
      )
    );
  }
  _addDialogForImage(o) {
    this.disposeWithMe(
      toDisposable(
        o.onDblclick$.subscribeEvent(() => {
          const dialogId = `${o.oKey}-viewer-dialog`;
          this._drawingRenderService.previewImage(dialogId, o.getNative().src, o.getNativeSize().width, o.getNativeSize().height);
        })
      )
    );
  }
};
ImageUpdateController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IImageIoService),
  __decorateParam(5, IUniverInstanceService),
  __decorateParam(6, Inject(DrawingRenderService))
], ImageUpdateController);

// ../packages/drawing-ui/src/plugin.ts
var UniverDrawingUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig3, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig3,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(DRAWING_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    this._initDependencies();
  }
  onRendered() {
    this._injector.get(DrawingUpdateController);
    this._injector.get(DrawingUIController);
    this._injector.get(ImageCropperController);
    this._injector.get(ImageUpdateController);
  }
  _initDependencies() {
    const dependencies = [
      [DrawingImageClipService],
      [DrawingRenderService],
      [DrawingUpdateController],
      [DrawingUIController],
      [ImageCropperController],
      [ImageUpdateController]
    ];
    dependencies.forEach((dependency) => this._injector.add(dependency));
  }
};
__publicField(UniverDrawingUIPlugin, "pluginName", "UNIVER_DRAWING_UI_PLUGIN");
__publicField(UniverDrawingUIPlugin, "packageName", package_default3.name);
__publicField(UniverDrawingUIPlugin, "version", package_default3.version);
UniverDrawingUIPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverDrawingUIPlugin);

// ../packages/drawing-ui/src/views/panel/DrawingCommonPanel.tsx
var import_react7 = __toESM(require_react());

// ../packages/drawing-ui/src/views/panel/DrawingAlign.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var DrawingAlign = (props) => {
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const { drawings, alignShow } = props;
  const [alignValue, setAlignValue] = (0, import_react2.useState)("0" /* default */);
  const alignOptions = [
    {
      label: localeService.t("drawing-ui.image-panel.align.default"),
      value: "0" /* default */
    },
    {
      options: [
        {
          label: localeService.t("drawing-ui.image-panel.align.left"),
          value: "1" /* left */
        },
        {
          label: localeService.t("drawing-ui.image-panel.align.center"),
          value: "2" /* center */
        },
        {
          label: localeService.t("drawing-ui.image-panel.align.right"),
          value: "3" /* right */
        }
      ]
    },
    {
      options: [
        {
          label: localeService.t("drawing-ui.image-panel.align.top"),
          value: "4" /* top */
        },
        {
          label: localeService.t("drawing-ui.image-panel.align.middle"),
          value: "5" /* middle */
        },
        {
          label: localeService.t("drawing-ui.image-panel.align.bottom"),
          value: "6" /* bottom */
        }
      ]
    },
    {
      options: [
        {
          label: localeService.t("drawing-ui.image-panel.align.horizon"),
          value: "7" /* horizon */
        },
        {
          label: localeService.t("drawing-ui.image-panel.align.vertical"),
          value: "8" /* vertical */
        }
      ]
    }
  ];
  function handleAlignChange(value) {
    setAlignValue(value);
    commandService.executeCommand(SetDrawingAlignOperation.id, {
      alignType: value,
      drawings
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: clsx("univer-relative univer-w-full", {
        "univer-hidden": !alignShow
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: localeService.t("drawing-ui.image-panel.align.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: `univer-w-full univer-text-gray-900 dark:!univer-text-white`,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Select, { value: alignValue, options: alignOptions, onChange: handleAlignChange })
          }
        ) })
      ]
    }
  );
};

// ../packages/drawing-ui/src/views/panel/DrawingArrange.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var DrawingArrange = (props) => {
  const { arrangeShow, drawings: focusDrawings } = props;
  const localeService = useDependency(LocaleService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const commandService = useDependency(ICommandService);
  const componentManager = useDependency(ComponentManager);
  const MoveUpIcon2 = componentManager.get("MoveUpIcon");
  const MoveDownIcon2 = componentManager.get("MoveDownIcon");
  const TopmostIcon2 = componentManager.get("TopmostIcon");
  const BottomIcon2 = componentManager.get("BottomIcon");
  const [drawings, setDrawings] = (0, import_react3.useState)(focusDrawings);
  (0, import_react3.useEffect)(() => {
    const focusDispose = drawingManagerService.focus$.subscribe((drawings2) => {
      setDrawings(drawings2);
    });
    return () => {
      focusDispose.unsubscribe();
    };
  }, []);
  const onArrangeBtnClick = (arrangeType) => {
    commandService.syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType, drawings });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !arrangeShow
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("drawing-ui.image-panel.arrange.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-grid univer-grid-cols-2 univer-gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { onClick: () => {
            onArrangeBtnClick(0 /* forward */);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveUpIcon2, {}),
            localeService.t("drawing-ui.image-panel.arrange.forward")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { onClick: () => {
            onArrangeBtnClick(1 /* backward */);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoveDownIcon2, {}),
            localeService.t("drawing-ui.image-panel.arrange.backward")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { onClick: () => {
            onArrangeBtnClick(2 /* front */);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TopmostIcon2, {}),
            localeService.t("drawing-ui.image-panel.arrange.front")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Button, { onClick: () => {
            onArrangeBtnClick(3 /* back */);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BottomIcon2, {}),
            localeService.t("drawing-ui.image-panel.arrange.back")
          ] })
        ] })
      ]
    }
  );
};

// ../packages/drawing-ui/src/views/panel/DrawingGroup.tsx
var import_react4 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var DrawingGroup = (props) => {
  const localeService = useDependency(LocaleService);
  const renderManagerService = useDependency(IRenderManagerService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const commandService = useDependency(ICommandService);
  const componentManager = useDependency(ComponentManager);
  const { hasGroup, drawings } = props;
  const GroupIcon2 = componentManager.get("GroupIcon");
  const UngroupIcon2 = componentManager.get("UngroupIcon");
  const [groupShow, setGroupShow] = (0, import_react4.useState)(false);
  const [groupBtnShow, setGroupBtnShow] = (0, import_react4.useState)(true);
  const [ungroupBtnShow, setUngroupBtnShow] = (0, import_react4.useState)(true);
  const onGroupBtnClick = () => {
    commandService.syncExecuteCommand(SetDrawingGroupOperation.id, { drawings });
  };
  const onUngroupBtnClick = () => {
    commandService.syncExecuteCommand(CancelDrawingGroupOperation.id, { drawings });
  };
  (0, import_react4.useEffect)(() => {
    const drawingParam = drawings[0];
    if (drawingParam == null) {
      return;
    }
    const { unitId } = drawingParam;
    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return;
    }
    const transformer = scene.getTransformerByCreate();
    const onClearControlObserver = transformer.clearControl$.subscribe((changeSelf) => {
      if (changeSelf === true) {
        setGroupShow(false);
      }
    });
    const onChangeStartObserver = transformer.changeStart$.subscribe((state) => {
      const { objects } = state;
      const params = getUpdateParams(objects, drawingManagerService);
      const groupParams = params.filter((o) => (o == null ? void 0 : o.drawingType) === 6 /* DRAWING_GROUP */);
      let groupBtnShow2 = false;
      let ungroupBtnShow2 = false;
      if (params.length > 1) {
        groupBtnShow2 = true;
      }
      if (groupParams.length > 0) {
        ungroupBtnShow2 = true;
      }
      const groupShow2 = groupBtnShow2 || ungroupBtnShow2;
      setGroupShow(groupShow2);
      setGroupBtnShow(groupBtnShow2);
      setUngroupBtnShow(ungroupBtnShow2);
    });
    return () => {
      onChangeStartObserver.unsubscribe();
      onClearControlObserver.unsubscribe();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": hasGroup === true && groupShow === false || hasGroup === false
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: localeService.t("drawing-ui.image-panel.group.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-flex univer-items-center univer-justify-center univer-gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              className: clsx({
                "univer-hidden": !groupBtnShow
              }),
              onClick: onGroupBtnClick,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(GroupIcon2, {}),
                localeService.t("drawing-ui.image-panel.group.group")
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            Button,
            {
              className: clsx({
                "univer-hidden": !ungroupBtnShow
              }),
              onClick: onUngroupBtnClick,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(UngroupIcon2, {}),
                localeService.t("drawing-ui.image-panel.group.unGroup")
              ]
            }
          )
        ] })
      ]
    }
  );
};

// ../packages/drawing-ui/src/views/panel/DrawingTransform.tsx
var import_react5 = __toESM(require_react());

// ../packages/drawing-ui/src/utils/config.ts
var MIN_DRAWING_WIDTH_LIMIT = 20;
var MIN_DRAWING_HEIGHT_LIMIT = 20;
var RANGE_DRAWING_ROTATION_LIMIT = [-360, 360];

// ../packages/drawing-ui/src/views/panel/DrawingTransform.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var INPUT_DEBOUNCE_TIME = 300;
var DrawingTransform = (props) => {
  var _a;
  const localeService = useDependency(LocaleService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const renderManagerService = useDependency(IRenderManagerService);
  const { drawings, transformShow } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return;
  }
  const transform = drawingParam.transform;
  if (transform == null) {
    return;
  }
  const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
  const renderObject = renderManagerService.getRenderById(unitId);
  const scene = renderObject == null ? void 0 : renderObject.scene;
  if (scene == null) {
    return;
  }
  const topScene = (_a = scene.getEngine()) == null ? void 0 : _a.activeScene;
  if (topScene == null) {
    return;
  }
  const transformer = scene.getTransformerByCreate();
  const {
    width: originWidth = 0,
    height: originHeight = 0,
    left: originX = 0,
    top: originY = 0,
    angle: originRotation = 0
  } = transform;
  const [width, setWidth] = (0, import_react5.useState)(originWidth);
  const [height, setHeight] = (0, import_react5.useState)(originHeight);
  const [xPosition, setXPosition] = (0, import_react5.useState)(originX);
  const [yPosition, setYPosition] = (0, import_react5.useState)(originY);
  const [rotation, setRotation] = (0, import_react5.useState)(originRotation);
  const [lockRatio, setLockRatio] = (0, import_react5.useState)(transformer.keepRatio);
  const checkMoveBoundary = (left, top, width2, height2) => {
    const { width: topSceneWidth, height: topSceneHeight } = topScene;
    const { ancestorLeft, ancestorTop } = scene;
    let limitLeft = left;
    let limitTop = top;
    let limitWidth = width2;
    let limitHeight = height2;
    if (left + ancestorLeft < 0) {
      limitLeft = -ancestorLeft;
    }
    if (top + ancestorTop < 0) {
      limitTop = -ancestorTop;
    }
    limitWidth = topSceneWidth - limitLeft - ancestorLeft;
    if (limitWidth < MIN_DRAWING_WIDTH_LIMIT) {
      limitWidth = MIN_DRAWING_WIDTH_LIMIT;
    }
    limitHeight = topSceneHeight - limitTop - ancestorTop;
    if (limitHeight < MIN_DRAWING_HEIGHT_LIMIT) {
      limitHeight = MIN_DRAWING_HEIGHT_LIMIT;
    }
    if (left + limitWidth + ancestorLeft > topSceneWidth) {
      limitLeft = topSceneWidth - width2 - ancestorLeft;
    }
    if (top + limitHeight + ancestorTop > topSceneHeight) {
      limitTop = topSceneHeight - height2 - ancestorTop;
    }
    return {
      limitLeft,
      limitTop,
      limitWidth,
      limitHeight
    };
  };
  const changeObs = (state) => {
    const { objects } = state;
    const params = getUpdateParams(objects, drawingManagerService);
    if (params.length !== 1) {
      return;
    }
    const drawingParam2 = params[0];
    if (drawingParam2 == null) {
      return;
    }
    const { transform: transform2 } = drawingParam2;
    if (transform2 == null) {
      return;
    }
    const {
      width: originWidth2,
      height: originHeight2,
      left: originX2,
      top: originY2,
      angle: originRotation2
    } = transform2;
    if (originWidth2 != null) {
      setWidth(originWidth2);
    }
    if (originHeight2 != null) {
      setHeight(originHeight2);
    }
    if (originX2 != null) {
      setXPosition(originX2);
    }
    if (originY2 != null) {
      setYPosition(originY2);
    }
    if (originRotation2 != null) {
      setRotation(originRotation2);
    }
  };
  (0, import_react5.useEffect)(() => {
    const subscriptions = [
      transformer.changeStart$.subscribe((state) => {
        changeObs(state);
      }),
      transformer.changing$.subscribe((state) => {
        changeObs(state);
      }),
      transformer.changeEnd$.subscribe((state) => {
        changeObs(state);
      }),
      drawingManagerService.focus$.subscribe((drawings2) => {
        if (drawings2.length !== 1) {
          return;
        }
        const drawingParam2 = drawingManagerService.getDrawingByParam(drawings2[0]);
        if (drawingParam2 == null) {
          return;
        }
        const transform2 = drawingParam2.transform;
        if (transform2 == null) {
          return;
        }
        const {
          width: originWidth2,
          height: originHeight2,
          left: originX2,
          top: originY2,
          angle: originRotation2
        } = transform2;
        if (originWidth2 != null) {
          setWidth(originWidth2);
        }
        if (originHeight2 != null) {
          setHeight(originHeight2);
        }
        if (originX2 != null) {
          setXPosition(originX2);
        }
        if (originY2 != null) {
          setYPosition(originY2);
        }
        if (originRotation2 != null) {
          setRotation(originRotation2);
        }
      })
    ];
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, []);
  const handleWidthChange = debounce_default((val) => {
    if (val == null) {
      return;
    }
    const { limitWidth, limitHeight } = checkMoveBoundary(xPosition, yPosition, val, height);
    val = Math.min(val, limitWidth);
    const updateParam = { unitId, subUnitId, drawingId, drawingType, transform: { width: val } };
    if (lockRatio) {
      let heightFix = val / width * height;
      heightFix = Math.max(heightFix, MIN_DRAWING_HEIGHT_LIMIT);
      if (heightFix > limitHeight) {
        return;
      }
      setHeight(heightFix);
      updateParam.transform.height = heightFix;
    }
    setWidth(val);
    drawingManagerService.featurePluginUpdateNotification([updateParam]);
    transformer.refreshControls().changeNotification();
  }, INPUT_DEBOUNCE_TIME);
  const handleHeightChange = debounce_default((val) => {
    if (val == null) {
      return;
    }
    const { limitHeight, limitWidth } = checkMoveBoundary(xPosition, yPosition, width, val);
    val = Math.min(val, limitHeight);
    const updateParam = { unitId, subUnitId, drawingId, drawingType, transform: { height: val } };
    if (lockRatio) {
      let widthFix = val / height * width;
      widthFix = Math.max(widthFix, MIN_DRAWING_WIDTH_LIMIT);
      if (widthFix > limitWidth) {
        return;
      }
      setWidth(widthFix);
      updateParam.transform.width = widthFix;
    }
    setHeight(val);
    drawingManagerService.featurePluginUpdateNotification([updateParam]);
    transformer.refreshControls().changeNotification();
  }, INPUT_DEBOUNCE_TIME);
  const handleXChange = debounce_default((val) => {
    if (val == null) {
      return;
    }
    const { limitLeft } = checkMoveBoundary(val, yPosition, width, height);
    val = limitLeft;
    const updateParam = { unitId, subUnitId, drawingId, drawingType, transform: { left: val } };
    setXPosition(val);
    drawingManagerService.featurePluginUpdateNotification([updateParam]);
    transformer.refreshControls().changeNotification();
  }, INPUT_DEBOUNCE_TIME);
  const handleYChange = debounce_default((val) => {
    if (val == null) {
      return;
    }
    const { limitTop } = checkMoveBoundary(xPosition, val, width, height);
    val = limitTop;
    const updateParam = { unitId, subUnitId, drawingId, drawingType, transform: { top: val } };
    setYPosition(val);
    drawingManagerService.featurePluginUpdateNotification([updateParam]);
    transformer.refreshControls().changeNotification();
  }, INPUT_DEBOUNCE_TIME);
  const handleRotationChange = (val) => {
    if (val == null) {
      return;
    }
    const updateParam = { unitId, subUnitId, drawingId, drawingType, transform: { angle: val } };
    setRotation(val);
    drawingManagerService.featurePluginUpdateNotification([updateParam]);
    transformer.refreshControls().changeNotification();
  };
  const handleLockRatioChange = (val) => {
    setLockRatio(val);
    transformer.keepRatio = val;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !transformShow
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: localeService.t("drawing-ui.image-panel.transform.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-3 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.width") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  InputNumber,
                  {
                    precision: 1,
                    value: width,
                    min: MIN_DRAWING_WIDTH_LIMIT,
                    onChange: (val) => {
                      handleWidthChange(val);
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.height") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  InputNumber,
                  {
                    precision: 1,
                    value: height,
                    min: MIN_DRAWING_HEIGHT_LIMIT,
                    onChange: (val) => {
                      handleHeightChange(val);
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.lock") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "univer-text-center", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: lockRatio, onChange: handleLockRatioChange }) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-3 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.x") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(InputNumber, { precision: 1, value: xPosition, onChange: (val) => {
                  handleXChange(val);
                } })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.y") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(InputNumber, { precision: 1, value: yPosition, onChange: (val) => {
                  handleYChange(val);
                } })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("drawing-ui.image-panel.transform.rotate") }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  InputNumber,
                  {
                    precision: 1,
                    value: rotation,
                    min: RANGE_DRAWING_ROTATION_LIMIT[0],
                    max: RANGE_DRAWING_ROTATION_LIMIT[1],
                    onChange: handleRotationChange
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};

// ../packages/drawing-ui/src/views/panel/ImageCropper.tsx
var import_react6 = __toESM(require_react());
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var ImageCropper = (props) => {
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const clipService = useDependency(DrawingImageClipService);
  const componentManager = useDependency(ComponentManager);
  const canUseShapeClip = useObservable(clipService.canUseShapeClip$, false);
  const { drawings, cropperShow } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return;
  }
  const [cropValue, setCropValue] = (0, import_react6.useState)("0" /* FREE */);
  const cropStateRef = (0, import_react6.useRef)(false);
  const cropOptions = [
    {
      label: localeService.t("drawing-ui.image-panel.crop.mode"),
      value: "0" /* FREE */
    },
    {
      label: "1:1",
      value: "1" /* R1_1 */
    },
    {
      label: "16:9",
      value: "2" /* R16_9 */
    },
    {
      label: "9:16",
      value: "3" /* R9_16 */
    },
    {
      label: "5:4",
      value: "4" /* R5_4 */
    },
    {
      label: "4:5",
      value: "5" /* R4_5 */
    },
    {
      label: "4:3",
      value: "6" /* R4_3 */
    },
    {
      label: "3:4",
      value: "7" /* R3_4 */
    },
    {
      label: "3:2",
      value: "8" /* R3_2 */
    },
    {
      label: "2:3",
      value: "9" /* R2_3 */
    }
  ];
  (0, import_react6.useEffect)(() => {
    const onChangeStartObserver = commandService.onCommandExecuted((command) => {
      if (command.id === CloseImageCropOperation.id) {
        const params = command.params;
        if (!(params == null ? void 0 : params.isAuto)) {
          cropStateRef.current = false;
        }
      }
    });
    return () => {
      onChangeStartObserver == null ? void 0 : onChangeStartObserver.dispose();
    };
  }, []);
  function handleCropChange(value) {
    setCropValue(value);
    if (cropStateRef.current) {
      commandService.executeCommand(AutoImageCropOperation.id, {
        cropType: value
      });
    }
  }
  const onCropperBtnClick = (val) => {
    commandService.executeCommand(AutoImageCropOperation.id, {
      cropType: val
    });
    cropStateRef.current = true;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !cropperShow
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { children: localeService.t("drawing-ui.image-panel.crop.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "univer-flex univer-items-center univer-justify-center univer-gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Button, { onClick: () => {
            onCropperBtnClick(cropValue);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CreateCopyIcon, {}),
            localeService.t("drawing-ui.image-panel.crop.start")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Select, { value: cropValue, options: cropOptions, onChange: handleCropChange })
        ] }),
        canUseShapeClip && (() => {
          const ShapeClipPicker = componentManager.get(IMAGE_CLIP_SHAPE_PICKER_COMPONENT);
          return ShapeClipPicker ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ShapeClipPicker, {}) : null;
        })()
      ]
    }
  );
};

// ../packages/drawing-ui/src/views/panel/DrawingCommonPanel.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var DrawingCommonPanel = (props) => {
  const drawingManagerService = useDependency(IDrawingManagerService);
  const renderManagerService = useDependency(IRenderManagerService);
  const localeService = useDependency(LocaleService);
  const { drawings, hasArrange = true, hasTransform = true, hasAlign = true, hasCropper = true, hasGroup = true } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return;
  }
  const { unitId } = drawingParam;
  const renderObject = renderManagerService.getRenderById(unitId);
  const scene = renderObject == null ? void 0 : renderObject.scene;
  if (scene == null) {
    return;
  }
  const transformer = scene.getTransformerByCreate();
  const [arrangeShow, setArrangeShow] = (0, import_react7.useState)(true);
  const [transformShow, setTransformShow] = (0, import_react7.useState)(true);
  const [alignShow, setAlignShow] = (0, import_react7.useState)(false);
  const [cropperShow, setCropperShow] = (0, import_react7.useState)(true);
  const [nullShow, setNullShow] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    const clearControlSub = transformer.clearControl$.subscribe((changeSelf) => {
      if (changeSelf === true) {
        setArrangeShow(false);
        setTransformShow(false);
        setAlignShow(false);
        setCropperShow(false);
        setNullShow(true);
      }
    });
    const changeStartSub = transformer.changeStart$.subscribe((state) => {
      const { objects } = state;
      const params = getUpdateParams(objects, drawingManagerService);
      if (params.length === 0) {
        setArrangeShow(false);
        setTransformShow(false);
        setAlignShow(false);
        setCropperShow(false);
        setNullShow(true);
      } else if (params.length === 1) {
        setArrangeShow(true);
        setTransformShow(true);
        setAlignShow(false);
        setCropperShow(true);
        setNullShow(false);
      } else {
        setArrangeShow(true);
        setTransformShow(false);
        setAlignShow(true);
        setCropperShow(false);
        setNullShow(false);
      }
    });
    const focusSub = drawingManagerService.focus$.subscribe((drawings2) => {
      if (drawings2.length === 0) {
        setArrangeShow(false);
        setTransformShow(false);
        setAlignShow(false);
        setCropperShow(false);
        setNullShow(true);
      } else if (drawings2.length === 1) {
        setArrangeShow(true);
        setTransformShow(true);
        setAlignShow(false);
        setCropperShow(true);
        setNullShow(false);
      } else {
        setArrangeShow(true);
        setTransformShow(false);
        setAlignShow(true);
        setCropperShow(false);
        setNullShow(false);
      }
    });
    return () => {
      changeStartSub.unsubscribe();
      clearControlSub.unsubscribe();
      focusSub.unsubscribe();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: clsx("univer-h-full", {
          "univer-hidden": !nullShow
        }),
        children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-flex univer-h-full univer-items-center univer-justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: localeService.t("drawing-ui.image-panel.null") }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DrawingArrange, { arrangeShow: hasArrange === true ? arrangeShow : false, drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DrawingTransform, { transformShow: hasTransform === true ? transformShow : false, drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DrawingAlign, { alignShow: hasAlign === true ? alignShow : false, drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ImageCropper, { cropperShow: hasCropper === true ? cropperShow : false, drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DrawingGroup, { hasGroup, drawings })
  ] });
};

// ../packages/sheets-drawing-ui/package.json
var package_default4 = {
  name: "@univerjs/sheets-drawing-ui",
  version: "0.25.2",
  private: false,
  description: "Drawing UI integration for Univer Sheets.",
  author: "DreamNum Co., Ltd. <developer@univer.ai>",
  license: "Apache-2.0",
  funding: {
    type: "opencollective",
    url: "https://opencollective.com/univer"
  },
  homepage: "https://univer.ai",
  repository: {
    type: "git",
    url: "https://github.com/dream-num/univer"
  },
  bugs: {
    url: "https://github.com/dream-num/univer/issues"
  },
  keywords: [
    "univer",
    "sheets",
    "drawing",
    "ui",
    "plugin"
  ],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*",
    "./locale/*": "./src/locale/*.ts",
    "./facade": "./src/facade/index.ts"
  },
  main: "./src/index.ts",
  types: "./lib/types/index.d.ts",
  publishConfig: {
    access: "public",
    main: "./lib/es/index.js",
    module: "./lib/es/index.js",
    exports: {
      ".": {
        import: "./lib/es/index.js",
        require: "./lib/cjs/index.js",
        types: "./lib/types/index.d.ts"
      },
      "./*": {
        import: "./lib/es/*",
        require: "./lib/cjs/*",
        types: "./lib/types/index.d.ts"
      },
      "./locale/*": {
        import: "./lib/es/locale/*.js",
        require: "./lib/cjs/locale/*.js",
        types: "./lib/types/locale/*.d.ts"
      },
      "./facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/facade": {
        import: "./lib/es/facade.js",
        require: "./lib/cjs/facade.js",
        types: "./lib/types/facade/index.d.ts"
      },
      "./lib/*": "./lib/*"
    }
  },
  directories: {
    lib: "lib"
  },
  files: [
    "lib"
  ],
  scripts: {
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    typecheck: "tsc --noEmit",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/docs-drawing": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/drawing-ui": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-drawing": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-drawing-ui/src/config/config.ts
var SHEETS_DRAWING_UI_PLUGIN_CONFIG_KEY = "sheets-drawing-ui.config";
var configSymbol4 = Symbol(SHEETS_DRAWING_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig4 = {};

// ../packages/sheets-drawing-ui/src/controllers/drawing-context-menu.controller.ts
var DrawingContextMenuController = class extends RxDisposable {
  constructor(_drawingManagerService, _contextMenuService, _renderManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_contextMenuService", _contextMenuService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._init();
  }
  _init() {
    this._univerInstanceService.getAllUnitsForType(2 /* UNIVER_SHEET */).forEach((workbook) => this._contextMenuListener(workbook));
  }
  _contextMenuListener(workbook) {
    var _a;
    if (!workbook) {
      return;
    }
    const scene = (_a = this._renderManagerService.getRenderById(workbook.getUnitId())) == null ? void 0 : _a.scene;
    if (!scene) {
      return;
    }
    const transformer = scene.getTransformerByCreate();
    if (!transformer) {
      return;
    }
    this.disposeWithMe(transformer.changeEnd$.subscribe((params) => {
      const { event } = params;
      if (event.button !== 2) return;
      const selectedObjects = transformer.getSelectedObjectMap();
      if (selectedObjects.size === 0) return;
      for (const object of selectedObjects.values()) {
        const oKey = object.oKey;
        const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
        if (!drawingParam) return;
      }
      this._contextMenuService.triggerContextMenu(event, "contextMenu.drawing" /* DRAWING */);
    }));
  }
};
DrawingContextMenuController = __decorateClass([
  __decorateParam(0, IDrawingManagerService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService)
], DrawingContextMenuController);

// ../packages/sheets-drawing-ui/src/controllers/render-controllers/sheet-celll-image-hover.render-controller.ts
var SheetCellImageHoverRenderController = class extends Disposable {
  constructor(_context, _hoverManagerService, _selectionsService, _drawingRenderService, _sheetSkeletonManagerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_selectionsService", _selectionsService);
    __publicField(this, "_drawingRenderService", _drawingRenderService);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_isSetCursor", false);
    this._initHover();
    this._initImageClick();
  }
  _initHover() {
    this.disposeWithMe(this._hoverManagerService.currentRichTextNoDistinct$.pipe(throttleTime(33)).subscribe((richText) => {
      var _a, _b;
      let currentSelections = [];
      if (richText !== null) {
        currentSelections = this._selectionsService.getWorkbookSelections(this._context.unitId).getCurrentSelections();
      }
      if (currentSelections.length > 0 && (richText == null ? void 0 : richText.unitId) === this._context.unitId && (richText == null ? void 0 : richText.drawing) && currentSelections.length === 1 && ((_a = currentSelections[0].primary) == null ? void 0 : _a.actualRow) === richText.row && ((_b = currentSelections[0].primary) == null ? void 0 : _b.actualColumn) === richText.col) {
        this._isSetCursor = true;
        this._context.scene.setCursor("zoom-in" /* ZOOM_IN */);
      } else if (this._isSetCursor) {
        this._isSetCursor = false;
        this._context.scene.resetCursor();
      }
    }));
  }
  _initImageClick() {
    this.disposeWithMe(this._hoverManagerService.currentClickedCell$.subscribe((click) => {
      var _a;
      if ((click == null ? void 0 : click.drawing) && this._isSetCursor) {
        const imageDrawing = click.drawing.drawing.drawingOrigin;
        const imageEle = (_a = this._sheetSkeletonManagerService.getCurrentSkeleton()) == null ? void 0 : _a.imageCacheMap.getImage(imageDrawing.imageSourceType, imageDrawing.source);
        if (!imageEle) return;
        this._drawingRenderService.previewImage("preview-cell-image", imageEle.src, imageEle.width, imageEle.height);
        this._context.scene.resetCursor();
        this._isSetCursor = false;
      }
    }));
  }
};
SheetCellImageHoverRenderController = __decorateClass([
  __decorateParam(1, Inject(HoverManagerService)),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, Inject(DrawingRenderService)),
  __decorateParam(4, Inject(SheetSkeletonManagerService))
], SheetCellImageHoverRenderController);

// ../packages/sheets-drawing-ui/src/controllers/render-controllers/sheet-drawing.render-controller.ts
var SheetsDrawingRenderController = class extends Disposable {
  constructor(_context, _sheetDrawingService, _drawingManagerService, _sheetSkeletonService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    this._init();
  }
  _init() {
    this._drawingInitializeListener();
  }
  _drawingInitializeListener() {
    this._sheetDrawingService.initializeNotification(this._context.unitId);
    const data = this._sheetDrawingService.getDrawingDataForUnit(this._context.unitId);
    for (const subUnit in data) {
      const subUnitData = data[subUnit];
      for (const drawingId in subUnitData.data) {
        const drawingData = subUnitData.data[drawingId];
        const { unitId, subUnitId } = drawingData;
        const skeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (skeletonParam && drawingData.sheetTransform) {
          drawingData.transform = drawingPositionToTransform(drawingData.sheetTransform, skeletonParam);
        }
      }
    }
    this._drawingManagerService.registerDrawingData(this._context.unitId, this._sheetDrawingService.getDrawingDataForUnit(this._context.unitId));
    this._drawingManagerService.initializeNotification(this._context.unitId);
  }
};
SheetsDrawingRenderController = __decorateClass([
  __decorateParam(1, ISheetDrawingService),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, Inject(SheetSkeletonService))
], SheetsDrawingRenderController);

// ../packages/sheets-drawing-ui/src/commands/commands/utils.ts
function ungroupToGroup(ungroupParams) {
  const newGroupParams = [];
  ungroupParams.forEach((ungroupParam) => {
    const { parent, children } = ungroupParam;
    const { unitId, subUnitId, drawingId: groupId } = parent;
    const groupTransform = getGroupState(0, 0, children.map((o) => o.transform || {}));
    const newChildren = children.map((drawing) => {
      const transform = drawing.transform || { left: 0, top: 0 };
      const { unitId: unitId2, subUnitId: subUnitId2, drawingId } = drawing;
      return {
        unitId: unitId2,
        subUnitId: subUnitId2,
        drawingId,
        transform: {
          ...transform,
          left: transform.left,
          top: transform.top
        },
        groupId
      };
    });
    const groupParam = {
      unitId,
      subUnitId,
      drawingId: groupId,
      drawingType: 6 /* DRAWING_GROUP */,
      groupBaseBound: { ...parent.groupBaseBound },
      transform: groupTransform
    };
    newGroupParams.push({
      parent: groupParam,
      children: newChildren
    });
  });
  return newGroupParams;
}
function groupToUngroup(groupParams) {
  const newGroupParams = [];
  groupParams.forEach((groupParam) => {
    const { parent, children } = groupParam;
    const { unitId, subUnitId, drawingId: groupId, transform: groupTransform = { width: 0, height: 0 } } = parent;
    if (groupTransform == null) {
      return;
    }
    const newChildren = children.map((object) => {
      const { transform } = object;
      const { unitId: unitId2, subUnitId: subUnitId2, drawingId } = object;
      const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0, parent.groupBaseBound);
      return {
        unitId: unitId2,
        subUnitId: subUnitId2,
        drawingId,
        transform: newTransform,
        groupId: void 0
      };
    });
    const ungroupParam = {
      unitId,
      subUnitId,
      drawingId: groupId,
      drawingType: 6 /* DRAWING_GROUP */,
      transform: {
        left: 0,
        top: 0
      }
    };
    newGroupParams.push({
      parent: ungroupParam,
      children: newChildren
    });
  });
  return newGroupParams;
}
function cloneGroupParams(groupParams) {
  var _a, _b, _c, _d, _e, _f, _g;
  const idMap = /* @__PURE__ */ new Map();
  (_a = groupParams.flatChildren) == null ? void 0 : _a.forEach((p) => idMap.set(p.drawingId, generateRandomId(10)));
  groupParams.groups.forEach((p) => idMap.set(p.drawingId, generateRandomId(10)));
  const clonedNestedIdRecord = {};
  for (const [oldGroupId, entry] of Object.entries(groupParams.nestedIdRecord)) {
    const newGroupId = (_b = idMap.get(oldGroupId)) != null ? _b : oldGroupId;
    clonedNestedIdRecord[newGroupId] = {
      drawingId: newGroupId,
      children: (_c = entry.children) == null ? void 0 : _c.map((id) => {
        var _a2;
        return (_a2 = idMap.get(id)) != null ? _a2 : id;
      })
    };
  }
  const flatChildren = [];
  const groups = [];
  for (const group of groupParams.groups) {
    const groupDrawingId = (_d = idMap.get(group.drawingId)) != null ? _d : group.drawingId;
    const parentGroupId = group.groupId ? (_e = idMap.get(group.groupId)) != null ? _e : group.groupId : void 0;
    groups.push(cloneDrawingParam(group, groupDrawingId, parentGroupId));
  }
  for (const child of groupParams.flatChildren || []) {
    const childDrawingId = (_f = idMap.get(child.drawingId)) != null ? _f : child.drawingId;
    const parentGroupId = child.groupId ? (_g = idMap.get(child.groupId)) != null ? _g : child.groupId : void 0;
    flatChildren.push(cloneDrawingParam(child, childDrawingId, parentGroupId));
  }
  return {
    cloned: {
      nestedIdRecord: clonedNestedIdRecord,
      flatChildren,
      groups
    },
    idMap
  };
}
function cloneDrawingParam(param, newDrawingId, parentGroupId) {
  const newParam = { ...param };
  if (newDrawingId) {
    newParam.drawingId = newDrawingId;
  }
  if (parentGroupId) {
    newParam.groupId = parentGroupId;
  } else {
    delete newParam.groupId;
  }
  return JSON.parse(JSON.stringify(newParam));
}

// ../packages/sheets-drawing-ui/src/commands/commands/group-sheet-drawing.command.ts
var GroupSheetDrawingCommand = {
  id: "sheet.command.group-sheet-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    if (!params) return false;
    const unitIds = [];
    params.forEach(({ parent, children }) => {
      unitIds.push(parent.unitId);
      children.forEach((child) => {
        unitIds.push(child.unitId);
      });
    });
    const jsonOp = sheetDrawingService.getGroupDrawingOp(params);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: 4 /* GROUP */ });
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects: groupToUngroup(objects), type: 5 /* UNGROUP */ } },
          { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }
        ],
        redoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: 4 /* GROUP */ } },
          { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }
        ]
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing-ui/src/commands/commands/ungroup-sheet-drawing.command.ts
var UngroupSheetDrawingCommand = {
  id: "sheet.command.ungroup-sheet-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    if (!params) return false;
    const unitIds = [];
    params.forEach(({ parent, children }) => {
      unitIds.push(parent.unitId);
      children.forEach((child) => {
        unitIds.push(child.unitId);
      });
    });
    const jsonOp = sheetDrawingService.getUngroupDrawingOp(params);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: 5 /* UNGROUP */ });
    if (result) {
      undoRedoService.pushUndoRedo({
        unitID: unitId,
        undoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects: ungroupToGroup(objects), type: 4 /* GROUP */ } },
          { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }
        ],
        redoMutations: [
          { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: 5 /* UNGROUP */ } },
          { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }
        ]
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-update.controller.ts
function rotatedBoundingBox(width, height, angleDegrees) {
  const angle = angleDegrees * Math.PI / 180;
  const rotatedWidth = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
  const rotatedHeight = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
  return { rotatedWidth, rotatedHeight };
}
function getDrawingSizeByCell(accessor, location, originImageWidth, originImageHeight, angle) {
  var _a;
  const { rotatedHeight, rotatedWidth } = rotatedBoundingBox(originImageWidth, originImageHeight, angle);
  const renderManagerService = accessor.get(IRenderManagerService);
  const currentRender = renderManagerService.getRenderById(location.unitId);
  if (!currentRender) {
    return false;
  }
  const skeletonManagerService = currentRender.with(SheetSkeletonManagerService);
  const skeleton = (_a = skeletonManagerService.getSkeletonParam(location.subUnitId)) == null ? void 0 : _a.skeleton;
  if (skeleton == null) {
    return false;
  }
  const cellInfo = skeleton.getCellByIndex(location.row, location.col);
  const cellWidth = cellInfo.mergeInfo.endX - cellInfo.mergeInfo.startX - 2;
  const cellHeight = cellInfo.mergeInfo.endY - cellInfo.mergeInfo.startY - 2;
  const imageRatio = rotatedWidth / rotatedHeight;
  const imageWidth = Math.ceil(Math.min(cellWidth, cellHeight * imageRatio));
  const scale = imageWidth / rotatedWidth;
  const realScale = !scale || Number.isNaN(scale) ? 1e-3 : scale;
  return {
    width: originImageWidth * realScale,
    height: originImageHeight * realScale
  };
}
var SheetDrawingUpdateController = class extends Disposable {
  constructor(_context, _commandService, _sheetInterceptorService, _selectionRenderService, _imageIoService, _fileOpenerService, _sheetDrawingService, _drawingManagerService, _contextService, _messageService, _localeService, selectionManagerService, _sheetSkeletonService, _injector, _urlImageService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_selectionRenderService", _selectionRenderService);
    __publicField(this, "_imageIoService", _imageIoService);
    __publicField(this, "_fileOpenerService", _fileOpenerService);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_urlImageService", _urlImageService);
    __publicField(this, "_workbookSelections");
    this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);
    this._updateDrawingListener();
    this._updateOrderListener();
    this._groupDrawingListener();
    this._focusDrawingListener();
  }
  async insertFloatImage() {
    const files = await this._fileOpenerService.openFile({
      multiple: true,
      accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace("image/", "")}`).join(",")
    });
    const fileLength = files.length;
    if (fileLength > DRAWING_IMAGE_COUNT_LIMIT) {
      this._messageService.show({
        type: "error" /* Error */,
        content: this._localeService.t("sheets-drawing-ui.update-status.exceedMaxCount", String(DRAWING_IMAGE_COUNT_LIMIT))
      });
      return false;
    } else if (fileLength === 0) {
      return false;
    }
    files.forEach(async (file) => await this.insertFloatImageByFile(file));
    return true;
  }
  async insertCellImage() {
    const files = await this._fileOpenerService.openFile({
      multiple: false,
      accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace("image/", "")}`).join(",")
    });
    const file = files[0];
    if (file) {
      await this._insertCellImage(file);
      return true;
    }
    return false;
  }
  insertCellImageByFile(file, location) {
    return this._insertCellImage(file, location);
  }
  async insertFloatImageByFile(file) {
    var _a;
    let imageParam;
    try {
      imageParam = await this._imageIoService.saveImage(file);
    } catch (error) {
      const type = error.message;
      if (type === "1" /* ERROR_EXCEED_SIZE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.exceedMaxSize", String(getDrawingImageAllowSize() / (1024 * 1024)))
        });
      } else if (type === "2" /* ERROR_IMAGE_TYPE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.invalidImageType")
        });
      } else if (type === "4" /* ERROR_IMAGE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.invalidImage")
        });
      }
    }
    if (imageParam == null) {
      return;
    }
    const info = this._getUnitInfo();
    const { unitId, subUnitId } = info;
    const { imageId, imageSourceType, source, base64Cache } = imageParam;
    const { width, height, image } = await getImageSize(base64Cache || "");
    const { width: sceneWidth, height: sceneHeight } = this._context.scene;
    this._imageIoService.addImageSourceCache(source, imageSourceType, image);
    let scale = 1;
    if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
      const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
      const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
      scale = Math.max(scaleWidth, scaleHeight);
    }
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetSkeletonParam) return;
    const { skeleton } = sheetSkeletonParam;
    const sheetTransform = this._getImagePosition(width * scale, height * scale, sceneWidth, sceneHeight, skeleton);
    if (!sheetTransform) return;
    const newTransform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
    if (!newTransform) return;
    const sheetDrawingParam = {
      unitId,
      subUnitId,
      drawingId: imageId,
      drawingType: 0 /* DRAWING_IMAGE */,
      imageSourceType,
      source,
      transform: newTransform,
      sheetTransform,
      axisAlignSheetTransform: (_a = transformToAxisAlignPosition(newTransform, skeleton)) != null ? _a : sheetTransform
    };
    return this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
      unitId,
      drawings: [sheetDrawingParam]
    });
  }
  // eslint-disable-next-line max-lines-per-function
  async _insertCellImage(file, location) {
    var _a, _b;
    let imageParam;
    try {
      imageParam = await this._imageIoService.saveImage(file);
    } catch (error) {
      const type = error.message;
      if (type === "1" /* ERROR_EXCEED_SIZE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.exceedMaxSize", String(getDrawingImageAllowSize() / (1024 * 1024)))
        });
      } else if (type === "2" /* ERROR_IMAGE_TYPE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.invalidImageType")
        });
      } else if (type === "4" /* ERROR_IMAGE */) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t("sheets-drawing-ui.update-status.invalidImage")
        });
      }
    }
    if (imageParam == null) {
      return false;
    }
    const { imageId, imageSourceType, source, base64Cache } = imageParam;
    const { width, height, image } = await getImageSize(base64Cache || "");
    this._imageIoService.addImageSourceCache(source, imageSourceType, image);
    const selection = this._workbookSelections.getCurrentLastSelection();
    if (!selection) {
      return false;
    }
    let row = selection.primary.actualRow;
    let col = selection.primary.actualColumn;
    if (selection.primary.isMerged) {
      row = selection.primary.startRow;
      col = selection.primary.startColumn;
    }
    const docDataModel = createDocumentModelWithStyle("", {});
    const imageSize = getDrawingSizeByCell(
      this._injector,
      {
        unitId: this._context.unitId,
        subUnitId: this._context.unit.getActiveSheet().getSheetId(),
        row,
        col
      },
      width,
      height,
      0
    );
    if (!imageSize) {
      return false;
    }
    const docTransform = {
      size: {
        width: imageSize.width,
        height: imageSize.height
      },
      positionH: {
        relativeFrom: 0 /* PAGE */,
        posOffset: 0
      },
      positionV: {
        relativeFrom: 1 /* PARAGRAPH */,
        posOffset: 0
      },
      angle: 0
    };
    const docDrawingParam = {
      unitId: docDataModel.getUnitId(),
      subUnitId: docDataModel.getUnitId(),
      drawingId: imageId,
      drawingType: 0 /* DRAWING_IMAGE */,
      imageSourceType,
      source,
      transform: docDrawingPositionToTransform(docTransform),
      docTransform,
      behindDoc: 0 /* FALSE */,
      title: "",
      description: "",
      layoutType: 0 /* INLINE */,
      // Insert inline drawing by default.
      wrapText: 0 /* BOTH_SIDES */,
      distB: 0,
      distL: 0,
      distR: 0,
      distT: 0
    };
    const jsonXActions = BuildTextUtils.drawing.add({
      documentDataModel: docDataModel,
      drawings: [docDrawingParam],
      selection: {
        collapsed: true,
        startOffset: 0,
        endOffset: 0
      }
    });
    if (jsonXActions) {
      docDataModel.apply(jsonXActions);
      return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
        value: {
          [(_a = location == null ? void 0 : location.row) != null ? _a : row]: {
            [(_b = location == null ? void 0 : location.col) != null ? _b : col]: {
              p: docDataModel.getSnapshot(),
              t: 1
            }
          }
        },
        unitId: location == null ? void 0 : location.unitId,
        subUnitId: location == null ? void 0 : location.subUnitId
      });
    }
    return false;
  }
  // eslint-disable-next-line max-lines-per-function
  async insertCellImageByUrl(url, location) {
    var _a, _b;
    let src = url;
    try {
      src = await this._urlImageService.getImage(url);
    } catch (error) {
      console.error(`Failed to get image from URLImageService: ${url}`, error);
    }
    const { width, height, image } = await getImageSize(src || "");
    this._imageIoService.addImageSourceCache(url, "URL" /* URL */, image);
    const selection = this._workbookSelections.getCurrentLastSelection();
    if (!selection) {
      return false;
    }
    const docDataModel = createDocumentModelWithStyle("", {});
    const imageSize = getDrawingSizeByCell(
      this._injector,
      {
        unitId: this._context.unitId,
        subUnitId: this._context.unit.getActiveSheet().getSheetId(),
        row: selection.primary.actualRow,
        col: selection.primary.actualColumn
      },
      width,
      height,
      0
    );
    if (!imageSize) {
      return false;
    }
    const docTransform = {
      size: {
        width: imageSize.width,
        height: imageSize.height
      },
      positionH: {
        relativeFrom: 0 /* PAGE */,
        posOffset: 0
      },
      positionV: {
        relativeFrom: 1 /* PARAGRAPH */,
        posOffset: 0
      },
      angle: 0
    };
    const docDrawingParam = {
      unitId: docDataModel.getUnitId(),
      subUnitId: docDataModel.getUnitId(),
      drawingId: generateRandomId(),
      drawingType: 0 /* DRAWING_IMAGE */,
      imageSourceType: "URL" /* URL */,
      source: url,
      transform: docDrawingPositionToTransform(docTransform),
      docTransform,
      behindDoc: 0 /* FALSE */,
      title: "",
      description: "",
      layoutType: 0 /* INLINE */,
      // Insert inline drawing by default.
      wrapText: 0 /* BOTH_SIDES */,
      distB: 0,
      distL: 0,
      distR: 0,
      distT: 0
    };
    const jsonXActions = BuildTextUtils.drawing.add({
      documentDataModel: docDataModel,
      drawings: [docDrawingParam],
      selection: {
        collapsed: true,
        startOffset: 0,
        endOffset: 0
      }
    });
    if (jsonXActions) {
      docDataModel.apply(jsonXActions);
      return this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
        value: {
          [(_a = location == null ? void 0 : location.row) != null ? _a : selection.primary.actualRow]: {
            [(_b = location == null ? void 0 : location.col) != null ? _b : selection.primary.actualColumn]: {
              p: docDataModel.getSnapshot(),
              t: 1
            }
          }
        },
        unitId: location == null ? void 0 : location.unitId,
        subUnitId: location == null ? void 0 : location.subUnitId
      });
    }
    return false;
  }
  _getUnitInfo() {
    const workbook = this._context.unit;
    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    return {
      unitId,
      subUnitId
    };
  }
  _getImagePosition(imageWidth, imageHeight, sceneWidth, sceneHeight, skeleton) {
    const selections = this._workbookSelections.getCurrentSelections();
    let range = {
      startRow: 0,
      endRow: 0,
      startColumn: 0,
      endColumn: 0
    };
    if (selections && selections.length > 0) {
      range = selections[selections.length - 1].range;
    }
    const rangeWithCoord = attachRangeWithCoord(skeleton, range);
    if (rangeWithCoord == null) {
      return;
    }
    let { startColumn, startRow, startX, startY } = rangeWithCoord;
    let isChangeStart = false;
    if (startX + imageWidth > sceneWidth) {
      startX = sceneWidth - imageWidth;
      if (startX < 0) {
        startX = 0;
        imageWidth = sceneWidth;
      }
      isChangeStart = true;
    }
    if (startY + imageHeight > sceneHeight) {
      startY = sceneHeight - imageHeight;
      if (startY < 0) {
        startY = 0;
        imageHeight = sceneHeight;
      }
      isChangeStart = true;
    }
    if (isChangeStart) {
      const newCoord = this._selectionRenderService.getCellWithCoordByOffset(startX, startY);
      if (newCoord == null) {
        return;
      }
      startX = newCoord.startX;
      startY = newCoord.startY;
      startColumn = newCoord.actualColumn;
      startRow = newCoord.actualRow;
    }
    const from = {
      column: startColumn,
      columnOffset: 0,
      row: startRow,
      rowOffset: 0
    };
    const endSelectionCell = this._selectionRenderService.getCellWithCoordByOffset(startX + imageWidth, startY + imageHeight);
    if (endSelectionCell == null) {
      return;
    }
    const to = {
      column: endSelectionCell.actualColumn,
      columnOffset: startX + imageWidth - endSelectionCell.startX,
      row: endSelectionCell.actualRow,
      rowOffset: startY + imageHeight - endSelectionCell.startY
    };
    return {
      from,
      to
    };
  }
  _updateOrderListener() {
    this.disposeWithMe(this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
      const { unitId, subUnitId, drawingIds, arrangeType } = params;
      this._commandService.executeCommand(SetDrawingArrangeCommand.id, {
        unitId,
        subUnitId,
        drawingIds,
        arrangeType
      });
    }));
  }
  _updateDrawingListener() {
    this.disposeWithMe(this._drawingManagerService.featurePluginUpdate$.subscribe((params) => {
      const drawings = [];
      if (params.length === 0) {
        return;
      }
      params.forEach((param) => {
        const { unitId, subUnitId, drawingId, transform } = param;
        const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
        if (!transform || !sheetSkeletonParam) {
          return;
        }
        const { skeleton } = sheetSkeletonParam;
        const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });
        if (sheetDrawing == null || sheetDrawing.unitId !== this._context.unitId) {
          return;
        }
        const sheetTransform = transformToDrawingPosition({ ...sheetDrawing.transform, ...transform }, skeleton);
        const axisAlignSheetTransform = transformToAxisAlignPosition({ ...sheetDrawing.transform, ...transform }, skeleton);
        if (sheetTransform == null || axisAlignSheetTransform == null) {
          return;
        }
        const newDrawing = {
          ...param,
          transform: { ...sheetDrawing.transform, ...transform, ...drawingPositionToTransform(sheetTransform, sheetSkeletonParam) },
          sheetTransform: { ...sheetTransform },
          axisAlignSheetTransform: { ...axisAlignSheetTransform }
        };
        drawings.push(newDrawing);
      });
      if (drawings.length > 0) {
        this._commandService.executeCommand(SetSheetDrawingCommand.id, {
          unitId: params[0].unitId,
          drawings
        });
      }
    }));
  }
  _getSheetTransformByParam(param, isCreate) {
    const { unitId, subUnitId, drawingId, transform } = param;
    const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!transform || !skeleton) {
      return null;
    }
    const sheetDrawing = this._sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });
    let sheetDrawingTransform = sheetDrawing == null ? void 0 : sheetDrawing.transform;
    if (isCreate) {
      sheetDrawingTransform = {};
    }
    if (!isCreate && (!sheetDrawing || sheetDrawing.unitId !== this._context.unitId)) {
      return null;
    }
    const sheetTransform = transformToDrawingPosition({ ...sheetDrawingTransform, ...transform }, skeleton);
    const axisAlignSheetTransform = transformToAxisAlignPosition({ ...sheetDrawingTransform, ...transform }, skeleton);
    if (!sheetTransform || !axisAlignSheetTransform) {
      return null;
    }
    return { sheetTransform, axisAlignSheetTransform };
  }
  _groupDrawingListener() {
    this.disposeWithMe(this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
      const grpParams = [];
      for (const param of params) {
        const grpSheetTransform = this._getSheetTransformByParam(param.parent, true);
        const children = [];
        for (const child of param.children) {
          const childSheetTransformInfo = this._getSheetTransformByParam(child, false);
          if (childSheetTransformInfo != null) {
            children.push({
              ...child,
              sheetTransform: childSheetTransformInfo.sheetTransform,
              axisAlignSheetTransform: childSheetTransformInfo.axisAlignSheetTransform
            });
          }
        }
        const grpParam = {
          parent: { ...param.parent, sheetTransform: grpSheetTransform == null ? void 0 : grpSheetTransform.sheetTransform, axisAlignSheetTransform: grpSheetTransform == null ? void 0 : grpSheetTransform.axisAlignSheetTransform },
          children
        };
        grpParams.push(grpParam);
      }
      if (grpParams.length > 0) {
        this._commandService.executeCommand(GroupSheetDrawingCommand.id, grpParams);
        const { unitId, subUnitId, drawingId } = params[0].parent;
        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{ unitId, subUnitId, drawingId }]);
      }
    }));
    this.disposeWithMe(this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
      const unGroupParams = [];
      for (const param of params) {
        const { children } = param;
        const childParams = [];
        for (const child of children) {
          const childSheetTransform = this._getSheetTransformByParam(child, false);
          if (childSheetTransform != null) {
            childParams.push({
              ...child,
              sheetTransform: childSheetTransform.sheetTransform,
              axisAlignSheetTransform: childSheetTransform.axisAlignSheetTransform
            });
          }
        }
        unGroupParams.push({
          ...param,
          children: childParams
        });
      }
      this._commandService.executeCommand(UngroupSheetDrawingCommand.id, unGroupParams);
    }));
  }
  _focusDrawingListener() {
    this.disposeWithMe(
      this._drawingManagerService.focus$.subscribe((params) => {
        if (params == null || params.length === 0) {
          this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
          this._sheetDrawingService.focusDrawing([]);
        } else {
          this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
          this._sheetDrawingService.focusDrawing(params);
        }
      })
    );
  }
};
SheetDrawingUpdateController = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetInterceptorService)),
  __decorateParam(3, ISheetSelectionRenderService),
  __decorateParam(4, IImageIoService),
  __decorateParam(5, ILocalFileService),
  __decorateParam(6, ISheetDrawingService),
  __decorateParam(7, IDrawingManagerService),
  __decorateParam(8, IContextService),
  __decorateParam(9, IMessageService),
  __decorateParam(10, Inject(LocaleService)),
  __decorateParam(11, Inject(SheetsSelectionsService)),
  __decorateParam(12, Inject(SheetSkeletonService)),
  __decorateParam(13, Inject(Injector)),
  __decorateParam(14, IURLImageService)
], SheetDrawingUpdateController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-cell-image.controller.ts
function resizeImageByCell(injector, location, cell) {
  var _a, _b, _c, _d;
  if (((_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.body) == null ? void 0 : _b.dataStream.length) === 3 && ((_d = (_c = cell.p) == null ? void 0 : _c.drawingsOrder) == null ? void 0 : _d.length) === 1) {
    const image = cell.p.drawings[cell.p.drawingsOrder[0]];
    const imageSize = getDrawingSizeByCell(
      injector,
      {
        unitId: location.unitId,
        subUnitId: location.subUnitId,
        row: location.row,
        col: location.col
      },
      image.docTransform.size.width,
      image.docTransform.size.height,
      image.docTransform.angle
    );
    if (imageSize) {
      image.transform.width = imageSize.width;
      image.transform.height = imageSize.height;
      image.docTransform.size.width = imageSize.width;
      image.docTransform.size.height = imageSize.height;
      image.transform.left = 0;
      image.transform.top = 0;
      image.docTransform.positionH.posOffset = 0;
      image.docTransform.positionV.posOffset = 0;
      cell.p.documentStyle.pageSize.width = Infinity;
      cell.p.documentStyle.pageSize.height = Infinity;
      return true;
    }
  }
  return false;
}
var SheetCellImageController = class extends Disposable {
  constructor(_commandService, _sheetInterceptorService, _injector, _drawingManagerService, _docDrawingController, _editorBridgeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_docDrawingController", _docDrawingController);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    this._handleInitEditor();
    this._initCellContentInterceptor();
  }
  _handleInitEditor() {
    this.disposeWithMe(this._editorBridgeService.visible$.subscribe((param) => {
      if (!param.visible) {
        this._drawingManagerService.removeDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
      } else if (param.visible) {
        this._drawingManagerService.removeDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        this._docDrawingController.loadDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        this._drawingManagerService.initializeNotification(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
      }
    }));
    this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === ReplaceSnapshotCommand.id) {
        const params = commandInfo.params;
        const unitId = params.unitId;
        if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
          this._drawingManagerService.removeDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
          this._docDrawingController.loadDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
          this._drawingManagerService.initializeNotification(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
        }
      }
    }));
  }
  _initCellContentInterceptor() {
    this.disposeWithMe(
      this._sheetInterceptorService.intercept(
        INTERCEPTOR_POINT.CELL_CONTENT,
        {
          effect: 1 /* Style */,
          priority: 11 /* CELL_IMAGE */,
          handler: (cell, pos, next) => {
            var _a;
            if ((cell == null ? void 0 : cell.p) && ((_a = cell.p.drawingsOrder) == null ? void 0 : _a.length)) {
              if (cell === pos.rawData) {
                cell = { ...pos.rawData };
              }
              if (!cell.interceptorStyle) {
                cell.interceptorStyle = {};
              }
              cell.interceptorStyle.tr = { a: 0 };
              resizeImageByCell(this._injector, { unitId: pos.unitId, subUnitId: pos.subUnitId, row: pos.row, col: pos.col }, cell);
            }
            return next(cell);
          }
        }
      )
    );
  }
};
SheetCellImageController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(SheetInterceptorService)),
  __decorateParam(2, Inject(Injector)),
  __decorateParam(3, IDrawingManagerService),
  __decorateParam(4, Inject(DocDrawingController)),
  __decorateParam(5, Inject(IEditorBridgeService))
], SheetCellImageController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-cell-image-autofill.controller.ts
var SheetCellImageAutofillController = class extends Disposable {
  constructor(_autoFillService, _injector) {
    super();
    __publicField(this, "_autoFillService", _autoFillService);
    __publicField(this, "_injector", _injector);
    this._initAutoFillHooks();
  }
  _initAutoFillHooks() {
    this.disposeWithMe(
      this._autoFillService.addHook({
        id: "sheet-cell-image-autofill",
        onBeforeSubmit: (location, direction, applyType, cellValue) => {
          new ObjectMatrix(cellValue).forValue((row, col, cell) => {
            resizeImageByCell(this._injector, { unitId: location.unitId, subUnitId: location.subUnitId, row, col }, cell);
          });
        }
      })
    );
  }
};
SheetCellImageAutofillController = __decorateClass([
  __decorateParam(0, Inject(IAutoFillService)),
  __decorateParam(1, Inject(Injector))
], SheetCellImageAutofillController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-cell-image-copy-paste.controller.ts
var DISABLE_UNITS = [
  DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
  DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY
];
var SheetCellImageCopyPasteController = class extends Disposable {
  constructor(_commandService, _univerInstanceService, _dialogService, _renderManagerService, _localeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_localeService", _localeService);
    this._initDocImageCopyPasteHooks();
  }
  _setCellImage(drwaing) {
    var _a;
    const docDataModel = createDocumentModelWithStyle("", {});
    const editingRenderController = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.with(EditingRenderController);
    const jsonXActions = BuildTextUtils.drawing.add({
      documentDataModel: docDataModel,
      drawings: [drwaing],
      selection: {
        collapsed: true,
        startOffset: 0,
        endOffset: 0
      }
    });
    if (jsonXActions) {
      docDataModel.apply(jsonXActions);
      if (editingRenderController) {
        editingRenderController.submitCellData(docDataModel);
      }
    }
  }
  _initDocImageCopyPasteHooks() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((commandInfo) => {
        var _a, _b;
        if (commandInfo.id === InnerPasteCommand.id) {
          const params = commandInfo.params;
          const { doc } = params;
          const currentDoc = this._univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
          if (currentDoc == null || !Object.keys((_a = doc.drawings) != null ? _a : {}).length) {
            return;
          }
          const docUnitId = currentDoc.getUnitId();
          if (DISABLE_UNITS.includes(docUnitId)) {
            if (docUnitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
              const handleCloseDialog = () => {
                this._dialogService.close("sheet-cell-image-copy-paste");
                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                  visible: false
                });
              };
              if (((_b = currentDoc.getBody()) == null ? void 0 : _b.dataStream) === "\r\n") {
                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                  visible: false
                });
                this._setCellImage(Object.values(doc.drawings)[0]);
              } else {
                this._dialogService.open({
                  id: "sheet-cell-image-copy-paste",
                  title: {
                    label: this._localeService.t("sheets-drawing-ui.cell-image.pasteTitle")
                  },
                  children: {
                    label: this._localeService.t("sheets-drawing-ui.cell-image.pasteContent")
                  },
                  width: 320,
                  destroyOnClose: true,
                  onClose: handleCloseDialog,
                  showOk: true,
                  showCancel: true,
                  onOk: () => {
                    handleCloseDialog();
                    this._setCellImage(Object.values(doc.drawings)[0]);
                  },
                  onCancel: handleCloseDialog
                });
              }
            }
          }
        }
      })
    );
  }
};
SheetCellImageCopyPasteController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IRenderManagerService),
  __decorateParam(4, Inject(LocaleService))
], SheetCellImageCopyPasteController);

// ../packages/sheets-drawing-ui/src/commands/commands/insert-image.command.ts
var InsertFloatImageCommand = {
  id: "sheet.command.insert-float-image",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    var _a, _b;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const sheetDrawingUpdateController = (_a = getCurrentTypeOfRenderer(
      2 /* UNIVER_SHEET */,
      univerInstanceService,
      renderManagerService
    )) == null ? void 0 : _a.with(SheetDrawingUpdateController);
    if (!sheetDrawingUpdateController) {
      return false;
    }
    const files = params == null ? void 0 : params.files;
    if (files) {
      const awaitFiles = files.map((file) => sheetDrawingUpdateController.insertFloatImageByFile(file));
      return (await Promise.all(awaitFiles)).every((result) => result);
    } else {
      return (_b = sheetDrawingUpdateController.insertFloatImage()) != null ? _b : false;
    }
  }
};
var InsertCellImageCommand = {
  id: "sheet.command.insert-cell-image",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    var _a, _b;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    return (_b = (_a = getCurrentTypeOfRenderer(
      2 /* UNIVER_SHEET */,
      univerInstanceService,
      renderManagerService
    )) == null ? void 0 : _a.with(SheetDrawingUpdateController).insertCellImage()) != null ? _b : false;
  }
};

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-copy-paste.controller.ts
var IMAGE_PNG_MIME_TYPE = "image/png";
function base64ToBlob(base64) {
  const arr = base64.split(",");
  const binStr = atob(arr[1]);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: IMAGE_PNG_MIME_TYPE });
}
function copyBase64ToClipboard(base64) {
  const item = new ClipboardItem({ [IMAGE_PNG_MIME_TYPE]: base64ToBlob(base64) });
  navigator.clipboard.write([item]).catch((err) => {
    console.error("Could not copy image using clipboard API: ", err);
  });
}
function focusDocument() {
  function createInputElement() {
    const input2 = document.createElement("input");
    input2.style.position = "absolute";
    input2.style.height = "1px";
    input2.style.width = "1px";
    input2.style.opacity = "0";
    return input2;
  }
  const activeElement = document.activeElement;
  const input = createInputElement();
  document.body.appendChild(input);
  input.focus();
  return () => {
    input.blur();
    document.body.removeChild(input);
    if (activeElement instanceof HTMLElement) {
      activeElement.focus();
    }
  };
}
var specialPastes = [
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA
];
var SheetsDrawingCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _renderManagerService, _sheetSkeletonService, _drawingService, _clipboardInterfaceService, _commandService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    __publicField(this, "_drawingService", _drawingService);
    __publicField(this, "_clipboardInterfaceService", _clipboardInterfaceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_copyInfo");
    this._initCopyPaste();
  }
  get _focusedDrawings() {
    return this._drawingService.getFocusDrawings();
  }
  // eslint-disable-next-line max-lines-per-function
  _initCopyPaste() {
    this._sheetClipboardService.addClipboardHook({
      id: "SHEET_IMAGE_UI_PLUGIN",
      onBeforeCopy: (unitId, subUnitId, range, copyType) => {
        this._copyInfo = null;
        const focusDrawings = this._focusedDrawings;
        if (focusDrawings.length > 0) {
          const [drawing] = focusDrawings;
          if (drawing.drawingType !== 0 /* DRAWING_IMAGE */) {
            return;
          }
          if (copyType === "CUT" /* CUT */) {
            const params = {
              unitId,
              drawings: [drawing]
            };
            this._commandService.executeCommand(RemoveSheetDrawingCommand.id, params);
          }
          setTimeout(() => {
            const dispose = focusDocument();
            if (drawing.drawingType === 0 /* DRAWING_IMAGE */ && drawing.imageSourceType === "BASE64" /* BASE64 */) {
              copyBase64ToClipboard(drawing.source);
            } else {
              this._clipboardInterfaceService.writeText("");
            }
            dispose();
          }, 200);
          const newCopyInfo = {
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            drawings: [drawing]
          };
          this._copyInfo = newCopyInfo;
        } else {
          const newCopyInfo = this._createDrawingsCopyInfoByRange(unitId, subUnitId, range);
          this._copyInfo = newCopyInfo;
        }
      },
      onPasteCells: (pasteFrom, pasteTo, data, payload) => {
        if (!this._copyInfo) {
          return { redos: [], undos: [] };
        }
        const { copyType = "COPY" /* COPY */, pasteType } = payload;
        const { range: copyRange, unitId: fromUnitId, subUnitId: fromSubUnitId } = pasteFrom || {};
        const { range: pasteRange, unitId: toUnitId, subUnitId: toSubUnitId } = pasteTo;
        const mutations = this._copyInfo.copyRange ? this._generateRangeDrawingsPasteMutations(
          { unitId: toUnitId, subUnitId: toSubUnitId, pasteRange, pasteType },
          { unitId: fromUnitId, subUnitId: fromSubUnitId, copyType, copyRange }
        ) : this._generateSingleDrawingPasteMutations({ pasteTo, pasteType }, "COPY" /* COPY */);
        return mutations;
      },
      onPastePlainText: (pasteTo, clipText) => {
        return { undos: [], redos: [] };
      },
      onPasteUnrecognized: (pasteTo) => {
        if (this._copyInfo) {
          return this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }, "COPY" /* COPY */);
        } else {
          return { undos: [], redos: [] };
        }
      },
      onPasteFiles: (pasteTo, files) => {
        if (this._copyInfo) {
          return this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }, "COPY" /* COPY */);
        } else {
          const images = files.filter((file) => file.type.includes("image"));
          if (images.length) {
            return {
              undos: [],
              redos: [
                {
                  id: InsertFloatImageCommand.id,
                  params: { files: images }
                }
              ]
            };
          }
        }
        return { undos: [], redos: [] };
      }
    });
  }
  _createDrawingsCopyInfoByRange(unitId, subUnitId, range) {
    const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!skeleton) return;
    const selectionRect = attachRangeWithCoord(skeleton, range);
    if (!selectionRect) return;
    const { startX, endX, startY, endY } = selectionRect;
    const drawings = this._drawingService.getDrawingData(unitId, subUnitId);
    const containedDrawings = this._focusedDrawings.slice();
    Object.keys(drawings).forEach((drawingId) => {
      const drawing = drawings[drawingId];
      if (drawing.drawingType !== 0 /* DRAWING_IMAGE */) {
        return;
      }
      const { transform } = drawing;
      if (drawing.anchorType !== "1" /* Both */) {
        return;
      }
      if (!transform) {
        return;
      }
      const { left = 0, top = 0, width = 0, height = 0 } = transform;
      const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
        drawingStartX: left,
        drawingEndX: left + width,
        drawingStartY: top,
        drawingEndY: top + height
      };
      if (startX <= drawingStartX && drawingEndX <= endX && startY <= drawingStartY && drawingEndY <= endY) {
        containedDrawings.push(drawing);
      }
    });
    if (containedDrawings.length) {
      return {
        copyRange: range,
        drawings: containedDrawings,
        unitId,
        subUnitId
      };
    }
  }
  _generateSingleDrawingPasteMutations(pasteContext, copyType) {
    const { pasteType, pasteTo } = pasteContext;
    if (specialPastes.includes(pasteType)) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId, range } = pasteTo;
    const pasteToSkeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!pasteToSkeleton) {
      return { redos: [], undos: [] };
    }
    const copyInfo = this._copyInfo;
    const { drawings } = copyInfo;
    const pasteRange = discreteRangeToRange(range);
    return this._generateMutations(drawings, {
      unitId,
      subUnitId,
      isCut: copyType === "CUT" /* CUT */,
      getTransform: (transform, sheetTransform) => {
        var _a, _b;
        const pasteRect = attachRangeWithCoord(pasteToSkeleton, {
          startRow: pasteRange.startRow,
          endRow: pasteRange.endRow,
          startColumn: pasteRange.startColumn,
          endColumn: pasteRange.endColumn
        });
        const newTransform = {
          ...transform,
          left: pasteRect == null ? void 0 : pasteRect.startX,
          top: pasteRect == null ? void 0 : pasteRect.startY
        };
        return {
          transform: newTransform,
          sheetTransform: (_a = transformToDrawingPosition(newTransform, pasteToSkeleton)) != null ? _a : sheetTransform,
          axisAlignSheetTransform: (_b = transformToAxisAlignPosition(newTransform, pasteToSkeleton)) != null ? _b : sheetTransform
        };
      }
    });
  }
  _generateMutations(drawings, payload) {
    const {
      unitId,
      subUnitId,
      getTransform,
      isCut
    } = payload;
    const redos = [];
    const undos = [];
    const { _drawingService } = this;
    drawings.forEach((drawing) => {
      const { transform, sheetTransform } = drawing;
      if (!transform) {
        return;
      }
      const transformContext = getTransform(transform, sheetTransform);
      const drawingObject = {
        ...drawing,
        unitId,
        subUnitId,
        drawingId: isCut ? drawing.drawingId : generateRandomId(),
        transform: transformContext.transform,
        sheetTransform: transformContext.sheetTransform,
        axisAlignSheetTransform: transformContext.axisAlignSheetTransform
      };
      if (isCut) {
        const { undo, redo, objects } = _drawingService.getBatchUpdateOp([drawingObject]);
        redos.push({
          id: SetDrawingApplyMutation.id,
          params: {
            unitId,
            subUnitId,
            type: 2 /* UPDATE */,
            op: redo,
            objects
          }
        });
        undos.push({
          id: SetDrawingApplyMutation.id,
          params: {
            unitId,
            subUnitId,
            type: 2 /* UPDATE */,
            op: undo,
            objects
          }
        });
      } else {
        const { undo, redo, objects } = _drawingService.getBatchAddOp([drawingObject]);
        redos.push({ id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: 0 /* INSERT */ } });
        undos.push({ id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: 1 /* REMOVE */ } });
      }
    });
    return { redos, undos };
  }
  // eslint-disable-next-line max-lines-per-function
  _generateRangeDrawingsPasteMutations(pasteContext, copyContext) {
    if (!this._copyInfo) {
      return { redos: [], undos: [] };
    }
    const { unitId: toUnitId, subUnitId: toSubUnitId, pasteRange, pasteType } = pasteContext;
    const { unitId: fromUnitId, subUnitId: fromSubUnitId, copyRange, copyType } = copyContext;
    if (specialPastes.includes(pasteType)) {
      return { redos: [], undos: [] };
    }
    const toSkeleton = this._sheetSkeletonService.getSkeleton(toUnitId, toSubUnitId);
    if (!toSkeleton) {
      return { redos: [], undos: [] };
    }
    const { drawings } = this._copyInfo;
    if (!copyRange) {
      return this._generateSingleDrawingPasteMutations({
        pasteTo: { unitId: toUnitId, subUnitId: toSubUnitId, range: discreteRangeToRange(pasteRange) },
        pasteType
      }, copyType);
    }
    const fromSkeleton = this._sheetSkeletonService.getSkeleton(fromUnitId, fromSubUnitId);
    if (!fromSkeleton) {
      return { redos: [], undos: [] };
    }
    const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pasteRange]);
    const { row: copyRow, col: copyCol } = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
    const { row: pasteRow, col: pasteCol } = mapFunc(vPastedRange.startRow, vPastedRange.startColumn);
    const copyRect = attachRangeWithCoord(fromSkeleton, {
      startRow: copyRow,
      endRow: copyRow,
      startColumn: copyCol,
      endColumn: copyCol
    });
    const pasteRect = attachRangeWithCoord(toSkeleton, {
      startRow: pasteRow,
      endRow: pasteRow,
      startColumn: pasteCol,
      endColumn: pasteCol
    });
    if (!copyRect || !pasteRect) {
      return { redos: [], undos: [] };
    }
    const leftOffset = pasteRect.startX - copyRect.startX;
    const topOffset = pasteRect.startY - copyRect.startY;
    const rowOffset = pasteRow - copyRow;
    const columnOffset = pasteCol - copyCol;
    return this._generateMutations(drawings, {
      unitId: toUnitId,
      subUnitId: toSubUnitId,
      getTransform: (transform, sheetTransform) => {
        var _a, _b, _c;
        const newTransform = {
          ...transform,
          left: ((_a = transform == null ? void 0 : transform.left) != null ? _a : 0) + leftOffset,
          top: ((_b = transform == null ? void 0 : transform.top) != null ? _b : 0) + topOffset
        };
        return {
          transform: newTransform,
          sheetTransform: {
            ...sheetTransform,
            to: {
              ...sheetTransform.to,
              row: sheetTransform.to.row + rowOffset,
              column: sheetTransform.to.column + columnOffset
            },
            from: {
              ...sheetTransform.from,
              row: sheetTransform.from.row + rowOffset,
              column: sheetTransform.from.column + columnOffset
            }
          },
          axisAlignSheetTransform: (_c = transformToAxisAlignPosition(newTransform, toSkeleton)) != null ? _c : sheetTransform
        };
      },
      isCut: copyType === "CUT" /* CUT */
    });
  }
};
SheetsDrawingCopyPasteController = __decorateClass([
  __decorateParam(0, ISheetClipboardService),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, Inject(SheetSkeletonService)),
  __decorateParam(3, IDrawingManagerService),
  __decorateParam(4, IClipboardInterfaceService),
  __decorateParam(5, ICommandService)
], SheetsDrawingCopyPasteController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-group-copy-paste.controller.ts
var specialPastes2 = [
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA
];
var SheetsDrawingGroupCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _renderManagerService, _sheetSkeletonService, _sheetDrawingService, _drawingManagerService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_featurePasteHooks", []);
    __publicField(this, "_copyInfo");
    this._initCopyPaste();
  }
  get _focusedDrawings() {
    return this._sheetDrawingService.getFocusDrawings();
  }
  _initCopyPaste() {
    this._sheetClipboardService.addClipboardHook({
      id: "SHEET_DRAWING_GROUP",
      onBeforeCopy: (_unitId, _subUnitId) => {
        this._copyInfo = null;
        const focusDrawings = this._focusedDrawings;
        if (focusDrawings.length === 0) return;
        const groupDrawing = focusDrawings.find((d) => d.drawingType === 6 /* DRAWING_GROUP */);
        if (!groupDrawing) return;
        const groupNestedParam = this._drawingManagerService.getDrawingsByGroupNested({
          unitId: groupDrawing.unitId,
          subUnitId: groupDrawing.subUnitId,
          drawingId: groupDrawing.drawingId
        });
        if (!groupNestedParam) return;
        this._copyInfo = {
          unitId: groupDrawing.unitId,
          subUnitId: groupDrawing.subUnitId,
          groupNestedParam
        };
      },
      onPasteCells: (_pasteFrom, pasteTo, _data, payload) => {
        if (!this._copyInfo) return { redos: [], undos: [] };
        const { pasteType } = payload;
        if (specialPastes2.includes(pasteType)) return { redos: [], undos: [] };
        return this._generateGroupPasteMutations(pasteTo);
      },
      onPasteUnrecognized: (pasteTo) => {
        if (!this._copyInfo) return { redos: [], undos: [] };
        return this._generateGroupPasteMutations(pasteTo);
      }
    });
  }
  registerFeaturePasteHook(hook) {
    this._featurePasteHooks.push(hook);
  }
  _getGroupFeaturePasteMutations(params) {
    const redos = [];
    const undos = [];
    for (const hook of this._featurePasteHooks) {
      const result = hook(params);
      redos.push(...result.redos);
      undos.push(...result.undos);
    }
    return { redos, undos };
  }
  _generateGroupPasteMutations(pasteTo) {
    var _a;
    if (!this._copyInfo) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId, range } = pasteTo;
    const pasteToSkeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!pasteToSkeleton) {
      return { redos: [], undos: [] };
    }
    const { groupNestedParam } = this._copyInfo;
    const origRootGroup = groupNestedParam.groups[groupNestedParam.groups.length - 1];
    const { cloned, idMap } = cloneGroupParams(groupNestedParam);
    const newRootGroupId = cloned.groups[cloned.groups.length - 1].drawingId;
    const pasteRange = discreteRangeToRange(range);
    const pasteRect = attachRangeWithCoord(pasteToSkeleton, {
      startRow: pasteRange.startRow,
      endRow: pasteRange.endRow,
      startColumn: pasteRange.startColumn,
      endColumn: pasteRange.endColumn
    });
    if (!pasteRect) return { redos: [], undos: [] };
    const newTransform = { ...origRootGroup.transform, left: pasteRect.startX, top: pasteRect.startY };
    const allDrawings = [
      ...((_a = cloned.flatChildren) != null ? _a : []).map((d) => ({ ...d, unitId, subUnitId })),
      ...cloned.groups.map((d) => {
        var _a2, _b;
        if (d.drawingId !== newRootGroupId) {
          return { ...d, unitId, subUnitId };
        }
        return {
          ...d,
          unitId,
          subUnitId,
          transform: newTransform,
          sheetTransform: (_a2 = transformToDrawingPosition(newTransform, pasteToSkeleton)) != null ? _a2 : origRootGroup.sheetTransform,
          axisAlignSheetTransform: (_b = transformToAxisAlignPosition(newTransform, pasteToSkeleton)) != null ? _b : origRootGroup.sheetTransform
        };
      })
    ];
    const { undo: removeOp, redo: insertOp, objects } = this._sheetDrawingService.getBatchAddOp(allDrawings);
    const redos = [{
      id: SetDrawingApplyMutation.id,
      params: { op: insertOp, unitId, subUnitId, objects, type: 0 /* INSERT */ }
    }];
    const undos = [{
      id: SetDrawingApplyMutation.id,
      params: { op: removeOp, unitId, subUnitId, objects, type: 1 /* REMOVE */ }
    }];
    const featureMutations = this._getGroupFeaturePasteMutations({
      fromUnitId: this._copyInfo.unitId,
      fromSubUnitId: this._copyInfo.subUnitId,
      toUnitId: unitId,
      toSubUnitId: subUnitId,
      idMap,
      cloned
    });
    redos.push(...featureMutations.redos);
    undos.push(...featureMutations.undos);
    return { redos, undos };
  }
  dispose() {
    this._copyInfo = null;
    this._featurePasteHooks.length = 0;
    super.dispose();
  }
};
SheetsDrawingGroupCopyPasteController = __decorateClass([
  __decorateParam(0, ISheetClipboardService),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, Inject(SheetSkeletonService)),
  __decorateParam(3, ISheetDrawingService),
  __decorateParam(4, IDrawingManagerService)
], SheetsDrawingGroupCopyPasteController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-permission.controller.ts
var drawingObjectTypes = [
  3 /* IMAGE */,
  // floating image
  2 /* SHAPE */,
  // shape
  6 /* CHART */,
  // chart rect
  7 /* DRAWING_DOM */
  // floating dom rect
];
var SheetDrawingPermissionController = class extends Disposable {
  constructor(_commandService, _localeService, _renderManagerService, _permissionService, _univerInstanceService, _userManagerService, _sheetPermissionCheckController, _sheetDrawingService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_permissionService", _permissionService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_userManagerService", _userManagerService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    this._initDrawingVisible();
    this._initDrawingEditable();
    this._initViewPermissionChange();
    this._initEditPermissionChange();
    this._initCommandPermissionCheck();
  }
  _initDrawingVisible() {
    const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
    const currentUser$ = this._userManagerService.currentUser$;
    const combined$ = combineLatest([workbook$, currentUser$]);
    this.disposeWithMe(
      combined$.pipe(
        switchMap(([workbook, _]) => {
          if (!workbook) {
            this._sheetDrawingService.setDrawingVisible(false);
            return EMPTY;
          }
          return workbook.activeSheet$.pipe(
            tap((sheet) => {
              if (!sheet) {
                this._sheetDrawingService.setDrawingVisible(false);
                return;
              }
              const unitId = workbook.getUnitId();
              const subUnitId = sheet.getSheetId();
              const worksheetViewPermission = this._permissionService.composePermission([
                new WorkbookViewPermission(unitId).id,
                new WorksheetViewPermission(unitId, subUnitId).id
              ]).every((permission) => permission.value);
              if (worksheetViewPermission) {
                this._sheetDrawingService.setDrawingVisible(true);
              } else {
                this._handleDrawingVisibilityFalse(workbook, sheet);
              }
            })
          );
        })
      ).subscribe()
    );
  }
  _handleDrawingVisibilityFalse(workbook, sheet) {
    this._sheetDrawingService.setDrawingVisible(false);
    const unitId = workbook.getUnitId();
    const subUnitId = sheet.getSheetId();
    const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const drawingDataValues = Object.values(drawingData);
    const renderObject = this._renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (!scene) {
      return;
    }
    const objects = scene.getAllObjectsByOrder();
    objects.forEach((object) => {
      if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
        scene.removeObject(object);
      }
    });
  }
  _initDrawingEditable() {
    const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
    const currentUser$ = this._userManagerService.currentUser$;
    const combined$ = combineLatest([workbook$, currentUser$]);
    this.disposeWithMe(
      combined$.pipe(
        switchMap(([workbook, _]) => {
          if (!workbook) {
            this._sheetDrawingService.setDrawingEditable(false);
            return EMPTY;
          }
          return workbook.activeSheet$.pipe(
            tap((sheet) => {
              if (!sheet) {
                this._sheetDrawingService.setDrawingEditable(false);
                return;
              }
              const unitId = workbook.getUnitId();
              const subUnitId = sheet.getSheetId();
              const worksheetEditPermission = this._permissionService.composePermission([
                new WorkbookEditablePermission(unitId).id,
                new WorksheetEditPermission(unitId, subUnitId).id
              ]).every((permission) => permission.value);
              if (worksheetEditPermission) {
                this._sheetDrawingService.setDrawingEditable(true);
              } else {
                this._handleDrawingEditableFalse(workbook, sheet);
              }
            })
          );
        })
      ).subscribe()
    );
  }
  _handleDrawingEditableFalse(workbook, sheet) {
    this._sheetDrawingService.setDrawingEditable(false);
    const unitId = workbook.getUnitId();
    const subUnitId = sheet.getSheetId();
    const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const drawingDataValues = Object.values(drawingData);
    const renderObject = this._renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (!scene) {
      return;
    }
    const objects = scene.getAllObjectsByOrder();
    objects.forEach((object) => {
      if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
        scene.detachTransformerFrom(object);
      }
    });
  }
  // eslint-disable-next-line max-lines-per-function
  _initViewPermissionChange() {
    const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
    const currentUser$ = this._userManagerService.currentUser$;
    this.disposeWithMe(
      combineLatest([workbook$, currentUser$]).pipe(
        switchMap(([workbook, _]) => {
          if (!workbook) return EMPTY;
          return workbook.activeSheet$.pipe(
            switchMap((sheet) => {
              if (!sheet) {
                return EMPTY;
              }
              const unitId = workbook.getUnitId();
              const subUnitId = sheet.getSheetId();
              const renderObject = this._renderManagerService.getRenderById(unitId);
              const scene = renderObject == null ? void 0 : renderObject.scene;
              if (!scene) {
                return EMPTY;
              }
              const transformer = scene.getTransformerByCreate();
              const worksheetViewPermission$ = this._permissionService.composePermission$([
                new WorkbookViewPermission(unitId).id,
                new WorksheetViewPermission(unitId, subUnitId).id
              ]).pipe(
                map((permissions) => permissions.every((item) => item.value)),
                distinctUntilChanged()
              );
              return worksheetViewPermission$.pipe(
                map((permission) => ({
                  permission,
                  scene,
                  transformer,
                  unitId,
                  subUnitId
                }))
              );
            })
          );
        })
      ).subscribe({
        next: ({ permission, scene, transformer, unitId, subUnitId }) => {
          this._sheetDrawingService.setDrawingVisible(permission);
          const objects = scene.getAllObjectsByOrder();
          const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
          const drawingDataValues = Object.values(drawingData);
          if (permission) {
            this._sheetDrawingService.addNotification(drawingDataValues);
          } else {
            objects.forEach((object) => {
              if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                scene.removeObject(object);
              }
            });
            transformer.clearSelectedObjects();
          }
        },
        complete: () => {
          this._sheetDrawingService.setDrawingVisible(true);
          const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
          const sheet = workbook == null ? void 0 : workbook.getActiveSheet();
          const unitId = workbook == null ? void 0 : workbook.getUnitId();
          const subUnitId = sheet == null ? void 0 : sheet.getSheetId();
          if (!unitId || !subUnitId) {
            return;
          }
          const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
          const drawingDataValues = Object.values(drawingData);
          this._sheetDrawingService.addNotification(drawingDataValues);
        }
      })
    );
  }
  // eslint-disable-next-line max-lines-per-function
  _initEditPermissionChange() {
    const workbook$ = this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */);
    const currentUser$ = this._userManagerService.currentUser$;
    this.disposeWithMe(
      combineLatest([workbook$, currentUser$]).pipe(
        switchMap(([workbook, _]) => {
          if (!workbook) {
            return EMPTY;
          }
          return workbook.activeSheet$.pipe(
            switchMap((sheet) => {
              if (!sheet) {
                return EMPTY;
              }
              const unitId = workbook.getUnitId();
              const subUnitId = sheet.getSheetId();
              const renderObject = this._renderManagerService.getRenderById(unitId);
              const scene = renderObject == null ? void 0 : renderObject.scene;
              if (!scene) {
                return EMPTY;
              }
              const transformer = scene.getTransformerByCreate();
              const composeWorksheetEditPermission$ = this._permissionService.composePermission$([
                new WorkbookEditablePermission(unitId).id,
                new WorksheetEditPermission(unitId, subUnitId).id
              ]).pipe(
                map((permissions) => permissions.every((item) => item.value)),
                distinctUntilChanged()
              );
              return composeWorksheetEditPermission$.pipe(
                map((permission) => ({
                  permission,
                  scene,
                  transformer,
                  unitId,
                  subUnitId
                }))
              );
            })
          );
        })
      ).subscribe({
        next: ({ permission, scene, transformer, unitId, subUnitId }) => {
          this._sheetDrawingService.setDrawingEditable(permission);
          const objects = scene.getAllObjectsByOrder();
          const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
          const drawingDataValues = Object.values(drawingData);
          if (permission) {
            objects.forEach((object) => {
              if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                scene.attachTransformerTo(object);
              }
            });
            this._sheetDrawingService.addNotification(drawingDataValues);
          } else {
            objects.forEach((object) => {
              if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
                scene.detachTransformerFrom(object);
              }
            });
            transformer.clearSelectedObjects();
          }
        },
        complete: () => {
          const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
          if (!workbook) {
            return;
          }
          const unitId = workbook.getUnitId();
          const sheet = workbook.getActiveSheet();
          if (!sheet) {
            return;
          }
          const subUnitId = sheet.getSheetId();
          const renderObject = this._renderManagerService.getRenderById(unitId);
          const scene = renderObject == null ? void 0 : renderObject.scene;
          if (!scene) {
            return;
          }
          const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
          const drawingDataValues = Object.values(drawingData);
          this._sheetDrawingService.setDrawingEditable(true);
          const objects = scene.getAllObjectsByOrder();
          objects.forEach((object) => {
            if (drawingObjectTypes.includes(object.objectType) && drawingDataValues.some((item) => object.oKey.includes(item.drawingId))) {
              scene.detachTransformerFrom(object);
            }
          });
        }
      })
    );
  }
  _initCommandPermissionCheck() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        var _a, _b;
        let unitId;
        let subUnitId;
        if (command.id === InsertSheetDrawingCommand.id || command.id === RemoveSheetDrawingCommand.id || command.id === SetSheetDrawingCommand.id) {
          const params = command.params;
          const { drawings } = params;
          unitId = (_a = drawings == null ? void 0 : drawings[0]) == null ? void 0 : _a.unitId;
          subUnitId = (_b = drawings == null ? void 0 : drawings[0]) == null ? void 0 : _b.subUnitId;
        } else if (command.id === SetDrawingArrangeCommand.id) {
          const params = command.params;
          unitId = params.unitId;
          subUnitId = params.subUnitId;
        }
        if (!unitId || !subUnitId) {
          return;
        }
        const permission = this._sheetPermissionCheckController.permissionCheckWithoutRange({
          workbookTypes: [WorkbookEditablePermission],
          worksheetTypes: [WorksheetEditPermission]
        }, unitId, subUnitId);
        if (!permission) {
          this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-drawing-ui.permission.dialog.editErr"));
        }
      })
    );
  }
};
SheetDrawingPermissionController = __decorateClass([
  __decorateParam(0, Inject(ICommandService)),
  __decorateParam(1, Inject(LocaleService)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IPermissionService),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, Inject(UserManagerService)),
  __decorateParam(6, Inject(SheetPermissionCheckController)),
  __decorateParam(7, Inject(ISheetDrawingService))
], SheetDrawingPermissionController);

// ../packages/sheets-drawing-ui/src/services/canvas-float-dom-manager.service.ts
var SHEET_FLOAT_DOM_PREFIX = "univer-sheet-float-dom-";
function transformBound2DOMBound(posOfFloatObject, scene, skeleton, worksheet, floatDomInfo, skipBoundsOfViewArea = false) {
  const { scaleX, scaleY } = scene.getAncestorScale();
  const viewMain = scene.getViewport("viewMain" /* VIEW_MAIN */);
  const freeze = worksheet.getFreeze();
  const { startColumn: viewMainStartColumn, startRow: viewMainStartRow, xSplit: freezedCol, ySplit: freezedRow } = freeze;
  const absolute = {
    left: true,
    // left means the left of pic is in a viewMainLeft
    top: true
  };
  if (!viewMain) {
    return {
      ...posOfFloatObject,
      absolute
    };
  }
  const { left, right, top, bottom } = posOfFloatObject;
  let { top: viewBoundsTop, left: viewBoundsLeft, viewportScrollX, viewportScrollY } = viewMain;
  const { boundsOfViewArea: specBoundsOfViewArea, scrollDirectionResponse } = floatDomInfo || {};
  const { rowHeaderWidth, columnHeaderHeight } = skeleton;
  const boundsOfViewArea = {
    top: skipBoundsOfViewArea ? 0 : columnHeaderHeight,
    left: skipBoundsOfViewArea ? 0 : rowHeaderWidth
  };
  if (specBoundsOfViewArea) {
    if (Tools.isDefine(boundsOfViewArea.top)) {
      boundsOfViewArea.top = specBoundsOfViewArea.top;
    }
    if (Tools.isDefine(boundsOfViewArea.left)) {
      boundsOfViewArea.left = specBoundsOfViewArea.left;
    }
  }
  if (scrollDirectionResponse === "HORIZONTAL" /* HORIZONTAL */) {
    viewportScrollY = 0;
  }
  if (scrollDirectionResponse === "VERTICAL" /* VERTICAL */) {
    viewportScrollX = 0;
  }
  let offsetLeft = 0;
  let offsetRight = 0;
  const freezeStartY = skeleton.rowStartY(viewMainStartRow - freezedRow) + columnHeaderHeight;
  const freezeStartX = skeleton.colStartX(viewMainStartColumn - freezedCol) + rowHeaderWidth;
  const freezeEndY = skeleton.rowStartY(viewMainStartRow) + columnHeaderHeight;
  const freezeEndX = skeleton.colStartX(viewMainStartColumn) + rowHeaderWidth;
  if (freezedCol === 0) {
    absolute.left = false;
    offsetLeft = (left - viewportScrollX) * scaleX;
    offsetRight = (right - viewportScrollX) * scaleX;
  } else {
    const leftToCanvas = left - (freezeStartX - rowHeaderWidth);
    const rightToCanvas = right - (freezeStartX - rowHeaderWidth);
    if (right < freezeEndX) {
      offsetLeft = leftToCanvas * scaleX;
      offsetRight = rightToCanvas * scaleX;
    } else if (left <= freezeEndX && right >= freezeEndX) {
      offsetLeft = leftToCanvas * scaleX;
      offsetRight = Math.max(viewBoundsLeft, (right - viewportScrollX) * scaleX);
    } else if (left > freezeEndX) {
      absolute.left = false;
      offsetLeft = Math.max((left - viewportScrollX) * scaleX, viewBoundsLeft);
      offsetRight = Math.max((right - viewportScrollX) * scaleX, viewBoundsLeft);
    }
  }
  let offsetTop = 0;
  let offsetBottom = 0;
  if (freezedRow === 0) {
    absolute.top = false;
    offsetTop = (top - viewportScrollY) * scaleY;
    offsetBottom = (bottom - viewportScrollY) * scaleY;
  } else {
    const topToCanvas = top - (freezeStartY - columnHeaderHeight);
    const bottomToCanvas = bottom - (freezeStartY - columnHeaderHeight);
    if (bottom < freezeEndY) {
      offsetTop = topToCanvas * scaleY;
      offsetBottom = bottomToCanvas * scaleY;
    } else if (top <= freezeEndY && bottom >= freezeEndY) {
      offsetTop = topToCanvas * scaleY;
      offsetBottom = Math.max(viewBoundsTop, (bottom - viewportScrollY) * scaleY);
    } else if (top > freezeEndY) {
      absolute.top = false;
      offsetTop = Math.max((top - viewportScrollY) * scaleY, viewBoundsTop);
      offsetBottom = Math.max((bottom - viewportScrollY) * scaleY, viewBoundsTop);
    }
  }
  offsetLeft = Math.max(offsetLeft, boundsOfViewArea.left);
  offsetTop = Math.max(offsetTop, boundsOfViewArea.top);
  offsetRight = Math.max(offsetRight, boundsOfViewArea.left);
  offsetBottom = Math.max(offsetBottom, boundsOfViewArea.top);
  const rs = {
    left: offsetLeft,
    right: offsetRight,
    top: offsetTop,
    bottom: offsetBottom,
    absolute
  };
  return rs;
}
var calcSheetFloatDomPosition = (floatObject, scene, skeleton, worksheet, floatDomInfo) => {
  const { left, top, width, height, angle } = floatObject;
  const boundOfFloatObject = {
    left,
    right: left + width,
    top,
    bottom: top + height
  };
  const offsetBound = transformBound2DOMBound(boundOfFloatObject, scene, skeleton, worksheet, floatDomInfo);
  const { scaleX, scaleY } = scene.getAncestorScale();
  const domPos = {
    startX: offsetBound.left,
    endX: offsetBound.right,
    startY: offsetBound.top,
    endY: offsetBound.bottom,
    rotate: angle,
    width: width * scaleX,
    height: height * scaleY,
    absolute: offsetBound.absolute
  };
  return domPos;
};
var SheetCanvasFloatDomManagerService = class extends Disposable {
  constructor(_renderManagerService, _univerInstanceService, _commandService, _drawingManagerService, _canvasFloatDomService, _sheetDrawingService, _lifecycleService) {
    super();
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_canvasFloatDomService", _canvasFloatDomService);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_lifecycleService", _lifecycleService);
    /**
     * for update dom container position when scrolling and zoom
     */
    __publicField(this, "_domLayerInfoMap", /* @__PURE__ */ new Map());
    __publicField(this, "_transformChange$", new Subject());
    __publicField(this, "transformChange$", this._transformChange$.asObservable());
    __publicField(this, "_add$", new Subject());
    __publicField(this, "add$", this._add$.asObservable());
    __publicField(this, "_remove$", new Subject());
    __publicField(this, "remove$", this._remove$.asObservable());
    this._drawingAddListener();
    this._featureUpdateListener();
    this._deleteListener();
    this._bindScrollEvent();
  }
  _bindScrollEvent() {
    this._lifecycleService.lifecycle$.pipe(filter((s) => s === 2 /* Rendered */), take(1)).subscribe(() => {
      this._scrollUpdateListener();
    });
  }
  getFloatDomInfo(id) {
    return this._domLayerInfoMap.get(id);
  }
  getFloatDomsBySubUnitId(unitId, subUnitId) {
    return Array.from(this._domLayerInfoMap.values()).filter((info) => info.subUnitId === subUnitId && info.unitId === unitId);
  }
  _getSceneAndTransformerByDrawingSearch(unitId) {
    if (unitId == null) {
      return;
    }
    const renderUnit = this._renderManagerService.getRenderById(unitId);
    const scene = renderUnit == null ? void 0 : renderUnit.scene;
    if (renderUnit == null || scene == null) {
      return null;
    }
    const transformer = scene.getTransformerByCreate();
    const canvas = renderUnit.engine.getCanvasElement();
    return { scene, transformer, renderUnit, canvas };
  }
  // eslint-disable-next-line max-lines-per-function
  _drawingAddListener() {
    this.disposeWithMe(
      // eslint-disable-next-line max-lines-per-function
      this._drawingManagerService.add$.subscribe((params) => {
        params.forEach((param) => {
          var _a;
          const { unitId, subUnitId, drawingId } = param;
          const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
          const floatDomParam = this._drawingManagerService.getDrawingByParam(param);
          const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
          if (!workbook) {
            return;
          }
          const activeSheetId = workbook.getActiveSheet().getSheetId();
          if (!floatDomParam || !target) {
            return;
          }
          const skeleton = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
          if (!skeleton) {
            return;
          }
          const { transform, drawingType, data, hidden } = floatDomParam;
          if (drawingType !== 8 /* DRAWING_DOM */ && drawingType !== 2 /* DRAWING_CHART */) {
            return;
          }
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          if (hidden) {
            return;
          }
          const { scene, canvas } = renderObject;
          if (transform == null) {
            return true;
          }
          if (activeSheetId !== subUnitId) {
            return;
          }
          const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
          const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const rectShape = scene.getObject(rectShapeKey);
          if (rectShape != null) {
            rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
            return;
          }
          const imageConfig = {
            left,
            top,
            width,
            height,
            zIndex: this._drawingManagerService.getDrawingOrder(unitId, subUnitId).length - 1
          };
          const isChart = drawingType === 2 /* DRAWING_CHART */;
          imageConfig.rotateEnabled = false;
          if (isChart) {
            const backgroundColor = data ? data.backgroundColor : "white";
            imageConfig.fill = backgroundColor;
            if (data && data.border) {
              imageConfig.stroke = data.border;
            }
            imageConfig.paintFirst = "stroke";
            imageConfig.strokeWidth = 1;
            imageConfig.borderEnabled = false;
            imageConfig.radius = 8;
          }
          const rect = new Rect(rectShapeKey, imageConfig);
          if (isChart) {
            rect.setObjectType(6 /* CHART */);
          } else if (drawingType === 8 /* DRAWING_DOM */) {
            rect.setObjectType(7 /* DRAWING_DOM */);
          }
          scene.addObject(rect, DRAWING_OBJECT_LAYER_INDEX);
          if (floatDomParam.allowTransform !== false) {
            scene.attachTransformerTo(rect);
          }
          const disposableCollection = new DisposableCollection();
          const initPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
          const position$ = new BehaviorSubject(initPosition);
          const domId = `${SHEET_FLOAT_DOM_PREFIX}${generateRandomId(6)}`;
          const info = {
            dispose: disposableCollection,
            rect,
            position$,
            unitId,
            subUnitId,
            id: drawingId,
            domId
          };
          this._canvasFloatDomService.addFloatDom({
            position$,
            id: drawingId,
            domId,
            componentKey: floatDomParam.componentKey,
            onPointerDown: (evt) => {
              canvas.dispatchEvent(new PointerEvent(evt.type, evt));
            },
            onPointerMove: (evt) => {
              canvas.dispatchEvent(new PointerEvent(evt.type, evt));
            },
            onPointerUp: (evt) => {
              canvas.dispatchEvent(new PointerEvent(evt.type, evt));
            },
            onWheel: (evt) => {
              canvas.dispatchEvent(new WheelEvent(evt.type, evt));
            },
            data,
            unitId
          });
          const listener = rect.onTransformChange$.subscribeEvent(() => {
            const newPosition = calcSheetFloatDomPosition(rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet);
            position$.next(
              newPosition
            );
          });
          disposableCollection.add(() => {
            this._canvasFloatDomService.removeFloatDom(drawingId);
          });
          listener && disposableCollection.add(listener);
          this._domLayerInfoMap.set(drawingId, info);
        });
      })
    );
    this.disposeWithMe(
      this._drawingManagerService.remove$.subscribe((params) => {
        params.forEach((param) => {
          var _a;
          const { unitId, subUnitId, drawingId } = param;
          const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
          if (renderObject == null) {
            return;
          }
          const { transformer, scene } = renderObject;
          const rectShape = scene.getObject(rectShapeKey);
          if (rectShape == null ? void 0 : rectShape.oKey) {
            transformer.clearControlByIds([rectShape == null ? void 0 : rectShape.oKey]);
            (_a = scene.getTransformer()) == null ? void 0 : _a.clearSelectedObjects();
          }
        });
      })
    );
  }
  _scrollUpdateListener() {
    const updateSheet = (unitId, subUnitId) => {
      var _a;
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      const ids = Array.from(this._domLayerInfoMap.keys()).map((id) => ({ id, ...this._domLayerInfoMap.get(id) })).filter((info) => info.subUnitId === subUnitId && info.unitId === unitId).map((info) => info.id);
      const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
      const skeleton = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
      if (!renderObject || !target || !skeleton) {
        return;
      }
      ids.forEach((id) => {
        const floatDomInfo = this._domLayerInfoMap.get(id);
        if (floatDomInfo) {
          const position = calcSheetFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit.scene, skeleton.skeleton, target.worksheet, floatDomInfo);
          floatDomInfo.position$.next(position);
        }
      });
    };
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(
        switchMap((workbook) => workbook ? workbook.activeSheet$ : of(null)),
        map((worksheet) => {
          if (!worksheet) return null;
          const unitId = worksheet.getUnitId();
          const render2 = this._renderManagerService.getRenderById(unitId);
          return render2 ? { render: render2, unitId, subUnitId: worksheet.getSheetId() } : null;
        }),
        switchMap(
          (render2) => render2 ? fromEventSubject(render2.render.scene.getViewport("viewMain" /* VIEW_MAIN */).onScrollAfter$).pipe(map(() => ({ unitId: render2.unitId, subUnitId: render2.subUnitId }))) : of(null)
        )
      ).subscribe((value) => {
        if (!value) return;
        const { unitId, subUnitId } = value;
        updateSheet(unitId, subUnitId);
      })
    );
    this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === SetZoomRatioOperation.id) {
        const params = commandInfo.params;
        const { unitId } = params;
        const subUnitIds = Array.from(this._domLayerInfoMap.values()).filter((info) => info.unitId === unitId).map((info) => info.subUnitId);
        subUnitIds.forEach((subUnitId) => {
          updateSheet(unitId, subUnitId);
        });
      } else if (commandInfo.id === SetFrozenMutation.id) {
        const { unitId, subUnitId } = commandInfo.params;
        updateSheet(unitId, subUnitId);
      } else if (commandInfo.id === SetSelectionsOperation.id) {
        const { unitId, subUnitId } = commandInfo.params;
        updateSheet(unitId, subUnitId);
      }
    }));
  }
  updateFloatDomProps(unitId, subUnitId, id, props) {
    const info = this._domLayerInfoMap.get(id);
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (info && renderObject) {
      const { scene } = renderObject;
      const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: id });
      const rectShape = scene.getObject(rectShapeKey);
      if (rectShape && rectShape instanceof Rect) {
        rectShape.setProps(props);
      }
    }
  }
  _getPosition(position, unitId) {
    var _a;
    const { startX, endX, startY, endY } = position;
    const selectionRenderService = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(ISheetSelectionRenderService);
    if (selectionRenderService == null) {
      return;
    }
    const start = selectionRenderService.getCellWithCoordByOffset(startX, startY);
    if (start == null) {
      return;
    }
    const from = {
      column: start.actualColumn,
      columnOffset: startX - start.startX,
      row: start.actualRow,
      rowOffset: startY - start.startY
    };
    const end = selectionRenderService.getCellWithCoordByOffset(endX, endY);
    if (end == null) {
      return;
    }
    const to = {
      column: end.actualColumn,
      columnOffset: endX - end.startX,
      row: end.actualRow,
      rowOffset: endY - end.startY
    };
    return {
      from,
      to
    };
  }
  _featureUpdateListener() {
    this.disposeWithMe(
      this._drawingManagerService.update$.subscribe((params) => {
        params.forEach((data) => {
          const sheetDrawing = this._drawingManagerService.getDrawingByParam(data);
          if (!sheetDrawing) {
            return;
          }
          if (sheetDrawing.drawingType !== 8 /* DRAWING_DOM */ && sheetDrawing.drawingType !== 2 /* DRAWING_CHART */) {
            return;
          }
          const newValue = {
            ...sheetDrawing.transform
          };
          this._transformChange$.next({ id: data.drawingId, value: newValue });
          this._canvasFloatDomService.updateFloatDom(data.drawingId, {
            ...sheetDrawing
          });
          const renderObject = this._getSceneAndTransformerByDrawingSearch(data.unitId);
          if (renderObject && sheetDrawing.drawingType !== 2 /* DRAWING_CHART */) {
            const { scene } = renderObject;
            const floatDomInfo = this._domLayerInfoMap.get(data.drawingId);
            if (floatDomInfo == null ? void 0 : floatDomInfo.rect) {
              if (sheetDrawing.allowTransform === false) {
                scene.detachTransformerFrom(floatDomInfo.rect);
              } else {
                scene.attachTransformerTo(floatDomInfo.rect);
              }
            }
          }
        });
      })
    );
  }
  _deleteListener() {
    this.disposeWithMe(
      this._drawingManagerService.remove$.subscribe((params) => {
        params.forEach((param) => {
          this._removeDom(param.drawingId);
        });
      })
    );
  }
  // CreateFloatDomCommand --> floatDomService.addFloatDomToPosition
  addFloatDomToPosition(layer, propId) {
    const target = getSheetCommandTarget(this._univerInstanceService, {
      unitId: layer.unitId,
      subUnitId: layer.subUnitId
    });
    if (!target) {
      throw new Error("cannot find current target!");
    }
    const { unitId, subUnitId } = target;
    const { initPosition, componentKey, data, allowTransform = true } = layer;
    const id = propId != null ? propId : generateRandomId();
    const sheetTransform = this._getPosition(initPosition, unitId);
    if (sheetTransform == null) {
      return;
    }
    const sheetDrawingParam = {
      unitId,
      subUnitId,
      drawingId: id,
      drawingType: layer.type || 8 /* DRAWING_DOM */,
      componentKey,
      sheetTransform,
      transform: {
        left: initPosition.startX,
        top: initPosition.startY,
        width: initPosition.endX - initPosition.startX,
        height: initPosition.endY - initPosition.startY
      },
      axisAlignSheetTransform: sheetTransform,
      data,
      allowTransform
    };
    this._commandService.executeCommand(InsertSheetDrawingCommand.id, {
      unitId,
      drawings: [sheetDrawingParam]
    });
    this._add$.next({ unitId, subUnitId, id });
    return {
      id,
      dispose: () => {
        this._removeDom(id, true);
      }
    };
  }
  _removeDom(id, removeDrawing = false) {
    const info = this._domLayerInfoMap.get(id);
    if (!info) {
      return;
    }
    const { unitId, subUnitId } = info;
    this._domLayerInfoMap.delete(id);
    info.dispose.dispose();
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (renderObject) {
      renderObject.scene.removeObject(info.rect);
    }
    if (removeDrawing) {
      const param = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId: id });
      if (!param) {
        return;
      }
      const jsonOp = this._sheetDrawingService.getBatchRemoveOp([param]);
      const { redo, objects } = jsonOp;
      this._commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: 1 /* REMOVE */ });
    }
  }
  removeFloatDom(id, removeDrawing = true) {
    this._removeDom(id, removeDrawing);
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  addFloatDomToRange(range, config, domAnchor, propId) {
    var _a, _b, _c;
    const target = getSheetCommandTarget(this._univerInstanceService, {
      unitId: config.unitId,
      subUnitId: config.subUnitId
    });
    if (!target) {
      throw new Error("cannot find current target!");
    }
    const { unitId, subUnitId } = target;
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (!renderObject) return;
    const currentRender = this._renderManagerService.getRenderById(unitId);
    if (!currentRender) return;
    const skeletonParam = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
    if (!skeletonParam) return;
    const { componentKey, data, allowTransform = true } = config;
    const id = propId != null ? propId : generateRandomId();
    const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver(range, currentRender, skeletonParam.skeleton);
    const sheetTransform = this._getPosition(rangePosition, unitId);
    if (sheetTransform == null) {
      return;
    }
    const scene = renderObject.scene;
    const { scaleX } = scene.getAncestorScale();
    const domPosFromRange = calcDomPositionByAnchor(rangePosition, domAnchor, scaleX);
    const sheetDrawingParam = {
      unitId,
      subUnitId,
      drawingId: id,
      drawingType: config.type || 8 /* DRAWING_DOM */,
      componentKey,
      sheetTransform,
      axisAlignSheetTransform: sheetTransform,
      transform: {
        left: domPosFromRange.startX,
        top: domPosFromRange.startY,
        width: domPosFromRange.width,
        height: domPosFromRange.height
      },
      data,
      allowTransform
    };
    {
      const { unitId: unitId2, subUnitId: subUnitId2, drawingId } = sheetDrawingParam;
      const target2 = getSheetCommandTarget(this._univerInstanceService, { unitId: unitId2, subUnitId: subUnitId2 });
      const floatDomParam = sheetDrawingParam;
      const workbook = this._univerInstanceService.getUnit(unitId2, 2 /* UNIVER_SHEET */);
      if (!workbook) {
        return;
      }
      const activeSheetId = workbook.getActiveSheet().getSheetId();
      if (!floatDomParam || !target2) {
        return;
      }
      const skMangerService = (_b = this._renderManagerService.getRenderById(unitId2)) == null ? void 0 : _b.with(SheetSkeletonManagerService);
      if (!skMangerService) {
        return;
      }
      const skeletonParam2 = skMangerService.getSkeletonParam(subUnitId2);
      if (!skeletonParam2) {
        return;
      }
      const { transform, drawingType, data: data2 } = floatDomParam;
      if (drawingType !== 8 /* DRAWING_DOM */ && drawingType !== 2 /* DRAWING_CHART */) {
        return;
      }
      const renderObject2 = this._getSceneAndTransformerByDrawingSearch(unitId2);
      if (renderObject2 == null) {
        return;
      }
      const { scene: scene2, canvas } = renderObject2;
      if (transform == null) {
        return;
      }
      if (activeSheetId !== subUnitId2) {
        return;
      }
      const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
      const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId: unitId2, subUnitId: subUnitId2, drawingId });
      const rectShape = scene2.getObject(rectShapeKey);
      if (rectShape != null) {
        rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
        return;
      }
      const domConfig = {
        left,
        // from floatDomParam.transform
        top,
        width,
        height,
        zIndex: this._drawingManagerService.getDrawingOrder(unitId2, subUnitId2).length - 1
      };
      const isChart = drawingType === 2 /* DRAWING_CHART */;
      if (isChart) {
        const backgroundColor = data2 ? data2.backgroundColor : "white";
        domConfig.fill = backgroundColor;
        domConfig.rotateEnabled = false;
        if (data2 && data2.border) {
          domConfig.stroke = data2.border;
        }
        domConfig.paintFirst = "stroke";
        domConfig.strokeWidth = 1;
        domConfig.borderEnabled = false;
        domConfig.radius = 8;
      }
      const domRect = new Rect(rectShapeKey, domConfig);
      if (isChart) {
        domRect.setObjectType(6 /* CHART */);
      }
      scene2.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
      if (floatDomParam.allowTransform !== false) {
        scene2.attachTransformerTo(domRect);
      }
      const disposableCollection = new DisposableCollection();
      const viewMain = scene2.getMainViewport();
      const { rowHeaderWidth, columnHeaderHeight } = skeletonParam2.skeleton;
      const boundsOfViewArea = {
        top: columnHeaderHeight,
        left: rowHeaderWidth,
        bottom: viewMain.bottom,
        right: viewMain.right
      };
      const floatDomInfo = {
        dispose: disposableCollection,
        rect: domRect,
        boundsOfViewArea,
        domAnchor,
        unitId: unitId2,
        subUnitId: subUnitId2,
        id: drawingId
      };
      const initedPosition = calcSheetFloatDomPosition(domRect, renderObject2.renderUnit.scene, skeletonParam2.skeleton, target2.worksheet, floatDomInfo);
      const position$ = new BehaviorSubject(initedPosition);
      floatDomInfo.position$ = position$;
      let floatDomCfg = {
        position$,
        id: drawingId,
        componentKey: floatDomParam.componentKey,
        onPointerDown: () => {
        },
        onPointerMove: () => {
        },
        onPointerUp: () => {
        },
        onWheel: (evt) => {
          canvas.dispatchEvent(new WheelEvent(evt.type, evt));
        },
        data: data2,
        unitId: unitId2
      };
      if (config.eventPassThrough) {
        floatDomCfg = {
          ...floatDomCfg,
          onPointerDown: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          },
          onPointerMove: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          },
          onPointerUp: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          }
        };
      }
      this._canvasFloatDomService.addFloatDom(floatDomCfg);
      this.disposeWithMe(rangePos$.subscribe((newRangePos) => {
        var _a2, _b2, _c2, _d;
        const calcOffsetPos = calcDomPositionByAnchor({
          rotate: 0,
          startX: newRangePos.startX,
          startY: newRangePos.startY,
          endX: newRangePos.endX,
          endY: newRangePos.endY,
          width: (_a2 = domAnchor.width) != null ? _a2 : newRangePos.width,
          height: (_b2 = domAnchor.height) != null ? _b2 : newRangePos.height,
          absolute: {
            left: rangePosition.absolute.left,
            top: rangePosition.absolute.top
          }
        }, domAnchor);
        const rectShapeKey2 = getDrawingShapeKeyByDrawingSearch({ unitId: unitId2, subUnitId: subUnitId2, drawingId });
        const newRect = new Rect(rectShapeKey2, {
          left: calcOffsetPos.startX,
          top: calcOffsetPos.startY,
          width: (_c2 = domAnchor.width) != null ? _c2 : newRangePos.width,
          height: (_d = domAnchor.height) != null ? _d : newRangePos.height,
          zIndex: this._drawingManagerService.getDrawingOrder(unitId2, subUnitId2).length - 1
        });
        const newPos = calcSheetFloatDomPosition(newRect, renderObject2.renderUnit.scene, skeletonParam2.skeleton, target2.worksheet, floatDomInfo);
        position$.next(newPos);
      }));
      const skm = (_c = this._renderManagerService.getRenderById(unitId2)) == null ? void 0 : _c.with(SheetSkeletonManagerService);
      const skeletonSubscription = skm == null ? void 0 : skm.currentSkeleton$.subscribe((skeleton) => {
        if (!skeleton) return;
        if (skeletonParam2.sheetId !== skeleton.sheetId) {
          this._removeDom(id, true);
        }
      });
      skeletonSubscription && disposableCollection.add(skeletonSubscription);
      const listener = domRect.onTransformChange$.subscribeEvent(() => {
        const newPosition = calcSheetFloatDomPosition(domRect, renderObject2.renderUnit.scene, skeletonParam2.skeleton, target2.worksheet, floatDomInfo);
        position$.next(
          newPosition
        );
      });
      disposableCollection.add(() => {
        this._canvasFloatDomService.removeFloatDom(drawingId);
      });
      listener && disposableCollection.add(listener);
      this._domLayerInfoMap.set(drawingId, floatDomInfo);
    }
    return {
      id,
      dispose: () => {
        this._removeDom(id, true);
      }
    };
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  addFloatDomToColumnHeader(column, config, domLayoutParam, propId) {
    var _a, _b, _c;
    const target = getSheetCommandTarget(this._univerInstanceService, {
      unitId: config.unitId,
      subUnitId: config.subUnitId
    });
    if (!target) {
      throw new Error("cannot find current target!");
    }
    const { unitId, subUnitId } = target;
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (!renderObject) return;
    const currentRender = this._renderManagerService.getRenderById(unitId);
    if (!currentRender) return;
    const skeletonParam = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
    if (!skeletonParam) return;
    const { componentKey, data, allowTransform = true } = config;
    const id = propId != null ? propId : generateRandomId();
    const { position: rangePosition, position$: rangePos$ } = this._createRangePositionObserver({
      startRow: 0,
      endRow: 0,
      startColumn: column,
      endColumn: column
    }, currentRender, skeletonParam.skeleton);
    const headerCellPosition = rangePosition;
    headerCellPosition.startY = 0;
    const sheetTransform = this._getPosition(rangePosition, unitId);
    if (sheetTransform == null) {
      return;
    }
    const sheetDrawingParam = {
      unitId,
      subUnitId,
      drawingId: id,
      drawingType: config.type || 8 /* DRAWING_DOM */,
      componentKey,
      sheetTransform,
      axisAlignSheetTransform: sheetTransform,
      transform: {
        left: headerCellPosition.startX,
        top: headerCellPosition.startY,
        width: headerCellPosition.width,
        height: headerCellPosition.height
      },
      data,
      allowTransform
    };
    {
      const { unitId: unitId2, subUnitId: subUnitId2, drawingId } = sheetDrawingParam;
      const target2 = getSheetCommandTarget(this._univerInstanceService, { unitId: unitId2, subUnitId: subUnitId2 });
      const floatDomParam = sheetDrawingParam;
      const workbook = this._univerInstanceService.getUnit(unitId2, 2 /* UNIVER_SHEET */);
      if (!workbook) {
        return;
      }
      const activeSheetId = workbook.getActiveSheet().getSheetId();
      if (!floatDomParam || !target2) {
        return;
      }
      const skMangerService = (_b = this._renderManagerService.getRenderById(unitId2)) == null ? void 0 : _b.with(SheetSkeletonManagerService);
      if (!skMangerService) {
        return;
      }
      const skeleton = skMangerService.getSkeletonParam(subUnitId2);
      if (!skeleton) {
        return;
      }
      const { transform, data: data2 } = floatDomParam;
      const renderObject2 = this._getSceneAndTransformerByDrawingSearch(unitId2);
      if (renderObject2 == null) {
        return;
      }
      const { scene, canvas } = renderObject2;
      if (transform == null) {
        return;
      }
      if (activeSheetId !== subUnitId2) {
        return;
      }
      const { left, top, width, height, angle, flipX, flipY, skewX, skewY } = transform;
      const rectShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId: unitId2, subUnitId: subUnitId2, drawingId });
      const rectShape = scene.getObject(rectShapeKey);
      if (rectShape != null) {
        rectShape.transformByState({ left, top, width, height, angle, flipX, flipY, skewX, skewY });
        return;
      }
      const calcOffsetPos = calcDomPositionByAnchor({
        rotate: 0,
        startX: headerCellPosition.startX,
        startY: 0,
        endX: rangePosition.endX,
        endY: rangePosition.endY,
        width: domLayoutParam.width,
        height: domLayoutParam.height,
        absolute: {
          left: rangePosition.absolute.left,
          top: rangePosition.absolute.top
        }
      }, domLayoutParam);
      const headerRectConfig = {
        left: calcOffsetPos.startX,
        top: calcOffsetPos.startY,
        width: calcOffsetPos.width,
        height: calcOffsetPos.height,
        zIndex: this._drawingManagerService.getDrawingOrder(unitId2, subUnitId2).length - 1
      };
      const domRect = new Rect(rectShapeKey, headerRectConfig);
      scene.addObject(domRect, DRAWING_OBJECT_LAYER_INDEX);
      if (floatDomParam.allowTransform !== false) {
        scene.attachTransformerTo(domRect);
      }
      const disposableCollection = new DisposableCollection();
      const viewMain = scene.getMainViewport();
      const boundsOfViewArea = {
        top: 0,
        //viewMain.top,
        left: viewMain.left,
        bottom: viewMain.bottom,
        right: viewMain.right
      };
      const floatDomInfo = {
        dispose: disposableCollection,
        rect: domRect,
        // position$,
        unitId: unitId2,
        subUnitId: subUnitId2,
        id: drawingId,
        boundsOfViewArea,
        domAnchor: domLayoutParam,
        scrollDirectionResponse: "HORIZONTAL" /* HORIZONTAL */
      };
      const initedPosition = calcSheetFloatDomPosition(domRect, renderObject2.renderUnit.scene, skeleton.skeleton, target2.worksheet, floatDomInfo);
      const position$ = new BehaviorSubject(initedPosition);
      floatDomInfo.position$ = position$;
      let floatDomCfg = {
        position$,
        id: drawingId,
        componentKey: floatDomParam.componentKey,
        onPointerDown: () => {
        },
        onPointerMove: () => {
        },
        onPointerUp: () => {
        },
        onWheel: (evt) => {
          canvas.dispatchEvent(new WheelEvent(evt.type, evt));
        },
        data: data2,
        unitId: unitId2
      };
      if (config.eventPassThrough) {
        floatDomCfg = {
          ...floatDomCfg,
          onPointerDown: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          },
          onPointerMove: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          },
          onPointerUp: (evt) => {
            canvas.dispatchEvent(new PointerEvent(evt.type, evt));
          }
        };
      }
      this._canvasFloatDomService.addFloatDom(floatDomCfg);
      const listener = domRect.onTransformChange$.subscribeEvent(() => {
        const newPosition = calcSheetFloatDomPosition(domRect, renderObject2.renderUnit.scene, skeleton.skeleton, target2.worksheet, floatDomInfo);
        position$.next(
          newPosition
        );
      });
      this.disposeWithMe(rangePos$.subscribe((newHeaderPos) => {
        const calcOffsetPos2 = calcDomPositionByAnchor({
          rotate: 0,
          startX: newHeaderPos.startX,
          startY: 0,
          endX: newHeaderPos.endX,
          endY: newHeaderPos.endY,
          width: domLayoutParam.width,
          height: domLayoutParam.height,
          absolute: {
            left: rangePosition.absolute.left,
            top: rangePosition.absolute.top
          }
        }, domLayoutParam);
        const rectShapeKey2 = getDrawingShapeKeyByDrawingSearch({ unitId: unitId2, subUnitId: subUnitId2, drawingId });
        const newRect = new Rect(rectShapeKey2, {
          left: calcOffsetPos2.startX,
          top: 0,
          width: domLayoutParam.width,
          height: domLayoutParam.height,
          zIndex: this._drawingManagerService.getDrawingOrder(unitId2, subUnitId2).length - 1
        });
        const newPos = calcSheetFloatDomPosition(newRect, renderObject2.renderUnit.scene, skeleton.skeleton, target2.worksheet, floatDomInfo);
        position$.next(newPos);
      }));
      const skm = (_c = this._renderManagerService.getRenderById(unitId2)) == null ? void 0 : _c.with(SheetSkeletonManagerService);
      skm == null ? void 0 : skm.currentSkeleton$.subscribe((skeleton2) => {
        if (!skeleton2) return;
        if (skeletonParam.sheetId !== skeleton2.sheetId) {
          this._removeDom(id, true);
        }
      });
      disposableCollection.add(() => {
        this._canvasFloatDomService.removeFloatDom(drawingId);
      });
      listener && disposableCollection.add(listener);
      this._domLayerInfoMap.set(drawingId, floatDomInfo);
    }
    return {
      id,
      dispose: () => {
        this._removeDom(id, true);
      }
    };
  }
  /**
   * Unlike _createCellPositionObserver, this accept a range not a single cell.
   *
   * @param initialRow
   * @param initialCol
   * @param currentRender
   * @param skeleton
   * @param activeViewport
   * @returns position of cell to canvas.
   */
  // eslint-disable-next-line max-lines-per-function
  _createRangePositionObserver(range, currentRender, skeleton) {
    let { startRow, startColumn } = range;
    const topLeftCoord = calcCellPositionByCell(startRow, startColumn, skeleton);
    const topLeftPos$ = new BehaviorSubject(topLeftCoord);
    const rightBottomCoord = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
    const rightBottomPos$ = new BehaviorSubject(rightBottomCoord);
    const updatePosition = () => {
      const topLeftCoord2 = calcCellPositionByCell(startRow, startColumn, skeleton);
      const rightBottomCoord2 = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
      topLeftPos$.next(topLeftCoord2);
      rightBottomPos$.next(rightBottomCoord2);
    };
    const disposable = new DisposableCollection();
    disposable.add(currentRender.engine.clientRect$.subscribe(() => updatePosition()));
    disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
        const params = commandInfo.params;
        if (params.rowsAutoHeightInfo.findIndex((item) => item.row === startRow) > -1) {
          updatePosition();
          return;
        }
      }
      if (COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1 || commandInfo.id === SetScrollOperation.id || commandInfo.id === SetZoomRatioOperation.id) {
        updatePosition();
      }
    }));
    const updateRowCol = (newRow, newCol) => {
      startRow = newRow;
      startColumn = newCol;
      updatePosition();
    };
    const genPosition = () => {
      return {
        rotate: 0,
        width: rightBottomCoord.right - topLeftCoord.left,
        height: rightBottomCoord.bottom - topLeftCoord.top,
        absolute: {
          left: true,
          top: true
        },
        startX: topLeftCoord.left,
        startY: topLeftCoord.top,
        endX: rightBottomCoord.right,
        endY: rightBottomCoord.bottom
      };
    };
    const position$ = topLeftPos$.pipe(
      map((topLeft) => {
        const rightBottomCoord2 = calcCellPositionByCell(range.endRow, range.endColumn, skeleton);
        return {
          rotate: 0,
          width: rightBottomCoord2.right - topLeft.left,
          height: rightBottomCoord2.bottom - topLeft.top,
          absolute: {
            left: true,
            top: true
          },
          startX: topLeft.left,
          startY: topLeft.top,
          endX: rightBottomCoord2.right,
          endY: rightBottomCoord2.bottom
        };
      })
    );
    const position = genPosition();
    return {
      position$,
      position,
      updateRowCol,
      topLeftPos$,
      rightBottomPos$,
      disposable
    };
  }
};
SheetCanvasFloatDomManagerService = __decorateClass([
  __decorateParam(0, Inject(IRenderManagerService)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, IDrawingManagerService),
  __decorateParam(4, Inject(CanvasFloatDomService)),
  __decorateParam(5, ISheetDrawingService),
  __decorateParam(6, Inject(LifecycleService))
], SheetCanvasFloatDomManagerService);
function calcCellPositionByCell(row, col, skeleton) {
  const primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col);
  const cellInfo = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
  return {
    left: cellInfo.startX,
    right: cellInfo.endX,
    top: cellInfo.startY,
    bottom: cellInfo.endY
  };
}
function calcDomPositionByAnchor(rangePosition, domAnchor, scale) {
  var _a, _b;
  scale = scale != null ? scale : 1;
  const rangeWidth = rangePosition.endX - rangePosition.startX;
  const rangeHeight = rangePosition.endY - rangePosition.startY;
  const domWidth = (_a = domAnchor == null ? void 0 : domAnchor.width) != null ? _a : rangeWidth;
  const domHeight = (_b = domAnchor == null ? void 0 : domAnchor.height) != null ? _b : rangeHeight;
  let domLeft = 0;
  let domTop = 0;
  if (domAnchor) {
    if (domAnchor.horizonOffsetAlign === "right") {
      const offsetX = calculateOffset(domAnchor.marginX, rangeWidth * scale);
      domLeft = rangePosition.endX - offsetX - domWidth;
    } else {
      domLeft = rangePosition.startX + calculateOffset(domAnchor.marginX, rangeWidth);
    }
    if (domAnchor.verticalOffsetAlign === "bottom") {
      const offsetY = calculateOffset(domAnchor.marginY, rangeHeight * scale);
      domTop = rangePosition.endY - offsetY - domHeight;
    } else {
      domTop = rangePosition.startY + calculateOffset(domAnchor.marginY, rangeHeight);
    }
  }
  return {
    rotate: 0,
    startX: domLeft,
    startY: domTop,
    endX: rangePosition.endX,
    endY: rangePosition.endY,
    width: domWidth,
    height: domHeight,
    absolute: {
      left: rangePosition.absolute.left,
      top: rangePosition.absolute.top
    }
  };
}
function calculateOffset(value, rangeWidth) {
  if (value === void 0) return 0;
  if (typeof value === "number") return value;
  const percentage = Number.parseFloat(value);
  return rangeWidth * percentage / 100;
}

// ../packages/sheets-drawing-ui/src/views/printing-float-dom/index.tsx
var import_react8 = __toESM(require_react());
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var PrintingFloatDom = (props) => {
  const { floatDomInfos, scene, skeleton, worksheet } = props;
  const floatDomParams = (0, import_react8.useMemo)(() => floatDomInfos.map((info) => {
    const { width, height, angle, left, top } = info.transform;
    const offsetBound = transformBound2DOMBound(
      {
        left: left != null ? left : 0,
        right: (left != null ? left : 0) + (width != null ? width : 0),
        top: top != null ? top : 0,
        bottom: (top != null ? top : 0) + (height != null ? height : 0)
      },
      scene,
      skeleton,
      worksheet,
      void 0,
      true
    );
    const { scaleX, scaleY } = scene.getAncestorScale();
    const domPos = {
      startX: offsetBound.left,
      endX: offsetBound.right,
      startY: offsetBound.top,
      endY: offsetBound.bottom,
      rotate: angle,
      width: width * scaleX,
      height: height * scaleY,
      absolute: offsetBound.absolute
    };
    const floatDom = {
      position$: new BehaviorSubject(domPos),
      position: domPos,
      id: info.drawingId,
      componentKey: info.componentKey,
      onPointerMove: () => {
      },
      onPointerDown: () => {
      },
      onPointerUp: () => {
      },
      onWheel: () => {
      },
      unitId: info.unitId,
      data: info.data
    };
    return [info.drawingId, floatDom];
  }), [floatDomInfos, scene, skeleton, worksheet]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { position: "absolute", top: 0, left: 0 }, children: floatDomParams.map(([id, floatDom]) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PrintFloatDomSingle, { layer: floatDom, id, position: floatDom.position }, id)) });
};

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-printing.controller.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime());
var SheetDrawingPrintingController = class extends Disposable {
  constructor(_sheetPrintInterceptorService, _drawingRenderService, _drawingManagerService, _renderManagerService, _canvasFloatDomManagerService, _componetManager, _injector) {
    super();
    __publicField(this, "_sheetPrintInterceptorService", _sheetPrintInterceptorService);
    __publicField(this, "_drawingRenderService", _drawingRenderService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_canvasFloatDomManagerService", _canvasFloatDomManagerService);
    __publicField(this, "_componetManager", _componetManager);
    __publicField(this, "_injector", _injector);
    this._initPrinting();
    this._initPrintingDom();
  }
  _initPrinting() {
    this.disposeWithMe(
      this._sheetPrintInterceptorService.interceptor.intercept(
        this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
        {
          handler: (_param, pos, next) => {
            const { unitId, scene, subUnitId } = pos;
            const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
            const subUnitData = unitData == null ? void 0 : unitData[subUnitId];
            if (subUnitData) {
              subUnitData.order.forEach((id) => {
                const drawing = subUnitData.data[id];
                if (drawing.drawingType !== 2 /* DRAWING_CHART */ && drawing.drawingType !== 8 /* DRAWING_DOM */) {
                  this._drawingRenderService.renderDrawing(drawing, scene);
                }
              });
            }
            return next();
          }
        }
      )
    );
    this.disposeWithMe(
      this._sheetPrintInterceptorService.interceptor.intercept(
        this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_RANGE,
        {
          handler: (range, pos, next) => {
            const { unitId, subUnitId } = pos;
            const renderer = this._renderManagerService.getRenderById(unitId);
            if (!renderer) {
              return next(range);
            }
            const skeleton = renderer.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
            if (!skeleton) {
              return next(range);
            }
            const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
            const subUnitData = unitData == null ? void 0 : unitData[pos.subUnitId];
            if (!subUnitData) {
              return next(range);
            }
            const { scaleX, scaleY } = renderer.scene;
            const newRange = range ? { ...range } : { startColumn: 0, endColumn: 0, endRow: 0, startRow: 0 };
            const data = subUnitData.order.map((key) => subUnitData.data[key]);
            if (data.length) {
              data.forEach((param) => {
                if (!param.groupId && param.transform && Tools.isDefine(param.transform.left) && Tools.isDefine(param.transform.top) && Tools.isDefine(param.transform.width) && Tools.isDefine(param.transform.height)) {
                  const start = skeleton.skeleton.getCellIndexByOffset(param.transform.left, param.transform.top, scaleX, scaleY, { x: 0, y: 0 });
                  const end = skeleton.skeleton.getCellIndexByOffset(param.transform.left + param.transform.width, param.transform.top + param.transform.height, scaleX, scaleY, { x: 0, y: 0 });
                  if (start.column < newRange.startColumn) {
                    newRange.startColumn = start.column;
                  }
                  if (start.row < newRange.startRow) {
                    newRange.startRow = start.row;
                  }
                  if (newRange.endRow < end.row) {
                    newRange.endRow = end.row;
                  }
                  if (newRange.endColumn < end.column) {
                    newRange.endColumn = end.column;
                  }
                }
              });
              return next(newRange);
            }
            return next(range);
          }
        }
      )
    );
  }
  _initPrintingDom() {
    this.disposeWithMe(
      this._sheetPrintInterceptorService.interceptor.intercept(
        this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT,
        {
          handler: (disposableCollection, pos, next) => {
            const { unitId, subUnitId } = pos;
            const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
            const subUnitData = unitData == null ? void 0 : unitData[subUnitId];
            if (subUnitData) {
              const floatDomInfos = subUnitData.order.map((id) => {
                const drawing = subUnitData.data[id];
                if (drawing.drawingType === 2 /* DRAWING_CHART */) {
                  return {
                    ...drawing,
                    componentKey: this._componetManager.get(PRINT_CHART_COMPONENT_KEY)
                  };
                }
                if (drawing.drawingType === 8 /* DRAWING_DOM */) {
                  const printingComponentKey = this._sheetPrintInterceptorService.getPrintComponent(drawing.componentKey);
                  return {
                    ...drawing,
                    componentKey: this._componetManager.get(printingComponentKey || drawing.componentKey)
                  };
                }
                return null;
              }).filter(Boolean);
              const PrintingFloatDomInjector = connectInjector(PrintingFloatDom, this._injector);
              render(
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PrintingFloatDomInjector, { floatDomInfos, scene: pos.scene, skeleton: pos.skeleton, worksheet: pos.worksheet }),
                pos.root
              );
              disposableCollection == null ? void 0 : disposableCollection.add(() => {
                unmount(pos.root);
              });
              return next(disposableCollection);
            }
          }
        }
      )
    );
  }
};
SheetDrawingPrintingController = __decorateClass([
  __decorateParam(0, Inject(SheetPrintInterceptorService)),
  __decorateParam(1, Inject(DrawingRenderService)),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, IRenderManagerService),
  __decorateParam(4, Inject(SheetCanvasFloatDomManagerService)),
  __decorateParam(5, Inject(ComponentManager)),
  __decorateParam(6, Inject(Injector))
], SheetDrawingPrintingController);

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing-transform-affected.controller.ts
var UPDATE_COMMANDS = [
  InsertRowCommand.id,
  InsertColCommand.id,
  RemoveRowCommand.id,
  RemoveColCommand.id,
  DeleteRangeMoveLeftCommand.id,
  DeleteRangeMoveUpCommand.id,
  InsertRangeMoveDownCommand.id,
  InsertRangeMoveRightCommand.id,
  DeltaRowHeightCommand.id,
  SetRowHeightCommand.id,
  DeltaColumnWidthCommand.id,
  SetColWidthCommand.id,
  SetRowHiddenCommand.id,
  SetSpecificRowsVisibleCommand.id,
  SetSpecificColsVisibleCommand.id,
  SetColHiddenCommand.id,
  MoveColsCommand.id,
  MoveRowsCommand.id,
  MoveRangeCommand.id
];
var REFRESH_MUTATIONS = [
  SetRowVisibleMutation.id,
  SetRowHiddenMutation.id,
  SetColVisibleMutation.id,
  SetColHiddenMutation.id,
  SetWorksheetRowHeightMutation.id,
  SetWorksheetRowAutoHeightMutation.id,
  SetWorksheetRowIsAutoHeightMutation.id,
  SetWorksheetColWidthMutation.id
];
var SheetDrawingTransformAffectedController = class extends Disposable {
  constructor(_context, _commandService, _sheetSkeletonService, _selectionRenderService, _sheetInterceptorService, _selectionManagerService, _sheetDrawingService, _drawingManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetSkeletonService", _sheetSkeletonService);
    __publicField(this, "_selectionRenderService", _selectionRenderService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_sheetDrawingService", _sheetDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._sheetInterceptorListener();
    this._commandListener();
    this._sheetRefreshListener();
  }
  // eslint-disable-next-line max-lines-per-function
  _sheetInterceptorListener() {
    this.disposeWithMe(
      this._sheetInterceptorService.interceptAfterCommand({
        // eslint-disable-next-line max-lines-per-function,complexity
        getMutations: (commandInfo) => {
          var _a, _b, _c;
          const { id, params } = commandInfo;
          if (!UPDATE_COMMANDS.includes(id) || !params) {
            return { redos: [], undos: [] };
          }
          if (id === InsertRowCommand.id) {
            return this._moveRowInterceptor(params, "insert");
          } else if ([MoveColsCommand.id, MoveRowsCommand.id, MoveRangeCommand.id].includes(id)) {
            let target;
            if (id === MoveRangeCommand.id) {
              const _params = params;
              if (_params.toUnitId && _params.fromUnitId && _params.toUnitId !== _params.fromUnitId || _params.toSubUnitId && _params.fromSubUnitId && _params.toSubUnitId !== _params.fromSubUnitId) {
                return { redos: [], undos: [] };
              }
              target = getSheetCommandTarget(this._univerInstanceService, { unitId: _params.toUnitId, subUnitId: _params.toSubUnitId });
            } else {
              target = getSheetCommandTarget(this._univerInstanceService, params);
            }
            if (!target) {
              return { redos: [], undos: [] };
            }
            const { unitId, subUnitId } = target;
            const { fromRange, toRange } = params;
            return this._moveRangeInterceptor(unitId, subUnitId, fromRange, toRange);
          } else if (id === InsertColCommand.id) {
            return this._moveColInterceptor(params, "insert");
          } else if (id === RemoveRowCommand.id) {
            return this._moveRowInterceptor(params, "remove");
          } else if (id === RemoveColCommand.id) {
            return this._moveColInterceptor(params, "remove");
          } else if (id === DeleteRangeMoveLeftCommand.id) {
            const { range } = params;
            return this._getRangeMoveUndo(range, 0 /* deleteLeft */);
          } else if (id === DeleteRangeMoveUpCommand.id) {
            const { range } = params;
            return this._getRangeMoveUndo(range, 1 /* deleteUp */);
          } else if (id === InsertRangeMoveDownCommand.id) {
            const { range } = params;
            return this._getRangeMoveUndo(range, 2 /* insertDown */);
          } else if (id === InsertRangeMoveRightCommand.id) {
            const { range } = params;
            return this._getRangeMoveUndo(range, 3 /* insertRight */);
          } else if (id === SetRowHiddenCommand.id || id === SetSpecificRowsVisibleCommand.id) {
            const _params = params;
            const target = getSheetCommandTarget(this._univerInstanceService, _params);
            if (!target) {
              return { redos: [], undos: [] };
            }
            const { unitId, subUnitId } = target;
            const ranges = _params.ranges || ((_a = this._selectionManagerService.getCurrentSelections()) == null ? void 0 : _a.map((s) => s.range).filter((r) => r.rangeType === 1 /* ROW */));
            if (!ranges || ranges.length === 0) {
              return { redos: [], undos: [] };
            }
            return this._getDrawingUndoForRowVisible(unitId, subUnitId, ranges);
          } else if (id === SetColHiddenCommand.id || id === SetSpecificColsVisibleCommand.id) {
            const _params = params;
            const target = getSheetCommandTarget(this._univerInstanceService, _params);
            if (!target) {
              return { redos: [], undos: [] };
            }
            const { unitId, subUnitId } = target;
            const ranges = _params.ranges || ((_b = this._selectionManagerService.getCurrentSelections()) == null ? void 0 : _b.map((s) => s.range).filter((r) => r.rangeType === 2 /* COLUMN */));
            if (!ranges || ranges.length === 0) {
              return { redos: [], undos: [] };
            }
            return this._getDrawingUndoForColVisible(unitId, subUnitId, ranges);
          } else if (id === DeltaRowHeightCommand.id || id === DeltaColumnWidthCommand.id) {
            const target = getSheetCommandTarget(this._univerInstanceService);
            if (!target) {
              return { redos: [], undos: [] };
            }
            const { unitId, subUnitId, worksheet } = target;
            const ranges = [];
            if (id === DeltaRowHeightCommand.id) {
              ranges.push({
                startRow: params.anchorRow,
                endRow: params.anchorRow,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1
              });
            } else {
              ranges.push({
                startRow: 0,
                endRow: worksheet.getRowCount() - 1,
                startColumn: params.anchorCol,
                endColumn: params.anchorCol
              });
            }
            return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges);
          } else if (id === SetRowHeightCommand.id || id === SetColWidthCommand.id) {
            const _params = params;
            const target = getSheetCommandTarget(this._univerInstanceService, _params);
            if (!target) {
              return { redos: [], undos: [] };
            }
            const { unitId, subUnitId } = target;
            const ranges = _params.ranges || ((_c = this._selectionManagerService.getCurrentSelections()) == null ? void 0 : _c.map((s) => s.range));
            if (!ranges || ranges.length === 0) {
              return { redos: [], undos: [] };
            }
            return this._getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges);
          }
          return { redos: [], undos: [] };
        }
      })
    );
  }
  _getRangeMoveUndo(range, type) {
    const target = getSheetCommandTarget(this._univerInstanceService);
    if (!target) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId } = target;
    const drawingData = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const redos = [];
    const undos = [];
    const updateDrawings = [];
    const deleteDrawings = [];
    Object.keys(drawingData).forEach((drawingId) => {
      const drawing = drawingData[drawingId];
      const { updateDrawings: updateDrawingsPart, deleteDrawings: deleteDrawingsPart } = this._getUpdateOrDeleteDrawings(range, type, drawing);
      updateDrawings.push(...updateDrawingsPart);
      deleteDrawings.push(...deleteDrawingsPart);
    });
    if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    if (updateDrawings.length > 0) {
      const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings);
      const { undo, redo, objects } = updateJsonOp;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: 2 /* UPDATE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: 2 /* UPDATE */ } });
    }
    if (deleteDrawings.length > 0) {
      const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings);
      const deleteUndo = deleteJsonOp.undo;
      const deleteRedo = deleteJsonOp.redo;
      const deleteObjects = deleteJsonOp.objects;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: 1 /* REMOVE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: 0 /* INSERT */ } });
    }
    redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    return {
      redos,
      undos
    };
  }
  // eslint-disable-next-line max-lines-per-function,complexity
  _getUpdateOrDeleteDrawings(range, type, drawing) {
    var _a, _b, _c, _d;
    const updateDrawings = [];
    const deleteDrawings = [];
    const { sheetTransform, anchorType = "0" /* Position */, transform, unitId, subUnitId, drawingId } = drawing;
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetTransform || !transform || !sheetSkeletonParam) {
      return {
        updateDrawings,
        deleteDrawings
      };
    }
    const { from, to } = sheetTransform;
    const { row: fromRow, column: fromColumn } = from;
    const { row: toRow, column: toColumn } = to;
    const { startRow, endRow, startColumn, endColumn } = range;
    let newSheetTransform = null;
    let newTransform = null;
    let axisAlignSheetTransform;
    if (type === 0 /* deleteLeft */ && fromRow >= startRow && toRow <= endRow) {
      if (fromColumn >= startColumn && toColumn <= endColumn) {
        deleteDrawings.push({ unitId, subUnitId, drawingId });
      } else {
        const param = this._shrinkCol(startColumn, endColumn, {
          sheetSkeletonParam,
          sheetTransform,
          transform,
          anchorType
        });
        newSheetTransform = param == null ? void 0 : param.newSheetTransform;
        newTransform = param == null ? void 0 : param.newTransform;
        axisAlignSheetTransform = (_a = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _a : void 0;
      }
    } else if (type === 1 /* deleteUp */ && fromColumn >= startColumn && toColumn <= endColumn) {
      if (fromRow >= startRow && toRow <= endRow) {
        deleteDrawings.push({ unitId, subUnitId, drawingId });
      } else {
        const param = this._shrinkRow(startRow, endRow, {
          sheetSkeletonParam,
          sheetTransform,
          transform,
          anchorType
        });
        newSheetTransform = param == null ? void 0 : param.newSheetTransform;
        newTransform = param == null ? void 0 : param.newTransform;
        axisAlignSheetTransform = (_b = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _b : void 0;
      }
    } else if (type === 2 /* insertDown */) {
      const param = this._expandRow(startRow, endRow, {
        sheetSkeletonParam,
        sheetTransform,
        transform,
        anchorType
      });
      newSheetTransform = param == null ? void 0 : param.newSheetTransform;
      newTransform = param == null ? void 0 : param.newTransform;
      axisAlignSheetTransform = (_c = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _c : void 0;
    } else if (type === 3 /* insertRight */) {
      const param = this._expandCol(startColumn, endColumn, {
        sheetSkeletonParam,
        sheetTransform,
        transform,
        anchorType
      });
      newSheetTransform = param == null ? void 0 : param.newSheetTransform;
      newTransform = param == null ? void 0 : param.newTransform;
      axisAlignSheetTransform = (_d = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _d : void 0;
    }
    if (newSheetTransform && newTransform) {
      const newTransform2 = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
      updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform2, axisAlignSheetTransform });
    }
    return { updateDrawings, deleteDrawings };
  }
  _remainDrawingSize(transform, updateDrawings, drawing, skeleton) {
    const newSheetTransform = transformToDrawingPosition({ ...transform }, skeleton);
    if (newSheetTransform) {
      const axisAlignSheetTransform = transformToAxisAlignPosition({ ...transform }, skeleton);
      updateDrawings.push({
        ...drawing,
        sheetTransform: newSheetTransform,
        axisAlignSheetTransform
      });
    }
  }
  // eslint-disable-next-line max-lines-per-function
  _getDrawingUndoForColVisible(unitId, subUnitId, ranges) {
    const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!skeleton) {
      return { redos: [], undos: [] };
    }
    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    const preUpdateDrawings = [];
    Object.keys(drawingData).forEach((drawingId) => {
      const drawing = drawingData[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (anchorType === "2" /* None */) {
        this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
      } else {
        const { from, to } = sheetTransform;
        const { row: fromRow, column: fromColumn } = from;
        const { row: toRow, column: toColumn } = to;
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const { startColumn, endColumn } = range;
          if (toColumn < startColumn) {
            continue;
          }
          if (anchorType === "0" /* Position */) {
            let newSheetTransform2 = null;
            let newTransform2 = null;
            if (fromColumn >= startColumn && fromColumn <= endColumn) {
              const selectionCell = attachRangeWithCoord(skeleton, {
                startColumn: fromColumn,
                endColumn,
                startRow: fromRow,
                endRow: toRow
              });
              newTransform2 = { ...transform, left: selectionCell.startX };
            }
            if (newTransform2) {
              newSheetTransform2 = transformToDrawingPosition(newTransform2, skeleton);
              const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform2, skeleton);
              if (newSheetTransform2 && newTransform2) {
                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform2, transform: newTransform2, axisAlignSheetTransform });
                break;
              }
            }
            continue;
          }
          if (fromColumn >= startColumn && toColumn <= endColumn) {
            continue;
          }
          let newSheetTransform = null;
          let newTransform = null;
          if (fromColumn >= startColumn && fromColumn <= endColumn) {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn: fromColumn,
              endColumn,
              startRow: fromRow,
              endRow: toRow
            });
            newTransform = {
              ...transform,
              left: (selectionCell == null ? void 0 : selectionCell.startX) || 0,
              width: ((transform == null ? void 0 : transform.width) || 0) - selectionCell.endX + selectionCell.startX
            };
          } else if (toColumn >= startColumn && toColumn <= endColumn) {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn,
              endColumn: toColumn,
              startRow: fromRow,
              endRow: toRow
            });
            newTransform = {
              ...transform,
              left: selectionCell.startX - ((transform == null ? void 0 : transform.width) || 0)
            };
          } else {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn,
              endColumn,
              startRow: fromRow,
              endRow: toRow
            });
            newTransform = {
              ...transform,
              width: ((transform == null ? void 0 : transform.width) || 0) - selectionCell.endX + selectionCell.startX
            };
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            if (newSheetTransform && newTransform) {
              const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
              preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
              break;
            }
          }
          if (newTransform) {
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
          }
          if (newTransform && newSheetTransform) {
            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
            updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
            break;
          } else {
            this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
          }
        }
      }
    });
    if (updateDrawings.length === 0 && preUpdateDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);
    const preRedos = [];
    const preUndos = [];
    if (preUpdateDrawings.length > 0) {
      const { redos: redos2, undos: undos2 } = this._createUndoAndRedoMutation(unitId, subUnitId, preUpdateDrawings);
      preRedos.push(...redos2);
      preUndos.push(...undos2);
    }
    return {
      redos,
      undos,
      preRedos,
      preUndos
    };
  }
  _createUndoAndRedoMutation(unitId, subUnitId, updateDrawings) {
    const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings);
    const { undo, redo, objects } = updateJsonOp;
    const redos = [
      { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: 2 /* UPDATE */ } },
      { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] }
    ];
    const undos = [
      { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: 2 /* UPDATE */ } },
      { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] }
    ];
    return {
      redos,
      undos
    };
  }
  // eslint-disable-next-line max-lines-per-function
  _getDrawingUndoForRowVisible(unitId, subUnitId, ranges) {
    const skeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
    if (!skeleton) {
      return { redos: [], undos: [] };
    }
    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    const preUpdateDrawings = [];
    Object.keys(drawingData).forEach((drawingId) => {
      const drawing = drawingData[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (anchorType === "2" /* None */) {
        this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
      } else {
        const { from, to } = sheetTransform;
        const { row: fromRow, column: fromColumn } = from;
        const { row: toRow, column: toColumn } = to;
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const { startRow, endRow } = range;
          if (toRow < startRow) {
            continue;
          }
          if (anchorType === "0" /* Position */) {
            let newSheetTransform2 = null;
            let newTransform2 = null;
            if (fromRow >= startRow && fromRow <= endRow) {
              const selectionCell = attachRangeWithCoord(skeleton, {
                startColumn: fromColumn,
                endColumn: toColumn,
                startRow: fromRow,
                endRow
              });
              newTransform2 = { ...transform, top: selectionCell.startY };
            }
            if (newTransform2) {
              newSheetTransform2 = transformToDrawingPosition(newTransform2, skeleton);
              const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform2, skeleton);
              if (newSheetTransform2 && newTransform2) {
                updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform2, transform: newTransform2, axisAlignSheetTransform });
                break;
              }
            }
            continue;
          }
          if (fromRow >= startRow && toRow <= endRow) {
            continue;
          }
          let newSheetTransform = null;
          let newTransform = null;
          if (fromRow >= startRow && fromRow <= endRow) {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn: fromColumn,
              endColumn: toColumn,
              startRow: fromRow,
              endRow
            });
            newTransform = {
              ...transform,
              top: (selectionCell == null ? void 0 : selectionCell.startY) || 0,
              height: ((transform == null ? void 0 : transform.height) || 0) - selectionCell.endY + selectionCell.startY
            };
          } else if (toRow >= startRow && toRow <= endRow) {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn: fromColumn,
              endColumn: toColumn,
              startRow,
              endRow: toRow
            });
            newTransform = {
              ...transform,
              top: selectionCell.startY - ((transform == null ? void 0 : transform.height) || 0)
            };
          } else {
            const selectionCell = attachRangeWithCoord(skeleton, {
              startColumn: fromColumn,
              endColumn: toColumn,
              startRow,
              endRow
            });
            newTransform = {
              ...transform,
              height: ((transform == null ? void 0 : transform.height) || 0) - selectionCell.endY + selectionCell.startY
            };
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
            if (newSheetTransform && newTransform) {
              const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
              preUpdateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
              break;
            }
          }
          if (newTransform) {
            newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
          }
          if (newTransform && newSheetTransform) {
            const axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
            updateDrawings.push({ ...drawing, sheetTransform: newSheetTransform, transform: newTransform, axisAlignSheetTransform });
            break;
          } else {
            this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
          }
        }
      }
    });
    if (updateDrawings.length === 0 && preUpdateDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    const { redos, undos } = this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);
    const preRedos = [];
    const preUndos = [];
    if (preUpdateDrawings.length > 0) {
      const { redos: redos2, undos: undos2 } = this._createUndoAndRedoMutation(unitId, subUnitId, preUpdateDrawings);
      preRedos.push(...redos2);
      preUndos.push(...undos2);
    }
    return {
      redos,
      undos,
      preRedos,
      preUndos
    };
  }
  _getDrawingUndoForRowAndColSize(unitId, subUnitId, ranges) {
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetSkeletonParam) {
      return { redos: [], undos: [] };
    }
    const { skeleton } = sheetSkeletonParam;
    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    Object.keys(drawingData).forEach((drawingId) => {
      const drawing = drawingData[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (anchorType === "2" /* None */) {
        this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
      } else {
        const { from, to } = sheetTransform;
        const { row: fromRow, column: fromColumn } = from;
        const { row: toRow, column: toColumn } = to;
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const { startRow, endRow, startColumn, endColumn } = range;
          if (toRow < startRow || toColumn < startColumn) {
            continue;
          }
          if (anchorType === "0" /* Position */) {
            if (fromRow <= startRow && toRow >= endRow || fromColumn <= startColumn && toColumn >= endColumn) {
              this._remainDrawingSize(transform, updateDrawings, drawing, skeleton);
              continue;
            }
          }
          const newTransform = drawingPositionToTransform({ ...sheetTransform }, sheetSkeletonParam);
          if (newTransform) {
            updateDrawings.push({
              ...drawing,
              transform: newTransform
            });
            break;
          }
        }
      }
    });
    if (updateDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    return this._createUndoAndRedoMutation(unitId, subUnitId, updateDrawings);
  }
  _getUnitIdAndSubUnitId(params, type) {
    let target;
    if (type === "insert") {
      target = getSheetCommandTarget(this._univerInstanceService, params);
    } else {
      target = getSheetCommandTarget(this._univerInstanceService);
    }
    if (!target) return;
    const { unitId, subUnitId } = target;
    return { unitId, subUnitId };
  }
  _moveRangeInterceptor(unitId, subUnitId, fromRange, toRange) {
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetSkeletonParam) {
      return { redos: [], undos: [] };
    }
    const { skeleton } = sheetSkeletonParam;
    const selectionRect = attachRangeWithCoord(skeleton, fromRange);
    if (!selectionRect) {
      return { redos: [], undos: [] };
    }
    const { startX, endX, startY, endY } = selectionRect;
    const drawings = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const containedDrawings = [];
    Object.keys(drawings).forEach((drawingId) => {
      const drawing = drawings[drawingId];
      if (drawing.anchorType !== "1" /* Both */) {
        return;
      }
      const { transform } = drawing;
      if (!transform) {
        return;
      }
      const { left = 0, top = 0, width = 0, height = 0 } = transform;
      const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
        drawingStartX: left,
        drawingEndX: left + width,
        drawingStartY: top,
        drawingEndY: top + height
      };
      if (startX <= drawingStartX && drawingEndX <= endX && startY <= drawingStartY && drawingEndY <= endY) {
        containedDrawings.push(drawing);
      }
    });
    const redos = [];
    const undos = [];
    const rowOffset = toRange.startRow - fromRange.startRow;
    const colOffset = toRange.startColumn - fromRange.startColumn;
    const updateDrawings = containedDrawings.map((drawing) => {
      const oldSheetTransform = drawing.sheetTransform;
      const sheetTransform = {
        to: { ...oldSheetTransform.to, row: oldSheetTransform.to.row + rowOffset, column: oldSheetTransform.to.column + colOffset },
        from: { ...oldSheetTransform.from, row: oldSheetTransform.from.row + rowOffset, column: oldSheetTransform.from.column + colOffset }
      };
      const transform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
      const params = {
        unitId,
        subUnitId,
        drawingId: drawing.drawingId,
        transform,
        sheetTransform
      };
      return params;
    });
    if (updateDrawings.length) {
      const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings);
      const { undo, redo, objects } = updateJsonOp;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: 2 /* UPDATE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: 2 /* UPDATE */ } });
    }
    return { redos, undos };
  }
  // eslint-disable-next-line max-lines-per-function
  _moveRowInterceptor(params, type) {
    const target = this._getUnitIdAndSubUnitId(params, type);
    if (!target) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId } = target;
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetSkeletonParam) {
      return { redos: [], undos: [] };
    }
    const { range } = params;
    const rowStartIndex = range.startRow;
    const rowEndIndex = range.endRow;
    const redos = [];
    const undos = [];
    const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    const deleteDrawings = [];
    Object.keys(data).forEach((drawingId) => {
      var _a, _b;
      const drawing = data[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (!sheetTransform || !transform) {
        return;
      }
      let newSheetTransform;
      let newTransform;
      let axisAlignSheetTransform;
      if (type === "insert") {
        const param = this._expandRow(rowStartIndex, rowEndIndex, {
          sheetSkeletonParam,
          sheetTransform,
          transform,
          anchorType
        });
        newSheetTransform = param == null ? void 0 : param.newSheetTransform;
        newTransform = param == null ? void 0 : param.newTransform;
        axisAlignSheetTransform = (_a = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _a : void 0;
      } else {
        const { from, to } = sheetTransform;
        const { row: fromRow } = from;
        const { row: toRow } = to;
        if (anchorType === "1" /* Both */ && fromRow >= rowStartIndex && toRow <= rowEndIndex) {
          deleteDrawings.push({ unitId, subUnitId, drawingId });
        } else {
          const param = this._shrinkRow(rowStartIndex, rowEndIndex, {
            sheetSkeletonParam,
            sheetTransform,
            transform,
            anchorType
          });
          newSheetTransform = param == null ? void 0 : param.newSheetTransform;
          newTransform = param == null ? void 0 : param.newTransform;
          axisAlignSheetTransform = (_b = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _b : void 0;
        }
      }
      if (!newSheetTransform || !newTransform) {
        return;
      }
      const params2 = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform, axisAlignSheetTransform };
      updateDrawings.push(params2);
    });
    if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    if (updateDrawings.length > 0) {
      const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings);
      const { undo, redo, objects } = updateJsonOp;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: 2 /* UPDATE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: 2 /* UPDATE */ } });
    }
    if (deleteDrawings.length > 0) {
      const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings);
      const deleteUndo = deleteJsonOp.undo;
      const deleteRedo = deleteJsonOp.redo;
      const deleteObjects = deleteJsonOp.objects;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: 1 /* REMOVE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: 0 /* INSERT */ } });
    }
    redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    return {
      redos,
      undos
    };
  }
  // eslint-disable-next-line max-lines-per-function
  _moveColInterceptor(params, type) {
    const target = this._getUnitIdAndSubUnitId(params, type);
    if (!target) {
      return { redos: [], undos: [] };
    }
    const { unitId, subUnitId } = target;
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    if (!sheetSkeletonParam) {
      return { redos: [], undos: [] };
    }
    const { range } = params;
    const colStartIndex = range.startColumn;
    const colEndIndex = range.endColumn;
    const redos = [];
    const undos = [];
    const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    const deleteDrawings = [];
    Object.keys(data).forEach((drawingId) => {
      var _a, _b;
      const drawing = data[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (!sheetTransform || !transform) {
        return;
      }
      let newSheetTransform;
      let newTransform;
      let axisAlignSheetTransform;
      if (type === "insert") {
        const param = this._expandCol(colStartIndex, colEndIndex, {
          sheetSkeletonParam,
          sheetTransform,
          transform,
          anchorType
        });
        newSheetTransform = param == null ? void 0 : param.newSheetTransform;
        newTransform = param == null ? void 0 : param.newTransform;
        axisAlignSheetTransform = (_a = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _a : void 0;
      } else {
        const { from, to } = sheetTransform;
        const { column: fromColumn } = from;
        const { column: toColumn } = to;
        if (anchorType === "1" /* Both */ && fromColumn >= colStartIndex && toColumn <= colEndIndex) {
          deleteDrawings.push({ unitId, subUnitId, drawingId });
        } else {
          const param = this._shrinkCol(colStartIndex, colEndIndex, {
            sheetSkeletonParam,
            sheetTransform,
            transform,
            anchorType
          });
          newSheetTransform = param == null ? void 0 : param.newSheetTransform;
          newTransform = param == null ? void 0 : param.newTransform;
          axisAlignSheetTransform = (_b = param == null ? void 0 : param.axisAlignSheetTransform) != null ? _b : void 0;
        }
      }
      if (!newSheetTransform || !newTransform) {
        return;
      }
      const params2 = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform, axisAlignSheetTransform };
      updateDrawings.push(params2);
    });
    if (updateDrawings.length === 0 && deleteDrawings.length === 0) {
      return { redos: [], undos: [] };
    }
    if (updateDrawings.length > 0) {
      const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings);
      const { undo, redo, objects } = updateJsonOp;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: 2 /* UPDATE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: 2 /* UPDATE */ } });
    }
    if (deleteDrawings.length > 0) {
      const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings);
      const deleteUndo = deleteJsonOp.undo;
      const deleteRedo = deleteJsonOp.redo;
      const deleteObjects = deleteJsonOp.objects;
      redos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: 1 /* REMOVE */ } });
      undos.push({ id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: 0 /* INSERT */ } });
    }
    redos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    undos.push({ id: ClearSheetDrawingTransformerOperation.id, params: [unitId] });
    return { redos, undos };
  }
  _expandCol(colStartIndex, colEndIndex, options) {
    const { sheetSkeletonParam, sheetTransform, transform, anchorType = "0" /* Position */ } = options;
    const { skeleton } = sheetSkeletonParam;
    const colCount = colEndIndex - colStartIndex + 1;
    const { from, to } = sheetTransform;
    const { column: fromColumn } = from;
    const { column: toColumn } = to;
    if (anchorType === "2" /* None */) {
      return {
        newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
        newTransform: transform,
        axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
      };
    }
    let newSheetTransform = null;
    let newTransform = null;
    let axisAlignSheetTransform = null;
    if (fromColumn >= colStartIndex) {
      const selectionCell = attachRangeWithCoord(skeleton, {
        startColumn: colStartIndex,
        endColumn: colEndIndex,
        startRow: from.row,
        endRow: to.row
      });
      newTransform = { ...transform, left: (transform.left || 0) + selectionCell.endX - selectionCell.startX };
      newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
      axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
    } else if (toColumn >= colEndIndex) {
      if (anchorType === "1" /* Both */) {
        newSheetTransform = {
          from: { ...from },
          to: { ...to, column: toColumn + colCount }
        };
        newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
      } else {
        return {
          newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
          newTransform: transform,
          axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
        };
      }
    }
    if (newSheetTransform && newTransform) {
      return {
        newSheetTransform,
        newTransform,
        axisAlignSheetTransform
      };
    }
    return null;
  }
  // eslint-disable-next-line max-lines-per-function
  _shrinkCol(colStartIndex, colEndIndex, options) {
    const { sheetSkeletonParam, sheetTransform, transform, anchorType = "0" /* Position */ } = options;
    const { skeleton } = sheetSkeletonParam;
    const colCount = colEndIndex - colStartIndex + 1;
    const { from, to } = sheetTransform;
    const { column: fromColumn } = from;
    const { column: toColumn } = to;
    if (anchorType === "2" /* None */) {
      return {
        newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
        newTransform: transform,
        axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
      };
    }
    let newSheetTransform = null;
    let newTransform = null;
    let axisAlignSheetTransform = null;
    if (fromColumn > colEndIndex) {
      newSheetTransform = {
        from: { ...from, column: fromColumn - colCount },
        to: { ...to, column: toColumn - colCount }
      };
      newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
    } else if (fromColumn >= colStartIndex && toColumn <= colEndIndex) {
      return null;
    } else if (fromColumn < colStartIndex && toColumn > colEndIndex) {
      if (anchorType === "1" /* Both */) {
        newSheetTransform = {
          from: { ...from },
          to: { ...to, column: toColumn - colCount }
        };
        newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
      } else {
        return {
          newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
          newTransform: transform,
          axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
        };
      }
    } else if (fromColumn >= colStartIndex && fromColumn <= colEndIndex) {
      if (fromColumn === colStartIndex) {
        newTransform = { ...transform, left: (transform.left || 0) - sheetTransform.from.columnOffset };
      } else {
        const selectionCell = attachRangeWithCoord(skeleton, {
          startColumn: colStartIndex,
          endColumn: fromColumn - 1,
          startRow: from.row,
          endRow: to.row
        });
        newTransform = { ...transform, left: (transform.left || 0) - selectionCell.endX + selectionCell.startX - sheetTransform.from.columnOffset };
      }
      newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
      axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
    } else if (toColumn >= colStartIndex && toColumn <= colEndIndex && anchorType === "1" /* Both */) {
      const selectionCell = attachRangeWithCoord(skeleton, {
        startColumn: colStartIndex - 1,
        endColumn: colStartIndex - 1,
        startRow: from.row,
        endRow: to.row
      });
      newSheetTransform = {
        from: { ...from },
        to: { ...to, column: colStartIndex - 1, columnOffset: selectionCell.endX - selectionCell.startX }
      };
      newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
    }
    if (newSheetTransform && newTransform) {
      return {
        newSheetTransform,
        newTransform,
        axisAlignSheetTransform
      };
    }
    return null;
  }
  _expandRow(rowStartIndex, rowEndIndex, options) {
    const { sheetSkeletonParam, sheetTransform, transform, anchorType = "0" /* Position */ } = options;
    const { skeleton } = sheetSkeletonParam;
    const rowCount = rowEndIndex - rowStartIndex + 1;
    const { from, to } = sheetTransform;
    const { row: fromRow } = from;
    const { row: toRow } = to;
    if (anchorType === "2" /* None */) {
      return {
        newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
        newTransform: transform,
        axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
      };
    }
    let newSheetTransform = null;
    let newTransform = null;
    let axisAlignSheetTransform = null;
    if (fromRow >= rowStartIndex) {
      const selectionCell = attachRangeWithCoord(skeleton, {
        startRow: rowStartIndex,
        endRow: rowEndIndex,
        startColumn: from.column,
        endColumn: to.column
      });
      newTransform = { ...transform, top: (transform.top || 0) + selectionCell.endY - selectionCell.startY };
      newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
      axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
    } else if (toRow >= rowEndIndex) {
      if (anchorType === "1" /* Both */) {
        newSheetTransform = {
          from: { ...from },
          to: {
            ...to,
            row: toRow + rowCount
          }
        };
        newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
      } else {
        return {
          newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
          newTransform: transform,
          axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
        };
      }
    }
    if (newSheetTransform && newTransform) {
      return {
        newSheetTransform,
        newTransform,
        axisAlignSheetTransform
      };
    }
    return null;
  }
  // eslint-disable-next-line max-lines-per-function
  _shrinkRow(rowStartIndex, rowEndIndex, options) {
    const { sheetSkeletonParam, sheetTransform, transform, anchorType = "0" /* Position */ } = options;
    const { skeleton } = sheetSkeletonParam;
    const rowCount = rowEndIndex - rowStartIndex + 1;
    const { from, to } = sheetTransform;
    const { row: fromRow } = from;
    const { row: toRow } = to;
    if (anchorType === "2" /* None */) {
      return {
        newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
        newTransform: transform,
        axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
      };
    }
    let newSheetTransform = null;
    let newTransform = null;
    let axisAlignSheetTransform = null;
    if (fromRow > rowEndIndex) {
      newSheetTransform = {
        from: { ...from, row: fromRow - rowCount },
        to: { ...to, row: toRow - rowCount }
      };
      newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
    } else if (fromRow >= rowStartIndex && toRow <= rowEndIndex) {
      return null;
    } else if (fromRow < rowStartIndex && toRow > rowEndIndex) {
      if (anchorType === "1" /* Both */) {
        newSheetTransform = {
          from: { ...from },
          to: { ...to, row: toRow - rowCount }
        };
        newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
      } else {
        return {
          newSheetTransform: transformToDrawingPosition({ ...transform }, skeleton),
          newTransform: transform,
          axisAlignSheetTransform: transformToAxisAlignPosition({ ...transform }, skeleton)
        };
      }
    } else if (fromRow >= rowStartIndex && fromRow <= rowEndIndex) {
      if (fromRow === rowStartIndex) {
        newTransform = { ...transform, top: (transform.top || 0) - sheetTransform.from.rowOffset };
      } else {
        const selectionCell = attachRangeWithCoord(skeleton, {
          startRow: rowStartIndex,
          endRow: fromRow - 1,
          startColumn: from.column,
          endColumn: to.column
        });
        newTransform = { ...transform, top: (transform.top || 0) - selectionCell.endY + selectionCell.startY - sheetTransform.from.rowOffset };
      }
      newSheetTransform = transformToDrawingPosition(newTransform, skeleton);
      axisAlignSheetTransform = transformToAxisAlignPosition(newTransform, skeleton);
    } else if (toRow >= rowStartIndex && toRow <= rowEndIndex && anchorType === "1" /* Both */) {
      const selectionCell = attachRangeWithCoord(skeleton, {
        startColumn: from.column,
        endColumn: from.column,
        startRow: rowStartIndex - 1,
        endRow: rowStartIndex - 1
      });
      newSheetTransform = {
        from: { ...from },
        to: { ...to, row: rowStartIndex - 1, rowOffset: selectionCell.endY - selectionCell.startY }
      };
      newTransform = drawingPositionToTransform(newSheetTransform, sheetSkeletonParam);
    }
    if (newSheetTransform && newTransform) {
      return {
        newSheetTransform,
        newTransform,
        axisAlignSheetTransform
      };
    }
    return null;
  }
  _commandListener() {
    this.disposeWithMe(
      // TODO@weird94: this should subscribe to the command service
      // but the skeleton changes like other render modules. These two signals are not equivalent.
      // As a temp solution, I subscribed to activate$ here.
      this._commandService.onCommandExecuted((command) => {
        if (command.id === SetWorksheetActiveOperation.id) {
          const { unitId, subUnitId } = command.params;
          this._updateDrawings(unitId, subUnitId);
        }
      })
    );
    this.disposeWithMe(
      this._context.activated$.subscribe((activated) => {
        const { unit, unitId } = this._context;
        if (activated) {
          const subUnitId = unit.getActiveSheet().getSheetId();
          this._updateDrawings(unitId, subUnitId);
        } else {
          this._clearDrawings(unitId);
        }
      })
    );
  }
  _clearDrawings(selfUnitId) {
    setTimeout(() => {
      const drawingMap = this._drawingManagerService.drawingManagerData;
      const removeDrawings = [];
      Object.keys(drawingMap).forEach((unitId) => {
        const subUnitMap = drawingMap[unitId];
        Object.keys(subUnitMap).forEach((subUnitId) => {
          const drawingData = subUnitMap[subUnitId].data;
          Object.keys(drawingData).forEach((drawingId) => {
            if (unitId === selfUnitId) {
              removeDrawings.push(drawingData[drawingId]);
            }
          });
        });
      });
      this._sheetDrawingService.removeNotification(removeDrawings);
      this._drawingManagerService.removeNotification(removeDrawings);
    });
  }
  _updateDrawings(showUnitId, showSubunitId) {
    setTimeout(() => {
      const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(showUnitId, showSubunitId);
      const drawingMap = this._drawingManagerService.drawingManagerData;
      const insertDrawings = [];
      const removeDrawings = [];
      Object.keys(drawingMap).forEach((unitId) => {
        const subUnitMap = drawingMap[unitId];
        Object.keys(subUnitMap).forEach((subUnitId) => {
          const drawingData = subUnitMap[subUnitId].data;
          Object.keys(drawingData).forEach((drawingId) => {
            if (unitId === showUnitId && subUnitId === showSubunitId) {
              const drawing = drawingData[drawingId];
              if (drawing.sheetTransform) {
                drawing.transform = drawingPositionToTransform(drawing.sheetTransform, sheetSkeletonParam);
              }
              insertDrawings.push(drawingData[drawingId]);
            } else {
              removeDrawings.push(drawingData[drawingId]);
            }
          });
        });
      });
      this._sheetDrawingService.removeNotification(removeDrawings);
      this._sheetDrawingService.addNotification(insertDrawings);
      this._drawingManagerService.removeNotification(removeDrawings);
      this._drawingManagerService.addNotification(insertDrawings);
    }, 0);
  }
  _sheetRefreshListener() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (!REFRESH_MUTATIONS.includes(command.id)) {
          return;
        }
        requestIdleCallback(() => {
          const params = command.params;
          const target = getSheetCommandTarget(this._univerInstanceService, params);
          if (!target) return;
          const { unitId, subUnitId, worksheet } = target;
          let ranges = [];
          if ("ranges" in params) {
            ranges = params.ranges;
          } else if ("rowsAutoHeightInfo" in params) {
            ranges = params.rowsAutoHeightInfo.map((info) => ({
              startRow: info.row,
              endRow: info.row,
              startColumn: 0,
              endColumn: worksheet.getColumnCount() - 1
            }));
          }
          this._refreshDrawingTransform(unitId, subUnitId, ranges);
        });
      })
    );
  }
  _refreshDrawingTransform(unitId, subUnitId, ranges) {
    const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);
    const drawingData = this._drawingManagerService.getDrawingData(unitId, subUnitId);
    const updateDrawings = [];
    Object.keys(drawingData).forEach((drawingId) => {
      const drawing = drawingData[drawingId];
      const { sheetTransform, transform, anchorType = "0" /* Position */ } = drawing;
      if (anchorType === "2" /* None */) {
        return true;
      }
      const { from, to } = sheetTransform;
      const { row: fromRow, column: fromColumn } = from;
      const { row: toRow, column: toColumn } = to;
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const { startRow, endRow, startColumn, endColumn } = range;
        if (Rectangle.intersects(
          {
            startRow,
            endRow,
            startColumn,
            endColumn
          },
          {
            startRow: fromRow,
            endRow: toRow,
            startColumn: fromColumn,
            endColumn: toColumn
          }
        ) || fromRow > endRow || fromColumn > endColumn) {
          const isPositionAnchor = anchorType === "0" /* Position */;
          const newTransform = drawingPositionToTransform(sheetTransform, sheetSkeletonParam);
          updateDrawings.push({
            ...drawing,
            transform: {
              ...newTransform,
              width: isPositionAnchor ? transform == null ? void 0 : transform.width : newTransform == null ? void 0 : newTransform.width,
              height: isPositionAnchor ? transform == null ? void 0 : transform.height : newTransform == null ? void 0 : newTransform.height
            }
          });
          break;
        }
      }
    });
    if (updateDrawings.length === 0) {
      return;
    }
    this._sheetDrawingService.refreshTransform(updateDrawings);
    this._drawingManagerService.refreshTransform(updateDrawings);
    this._commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
  }
};
SheetDrawingTransformAffectedController = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetSkeletonService)),
  __decorateParam(3, ISheetSelectionRenderService),
  __decorateParam(4, Inject(SheetInterceptorService)),
  __decorateParam(5, Inject(SheetsSelectionsService)),
  __decorateParam(6, ISheetDrawingService),
  __decorateParam(7, IDrawingManagerService),
  __decorateParam(8, IUniverInstanceService)
], SheetDrawingTransformAffectedController);

// ../packages/sheets-drawing-ui/src/commands/commands/delete-drawings.command.ts
var DeleteDrawingsCommand = {
  id: "sheet.command.delete-drawing",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const commandService = accessor.get(ICommandService);
    const drawingManagerService = accessor.get(ISheetDrawingService);
    const drawings = drawingManagerService.getFocusDrawings();
    if (drawings.length === 0) {
      return false;
    }
    const unitId = drawings[0].unitId;
    const newDrawings = drawings.map((drawing) => {
      const { unitId: unitId2, subUnitId, drawingId, drawingType } = drawing;
      return {
        unitId: unitId2,
        subUnitId,
        drawingId,
        drawingType
      };
    });
    return commandService.executeCommand(RemoveSheetDrawingCommand.id, {
      unitId,
      drawings: newDrawings
    });
  }
};

// ../packages/sheets-drawing-ui/src/commands/commands/flip-drawings.command.ts
var FlipSheetDrawingCommand = {
  id: "sheet.command.toggle-flip-drawings",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function, complexity
  handler: (accessor, params) => {
    if (!params) return false;
    const commandService = accessor.get(ICommandService);
    const undoRedoService = accessor.get(IUndoRedoService);
    const sheetDrawingService = accessor.get(ISheetDrawingService);
    const sheetSkeletonService = accessor.get(SheetSkeletonService);
    const { drawings } = params;
    const flipH = params.flipH;
    const flipV = params.flipV;
    const unitIds = [];
    const updateParams = [];
    for (const param of drawings) {
      const { unitId, subUnitId, drawingId } = param;
      unitIds.push(unitId);
      const drawingData = sheetDrawingService.getDrawingData(unitId, subUnitId);
      const existing = drawingData == null ? void 0 : drawingData[drawingId];
      if (!existing) {
        continue;
      }
      const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
      if (!skeleton) {
        continue;
      }
      const transform = { ...existing.transform };
      if (flipH) {
        transform.flipX = !transform.flipX;
      }
      if (flipV) {
        transform.flipY = !transform.flipY;
      }
      const sheetTransform = transformToDrawingPosition(transform, skeleton);
      const axisAlignSheetTransform = transformToAxisAlignPosition(transform, skeleton);
      const updateParamItem = {
        unitId,
        subUnitId,
        drawingType: existing.drawingType,
        drawingId,
        transform,
        sheetTransform,
        axisAlignSheetTransform
      };
      const drawingType = existing.drawingType;
      if (drawingType === 0 /* DRAWING_IMAGE */) {
        const scene = getSceneByDrawingSearch(accessor, unitId);
        if (scene) {
          const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
          const imageShape = scene.getObject(drawingShapeKey);
          if (imageShape) {
            const srcRect = imageShape.srcRect;
            if (srcRect) {
              let newSrcRect;
              const { left = 0, top = 0, right = 0, bottom = 0 } = srcRect;
              if (flipH) {
                const centerX = left + (right - left) / 2;
                const newLeft = centerX - (right - left) / 2;
                const newRight = centerX + (right - left) / 2;
                newSrcRect = {
                  left: newLeft,
                  top,
                  right: newRight,
                  bottom
                };
              }
              if (flipV) {
                const centerY = top + (bottom - top) / 2;
                const newTop = centerY - (bottom - top) / 2;
                const newBottom = centerY + (bottom - top) / 2;
                newSrcRect = {
                  left,
                  top: newTop,
                  right,
                  bottom: newBottom
                };
              }
              if (newSrcRect) {
                updateParamItem.srcRect = newSrcRect;
              }
            }
          }
        }
      }
      updateParams.push(updateParamItem);
    }
    if (updateParams.length === 0) return false;
    const jsonOp = sheetDrawingService.getBatchUpdateOp(updateParams);
    const { unitId: opUnitId, subUnitId: opSubUnitId, undo, redo, objects } = jsonOp;
    const updateMutation = { id: SetDrawingApplyMutation.id, params: { unitId: opUnitId, subUnitId: opSubUnitId, op: redo, objects, type: 2 /* UPDATE */ } };
    const undoUpdateMutation = { id: SetDrawingApplyMutation.id, params: { unitId: opUnitId, subUnitId: opSubUnitId, op: undo, objects, type: 2 /* UPDATE */ } };
    const result = sequenceExecute([updateMutation], commandService);
    if (result.result) {
      undoRedoService.pushUndoRedo({
        unitID: opUnitId,
        undoMutations: [undoUpdateMutation, { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }],
        redoMutations: [updateMutation, { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }]
      });
      return true;
    }
    return false;
  }
};
function getSceneByDrawingSearch(accessor, unitId) {
  const renderManagerService = accessor.get(IRenderManagerService);
  const render2 = renderManagerService.getRenderById(unitId);
  if (!render2) {
    return null;
  }
  return render2.scene;
}

// ../packages/sheets-drawing-ui/src/commands/commands/move-drawings.command.ts
var MoveDrawingsCommand = {
  id: "sheet.command.move-drawing",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const drawingManagerService = accessor.get(ISheetDrawingService);
    const sheetSkeletonService = accessor.get(SheetSkeletonService);
    const { direction } = params;
    const drawings = drawingManagerService.getFocusDrawings();
    if (drawings.length === 0) {
      return false;
    }
    const unitId = drawings[0].unitId;
    const newDrawings = drawings.map((drawing) => {
      const { transform, unitId: unitId2, subUnitId } = drawing;
      const skeleton = sheetSkeletonService.getSkeleton(unitId2, subUnitId);
      if (!transform || !skeleton) {
        return null;
      }
      const newTransform = { ...transform };
      const { left = 0, top = 0 } = transform;
      if (direction === 0 /* UP */) {
        newTransform.top = top - 1;
      } else if (direction === 2 /* DOWN */) {
        newTransform.top = top + 1;
      } else if (direction === 3 /* LEFT */) {
        newTransform.left = left - 1;
      } else if (direction === 1 /* RIGHT */) {
        newTransform.left = left + 1;
      }
      return {
        ...drawing,
        transform: newTransform,
        sheetTransform: transformToDrawingPosition(newTransform, skeleton),
        axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, skeleton)
      };
    }).filter((drawing) => drawing != null);
    const result = commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
      unitId,
      drawings: newDrawings
    });
    if (result) {
      commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
      return true;
    }
    return false;
  }
};

// ../packages/sheets-drawing-ui/src/services/batch-save-images.service.ts
var IBatchSaveImagesService = createIdentifier("sheets-drawing-ui.batch-save-images.service");
function columnIndexToLetter(index) {
  let letter = "";
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode(temp % 26 + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}
function toA1Notation(row, col) {
  return `${columnIndexToLetter(col)}${row + 1}`;
}
function rangeToA1Notation(range) {
  const start = toA1Notation(range.startRow, range.startColumn);
  const end = toA1Notation(range.endRow, range.endColumn);
  return start === end ? start : `${start}:${end}`;
}
function cellHasImage(cell) {
  var _a, _b, _c, _d;
  return !!(((_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.drawingsOrder) == null ? void 0 : _b.length) && ((_d = (_c = cell == null ? void 0 : cell.p) == null ? void 0 : _c.drawingsOrder) == null ? void 0 : _d.length) > 0);
}
function getCellImageData(cell) {
  var _a, _b, _c;
  if (!((_b = (_a = cell.p) == null ? void 0 : _a.drawingsOrder) == null ? void 0 : _b.length) || !((_c = cell.p) == null ? void 0 : _c.drawings)) {
    return null;
  }
  const drawingId = cell.p.drawingsOrder[0];
  const drawing = cell.p.drawings[drawingId];
  if (!drawing || !("source" in drawing) || !("imageSourceType" in drawing)) {
    return null;
  }
  return drawing;
}
function getFileExtension(source, imageSourceType) {
  if (imageSourceType === "BASE64" /* BASE64 */) {
    const match = source.match(/^data:image\/(\w+);/);
    if (match) {
      return match[1] === "jpeg" ? "jpg" : match[1];
    }
  }
  if (imageSourceType === "URL" /* URL */) {
    const urlMatch = source.match(/\.(\w+)(?:\?|$)/);
    if (urlMatch) {
      return urlMatch[1].toLowerCase();
    }
  }
  return "png";
}
async function imageSourceToBlob(source, imageSourceType) {
  if (imageSourceType === "BASE64" /* BASE64 */) {
    const response = await fetch(source);
    return response.blob();
  }
  if (imageSourceType === "URL" /* URL */) {
    const response = await fetch(source);
    return response.blob();
  }
  throw new Error("UUID image type requires additional handling");
}
var BatchSaveImagesService = class extends Disposable {
  constructor(_univerInstanceService, _selectionService, _imageIoService, _urlImageService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_selectionService", _selectionService);
    __publicField(this, "_imageIoService", _imageIoService);
    __publicField(this, "_urlImageService", _urlImageService);
  }
  /**
   * @deprecated Use IURLImageService directly
   */
  registerURLImageDownloader(downloader) {
    return this._urlImageService.registerURLImageDownloader(downloader);
  }
  getCellImagesInSelection() {
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) return [];
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return [];
    const selections = this._selectionService.getCurrentSelections();
    if (!selections || selections.length === 0) return [];
    const cellMatrix = worksheet.getCellMatrix();
    const images = [];
    for (const selection of selections) {
      const { startRow, endRow, startColumn, endColumn } = selection.range;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startColumn; col <= endColumn; col++) {
          const cell = cellMatrix.getValue(row, col);
          if (cellHasImage(cell)) {
            const imageData = getCellImageData(cell);
            if (imageData) {
              images.push({
                row,
                col,
                cellAddress: toA1Notation(row, col),
                source: imageData.source,
                imageSourceType: imageData.imageSourceType,
                imageId: imageData.drawingId
              });
            }
          }
        }
      }
    }
    return images;
  }
  getCellImagesFromRanges(unitId, subUnitId, ranges) {
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    if (!workbook) return [];
    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) return [];
    const cellMatrix = worksheet.getCellMatrix();
    const images = [];
    for (const range of ranges) {
      const { startRow, endRow, startColumn, endColumn } = range;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startColumn; col <= endColumn; col++) {
          const cell = cellMatrix.getValue(row, col);
          if (cellHasImage(cell)) {
            const imageData = getCellImageData(cell);
            if (imageData) {
              images.push({
                row,
                col,
                cellAddress: toA1Notation(row, col),
                source: imageData.source,
                imageSourceType: imageData.imageSourceType,
                imageId: imageData.drawingId
              });
            }
          }
        }
      }
    }
    return images;
  }
  getDataColumns() {
    var _a, _b, _c, _d;
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) return [];
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return [];
    const selections = this._selectionService.getCurrentSelections();
    if (!selections || selections.length === 0) return [];
    const cellMatrix = worksheet.getCellMatrix();
    const dataRange = cellMatrix.getDataRange();
    let minRow = Infinity;
    let maxRow = -Infinity;
    const selectionColumnIndices = /* @__PURE__ */ new Set();
    for (const selection of selections) {
      minRow = Math.min(minRow, selection.range.startRow);
      maxRow = Math.max(maxRow, selection.range.endRow);
      for (let col = selection.range.startColumn; col <= selection.range.endColumn; col++) {
        selectionColumnIndices.add(col);
      }
    }
    const columnsWithData = /* @__PURE__ */ new Set();
    for (let col = dataRange.startColumn; col <= dataRange.endColumn; col++) {
      if (selectionColumnIndices.has(col)) {
        continue;
      }
      for (let row = minRow; row <= maxRow; row++) {
        const cell = cellMatrix.getValue(row, col);
        if (cell) {
          const value = ((_a = cell.v) == null ? void 0 : _a.toString()) || ((_d = (_c = (_b = cell.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream) == null ? void 0 : _d.trim()) || "";
          if (value) {
            columnsWithData.add(col);
            break;
          }
        }
      }
    }
    const columns = [];
    const sortedCols = Array.from(columnsWithData).sort((a, b) => a - b);
    for (const col of sortedCols) {
      columns.push({
        index: col,
        label: columnIndexToLetter(col)
      });
    }
    return columns;
  }
  getDataColumnsForRanges(unitId, subUnitId, ranges) {
    var _a, _b, _c, _d;
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    if (!workbook) return [];
    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) return [];
    const cellMatrix = worksheet.getCellMatrix();
    const dataRange = cellMatrix.getDataRange();
    let minRow = Infinity;
    let maxRow = -Infinity;
    const rangeColumnIndices = /* @__PURE__ */ new Set();
    for (const range of ranges) {
      minRow = Math.min(minRow, range.startRow);
      maxRow = Math.max(maxRow, range.endRow);
      for (let col = range.startColumn; col <= range.endColumn; col++) {
        rangeColumnIndices.add(col);
      }
    }
    const columnsWithData = /* @__PURE__ */ new Set();
    for (let col = dataRange.startColumn; col <= dataRange.endColumn; col++) {
      if (rangeColumnIndices.has(col)) {
        continue;
      }
      for (let row = minRow; row <= maxRow; row++) {
        const cell = cellMatrix.getValue(row, col);
        if (cell) {
          const value = ((_a = cell.v) == null ? void 0 : _a.toString()) || ((_d = (_c = (_b = cell.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream) == null ? void 0 : _d.trim()) || "";
          if (value) {
            columnsWithData.add(col);
            break;
          }
        }
      }
    }
    const columns = [];
    const sortedCols = Array.from(columnsWithData).sort((a, b) => a - b);
    for (const col of sortedCols) {
      columns.push({
        index: col,
        label: columnIndexToLetter(col)
      });
    }
    return columns;
  }
  getSelectionRangeNotation() {
    const selections = this._selectionService.getCurrentSelections();
    if (!selections || selections.length === 0) return "";
    return selections.map((s) => rangeToA1Notation(s.range)).join(", ");
  }
  getSelectionRowRange() {
    const selections = this._selectionService.getCurrentSelections();
    if (!selections || selections.length === 0) return null;
    let minRow = Infinity;
    let maxRow = -Infinity;
    for (const selection of selections) {
      minRow = Math.min(minRow, selection.range.startRow);
      maxRow = Math.max(maxRow, selection.range.endRow);
    }
    return { startRow: minRow, endRow: maxRow };
  }
  getSelectionColumnIndices() {
    const selections = this._selectionService.getCurrentSelections();
    if (!selections || selections.length === 0) return /* @__PURE__ */ new Set();
    const columnIndices = /* @__PURE__ */ new Set();
    for (const selection of selections) {
      for (let col = selection.range.startColumn; col <= selection.range.endColumn; col++) {
        columnIndices.add(col);
      }
    }
    return columnIndices;
  }
  generateFileName(imageInfo, config) {
    var _a, _b, _c, _d;
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
    const parts = [];
    for (const part of config.fileNameParts) {
      if (part === "cellAddress" /* CELL_ADDRESS */) {
        parts.push(imageInfo.cellAddress);
      } else if (part === "columnValue" /* COLUMN_VALUE */ && config.columnIndex !== void 0) {
        const worksheet = workbook == null ? void 0 : workbook.getActiveSheet();
        if (worksheet) {
          const cellMatrix = worksheet.getCellMatrix();
          const cell = cellMatrix.getValue(imageInfo.row, config.columnIndex);
          if (cell) {
            const value = ((_a = cell.v) == null ? void 0 : _a.toString()) || ((_d = (_c = (_b = cell.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream) == null ? void 0 : _d.trim()) || "";
            if (value) {
              const sanitized = value.replace(/[<>:"/\\|?*]/g, "_").trim();
              if (sanitized) {
                parts.push(sanitized);
              }
            }
          }
        }
      }
    }
    if (parts.length === 0) {
      return `${imageInfo.cellAddress}.${extension}`;
    }
    return `${parts.join("_")}.${extension}`;
  }
  generateFileNameWithContext(imageInfo, config, unitId, subUnitId) {
    var _a, _b, _c, _d;
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
    const parts = [];
    for (const part of config.fileNameParts) {
      if (part === "cellAddress" /* CELL_ADDRESS */) {
        parts.push(imageInfo.cellAddress);
      } else if (part === "columnValue" /* COLUMN_VALUE */ && config.columnIndex !== void 0) {
        const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
        if (worksheet) {
          const cellMatrix = worksheet.getCellMatrix();
          const cell = cellMatrix.getValue(imageInfo.row, config.columnIndex);
          if (cell) {
            const value = ((_a = cell.v) == null ? void 0 : _a.toString()) || ((_d = (_c = (_b = cell.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream) == null ? void 0 : _d.trim()) || "";
            if (value) {
              const sanitized = value.replace(/[<>:"/\\|?*]/g, "_").trim();
              if (sanitized) {
                parts.push(sanitized);
              }
            }
          }
        }
      }
    }
    if (parts.length === 0) {
      return `${imageInfo.cellAddress}.${extension}`;
    }
    return `${parts.join("_")}.${extension}`;
  }
  async saveImages(images, config) {
    var _a;
    const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    const fileNameCounts = /* @__PURE__ */ new Map();
    for (const imageInfo of images) {
      let fileName = this.generateFileName(imageInfo, config);
      const baseName = fileName.replace(/\.\w+$/, "");
      const ext = ((_a = fileName.match(/\.\w+$/)) == null ? void 0 : _a[0]) || ".png";
      const count = fileNameCounts.get(baseName) || 0;
      if (count > 0) {
        fileName = `${baseName}_${count}${ext}`;
      }
      fileNameCounts.set(baseName, count + 1);
      try {
        const blob = await this._getImageBlob(imageInfo);
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (error) {
        console.error(`Failed to save image ${fileName}:`, error);
        throw error;
      }
    }
  }
  async saveImagesWithContext(images, config, unitId, subUnitId) {
    var _a;
    const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    const fileNameCounts = /* @__PURE__ */ new Map();
    for (const imageInfo of images) {
      let fileName = this.generateFileNameWithContext(imageInfo, config, unitId, subUnitId);
      const baseName = fileName.replace(/\.\w+$/, "");
      const ext = ((_a = fileName.match(/\.\w+$/)) == null ? void 0 : _a[0]) || ".png";
      const count = fileNameCounts.get(baseName) || 0;
      if (count > 0) {
        fileName = `${baseName}_${count}${ext}`;
      }
      fileNameCounts.set(baseName, count + 1);
      try {
        const blob = await this._getImageBlob(imageInfo);
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (error) {
        console.error(`Failed to save image ${fileName}:`, error);
        throw error;
      }
    }
  }
  async downloadSingleImage(imageInfo) {
    const extension = getFileExtension(imageInfo.source, imageInfo.imageSourceType);
    const fileName = `${imageInfo.cellAddress}.${extension}`;
    try {
      const blob = await this._getImageBlob(imageInfo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download image ${fileName}:`, error);
      throw error;
    }
  }
  async _getImageBlob(imageInfo) {
    if (imageInfo.imageSourceType === "UUID" /* UUID */) {
      const imageUrl = await this._imageIoService.getImage(imageInfo.source);
      return imageSourceToBlob(imageUrl, "URL" /* URL */);
    }
    if (imageInfo.imageSourceType === "URL" /* URL */) {
      return this._urlImageService.downloadImage(imageInfo.source);
    }
    return imageSourceToBlob(imageInfo.source, imageInfo.imageSourceType);
  }
};
BatchSaveImagesService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(SheetsSelectionsService)),
  __decorateParam(2, IImageIoService),
  __decorateParam(3, IURLImageService)
], BatchSaveImagesService);

// ../packages/sheets-drawing-ui/src/views/batch-save-images/component-name.ts
var BATCH_SAVE_IMAGES_DIALOG_ID = "sheet.dialog.batch-save-images";

// ../packages/sheets-drawing-ui/src/commands/commands/save-cell-images.command.ts
var SaveCellImagesCommand = {
  id: "sheet.command.save-cell-images",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const dialogService = accessor.get(IDialogService);
    const batchSaveService = accessor.get(IBatchSaveImagesService);
    const images = batchSaveService.getCellImagesInSelection();
    if (images.length === 1) {
      try {
        await batchSaveService.downloadSingleImage(images[0]);
        return true;
      } catch (error) {
        console.error("Failed to download image:", error);
        return false;
      }
    }
    const localeService = accessor.get(LocaleService);
    const selectionRange = batchSaveService.getSelectionRangeNotation();
    const titleText = `${localeService.t("sheets-drawing-ui.save.title")} (${selectionRange})`;
    dialogService.open({
      id: BATCH_SAVE_IMAGES_DIALOG_ID,
      draggable: true,
      width: 360,
      title: { title: titleText },
      children: {
        label: BATCH_SAVE_IMAGES_DIALOG_ID
      },
      destroyOnClose: true,
      preservePositionOnDestroy: true,
      onClose: () => dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID)
    });
    return true;
  }
};

// ../packages/sheets-drawing-ui/src/views/sheet-image-panel/component-name.ts
var COMPONENT_SHEET_DRAWING_PANEL = "COMPONENT_SHEET_DRAWING_PANEL";

// ../packages/sheets-drawing-ui/src/commands/operations/open-drawing-panel.operation.ts
var SidebarSheetDrawingOperation = {
  id: "sidebar.operation.sheet-image",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    const sidebarService = accessor.get(ISidebarService);
    const localeService = accessor.get(LocaleService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    switch (params.value) {
      case "open":
        sidebarService.open({
          header: { title: localeService.t("sheets-drawing-ui.panel.title") },
          children: { label: COMPONENT_SHEET_DRAWING_PANEL },
          onClose: () => {
            commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
          },
          width: 360
        });
        break;
      case "close":
      default:
        sidebarService.close();
        break;
    }
    return true;
  }
};

// ../packages/sheets-drawing-ui/src/commands/operations/edit-sheet-drawing.operation.ts
var EditSheetDrawingOperation = {
  id: "sheet.operation.edit-sheet-image",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    if (params == null) {
      return false;
    }
    commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [params]);
    commandService.executeCommand(SidebarSheetDrawingOperation.id, { value: "open" });
    return true;
  }
};

// ../packages/sheets-drawing-ui/src/menu/image.menu.ts
var SHEETS_IMAGE_MENU_ID = "sheet.menu.image";
function ImageMenuFactory(accessor) {
  return {
    id: SHEETS_IMAGE_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "AddImageIcon",
    tooltip: "sheets-drawing-ui.title",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function UploadFloatImageMenuFactory(_accessor) {
  return {
    id: InsertFloatImageCommand.id,
    title: "sheets-drawing-ui.upload.float",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(_accessor, 2 /* UNIVER_SHEET */)
  };
}
function UploadCellImageMenuFactory(_accessor) {
  return {
    id: InsertCellImageCommand.id,
    title: "sheets-drawing-ui.upload.cell",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(_accessor, 2 /* UNIVER_SHEET */)
  };
}

// ../packages/sheets-drawing-ui/src/menu/save-images.menu.ts
function cellHasImage2(cell) {
  var _a, _b, _c, _d;
  return !!(((_b = (_a = cell == null ? void 0 : cell.p) == null ? void 0 : _a.drawingsOrder) == null ? void 0 : _b.length) && ((_d = (_c = cell == null ? void 0 : cell.p) == null ? void 0 : _c.drawingsOrder) == null ? void 0 : _d.length) > 0);
}
function selectionHasImages(workbook, selection) {
  const worksheet = workbook.getActiveSheet();
  if (!worksheet) return false;
  const cellMatrix = worksheet.getCellMatrix();
  const { startRow, endRow, startColumn, endColumn } = selection;
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColumn; col <= endColumn; col++) {
      const cell = cellMatrix.getValue(row, col);
      if (cellHasImage2(cell)) {
        return true;
      }
    }
  }
  return false;
}
function isFileSystemAccessSupported() {
  return "showDirectoryPicker" in window;
}
function SaveCellImagesMenuFactory(accessor) {
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const selectionService = accessor.get(SheetsSelectionsService);
  const hidden$ = combineLatest([
    getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(
      switchMap((workbook) => {
        if (!workbook) return of(true);
        return selectionService.selectionMoveEnd$.pipe(
          map(() => {
            if (!isFileSystemAccessSupported()) {
              return true;
            }
            const selections = selectionService.getCurrentSelections();
            if (!selections || selections.length === 0) {
              return true;
            }
            for (const selection of selections) {
              if (selectionHasImages(workbook, selection.range)) {
                return false;
              }
            }
            return true;
          })
        );
      })
    )
  ]).pipe(
    map(([hidden, noImages]) => hidden || noImages)
  );
  return {
    id: SaveCellImagesCommand.id,
    type: 0 /* BUTTON */,
    icon: "DownloadImageIcon",
    title: "sheets-drawing-ui.save.menuLabel",
    hidden$
  };
}

// ../packages/sheets-drawing-ui/src/menu/schema.ts
var menuSchema2 = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [SHEETS_IMAGE_MENU_ID]: {
      order: 0,
      menuItemFactory: ImageMenuFactory,
      [InsertFloatImageCommand.id]: {
        order: 0,
        menuItemFactory: UploadFloatImageMenuFactory
      },
      [InsertCellImageCommand.id]: {
        order: 1,
        menuItemFactory: UploadCellImageMenuFactory
      }
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [SaveCellImagesCommand.id]: {
        order: 10,
        menuItemFactory: SaveCellImagesMenuFactory
      }
    }
  },
  ["contextMenu.colHeader" /* COL_HEADER */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [SaveCellImagesCommand.id]: {
        order: 10,
        menuItemFactory: SaveCellImagesMenuFactory
      }
    }
  },
  ["contextMenu.rowHeader" /* ROW_HEADER */]: {
    ["contextMenu.others" /* OTHERS */]: {
      [SaveCellImagesCommand.id]: {
        order: 10,
        menuItemFactory: SaveCellImagesMenuFactory
      }
    }
  }
};

// ../packages/sheets-drawing-ui/src/views/batch-save-images/BatchSaveImagesDialog.tsx
var import_react9 = __toESM(require_react());
var import_jsx_runtime10 = __toESM(require_jsx_runtime());
function BatchSaveImagesDialog() {
  const localeService = useDependency(LocaleService);
  const dialogService = useDependency(IDialogService);
  const batchSaveService = useDependency(IBatchSaveImagesService);
  const [fileNameParts, setFileNameParts] = (0, import_react9.useState)(["cellAddress" /* CELL_ADDRESS */]);
  const [saving, setSaving] = (0, import_react9.useState)(false);
  const [error, setError] = (0, import_react9.useState)(null);
  const images = (0, import_react9.useMemo)(() => batchSaveService.getCellImagesInSelection(), [batchSaveService]);
  const dataColumns = (0, import_react9.useMemo)(() => batchSaveService.getDataColumns(), [batchSaveService]);
  const rowRange = (0, import_react9.useMemo)(() => batchSaveService.getSelectionRowRange(), [batchSaveService]);
  const hasAvailableColumns = dataColumns.length > 0;
  const columnOptions = (0, import_react9.useMemo)(() => {
    return dataColumns.map((col) => ({
      label: col.label,
      value: String(col.index)
    }));
  }, [dataColumns]);
  const [selectedColumn, setSelectedColumn] = (0, import_react9.useState)(
    () => columnOptions.length > 0 ? columnOptions[0].value : "0"
  );
  const highlightRanges = (0, import_react9.useMemo)(() => {
    const showColumnSelect2 = fileNameParts.includes("columnValue" /* COLUMN_VALUE */);
    if (!showColumnSelect2 || !rowRange) {
      return [];
    }
    const colIndex = Number(selectedColumn);
    return [{
      startRow: rowRange.startRow,
      endRow: rowRange.endRow,
      startColumn: colIndex,
      endColumn: colIndex
    }];
  }, [fileNameParts, selectedColumn, rowRange]);
  useHighlightRange(highlightRanges);
  const handleFileNamePartsChange = (0, import_react9.useCallback)((value) => {
    if (value.length === 0) {
      return;
    }
    setFileNameParts(value);
  }, []);
  const handleColumnChange = (0, import_react9.useCallback)((value) => {
    setSelectedColumn(String(value));
  }, []);
  const handleCancel = (0, import_react9.useCallback)(() => {
    dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID);
  }, [dialogService]);
  const handleConfirm = (0, import_react9.useCallback)(async () => {
    if (images.length === 0) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await batchSaveService.saveImages(images, {
        fileNameParts,
        columnIndex: fileNameParts.includes("columnValue" /* COLUMN_VALUE */) ? Number(selectedColumn) : void 0
      });
      dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID);
    } catch (err) {
      console.error("Failed to save images:", err);
      setError(localeService.t("sheets-drawing-ui.save.error"));
    } finally {
      setSaving(false);
    }
  }, [batchSaveService, images, fileNameParts, selectedColumn, dialogService, localeService]);
  const showColumnSelect = fileNameParts.includes("columnValue" /* COLUMN_VALUE */);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-flex univer-flex-col", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FormLayout, { label: localeService.t("sheets-drawing-ui.save.imageCount"), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-text-sm univer-text-gray-600", children: images.length }) }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FormLayout, { label: localeService.t("sheets-drawing-ui.save.fileNameConfig"), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(CheckboxGroup, { value: fileNameParts, onChange: handleFileNamePartsChange, direction: "vertical", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Checkbox, { value: "cellAddress" /* CELL_ADDRESS */, disabled: !hasAvailableColumns, children: localeService.t("sheets-drawing-ui.save.useRowCol") }),
      hasAvailableColumns && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Checkbox, { value: "columnValue" /* COLUMN_VALUE */, children: localeService.t("sheets-drawing-ui.save.useColumnValue") })
    ] }) }),
    showColumnSelect && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FormLayout, { label: localeService.t("sheets-drawing-ui.save.selectColumn"), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Select,
      {
        value: selectedColumn,
        options: columnOptions,
        onChange: handleColumnChange
      }
    ) }),
    error && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-text-xs univer-text-red-500", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
      "div",
      {
        className: `univer-flex univer-justify-end univer-gap-2 univer-border-t univer-border-gray-200 univer-pt-3`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { onClick: handleCancel, disabled: saving, children: localeService.t("sheets-drawing-ui.save.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            Button,
            {
              variant: "primary",
              onClick: handleConfirm,
              disabled: saving || images.length === 0,
              children: saving ? localeService.t("sheets-drawing-ui.save.saving") : localeService.t("sheets-drawing-ui.save.confirm")
            }
          )
        ]
      }
    )
  ] });
}

// ../packages/sheets-drawing-ui/src/views/sheet-image-panel/SheetDrawingPanel.tsx
var import_react11 = __toESM(require_react());

// ../packages/sheets-drawing-ui/src/views/sheet-image-panel/SheetDrawingAnchor.tsx
var import_react10 = __toESM(require_react());
var import_jsx_runtime11 = __toESM(require_jsx_runtime());
var SheetDrawingAnchor = (props) => {
  var _a;
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const renderManagerService = useDependency(IRenderManagerService);
  const { drawings } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return;
  }
  const { unitId } = drawingParam;
  const renderObject = renderManagerService.getRenderById(unitId);
  const scene = renderObject == null ? void 0 : renderObject.scene;
  if (scene == null) {
    return;
  }
  const transformer = scene.getTransformerByCreate();
  const [anchorShow, setAnchorShow] = (0, import_react10.useState)(true);
  const type = (_a = drawingParam.anchorType) != null ? _a : "0" /* Position */;
  const [value, setValue] = (0, import_react10.useState)(type);
  function getUpdateParams2(objects, drawingManagerService2) {
    const params = [];
    objects.forEach((object) => {
      const { oKey } = object;
      const searchParam = drawingManagerService2.getDrawingOKey(oKey);
      if (searchParam == null) {
        params.push(null);
        return true;
      }
      const { unitId: unitId2, subUnitId, drawingId, drawingType, anchorType, sheetTransform, axisAlignSheetTransform } = searchParam;
      params.push({
        unitId: unitId2,
        subUnitId,
        drawingId,
        anchorType,
        sheetTransform,
        drawingType,
        axisAlignSheetTransform
      });
    });
    return params;
  }
  (0, import_react10.useEffect)(() => {
    const onClearControlObserver = transformer.clearControl$.subscribe((changeSelf) => {
      if (changeSelf === true) {
        setAnchorShow(false);
      }
    });
    const onChangeStartObserver = transformer.changeStart$.subscribe((state) => {
      var _a2;
      const { objects } = state;
      const params = getUpdateParams2(objects, drawingManagerService);
      if (params.length === 0) {
        setAnchorShow(false);
      } else if (params.length >= 1) {
        setAnchorShow(true);
        const anchorType = ((_a2 = params[0]) == null ? void 0 : _a2.anchorType) || "0" /* Position */;
        setValue(anchorType);
      }
    });
    return () => {
      onChangeStartObserver.unsubscribe();
      onClearControlObserver.unsubscribe();
    };
  }, []);
  function handleChange(value2) {
    setValue(value2);
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const updateParams = focusDrawings.map((drawing) => {
      return {
        unitId: drawing.unitId,
        subUnitId: drawing.subUnitId,
        drawingId: drawing.drawingId,
        anchorType: value2
      };
    });
    commandService.executeCommand(SetSheetDrawingCommand.id, {
      unitId: focusDrawings[0].unitId,
      drawings: updateParams
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !anchorShow
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { children: localeService.t("sheets-drawing-ui.drawing-anchor.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(RadioGroup, { value, onChange: handleChange, direction: "vertical", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Radio, { value: "1" /* Both */, children: localeService.t("sheets-drawing-ui.drawing-anchor.both") }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Radio, { value: "0" /* Position */, children: localeService.t("sheets-drawing-ui.drawing-anchor.position") }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Radio, { value: "2" /* None */, children: localeService.t("sheets-drawing-ui.drawing-anchor.none") })
        ] }) })
      ]
    }
  );
};

// ../packages/sheets-drawing-ui/src/views/sheet-image-panel/SheetDrawingPanel.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime());
var SheetDrawingPanel = () => {
  const drawingManagerService = useDependency(IDrawingManagerService);
  const focusDrawings = drawingManagerService.getFocusDrawings();
  const [drawings, setDrawings] = (0, import_react11.useState)(focusDrawings);
  (0, import_react11.useEffect)(() => {
    const focusDispose = drawingManagerService.focus$.subscribe((drawings2) => {
      setDrawings(drawings2);
    });
    return () => {
      focusDispose.unsubscribe();
    };
  }, []);
  return !!(drawings == null ? void 0 : drawings.length) && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "univer-text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DrawingCommonPanel, { drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SheetDrawingAnchor, { drawings })
  ] });
};

// ../packages/sheets-drawing-ui/src/controllers/shortcuts/drawing.shortcut.ts
function whenSheetDrawingFocused(contextService) {
  return contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_FX_BAR_EDITOR) && !contextService.getContextValue(FOCUSING_PANEL_EDITOR) && contextService.getContextValue(FOCUSING_COMMON_DRAWINGS) && !contextService.getContextValue(FOCUSING_SHAPE_TEXT_EDITOR);
}
var MoveDrawingDownShortcutItem = {
  id: MoveDrawingsCommand.id,
  description: "sheets-drawing-ui.shortcut.drawing-move-down",
  group: "4_drawing-view",
  groupTitle: "sheets-drawing-ui.shortcut.drawing-view",
  binding: 40 /* ARROW_DOWN */,
  priority: 100,
  preconditions: whenSheetDrawingFocused,
  staticParameters: {
    direction: 2 /* DOWN */
  }
};
var MoveDrawingUpShortcutItem = {
  id: MoveDrawingsCommand.id,
  description: "sheets-drawing-ui.shortcut.drawing-move-up",
  group: "4_drawing-view",
  groupTitle: "sheets-drawing-ui.shortcut.drawing-view",
  binding: 38 /* ARROW_UP */,
  priority: 100,
  preconditions: whenSheetDrawingFocused,
  staticParameters: {
    direction: 0 /* UP */
  }
};
var MoveDrawingLeftShortcutItem = {
  id: MoveDrawingsCommand.id,
  description: "sheets-drawing-ui.shortcut.drawing-move-left",
  group: "4_drawing-view",
  groupTitle: "sheets-drawing-ui.shortcut.drawing-view",
  binding: 37 /* ARROW_LEFT */,
  priority: 100,
  preconditions: whenSheetDrawingFocused,
  staticParameters: {
    direction: 3 /* LEFT */
  }
};
var MoveDrawingRightShortcutItem = {
  id: MoveDrawingsCommand.id,
  description: "sheets-drawing-ui.shortcut.drawing-move-right",
  group: "4_drawing-view",
  groupTitle: "sheets-drawing-ui.shortcut.drawing-view",
  binding: 39 /* ARROW_RIGHT */,
  priority: 100,
  preconditions: whenSheetDrawingFocused,
  staticParameters: {
    direction: 1 /* RIGHT */
  }
};
var DeleteDrawingsShortcutItem = {
  id: DeleteDrawingsCommand.id,
  description: "sheets-drawing-ui.shortcut.drawing-delete",
  group: "4_drawing-view",
  groupTitle: "sheets-drawing-ui.shortcut.drawing-view",
  priority: 100,
  // when focusing on any other input tag do not trigger this shortcut
  preconditions: whenSheetDrawingFocused,
  binding: 46 /* DELETE */,
  mac: 8 /* BACKSPACE */
};

// ../packages/sheets-drawing-ui/src/controllers/sheet-drawing.controller.ts
var SheetDrawingUIController = class extends Disposable {
  constructor(_componentManager, _menuManagerService, _commandService, _shortcutService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_shortcutService", _shortcutService);
    this._init();
  }
  _initCustomComponents() {
    const componentManager = this._componentManager;
    this.disposeWithMe(componentManager.register(COMPONENT_SHEET_DRAWING_PANEL, SheetDrawingPanel));
    this.disposeWithMe(componentManager.register(BATCH_SAVE_IMAGES_DIALOG_ID, BatchSaveImagesDialog));
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema2);
  }
  _initCommands() {
    [
      InsertFloatImageCommand,
      InsertCellImageCommand,
      SidebarSheetDrawingOperation,
      EditSheetDrawingOperation,
      GroupSheetDrawingCommand,
      UngroupSheetDrawingCommand,
      MoveDrawingsCommand,
      DeleteDrawingsCommand,
      SaveCellImagesCommand,
      FlipSheetDrawingCommand
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _initShortcuts() {
    [
      // sheet drawing shortcuts
      MoveDrawingDownShortcutItem,
      MoveDrawingUpShortcutItem,
      MoveDrawingLeftShortcutItem,
      MoveDrawingRightShortcutItem,
      DeleteDrawingsShortcutItem
    ].forEach((item) => {
      this.disposeWithMe(this._shortcutService.registerShortcut(item));
    });
  }
  _init() {
    this._initCommands();
    this._initCustomComponents();
    this._initMenus();
    this._initShortcuts();
  }
};
SheetDrawingUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IShortcutService)
], SheetDrawingUIController);

// ../packages/sheets-drawing-ui/src/menu/drawing-popup-menu.controller.ts
var DrawingPopupMenuController = class extends RxDisposable {
  constructor(_injector, _localeService, _drawingManagerService, _canvasPopManagerService, _renderManagerService, _univerInstanceService, _messageService, _contextService, _ioService, _commandService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_canvasPopManagerService", _canvasPopManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_ioService", _ioService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_initImagePopupMenu", /* @__PURE__ */ new Set());
    this._init();
  }
  _init() {
    this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe((workbook) => this._create(workbook));
    this._univerInstanceService.getTypeOfUnitDisposed$(2 /* UNIVER_SHEET */).subscribe((workbook) => this._dispose(workbook));
    this._univerInstanceService.getAllUnitsForType(2 /* UNIVER_SHEET */).forEach((workbook) => this._create(workbook));
    this._setupLoadingStatus();
  }
  _setupLoadingStatus() {
    const MESSAGE_ID = "image-upload-loading";
    let messageDisposable;
    this.disposeWithMe(this._ioService.change$.subscribe((status) => {
      if (status > 0 && !messageDisposable) {
        messageDisposable = this._messageService.show({
          id: MESSAGE_ID,
          type: "loading" /* Loading */,
          content: `${this._localeService.t("sheets-ui.uploadLoading.loading")}: ${status}`,
          duration: 0
        });
      } else if (status === 0) {
        messageDisposable == null ? void 0 : messageDisposable.dispose();
        messageDisposable = void 0;
      }
    }));
  }
  _dispose(workbook) {
    super.dispose();
    const unitId = workbook.getUnitId();
    this._renderManagerService.removeRender(unitId);
    this._initImagePopupMenu.delete(unitId);
  }
  _create(workbook) {
    if (!workbook) {
      return;
    }
    const unitId = workbook.getUnitId();
    if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
      this._popupMenuListener(unitId);
      this._initImagePopupMenu.add(unitId);
    }
  }
  _hasCropObject(scene) {
    const objects = scene.getAllObjectsByOrder();
    for (const object of objects) {
      if (object instanceof ImageCropperObject) {
        return true;
      }
    }
    return false;
  }
  _popupMenuListener(unitId) {
    var _a;
    const scene = (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.scene;
    if (!scene) {
      return;
    }
    const transformer = scene.getTransformerByCreate();
    if (!transformer) {
      return;
    }
    let singletonPopupDisposer;
    this.disposeWithMe(
      transformer.createControl$.subscribe(() => {
        this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        if (this._hasCropObject(scene)) {
          return;
        }
        const selectedObjects = transformer.getSelectedObjectMap();
        if (selectedObjects.size > 1) {
          singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
          return;
        }
        const object = selectedObjects.values().next().value;
        if (!object) {
          return;
        }
        const oKey = object.oKey;
        const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
        if (!drawingParam) {
          return;
        }
        const { unitId: unitId2, subUnitId, drawingId, drawingType } = drawingParam;
        const data = drawingParam.data;
        if (data && data.disablePopup) {
          return;
        }
        singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
        const menus = this._canvasPopManagerService.getFeatureMenu(unitId2, subUnitId, drawingId, drawingType);
        singletonPopupDisposer = this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
          componentKey: COMPONENT_IMAGE_POPUP_MENU,
          direction: "horizontal",
          offset: [2, 0],
          extraProps: {
            menuItems: menus || this._getImageMenuItems(unitId2, subUnitId, drawingId, drawingType)
          }
        }));
      })
    );
    this.disposeWithMe(
      transformer.clearControl$.subscribe(() => {
        singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
        this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
        this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
      })
    );
    this.disposeWithMe(
      this._contextService.contextChanged$.subscribe((event) => {
        if (event[FOCUSING_COMMON_DRAWINGS] === false) {
          singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
        }
      })
    );
    this.disposeWithMe(
      transformer.changing$.subscribe(() => {
        singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
      })
    );
  }
  _getImageMenuItems(unitId, subUnitId, drawingId, drawingType) {
    return [
      {
        label: "sheets-drawing-ui.image-popup.edit",
        index: 0,
        commandId: EditSheetDrawingOperation.id,
        commandParams: { unitId, subUnitId, drawingId },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "sheets-drawing-ui.image-popup.delete",
        index: 1,
        commandId: RemoveSheetDrawingCommand.id,
        commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
        disable: false
      },
      {
        label: "sheets-drawing-ui.image-popup.crop",
        index: 2,
        commandId: OpenImageCropOperation.id,
        commandParams: { unitId, subUnitId, drawingId },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "sheets-drawing-ui.image-popup.flipH",
        index: 2,
        commandId: FlipSheetDrawingCommand.id,
        commandParams: { unitId, flipH: true, drawings: [{ unitId, subUnitId, drawingId }] },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "sheets-drawing-ui.image-popup.flipV",
        index: 2,
        commandId: FlipSheetDrawingCommand.id,
        commandParams: { unitId, flipV: true, drawings: [{ unitId, subUnitId, drawingId }] },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "sheets-drawing-ui.image-popup.reset",
        index: 3,
        commandId: ImageResetSizeOperation.id,
        commandParams: [{ unitId, subUnitId, drawingId }],
        disable: drawingType === 8 /* DRAWING_DOM */
      }
    ];
  }
};
DrawingPopupMenuController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(LocaleService)),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, Inject(SheetCanvasPopManagerService)),
  __decorateParam(4, IRenderManagerService),
  __decorateParam(5, IUniverInstanceService),
  __decorateParam(6, IMessageService),
  __decorateParam(7, IContextService),
  __decorateParam(8, IImageIoService),
  __decorateParam(9, ICommandService)
], DrawingPopupMenuController);

// ../packages/sheets-drawing-ui/src/plugin.ts
var UniverSheetsDrawingUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig4, _injector, _renderManagerService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig4,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_DRAWING_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    registerDependencies(this._injector, [
      [SheetCanvasFloatDomManagerService],
      [SheetDrawingUIController],
      [DrawingPopupMenuController],
      [SheetDrawingPrintingController],
      [SheetDrawingPermissionController],
      [SheetsDrawingCopyPasteController],
      [SheetsDrawingGroupCopyPasteController],
      [SheetCellImageController],
      [SheetCellImageAutofillController],
      [SheetCellImageCopyPasteController],
      [IBatchSaveImagesService, { useClass: BatchSaveImagesService }],
      [DrawingContextMenuController]
    ]);
    touchDependencies(this._injector, [
      [SheetCanvasFloatDomManagerService]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsDrawingCopyPasteController],
      [SheetCellImageCopyPasteController],
      [SheetsDrawingGroupCopyPasteController]
    ]);
  }
  onRendered() {
    this._registerRenderModules();
    touchDependencies(this._injector, [
      [SheetDrawingPermissionController],
      [SheetDrawingPrintingController],
      [SheetDrawingUIController],
      [SheetCellImageController],
      [SheetCellImageAutofillController]
    ]);
  }
  onSteady() {
    this._injector.get(DrawingPopupMenuController);
    this._injector.get(DrawingContextMenuController);
  }
  _registerRenderModules() {
    [
      [SheetDrawingUpdateController],
      [SheetDrawingTransformAffectedController],
      [SheetsDrawingRenderController],
      [SheetCellImageHoverRenderController]
    ].forEach((m) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, m));
    });
  }
};
__publicField(UniverSheetsDrawingUIPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsDrawingUIPlugin, "pluginName", "SHEET_IMAGE_UI_PLUGIN");
__publicField(UniverSheetsDrawingUIPlugin, "packageName", package_default4.name);
__publicField(UniverSheetsDrawingUIPlugin, "version", package_default4.version);
UniverSheetsDrawingUIPlugin = __decorateClass([
  DependentOn(UniverDrawingPlugin, UniverDocsDrawingPlugin, UniverDrawingUIPlugin, UniverSheetsDrawingPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService)
], UniverSheetsDrawingUIPlugin);

export {
  IDocDrawingService,
  UniverDocsDrawingPlugin,
  OpenImageCropOperation,
  ImageResetSizeOperation,
  COMPONENT_IMAGE_POPUP_MENU,
  ImageCropperObject,
  DrawingRenderService,
  UniverDrawingUIPlugin,
  DrawingCommonPanel,
  transformToDrawingPosition,
  transformToAxisAlignPosition,
  SheetDrawingAnchorType,
  ISheetDrawingService,
  InsertSheetDrawingCommand,
  RemoveSheetDrawingCommand,
  SetDrawingArrangeCommand,
  SetSheetDrawingCommand,
  UniverSheetsDrawingPlugin,
  SheetDrawingUpdateController,
  IBatchSaveImagesService,
  SheetCanvasFloatDomManagerService,
  UniverSheetsDrawingUIPlugin
};
