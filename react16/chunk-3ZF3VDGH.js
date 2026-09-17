import {
  WATERMARK_IMAGE_ALLOW_IMAGE_LIST,
  WatermarkImageBaseConfig,
  WatermarkService,
  WatermarkTextBaseConfig
} from "./chunk-FRWZDCQD.js";
import {
  COMPONENT_IMAGE_POPUP_MENU,
  DrawingCommonPanel,
  DrawingRenderService,
  IDocDrawingService,
  ImageCropperObject,
  ImageResetSizeOperation,
  OpenImageCropOperation,
  SheetCanvasFloatDomManagerService,
  UniverDocsDrawingPlugin,
  UniverDrawingUIPlugin
} from "./chunk-FXH7NPJ2.js";
import {
  DEFAULT_WORKBOOK_DATA_DEMO,
  DEFAULT_WORKBOOK_DATA_DEMO_DEFAULT_STYLE
} from "./chunk-VEBN3ADF.js";
import {
  DOC_CONTENT_INSERT_MENU_ID,
  DRAWING_IMAGE_ALLOW_IMAGE_LIST,
  DRAWING_IMAGE_COUNT_LIMIT,
  DRAWING_IMAGE_HEIGHT_LIMIT,
  DRAWING_IMAGE_WIDTH_LIMIT,
  DocCanvasPopManagerService,
  DocContentInsertService,
  DocPrintInterceptorService,
  DocSelectionManagerService,
  DocSelectionRenderService,
  DocSkeletonManagerService,
  EMPTY_PARAGRAPH_MENU_ID,
  IDrawingManagerService,
  IEditorService,
  INSERT_BELLOW_MENU_ID,
  NodePositionConvertToCursor,
  RichTextEditingMutation,
  SetDocZoomRatioOperation,
  TEXT_RANGE_LAYER_INDEX,
  UniverDrawingPlugin,
  docDrawingPositionToTransform,
  getAnchorBounding,
  getCustomBlockIdsInSelections,
  getDocObject,
  getDrawingImageAllowSize,
  getDrawingShapeKeyByDrawingSearch,
  getImageSize,
  getOneTextSelectionRange,
  getRichTextEditPath
} from "./chunk-7ZOWWEOA.js";
import {
  BoldIcon,
  Button,
  CanvasFloatDomService,
  Checkbox,
  ColorPicker,
  ComponentManager,
  Dropdown,
  DropdownMenu,
  FontColorDoubleIcon,
  IClipboardInterfaceService,
  IDialogService,
  ILocalFileService,
  IMenuManagerService,
  IMessageService,
  INotificationService,
  IShortcutService,
  ISidebarService,
  IUIPartsService,
  Input,
  InputNumber,
  ItalicIcon,
  PrintFloatDomSingle,
  Radio,
  RadioGroup,
  Select,
  UniverUIPlugin,
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
  SheetsSelectionsService,
  WorkbookEditablePermission,
  WorkbookManageCollaboratorPermission,
  WorksheetEditPermission,
  getSheetCommandTarget
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService,
  Liquid,
  Rect,
  UNIVER_WATERMARK_STORAGE_KEY,
  Vector2,
  getColor,
  getCurrentTypeOfRenderer,
  getDocsTableRenderViewport,
  getTableIdAndSliceIndex,
  ptToPixel
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  BuildTextUtils,
  COLORS,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  DOC_DRAWING_PRINTING_COMPONENT_KEY,
  DependentOn,
  Disposable,
  DisposableCollection,
  FOCUSING_COMMON_DRAWINGS,
  FOCUSING_DOC,
  FOCUSING_UNIVER_EDITOR,
  ICommandService,
  IConfigService,
  IConfirmService,
  IContextService,
  IImageIoService,
  ILocalStorageService,
  ILogService,
  IPermissionService,
  IResourceLoaderService,
  IUniverInstanceService,
  Inject,
  Injector,
  JSONX,
  LifecycleService,
  LocaleService,
  MemoryCursor,
  ObjectMatrix,
  Observable,
  Plugin,
  Range,
  RedoCommand,
  RxDisposable,
  TextX,
  ThemeService,
  Tools,
  UndoCommand,
  UserManagerService,
  awaitTime,
  createDefaultUser,
  debounceTime,
  default_default,
  distinctUntilChanged,
  filter,
  fromEventSubject,
  generateRandomId,
  green_default,
  isInternalEditorID,
  map,
  merge_default,
  of,
  registerDependencies,
  switchMap,
  take,
  takeUntil,
  throttle,
  toDisposable,
  touchDependencies
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/docs-drawing-ui/package.json
var package_default = {
  name: "@univerjs/docs-drawing-ui",
  version: "0.25.2",
  private: false,
  description: "Drawing UI integration for Univer Docs.",
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
    "@univerjs/docs": "workspace:*",
    "@univerjs/docs-drawing": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/drawing-ui": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
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

// ../packages/docs-drawing-ui/src/config/config.ts
var DOCS_DRAWING_UI_PLUGIN_CONFIG_KEY = "docs-drawing-ui.config";
var configSymbol = Symbol(DOCS_DRAWING_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/docs-drawing-ui/src/controllers/doc-drawing-notification.controller.ts
function getAddOrRemoveDrawings(actions) {
  var _a, _b, _c, _d;
  if (JSONX.isNoop(actions) || !Array.isArray(actions)) {
    return null;
  }
  const drawingsOp = actions.find((action) => Array.isArray(action) && (action == null ? void 0 : action[0]) === "drawings");
  if (drawingsOp == null || !Array.isArray(drawingsOp) || drawingsOp.length < 3) {
    return null;
  }
  if (typeof drawingsOp[1] === "string" && typeof drawingsOp[2] !== "object") {
    return null;
  }
  if (Array.isArray(drawingsOp[1]) && typeof drawingsOp[1][1] !== "object") {
    return null;
  }
  const drawings = [];
  if (Array.isArray(drawingsOp == null ? void 0 : drawingsOp[1])) {
    for (const op of drawingsOp) {
      if (Array.isArray(op)) {
        drawings.push({
          type: ((_a = op == null ? void 0 : op[1]) == null ? void 0 : _a.i) ? "add" : "remove",
          drawingId: op == null ? void 0 : op[0],
          drawing: (_b = op == null ? void 0 : op[1]) == null ? void 0 : _b.i
        });
      }
    }
  } else {
    drawings.push({
      type: ((_c = drawingsOp[2]) == null ? void 0 : _c.i) ? "add" : "remove",
      drawingId: drawingsOp[1],
      drawing: (_d = drawingsOp[2]) == null ? void 0 : _d.i
    });
  }
  return drawings;
}
function getReOrderedDrawings(actions) {
  if (!Array.isArray(actions) || actions.length < 3 || actions[0] !== "drawingsOrder") {
    return [];
  }
  const drawingIndexes = [];
  for (let i = 1; i < actions.length; i++) {
    const action = actions[i];
    if (Array.isArray(action) && typeof action[0] === "number" && typeof action[1] === "object") {
      drawingIndexes.push(action[0]);
    } else {
      drawingIndexes.length = 0;
      break;
    }
  }
  return drawingIndexes;
}
var DocDrawingAddRemoveController = class extends Disposable {
  constructor(_univerInstanceService, _commandService, _drawingManagerService, _docDrawingService, _renderManagerService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_docDrawingService", _docDrawingService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    this._initialize();
  }
  _initialize() {
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        if (command.id !== RichTextEditingMutation.id) {
          return;
        }
        const params = command.params;
        const { unitId, actions, isSync, syncer } = params;
        const addOrRemoveDrawings = getAddOrRemoveDrawings(actions);
        if (addOrRemoveDrawings != null) {
          for (const { type, drawingId, drawing } of addOrRemoveDrawings) {
            if (isSync && (drawing == null ? void 0 : drawing.unitId) === syncer) {
              continue;
            }
            if (type === "add") {
              this._addDrawings(unitId, [drawing]);
            } else {
              this._removeDrawings(unitId, [drawingId]);
            }
          }
        }
      })
    );
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id !== RichTextEditingMutation.id) {
          return;
        }
        const params = command.params;
        const { unitId, actions } = params;
        const reOrderedDrawings = getReOrderedDrawings(actions);
        if (reOrderedDrawings.length > 0) {
          this._updateDrawingsOrder(unitId);
        }
      })
    );
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        var _a;
        if (command.id !== UndoCommand.id && command.id !== RedoCommand.id) {
          return;
        }
        const unitId = (_a = this._univerInstanceService.getCurrentUniverDocInstance()) == null ? void 0 : _a.getUnitId();
        const focusedDrawings = this._drawingManagerService.getFocusDrawings();
        if (unitId == null || focusedDrawings.length === 0) {
          return;
        }
        const renderObject = this._renderManagerService.getRenderById(unitId);
        const scene = renderObject == null ? void 0 : renderObject.scene;
        if (scene == null) {
          return false;
        }
        const transformer = scene.getTransformerByCreate();
        transformer.refreshControls();
      })
    );
  }
  _addDrawings(unitId, drawings) {
    const drawingManagerService = this._drawingManagerService;
    const docDrawingService = this._docDrawingService;
    const jsonOp = this._docDrawingService.getBatchAddOp(drawings);
    const { subUnitId, redo: op, objects } = jsonOp;
    drawingManagerService.applyJson1(unitId, subUnitId, op);
    docDrawingService.applyJson1(unitId, subUnitId, op);
    drawingManagerService.addNotification(objects);
    docDrawingService.addNotification(objects);
  }
  _removeDrawings(unitId, drawingIds) {
    const drawingManagerService = this._drawingManagerService;
    const docDrawingService = this._docDrawingService;
    const jsonOp = this._docDrawingService.getBatchRemoveOp(drawingIds.map((drawingId) => {
      return {
        unitId,
        subUnitId: unitId,
        drawingId
      };
    }));
    const { subUnitId, redo: op, objects } = jsonOp;
    drawingManagerService.applyJson1(unitId, subUnitId, op);
    docDrawingService.applyJson1(unitId, subUnitId, op);
    drawingManagerService.removeNotification(objects);
    docDrawingService.removeNotification(objects);
  }
  _updateDrawingsOrder(unitId) {
    const documentDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
    if (documentDataModel == null) {
      return;
    }
    const drawingsOrder = documentDataModel.getSnapshot().drawingsOrder;
    if (drawingsOrder == null) {
      return;
    }
    const drawingManagerService = this._drawingManagerService;
    const docDrawingService = this._docDrawingService;
    drawingManagerService.setDrawingOrder(unitId, unitId, drawingsOrder);
    docDrawingService.setDrawingOrder(unitId, unitId, drawingsOrder);
    const objects = {
      unitId,
      subUnitId: unitId,
      drawingIds: drawingsOrder
    };
    drawingManagerService.orderNotification(objects);
    docDrawingService.orderNotification(objects);
  }
};
DocDrawingAddRemoveController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, IDocDrawingService),
  __decorateParam(4, IRenderManagerService)
], DocDrawingAddRemoveController);

// ../packages/docs-drawing-ui/src/views/printing-float-dom/index.tsx
var import_react = __toESM(require_react());

// ../packages/docs-drawing-ui/src/commands/commands/insert-doc-drawing.command.ts
var InsertDocDrawingCommand = {
  id: "doc.command.insert-doc-image",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function
  handler: (accessor, params) => {
    var _a, _b, _c, _d, _e, _f;
    if (params == null) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const activeTextRange = docSelectionManagerService.getActiveTextRange();
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const unitId = documentDataModel.getUnitId();
    const contentInsertRange = getContentInsertRange(accessor, unitId);
    const targetTextRange = contentInsertRange ? {
      ...activeTextRange,
      startOffset: contentInsertRange.startOffset,
      endOffset: contentInsertRange.endOffset,
      collapsed: contentInsertRange.startOffset === contentInsertRange.endOffset,
      segmentId: (_b = (_a = contentInsertRange.segmentId) != null ? _a : activeTextRange == null ? void 0 : activeTextRange.segmentId) != null ? _b : ""
    } : activeTextRange;
    if (targetTextRange == null) {
      return false;
    }
    const { drawings } = params;
    const { collapsed, startOffset, segmentId = "" } = targetTextRange;
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();
    if (body == null) {
      return false;
    }
    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions = [];
    const drawingOrderLength = (_d = (_c = documentDataModel.getSnapshot().drawingsOrder) == null ? void 0 : _c.length) != null ? _d : 0;
    let removeDrawingLen = 0;
    if (collapsed) {
      if (startOffset > 0) {
        textX.push({
          t: "r" /* RETAIN */,
          len: startOffset
        });
      }
    } else {
      const dos = BuildTextUtils.selection.delete([targetTextRange], body, 0, null, false);
      textX.push(...dos);
      const removedCustomBlockIds = getCustomBlockIdsInSelections(body, [targetTextRange]);
      const drawings2 = (_e = documentDataModel.getDrawings()) != null ? _e : {};
      const drawingOrder = (_f = documentDataModel.getDrawingsOrder()) != null ? _f : [];
      const sortedRemovedCustomBlockIds = removedCustomBlockIds.sort((a, b) => {
        if (drawingOrder.indexOf(a) > drawingOrder.indexOf(b)) {
          return -1;
        } else if (drawingOrder.indexOf(a) < drawingOrder.indexOf(b)) {
          return 1;
        }
        return 0;
      });
      if (sortedRemovedCustomBlockIds.length > 0) {
        for (const blockId of sortedRemovedCustomBlockIds) {
          const drawing = drawings2[blockId];
          const drawingIndex = drawingOrder.indexOf(blockId);
          if (drawing == null || drawingIndex < 0) {
            continue;
          }
          const removeDrawingAction = jsonX.removeOp(["drawings", blockId], drawing);
          const removeDrawingOrderAction = jsonX.removeOp(["drawingsOrder", drawingIndex], blockId);
          rawActions.push(removeDrawingAction);
          rawActions.push(removeDrawingOrderAction);
          removeDrawingLen++;
        }
      }
    }
    textX.push({
      t: "i" /* INSERT */,
      body: {
        dataStream: "\b".repeat(drawings.length),
        customBlocks: drawings.map((drawing, i) => ({
          startIndex: i,
          blockId: drawing.drawingId
        }))
      },
      len: drawings.length
    });
    const path = getRichTextEditPath(documentDataModel, segmentId);
    const placeHolderAction = jsonX.editOp(textX.serialize(), path);
    rawActions.push(placeHolderAction);
    for (const drawing of drawings) {
      const { drawingId } = drawing;
      const addDrawingAction = jsonX.insertOp(["drawings", drawingId], drawing);
      const addDrawingOrderAction = jsonX.insertOp(["drawingsOrder", drawingOrderLength - removeDrawingLen], drawingId);
      rawActions.push(addDrawingAction);
      rawActions.push(addDrawingOrderAction);
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: []
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    return Boolean(result);
  }
};
function getContentInsertRange(accessor, unitId) {
  try {
    const range = accessor.get(DocContentInsertService).consumeInsertRange(unitId);
    if (range == null) {
      return null;
    }
    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      collapsed: range.startOffset === range.endOffset,
      segmentId: range.segmentId
    };
  } catch {
    return null;
  }
}

// ../packages/docs-drawing-ui/src/controllers/doc-float-dom.controller.ts
function calcDocFloatDomPositionByRect(rect, scene, opacity = 1, angle = 0) {
  const { top, left, bottom, right } = rect;
  const width = right - left;
  const height = bottom - top;
  const viewMain = scene.getViewport("viewMain" /* VIEW_MAIN */);
  const { viewportScrollX, viewportScrollY } = viewMain;
  const { scaleX, scaleY } = scene.getAncestorScale();
  return {
    startX: (left - viewportScrollX) * scaleX,
    startY: (top - viewportScrollY) * scaleY,
    endX: (left + width - viewportScrollX) * scaleX,
    endY: (top + height - viewportScrollY) * scaleY,
    width: width * scaleX,
    height: height * scaleY,
    rotate: angle,
    absolute: {
      left: false,
      top: false
    },
    opacity: opacity != null ? opacity : 1
  };
}
function calcDocFloatDomPosition(object, renderUnit) {
  const { top, left, width, height, angle, opacity } = object;
  return calcDocFloatDomPositionByRect({ top, left, bottom: top + height, right: left + width }, renderUnit.scene, opacity, angle);
}
var DocFloatDomController = class extends Disposable {
  constructor(_renderManagerService, _drawingManagerService, _drawingRenderService, _canvasFloatDomService, _univerInstanceService, _commandService) {
    super();
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_drawingRenderService", _drawingRenderService);
    __publicField(this, "_canvasFloatDomService", _canvasFloatDomService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_domLayerInfoMap", /* @__PURE__ */ new Map());
    this._initialize();
  }
  dispose() {
    super.dispose();
  }
  _initialize() {
    this._drawingAddRemoveListener();
    this._initScrollAndZoomEvent();
  }
  _getSceneAndTransformerByDrawingSearch(unitId) {
    if (unitId == null) {
      return;
    }
    const renderObject = this._renderManagerService.getRenderById(unitId);
    if (renderObject == null) {
      return null;
    }
    const scene = renderObject.scene;
    const transformer = scene.getTransformerByCreate();
    return { scene, transformer, renderUnit: renderObject, canvas: renderObject.engine.getCanvasElement() };
  }
  _drawingAddRemoveListener() {
    this.disposeWithMe(
      this._drawingManagerService.add$.subscribe((params) => {
        this._insertRects(params);
      })
    );
    this.disposeWithMe(
      this._drawingManagerService.remove$.subscribe((params) => {
        params.forEach((param) => {
          this._removeDom(param.drawingId);
        });
      })
    );
  }
  _insertRects(params) {
    params.forEach(async (param) => {
      const { unitId } = param;
      const documentDataModel = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
      if (!documentDataModel) {
        return;
      }
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      if (renderObject == null) {
        return;
      }
      const rectParam = this._drawingManagerService.getDrawingByParam(param);
      if (rectParam == null) {
        return;
      }
      const rects = await this._drawingRenderService.renderFloatDom(rectParam, renderObject.scene);
      if (rects == null || rects.length === 0) {
        return;
      }
      for (const rect of rects) {
        this._addHoverForRect(rect);
        const disposableCollection = new DisposableCollection();
        const initPosition = calcDocFloatDomPosition(rect, renderObject.renderUnit);
        const position$ = new BehaviorSubject(initPosition);
        const canvas = renderObject.canvas;
        const data = rectParam.data;
        const info = {
          dispose: disposableCollection,
          rect,
          position$,
          unitId
        };
        this._canvasFloatDomService.addFloatDom({
          position$,
          id: rectParam.drawingId,
          componentKey: rectParam.componentKey,
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
          const newPosition = calcDocFloatDomPosition(rect, renderObject.renderUnit);
          position$.next(
            newPosition
          );
        });
        disposableCollection.add(() => {
          this._canvasFloatDomService.removeFloatDom(rectParam.drawingId);
        });
        listener && disposableCollection.add(listener);
        this._domLayerInfoMap.set(rectParam.drawingId, info);
      }
    });
  }
  _addHoverForRect(o) {
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
  _removeDom(id) {
    const info = this._domLayerInfoMap.get(id);
    if (!info) {
      return;
    }
    const { unitId } = info;
    this._domLayerInfoMap.delete(id);
    info.dispose.dispose();
    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
    if (renderObject) {
      renderObject.scene.removeObject(info.rect);
    }
  }
  _initScrollAndZoomEvent() {
    const updateDoc = (unitId) => {
      const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);
      if (!renderObject) {
        return;
      }
      this._domLayerInfoMap.forEach((floatDomInfo) => {
        if (floatDomInfo.unitId !== unitId) return;
        const position = calcDocFloatDomPosition(floatDomInfo.rect, renderObject.renderUnit);
        floatDomInfo.position$.next(position);
      });
    };
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */).pipe(
        map((documentDataModel) => {
          if (!documentDataModel) return null;
          const unitId = documentDataModel.getUnitId();
          const render2 = this._renderManagerService.getRenderById(unitId);
          return render2 ? { render: render2, unitId } : null;
        }),
        switchMap(
          (render2) => render2 ? fromEventSubject(render2.render.scene.getViewport("viewMain" /* VIEW_MAIN */).onScrollAfter$).pipe(map(() => ({ unitId: render2.unitId }))) : of(null)
        )
      ).subscribe((value) => {
        if (!value) return;
        const { unitId } = value;
        updateDoc(unitId);
      })
    );
    this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === SetDocZoomRatioOperation.id) {
        const params = commandInfo.params;
        const { unitId } = params;
        updateDoc(unitId);
      }
    }));
  }
  insertFloatDom(floatDom, opts) {
    var _a, _b, _c;
    const currentDoc = this._univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
    if (!currentDoc) return false;
    const render2 = this._getSceneAndTransformerByDrawingSearch(currentDoc.getUnitId());
    if (!render2) return false;
    const docSkeletonManagerService = render2.renderUnit.with(DocSkeletonManagerService);
    const skeleton = docSkeletonManagerService.getSkeleton();
    const page = (_a = skeleton.getSkeletonData()) == null ? void 0 : _a.pages[0];
    if (!page) return false;
    const { pageWidth, marginLeft, marginRight } = page;
    const width = pageWidth - marginLeft - marginRight;
    const docTransform = {
      size: {
        width: (_b = opts.width) != null ? _b : width,
        height: opts.height
      },
      positionH: {
        relativeFrom: 0 /* PAGE */,
        posOffset: 0
      },
      positionV: {
        relativeFrom: 0 /* PAGE */,
        posOffset: 0
      },
      angle: 0
    };
    const drawingId = (_c = opts.drawingId) != null ? _c : generateRandomId();
    const params = {
      unitId: currentDoc.getUnitId(),
      drawings: [
        {
          drawingId,
          drawingType: 8 /* DRAWING_DOM */,
          subUnitId: currentDoc.getUnitId(),
          unitId: currentDoc.getUnitId(),
          ...floatDom,
          title: "",
          description: "",
          docTransform,
          layoutType: 0 /* INLINE */,
          transform: docDrawingPositionToTransform(docTransform)
        }
      ]
    };
    this._commandService.syncExecuteCommand(InsertDocDrawingCommand.id, params);
    return drawingId;
  }
};
DocFloatDomController = __decorateClass([
  __decorateParam(0, IRenderManagerService),
  __decorateParam(1, IDrawingManagerService),
  __decorateParam(2, Inject(DrawingRenderService)),
  __decorateParam(3, Inject(CanvasFloatDomService)),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, ICommandService)
], DocFloatDomController);

// ../packages/docs-drawing-ui/src/views/printing-float-dom/index.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var DocPrintingFloatDom = (props) => {
  const { floatDomInfos, scene, offset, bound } = props;
  const width = bound.right - bound.left;
  const height = bound.bottom - bound.top;
  const floatDomParams = (0, import_react.useMemo)(() => floatDomInfos.map((info) => {
    const { width: width2 = 0, height: height2 = 0, left = 0, top = 0 } = info.transform;
    const offsetBound = calcDocFloatDomPositionByRect(
      {
        left,
        right: left + width2,
        top,
        bottom: top + height2
      },
      scene
    );
    const domPos = offsetBound;
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
  }).filter(([_, floatDom]) => !(floatDom.position.endX < 0 || floatDom.position.endY < 0 || floatDom.position.startX > width || floatDom.position.startY > height)), [floatDomInfos, scene, offset, width, height]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-absolute univer-left-0 univer-top-0", children: floatDomParams.map(([id, floatDom]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintFloatDomSingle, { layer: floatDom, id, position: floatDom.position }, id)) });
};

// ../packages/docs-drawing-ui/src/controllers/doc-drawing-printing.controller.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var DocDrawingPrintingController = class extends Disposable {
  constructor(_docPrintInterceptorService, _drawingRenderService, _drawingManagerService, _componetManager, _injector) {
    super();
    __publicField(this, "_docPrintInterceptorService", _docPrintInterceptorService);
    __publicField(this, "_drawingRenderService", _drawingRenderService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_componetManager", _componetManager);
    __publicField(this, "_injector", _injector);
    this._initPrinting();
    this._initPrintingDom();
  }
  _initPrinting() {
    this.disposeWithMe(
      this._docPrintInterceptorService.interceptor.intercept(
        this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
        {
          handler: (_param, pos, next) => {
            const { unitId, scene } = pos;
            const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
            const subUnitData = unitData == null ? void 0 : unitData[unitId];
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
  }
  _initPrintingDom() {
    this.disposeWithMe(
      this._docPrintInterceptorService.interceptor.intercept(
        this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT,
        {
          handler: (disposableCollection, pos, next) => {
            const { unitId } = pos;
            const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
            const subUnitData = unitData == null ? void 0 : unitData[unitId];
            if (subUnitData) {
              const floatDomInfos = subUnitData.order.map((id) => {
                const drawing = subUnitData.data[id];
                if (drawing.drawingType === 2 /* DRAWING_CHART */) {
                  return {
                    ...drawing,
                    componentKey: this._componetManager.get(DOC_DRAWING_PRINTING_COMPONENT_KEY)
                  };
                }
                if (drawing.drawingType === 8 /* DRAWING_DOM */) {
                  const printingComponentKey = this._docPrintInterceptorService.getPrintComponent(drawing.componentKey);
                  return {
                    ...drawing,
                    componentKey: this._componetManager.get(printingComponentKey || drawing.componentKey)
                  };
                }
                return null;
              }).filter(Boolean);
              const PrintingFloatDomInjector = connectInjector(DocPrintingFloatDom, this._injector);
              render(
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  PrintingFloatDomInjector,
                  {
                    unitId,
                    floatDomInfos,
                    scene: pos.scene,
                    skeleton: pos.skeleton,
                    offset: pos.offset,
                    bound: pos.bound
                  }
                ),
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
DocDrawingPrintingController = __decorateClass([
  __decorateParam(0, Inject(DocPrintInterceptorService)),
  __decorateParam(1, Inject(DrawingRenderService)),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, Inject(ComponentManager)),
  __decorateParam(4, Inject(Injector))
], DocDrawingPrintingController);

// ../packages/docs-drawing-ui/src/services/doc-refresh-drawings.service.ts
var DocRefreshDrawingsService = class {
  constructor() {
    __publicField(this, "_refreshDrawings$", new BehaviorSubject(null));
    __publicField(this, "refreshDrawings$", this._refreshDrawings$.asObservable());
  }
  refreshDrawings(skeleton) {
    this._refreshDrawings$.next(skeleton);
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/update-doc-drawing.command.ts
var WRAPPING_STYLE_TO_LAYOUT_TYPE = {
  ["inline" /* INLINE */]: 0 /* INLINE */,
  ["wrapSquare" /* WRAP_SQUARE */]: 3 /* WRAP_SQUARE */,
  ["wrapTopAndBottom" /* WRAP_TOP_AND_BOTTOM */]: 6 /* WRAP_TOP_AND_BOTTOM */,
  ["inFrontOfText" /* IN_FRONT_OF_TEXT */]: 1 /* WRAP_NONE */,
  ["behindText" /* BEHIND_TEXT */]: 1 /* WRAP_NONE */
};
function findDrawingAnchorInPage(page, drawingId, pageMarginTop, pageMarginLeft) {
  const skeDrawing = page.skeDrawings.get(drawingId);
  if (skeDrawing) {
    return {
      skeDrawing,
      pageMarginTop,
      pageMarginLeft
    };
  }
  for (const table of page.skeTables.values()) {
    for (const row of table.rows) {
      for (const cell of row.cells) {
        const cellAnchor = findDrawingAnchorInPage(cell, drawingId, cell.marginTop, cell.marginLeft);
        if (cellAnchor) {
          return cellAnchor;
        }
      }
    }
  }
  return null;
}
function getDeleteAndInsertCustomBlockActions(segmentId, oldSegmentId, segmentPage, offset, drawingId, documentDataModel, docSelectionRenderManager) {
  var _a, _b;
  const textX = new TextX();
  const jsonX = JSONX.getInstance();
  const rawActions = [];
  const oldBody = documentDataModel.getSelfOrHeaderFooterModel(oldSegmentId).getBody();
  const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();
  if (oldBody == null || body == null) {
    return;
  }
  const oldOffset = (_b = (_a = oldBody.customBlocks) == null ? void 0 : _a.find((block) => block.blockId === drawingId)) == null ? void 0 : _b.startIndex;
  if (oldOffset == null) {
    return;
  }
  offset = Math.min(body.dataStream.length - 2, offset);
  if (segmentId === oldSegmentId) {
    if (offset < oldOffset) {
      if (offset > 0) {
        textX.push({
          t: "r" /* RETAIN */,
          len: offset
        });
      }
      textX.push({
        t: "i" /* INSERT */,
        body: {
          dataStream: "\b",
          customBlocks: [{
            startIndex: 0,
            blockId: drawingId
          }]
        },
        len: 1
      });
      textX.push({
        t: "r" /* RETAIN */,
        len: oldOffset - offset
      });
      textX.push({
        t: "d" /* DELETE */,
        len: 1
      });
    } else {
      if (oldOffset > 0) {
        textX.push({
          t: "r" /* RETAIN */,
          len: oldOffset
        });
      }
      textX.push({
        t: "d" /* DELETE */,
        len: 1
      });
      if (offset - oldOffset - 1 > 0) {
        textX.push({
          t: "r" /* RETAIN */,
          len: offset - oldOffset - 1
        });
      }
      textX.push({
        t: "i" /* INSERT */,
        body: {
          dataStream: "\b",
          customBlocks: [{
            startIndex: 0,
            blockId: drawingId
          }]
        },
        len: 1
      });
    }
    if (offset !== oldOffset) {
      const path = getRichTextEditPath(documentDataModel, oldSegmentId);
      const action = jsonX.editOp(textX.serialize(), path);
      rawActions.push(action);
    }
  } else {
    if (oldOffset > 0) {
      textX.push({
        t: "r" /* RETAIN */,
        len: oldOffset
      });
    }
    textX.push({
      t: "d" /* DELETE */,
      len: 1
    });
    let path = getRichTextEditPath(documentDataModel, oldSegmentId);
    let action = jsonX.editOp(textX.serialize(), path);
    rawActions.push(action);
    textX.empty();
    if (offset > 0) {
      textX.push({
        t: "r" /* RETAIN */,
        len: offset
      });
    }
    textX.push({
      t: "i" /* INSERT */,
      body: {
        dataStream: "\b",
        customBlocks: [{
          startIndex: 0,
          blockId: drawingId
        }]
      },
      len: 1
    });
    path = getRichTextEditPath(documentDataModel, segmentId);
    action = jsonX.editOp(textX.serialize(), path);
    rawActions.push(action);
    docSelectionRenderManager.setSegment(segmentId);
    docSelectionRenderManager.setSegmentPage(segmentPage);
  }
  return rawActions;
}
var UpdateDocDrawingWrappingStyleCommand = {
  id: "doc.command.update-doc-drawing-wrapping-style",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function, complexity
  handler: (accessor, params) => {
    var _a, _b;
    if (params == null) {
      return false;
    }
    const { drawings, wrappingStyle, unitId } = params;
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const renderObject = renderManagerService.getRenderById(unitId);
    const skeletonData = renderObject == null ? void 0 : renderObject.with(DocSkeletonManagerService).getSkeleton().getSkeletonData();
    const viewModel = renderObject == null ? void 0 : renderObject.with(DocSkeletonManagerService).getViewModel();
    const scene = renderObject == null ? void 0 : renderObject.scene;
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null || skeletonData == null || scene == null || viewModel == null) {
      return false;
    }
    const editArea = viewModel.getEditArea();
    const transformer = scene.getTransformerByCreate();
    const { pages, skeHeaders, skeFooters } = skeletonData;
    const jsonX = JSONX.getInstance();
    const rawActions = [];
    const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
    for (const drawing of drawings) {
      const { drawingId } = drawing;
      const oldLayoutType = oldDrawings[drawingId].layoutType;
      const newLayoutType = WRAPPING_STYLE_TO_LAYOUT_TYPE[wrappingStyle];
      if (oldLayoutType !== newLayoutType) {
        const updateLayoutTypeAction = jsonX.replaceOp(["drawings", drawingId, "layoutType"], oldLayoutType, newLayoutType);
        rawActions.push(updateLayoutTypeAction);
      }
      if (wrappingStyle === "behindText" /* BEHIND_TEXT */ || wrappingStyle === "inFrontOfText" /* IN_FRONT_OF_TEXT */) {
        const oldBehindDoc = oldDrawings[drawingId].behindDoc;
        const newBehindDoc = wrappingStyle === "behindText" /* BEHIND_TEXT */ ? 1 /* TRUE */ : 0 /* FALSE */;
        if (oldBehindDoc !== newBehindDoc) {
          const updateBehindDocAction = jsonX.replaceOp(["drawings", drawingId, "behindDoc"], oldBehindDoc, newBehindDoc);
          rawActions.push(updateBehindDocAction);
        }
      }
      if (wrappingStyle === "inline" /* INLINE */) {
        continue;
      }
      let drawingAnchor = null;
      for (const page of pages) {
        const { headerId, footerId, marginTop, marginLeft, marginBottom, pageWidth, pageHeight } = page;
        switch (editArea) {
          case "HEADER" /* HEADER */: {
            const headerSke = (_a = skeHeaders.get(headerId)) == null ? void 0 : _a.get(pageWidth);
            if (headerSke != null) {
              drawingAnchor = findDrawingAnchorInPage(headerSke, drawingId, headerSke.marginTop, marginLeft);
            }
            break;
          }
          case "FOOTER" /* FOOTER */: {
            const footerSke = (_b = skeFooters.get(footerId)) == null ? void 0 : _b.get(pageWidth);
            if (footerSke != null) {
              drawingAnchor = findDrawingAnchorInPage(footerSke, drawingId, pageHeight - marginBottom + footerSke.marginTop, marginLeft);
            }
            break;
          }
          case "BODY" /* BODY */: {
            drawingAnchor = findDrawingAnchorInPage(page, drawingId, marginTop, marginLeft);
            break;
          }
        }
        if (drawingAnchor != null) {
          break;
        }
      }
      if (drawingAnchor != null) {
        const { skeDrawing, pageMarginTop, pageMarginLeft } = drawingAnchor;
        const { aTop, aLeft } = skeDrawing;
        const oldPositionH = oldDrawings[drawingId].docTransform.positionH;
        let posOffsetH = aLeft;
        if (oldPositionH.relativeFrom === 3 /* MARGIN */) {
          posOffsetH -= pageMarginLeft;
        } else if (oldPositionH.relativeFrom === 1 /* COLUMN */) {
          posOffsetH -= skeDrawing.columnLeft;
        }
        const newPositionH = {
          relativeFrom: oldPositionH.relativeFrom,
          posOffset: posOffsetH
        };
        if (oldPositionH.posOffset !== newPositionH.posOffset) {
          const action = jsonX.replaceOp(["drawings", drawingId, "docTransform", "positionH"], oldPositionH, newPositionH);
          rawActions.push(action);
        }
        const oldPositionV = oldDrawings[drawingId].docTransform.positionV;
        let posOffsetV = aTop;
        if (oldPositionV.relativeFrom === 0 /* PAGE */) {
          posOffsetV += pageMarginTop;
        } else if (oldPositionV.relativeFrom === 2 /* LINE */) {
          posOffsetV -= skeDrawing.lineTop;
        } else if (oldPositionV.relativeFrom === 1 /* PARAGRAPH */) {
          posOffsetV -= skeDrawing.blockAnchorTop;
        }
        const newPositionV = {
          relativeFrom: oldPositionV.relativeFrom,
          posOffset: posOffsetV
        };
        if (oldPositionV.posOffset !== newPositionV.posOffset) {
          const action = jsonX.replaceOp(["drawings", drawingId, "docTransform", "positionV"], oldPositionV, newPositionV);
          rawActions.push(action);
        }
      }
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    transformer.refreshControls();
    return Boolean(result);
  }
};
var UpdateDocDrawingDistanceCommand = {
  id: "doc.command.update-doc-drawing-distance",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (params == null) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const { drawings, dist, unitId } = params;
    const jsonX = JSONX.getInstance();
    const rawActions = [];
    const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
    for (const drawing of drawings) {
      const { drawingId } = drawing;
      for (const [key, value] of Object.entries(dist)) {
        const oldValue = oldDrawings[drawingId][key];
        if (oldValue !== value) {
          const action = jsonX.replaceOp(["drawings", drawingId, key], oldValue, value);
          rawActions.push(action);
        }
      }
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    return Boolean(result);
  }
};
var UpdateDocDrawingWrapTextCommand = {
  id: "doc.command.update-doc-drawing-wrap-text",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (params == null) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const { drawings, wrapText, unitId } = params;
    const jsonX = JSONX.getInstance();
    const rawActions = [];
    const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
    for (const drawing of drawings) {
      const { drawingId } = drawing;
      const oldWrapText = oldDrawings[drawingId].wrapText;
      if (oldWrapText !== wrapText) {
        const action = jsonX.replaceOp(["drawings", drawingId, "wrapText"], oldWrapText, wrapText);
        rawActions.push(action);
      }
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    return Boolean(result);
  }
};
var UpdateDrawingDocTransformCommand = {
  id: "doc.command.update-drawing-doc-transform",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    if (params == null) {
      return false;
    }
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const renderObject = renderManagerService.getRenderById(params.unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return false;
    }
    const transformer = scene.getTransformerByCreate();
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const { drawings, unitId } = params;
    const jsonX = JSONX.getInstance();
    const rawActions = [];
    const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
    for (const drawing of drawings) {
      const { drawingId, key, value } = drawing;
      const oldValue = oldDrawings[drawingId].docTransform[key];
      if (!Tools.diffValue(oldValue, value)) {
        const action = jsonX.replaceOp(["drawings", drawingId, "docTransform", key], oldValue, value);
        rawActions.push(action);
      }
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null,
        debounce: true
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    transformer.refreshControls();
    return Boolean(result);
  }
};
var IMoveInlineDrawingCommand = {
  id: "doc.command.move-inline-drawing",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    var _a, _b;
    if (params == null) {
      return false;
    }
    const renderManagerService = accessor.get(IRenderManagerService);
    const docSelectionRenderService = (_a = renderManagerService.getRenderById(params.unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
    const docRefreshDrawingsService = accessor.get(DocRefreshDrawingsService);
    const renderObject = renderManagerService.getRenderById(params.unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    const skeleton = renderObject == null ? void 0 : renderObject.with(DocSkeletonManagerService).getSkeleton();
    if (scene == null || docSelectionRenderService == null) {
      return false;
    }
    const transformer = scene.getTransformerByCreate();
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const { drawing, unitId, offset, segmentId: newSegmentId, segmentPage, needRefreshDrawings } = params;
    if (needRefreshDrawings) {
      docRefreshDrawingsService.refreshDrawings(skeleton);
      transformer.refreshControls();
      return true;
    }
    const rawActions = [];
    const { drawingId } = drawing;
    const segmentId = (_b = docSelectionRenderService.getSegment()) != null ? _b : "";
    const actions = getDeleteAndInsertCustomBlockActions(
      newSegmentId,
      segmentId,
      segmentPage,
      offset,
      drawingId,
      documentDataModel,
      docSelectionRenderService
    );
    if (actions == null || actions.length === 0) {
      docRefreshDrawingsService.refreshDrawings(skeleton);
      transformer.refreshControls();
      return false;
    }
    rawActions.push(...actions);
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    transformer.refreshControls();
    return Boolean(result);
  }
};
var ITransformNonInlineDrawingCommand = {
  id: "doc.command.transform-non-inline-drawing",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function
  handler: (accessor, params) => {
    var _a, _b;
    if (params == null) {
      return false;
    }
    const renderManagerService = accessor.get(IRenderManagerService);
    const docSelectionRenderService = (_a = renderManagerService.getRenderById(params.unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
    const renderObject = renderManagerService.getRenderById(params.unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null || docSelectionRenderService == null) {
      return false;
    }
    const transformer = scene.getTransformerByCreate();
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (documentDataModel == null) {
      return false;
    }
    const { drawing, unitId, offset, docTransform, segmentId: newSegmentId, segmentPage } = params;
    const rawActions = [];
    const { drawingId } = drawing;
    const segmentId = (_b = docSelectionRenderService.getSegment()) != null ? _b : "";
    const actions = getDeleteAndInsertCustomBlockActions(
      newSegmentId,
      segmentId,
      segmentPage,
      offset,
      drawingId,
      documentDataModel,
      docSelectionRenderService
    );
    if (actions == null) {
      return false;
    }
    if (actions.length > 0) {
      rawActions.push(...actions);
    }
    const jsonX = JSONX.getInstance();
    const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
    const oldDocTransform = oldDrawings[drawingId].docTransform;
    const { positionH: oldPositionH, positionV: oldPositionV, size: oldSize, angle: oldAngle } = oldDocTransform;
    if (!Tools.diffValue(oldPositionH, docTransform.positionH)) {
      const updateAction = jsonX.replaceOp(["drawings", drawingId, "docTransform", "positionH"], oldPositionH, docTransform.positionH);
      rawActions.push(updateAction);
    }
    if (!Tools.diffValue(oldPositionV, docTransform.positionV)) {
      const updateAction = jsonX.replaceOp(["drawings", drawingId, "docTransform", "positionV"], oldPositionV, docTransform.positionV);
      rawActions.push(updateAction);
    }
    if (!Tools.diffValue(oldSize, docTransform.size)) {
      const updateAction = jsonX.replaceOp(["drawings", drawingId, "docTransform", "size"], oldSize, docTransform.size);
      rawActions.push(updateAction);
    }
    if (!Tools.diffValue(oldAngle, docTransform.angle)) {
      const updateAction = jsonX.replaceOp(["drawings", drawingId, "docTransform", "angle"], oldAngle, docTransform.angle);
      rawActions.push(updateAction);
    }
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null,
        debounce: true
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    transformer.refreshControls();
    return Boolean(result);
  }
};

// ../packages/docs-drawing-ui/src/controllers/render-controllers/doc-drawing-transform-update.controller.ts
function getDocsTableCellDrawingOffset(unitId, table, row, cell) {
  const sourceTableId = getTableIdAndSliceIndex(table.tableId).tableId;
  const viewport = getDocsTableRenderViewport(unitId, sourceTableId);
  const hasHorizontalViewport = viewport && viewport.contentWidth > viewport.viewportWidth;
  const scrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;
  return {
    left: table.left + cell.left - scrollLeft + cell.marginLeft,
    top: table.top + row.top + cell.marginTop
  };
}
var DocDrawingTransformUpdateController = class extends Disposable {
  constructor(_context, _docSkeletonManagerService, _commandService, _editorService, _drawingManagerService, _docRefreshDrawingsService, _univerInstanceService, _lifecycleService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_docSkeletonManagerService", _docSkeletonManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_editorService", _editorService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_docRefreshDrawingsService", _docRefreshDrawingsService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_lifecycleService", _lifecycleService);
    __publicField(this, "_liquid", new Liquid());
    this._initialize();
    this._commandExecutedListener();
  }
  _initialize() {
    this._initialRenderRefresh();
    this._drawingInitializeListener();
    this._initResize();
  }
  _initialRenderRefresh() {
    this.disposeWithMe(
      this._docSkeletonManagerService.currentSkeleton$.subscribe((documentSkeleton) => {
        if (documentSkeleton == null) {
          return;
        }
        this._refreshDrawing(documentSkeleton);
      })
    );
    this.disposeWithMe(
      this._docRefreshDrawingsService.refreshDrawings$.subscribe((skeleton) => {
        if (skeleton == null) {
          return;
        }
        this._refreshDrawing(skeleton);
      })
    );
  }
  _commandExecutedListener() {
    const updateCommandList = [RichTextEditingMutation.id, SetDocZoomRatioOperation.id];
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (updateCommandList.includes(command.id)) {
          const params = command.params;
          const { unitId: commandUnitId } = params;
          const { unitId, mainComponent } = this._context;
          if (commandUnitId !== unitId) {
            return;
          }
          const skeleton = this._docSkeletonManagerService.getSkeleton();
          if (skeleton == null) {
            return;
          }
          if (this._editorService.isEditor(unitId) && unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
            mainComponent == null ? void 0 : mainComponent.makeDirty();
            return;
          }
          this._refreshDrawing(skeleton);
        }
      })
    );
  }
  _initResize() {
    this.disposeWithMe(
      fromEventSubject(this._context.engine.onTransformChange$).pipe(
        filter((evt) => evt.type === 1 /* resize */),
        debounceTime(16)
      ).subscribe(() => {
        var _a;
        const skeleton = this._docSkeletonManagerService.getSkeleton();
        const { scene } = this._context;
        (_a = scene.getTransformer()) == null ? void 0 : _a.refreshControls();
        this._refreshDrawing(skeleton);
      })
    );
  }
  _refreshDrawing(skeleton) {
    var _a, _b;
    const skeletonData = skeleton == null ? void 0 : skeleton.getSkeletonData();
    const { mainComponent, unitId } = this._context;
    const documentComponent = mainComponent;
    if (!skeletonData) {
      return;
    }
    const { left: docsLeft, top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;
    const { pages, skeHeaders, skeFooters } = skeletonData;
    const updateDrawingMap = {};
    this._liquid.reset();
    for (let i = 0, len = pages.length; i < len; i++) {
      const page = pages[i];
      const { headerId, footerId, pageWidth } = page;
      if (headerId) {
        const headerPage = (_a = skeHeaders.get(headerId)) == null ? void 0 : _a.get(pageWidth);
        if (headerPage) {
          this._calculateDrawingPosition(
            unitId,
            headerPage,
            docsLeft,
            docsTop,
            updateDrawingMap,
            headerPage.marginTop,
            page.marginLeft
          );
          this._calculateTableCellDrawingPositions(
            unitId,
            headerPage,
            docsLeft,
            docsTop,
            updateDrawingMap,
            headerPage.marginTop,
            page.marginLeft
          );
        }
      }
      if (footerId) {
        const footerPage = (_b = skeFooters.get(footerId)) == null ? void 0 : _b.get(pageWidth);
        if (footerPage) {
          const footerTop = page.pageHeight - page.marginBottom + footerPage.marginTop;
          this._calculateDrawingPosition(
            unitId,
            footerPage,
            docsLeft,
            docsTop,
            updateDrawingMap,
            footerTop,
            page.marginLeft
          );
          this._calculateTableCellDrawingPositions(
            unitId,
            footerPage,
            docsLeft,
            docsTop,
            updateDrawingMap,
            footerTop,
            page.marginLeft
          );
        }
      }
      this._calculateDrawingPosition(unitId, page, docsLeft, docsTop, updateDrawingMap, page.marginTop, page.marginLeft);
      this._calculateTableCellDrawingPositions(unitId, page, docsLeft, docsTop, updateDrawingMap, page.marginTop, page.marginLeft);
      this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
    }
    const updateDrawings = Object.values(updateDrawingMap);
    const nonMultiDrawings = updateDrawings.filter((drawing) => !drawing.isMultiTransform);
    const multiDrawings = updateDrawings.filter((drawing) => drawing.isMultiTransform);
    if (nonMultiDrawings.length > 0) {
      this._drawingManagerService.refreshTransform(nonMultiDrawings);
    }
    this._handleMultiDrawingsTransform(multiDrawings);
  }
  _handleMultiDrawingsTransform(multiDrawings) {
    const { scene, unitId } = this._context;
    const transformer = scene.getTransformerByCreate();
    multiDrawings.forEach((updateParam) => {
      const param = this._drawingManagerService.getDrawingByParam(updateParam);
      if (param == null) {
        return;
      }
      param.transform = updateParam.transform;
      param.transforms = updateParam.transforms;
      param.isMultiTransform = updateParam.isMultiTransform;
    });
    const selectedObjectMap = transformer.getSelectedObjectMap();
    const selectedObjectKeys = [...selectedObjectMap.keys()];
    const allMultiDrawings = Object.values(this._drawingManagerService.getDrawingData(unitId, unitId)).filter((drawing) => drawing.isMultiTransform === 1 /* TRUE */);
    this._drawingManagerService.removeNotification(allMultiDrawings);
    if (multiDrawings.length > 0) {
      this._drawingManagerService.addNotification(multiDrawings);
    }
    for (const key of selectedObjectKeys) {
      const drawingShape = scene.getObject(key);
      if (drawingShape) {
        transformer.setSelectedControl(drawingShape);
      }
    }
  }
  _calculateDrawingPosition(unitId, page, docsLeft, docsTop, updateDrawingMap, marginTop, marginLeft) {
    const { skeDrawings } = page;
    this._liquid.translatePagePadding({
      marginTop,
      marginLeft
    });
    skeDrawings.forEach((drawing) => {
      const { aLeft, aTop, height, width, angle, drawingId, drawingOrigin } = drawing;
      const behindText = drawingOrigin.layoutType === 1 /* WRAP_NONE */ && drawingOrigin.behindDoc === 1 /* TRUE */;
      const { isMultiTransform = 0 /* FALSE */ } = drawingOrigin;
      const transform = {
        left: aLeft + docsLeft + this._liquid.x,
        top: aTop + docsTop + this._liquid.y,
        width,
        height,
        angle
      };
      if (updateDrawingMap[drawingId] == null) {
        updateDrawingMap[drawingId] = {
          unitId,
          subUnitId: unitId,
          drawingId,
          behindText,
          transform,
          transforms: [transform],
          isMultiTransform
        };
      } else if (isMultiTransform === 1 /* TRUE */) {
        updateDrawingMap[drawingId].transforms.push(transform);
      }
    });
    this._liquid.restorePagePadding({
      marginTop,
      marginLeft
    });
  }
  _calculateTableCellDrawingPositions(unitId, page, docsLeft, docsTop, updateDrawingMap, baseMarginTop, baseMarginLeft) {
    var _a;
    (_a = page.skeTables) == null ? void 0 : _a.forEach((table) => {
      table.rows.forEach((row) => {
        row.cells.forEach((cell) => {
          const cellOffset = getDocsTableCellDrawingOffset(unitId, table, row, cell);
          const marginTop = baseMarginTop + cellOffset.top;
          const marginLeft = baseMarginLeft + cellOffset.left;
          this._calculateDrawingPosition(
            unitId,
            cell,
            docsLeft,
            docsTop,
            updateDrawingMap,
            marginTop,
            marginLeft
          );
          this._calculateTableCellDrawingPositions(
            unitId,
            cell,
            docsLeft,
            docsTop,
            updateDrawingMap,
            marginTop,
            marginLeft
          );
        });
      });
    });
  }
  _drawingInitializeListener() {
    const init = () => {
      const skeleton = this._docSkeletonManagerService.getSkeleton();
      if (skeleton == null) {
        return;
      }
      this._refreshDrawing(skeleton);
      this._drawingManagerService.initializeNotification(this._context.unitId);
    };
    if (this._lifecycleService.stage >= 2 /* Rendered */) {
      if (this._docSkeletonManagerService.getSkeleton()) {
        init();
      } else {
        setTimeout(init, 500);
      }
    } else {
      this.disposeWithMe(this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === 2 /* Rendered */)).subscribe(init));
    }
  }
};
DocDrawingTransformUpdateController = __decorateClass([
  __decorateParam(1, Inject(DocSkeletonManagerService)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IDrawingManagerService),
  __decorateParam(5, Inject(DocRefreshDrawingsService)),
  __decorateParam(6, IUniverInstanceService),
  __decorateParam(7, Inject(LifecycleService))
], DocDrawingTransformUpdateController);

// ../packages/docs-drawing-ui/src/controllers/doc-drawing-transformer-update.controller.ts
var INLINE_DRAWING_ANCHOR_KEY_PREFIX = "__InlineDrawingAnchor__";
function getDocsTableCellAnchorContext(unitId, cell) {
  var _a;
  const row = cell.parent;
  const table = row == null ? void 0 : row.parent;
  const hostPage = table == null ? void 0 : table.parent;
  if (!row || !table || !hostPage || !((_a = row.cells) == null ? void 0 : _a.includes(cell))) {
    return null;
  }
  return {
    cell,
    hostPage,
    offset: getDocsTableCellDrawingOffset(unitId, table, row, cell),
    row,
    table
  };
}
var DocDrawingTransformerController = class extends Disposable {
  constructor(_commandService, _univerInstanceService, _drawingManagerService, _renderManagerService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_liquid", new Liquid());
    __publicField(this, "_listenerOnImageMap", /* @__PURE__ */ new Set());
    // Use to cache the drawings is under transforming or scaling.
    __publicField(this, "_transformerCache", /* @__PURE__ */ new Map());
    __publicField(this, "_anchorShape");
    this._init();
  }
  _init() {
    this._listenDrawingFocus();
  }
  _listenDrawingFocus() {
    this.disposeWithMe(
      this._drawingManagerService.add$.subscribe((drawingParams) => {
        if (drawingParams.length === 0) {
          return;
        }
        for (const drawingParam of drawingParams) {
          const { unitId } = drawingParam;
          if (!this._listenerOnImageMap.has(unitId)) {
            this._listenTransformerChange(unitId);
            this._listenerOnImageMap.add(unitId);
          }
        }
      })
    );
  }
  // Only handle one drawing transformer change.
  // eslint-disable-next-line max-lines-per-function
  _listenTransformerChange(unitId) {
    var _a;
    const transformer = (_a = this._getSceneAndTransformerByDrawingSearch(unitId)) == null ? void 0 : _a.transformer;
    if (transformer == null) {
      return;
    }
    this.disposeWithMe(
      toDisposable(
        transformer.changeStart$.subscribe((state) => {
          var _a2;
          this._transformerCache.clear();
          const { objects } = state;
          for (const object of objects.values()) {
            const { oKey, width, height, left, top, angle } = object;
            const drawing = this._drawingManagerService.getDrawingOKey(oKey);
            if (drawing == null) {
              continue;
            }
            const documentDataModel = this._univerInstanceService.getUniverDocInstance(drawing.unitId);
            const drawingData = (_a2 = documentDataModel == null ? void 0 : documentDataModel.getSnapshot().drawings) == null ? void 0 : _a2[drawing.drawingId];
            if ((drawingData == null ? void 0 : drawingData.layoutType) === 0 /* INLINE */) {
              try {
                object.setOpacity(0.2);
              } catch (e) {
              }
            }
            if (drawingData != null) {
              this._transformerCache.set(drawing.drawingId, {
                drawing: drawingData,
                top,
                left,
                width,
                height,
                angle
              });
            }
          }
        })
      )
    );
    const throttleMultipleDrawingUpdate = throttle(this._updateMultipleDrawingDocTransform.bind(this), 50);
    const throttleNonInlineMoveUpdate = throttle(this._nonInlineDrawingTransform.bind(this), 50);
    this.disposeWithMe(
      toDisposable(
        transformer.changing$.subscribe((state) => {
          const { objects, offsetX, offsetY } = state;
          if (objects.size > 1) {
            throttleMultipleDrawingUpdate(objects);
          } else if (objects.size === 1) {
            const drawingCache = this._transformerCache.values().next().value;
            const object = objects.values().next().value;
            const { width, height, top, left, angle } = object;
            if (drawingCache && width === drawingCache.width && height === drawingCache.height && top === drawingCache.top && left === drawingCache.left && angle === drawingCache.angle) {
              return;
            }
            if (drawingCache && drawingCache.drawing.layoutType !== 0 /* INLINE */) {
            }
            if (drawingCache && drawingCache.drawing.layoutType === 0 /* INLINE */ && offsetX != null && offsetY != null) {
              this._updateInlineDrawingAnchor(drawingCache.drawing, offsetX, offsetY);
            }
          }
        })
      )
    );
    this.disposeWithMe(
      toDisposable(
        // eslint-disable-next-line complexity
        transformer.changeEnd$.subscribe((state) => {
          const { objects, offsetX, offsetY } = state;
          for (const object of objects.values()) {
            const drawing = this._drawingManagerService.getDrawingOKey(object.oKey);
            if (drawing == null) {
              continue;
            }
            const drawingCache = this._transformerCache.get(drawing == null ? void 0 : drawing.drawingId);
            if ((drawingCache == null ? void 0 : drawingCache.drawing.layoutType) === 0 /* INLINE */) {
              try {
                object.setOpacity(1);
              } catch (e) {
              }
            }
          }
          if (this._anchorShape) {
            this._anchorShape.hide();
          }
          if (objects.size > 1) {
            this._updateMultipleDrawingDocTransform(objects);
          } else if (objects.size === 1) {
            const drawingCache = this._transformerCache.values().next().value;
            const object = objects.values().next().value;
            const { width, height, top, left, angle } = object;
            if (drawingCache && width === drawingCache.width && height === drawingCache.height && top === drawingCache.top && left === drawingCache.left && angle === drawingCache.angle) {
              return;
            }
            if (drawingCache && drawingCache.drawing.layoutType === 0 /* INLINE */) {
              if (width !== drawingCache.width || height !== drawingCache.height || angle !== drawingCache.angle) {
                this._updateDrawingSize(drawingCache, object);
              } else if (offsetX != null && offsetY != null) {
                this._moveInlineDrawing(drawingCache.drawing, offsetX, offsetY);
              }
            } else if (drawingCache) {
              this._nonInlineDrawingTransform(drawingCache.drawing, object);
            }
          }
          this._transformerCache.clear();
        })
      )
    );
  }
  // eslint-disable-next-line max-lines-per-function
  _updateMultipleDrawingDocTransform(objects) {
    if (objects.size < 1) {
      return;
    }
    const drawings = [];
    let unitId;
    let subUnitId;
    for (const object of objects.values()) {
      const { oKey, left, top, angle } = object;
      let { width, height } = object;
      const drawing = this._drawingManagerService.getDrawingOKey(oKey);
      if (drawing == null) {
        continue;
      }
      if (unitId == null) {
        unitId = drawing.unitId;
      }
      if (subUnitId == null) {
        subUnitId = drawing.subUnitId;
      }
      const drawingCache = this._transformerCache.get(drawing.drawingId);
      if (drawingCache == null) {
        continue;
      }
      const { drawing: drawingData, top: oldTop, left: oldLeft, width: oldWidth, height: oldHeight, angle: oldAngle } = drawingCache;
      const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawingData);
      width = Math.min(width, maxWidth);
      height = Math.min(height, maxHeight);
      if (oldWidth !== width || oldHeight !== height) {
        drawings.push({
          drawingId: drawing.drawingId,
          key: "size",
          value: {
            width,
            height
          }
        });
      }
      if (oldAngle !== angle) {
        drawings.push({
          drawingId: drawing.drawingId,
          key: "angle",
          value: angle
        });
      }
      if (oldTop !== top || oldLeft !== left) {
        const verticalDelta = top - oldTop;
        const horizontalDelta = left - oldLeft;
        if (verticalDelta !== 0) {
          drawings.push({
            drawingId: drawing.drawingId,
            key: "positionV",
            value: {
              relativeFrom: drawingData.docTransform.positionV.relativeFrom,
              posOffset: drawingData.docTransform.positionV.posOffset + verticalDelta
            }
          });
        }
        if (horizontalDelta !== 0) {
          drawings.push({
            drawingId: drawing.drawingId,
            key: "positionH",
            value: {
              relativeFrom: drawingData.docTransform.positionH.relativeFrom,
              posOffset: drawingData.docTransform.positionH.posOffset + horizontalDelta
            }
          });
        }
      }
    }
    if (drawings.length > 0 && unitId && subUnitId) {
      this._commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
        unitId,
        subUnitId,
        drawings
      });
    }
  }
  // TODO: @JOCS, Use to draw and update the drawing anchor.
  _updateDrawingAnchor(objects) {
    if (this._transformerCache.size !== 1) {
      return;
    }
    const drawingCache = this._transformerCache.values().next().value;
    const object = objects.values().next().value;
    const anchor = this._getDrawingAnchor(drawingCache.drawing, object);
  }
  _updateInlineDrawingAnchor(drawing, offsetX, offsetY) {
    var _a;
    if (this._transformerCache.size !== 1) {
      return;
    }
    const { contentBoxPointGroup } = (_a = this._getInlineDrawingAnchor(drawing, offsetX, offsetY)) != null ? _a : {};
    if (contentBoxPointGroup == null) {
      return;
    }
    this._createOrUpdateInlineAnchor(drawing.unitId, contentBoxPointGroup);
  }
  _getInlineDrawingAnchor(drawing, offsetX, offsetY) {
    var _a, _b;
    const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
    const skeleton = currentRender == null ? void 0 : currentRender.with(DocSkeletonManagerService).getSkeleton();
    if (currentRender == null) {
      return;
    }
    const { mainComponent, scene } = currentRender;
    const documentComponent = mainComponent;
    const activeViewport = scene.getViewports()[0];
    const {
      pageLayoutType = 0 /* VERTICAL */,
      pageMarginLeft,
      pageMarginTop
    } = documentComponent.getOffsetConfig();
    let glyphAnchor = null;
    let isBack = false;
    let segmentPageIndex = -1;
    let segmentId = "";
    const HALF = 0.5;
    const coord = this._getTransformCoordForDocumentOffset(documentComponent, activeViewport, offsetX, offsetY);
    if (coord == null) {
      return;
    }
    const docSelectionRenderService = (_a = this._renderManagerService.getRenderById(drawing.unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
    if (docSelectionRenderService == null) {
      return;
    }
    const nodeInfo = skeleton == null ? void 0 : skeleton.findNodeByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop, {
      strict: false,
      segmentId: docSelectionRenderService.getSegment(),
      segmentPage: docSelectionRenderService.getSegmentPage()
    });
    if (nodeInfo) {
      const { node, ratioX, segmentPage, segmentId: nodeSegmentId } = nodeInfo;
      isBack = ratioX < HALF;
      glyphAnchor = node;
      segmentPageIndex = segmentPage;
      segmentId = nodeSegmentId;
    }
    if (glyphAnchor == null) {
      return;
    }
    const nodePosition = skeleton == null ? void 0 : skeleton.findPositionByGlyph(glyphAnchor, segmentPageIndex);
    const docObject = this._getDocObject();
    if (nodePosition == null || skeleton == null || docObject == null) {
      return;
    }
    const positionWithIsBack = {
      ...nodePosition,
      isBack
    };
    const documentOffsetConfig = docObject.document.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { cursorList, contentBoxPointGroup } = convertor.getRangePointData(positionWithIsBack, positionWithIsBack);
    const { startOffset } = (_b = getOneTextSelectionRange(cursorList)) != null ? _b : {};
    if (startOffset == null) {
      return;
    }
    return { offset: startOffset, contentBoxPointGroup, segmentId, segmentPage: segmentPageIndex };
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  _getDrawingAnchor(drawing, object) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
    const skeleton = currentRender == null ? void 0 : currentRender.with(DocSkeletonManagerService).getSkeleton();
    const skeletonData = skeleton == null ? void 0 : skeleton.getSkeletonData();
    if (skeletonData == null || currentRender == null) {
      return;
    }
    const { pages, skeHeaders, skeFooters } = skeletonData;
    const { mainComponent, scene } = currentRender;
    const documentComponent = mainComponent;
    const activeViewport = scene.getViewports()[0];
    const { pageLayoutType = 0 /* VERTICAL */, pageMarginLeft, pageMarginTop, docsLeft, docsTop } = documentComponent.getOffsetConfig();
    const { left, top, angle } = object;
    let { width, height } = object;
    const { positionV, positionH } = drawing.docTransform;
    const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawing);
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);
    let glyphAnchor = null;
    let segmentId = "";
    let segmentPage = -1;
    const isBack = false;
    const docTransform = {
      ...drawing.docTransform,
      size: {
        width,
        height
      },
      angle
    };
    const { x, y } = scene.getViewportScrollXY(activeViewport);
    const coord = this._getTransformCoordForDocumentOffset(documentComponent, activeViewport, left - x, top - y);
    if (coord == null) {
      return;
    }
    const docSelectionRenderService = (_a = this._renderManagerService.getRenderById(drawing.unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
    if (docSelectionRenderService == null) {
      return;
    }
    const nodeInfo = skeleton == null ? void 0 : skeleton.findNodeByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop, {
      strict: false,
      segmentId: docSelectionRenderService.getSegment(),
      segmentPage: docSelectionRenderService.getSegmentPage()
    });
    if (nodeInfo) {
      const { node, segmentPage: segmentPageIndex, segmentId: nodeSegmentId } = nodeInfo;
      glyphAnchor = node;
      segmentPage = segmentPageIndex;
      segmentId = nodeSegmentId;
    }
    if (glyphAnchor == null) {
      return;
    }
    const line = (_b = glyphAnchor.parent) == null ? void 0 : _b.parent;
    const column = line == null ? void 0 : line.parent;
    const paragraphStartLine = (_c = column == null ? void 0 : column.lines.find((l) => l.paragraphIndex === (line == null ? void 0 : line.paragraphIndex) && l.paragraphStart)) != null ? _c : column == null ? void 0 : column.lines[0];
    const page = (_d = column == null ? void 0 : column.parent) == null ? void 0 : _d.parent;
    if (line == null || column == null || paragraphStartLine == null || page == null) {
      return;
    }
    this._liquid.reset();
    const tableCellContext = page.type === 3 /* CELL */ ? getDocsTableCellAnchorContext(drawing.unitId, page) : null;
    const anchorPage = (_e = tableCellContext == null ? void 0 : tableCellContext.hostPage) != null ? _e : page;
    const pageType = anchorPage.type;
    for (const p of pages) {
      const { headerId, footerId, pageHeight, pageWidth, marginLeft, marginBottom } = p;
      const pIndex = pages.indexOf(p);
      if (segmentPage > -1 && pIndex === segmentPage) {
        switch (pageType) {
          case 1 /* HEADER */: {
            const headerSke = (_f = skeHeaders.get(headerId)) == null ? void 0 : _f.get(pageWidth);
            if (headerSke) {
              this._liquid.translatePagePadding({
                marginTop: headerSke.marginTop,
                marginLeft
              });
            } else {
              throw new Error("header skeleton not found");
            }
            break;
          }
          case 2 /* FOOTER */: {
            const footerSke = (_g = skeFooters.get(footerId)) == null ? void 0 : _g.get(pageWidth);
            if (footerSke) {
              this._liquid.translatePagePadding({
                marginTop: pageHeight - marginBottom + footerSke.marginTop,
                marginLeft
              });
            } else {
              throw new Error("footer skeleton not found");
            }
            break;
          }
          default: {
            this._liquid.translatePagePadding(p);
            break;
          }
        }
        break;
      }
      this._liquid.translatePagePadding(p);
      if (p === anchorPage) {
        break;
      }
      this._liquid.restorePagePadding(p);
      this._liquid.translatePage(p, pageLayoutType, pageMarginLeft, pageMarginTop);
    }
    if (tableCellContext) {
      this._liquid.translate(tableCellContext.offset.left, tableCellContext.offset.top);
    }
    if (positionV.relativeFrom === 2 /* LINE */) {
      glyphAnchor = line.divides[0].glyphGroup[0];
    } else {
      glyphAnchor = (_k = (_j = (_i = (_h = paragraphStartLine.divides) == null ? void 0 : _h[0]) == null ? void 0 : _i.glyphGroup) == null ? void 0 : _j[0]) != null ? _k : glyphAnchor;
    }
    docTransform.positionH = {
      relativeFrom: positionH.relativeFrom,
      posOffset: left - this._liquid.x - docsLeft
    };
    switch (positionH.relativeFrom) {
      case 3 /* MARGIN */: {
        docTransform.positionH.posOffset = left - this._liquid.x - docsLeft - page.marginLeft;
        break;
      }
      case 1 /* COLUMN */: {
        docTransform.positionH.posOffset = left - this._liquid.x - docsLeft - column.left;
        break;
      }
    }
    docTransform.positionV = {
      relativeFrom: positionV.relativeFrom,
      posOffset: top - this._liquid.y - docsTop
    };
    switch (positionV.relativeFrom) {
      case 0 /* PAGE */: {
        docTransform.positionV.posOffset = top - this._liquid.y - docsTop - page.marginTop;
        break;
      }
      case 2 /* LINE */: {
        docTransform.positionV.posOffset = top - this._liquid.y - docsTop - line.top;
        break;
      }
      case 1 /* PARAGRAPH */: {
        docTransform.positionV.posOffset = top - this._liquid.y - docsTop - paragraphStartLine.top;
        break;
      }
    }
    if (glyphAnchor == null) {
      return;
    }
    const nodePosition = skeleton == null ? void 0 : skeleton.findPositionByGlyph(glyphAnchor, segmentPage);
    const docObject = this._getDocObject();
    if (nodePosition == null || skeleton == null || docObject == null) {
      return;
    }
    const positionWithIsBack = {
      ...nodePosition,
      isBack
    };
    const documentOffsetConfig = docObject.document.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { cursorList } = convertor.getRangePointData(positionWithIsBack, positionWithIsBack);
    const { startOffset } = (_l = getOneTextSelectionRange(cursorList)) != null ? _l : {};
    if (startOffset == null) {
      return;
    }
    return { offset: startOffset, docTransform, segmentId, segmentPage };
  }
  // Update drawing when use transformer to resize it.
  _updateDrawingSize(drawingCache, object) {
    const drawings = [];
    const { drawing, width: oldWidth, height: oldHeight, angle: oldAngle } = drawingCache;
    const { unitId, subUnitId } = drawing;
    let { width, height, angle } = object;
    const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawing);
    width = Math.min(maxWidth, width);
    height = Math.min(maxHeight, height);
    if (width !== oldWidth || height !== oldHeight) {
      drawings.push({
        drawingId: drawing.drawingId,
        key: "size",
        value: {
          width,
          height
        }
      });
    }
    if (angle !== oldAngle) {
      drawings.push({
        drawingId: drawing.drawingId,
        key: "angle",
        value: angle
      });
    }
    if (drawings.length > 0 && unitId && subUnitId) {
      this._commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
        unitId,
        subUnitId,
        drawings
      });
    }
  }
  // Update inline drawing when use transformer to move it.
  _moveInlineDrawing(drawing, offsetX, offsetY) {
    const anchor = this._getInlineDrawingAnchor(drawing, offsetX, offsetY);
    const { offset, segmentId, segmentPage } = anchor != null ? anchor : {};
    return this._commandService.executeCommand(IMoveInlineDrawingCommand.id, {
      unitId: drawing.unitId,
      subUnitId: drawing.unitId,
      drawing,
      offset,
      segmentId,
      segmentPage,
      needRefreshDrawings: offset == null
    });
  }
  // Limit the drawing to the page area, mainly in the vertical direction,
  // and the upper and lower limits cannot exceed the page margin area.
  _limitDrawingInPage(drawing, object) {
    const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
    const { left, top, width, height, angle } = object;
    const skeleton = currentRender == null ? void 0 : currentRender.with(DocSkeletonManagerService).getSkeleton();
    const skeletonData = skeleton == null ? void 0 : skeleton.getSkeletonData();
    const { pages } = skeletonData != null ? skeletonData : {};
    if (skeletonData == null || currentRender == null || pages == null) {
      return {
        left,
        top,
        width,
        height,
        angle
      };
    }
    const { mainComponent } = currentRender;
    const documentComponent = mainComponent;
    const { top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;
    let newTop = top;
    this._liquid.reset();
    for (const page of pages) {
      const { marginBottom, pageHeight } = page;
      const index = pages.indexOf(page);
      const nextPage = pages[index + 1];
      if (nextPage == null) {
        continue;
      }
      const isBetweenPages = Tools.hasIntersectionBetweenTwoRanges(
        top,
        top + height,
        this._liquid.y + docsTop + pageHeight - marginBottom,
        this._liquid.y + docsTop + pageHeight + pageMarginTop + nextPage.marginTop
      );
      if (isBetweenPages) {
        const drawingVMiddle = top + height / 2;
        const pagesMiddle = this._liquid.y + docsTop + pageHeight + pageMarginTop / 2;
        if (drawingVMiddle < pagesMiddle) {
          newTop = Math.min(top, this._liquid.y + docsTop + pageHeight - marginBottom - height);
        } else {
          newTop = Math.max(top, this._liquid.y + docsTop + pageHeight + pageMarginTop + nextPage.marginTop);
        }
      }
      this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
    }
    return {
      left,
      top: newTop,
      width,
      height,
      angle
    };
  }
  _nonInlineDrawingTransform(drawing, object, isMoving = false) {
    const objectPosition = drawing.isMultiTransform === 1 /* TRUE */ ? object : this._limitDrawingInPage(drawing, object);
    if (isMoving && objectPosition.top !== object.top) {
      return;
    }
    const anchor = this._getDrawingAnchor(drawing, objectPosition);
    const { offset, docTransform, segmentId, segmentPage } = anchor != null ? anchor : {};
    if (offset == null || docTransform == null) {
      return this._updateMultipleDrawingDocTransform(/* @__PURE__ */ new Map([[drawing.drawingId, object]]));
    }
    return this._commandService.executeCommand(ITransformNonInlineDrawingCommand.id, {
      unitId: drawing.unitId,
      subUnitId: drawing.unitId,
      drawing,
      offset,
      docTransform,
      segmentId,
      segmentPage
    });
  }
  _getSceneAndTransformerByDrawingSearch(unitId) {
    if (unitId == null) {
      return;
    }
    const renderObject = this._renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return;
    }
    const transformer = scene.getTransformerByCreate();
    return { scene, transformer };
  }
  _getTransformCoordForDocumentOffset(document2, viewport, evtOffsetX, evtOffsetY) {
    const { documentTransform } = document2.getOffsetConfig();
    const originCoord = viewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));
    if (!originCoord) {
      return;
    }
    return documentTransform.clone().invert().applyPoint(originCoord);
  }
  _createOrUpdateInlineAnchor(unitId, pointsGroup) {
    const currentRender = this._renderManagerService.getRenderById(unitId);
    if (currentRender == null) {
      return;
    }
    const { mainComponent, scene } = currentRender;
    const documentComponent = mainComponent;
    const {
      docsLeft,
      docsTop
    } = documentComponent.getOffsetConfig();
    const bounding = getAnchorBounding(pointsGroup);
    const { left: boundingLeft, top: boundingTop, height } = bounding;
    const left = boundingLeft + docsLeft;
    const top = boundingTop + docsTop;
    if (this._anchorShape) {
      this._anchorShape.transformByState({ left, top, height });
      this._anchorShape.show();
      return;
    }
    const ID_LENGTH = 6;
    const anchor = new Rect(INLINE_DRAWING_ANCHOR_KEY_PREFIX + generateRandomId(ID_LENGTH), {
      left,
      top,
      height,
      strokeWidth: 2,
      stroke: getColor(COLORS.darkgray, 1),
      evented: false
    });
    this._anchorShape = anchor;
    scene.addObject(anchor, TEXT_RANGE_LAYER_INDEX);
  }
  _getDocObject() {
    return getDocObject(this._univerInstanceService, this._renderManagerService);
  }
  _getPageContentSize(drawing) {
    const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
    const skeleton = currentRender == null ? void 0 : currentRender.with(DocSkeletonManagerService).getSkeleton();
    const MAX_WIDTH = 500;
    const MAX_HEIGHT = 500;
    const skeletonData = skeleton == null ? void 0 : skeleton.getSkeletonData();
    if (skeletonData == null || currentRender == null) {
      return {
        width: MAX_WIDTH,
        height: MAX_HEIGHT
      };
    }
    const { pages } = skeletonData;
    let page = null;
    for (const p of pages) {
      const { skeDrawings } = p;
      if (skeDrawings.has(drawing.drawingId)) {
        page = p;
        break;
      }
    }
    if (page) {
      const { pageWidth, pageHeight, marginLeft, marginBottom, marginRight, marginTop } = page;
      return {
        width: Math.max(MAX_WIDTH, pageWidth - marginLeft - marginRight),
        height: Math.max(MAX_HEIGHT, pageHeight - marginTop - marginBottom)
      };
    } else {
      return {
        width: MAX_WIDTH,
        height: MAX_HEIGHT
      };
    }
  }
};
DocDrawingTransformerController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, IDrawingManagerService),
  __decorateParam(3, IRenderManagerService)
], DocDrawingTransformerController);

// ../packages/docs-drawing-ui/src/commands/commands/remove-doc-drawing.command.ts
var RemoveDocDrawingCommand = {
  id: "doc.command.remove-doc-image",
  type: 0 /* COMMAND */,
  // eslint-disable-next-line max-lines-per-function
  handler: (accessor, params) => {
    var _a, _b, _c, _d;
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
    if (params == null || documentDataModel == null) {
      return false;
    }
    const docSelectionRenderService = renderManagerService.getRenderById(params.unitId).with(DocSelectionRenderService);
    const { drawings: removeDrawings } = params;
    const segmentId = (_a = docSelectionRenderService.getSegment()) != null ? _a : "";
    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const customBlocks = (_c = (_b = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()) == null ? void 0 : _b.customBlocks) != null ? _c : [];
    const removeCustomBlocks = removeDrawings.map((drawing) => customBlocks.find((customBlock) => customBlock.blockId === drawing.drawingId)).filter((block) => !!block).sort((a, b) => a.startIndex > b.startIndex ? 1 : -1);
    const unitId = removeDrawings[0].unitId;
    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();
    const cursorIndex = removeCustomBlocks[0].startIndex;
    const textRanges = [
      {
        startOffset: cursorIndex,
        endOffset: cursorIndex
      }
    ];
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges
      }
    };
    const rawActions = [];
    for (const block of removeCustomBlocks) {
      const { startIndex } = block;
      if (startIndex > memoryCursor.cursor) {
        textX.push({
          t: "r" /* RETAIN */,
          len: startIndex - memoryCursor.cursor
        });
      }
      textX.push({
        t: "d" /* DELETE */,
        len: 1
      });
      memoryCursor.moveCursorTo(startIndex + 1);
    }
    const path = getRichTextEditPath(documentDataModel, segmentId);
    rawActions.push(jsonX.editOp(textX.serialize(), path));
    for (const block of removeCustomBlocks) {
      const { blockId } = block;
      const drawing = ((_d = documentDataModel.getDrawings()) != null ? _d : {})[blockId];
      const drawingOrder = documentDataModel.getDrawingsOrder();
      const drawingIndex = drawingOrder.indexOf(blockId);
      const removeDrawingAction = jsonX.removeOp(["drawings", blockId], drawing);
      const removeDrawingOrderAction = jsonX.removeOp(["drawingsOrder", drawingIndex], blockId);
      rawActions.push(removeDrawingAction);
      rawActions.push(removeDrawingOrderAction);
    }
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    return Boolean(result);
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/delete-doc-drawing.command.ts
var DeleteDocDrawingsCommand = {
  id: "doc.command.delete-drawing",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const commandService = accessor.get(ICommandService);
    const docDrawingService = accessor.get(IDocDrawingService);
    const drawings = docDrawingService.getFocusDrawings();
    if (drawings.length === 0) {
      return false;
    }
    const { unitId } = drawings[0];
    const newDrawings = drawings.map((drawing) => {
      const { unitId: unitId2, subUnitId, drawingId, drawingType } = drawing;
      return {
        unitId: unitId2,
        subUnitId,
        drawingId,
        drawingType
      };
    });
    return commandService.executeCommand(RemoveDocDrawingCommand.id, {
      unitId,
      drawings: newDrawings
    });
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/group-doc-drawing.command.ts
var GroupDocDrawingCommand = {
  id: "doc.command.group-doc-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    return false;
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/set-drawing-arrange.command.ts
var SetDocDrawingArrangeCommand = {
  id: "doc.command.set-drawing-arrange",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const docDrawingService = accessor.get(IDocDrawingService);
    if (params == null) {
      return false;
    }
    const { unitId, subUnitId, drawingIds, arrangeType } = params;
    const drawingOrderMapParam = { unitId, subUnitId, drawingIds };
    let jsonOp;
    if (arrangeType === 0 /* forward */) {
      jsonOp = docDrawingService.getForwardDrawingsOp(drawingOrderMapParam);
    } else if (arrangeType === 1 /* backward */) {
      jsonOp = docDrawingService.getBackwardDrawingOp(drawingOrderMapParam);
    } else if (arrangeType === 2 /* front */) {
      jsonOp = docDrawingService.getFrontDrawingsOp(drawingOrderMapParam);
    } else if (arrangeType === 3 /* back */) {
      jsonOp = docDrawingService.getBackDrawingsOp(drawingOrderMapParam);
    }
    if (jsonOp == null) {
      return false;
    }
    const { redo } = jsonOp;
    if (redo == null) {
      return false;
    }
    const rawActions = [];
    let redoCopy = Tools.deepClone(redo);
    redoCopy = redoCopy.slice(3);
    redoCopy.unshift("drawingsOrder");
    rawActions.push(redoCopy);
    const doMutation = {
      id: RichTextEditingMutation.id,
      params: {
        unitId,
        actions: [],
        textRanges: null
      }
    };
    doMutation.params.actions = rawActions.reduce((acc, cur) => {
      return JSONX.compose(acc, cur);
    }, null);
    const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    return Boolean(result);
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/ungroup-doc-drawing.command.ts
var UngroupDocDrawingCommand = {
  id: "doc.command.ungroup-doc-image",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const docDrawingService = accessor.get(IDocDrawingService);
    if (!params) return false;
    const unitIds = [];
    params.forEach(({ parent, children }) => {
      unitIds.push(parent.unitId);
      children.forEach((child) => {
        unitIds.push(child.unitId);
      });
    });
    const jsonOp = docDrawingService.getUngroupDrawingOp(params);
    const { unitId, subUnitId, undo, redo, objects } = jsonOp;
    return false;
  }
};

// ../packages/docs-drawing-ui/src/controllers/render-controllers/doc-drawing-update.render-controller.ts
var DocDrawingUpdateRenderController = class extends Disposable {
  constructor(_context, _commandService, _docSelectionManagerService, _renderManagerSrv, _imageIoService, _docDrawingService, _drawingManagerService, _contextService, _messageService, _localeService, _docSelectionRenderService, _docRefreshDrawingsService, _fileOpenerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_docSelectionManagerService", _docSelectionManagerService);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_imageIoService", _imageIoService);
    __publicField(this, "_docDrawingService", _docDrawingService);
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_docSelectionRenderService", _docSelectionRenderService);
    __publicField(this, "_docRefreshDrawingsService", _docRefreshDrawingsService);
    __publicField(this, "_fileOpenerService", _fileOpenerService);
    this._updateOrderListener();
    this._groupDrawingListener();
    this._focusDrawingListener();
    this._transformDrawingListener();
    this._editAreaChangeListener();
  }
  dispose() {
    super.dispose();
    delete this._context;
  }
  async insertDocImage() {
    const insertPosition = this._getCurrentImageInsertPosition();
    const files = await this._fileOpenerService.openFile({
      multiple: true,
      accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image2) => `.${image2.replace("image/", "")}`).join(",")
    });
    const fileLength = files.length;
    if (fileLength > DRAWING_IMAGE_COUNT_LIMIT) {
      this._messageService.show({
        type: "error" /* Error */,
        content: this._localeService.t("docs-drawing-ui.update-status.exceedMaxCount", String(DRAWING_IMAGE_COUNT_LIMIT))
      });
      return false;
    } else if (fileLength === 0) {
      return false;
    }
    await this._insertFloatImages(files, insertPosition);
    return true;
  }
  // eslint-disable-next-line max-lines-per-function
  async _insertFloatImages(files, insertPosition) {
    let imageParams = [];
    try {
      imageParams = await Promise.all(files.map((file) => this._imageIoService.saveImage(file)));
    } catch (error) {
      const type = error.message;
      let content = "";
      switch (type) {
        case "1" /* ERROR_EXCEED_SIZE */:
          content = this._localeService.t("docs-drawing-ui.update-status.exceedMaxSize", String(getDrawingImageAllowSize() / (1024 * 1024)));
          break;
        case "2" /* ERROR_IMAGE_TYPE */:
          content = this._localeService.t("docs-drawing-ui.update-status.invalidImageType");
          break;
        case "4" /* ERROR_IMAGE */:
          content = this._localeService.t("docs-drawing-ui.update-status.invalidImage");
          break;
        default:
          break;
      }
      this._messageService.show({
        type: "error" /* Error */,
        content
      });
    }
    if (imageParams.length === 0) {
      return;
    }
    const { unitId } = this._context;
    const docDrawingParams = [];
    for (const imageParam of imageParams) {
      if (imageParam == null) {
        continue;
      }
      const { imageId, imageSourceType, source, base64Cache } = imageParam;
      const { width, height, image: image2 } = await getImageSize(base64Cache || "");
      this._imageIoService.addImageSourceCache(imageId, imageSourceType, image2);
      let scale = 1;
      if (width > DRAWING_IMAGE_WIDTH_LIMIT || height > DRAWING_IMAGE_HEIGHT_LIMIT) {
        const scaleWidth = DRAWING_IMAGE_WIDTH_LIMIT / width;
        const scaleHeight = DRAWING_IMAGE_HEIGHT_LIMIT / height;
        scale = Math.min(scaleWidth, scaleHeight);
      }
      const imagePosition = insertPosition != null ? insertPosition : this._getCurrentImageInsertPosition();
      const docTransform = this._getImagePosition(width * scale, height * scale, imagePosition);
      if (docTransform == null) {
        return;
      }
      const transform = docDrawingPositionToTransform(docTransform);
      if (transform != null && imagePosition != null) {
        transform.top = imagePosition.top;
      }
      const docDrawingParam = {
        unitId,
        subUnitId: unitId,
        drawingId: imageId,
        drawingType: 0 /* DRAWING_IMAGE */,
        imageSourceType,
        source,
        transform,
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
      const isInHeaderFooter = this._isInsertInHeaderFooter();
      if (isInHeaderFooter) {
        docDrawingParam.isMultiTransform = 1 /* TRUE */;
        docDrawingParam.transforms = docDrawingParam.transform ? [docDrawingParam.transform] : null;
      }
      docDrawingParams.push(docDrawingParam);
    }
    this._commandService.executeCommand(InsertDocDrawingCommand.id, {
      unitId,
      drawings: docDrawingParams
    });
  }
  _isInsertInHeaderFooter() {
    var _a;
    const { unitId } = this._context;
    const viewModel = (_a = this._renderManagerSrv.getRenderById(unitId)) == null ? void 0 : _a.with(DocSkeletonManagerService).getViewModel();
    const editArea = viewModel == null ? void 0 : viewModel.getEditArea();
    return editArea === "HEADER" /* HEADER */ || editArea === "FOOTER" /* FOOTER */;
  }
  _getImagePosition(imageWidth, imageHeight, insertPosition) {
    var _a;
    const position = (_a = insertPosition != null ? insertPosition : this._getCurrentImageInsertPosition()) != null ? _a : {
      left: 0,
      top: 0
    };
    return {
      size: {
        width: imageWidth,
        height: imageHeight
      },
      positionH: {
        relativeFrom: 0 /* PAGE */,
        posOffset: position.left
      },
      positionV: {
        relativeFrom: 1 /* PARAGRAPH */,
        posOffset: 0
      },
      angle: 0
    };
  }
  _getCurrentImageInsertPosition() {
    var _a;
    const position = (_a = this._docSelectionRenderService.getActiveTextRange()) == null ? void 0 : _a.getAbsolutePosition();
    if (position == null) {
      return null;
    }
    return {
      left: position.left,
      top: position.top
    };
  }
  _updateOrderListener() {
    this.disposeWithMe(
      this._drawingManagerService.featurePluginOrderUpdate$.subscribe((params) => {
        const { unitId, subUnitId, drawingIds, arrangeType } = params;
        this._commandService.executeCommand(SetDocDrawingArrangeCommand.id, {
          unitId,
          subUnitId,
          drawingIds,
          arrangeType
        });
      })
    );
  }
  _groupDrawingListener() {
    this.disposeWithMe(
      this._drawingManagerService.featurePluginGroupUpdate$.subscribe((params) => {
        this._commandService.executeCommand(GroupDocDrawingCommand.id, params);
      })
    );
    this.disposeWithMe(
      this._drawingManagerService.featurePluginUngroupUpdate$.subscribe((params) => {
        this._commandService.executeCommand(UngroupDocDrawingCommand.id, params);
      })
    );
  }
  _getCurrentSceneAndTransformer() {
    const { scene, mainComponent } = this._context;
    if (scene == null || mainComponent == null) {
      return;
    }
    const transformer = scene.getTransformerByCreate();
    const { docsLeft, docsTop } = mainComponent.getOffsetConfig();
    return { scene, transformer, docsLeft, docsTop };
  }
  _transformDrawingListener() {
    const res = this._getCurrentSceneAndTransformer();
    if (res && res.transformer) {
      this.disposeWithMe(res.transformer.changeEnd$.pipe(debounceTime(30)).subscribe((params) => {
        this._docSelectionManagerService.refreshSelection();
      }));
    } else {
      throw new Error("transformer is not init");
    }
  }
  _focusDrawingListener() {
    this.disposeWithMe(
      this._drawingManagerService.focus$.subscribe((params) => {
        var _a;
        const { transformer, docsLeft, docsTop } = (_a = this._getCurrentSceneAndTransformer()) != null ? _a : {};
        if (params == null || params.length === 0) {
          this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
          this._docDrawingService.focusDrawing([]);
          if (transformer) {
            transformer.resetProps({
              zeroTop: 0,
              zeroLeft: 0
            });
          }
        } else {
          this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
          this._docDrawingService.focusDrawing(params);
          this._setDrawingSelections(params);
          const prevSegmentId = this._docSelectionRenderService.getSegment();
          const segmentId = this._findSegmentIdByDrawingId(params[0].drawingId);
          if (prevSegmentId !== segmentId) {
            this._docSelectionRenderService.setSegment(segmentId);
          }
          if (transformer) {
            transformer.resetProps({
              zeroTop: docsTop,
              zeroLeft: docsLeft
            });
          }
        }
      })
    );
  }
  _findSegmentIdByDrawingId(drawingId) {
    var _a, _b, _c;
    const { unit: DocDataModel } = this._context;
    const { body, headers = {}, footers = {} } = DocDataModel.getSnapshot();
    const bodyCustomBlocks = (_a = body == null ? void 0 : body.customBlocks) != null ? _a : [];
    if (bodyCustomBlocks.some((b) => b.blockId === drawingId)) {
      return "";
    }
    for (const headerId of Object.keys(headers)) {
      if ((_b = headers[headerId].body.customBlocks) == null ? void 0 : _b.some((b) => b.blockId === drawingId)) {
        return headerId;
      }
    }
    for (const footerId of Object.keys(footers)) {
      if ((_c = footers[footerId].body.customBlocks) == null ? void 0 : _c.some((b) => b.blockId === drawingId)) {
        return footerId;
      }
    }
    return "";
  }
  // Update drawings edit status and opacity. You can not edit header footer images when you are editing body. and vice verse.
  _updateDrawingsEditStatus() {
    var _a;
    if (!this._context) return;
    const { unit: docDataModel, scene, unitId } = this._context;
    const viewModel = (_a = this._renderManagerSrv.getRenderById(unitId)) == null ? void 0 : _a.with(DocSkeletonManagerService).getViewModel();
    if (viewModel == null || docDataModel == null) {
      return;
    }
    const snapshot = docDataModel.getSnapshot();
    const { drawings = {} } = snapshot;
    const isEditBody = viewModel.getEditArea() === "BODY" /* BODY */;
    for (const key of Object.keys(drawings)) {
      const drawing = drawings[key];
      const objectKey = getDrawingShapeKeyByDrawingSearch({ unitId, drawingId: drawing.drawingId, subUnitId: unitId });
      const drawingShapes = scene.fuzzyMathObjects(objectKey, true);
      if (drawingShapes.length) {
        for (const shape of drawingShapes) {
          scene.detachTransformerFrom(shape);
          try {
            shape.setOpacity(0.5);
          } catch (e) {
          }
          if (isEditBody && drawing.isMultiTransform !== 1 /* TRUE */ || !isEditBody && drawing.isMultiTransform === 1 /* TRUE */) {
            if (drawing.allowTransform !== false) {
              scene.attachTransformerTo(shape);
            }
            try {
              shape.setOpacity(1);
            } catch (e) {
            }
          }
        }
      }
    }
  }
  _editAreaChangeListener() {
    var _a;
    const { unitId } = this._context;
    const viewModel = (_a = this._renderManagerSrv.getRenderById(unitId)) == null ? void 0 : _a.with(DocSkeletonManagerService).getViewModel();
    if (viewModel == null) {
      return;
    }
    this._updateDrawingsEditStatus();
    this.disposeWithMe(
      viewModel.editAreaChange$.subscribe(() => {
        this._updateDrawingsEditStatus();
      })
    );
    this.disposeWithMe(
      this._docRefreshDrawingsService.refreshDrawings$.subscribe((skeleton) => {
        if (skeleton == null) {
          return;
        }
        queueMicrotask(() => {
          this._updateDrawingsEditStatus();
        });
      })
    );
    this.disposeWithMe(
      this._commandService.onCommandExecuted(async (command) => {
        if (command.id === RichTextEditingMutation.id) {
          queueMicrotask(() => {
            this._updateDrawingsEditStatus();
          });
        }
      })
    );
  }
  _setDrawingSelections(params) {
    var _a, _b;
    const { unit } = this._context;
    const customBlocks = (_b = (_a = unit.getSnapshot().body) == null ? void 0 : _a.customBlocks) != null ? _b : [];
    const ranges = params.map((item) => {
      const id = item.drawingId;
      const block = customBlocks.find((b) => b.blockId === id);
      if (block) {
        return block.startIndex;
      }
      return null;
    }).filter((e) => e !== null).map((offset) => ({ startOffset: offset, endOffset: offset + 1 }));
    this._docSelectionManagerService.replaceDocRanges(ranges);
  }
};
DocDrawingUpdateRenderController = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(DocSelectionManagerService)),
  __decorateParam(3, IRenderManagerService),
  __decorateParam(4, IImageIoService),
  __decorateParam(5, IDocDrawingService),
  __decorateParam(6, IDrawingManagerService),
  __decorateParam(7, IContextService),
  __decorateParam(8, IMessageService),
  __decorateParam(9, Inject(LocaleService)),
  __decorateParam(10, Inject(DocSelectionRenderService)),
  __decorateParam(11, Inject(DocRefreshDrawingsService)),
  __decorateParam(12, ILocalFileService)
], DocDrawingUpdateRenderController);

// ../packages/docs-drawing-ui/src/commands/commands/insert-image.command.ts
var InsertDocImageCommand = {
  id: "doc.command.insert-float-image",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    var _a, _b;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    return (_b = (_a = getCurrentTypeOfRenderer(1 /* UNIVER_DOC */, univerInstanceService, renderManagerService)) == null ? void 0 : _a.with(DocDrawingUpdateRenderController).insertDocImage()) != null ? _b : false;
  }
};

// ../packages/docs-drawing-ui/src/commands/commands/move-drawings.command.ts
var MoveDocDrawingsCommand = {
  id: "doc.command.move-drawing",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const docDrawingService = accessor.get(IDocDrawingService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const { direction } = params;
    const drawings = docDrawingService.getFocusDrawings();
    if (drawings.length === 0) {
      return false;
    }
    const unitId = drawings[0].unitId;
    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject == null ? void 0 : renderObject.scene;
    if (scene == null) {
      return false;
    }
    const transformer = scene.getTransformerByCreate();
    const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
    const newDrawings = drawings.map((drawing) => {
      var _a, _b, _c, _d, _e;
      const { drawingId } = drawing;
      const drawingData = (_a = documentDataModel == null ? void 0 : documentDataModel.getSnapshot().drawings) == null ? void 0 : _a[drawingId];
      if (drawingData == null || drawingData.layoutType === 0 /* INLINE */) {
        return null;
      }
      const { positionH, positionV } = drawingData.docTransform;
      const newPositionH = { ...positionH };
      const newPositionV = { ...positionV };
      if (direction === 0 /* UP */) {
        newPositionV.posOffset = ((_b = newPositionV.posOffset) != null ? _b : 0) - 2;
      } else if (direction === 2 /* DOWN */) {
        newPositionV.posOffset = ((_c = newPositionV.posOffset) != null ? _c : 0) + 2;
      } else if (direction === 3 /* LEFT */) {
        newPositionH.posOffset = ((_d = newPositionH.posOffset) != null ? _d : 0) - 2;
      } else if (direction === 1 /* RIGHT */) {
        newPositionH.posOffset = ((_e = newPositionH.posOffset) != null ? _e : 0) + 2;
      }
      return {
        drawingId,
        key: direction === 0 /* UP */ || direction === 2 /* DOWN */ ? "positionV" : "positionH",
        value: direction === 0 /* UP */ || direction === 2 /* DOWN */ ? newPositionV : newPositionH
      };
    }).filter((drawing) => drawing != null);
    if (newDrawings.length === 0) {
      return false;
    }
    const result = commandService.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
      unitId,
      subUnitId: unitId,
      drawings: newDrawings
    });
    transformer.refreshControls();
    return Boolean(result);
  }
};

// ../packages/docs-drawing-ui/src/commands/operations/clear-drawing-transformer.operation.ts
var ClearDocDrawingTransformerOperation = {
  id: "doc.operation.clear-drawing-transformer",
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

// ../packages/docs-drawing-ui/src/views/doc-image-panel/component-name.ts
var COMPONENT_DOC_DRAWING_PANEL = "COMPONENT_DOC_DRAWING_PANEL";

// ../packages/docs-drawing-ui/src/commands/operations/open-drawing-panel.operation.ts
var SidebarDocDrawingOperation = {
  id: "sidebar.operation.doc-image",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    const sidebarService = accessor.get(ISidebarService);
    const localeService = accessor.get(LocaleService);
    const drawingManagerService = accessor.get(IDrawingManagerService);
    switch (params.value) {
      case "open":
        sidebarService.open({
          header: { title: localeService.t("docs-drawing-ui.panel.title") },
          children: { label: COMPONENT_DOC_DRAWING_PANEL },
          onClose: () => {
            drawingManagerService.focusDrawing(null);
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

// ../packages/docs-drawing-ui/src/commands/operations/edit-doc-drawing.operation.ts
var EditDocDrawingOperation = {
  id: "doc.operation.edit-doc-image",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const drawingManagerService = accessor.get(IDrawingManagerService);
    const commandService = accessor.get(ICommandService);
    if (params == null) {
      return false;
    }
    drawingManagerService.focusDrawing([params]);
    commandService.executeCommand(SidebarDocDrawingOperation.id, { value: "open" });
    return true;
  }
};

// ../packages/docs-drawing-ui/src/menu/image.menu.ts
var DOCS_IMAGE_MENU_ID = "doc.menu.image";
var IMAGE_MENU_UPLOAD_FLOAT_ID = InsertDocImageCommand.id;
var getDisableWhenSelectionInTableObservable = (accessor) => {
  const docSelectionManagerService = accessor.get(DocSelectionManagerService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  return new Observable((subscriber) => {
    const observable = docSelectionManagerService.textSelection$.subscribe(() => {
      var _a;
      const activeRange = docSelectionManagerService.getActiveTextRange();
      if (activeRange) {
        const { segmentId, startOffset, endOffset } = activeRange;
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const tables = (_a = docDataModel == null ? void 0 : docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()) == null ? void 0 : _a.tables;
        if (tables && tables.length) {
          if (tables.some((table) => {
            const { startIndex, endIndex } = table;
            return startOffset >= startIndex && startOffset < endIndex || endOffset >= startIndex && endOffset < endIndex;
          })) {
            subscriber.next(true);
            return;
          }
        }
      } else {
        subscriber.next(true);
        return;
      }
      subscriber.next(false);
    });
    return () => observable.unsubscribe();
  });
};
function ImageMenuFactory(accessor) {
  return {
    id: DOCS_IMAGE_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "AddImageIcon",
    tooltip: "docs-drawing-ui.title",
    disabled$: getDisableWhenSelectionInTableObservable(accessor),
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */, void 0, DOCS_ZEN_EDITOR_UNIT_ID_KEY)
  };
}
function UploadFloatImageMenuFactory(_accessor) {
  return {
    id: IMAGE_MENU_UPLOAD_FLOAT_ID,
    title: "docs-drawing-ui.upload.float",
    type: 0 /* BUTTON */,
    icon: "AddImageIcon",
    hidden$: getMenuHiddenObservable(_accessor, 1 /* UNIVER_DOC */, void 0, DOCS_ZEN_EDITOR_UNIT_ID_KEY)
  };
}

// ../packages/docs-drawing-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [DOCS_IMAGE_MENU_ID]: {
      order: 0,
      menuItemFactory: ImageMenuFactory,
      [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
        order: 0,
        menuItemFactory: UploadFloatImageMenuFactory
      }
    }
  },
  ["contextMenu.paragraph" /* PARAGRAPH */]: {
    ["contextMenu.layout" /* LAYOUT */]: {
      [INSERT_BELLOW_MENU_ID]: {
        [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
          order: 5,
          menuItemFactory: UploadFloatImageMenuFactory
        }
      }
    },
    [EMPTY_PARAGRAPH_MENU_ID]: {
      ["contextMenu.layout" /* LAYOUT */]: {
        [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
          order: 5,
          menuItemFactory: UploadFloatImageMenuFactory
        }
      }
    },
    [DOC_CONTENT_INSERT_MENU_ID]: {
      ["contextMenu.layout" /* LAYOUT */]: {
        [IMAGE_MENU_UPLOAD_FLOAT_ID]: {
          order: 5,
          menuItemFactory: UploadFloatImageMenuFactory
        }
      }
    }
  }
};

// ../packages/docs-drawing-ui/src/views/doc-image-panel/DocDrawingPanel.tsx
var import_react4 = __toESM(require_react());

// ../packages/docs-drawing-ui/src/views/doc-image-panel/DocDrawingPosition.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var MIN_OFFSET = -1e3;
var MAX_OFFSET = 1e3;
var DocDrawingPosition = (props) => {
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const renderManagerService = useDependency(IRenderManagerService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const { drawings } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return;
  }
  const { unitId } = drawingParam;
  const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
  const documentFlavor = documentDataModel == null ? void 0 : documentDataModel.getSnapshot().documentStyle.documentFlavor;
  const renderObject = renderManagerService.getRenderById(unitId);
  const scene = renderObject == null ? void 0 : renderObject.scene;
  if (scene == null) {
    return;
  }
  const transformer = scene.getTransformerByCreate();
  const HORIZONTAL_RELATIVE_FROM = [{
    label: localeService.t("docs-drawing-ui.image-position.column"),
    value: String(1 /* COLUMN */)
  }, {
    label: localeService.t("docs-drawing-ui.image-position.page"),
    value: String(0 /* PAGE */)
  }, {
    label: localeService.t("docs-drawing-ui.image-position.margin"),
    value: String(3 /* MARGIN */)
  }];
  const VERTICAL_RELATIVE_FROM = [{
    label: localeService.t("docs-drawing-ui.image-position.line"),
    value: String(2 /* LINE */),
    disabled: documentFlavor === 2 /* MODERN */
  }, {
    label: localeService.t("docs-drawing-ui.image-position.page"),
    value: String(0 /* PAGE */),
    disabled: documentFlavor === 2 /* MODERN */
  }, {
    label: localeService.t("docs-drawing-ui.image-position.margin"),
    value: String(3 /* MARGIN */),
    disabled: documentFlavor === 2 /* MODERN */
  }, {
    label: localeService.t("docs-drawing-ui.image-position.paragraph"),
    value: String(1 /* PARAGRAPH */)
  }];
  const [disabled, setDisabled] = (0, import_react2.useState)(true);
  const [hPosition, setHPosition] = (0, import_react2.useState)({
    relativeFrom: 0 /* PAGE */,
    posOffset: 0
  });
  const [vPosition, setVPosition] = (0, import_react2.useState)({
    relativeFrom: 0 /* PAGE */,
    posOffset: 0
  });
  const [followTextMove, setFollowTextMove] = (0, import_react2.useState)(true);
  const [showPanel, setShowPanel] = (0, import_react2.useState)(true);
  function handlePositionChange(direction, value) {
    var _a;
    if (direction === "positionH") {
      setHPosition(value);
    } else {
      setVPosition(value);
    }
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const drawings2 = focusDrawings.map((drawing) => {
      return {
        unitId: drawing.unitId,
        subUnitId: drawing.subUnitId,
        drawingId: drawing.drawingId
      };
    });
    commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
      unitId: focusDrawings[0].unitId,
      subUnitId: focusDrawings[0].unitId,
      drawings: drawings2.map((drawing) => ({
        drawingId: drawing.drawingId,
        key: direction,
        value
      }))
    });
    const docSelectionRenderService = (_a = renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(DocSelectionRenderService);
    if (docSelectionRenderService) {
      docSelectionRenderService.blur();
    }
    transformer.refreshControls();
  }
  function handleHorizontalRelativeFromChange(value) {
    var _a, _b, _c;
    const prevRelativeFrom = hPosition.relativeFrom;
    const prevPosOffset = hPosition.posOffset;
    const relativeFrom = Number(value);
    if (prevRelativeFrom === relativeFrom) {
      return;
    }
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const drawingId = focusDrawings[0].drawingId;
    const unitId2 = focusDrawings[0].unitId;
    let drawing = null;
    let pageMarginLeft = 0;
    const skeleton = (_a = renderManagerService.getRenderById(unitId2)) == null ? void 0 : _a.with(DocSkeletonManagerService).getSkeleton();
    const skeletonData = skeleton == null ? void 0 : skeleton.getSkeletonData();
    if (skeletonData == null) {
      return;
    }
    const { pages, skeHeaders, skeFooters } = skeletonData;
    for (const page of pages) {
      const { marginLeft, skeDrawings, headerId, footerId, pageWidth } = page;
      if (skeDrawings.has(drawingId)) {
        drawing = skeDrawings.get(drawingId);
        pageMarginLeft = marginLeft;
        break;
      }
      const headerPage = (_b = skeHeaders.get(headerId)) == null ? void 0 : _b.get(pageWidth);
      if (headerPage == null ? void 0 : headerPage.skeDrawings.has(drawingId)) {
        drawing = headerPage == null ? void 0 : headerPage.skeDrawings.get(drawingId);
        pageMarginLeft = marginLeft;
        break;
      }
      const footerPage = (_c = skeFooters.get(footerId)) == null ? void 0 : _c.get(pageWidth);
      if (footerPage == null ? void 0 : footerPage.skeDrawings.has(drawingId)) {
        drawing = footerPage == null ? void 0 : footerPage.skeDrawings.get(drawingId);
        pageMarginLeft = marginLeft;
        break;
      }
    }
    if (drawing == null) {
      return;
    }
    let delta = 0;
    if (prevRelativeFrom === 1 /* COLUMN */) {
      delta -= drawing.columnLeft;
    } else if (prevRelativeFrom === 3 /* MARGIN */) {
      delta -= pageMarginLeft;
    }
    if (relativeFrom === 1 /* COLUMN */) {
      delta += drawing.columnLeft;
    } else if (relativeFrom === 3 /* MARGIN */) {
      delta += pageMarginLeft;
    } else if (relativeFrom === 0 /* PAGE */) {
    }
    const newPositionH = {
      relativeFrom,
      posOffset: (prevPosOffset != null ? prevPosOffset : 0) - delta
    };
    handlePositionChange("positionH", newPositionH);
  }
  function handleVerticalRelativeFromChange(value) {
    var _a, _b, _c, _d, _e, _f;
    const prevRelativeFrom = vPosition.relativeFrom;
    const prevPosOffset = vPosition.posOffset;
    const relativeFrom = Number(value);
    if (prevRelativeFrom === relativeFrom) {
      return;
    }
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const { drawingId, unitId: unitId2 } = focusDrawings[0];
    const documentDataModel2 = univerInstanceService.getUniverDocInstance(unitId2);
    const skeleton = (_a = renderManagerService.getRenderById(unitId2)) == null ? void 0 : _a.with(DocSkeletonManagerService).getSkeleton();
    const docSelectionRenderService = (_b = renderManagerService.getRenderById(unitId2)) == null ? void 0 : _b.with(DocSelectionRenderService);
    const segmentId = docSelectionRenderService == null ? void 0 : docSelectionRenderService.getSegment();
    const segmentPage = docSelectionRenderService == null ? void 0 : docSelectionRenderService.getSegmentPage();
    const drawing = (_d = (_c = documentDataModel2 == null ? void 0 : documentDataModel2.getSelfOrHeaderFooterModel(segmentId).getBody()) == null ? void 0 : _c.customBlocks) == null ? void 0 : _d.find((c) => c.blockId === drawingId);
    if (drawing == null || skeleton == null || docSelectionRenderService == null) {
      return;
    }
    const { startIndex } = drawing;
    const glyph = skeleton.findNodeByCharIndex(startIndex, segmentId, segmentPage);
    const line = (_e = glyph == null ? void 0 : glyph.parent) == null ? void 0 : _e.parent;
    const column = line == null ? void 0 : line.parent;
    const paragraphStartLine = column == null ? void 0 : column.lines.find((l) => l.paragraphIndex === (line == null ? void 0 : line.paragraphIndex) && l.paragraphStart);
    const page = (_f = column == null ? void 0 : column.parent) == null ? void 0 : _f.parent;
    if (glyph == null || line == null || paragraphStartLine == null || column == null || page == null) {
      return;
    }
    let delta = 0;
    if (prevRelativeFrom === 1 /* PARAGRAPH */) {
      delta -= paragraphStartLine.top;
    } else if (prevRelativeFrom === 2 /* LINE */) {
      delta -= line.top;
    } else if (prevRelativeFrom === 0 /* PAGE */) {
      delta += page.marginTop;
    }
    if (relativeFrom === 1 /* PARAGRAPH */) {
      delta += paragraphStartLine.top;
    } else if (relativeFrom === 2 /* LINE */) {
      delta += line.top;
    } else if (relativeFrom === 0 /* PAGE */) {
      delta -= page.marginTop;
    }
    const newPositionV = {
      relativeFrom,
      posOffset: (prevPosOffset != null ? prevPosOffset : 0) - delta
    };
    handlePositionChange("positionV", newPositionV);
  }
  function updateState(drawingParam2) {
    var _a;
    const snapshot = documentDataModel == null ? void 0 : documentDataModel.getSnapshot();
    const drawing = (_a = snapshot == null ? void 0 : snapshot.drawings) == null ? void 0 : _a[drawingParam2.drawingId];
    if (drawing == null) {
      return;
    }
    const { layoutType } = drawing;
    const {
      positionH,
      positionV
    } = drawing.docTransform;
    setHPosition(positionH);
    setVPosition(positionV);
    setDisabled(layoutType === 0 /* INLINE */);
    setFollowTextMove(positionV.relativeFrom === 1 /* PARAGRAPH */ || positionV.relativeFrom === 2 /* LINE */);
  }
  function updateFocusDrawingState() {
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    updateState(focusDrawings[0]);
  }
  function handleFollowTextMoveCheck(val) {
    setFollowTextMove(val);
    handleVerticalRelativeFromChange(val ? String(1 /* PARAGRAPH */) : String(0 /* PAGE */));
  }
  (0, import_react2.useEffect)(() => {
    updateFocusDrawingState();
    const subscription = drawingManagerService.focus$.subscribe((drawingParams) => {
      if (drawingParams.length === 0) {
        setShowPanel(false);
        return;
      }
      setShowPanel(true);
      updateState(drawingParams[0]);
    });
    const mutationListener = commandService.onCommandExecuted(async (command) => {
      if (command.id === RichTextEditingMutation.id) {
        updateFocusDrawingState();
      }
    });
    return () => {
      subscription.unsubscribe();
      mutationListener.dispose();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !showPanel
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("docs-drawing-ui.image-position.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("docs-drawing-ui.image-position.horizontal") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-2 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("docs-drawing-ui.image-position.absolutePosition") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  InputNumber,
                  {
                    min: MIN_OFFSET,
                    max: MAX_OFFSET,
                    precision: 1,
                    disabled,
                    value: hPosition.posOffset,
                    onChange: (val) => {
                      handlePositionChange("positionH", {
                        relativeFrom: hPosition.relativeFrom,
                        posOffset: val
                      });
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("docs-drawing-ui.image-position.toTheRightOf") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  Select,
                  {
                    value: String(hPosition.relativeFrom),
                    disabled,
                    options: HORIZONTAL_RELATIVE_FROM,
                    onChange: handleHorizontalRelativeFromChange
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("docs-drawing-ui.image-position.vertical") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-2 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("docs-drawing-ui.image-position.absolutePosition") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  InputNumber,
                  {
                    min: MIN_OFFSET,
                    max: MAX_OFFSET,
                    precision: 1,
                    disabled,
                    value: vPosition.posOffset,
                    onChange: (val) => {
                      handlePositionChange("positionV", {
                        relativeFrom: vPosition.relativeFrom,
                        posOffset: val
                      });
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("docs-drawing-ui.image-position.bellow") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  Select,
                  {
                    disabled,
                    value: String(vPosition.relativeFrom),
                    options: VERTICAL_RELATIVE_FROM,
                    onChange: handleVerticalRelativeFromChange
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("docs-drawing-ui.image-position.options") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          Checkbox,
          {
            disabled,
            checked: followTextMove,
            onChange: handleFollowTextMoveCheck,
            children: localeService.t("docs-drawing-ui.image-position.moveObjectWithText")
          }
        ) })
      ]
    }
  );
};

// ../packages/docs-drawing-ui/src/views/doc-image-panel/DocDrawingTextWrap.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var MIN_MARGIN = 0;
var MAX_MARGIN = 100;
var DocDrawingTextWrap = (props) => {
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const drawingManagerService = useDependency(IDrawingManagerService);
  const renderManagerService = useDependency(IRenderManagerService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const { drawings } = props;
  const drawingParam = drawings[0];
  if (drawingParam == null) {
    return null;
  }
  const { unitId } = drawingParam;
  const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
  const renderObject = renderManagerService.getRenderById(unitId);
  const scene = renderObject == null ? void 0 : renderObject.scene;
  if (scene == null) {
    return null;
  }
  const [disableWrapText, setDisableWrapText] = (0, import_react3.useState)(true);
  const [disableDistTB, setDisableDistTB] = (0, import_react3.useState)(true);
  const [disableDistLR, setDisableDistLR] = (0, import_react3.useState)(true);
  const [wrappingStyle, setWrappingStyle] = (0, import_react3.useState)("inline" /* INLINE */);
  const [wrapText, setWrapText] = (0, import_react3.useState)("");
  const [distToText, setDistToText] = (0, import_react3.useState)({
    distT: 0,
    distL: 0,
    distB: 0,
    distR: 0
  });
  const [showPanel, setShowPanel] = (0, import_react3.useState)(true);
  function handleWrappingStyleChange(value) {
    setWrappingStyle(value);
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const { unitId: unitId2, subUnitId } = focusDrawings[0];
    const drawings2 = focusDrawings.map(({ unitId: unitId3, subUnitId: subUnitId2, drawingId }) => ({
      unitId: unitId3,
      subUnitId: subUnitId2,
      drawingId
    }));
    commandService.executeCommand(UpdateDocDrawingWrappingStyleCommand.id, {
      unitId: unitId2,
      subUnitId,
      drawings: drawings2,
      wrappingStyle: value
    });
  }
  function handleWrapTextChange(value) {
    setWrapText(value);
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const drawings2 = focusDrawings.map((drawing) => {
      return {
        unitId: drawing.unitId,
        subUnitId: drawing.subUnitId,
        drawingId: drawing.drawingId
      };
    });
    commandService.executeCommand(UpdateDocDrawingWrapTextCommand.id, {
      unitId: focusDrawings[0].unitId,
      subUnitId: focusDrawings[0].unitId,
      drawings: drawings2,
      wrapText: value
    });
  }
  function handleDistToTextChange(value, direction) {
    if (value == null) {
      return;
    }
    const newDistToText = { ...distToText, [direction]: value };
    setDistToText(newDistToText);
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    const drawings2 = focusDrawings.map((drawing) => {
      return {
        unitId: drawing.unitId,
        subUnitId: drawing.subUnitId,
        drawingId: drawing.drawingId
      };
    });
    commandService.executeCommand(UpdateDocDrawingDistanceCommand.id, {
      unitId: focusDrawings[0].unitId,
      subUnitId: focusDrawings[0].unitId,
      drawings: drawings2,
      dist: {
        [direction]: value
      }
    });
  }
  function updateFocusDrawingState() {
    const focusDrawings = drawingManagerService.getFocusDrawings();
    if (focusDrawings.length === 0) {
      return;
    }
    updateState(focusDrawings[0]);
  }
  function updateState(drawingParam2) {
    var _a, _b;
    const drawing = (_b = (_a = documentDataModel == null ? void 0 : documentDataModel.getSnapshot()) == null ? void 0 : _a.drawings) == null ? void 0 : _b[drawingParam2.drawingId];
    if (drawing == null) {
      return;
    }
    const {
      distT = 0,
      distL = 0,
      distB = 0,
      distR = 0,
      layoutType = 0 /* INLINE */,
      behindDoc = 0 /* FALSE */,
      wrapText: wrapText2 = 0 /* BOTH_SIDES */
    } = drawing;
    const distToText2 = {
      distT,
      distL,
      distB,
      distR
    };
    setDistToText(distToText2);
    setWrapText(wrapText2);
    setDisableWrapText(layoutType !== 3 /* WRAP_SQUARE */);
    if (layoutType === 1 /* WRAP_NONE */ || layoutType === 0 /* INLINE */) {
      setDisableDistTB(true);
    } else {
      setDisableDistTB(false);
    }
    if (layoutType === 1 /* WRAP_NONE */ || layoutType === 0 /* INLINE */ || layoutType === 6 /* WRAP_TOP_AND_BOTTOM */) {
      setDisableDistLR(true);
    } else {
      setDisableDistLR(false);
    }
    if (layoutType === 1 /* WRAP_NONE */) {
      if (behindDoc === 1 /* TRUE */) {
        setWrappingStyle("behindText" /* BEHIND_TEXT */);
      } else {
        setWrappingStyle("inFrontOfText" /* IN_FRONT_OF_TEXT */);
      }
    } else {
      switch (layoutType) {
        case 0 /* INLINE */:
          setWrappingStyle("inline" /* INLINE */);
          break;
        case 3 /* WRAP_SQUARE */:
          setWrappingStyle("wrapSquare" /* WRAP_SQUARE */);
          break;
        case 6 /* WRAP_TOP_AND_BOTTOM */:
          setWrappingStyle("wrapTopAndBottom" /* WRAP_TOP_AND_BOTTOM */);
          break;
        default:
          throw new Error(`Unsupported layout type: ${layoutType}`);
      }
    }
  }
  (0, import_react3.useEffect)(() => {
    updateFocusDrawingState();
    const subscription = drawingManagerService.focus$.subscribe((drawingParams) => {
      if (drawingParams.length === 0) {
        setShowPanel(false);
        return;
      }
      setShowPanel(true);
      updateState(drawingParams[0]);
    });
    const mutationListener = commandService.onCommandExecuted(async (command) => {
      if (command.id === RichTextEditingMutation.id) {
        updateFocusDrawingState();
      }
    });
    return () => {
      subscription.unsubscribe();
      mutationListener.dispose();
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", {
        "univer-hidden": !showPanel
      }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: localeService.t("docs-drawing-ui.image-text-wrap.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: localeService.t("docs-drawing-ui.image-text-wrap.wrappingStyle") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(RadioGroup, { value: wrappingStyle, onChange: handleWrappingStyleChange, direction: "vertical", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "inline" /* INLINE */, children: localeService.t("docs-drawing-ui.image-text-wrap.inline") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "wrapSquare" /* WRAP_SQUARE */, children: localeService.t("docs-drawing-ui.image-text-wrap.square") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "wrapTopAndBottom" /* WRAP_TOP_AND_BOTTOM */, children: localeService.t("docs-drawing-ui.image-text-wrap.topAndBottom") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "behindText" /* BEHIND_TEXT */, children: localeService.t("docs-drawing-ui.image-text-wrap.behindText") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "inFrontOfText" /* IN_FRONT_OF_TEXT */, children: localeService.t("docs-drawing-ui.image-text-wrap.inFrontText") })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: localeService.t("docs-drawing-ui.image-text-wrap.wrapText") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(RadioGroup, { disabled: disableWrapText, value: wrapText, onChange: handleWrapTextChange, direction: "horizontal", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: 0 /* BOTH_SIDES */, children: localeService.t("docs-drawing-ui.image-text-wrap.bothSide") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: 1 /* LEFT */, children: localeService.t("docs-drawing-ui.image-text-wrap.leftOnly") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: 2 /* RIGHT */, children: localeService.t("docs-drawing-ui.image-text-wrap.rightOnly") })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "div",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: localeService.t("docs-drawing-ui.image-text-wrap.distanceFromText") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-2 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("docs-drawing-ui.image-text-wrap.top") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  InputNumber,
                  {
                    min: MIN_MARGIN,
                    max: MAX_MARGIN,
                    disabled: disableDistTB,
                    precision: 1,
                    value: distToText.distT,
                    onChange: (val) => {
                      handleDistToTextChange(val, "distT");
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("docs-drawing-ui.image-text-wrap.left") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  InputNumber,
                  {
                    min: MIN_MARGIN,
                    max: MAX_MARGIN,
                    disabled: disableDistLR,
                    precision: 1,
                    value: distToText.distL,
                    onChange: (val) => {
                      handleDistToTextChange(val, "distL");
                    }
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-2 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("docs-drawing-ui.image-text-wrap.bottom") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  InputNumber,
                  {
                    min: MIN_MARGIN,
                    max: MAX_MARGIN,
                    disabled: disableDistTB,
                    precision: 1,
                    value: distToText.distB,
                    onChange: (val) => {
                      handleDistToTextChange(val, "distB");
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: localeService.t("docs-drawing-ui.image-text-wrap.right") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  InputNumber,
                  {
                    min: MIN_MARGIN,
                    max: MAX_MARGIN,
                    disabled: disableDistLR,
                    precision: 1,
                    value: distToText.distR,
                    onChange: (val) => {
                      handleDistToTextChange(val, "distR");
                    }
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

// ../packages/docs-drawing-ui/src/views/doc-image-panel/DocDrawingPanel.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var DocDrawingPanel = () => {
  const drawingManagerService = useDependency(IDrawingManagerService);
  const focusDrawings = drawingManagerService.getFocusDrawings();
  const [drawings, setDrawings] = (0, import_react4.useState)(focusDrawings);
  (0, import_react4.useEffect)(() => {
    const focusDispose = drawingManagerService.focus$.subscribe((drawings2) => {
      setDrawings(drawings2);
    });
    return () => {
      focusDispose.unsubscribe();
    };
  }, []);
  return !!(drawings == null ? void 0 : drawings.length) && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "univer-text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DrawingCommonPanel, { drawings, hasAlign: false, hasCropper: true, hasGroup: false, hasTransform: false }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DocDrawingTextWrap, { drawings }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DocDrawingPosition, { drawings })
  ] });
};

// ../packages/docs-drawing-ui/src/controllers/shortcuts/drawing.shortcut.ts
function whenDocDrawingFocused(contextService) {
  return contextService.getContextValue(FOCUSING_DOC) && contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && contextService.getContextValue(FOCUSING_COMMON_DRAWINGS);
}
var MoveDrawingDownShortcutItem = {
  id: MoveDocDrawingsCommand.id,
  description: "docs-drawing-ui.shortcut.drawing-move-down",
  group: "4_drawing-view",
  groupTitle: "docs-drawing-ui.shortcut.drawing-view",
  binding: 40 /* ARROW_DOWN */,
  priority: 100,
  preconditions: whenDocDrawingFocused,
  staticParameters: {
    direction: 2 /* DOWN */
  }
};
var MoveDrawingUpShortcutItem = {
  id: MoveDocDrawingsCommand.id,
  description: "docs-drawing-ui.shortcut.drawing-move-up",
  group: "4_drawing-view",
  groupTitle: "docs-drawing-ui.shortcut.drawing-view",
  binding: 38 /* ARROW_UP */,
  priority: 100,
  preconditions: whenDocDrawingFocused,
  staticParameters: {
    direction: 0 /* UP */
  }
};
var MoveDrawingLeftShortcutItem = {
  id: MoveDocDrawingsCommand.id,
  description: "docs-drawing-ui.shortcut.drawing-move-left",
  group: "4_drawing-view",
  groupTitle: "docs-drawing-ui.shortcut.drawing-view",
  binding: 37 /* ARROW_LEFT */,
  priority: 100,
  preconditions: whenDocDrawingFocused,
  staticParameters: {
    direction: 3 /* LEFT */
  }
};
var MoveDrawingRightShortcutItem = {
  id: MoveDocDrawingsCommand.id,
  description: "docs-drawing-ui.shortcut.drawing-move-right",
  group: "4_drawing-view",
  groupTitle: "docs-drawing-ui.shortcut.drawing-view",
  binding: 39 /* ARROW_RIGHT */,
  priority: 100,
  preconditions: whenDocDrawingFocused,
  staticParameters: {
    direction: 1 /* RIGHT */
  }
};
var DeleteDrawingsShortcutItem = {
  id: DeleteDocDrawingsCommand.id,
  description: "docs-drawing-ui.shortcut.drawing-delete",
  group: "4_drawing-view",
  groupTitle: "docs-drawing-ui.shortcut.drawing-view",
  // when focusing on any other input tag do not trigger this shortcut
  preconditions: whenDocDrawingFocused,
  binding: 46 /* DELETE */,
  mac: 8 /* BACKSPACE */
};

// ../packages/docs-drawing-ui/src/controllers/doc-drawing.controller.ts
var DocDrawingUIController = class extends Disposable {
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
    this.disposeWithMe(componentManager.register(COMPONENT_DOC_DRAWING_PANEL, DocDrawingPanel));
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initCommands() {
    [
      InsertDocImageCommand,
      InsertDocDrawingCommand,
      UpdateDocDrawingWrappingStyleCommand,
      UpdateDocDrawingDistanceCommand,
      UpdateDocDrawingWrapTextCommand,
      UpdateDrawingDocTransformCommand,
      IMoveInlineDrawingCommand,
      ITransformNonInlineDrawingCommand,
      RemoveDocDrawingCommand,
      SidebarDocDrawingOperation,
      ClearDocDrawingTransformerOperation,
      EditDocDrawingOperation,
      GroupDocDrawingCommand,
      UngroupDocDrawingCommand,
      MoveDocDrawingsCommand,
      DeleteDocDrawingsCommand,
      SetDocDrawingArrangeCommand
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
DocDrawingUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IShortcutService)
], DocDrawingUIController);

// ../packages/docs-drawing-ui/src/menu/drawing-popup-menu.controller.ts
var DocDrawingPopupMenuController = class extends RxDisposable {
  constructor(_drawingManagerService, _canvasPopManagerService, _renderManagerService, _univerInstanceService, _contextService, _commandService) {
    super();
    __publicField(this, "_drawingManagerService", _drawingManagerService);
    __publicField(this, "_canvasPopManagerService", _canvasPopManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_initImagePopupMenu", /* @__PURE__ */ new Set());
    __publicField(this, "_disposePopups", []);
    __publicField(this, "_isDrawingPanelOpen", false);
    this._init();
  }
  _init() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((command) => {
        if (command.id === EditDocDrawingOperation.id) {
          this._isDrawingPanelOpen = true;
          this._clearPopups();
        }
        if (command.id === SidebarDocDrawingOperation.id) {
          const params = command.params;
          this._isDrawingPanelOpen = (params == null ? void 0 : params.value) === "open";
          if (this._isDrawingPanelOpen) {
            this._clearPopups();
          }
        }
      })
    );
    this.disposeWithMe(
      this._drawingManagerService.focus$.subscribe((params) => {
        if (params.length === 0) {
          this._isDrawingPanelOpen = false;
        }
      })
    );
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._create(documentDataModel))
    );
    this.disposeWithMe(
      this._univerInstanceService.getTypeOfUnitDisposed$(1 /* UNIVER_DOC */).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._dispose(documentDataModel))
    );
    this._univerInstanceService.getAllUnitsForType(1 /* UNIVER_DOC */).forEach((documentDataModel) => this._create(documentDataModel));
  }
  _dispose(documentDataModel) {
    const unitId = documentDataModel.getUnitId();
    this._clearPopups();
    this._renderManagerService.removeRender(unitId);
  }
  _clearPopups() {
    this._disposePopups.forEach((dispose) => dispose.dispose());
    this._disposePopups.length = 0;
  }
  _create(documentDataModel) {
    if (!documentDataModel) {
      return;
    }
    const unitId = documentDataModel.getUnitId();
    if (isInternalEditorID(unitId)) {
      return;
    }
    if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
      this._popupMenuListener(unitId);
      this._initImagePopupMenu.add(unitId);
    }
  }
  _hasCropObject(scene) {
    const objects = scene.getAllObjects();
    for (const object of objects) {
      if (object instanceof ImageCropperObject) {
        return true;
      }
    }
    return false;
  }
  // eslint-disable-next-line max-lines-per-function
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
    const disposePopups = this._disposePopups;
    this.disposeWithMe(
      transformer.createControl$.subscribe(
        () => {
          if (this._hasCropObject(scene)) {
            return;
          }
          const selectedObjects = transformer.getSelectedObjectMap();
          disposePopups.forEach((dispose) => dispose.dispose());
          disposePopups.length = 0;
          if (this._isDrawingPanelOpen) {
            return;
          }
          if (selectedObjects.size > 1) {
            return;
          }
          const object = selectedObjects.values().next().value;
          if (!object) {
            return;
          }
          const oKey = object.oKey;
          const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
          if (!drawingParam || drawingParam.drawingType === 8 /* DRAWING_DOM */ || drawingParam.drawingType === 1 /* DRAWING_SHAPE */) {
            return;
          }
          const { unitId: unitId2, subUnitId, drawingId, drawingType } = drawingParam;
          const isImage = drawingType === 0 /* DRAWING_IMAGE */;
          const popup = this._canvasPopManagerService.attachPopupToObject(
            object,
            {
              componentKey: COMPONENT_IMAGE_POPUP_MENU,
              direction: isImage ? "top-center" : "horizontal",
              offset: isImage ? [0, 8] : [2, 0],
              extraProps: {
                menuItems: this._getImageMenuItems(unitId2, subUnitId, drawingId, drawingType),
                variant: isImage ? "doc-floating-toolbar" : void 0,
                unitId: unitId2,
                subUnitId,
                drawingId
              }
            },
            unitId2
          );
          disposePopups.push(this.disposeWithMe(popup));
          const focusDrawings = this._drawingManagerService.getFocusDrawings();
          const alreadyFocused = focusDrawings.find((drawing) => drawing.unitId === unitId2 && drawing.subUnitId === subUnitId && drawing.drawingId === drawingId);
          if (alreadyFocused) {
            return;
          }
          this._drawingManagerService.focusDrawing([{
            unitId: unitId2,
            subUnitId,
            drawingId
          }]);
        }
      )
    );
    this.disposeWithMe(
      transformer.clearControl$.subscribe(() => {
        disposePopups.forEach((dispose) => dispose.dispose());
        disposePopups.length = 0;
        this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
        this._drawingManagerService.focusDrawing(null);
      })
    );
    this.disposeWithMe(
      transformer.changing$.subscribe(
        () => {
          disposePopups.forEach((dispose) => dispose.dispose());
          disposePopups.length = 0;
        }
      )
    );
    this.disposeWithMe(
      transformer.changeStart$.subscribe(() => {
        disposePopups.forEach((dispose) => dispose.dispose());
        disposePopups.length = 0;
      })
    );
  }
  _getImageMenuItems(unitId, subUnitId, drawingId, drawingType) {
    return [
      {
        label: "docs-drawing-ui.image-popup.edit",
        index: 0,
        commandId: EditDocDrawingOperation.id,
        commandParams: { unitId, subUnitId, drawingId },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "docs-drawing-ui.image-popup.delete",
        index: 1,
        commandId: RemoveDocDrawingCommand.id,
        commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
        disable: false
      },
      {
        label: "docs-drawing-ui.image-popup.crop",
        index: 2,
        commandId: OpenImageCropOperation.id,
        commandParams: { unitId, subUnitId, drawingId },
        disable: drawingType === 8 /* DRAWING_DOM */
      },
      {
        label: "docs-drawing-ui.image-popup.reset",
        index: 3,
        commandId: ImageResetSizeOperation.id,
        commandParams: [{ unitId, subUnitId, drawingId }],
        disable: true
        // TODO: @JOCS, feature is not ready.
      }
    ];
  }
};
DocDrawingPopupMenuController = __decorateClass([
  __decorateParam(0, IDrawingManagerService),
  __decorateParam(1, Inject(DocCanvasPopManagerService)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService),
  __decorateParam(4, IContextService),
  __decorateParam(5, ICommandService)
], DocDrawingPopupMenuController);

// ../packages/docs-drawing-ui/src/plugin.ts
var UniverDocsDrawingUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _renderManagerSrv, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_configService", _configService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(DOCS_DRAWING_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const dependencies = [
      [DocDrawingUIController],
      [DocDrawingPopupMenuController],
      [DocDrawingTransformerController],
      [DocDrawingAddRemoveController],
      [DocRefreshDrawingsService],
      [DocFloatDomController],
      [DocDrawingPrintingController]
    ];
    dependencies.forEach((dependency) => this._injector.add(dependency));
  }
  onReady() {
    [
      [DocDrawingUpdateRenderController],
      [DocDrawingTransformUpdateController]
    ].forEach((m) => this._renderManagerSrv.registerRenderModule(1 /* UNIVER_DOC */, m));
    this._injector.get(DocDrawingAddRemoveController);
    this._injector.get(DocDrawingUIController);
    this._injector.get(DocDrawingTransformerController);
    this._injector.get(DocDrawingPrintingController);
  }
  onRendered() {
    this._injector.get(DocDrawingPopupMenuController);
    this._injector.get(DocFloatDomController);
  }
};
__publicField(UniverDocsDrawingUIPlugin, "type", 1 /* UNIVER_DOC */);
__publicField(UniverDocsDrawingUIPlugin, "pluginName", "DOC_DRAWING_UI_PLUGIN");
__publicField(UniverDocsDrawingUIPlugin, "packageName", package_default.name);
__publicField(UniverDocsDrawingUIPlugin, "version", package_default.version);
UniverDocsDrawingUIPlugin = __decorateClass([
  DependentOn(UniverDrawingUIPlugin, UniverDrawingPlugin, UniverDocsDrawingPlugin, UniverUIPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService)
], UniverDocsDrawingUIPlugin);

// ../common/debugger/package.json
var package_default2 = {
  name: "@univerjs/debugger",
  version: "0.25.2",
  private: true,
  description: "",
  author: "DreamNum <developer@univer.ai>",
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
  keywords: [],
  exports: {
    ".": "./src/index.ts",
    "./*": "./src/*"
  },
  main: "./src/index.ts",
  scripts: {
    typecheck: "tsc --noEmit"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/docs-drawing-ui": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/mockdata": "workspace:*",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-drawing-ui": "workspace:*",
    "@univerjs/themes": "workspace:*",
    "@univerjs/ui": "workspace:*",
    "@univerjs/watermark": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vue: "^3.5.34"
  }
};

// ../common/debugger/src/config/config.ts
var DEBUGGER_PLUGIN_CONFIG_KEY = "debugger.config";
var configSymbol2 = Symbol(DEBUGGER_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {
  fab: true,
  fabEntryUnitType: 2 /* UNIVER_SHEET */,
  performanceMonitor: {
    enabled: true
  }
};

// ../common/debugger/src/components/FloatButton.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var FloatButton = () => {
  const divStyle = {
    width: "100px",
    height: "30px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  };
  const clickHandler = () => {
    console.warn("click");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: divStyle, onClick: clickHandler, children: "FloatButton" });
};
var AIButton = () => {
  const divStyle = {
    width: "80px",
    height: "50px",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRadius: "25px",
    border: "none",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 50%, #00C9FF 100%)",
    backgroundSize: "200% auto",
    animation: "gradient 3s linear infinite",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 20px rgba(0, 201, 255, 0.3)"
    }
  };
  const clickHandler = () => {
    console.warn("click");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { type: "button", style: divStyle, onClick: clickHandler, children: [
    "AI",
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: `
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0, 201, 255, 0.3);
                    }
                ` })
  ] });
};

// ../common/debugger/src/components/Image.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEBUSExMWFhIVFhIXEhYYFRUWGBYYFRUWFhUWGBUYHyghGB4lGxYVJDEhJSktLi4uGh8zODMsNyktLisBCgoKDg0OGxAQGysgHSYrLS03Ky4tKzctKy8tNysvLS83LS0tLS0rLS0rLS0tLS0vLTItLTc1LS0tLS0tNS0tLf/AABEIASsAqAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xAA8EAACAQIEAggEAgoCAwEAAAAAAQIDEQQFEiExQQYTIjJRYXGRB4GhwUKxFCMzUmJygpLR4UPwFlPCFf/EABkBAQADAQEAAAAAAAAAAAAAAAABAwQFAv/EADERAQACAgEDAQQIBwEAAAAAAAABAgMRBBIhMQUTIjJRQWFxgZGxwdEUJDNSoeHwI//aAAwDAQACEQMRAD8A7iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQ+n3TupgMRTpRpRlF0+slqbTktbi4wtwasvHvIm+nU8asI5YG7rKUW0lFycN9Shq2vw89nY4Zm/SbFYpwoY2Fq1GU3GpOm6VWMZLS6bWyalZPh+FEwiX6DwudUZ4WOL1qNCUFPVLbSmuD809reJ9ybOsPioOdCoqkYvTK100+Nmmk1sfmfE59Wjhlg6c5dU5a+rW61KV9lx4q9vHfidw+FPRCeAw0pVp6q+IcZ1Eu7Cy7MF4tXd34+gnW9QRteAeKk7f9+pS+kXTejRm6VNSr1ucYq9vXkvmNEzpcq2IjFXk0jSnnMOSk/kl+bKDHpRiZbywclH+GS1L8vzJDC5vGotUbu3ei1acfW/H5+5m5Fc+t4ph6pfHv3lr/8A2o/uS+hlp5xTfG8fVf4uV/D1FOyju3yPmOxNOku3JX8Lo5mDkc3JMxWN6+cNN64qx3W2lWjJXi0/RmQ59h8+pN9iSv4xnv8AcsmV5/GTUZvd8G9vf/J1aXyR/Urr648M09M/DKdABcgAILPel2DwlSFOvVUZz02Vm9Kk7Jyt3Vfx8wJ0AAAAAAAAgulnRTD4+l1dZNSX7OpGynB+Ta3XinsToA/Lue5K8LXr4aEnUq0aqSmovXJaYyi7Ju20l7H6C6B4+vWy+jUxEHCrps7uLc0tlPZu11ye9zPn2Ag0p6VqTabsr9rz+SMHRis4wqUrX6uTlBeUt7f3avcxfxcxyfYWjtrcSu9lHs+uPKO6fZ1PDYKpOO9ScnGn6ylpgiP6CdFYQpqc+1J7yb4zlzbZpdO6kquBjUa7VKpTnUXgozvL2T+hduj9WLw9Nx4OKfub/oZfMsWcZvhcIoqrJRv3UoSk/aKdjQrUsPiKaxFBxls7SjztxjJfZ8DnfxL/AEn9MnSlU0QlUVSlrk4wlFwhG8ZcLxas1x9y19AMLKFCrJ/s6k46G7rXpgozqpPgm1bz03Kq5N26Xua9tsOY508JQm0u03ZW4tvZRXqzRyPohUxT63Eycm97Pux8ox5+prZ/aeIw6fddacvmovT+Zv8AxAzd0ofo0YyShTpTTjOUb6taepR7y2RbM9MPFK9Up2p0Bwum2l35NWTXpsRtfKJ4d2cnOn+GT70fJvn6mP4YZrWm3Sm24Ok6kYybbg4zUNm99Mk728UW3N6acWmRW3U9ZMfT2fejWaa49XJ9pLbztxX3JDPHW/Rq36Pbr+rqdTf9/S9P1scozLNpYacMTvppapTinZy3p7W57X9zrmCx9OrRhXhJOlOEakZctMo6k/LY8xXp7Ji3VDhHQf4m4nD16sMX1lSnZpwm/wBZTqx5drgnwa5EDUxSx+ZRqYuqqdGc3Vry7VlCHdpwSTd2kor3MPxOz2hjMxqYjDx0wSjDWn+2cLrrbW28Fxuopm50F+HuKzGUZy1UcLZXqtbzXJUovvfzcF58D39HdGnbejvT/BYzEfo1GU+s0SnHVDSpRja9vDitnYtZWeiXQXBZfeVCDdVrTKrOWqbWzaT4RV0tklwLMeXoAAAAAAABgx1PVTkvLb1W6Kth8T1VfVylCUfna8fqrfMuBS86tTqb8FJ+3FfQ43qlLxemTHHfx/3+WvjWr3rbwx4mg2nspXVpRfCS8Nzz0YxaoQ6m94RfYT2lBfuu/G3jxNuLTV1wZG5hSXC0W+Slxt5NNMp4PqcY6+zy7+1GXjTa3VRZ62OpuPas1x3St67lczvPU4yjTa2T1zbtCEebcnwIWtflSjf+KdVr+3UvzIbMcvq1lpqSvBbqnFKMF56Vxfm7s6F/VOPWPdnauvDy2nv2bE5xxFGM6VRTtPVSnZxWuHGLT3js3x5NMulfKsNmFKnOpqjVgrKUXpnG/ei+Kkr8ndcyi5Tlc6EnoV4yt1kH3ZW4ejV3ZonqGIcO7UcP4aie3pOKafzse8PPw546ZnU/KXnJxsmGd18LflOU0cLGWjU5StrnOWqUrcFfgkt9kkt2+ZG5/majFpO8ntFLjvsQ2Jzidt61L+mTm/7Yps0YycndXbfGctnvxUI/h9Xv4WLsmfDgruZj7IVxTJlt9P2q1n+Fq1OuhsrRhGN77yc9dTdK1laMf6WdM6KY6WFyTDyqpKcKahFJ31NScKe/mkm/Dcrjw6saGLzd1Y0cNF9jDp6/Oo27+0Wl6tnLj1O94tOtduzbHErXUfi163w3pZhWlKEnQm1KdWcYpxcpX/Bsrtt8Lczs+Dw8adOFOO0YRjGPpFJL8iM6K5f1WHV1259qX/yvb82TJ0eHW9cMRedyz5pibzoABpVAAAAAAAABVemWG2cl4J+2z+li1ERny7vz+xm5V/Z09p/bMS9Vr1e781UyPGXWh/0/dEJ8RsRiMLBY3DQpycYypVtcNemE2mprdWtJcfM3cVT6mrtwlvF8k+X+Ccw9aNWm4ySaacZxdnx4prmjlcnHGDNXk4u9Ld/3hdhvN6zjt8Udv9uOYf4o1NCjUwtOU0ra4TnTv5uLUlf0sSOD+JmH0rrKNWM7drTonG/k9Sdvkb2dfCWm6jnh6mmD36qT7v8ALLw8n7lXx/w0xke5By+cX9zXFuFmjc6/KVla5o+GVny74lYOd+sUqVn2dUJSuuT7F7Py+pvf+cZfOWnr4ra+pwqKPpdx4nPqfw5zB/8ADb1lFfcnsm+FFRyUsVWjGPOFK8pPyc2ko/JMz5MXp1O8zH3TP7vXVyfH7LZlObUsTKfVdqENK6xd2Td20vNbe6JOVkZsLl9KhSjSpQUKcVsl9W3zb8SAz/HveEHZ23l4ehzMeGeVn6MFdR+TRbJGHH1ZJfcZnCjLRCzkuPgvLzfkbXQrKutxTuuy5uc/Rbv3e3zK/kWVSnPVLaC935f7OrdCMAoRqTS7zsvRbv6v6HbtxcGO9cFO9ondp/Rhpmy2iclu0T4j9VmR9AOmzgAAAAAAAAAAETnv4fn9iWIzPV2Ivz/Nf6MnOjeCyzF8cKzmtBSpu/FJtHP8rx9dv9cmql7LbTslvez3SeyfP8uh5i/1U/Qp0qNm342+duC8vQeg7thtE+Iln9RmK3jXmYe1mE4LvterPlbOavFVHa37zf3MVu007cFtf15H1YGm76kk/OP3sducGK3msT90OdGS8eLSVM+rWvqu/cxrO621n67X28DXrYOG9or2X0NOMktfBdrZXSXdjtZedzx/AcW3nHX8Ie45GWPFpZM66T1acYt76tW2ytbi2/G3BcXc9ZVhnUtJ91re/maFeipxatHezV1smn3lfnbYtOU0VGnFeC8b/U5/qMxwcMzgrFeqddobuL/M3j2kzOm9hoJJJHQuj9O2Hh5pv3bZz+B0nAU9NKEfCEV9Ecf0qJm9rS6PK8RDYAB22IAAAAAAAAAAArXTmc40aco3sqkVKztZST7T8bfcspq5nglWpSpvhJbPwa3T97ExET8UbhFt67eXMq+aSkpQvx2+SNTS7b2b/wC8TzmGFlQnKM7qor7Phbxj438TQeM8eBtwYceOP/OIiJ+TmZb3tPvztmrztulvdqz5mvPGS4aJP0advqJ4uDVtzzFxve/yu7mhXDFLESttB78G2kvzZ6oU2lZq7d22vO/I8SqxfFvnzMUqsbbP6cD1A91HpV3ZLwe7fyNiGZzjddnZpbJrkn4+Zp06sGrS3e139jXxMNUnPU4u1pbak7cOzdblOfj4s0RXJG4XYcl8czNZ1Kcp4+bmopyu1eNrcbpJcOLudnwGvqqfWftNEOstw1aVqt87nNvh1kEqs44morUob09ra5rml4L87eZ1E598WLHPTjjTdjte0bvOwAHlYAAAAAAAAAAAAAI3Osko4mOmpHdd2S2lH0f2OeZz8PMTC8qEo1VyTahP69l+51W55cj3TJavh4tjrby/NucYqeHn1WIpTpy8JRav5p815o0qedUV+PnzX+jonxn6SZbUoSwrqasXTkpQ0QctD/FCU+Cur7XdttjhVSqvBmqOR7vdT7Gu1yedULbSV/mYqmfQ4atvmVTaKg731xcrW4ducLcd+7f5k50Ljh542mq8koKSajJNqcl3YtrZK9nvs7W5k15HYnDC15DkeMxaUqGHqOD4VJWp0/VSnbUv5UzovR34bRi1PGTVSX/qhdQ/qk7OXpsvU3aeZS/eNmnjW+f1K75b2+pNa1haqajFJKySSSSskkuCS5HrWvErcMV5meGIM/St6k7rXiNa8SIjWM0apGk9SS1C5oxqGSMhpO22DFBsEJZQAAAAAAAeJxNLGYWrKLUZpX8USACNOLZh8GcTVnKTxsNLlJpdQ7rU2+OsUfgRH8eLk3/DCMV9ztIJ2acZr/Aqnb9XiZRkuDcVJfNNmrH4KYtNacXR2d0+pkmvPaR3ADZpTsH0PqRilKtdpK9o8fqb8OjNv+R+xYgT1SjohC08gS/G/Y2KeUQXFtkkCNynphrQwMFyMypR8EewQnTzoXgfbH0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2Q==";
var ImageDemo = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("img", { className: "univer-size-full", draggable: false, src: image });
};

// ../common/debugger/src/components/RangeLoading.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var RangeLoading = () => {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      className: clsx(`univer-flex univer-size-full univer-origin-top-left univer-items-center univer-justify-center univer-bg-white dark:!univer-bg-gray-900`, borderClassName),
      children: "Loading..."
    }
  );
};

// ../common/debugger/src/views/use-cell-content.ts
function useCellContent(fabEntryUnitType) {
  const logService = useDependency(ILogService);
  const selectionManagerService = fabEntryUnitType === 2 /* UNIVER_SHEET */ ? useDependency(SheetsSelectionsService) : null;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const onSelect = () => {
    if (!selectionManagerService) return;
    const selections = selectionManagerService.getCurrentSelections();
    const target = getSheetCommandTarget(univerInstanceService);
    const matrix = new ObjectMatrix();
    selections.forEach((selection) => {
      Range.foreach(selection.range, (row, col) => {
        matrix.setValue(row, col, target == null ? void 0 : target.worksheet.getCell(row, col));
      });
    });
    logService.debug("cell-content", matrix);
  };
  return {
    type: "item",
    children: "\u{1F5D2}\uFE0F Console cell content",
    onSelect
  };
}

// ../common/debugger/src/views/use-dark-mode.ts
var import_react5 = __toESM(require_react());
function useDarkMode() {
  const themeService = useDependency(ThemeService);
  (0, import_react5.useEffect)(() => {
    const darkMode = localStorage.getItem("local.darkMode");
    if (darkMode === "dark") {
      document.documentElement.classList.add("univer-dark");
      themeService.setDarkMode(true);
    } else if (darkMode === "system") {
      themeService.setDarkMode(false);
    }
  }, []);
  const onSelect = () => {
    const darkMode = themeService.darkMode ? "light" : "dark";
    themeService.setDarkMode(darkMode === "dark");
    localStorage.setItem("local.darkMode", darkMode);
  };
  return {
    type: "item",
    children: "\u{1F313} Toggle dark mode",
    onSelect
  };
}

// ../common/debugger/src/views/use-dialog.ts
var menu = [
  {
    label: "Open dialog",
    value: "dialog"
  },
  {
    label: "Draggable dialog",
    value: "draggable"
  },
  {
    label: "Open confirm",
    value: "confirm"
  }
];
function useDialog() {
  const dialogService = useDependency(IDialogService);
  const confirmService = useDependency(IConfirmService);
  const onSelect = (value) => {
    if (value === "draggable") {
      dialogService.open({
        id: "draggable",
        children: { title: "Draggable Dialog Content" },
        title: { title: "Draggable Dialog" },
        draggable: true,
        destroyOnClose: true,
        preservePositionOnDestroy: true,
        width: 350,
        onClose() {
        },
        onOpenChange(open) {
          if (!open) {
            dialogService.close("draggable");
          }
        }
      });
    } else if (value === "dialog") {
      dialogService.open({
        id: "dialog1",
        children: { title: "Dialog Content" },
        footer: { title: "Dialog Footer" },
        title: { title: "Dialog Title" },
        draggable: false,
        onClose() {
        },
        onOpenChange(open) {
          if (!open) {
            dialogService.close("dialog1");
          }
        }
      });
    } else if (value === "confirm") {
      confirmService.open({
        id: "confirm1",
        children: { title: "Confirm Content" },
        title: { title: "Confirm Title" },
        confirmText: "hello",
        cancelText: "world",
        onClose() {
          confirmService.close("confirm1");
        }
      });
      confirmService.open({
        id: "confirm2",
        children: { title: "Confirm2 Content" },
        title: { title: "Confirm2 Title" },
        onClose() {
          confirmService.close("confirm2");
        }
      });
    }
  };
  return {
    type: "subItem",
    children: "\u{1F4AC} Dialog & Confirm",
    options: menu.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-dispose.ts
var menu2 = [
  {
    label: "Dispose Univer",
    value: "univer"
  },
  {
    label: "Dispose current unit",
    value: "unit"
  }
];
function useDispose() {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const onSelect = (value) => {
    var _a;
    if (value === "univer") {
      (_a = window.univer) == null ? void 0 : _a.dispose();
      window.univer = void 0;
      window.univerAPI = void 0;
    } else if (value === "unit") {
      const focused = univerInstanceService.getFocusedUnit();
      if (!focused) return false;
      return univerInstanceService.disposeUnit(focused.getUnitId());
    }
  };
  return {
    type: "subItem",
    children: "\u{1F5D1}\uFE0F Dispose",
    options: menu2.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-editable.ts
var menu3 = [
  {
    label: "Change workbook editable",
    value: "univer"
  },
  {
    label: "Change worksheet editable",
    value: "sheet"
  }
];
function useEditable() {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const permissionService = useDependency(IPermissionService);
  const onSelect = (value) => {
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) {
      return false;
    }
    const { workbook, worksheet, unitId, subUnitId } = target;
    if (!workbook || !worksheet) {
      return false;
    }
    if (value === "sheet") {
      const editable = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id);
      permissionService.updatePermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id, !editable);
    } else {
      const unitId2 = workbook.getUnitId();
      const editable = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId2).id);
      permissionService.updatePermissionPoint(new WorkbookEditablePermission(unitId2).id, !editable);
    }
  };
  return {
    type: "subItem",
    children: "\u270D\uFE0F Editable",
    options: menu3.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-floating-dom.ts
function useFloatingDom(entryUnitType) {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const floatDomService = entryUnitType === 2 /* UNIVER_SHEET */ ? useDependency(SheetCanvasFloatDomManagerService) : null;
  const floatDomController = entryUnitType === 1 /* UNIVER_DOC */ ? useDependency(DocFloatDomController) : null;
  const onSelect = () => {
    if (entryUnitType === 2 /* UNIVER_SHEET */) {
      const currentSheet = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      if (!currentSheet) return;
      floatDomService == null ? void 0 : floatDomService.addFloatDomToPosition({
        allowTransform: true,
        initPosition: {
          startX: 200,
          endX: 400,
          startY: 200,
          endY: 400
        },
        componentKey: "ImageDemo",
        data: {
          aa: "128"
        }
      });
    } else if (entryUnitType === 1 /* UNIVER_DOC */) {
      const currentDoc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
      if (!currentDoc) return;
      floatDomController == null ? void 0 : floatDomController.insertFloatDom({
        allowTransform: true,
        componentKey: "ImageDemo",
        data: {
          aa: "128"
        }
      }, {
        height: 300
      });
    }
  };
  return {
    type: "item",
    children: "\u2601\uFE0F Create floating DOM",
    onSelect
  };
}

// ../common/debugger/src/views/use-locale.ts
var import_react6 = __toESM(require_react());
var locales = [
  {
    label: "English",
    value: "enUS" /* EN_US */
  },
  {
    label: "Fran\xE7ais",
    value: "frFR" /* FR_FR */
  },
  {
    label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    value: "ruRU" /* RU_RU */
  },
  {
    label: "Ti\u1EBFng Vi\u1EC7t",
    value: "viVN" /* VI_VN */
  },
  {
    label: "\u0641\u0627\u0631\u0633\u06CC",
    value: "faIR" /* FA_IR */
  },
  {
    label: "Espa\xF1ol",
    value: "esES" /* ES_ES */
  },
  {
    label: "Catal\xE0",
    value: "caES" /* CA_ES */
  },
  {
    label: "Sloven\u010Dina",
    value: "skSK" /* SK_SK */
  },
  {
    label: "\u7B80\u4F53\u4E2D\u6587",
    value: "zhCN" /* ZH_CN */
  },
  {
    label: "\u7E41\u9AD4\u4E2D\u6587\uFF08\u53F0\u7063\uFF09",
    value: "zhTW" /* ZH_TW */
  },
  {
    label: "\u7E41\u9AD4\u4E2D\u6587\uFF08\u9999\u6E2F\uFF09",
    value: "zhHK" /* ZH_HK */
  },
  {
    label: "\u65E5\u672C\u8A9E",
    value: "jaJP" /* JA_JP */
  },
  {
    label: "\uD55C\uAD6D\uC5B4",
    value: "koKR" /* KO_KR */
  },
  {
    label: "Portugu\xEAs (Brasil)",
    value: "ptBR" /* PT_BR */
  },
  {
    label: "Deutsch",
    value: "deDE" /* DE_DE */
  },
  {
    label: "Italiano",
    value: "itIT" /* IT_IT */
  },
  {
    label: "Bahasa Indonesia",
    value: "idID" /* ID_ID */
  },
  {
    label: "Polski",
    value: "plPL" /* PL_PL */
  },
  {
    label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    value: "arSA" /* AR_SA */
  }
];
function useLocale() {
  const localeService = useDependency(LocaleService);
  async function loadLocales(value) {
    let locales2;
    switch (value) {
      case "zhCN" /* ZH_CN */:
        locales2 = await import("./zh-CN-ZO2J3PAJ.js");
        break;
      case "zhTW" /* ZH_TW */:
        locales2 = await import("./zh-TW-OA6M6S6P.js");
        break;
      case "zhHK" /* ZH_HK */:
        locales2 = await import("./zh-HK-RL6F7ZDL.js");
        break;
      case "frFR" /* FR_FR */:
        locales2 = await import("./fr-FR-3FHOPZWU.js");
        break;
      case "ruRU" /* RU_RU */:
        locales2 = await import("./ru-RU-25DQAHHU.js");
        break;
      case "viVN" /* VI_VN */:
        locales2 = await import("./vi-VN-LT4XDEOH.js");
        break;
      case "jaJP" /* JA_JP */:
        locales2 = await import("./ja-JP-7GIDLPCG.js");
        break;
      case "faIR" /* FA_IR */:
        locales2 = await import("./fa-IR-KYNKLLUL.js");
        break;
      case "koKR" /* KO_KR */:
        locales2 = await import("./ko-KR-IQDATIXY.js");
        break;
      case "esES" /* ES_ES */:
        locales2 = await import("./es-ES-6I5MIDBJ.js");
        break;
      case "caES" /* CA_ES */:
        locales2 = await import("./ca-ES-MFVINBBZ.js");
        break;
      case "skSK" /* SK_SK */:
        locales2 = await import("./sk-SK-RB5KXRLK.js");
        break;
      case "ptBR" /* PT_BR */:
        locales2 = await import("./pt-BR-YZA7ABCW.js");
        break;
      case "deDE" /* DE_DE */:
        locales2 = await import("./de-DE-CNBEOM2G.js");
        break;
      case "itIT" /* IT_IT */:
        locales2 = await import("./it-IT-B73Q27QG.js");
        break;
      case "idID" /* ID_ID */:
        locales2 = await import("./id-ID-N3OSY4CO.js");
        break;
      case "plPL" /* PL_PL */:
        locales2 = await import("./pl-PL-V4S6ELWR.js");
        break;
      case "arSA" /* AR_SA */:
        locales2 = await import("./ar-SA-ZOC5QM5V.js");
        break;
      case "enUS" /* EN_US */:
      default:
        locales2 = await import("./en-US-2HFGVSM4.js");
        break;
    }
    localeService.load({
      [value]: locales2.default
    });
  }
  (0, import_react6.useEffect)(() => {
    const locale = localStorage.getItem("local.locale");
    if (locale) {
      loadLocales(locale).then(() => {
        localeService.setLocale(locale);
      });
    }
  }, []);
  const onSelect = async (value) => {
    await loadLocales(value);
    localeService.setLocale(value);
    localStorage.setItem("local.locale", value);
  };
  return {
    type: "subItem",
    children: "\u{1F310} Languages",
    options: locales.map((lang) => ({
      type: "radio",
      value: localeService.getCurrentLocale(),
      options: [{
        label: lang.label,
        value: lang.value
      }],
      onSelect
    }))
  };
}

// ../common/debugger/src/views/use-message.ts
var menu4 = [
  {
    label: "Open message",
    value: ""
  },
  {
    label: "Open loading message",
    value: "loading"
  }
];
function useMessage() {
  const messageService = useDependency(IMessageService);
  const onSelect = (value) => {
    if (value === "loading") {
      messageService.show({
        type: "loading" /* Loading */,
        content: "Loading message",
        duration: 3e3
      });
    } else {
      messageService.show({
        type: "success" /* Success */,
        content: "Demo message",
        duration: 1500
      });
    }
  };
  return {
    type: "subItem",
    children: "\u2709\uFE0F Message",
    options: menu4.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-notification.ts
var menu5 = [
  {
    label: "Notification success",
    value: "success"
  },
  {
    label: "Notification info",
    value: "info"
  },
  {
    label: "Notification warning",
    value: "warning"
  },
  {
    label: "Notification error",
    value: "error"
  }
];
function useNotification() {
  const notificationService = useDependency(INotificationService);
  const onSelect = (value) => {
    notificationService.show({
      type: value,
      content: "Lorem Ipusm dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      title: "Notification Title"
    });
  };
  return {
    type: "subItem",
    children: "\u{1F514} Notification",
    options: menu5.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-rtl.ts
var import_react7 = __toESM(require_react());
function useRTL() {
  const localeService = useDependency(LocaleService);
  (0, import_react7.useEffect)(() => {
    const dir = localStorage.getItem("local.direction");
    if (dir === "rtl" || dir === "ltr") {
      localeService.setDirection(dir);
    }
  }, [localeService]);
  const onSelect = () => {
    const current = localeService.getDirection();
    const nextDirection = current === "rtl" ? "ltr" : "rtl";
    localeService.setDirection(nextDirection);
    localStorage.setItem("local.direction", nextDirection);
  };
  return {
    type: "item",
    children: "\u2194\uFE0F Toggle RTL",
    onSelect
  };
}

// ../common/debugger/src/views/test-editor/component-name.ts
var TEST_EDITOR_CONTAINER_COMPONENT = "TestEditorContainer";

// ../common/debugger/src/views/use-sidebar.ts
var menu6 = [
  {
    label: "Open sidebar",
    value: "open"
  },
  {
    label: "Close sidebar",
    value: "close"
  }
];
function useSidebar() {
  const sidebarService = useDependency(ISidebarService);
  const onSelect = (value) => {
    if (value === "open") {
      sidebarService.open({
        header: { title: "Sidebar title" },
        children: { label: TEST_EDITOR_CONTAINER_COMPONENT },
        footer: { title: "Sidebar Footer" },
        onClose: () => {
        }
      });
    } else if (value === "close") {
      sidebarService.close();
    }
  };
  return {
    type: "subItem",
    children: "\u{1F9E9} Sidebar",
    options: menu6.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/controllers/local-save/record.controller.ts
var RecordController = class {
  constructor(_commandService) {
    __publicField(this, "_commandService", _commandService);
  }
  record() {
    return new Observable((subscribe) => {
      navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        subscribe.next({ type: "start" });
        const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm";
        const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
        const chunks = [];
        mediaRecorder.addEventListener("dataavailable", function(e) {
          chunks.push(e.data);
        });
        mediaRecorder.addEventListener("stop", function() {
          const blob = new Blob(chunks, { type: chunks[0].type });
          subscribe.next({ type: "finish", data: blob });
          subscribe.complete();
        });
        mediaRecorder.start();
      });
    });
  }
  startSaveCommands() {
    const result = [];
    const startTime = performance.now();
    const disposable = this._commandService.beforeCommandExecuted((commandInfo) => {
      try {
        result.push([
          String((performance.now() - startTime) / 1e3),
          commandInfo.id,
          String(commandInfo.type || 0 /* COMMAND */),
          JSON.stringify(commandInfo.params || "")
        ]);
      } catch (err) {
        console.error(`${commandInfo.id}  unable to serialize`);
        console.error(err);
      }
    });
    return () => {
      disposable.dispose();
      return result;
    };
  }
};
RecordController = __decorateClass([
  __decorateParam(0, Inject(ICommandService))
], RecordController);

// ../common/debugger/src/views/use-snapshot.ts
var menu7 = [
  {
    label: "Save workbook",
    value: "workbook"
  },
  {
    label: "Save worksheet",
    value: "sheet"
  },
  {
    label: "Record",
    value: "record"
  },
  {
    label: "Load snapshot",
    value: "load"
  }
];
var filterStyle = (workbookData) => {
  const sheets = workbookData.sheets;
  const cacheStyle = {};
  Object.keys(sheets).forEach((sheetId) => {
    const sheet = sheets[sheetId];
    new ObjectMatrix(sheet.cellData).forValue((_r, _c, value) => {
      const s = value == null ? void 0 : value.s;
      if (s && typeof s === "string") {
        const style = workbookData.styles[s];
        if (style) {
          cacheStyle[s] = style;
        }
      }
    });
  });
  workbookData.styles = cacheStyle;
  return workbookData;
};
function useSnapshot() {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const resourceLoaderService = useDependency(IResourceLoaderService);
  const localFileService = useDependency(ILocalFileService);
  const recordController = useDependency(RecordController);
  const onSelect = async (value) => {
    const preName = (/* @__PURE__ */ new Date()).toLocaleString();
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) {
      const doc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
      const snapshot2 = resourceLoaderService.saveUnit(doc.getUnitId());
      if (true) {
        const gitHash = "e07f2a0";
        const gitBranch = "v0.25.2";
        const buildTime = "2026-09-17T04:37:55.168Z";
        snapshot2.__env__ = { gitHash, gitBranch, buildTime };
      }
      const text = JSON.stringify(snapshot2, null, 2);
      localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
      return true;
    }
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) {
      return false;
    }
    const snapshot = resourceLoaderService.saveUnit(workbook.getUnitId());
    if (true) {
      const gitHash = "e07f2a0";
      const gitBranch = "v0.25.2";
      const buildTime = "2026-09-17T04:37:55.168Z";
      snapshot.__env__ = { gitHash, gitBranch, buildTime };
    }
    if (value === "sheet") {
      const sheetId = worksheet.getSheetId();
      const sheet = snapshot.sheets[sheetId];
      snapshot.sheets = { [sheetId]: sheet };
      snapshot.sheetOrder = [sheetId];
      const text = JSON.stringify(filterStyle(snapshot), null, 2);
      localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
    } else if (value === "workbook") {
      const text = JSON.stringify(filterStyle(snapshot), null, 2);
      localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
    } else if (value === "record") {
      let endCommands = () => [];
      recordController.record().subscribe((v) => {
        if (v.type === "start") {
          endCommands = recordController.startSaveCommands();
        }
        if (v.type === "finish") {
          const commands = endCommands();
          localFileService.downloadFile(v.data, `${preName} video.webm`);
          localFileService.downloadFile(new Blob([JSON.stringify(commands, null, 2)]), `${preName} commands.json`);
        }
      });
    } else if (value === "load") {
      const snapshotFile = await localFileService.openFile({ multiple: false, accept: ".json" });
      if (snapshotFile.length !== 1) return false;
      const text = await snapshotFile[0].text();
      univerInstanceService.createUnit(2 /* UNIVER_SHEET */, JSON.parse(text));
      return true;
    }
  };
  return {
    type: "subItem",
    children: "\u{1F4F7} Snapshot",
    options: menu7.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-theme.ts
var import_react8 = __toESM(require_react());
var themes = [
  {
    label: "\u{1F7E2}",
    value: green_default
  },
  {
    label: "\u{1F535}",
    value: default_default
  }
];
function useTheme() {
  const themeService = useDependency(ThemeService);
  (0, import_react8.useEffect)(() => {
    const themeKey = localStorage.getItem("local.theme");
    const theme = themes.find((theme2) => theme2.label === themeKey);
    if (theme) {
      themeService.setTheme(theme.value);
    }
  }, []);
  const onSelect = (value) => {
    localStorage.setItem("local.theme", value);
    const theme = themes.find((theme2) => theme2.label === value);
    if (theme) {
      themeService.setTheme(theme.value);
    }
  };
  return {
    type: "subItem",
    children: "\u{1F3A8} Themes",
    options: themes.map((theme) => ({
      type: "item",
      children: theme.label,
      onSelect: () => onSelect(theme.label)
    }))
  };
}

// ../common/debugger/src/views/use-units.ts
var import_react9 = __toESM(require_react());
var defaultMenu = [
  {
    label: "Create another sheet",
    value: "create"
  }
];
function useUnits() {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const [menu9, setMenu] = (0, import_react9.useState)([...defaultMenu]);
  const unitAdded = useObservable(univerInstanceService.unitAdded$);
  const unitDisposed = useObservable(univerInstanceService.unitDisposed$);
  (0, import_react9.useEffect)(() => {
    const sheets = univerInstanceService.getAllUnitsForType(2 /* UNIVER_SHEET */);
    const options = sheets.map((sheet) => ({
      label: sheet.getName() || sheet.getUnitId(),
      value: sheet.getUnitId()
    }));
    setMenu([
      ...defaultMenu,
      ...options
    ]);
  }, [unitAdded, unitDisposed]);
  const onSelect = (value) => {
    if (value === "create") {
      univerInstanceService.createUnit(2 /* UNIVER_SHEET */, {});
    } else {
      if (!univerInstanceService.getUnit(value)) return false;
      univerInstanceService.setCurrentUnitForType(value);
    }
  };
  return {
    type: "subItem",
    children: "\u{1FAB8} Units",
    options: menu9.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/use-user.ts
var menu8 = [
  {
    label: "Owner",
    value: 2 /* Owner */
  },
  {
    label: "Editor",
    value: 1 /* Editor */
  },
  {
    label: "Reader",
    value: 0 /* Reader */
  }
];
function useUser() {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const userManagerService = useDependency(UserManagerService);
  const permissionService = useDependency(IPermissionService);
  const onSelect = (value) => {
    userManagerService.setCurrentUser(createDefaultUser(value));
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const unitId = workbook.getUnitId();
    if (value === 2 /* Owner */) {
      permissionService.updatePermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id, true);
    } else {
      permissionService.updatePermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id, false);
    }
  };
  return {
    type: "subItem",
    children: "\u{1F465} Change user's role",
    options: menu8.map((item) => ({
      type: "item",
      children: item.label,
      onSelect: () => onSelect(item.value)
    }))
  };
}

// ../common/debugger/src/views/watermark/WatermarkPanel.tsx
var import_react10 = __toESM(require_react());

// ../common/debugger/src/views/watermark/WatermarkImageSetting.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime());
function WatermarkImageSetting({ config, onChange }) {
  const fileOpenService = useDependency(ILocalFileService);
  if (!config) return null;
  const handleUpdateImageUrl = async () => {
    const files = await fileOpenService.openFile({
      multiple: false,
      accept: WATERMARK_IMAGE_ALLOW_IMAGE_LIST.map((image2) => `.${image2.replace("image/", "")}`).join(",")
    });
    const fileLength = files.length;
    if (fileLength === 0) {
      return false;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      var _a;
      if ((_a = event.target) == null ? void 0 : _a.result) {
        const base64String = event.target.result;
        const img = new Image();
        img.onload = function() {
          onChange({ ...config, url: base64String, width: Math.max(20, img.width), height: Math.max(img.height, 20), originRatio: img.width / img.height });
        };
        img.src = base64String;
      }
    };
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-text-gray-400", children: "Image" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-mb-4 univer-grid univer-gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        Button,
        {
          className: "univer-mb-2",
          onClick: handleUpdateImageUrl,
          children: config.url ? "Replace Image" : "Upload Image"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-gap-2 univer-text-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Opacity" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.opacity,
              max: 1,
              min: 0,
              step: 0.05,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, opacity: Number.parseFloat(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Keep Ratio" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Checkbox,
            {
              className: "univer-justify-center univer-self-baseline",
              checked: config.maintainAspectRatio,
              onChange: (val) => {
                if (val === true) {
                  onChange({ ...config, maintainAspectRatio: val, height: Math.round(config.width / config.originRatio) });
                } else {
                  onChange({ ...config, maintainAspectRatio: val });
                }
              }
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-grid univer-gap-2 univer-text-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Width" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          InputNumber,
          {
            className: "univer-box-border univer-h-7",
            value: config.width,
            min: 20,
            onChange: (val) => {
              if (val != null) {
                const newWidth = Math.max(20, Number.parseInt(val.toString()));
                if (config.maintainAspectRatio) {
                  onChange({ ...config, width: newWidth, height: Math.round(newWidth / config.originRatio) });
                } else {
                  onChange({ ...config, width: newWidth });
                }
              }
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Height" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          InputNumber,
          {
            className: "univer-box-border univer-h-7",
            value: config.height,
            min: 20,
            onChange: (val) => {
              if (val != null) {
                const newHeight = Math.max(20, Number.parseInt(val.toString()));
                if (config.maintainAspectRatio) {
                  onChange({ ...config, height: newHeight, width: Math.round(newHeight * config.originRatio) });
                } else {
                  onChange({ ...config, height: Number.parseInt(val.toString()) });
                }
              }
            }
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-text-gray-400", children: "Layout Settings" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-gap-2 univer-text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Rotate" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.rotate,
              max: 360,
              min: -360,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Repeat" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            Checkbox,
            {
              className: "univer-justify-center univer-self-baseline",
              checked: config.repeat,
              onChange: (val) => onChange({ ...config, repeat: val })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Horizontal Spacing" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.spacingX,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Vertical Spacing" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.spacingY,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, spacingY: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Horizontal Start Position" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.x,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, x: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: "Vertical Start Position" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            InputNumber,
            {
              className: "univer-box-border univer-h-7",
              value: config.y,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, y: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] })
      ] })
    ] })
  ] });
}

// ../common/debugger/src/views/watermark/WatermarkTextSetting.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime());
function WatermarkTextSetting(props) {
  var _a;
  const { config, onChange } = props;
  if (!config) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-text-gray-400", children: "Style Settings" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-mb-4 univer-grid univer-gap-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Content" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        Input,
        {
          value: config.content,
          onChange: (val) => onChange({ ...config, content: val }),
          placeholder: "Enter text"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Font Size" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.fontSize,
              max: 72,
              min: 12,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, fontSize: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Direction" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            Select,
            {
              value: config.direction,
              options: [
                { label: "Left to Right", value: "ltr" },
                { label: "Right to Left", value: "rtl" }
              ],
              onChange: (v) => onChange({ ...config, direction: v })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Opacity" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              max: 1,
              min: 0,
              step: 0.05,
              value: config.opacity,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, opacity: Number.parseFloat(val.toString()) });
                }
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        "div",
        {
          className: `univer-flex univer-justify-around univer-gap-4 [&_a]:univer-flex [&_a]:univer-size-6 [&_a]:univer-items-center [&_a]:univer-justify-center [&_a]:univer-rounded`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              Dropdown,
              {
                overlay: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-rounded-lg univer-p-4", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ColorPicker, { value: config.color, onChange: (val) => onChange({ ...config, color: val }) }) }),
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "a",
                  {
                    className: `hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
                    children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FontColorDoubleIcon, { extend: { colorChannel1: (_a = config.color) != null ? _a : "#2c53f1" } })
                  }
                )
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "a",
              {
                className: clsx(`hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`, {
                  "univer-bg-gray-200 dark:!univer-bg-gray-600": config.bold
                }),
                onClick: () => {
                  onChange({ ...config, bold: !config.bold });
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BoldIcon, {})
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              "a",
              {
                className: clsx(`hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`, {
                  "univer-bg-gray-200 dark:!univer-bg-gray-600": config.italic
                }),
                onClick: () => {
                  onChange({ ...config, italic: !config.italic });
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ItalicIcon, {})
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "univer-text-gray-400", children: "Layout Settings" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-2 univer-text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Rotate" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.rotate,
              max: 360,
              min: -360,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-flex-1 univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Repeat" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            Checkbox,
            {
              className: "univer-justify-center univer-self-baseline",
              checked: config.repeat,
              onChange: (val) => onChange({ ...config, repeat: val })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Horizontal Spacing" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.spacingX,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Vertical Spacing" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.spacingY,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, spacingY: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-flex univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Horizontal Start Position" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.x,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, x: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-grid univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { children: "Vertical Start Position" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            InputNumber,
            {
              value: config.y,
              min: 0,
              onChange: (val) => {
                if (val != null) {
                  onChange({ ...config, y: Number.parseInt(val.toString()) });
                }
              }
            }
          )
        ] })
      ] })
    ] })
  ] });
}

// ../common/debugger/src/views/watermark/WatermarkPanel.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime());
function WatermarkPanel() {
  const [watermarkType, setWatermarkType] = (0, import_react10.useState)("text" /* Text */);
  const [config, setConfig] = (0, import_react10.useState)();
  const watermarkService = useDependency(WatermarkService);
  const localStorageService = useDependency(ILocalStorageService);
  const _refresh = useObservable(watermarkService.refresh$);
  function handleConfigChange(config2, type) {
    setConfig(config2);
    watermarkService.updateWatermarkConfig({ type: type != null ? type : watermarkType, config: config2 });
  }
  const getWatermarkConfig = (0, import_react10.useCallback)(async () => {
    const watermarkConfig = await localStorageService.getItem(UNIVER_WATERMARK_STORAGE_KEY);
    if (watermarkConfig) {
      setWatermarkType(watermarkConfig.type);
      setConfig(watermarkConfig.config);
    } else {
      setConfig({ text: WatermarkTextBaseConfig });
    }
  }, []);
  (0, import_react10.useEffect)(() => {
    getWatermarkConfig();
  }, [_refresh, getWatermarkConfig]);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "univer-grid univer-gap-3 univer-text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "univer-grid univer-gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "univer-text-gray-400", children: "Type" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        Select,
        {
          value: watermarkType,
          options: [
            { label: "Text", value: "text" /* Text */ },
            { label: "Image", value: "image" /* Image */ }
          ],
          onChange: (v) => {
            setWatermarkType(v);
            if (v === "text" /* Text */) {
              handleConfigChange({ text: WatermarkTextBaseConfig }, "text" /* Text */);
            } else if (v === "image" /* Image */) {
              handleConfigChange({ image: WatermarkImageBaseConfig }, "image" /* Image */);
            }
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "univer-grid univer-gap-2", children: [
      watermarkType === "text" /* Text */ && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WatermarkTextSetting, { config: config == null ? void 0 : config.text, onChange: (v) => handleConfigChange({ text: v }) }),
      watermarkType === "image" /* Image */ && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WatermarkImageSetting, { config: config == null ? void 0 : config.image, onChange: (v) => handleConfigChange({ image: v }) })
    ] })
  ] });
}

// ../common/debugger/src/views/watermark/WatermarkPanelFooter.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime());
function WatermarkPanelFooter() {
  const sidebarService = useDependency(ISidebarService);
  const watermarkService = useDependency(WatermarkService);
  const clipboardService = useDependency(IClipboardInterfaceService);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "univer-flex univer-items-center univer-justify-between", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "a",
      {
        className: "univer-text-sm univer-text-primary-600 univer-underline",
        onClick: () => {
          watermarkService.updateWatermarkConfig({
            type: "text" /* Text */,
            config: { text: WatermarkTextBaseConfig }
          });
          watermarkService.refresh();
        },
        children: "Cancel Watermark"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "univer-flex univer-items-center univer-gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        Button,
        {
          onClick: async () => {
            const watermarkConfig = await watermarkService.getWatermarkConfig();
            let config;
            if ((watermarkConfig == null ? void 0 : watermarkConfig.type) === "text" /* Text */) {
              config = watermarkConfig.config.text;
            } else if ((watermarkConfig == null ? void 0 : watermarkConfig.type) === "image" /* Image */) {
              config = watermarkConfig.config.image;
            }
            clipboardService.writeText(JSON.stringify(config));
          },
          children: "Copy Config"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        Button,
        {
          onClick: async () => {
            var _a, _b;
            const watermarkConfig = await watermarkService.getWatermarkConfig();
            if ((watermarkConfig == null ? void 0 : watermarkConfig.type) === "text" /* Text */ && !((_a = watermarkConfig.config.text) == null ? void 0 : _a.content)) {
              watermarkService.deleteWatermarkConfig();
            } else if ((watermarkConfig == null ? void 0 : watermarkConfig.type) === "image" /* Image */ && !((_b = watermarkConfig.config.image) == null ? void 0 : _b.url)) {
              watermarkService.deleteWatermarkConfig();
            }
            sidebarService.close();
          },
          children: "Close Panel"
        }
      )
    ] })
  ] });
}

// ../common/debugger/src/menu/watermark.menu.controller.ts
var WATERMARK_PANEL = "WATERMARK_PANEL";
var WATERMARK_PANEL_FOOTER = "WATERMARK_PANEL_FOOTER";
var UniverWatermarkMenuController = class extends Disposable {
  constructor(_menuManagerService, _componentManager) {
    super();
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    this._initComponents();
  }
  _initComponents() {
    [
      [WATERMARK_PANEL, WatermarkPanel],
      [WATERMARK_PANEL_FOOTER, WatermarkPanelFooter]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(this._componentManager.register(key, comp));
    });
  }
};
UniverWatermarkMenuController = __decorateClass([
  __decorateParam(0, IMenuManagerService),
  __decorateParam(1, Inject(ComponentManager))
], UniverWatermarkMenuController);

// ../common/debugger/src/views/use-watermark.ts
function useWatermark() {
  const sidebarService = useDependency(ISidebarService);
  const onSelect = () => {
    sidebarService.open({
      header: { title: "Watermark" },
      children: { label: WATERMARK_PANEL },
      footer: { label: WATERMARK_PANEL_FOOTER },
      onClose: () => {
      },
      width: 330
    });
  };
  return {
    type: "item",
    children: "\u{1F30A} Watermark Settings",
    onSelect
  };
}

// ../common/debugger/src/views/Fab.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime());
function Fab() {
  var _a;
  const configService = useDependency(IConfigService);
  const configs = configService.getConfig(DEBUGGER_PLUGIN_CONFIG_KEY);
  const performanceMonitor = configs == null ? void 0 : configs.performanceMonitor;
  const fabEntryUnitType = configs == null ? void 0 : configs.fabEntryUnitType;
  const locale = useLocale();
  const rtl = useRTL();
  const darkMode = useDarkMode();
  const theme = useTheme();
  const watermark = useWatermark();
  const notification = useNotification();
  const message = useMessage();
  const dialog = useDialog();
  const sidebar = useSidebar();
  const floatingDom = useFloatingDom(fabEntryUnitType);
  const cellContent = useCellContent(fabEntryUnitType);
  const units = useUnits();
  const snapshot = useSnapshot();
  const editable = useEditable();
  const user = useUser();
  const dispose = useDispose();
  const univerInstanceService = useDependency(IUniverInstanceService);
  const unitType = (_a = univerInstanceService.getFocusedUnit()) == null ? void 0 : _a.type;
  if (!unitType) return null;
  const items = [
    locale,
    rtl,
    darkMode,
    theme,
    watermark,
    { type: "separator" },
    notification,
    message,
    dialog,
    sidebar,
    { type: "separator" },
    (fabEntryUnitType === 2 /* UNIVER_SHEET */ || fabEntryUnitType === 1 /* UNIVER_DOC */) && floatingDom,
    fabEntryUnitType === 2 /* UNIVER_SHEET */ && cellContent,
    fabEntryUnitType === 2 /* UNIVER_SHEET */ && units,
    snapshot,
    editable,
    fabEntryUnitType === 2 /* UNIVER_SHEET */ && user,
    dispose
  ].filter((item) => item !== null);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
    "div",
    {
      "data-u-comp": "debugger-fab",
      className: `univer-fixed univer-bottom-12 univer-right-8 univer-z-[9999] univer-flex univer-select-none univer-flex-col univer-items-center univer-gap-1`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(DropdownMenu, { align: "end", items, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "button",
          {
            className: clsx(`univer-flex univer-size-9 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full univer-bg-white univer-text-base univer-text-gray-900 univer-shadow univer-outline-none univer-transition-shadow hover:univer-ring-1 hover:univer-ring-primary-400 dark:!univer-bg-gray-900 dark:!univer-text-gray-200`, borderClassName),
            type: "button",
            children: "\u{1F3D7}\uFE0F"
          }
        ) }),
        (performanceMonitor == null ? void 0 : performanceMonitor.enabled) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { "data-u-comp": "debugger-fps", className: "univer-text-xs univer-text-gray-400" })
      ]
    }
  );
}

// ../common/debugger/src/controllers/debugger.controller.ts
var DebuggerController = class extends Disposable {
  constructor(_injector, _configService, _uiPartsService, _menuManagerService, _componentManager) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_uiPartsService", _uiPartsService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    this._initCustomComponents();
    this._injector.add([RecordController]);
  }
  _initCustomComponents() {
    [
      ["ImageDemo", ImageDemo],
      ["RangeLoading", RangeLoading],
      ["FloatButton", FloatButton],
      ["AIButton", AIButton]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
    const configs = this._configService.getConfig(DEBUGGER_PLUGIN_CONFIG_KEY);
    if (configs == null ? void 0 : configs.fab) {
      this.disposeWithMe(
        this._uiPartsService.registerComponent("global" /* GLOBAL */, () => connectInjector(Fab, this._injector))
      );
    }
  }
};
DebuggerController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, IConfigService),
  __decorateParam(2, IUIPartsService),
  __decorateParam(3, IMenuManagerService),
  __decorateParam(4, Inject(ComponentManager))
], DebuggerController);

// ../common/debugger/src/controllers/e2e/data/default-doc.ts
function getDefaultDocData() {
  const DEFAULT_DOCUMENT_DATA_CN = {
    id: "d",
    tableSource: {},
    drawings: {},
    drawingsOrder: [],
    headers: {},
    footers: {},
    body: {
      dataStream: "\u8377\u5858\u6708\u8272\r\r\u4F5C\u8005\uFF1A\u6731\u81EA\u6E05\r\r\u8FD9\u51E0\u5929\u5FC3\u91CC\u9887\u4E0D\u5B81\u9759\u3002\u4ECA\u665A\u5728\u9662\u5B50\u91CC\u5750\u7740\u4E58\u51C9\uFF0C\u5FFD\u7136\u60F3\u8D77\u65E5\u65E5\u8D70\u8FC7\u7684\u8377\u5858\uFF0C\u5728\u8FD9\u6EE1\u6708\u7684\u5149\u91CC\uFF0C\u603B\u8BE5\u53E6\u6709\u4E00\u756A\u6837\u5B50\u5427\u3002\u6708\u4EAE\u6E10\u6E10\u5730\u5347\u9AD8\u4E86\uFF0C\u5899\u5916\u9A6C\u8DEF\u4E0A\u5B69\u5B50\u4EEC\u7684\u6B22\u7B11\uFF0C\u5DF2\u7ECF\u542C\u4E0D\u89C1\u4E86\uFF1B\u59BB\u5728\u5C4B\u91CC\u62CD\u7740\u95F0\u513F\uFF0C\u8FF7\u8FF7\u7CCA\u7CCA\u5730\u54FC\u7740\u7720\u6B4C\u3002\u6211\u6084\u6084\u5730\u62AB\u4E86\u5927\u886B\uFF0C\u5E26\u4E0A\u95E8\u51FA\u53BB\u3002\r\r\u6CBF\u7740\u8377\u5858\uFF0C\u662F\u4E00\u6761\u66F2\u6298\u7684\u5C0F\u7164\u5C51\u8DEF\u3002\u8FD9\u662F\u4E00\u6761\u5E7D\u50FB\u7684\u8DEF\uFF1B\u767D\u5929\u4E5F\u5C11\u4EBA\u8D70\uFF0C\u591C\u665A\u66F4\u52A0\u5BC2\u5BDE\u3002\u8377\u5858\u56DB\u9762\uFF0C\u957F\u7740\u8BB8\u591A\u6811\uFF0C\u84CA\u84CA\u90C1\u90C1\u7684\u3002\u8DEF\u56FE\u7247\u4E00\u7247\u662F\u4E9B\u6768\u67F3\uFF0C\u548C\u4E00\u4E9B\u4E0D\u77E5\u9053\u540D\u5B57\u7684\u6811\u3002\u6CA1\u6709\u6708\u5149\u7684\u665A\u4E0A\uFF0C\u8FD9\u8DEF\u4E0A\u9634\u68EE\u68EE\u7684\uFF0C\u6709\u4E9B\u6015\u4EBA\u3002\u4ECA\u665A\u5374\u5F88\u597D\uFF0C\u867D\u7136\u6708\u5149\u4E5F\u8FD8\u662F\u6DE1\u6DE1\u7684\u3002\r\r\u8DEF\u4E0A\u53EA\u6211\u4E00\u4E2A\u4EBA\uFF0C\u80CC\u7740\u624B\u8E31\u7740\u3002\u8FD9\u4E00\u7247\u5929\u5730\u597D\u50CF\u662F\u6211\u7684\uFF1B\u6211\u4E5F\u50CF\u8D85\u51FA\u4E86\u5E73\u5E38\u7684\u81EA\u5DF1\uFF0C\u5230\u4E86\u53E6\u4E00\u4E2A\u4E16\u754C\u91CC\u3002\u6211\u7231\u70ED\u95F9\uFF0C\u4E5F\u7231\u51B7\u9759\uFF1B\u7231\u7FA4\u5C45\uFF0C\u4E5F\u7231\u72EC\u5904\u3002\u50CF\u4ECA\u665A\u4E0A\uFF0C\u4E00\u4E2A\u4EBA\u5728\u8FD9\u82CD\u832B\u7684\u6708\u4E0B\uFF0C\u4EC0\u4E48\u90FD\u53EF\u4EE5\u60F3\uFF0C\u4EC0\u4E48\u90FD\u53EF\u4EE5\u4E0D\u60F3\uFF0C\u4FBF\u89C9\u662F\u4E2A\u81EA\u7531\u7684\u4EBA\u3002\u767D\u5929\u91CC\u4E00\u5B9A\u8981\u505A\u7684\u4E8B\uFF0C\u4E00\u5B9A\u8981\u8BF4\u7684\u8BDD\u662F\u73B0\u5728\u90FD\u53EF\u4E0D\u7406\u3002\u8FD9\u662F\u72EC\u5904\u7684\u5999\u5904\uFF0C\u6211\u4E14\u53D7\u7528\u8FD9\u65E0\u8FB9\u7684\u8377\u9999\u6708\u8272\u597D\u4E86\u3002\r\r\u66F2\u66F2\u6298\u6298\u7684\u8377\u5858\u4E0A\u9762\uFF0C\u5F25\u671B\u7684\u662F\u7530\u7530\u7684\u53F6\u5B50\u3002\u53F6\u5B50\u51FA\u6C34\u5F88\u9AD8\uFF0C\u50CF\u4EAD\u4EAD\u7684\u821E\u5973\u7684\u88D9\u3002\u5C42\u5C42\u7684\u53F6\u5B50\u4E2D\u95F4\uFF0C\u96F6\u661F\u5730\u70B9\u7F00\u7740\u4E9B\u767D\u82B1\uFF0C\u6709\u8885\u5A1C\u5730\u5F00\u7740\u7684\uFF0C\u6709\u7F9E\u6DA9\u5730\u6253\u7740\u6735\u513F\u7684\uFF1B\u6B63\u5982\u4E00\u7C92\u7C92\u7684\u660E\u73E0\uFF0C\u53C8\u5982\u78A7\u5929\u91CC\u7684\u661F\u661F\uFF0C\u53C8\u5982\u521A\u51FA\u6D74\u7684\u7F8E\u4EBA\u3002\u5FAE\u98CE\u8FC7\u5904\uFF0C\u9001\u6765\u7F15\u7F15\u6E05\u9999\uFF0C\u4EFF\u4F5B\u8FDC\u5904\u9AD8\u697C\u4E0A\u6E3A\u832B\u7684\u6B4C\u58F0\u4F3C\u7684\u3002\u8FD9\u65F6\u5019\u53F6\u5B50\u4E0E\u82B1\u4E5F\u6709\u4E00\u4E1D\u7684\u98A4\u52A8\uFF0C\u50CF\u95EA\u7535\u822C\uFF0C\u970E\u65F6\u4F20\u8FC7\u8377\u5858\u7684\u90A3\u8FB9\u53BB\u4E86\u3002\u53F6\u5B50\u672C\u662F\u80A9\u5E76\u80A9\u5BC6\u5BC6\u5730\u6328\u7740\uFF0C\u8FD9\u4FBF\u5B9B\u7136\u6709\u4E86\u4E00\u9053\u51DD\u78A7\u7684\u6CE2\u75D5\u3002\u53F6\u5B50\u5E95\u4E0B\u662F\u8109\u8109\u7684\u6D41\u6C34\uFF0C\u906E\u4F4F\u4E86\uFF0C\u4E0D\u80FD\u89C1\u4E00\u4E9B\u989C\u8272\uFF1B\u800C\u53F6\u5B50\u5374\u66F4\u89C1\u98CE\u81F4\u4E86\u3002\r\r\u6708\u5149\u5982\u6D41\u6C34\u4E00\u822C\uFF0C\u9759\u9759\u5730\u6CFB\u5728\u8FD9\u4E00\u7247\u53F6\u5B50\u548C\u82B1\u4E0A\u3002\u8584\u8584\u7684\u9752\u96FE\u6D6E\u8D77\u5728\u8377\u5858\u91CC\u3002\u53F6\u5B50\u548C\u82B1\u4EFF\u4F5B\u5728\u725B\u4E73\u4E2D\u6D17\u8FC7\u4E00\u6837\uFF0C\u53C8\u50CF\u7B3C\u7740\u8F7B\u7EB1\u7684\u68A6\u3002\u867D\u7136\u662F\u6EE1\u6708\uFF0C\u5929\u4E0A\u5374\u6709\u4E00\u5C42\u6DE1\u6DE1\u7684\u4E91\uFF0C\u6240\u4EE5\u4E0D\u80FD\u6717\u7167\uFF1B\u4F46\u6211\u4EE5\u4E3A\u8FD9\u6070\u662F\u5230\u4E86\u597D\u5904\u2014\u2014\u9163\u7720\u56FA\u4E0D\u53EF\u5C11\uFF0C\u5C0F\u7761\u4E5F\u522B\u6709\u98CE\u5473\u7684\u3002\u6708\u5149\u662F\u9694\u4E86\u6811\u7167\u8FC7\u6765\u7684\uFF0C\u9AD8\u5904\u4E1B\u751F\u7684\u704C\u6728\uFF0C\u843D\u4E0B\u53C2\u5DEE\u7684\u6591\u9A73\u7684\u9ED1\u5F71\uFF0C\u5CED\u695E\u695E\u5982\u9B3C\u4E00\u822C\uFF1B\u5F2F\u5F2F\u7684\u6768\u67F3\u7684\u7A00\u758F\u7684\u5029\u5F71\uFF0C\u5374\u53C8\u50CF\u662F\u753B\u5728\u8377\u53F6\u4E0A\u3002\u5858\u4E2D\u7684\u6708\u8272\u5E76\u4E0D\u5747\u5300\uFF1B\u4F46\u5149\u4E0E\u5F71\u6709\u7740\u548C\u8C10\u7684\u65CB\u5F8B\uFF0C\u5982\u68B5\u5A40\u73B2\u4E0A\u594F\u7740\u7684\u540D\u66F2\u3002\r\r\u8377\u5858\u7684\u56DB\u9762\uFF0C\u8FDC\u8FDC\u8FD1\u8FD1\uFF0C\u9AD8\u9AD8\u4F4E\u4F4E\u90FD\u662F\u6811\uFF0C\u800C\u6768\u67F3\u6700\u591A\u3002\u8FD9\u4E9B\u6811\u5C06\u4E00\u7247\u8377\u5858\u91CD\u91CD\u56F4\u4F4F\uFF1B\u53EA\u5728\u5C0F\u8DEF\u4E00\u65C1\uFF0C\u6F0F\u7740\u51E0\u6BB5\u7A7A\u9699\uFF0C\u50CF\u662F\u7279\u4E3A\u6708\u5149\u7559\u4E0B\u7684\u3002\u6811\u8272\u4E00\u4F8B\u662F\u9634\u9634\u7684\uFF0C\u4E4D\u770B\u50CF\u4E00\u56E2\u70DF\u96FE\uFF1B\u4F46\u6768\u67F3\u7684\u4E30\u59FF\uFF0C\u4FBF\u5728\u70DF\u96FE\u91CC\u4E5F\u8FA8\u5F97\u51FA\u3002\u6811\u68A2\u4E0A\u9690\u9690\u7EA6\u7EA6\u7684\u662F\u4E00\u5E26\u8FDC\u5C71\uFF0C\u53EA\u6709\u4E9B\u5927\u610F\u7F62\u4E86\u3002\u6811\u7F1D\u91CC\u4E5F\u6F0F\u7740\u4E00\u4E24\u70B9\u8DEF\u706F\u5149\uFF0C\u6CA1\u7CBE\u6253\u91C7\u7684\uFF0C\u662F\u6E34\u7761\u4EBA\u7684\u773C\u3002\u8FD9\u65F6\u5019\u6700\u70ED\u95F9\u7684\uFF0C\u8981\u6570\u6811\u4E0A\u7684\u8749\u58F0\u4E0E\u6C34\u91CC\u7684\u86D9\u58F0\uFF1B\u4F46\u70ED\u95F9\u662F\u5B83\u4EEC\u7684\uFF0C\u6211\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002\r\r\u5FFD\u7136\u60F3\u8D77\u91C7\u83B2\u7684\u4E8B\u60C5\u6765\u4E86\u3002\u91C7\u83B2\u662F\u6C5F\u5357\u7684\u65E7\u4FD7\uFF0C\u4F3C\u4E4E\u5F88\u65E9\u5C31\u6709\uFF0C\u800C\u516D\u671D\u65F6\u4E3A\u76DB\uFF1B\u4ECE\u8BD7\u6B4C\u91CC\u53EF\u4EE5\u7EA6\u7565\u77E5\u9053\u3002\u91C7\u83B2\u7684\u662F\u5C11\u5E74\u7684\u5973\u5B50\uFF0C\u5979\u4EEC\u662F\u8361\u7740\u5C0F\u8239\uFF0C\u5531\u7740\u8273\u6B4C\u53BB\u7684\u3002\u91C7\u83B2\u4EBA\u4E0D\u7528\u8BF4\u5F88\u591A\uFF0C\u8FD8\u6709\u770B\u91C7\u83B2\u7684\u4EBA\u3002\u90A3\u662F\u4E00\u4E2A\u70ED\u95F9\u7684\u5B63\u8282\uFF0C\u4E5F\u662F\u4E00\u4E2A\u98CE\u6D41\u7684\u5B63\u8282\u3002\u6881\u5143\u5E1D\u300A\u91C7\u83B2\u8D4B\u300B\u91CC\u8BF4\u5F97\u597D\uFF1A\r\r\u4E8E\u662F\u5996\u7AE5\u5973\uFF0C\u8361\u821F\u5FC3\u8BB8\uFF1B\u9DC1\u9996\u5F90\u56DE\uFF0C\u517C\u4F20\u7FBD\u676F\uFF1B\u6AC2\u5C06\u79FB\u800C\u85FB\u6302\uFF0C\u8239\u6B32\u52A8\u800C\u840D\u5F00\u3002\u5C14\u5176\u7EA4\u8170\u675F\u7D20\uFF0C\u8FC1\u5EF6\u987E\u6B65\uFF1B\u590F\u59CB\u6625\u4F59\uFF0C\u53F6\u5AE9\u82B1\u521D\uFF0C\u6050\u6CBE\u88F3\u800C\u6D45\u7B11\uFF0C\u754F\u503E\u8239\u800C\u655B\u88FE\u3002\r\r\u53EF\u89C1\u5F53\u65F6\u5B09\u6E38\u7684\u5149\u666F\u4E86\u3002\u8FD9\u771F\u662F\u6709\u8DA3\u7684\u4E8B\uFF0C\u53EF\u60DC\u6211\u4EEC\u73B0\u5728\u65E9\u5DF2\u65E0\u798F\u6D88\u53D7\u4E86\u3002\r\r\u4E8E\u662F\u53C8\u8BB0\u8D77\uFF0C\u300A\u897F\u6D32\u66F2\u300B\u91CC\u7684\u53E5\u5B50\uFF1A\r\r\u91C7\u83B2\u5357\u5858\u79CB\uFF0C\u83B2\u82B1\u8FC7\u4EBA\u5934\uFF1B\u4F4E\u5934\u5F04\u83B2\u5B50\uFF0C\u83B2\u5B50\u6E05\u5982\u6C34\u3002\r\r\u4ECA\u665A\u82E5\u6709\u91C7\u83B2\u4EBA\uFF0C\u8FD9\u513F\u7684\u83B2\u82B1\u4E5F\u7B97\u5F97\u201C\u8FC7\u4EBA\u5934\u201D\u4E86\uFF1B\u53EA\u4E0D\u89C1\u4E00\u4E9B\u6D41\u6C34\u7684\u5F71\u5B50\uFF0C\u662F\u4E0D\u884C\u7684\u3002\u8FD9\u4EE4\u6211\u5230\u5E95\u60E6\u7740\u6C5F\u5357\u4E86\u3002\u2014\u2014\u8FD9\u6837\u60F3\u7740\uFF0C\u731B\u4E00\u62AC\u5934\uFF0C\u4E0D\u89C9\u5DF2\u662F\u81EA\u5DF1\u7684\u95E8\u524D\uFF1B\u8F7B\u8F7B\u5730\u63A8\u95E8\u8FDB\u53BB\uFF0C\u4EC0\u4E48\u58F0\u606F\u4E5F\u6CA1\u6709\uFF0C\u59BB\u5DF2\u7761\u719F\u597D\u4E45\u4E86\u3002\r\r\u4E00\u4E5D\u4E8C\u4E03\u5E74\u4E03\u6708\uFF0C\u5317\u4EAC\u6E05\u534E\u56ED\u3002\r\r\r\r\u300A\u8377\u5858\u6708\u8272\u300B\u8BED\u8A00\u6734\u7D20\u5178\u96C5\uFF0C\u51C6\u786E\u751F\u52A8\uFF0C\u8D2E\u6EE1\u8BD7\u610F\uFF0C\u6EE1\u6EA2\u7740\u6731\u81EA\u6E05\u7684\u6563\u6587\u8BED\u8A00\u4E00\u8D2F\u6709\u6734\u7D20\u7684\u7F8E\uFF0C\u4E0D\u7528\u6D53\u58A8\u91CD\u5F69\uFF0C\u753B\u7684\u662F\u6DE1\u58A8\u6C34\u5F69\u3002\r\r\u6731\u81EA\u6E05\u5148\u751F\u4E00\u7B14\u5199\u666F\u4E00\u7B14\u8BF4\u60C5\uFF0C\u770B\u8D77\u6765\u677E\u6563\u4E0D\u77E5\u6240\u4E91\uFF0C\u53EF\u4ED4\u7EC6\u4F53\u4F1A\u4E0B\uFF0C\u5C31\u80FD\u611F\u53D7\u5230\u5148\u751F\u5728\u5B57\u91CC\u884C\u95F4\u8868\u8FF0\u51FA\u7684\u82E6\u95F7\uFF0C\u800C\u968F\u4E4B\u8BFB\u8005\u4E5F\u88AB\u5148\u751F\u7684\u6587\u5B57\u6240\u611F\u67D3\uFF0C\u88AB\u5E26\u8FDB\u4E86\u4ED6\u5F53\u65F6\u90A3\u82E6\u95F7\u800C\u65E0\u6CD5\u660E\u55BB\u7684\u5FC3\u60C5\u3002\u8FD9\u5C31\u662F\u4F18\u5F02\u6563\u6587\u7684\u5FC5\u987B\u54C1\u8D28\u4E4B\u4E00\u3002\r\r\u6269\u5C55\u8D44\u6599\uFF1A\r\u4E00\u9996\u957F\u8BD7\u300A\u6BC1\u706D\u300B\u5960\u5B9A\u4E86\u6731\u81EA\u6E05\u5728\u6587\u575B\u65B0\u8BD7\u4EBA\u7684\u5730\u4F4D\uFF0C\u800C\u300A\u6868\u58F0\u706F\u5F71\u91CC\u7684\u79E6\u6DEE\u6CB3\u300B\u5219\u88AB\u516C\u8BA4\u4E3A\u767D\u8BDD\u7F8E\u6587\u7684\u5178\u8303\u3002\u6731\u81EA\u6E05\u7528\u767D\u8BDD\u7F8E\u6587\u5411\u590D\u53E4\u6D3E\u5BA3\u6218\uFF0C\u6709\u529B\u5730\u56DE\u51FB\u4E86\u590D\u53E4\u6D3E\u201C\u767D\u8BDD\u4E0D\u80FD\u4F5C\u7F8E\u6587\u201D\u4E4B\u8BF4\uFF0C\u4ED6\u662F\u201C\u4E94\u56DB\u201D\u65B0\u6587\u5B66\u8FD0\u52A8\u7684\u5F00\u62D3\u8005\u4E4B\u4E00\u3002\r\r\u6731\u81EA\u6E05\u7684\u7F8E\u6587\u5F71\u54CD\u4E86\u4E00\u4EE3\u53C8\u4E00\u4EE3\u4EBA\u3002\u4F5C\u5BB6\u8D3E\u5E73\u51F9\u8BF4\uFF1A\u6765\u5230\u626C\u5DDE\uFF0C\u7B2C\u4E00\u4E2A\u60F3\u5230\u7684\u4EBA\u662F\u6731\u81EA\u6E05\uFF0C\u4ED6\u662F\u77E5\u8BC6\u5206\u5B50\u4E2D\u6700\u6700\u4E86\u4E0D\u8D77\u7684\u4EBA\u7269\u3002\r\r\u5B9E\u9645\u4E0A\uFF0C\u6731\u81EA\u6E05\u7684\u5199\u4F5C\u8DEF\u7A0B\u662F\u975E\u5E38\u66F2\u6298\u7684\uFF0C\u4ED6\u65E9\u671F\u7684\u65F6\u5019\u5927\u591A\u6570\u4F5C\u54C1\u90FD\u662F\u8BD7\u6B4C\uFF0C\u4F46\u662F\u4ED6\u7684\u8BD7\u6B4C\u548C\u6211\u56FD\u53E4\u4EE3\u8BD7\u4EBA\u7684\u8BD7\u6709\u5F88\u5927\u533A\u522B\uFF0C\u4ED6\u7684\u8BD7\u662F\u7528\u767D\u8BDD\u6587\u5199\u7684\uFF0C\u8FD9\u5176\u5B9E\u4E5F\u662F\u4ED6\u5199\u4F5C\u7684\u60EF\u7528\u98CE\u683C\u3002\r\r\u540E\u6765\uFF0C\u6731\u81EA\u6E05\u5F00\u59CB\u5199\u4E00\u4E9B\u5173\u4E8E\u793E\u4F1A\u7684\u6587\u7AE0\uFF0C\u56E0\u4E3A\u90A3\u4E2A\u65F6\u5019\u793E\u4F1A\u6BD4\u8F83\u6DF7\u4E71\uFF0C\u8FD9\u65F6\u5019\u7684\u4F5C\u54C1\u5927\u591A\u62A8\u51FB\u793E\u4F1A\u7684\u9ED1\u6697\u9762\uFF0C\u6587\u4F53\u98CE\u683C\u5927\u591A\u786C\u6717\uFF0C\u57FA\u8C03\u4F09\u4FEA\u3002\u5230\u4E86\u540E\u671F\uFF0C\u5927\u591A\u662F\u5199\u5173\u4E8E\u5C71\u6C34\u7684\u6587\u7AE0\uFF0C\u8FD9\u7C7B\u6587\u7AE0\u7684\u5199\u4F5C\u683C\u8C03\u5927\u591A\u4EE5\u6E05\u4E3D\u96C5\u81F4\u4E3A\u4E3B\u3002\r\r\u6731\u81EA\u6E05\u7684\u5199\u4F5C\u98CE\u683C\u867D\u7136\u5728\u4E0D\u540C\u7684\u65F6\u671F\u968F\u7740\u4ED6\u7684\u4EBA\u751F\u9605\u5386\u548C\u793E\u4F1A\u5F62\u6001\u7684\u4E0D\u540C\u800C\u53D1\u751F\u7740\u53D8\u5316\uFF0C\u4F46\u662F\u4ED6\u6587\u7AE0\u7684\u4E3B\u57FA\u8C03\u662F\u6CA1\u6709\u53D8\u7684\uFF0C\u4ED6\u8FD9\u4E00\u751F\uFF0C\u6240\u5199\u7684\u6240\u6709\u6587\u7AE0\u98CE\u683C\u4E0A\u90FD\u6709\u4E00\u4E2A\u975E\u5E38\u663E\u8457\u7684\u7279\u70B9\uFF0C\u90A3\u5C31\u662F\u7B80\u7EA6\u5E73\u6DE1\uFF0C\u4ED6\u4E0D\u662F\u7C7B\u4F3C\u53E4\u4EE3\u82B1\u95F4\u8BCD\u6D3E\u7684\u8BD7\u4EBA\u4EEC\uFF0C\u4E0D\u7BA1\u662F\u4ED6\u7684\u8BD7\u8BCD\u8FD8\u662F\u4ED6\u7684\u6587\u7AE0\u4ECE\u6765\u90FD\u4E0D\u7528\u8FC7\u4E8E\u534E\u4E3D\u7684\u8F9E\u85FB\uFF0C\u4ED6\u5D07\u5C1A\u7684\u662F\u5E73\u6DE1\u3002\r\r\u82F1\u56FD\u53CB\u4EBA\u6234\u7ACB\u514B\u8BD5\u8FC7\u82F1\u8BD1\u6731\u81EA\u6E05\u51E0\u7BC7\u6563\u6587\uFF0C\u8BD1\u5B8C\u4E00\u8BFB\u663E\u5F97\u5355\u8584\uFF0C\u8FDC\u8FDC\u4E0D\u5982\u539F\u6587\u6D41\u5229\u3002\u4ED6\u4E0D\u670D\u6C14\uFF0C\u6539\u7528\u7A0D\u5FAE\u53E4\u5965\u7684\u82F1\u6587\u91CD\u8BD1\uFF0C\u597D\u591A\u4E86\uFF1A\u201C\u90A3\u662F\u8BF4\uFF0C\u6731\u5148\u751F\u5916\u5706\u5185\u65B9\uFF0C\u6587\u5B57\u5C3D\u7BA1\u6D45\u767D\uFF0C\u5FC3\u601D\u5374\u5F88\u6DF1\u6C89\uFF0C\u8BD1\u7B14\u53EA\u597D\u671D\u6DF1\u5904\u7ECF\u8425\u3002\u201D\u6731\u81EA\u6E05\u7684\u5F88\u591A\u6587\u7AE0\uFF0C\u8B6C\u5982\u300A\u80CC\u5F71\u300B\u300A\u796D\u4EA1\u5987\u300B\uFF0C\u8BFB\u6765\u81EA\u6709\u4E00\u756A\u53EA\u53EF\u610F\u4F1A\u4E0D\u53EF\u8A00\u4F20\u7684\u4E1C\u897F\u3002\r\r\u5E73\u6DE1\u5C31\u662F\u6731\u81EA\u6E05\u7684\u5199\u4F5C\u98CE\u683C\u3002\u4ED6\u4E0D\u662F\u8C6A\u653E\u6D3E\u7684\u4F5C\u5BB6\uFF0C\u4ED6\u5728\u521B\u4F5C\u7684\u65F6\u5019\u949F\u60C5\u4E8E\u6E05\u65B0\u7684\u98CE\u683C\uFF0C\u7ED9\u4EBA\u8033\u76EE\u4E00\u65B0\u7684\u611F\u89C9\u3002\u5728\u4ED6\u7684\u6587\u7AE0\u4E2D\u5305\u542B\u4E86\u4ED6\u5BF9\u751F\u6D3B\u7684\u5411\u5F80\uFF0C\u7531\u6B64\u53EF\u89C1\u4ED6\u7684\u5199\u4F5C\u98CE\u683C\u548C\u4ED6\u5F85\u4EBA\u5904\u4E8B\u7684\u6001\u5EA6\u4E5F\u662F\u6709\u51E0\u5206\u76F8\u4F3C\u7684\u3002\u4ED6\u7684\u6587\u7AE0\u975E\u5E38\u4F18\u7F8E\uFF0C\u4F46\u53C8\u4E0D\u4F1A\u8BA9\u4EBA\u89C9\u5F97\u72ED\u9698\uFF0C\u7ED9\u4EBA\u4E00\u79CD\u8C41\u8FBE\u6E0A\u535A\u7684\u611F\u89C9\uFF0C\u8FD9\u5C31\u662F\u6731\u81EA\u6E05\u7684\u5199\u4F5C\u98CE\u683C\uFF0C\u66F4\u662F\u6731\u81EA\u6E05\u7684\u4E3A\u4EBA\u54C1\u8D28\u3002\r\r\u5199\u6709\u300A\u8377\u5858\u6708\u8272\u300B\u300A\u80CC\u5F71\u300B\u7B49\u540D\u7BC7\u7684\u8457\u540D\u6563\u6587\u5BB6\u6731\u81EA\u6E05\u5148\u751F\uFF0C\u4E0D\u4EC5\u81EA\u5DF1\u4E00\u751F\u98CE\u9AA8\u6B63\u6C14\uFF0C\u8FD8\u7528\u65E0\u5F62\u7684\u5BB6\u98CE\u6DB5\u517B\u5B50\u5B59\u3002\u826F\u597D\u7684\u5BB6\u98CE\u5BB6\u89C4\u610F\u8574\u6DF1\u8FDC\uFF0C\u50AC\u4EBA\u5411\u5584\uFF0C\u662F\u51DD\u805A\u60C5\u611F\u3001\u6DB5\u517B\u5FB7\u884C\u3001\u7825\u783A\u6210\u624D\u7684\u4EBA\u751F\u4FE1\u6761\u3002\u201C\u5317\u6709\u6731\u81EA\u6E05\uFF0C\u5357\u6709\u6731\u7269\u534E\uFF0C\u4E00\u6587\u4E00\u6B66\uFF0C\u4E00\u5357\u4E00\u5317\uFF0C\u53CC\u661F\u95EA\u8000\u201D\uFF0C\u8FD9\u662F\u4E2D\u56FD\u77E5\u8BC6\u754C\u3001\u6559\u80B2\u754C\u5BF9\u6731\u5BB6\u4E24\u5144\u5F1F\u7684\u8D5E\u8A89\u3002\r\r\u6731\u81EA\u6E05\u6027\u683C\u6E29\u548C\uFF0C\u4E3A\u4EBA\u548C\u5584\uFF0C\u5BF9\u5F85\u5E74\u8F7B\u4EBA\u5E73\u6613\u8FD1\u4EBA\uFF0C\u662F\u4E2A\u5E73\u548C\u7684\u4EBA\u3002\u4ED6\u53D6\u5B57\u201C\u4F69\u5F26\u201D\uFF0C\u610F\u601D\u8981\u50CF\u5F13\u5F26\u90A3\u6837\u5C06\u81EA\u5DF1\u7EF7\u7D27\uFF0C\u7ED9\u4EBA\u7684\u611F\u89C9\u662F\u81EA\u6211\u8981\u6C42\u9AD8\uFF0C\u5076\u5C14\u6709\u5446\u6C14\u3002\u6731\u81EA\u6E05\u6559\u5B66\u8D1F\u8D23\uFF0C\u5BF9\u5B66\u751F\u8981\u6C42\u4E25\u683C\uFF0C\u4FEE\u4ED6\u7684\u8BFE\u7684\u5B66\u751F\u90FD\u53D7\u76CA\u4E0D\u5C11\u3002\r\r1948 \u5E74 6 \u6708\uFF0C\u60A3\u80C3\u75C5\u591A\u5E74\u7684\u6731\u81EA\u6E05\uFF0C\u5728\u300A\u6297\u8BAE\u7F8E\u56FD\u6276\u65E5\u653F\u7B56\u5E76\u62D2\u7EDD\u9886\u53D6\u7F8E\u63F4\u9762\u7C89\u5BA3\u8A00\u300B\u4E0A\uFF0C\u4E00\u4E1D\u4E0D\u82DF\u5730\u7B7E\u4E0B\u4E86\u81EA\u5DF1\u7684\u540D\u5B57\u3002\u968F\u540E\uFF0C\u6731\u81EA\u6E05\u8FD8\u5C06\u9762\u7C89\u914D\u8D2D\u8BC1\u4EE5\u53CA\u9762\u7C89\u7968\u9000\u4E86\u56DE\u53BB\u30021948 \u5E74 8 \u6708 12 \u65E5\uFF0C\u6731\u81EA\u6E05\u56E0\u4E0D\u582A\u80C3\u75C5\u6298\u78E8\uFF0C\u79BB\u5F00\u4EBA\u4E16\u3002\u5728\u65B0\u7684\u65F6\u4EE3\u5373\u5C06\u5230\u6765\u65F6\uFF0C\u6731\u81EA\u6E05\u5374\u5306\u5306\u5730\u79BB\u4EBA\u4EEC\u8FDC\u53BB\u3002\u4ED6\u4E3A\u4EBA\u4EEC\u7559\u4E0B\u4E86\u65E0\u6570\u7ECF\u5178\u7684\u8BD7\u6B4C\u548C\u6587\u5B57\uFF0C\u8FD8\u6709\u6C38\u4E0D\u5C48\u670D\u7684\u7CBE\u795E\u3002\r\r\u6731\u81EA\u6E05\u6CA1\u6709\u8C6A\u8A00\u58EE\u8BED\uFF0C\u4ED6\u53EA\u662F\u7528\u575A\u5B9A\u7684\u884C\u52A8\u3001\u6734\u5B9E\u7684\u8BED\u8A00\uFF0C\u5411\u4E16\u4EBA\u5C55\u793A\u4E86\u4E2D\u56FD\u77E5\u8BC6\u5206\u5B50\u5728\u7956\u56FD\u5371\u96BE\u4E4B\u9645\u575A\u5B9A\u7684\u9769\u547D\u6027\uFF0C\u4F53\u73B0\u4E86\u4E2D\u56FD\u4EBA\u7684\u9AA8\u6C14\uFF0C\u8868\u73B0\u4E86\u65E0\u6BD4\u9AD8\u8D35\u7684\u6C11\u65CF\u6C14\u8282\uFF0C\u5448\u73B0\u4E86\u4EBA\u751F\u6700\u6709\u4EF7\u503C\u7684\u4E00\u9762\uFF0C\u8C31\u5C31\u4E86\u751F\u547D\u4E2D\u6700\u534E\u4E3D\u7684\u4E50\u7AE0\u3002\r\r\u4ED6\u4EE5\u201C\u81EA\u6E05\u201D\u4E3A\u540D\uFF0C\u81EA\u52C9\u5728\u56F0\u5883\u4E2D\u4E0D\u4E27\u5FD7\uFF1B\u4ED6\u8EAB\u60A3\u91CD\u75C5\uFF0C\u81F3\u6B7B\u62D2\u9886\u7F8E\u63F4\u9762\u7C89\uFF0C\u5176\u6C14\u8282\u4EE4\u4E16\u4EBA\u611F\u4F69\uFF1B\u4ED6\u7684\u300A\u80CC\u5F71\u300B\u300A\u8377\u5858\u6708\u8272\u300B\u300A\u5306\u5306\u300B\u810D\u7099\u4EBA\u53E3\uFF1B\u4ED6\u7684\u6587\u5B57\u8FFD\u6C42\u201C\u771F\u201D\uFF0C\u6CA1\u6709\u534A\u70B9\u77EB\u9970\uFF0C\u5374\u8574\u85CF\u7740\u52A8\u4EBA\u5FC3\u5F26\u7684\u529B\u91CF\u3002\r\r\u6731\u81EA\u6E05\u4E0D\u4F46\u5728\u6587\u5B66\u521B\u4F5C\u65B9\u9762\u6709\u5F88\u9AD8\u7684\u9020\u8BE3\uFF0C\u4E5F\u662F\u4E00\u540D\u9769\u547D\u6C11\u4E3B\u4E3B\u4E49\u6218\u58EB\uFF0C\u5728\u53CD\u9965\u997F\u3001\u53CD\u5185\u6218\u7684\u6597\u4E89\u4E2D\uFF0C\u4ED6\u59CB\u7EC8\u4FDD\u6301\u7740\u4E00\u4E2A\u6B63\u76F4\u7684\u7231\u56FD\u77E5\u8BC6\u5206\u5B50\u7684\u6C14\u8282\u548C\u60C5\u64CD\u3002\u6BDB\u6CFD\u4E1C\u5BF9\u6731\u81EA\u6E05\u5B81\u80AF\u997F\u6B7B\u4E0D\u9886\u7F8E\u56FD\u201C\u6551\u6D4E\u7C89\u201D\u7684\u7CBE\u795E\u7ED9\u4E88\u79F0\u8D5E\uFF0C\u8D5E\u626C\u4ED6\u201C\u8868\u73B0\u4E86\u6211\u4EEC\u6C11\u65CF\u7684\u82F1\u96C4\u6C14\u6982\u201D\u3002\r\n",
      textRuns: [
        {
          st: 0,
          ed: 4,
          ts: {
            fs: 20,
            ff: "Microsoft YaHei",
            cl: {
              rgb: "rgb(255, 255, 255)"
            },
            bl: 1 /* TRUE */,
            bg: {
              rgb: "#FF6670"
            },
            it: 1 /* TRUE */
          }
        },
        {
          st: 6,
          ed: 9,
          ts: {
            fs: 16,
            ff: "Microsoft YaHei",
            cl: {
              rgb: "rgb(30, 30, 30)"
            },
            bl: 0 /* FALSE */
          }
        },
        {
          st: 9,
          ed: 12,
          ts: {
            fs: 16,
            ff: "Microsoft YaHei",
            cl: {
              rgb: "rgb(30, 30, 30)"
            },
            bl: 1 /* TRUE */
          }
        },
        {
          st: 14,
          ed: 3064,
          ts: {
            fs: 12,
            ff: "Microsoft YaHei",
            cl: {
              rgb: "rgb(30, 30, 30)"
            },
            bl: 0 /* FALSE */
          }
        }
      ],
      paragraphs: [
        {
          startIndex: 4,
          paragraphStyle: {
            spaceAbove: { v: 0 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 5,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 12,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 13,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 127,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
            // hanging: 20,
            // indentStart: 50,
            // indentEnd: 50,
            // indentFirstLine: 50,
          }
        },
        {
          startIndex: 128,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 244,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 245,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 398,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 399,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 618,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 619,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 824,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 825,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1007,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1008,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1130,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1131,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1203,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1204,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1238,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1239,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1256,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1257,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1282,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1283,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1380,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1381,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1396,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1397,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1398,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1399,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1457,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1458,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1559,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1560,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1566,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1670,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1671,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1728,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1729,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1811,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1812,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1912,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 1913,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2053,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2054,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2190,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2191,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2341,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2342,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2481,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2482,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2582,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2583,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2750,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2751,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2853,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2854,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2948,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 2949,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        },
        {
          startIndex: 3065,
          paragraphStyle: {
            spaceAbove: { v: 10 },
            lineSpacing: 2,
            spaceBelow: { v: 0 }
          }
        }
      ],
      sectionBreaks: [
        {
          startIndex: 3066
          // columnProperties: [
          //     {
          //         width: ptToPixel(240),
          //         paddingEnd: ptToPixel(15),
          //     },
          // ],
          // columnSeparatorType: ColumnSeparatorType.NONE,
          // sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
          // textDirection: textDirectionDocument,
          // contentDirection: textDirection!,
        }
      ],
      customBlocks: [],
      tables: []
    },
    documentStyle: {
      pageSize: {
        width: ptToPixel(595),
        height: ptToPixel(842)
      },
      documentFlavor: 1 /* TRADITIONAL */,
      marginTop: ptToPixel(50),
      marginBottom: ptToPixel(50),
      marginRight: ptToPixel(50),
      marginLeft: ptToPixel(50),
      renderConfig: {
        vertexAngle: 0,
        centerAngle: 0
      },
      defaultHeaderId: "",
      defaultFooterId: "",
      evenPageHeaderId: "",
      evenPageFooterId: "",
      firstPageHeaderId: "",
      firstPageFooterId: "",
      evenAndOddHeaders: 0 /* FALSE */,
      useFirstPageHeaderFooter: 0 /* FALSE */,
      marginHeader: 30,
      marginFooter: 30
    }
  };
  return DEFAULT_DOCUMENT_DATA_CN;
}

// ../common/debugger/src/controllers/e2e/data/default-sheet.ts
function getDefaultWorkbookData() {
  const DEFAULT_WORKBOOK_DATA_DEMO2 = {
    id: "test",
    appVersion: "3.0.0-alpha",
    sheets: {
      sheet1: {
        id: "sheet1",
        name: "sheet1",
        cellData: {
          0: {
            3: {
              f: "=SUM(A1)",
              si: "3e4r5t"
            }
          },
          1: {
            3: {
              f: "=SUM(A2)",
              si: "OSPtzm"
            }
          },
          2: {
            3: {
              si: "OSPtzm"
            }
          },
          3: {
            3: {
              si: "OSPtzm"
            }
          }
        },
        rowCount: 100,
        columnCount: 100
      }
    },
    locale: "zhCN" /* ZH_CN */,
    name: "",
    sheetOrder: [],
    styles: {},
    resources: []
  };
  return DEFAULT_WORKBOOK_DATA_DEMO2;
}

// ../common/debugger/src/controllers/e2e/e2e.controller.ts
var AWAIT_LOADING_TIMEOUT = 5e3;
var AWAIT_DISPOSING_TIMEOUT = 5e3;
var E2EController = class extends Disposable {
  constructor(_univerInstanceService, _themeService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_themeService", _themeService);
    this._initPlugin();
  }
  dispose() {
    window.E2EControllerAPI = void 0;
  }
  _initPlugin() {
    window.E2EControllerAPI = {
      loadAndRelease: (id, loadTimeout, disposeTimeout) => this._loadAndRelease(id, loadTimeout, disposeTimeout),
      loadDefaultSheet: (loadTimeout) => this._loadDefaultSheet(loadTimeout),
      loadDemoSheet: () => this._loadDemoSheet(),
      loadMergeCellSheet: () => this._loadMergeCellSheet(2e3),
      loadDefaultStyleSheet: (loadTimeout) => this._loadDefaultStyleSheet(loadTimeout),
      disposeCurrSheetUnit: (disposeTimeout) => this._disposeDefaultSheetUnit(disposeTimeout),
      setDarkMode: (darkMode) => this._setDarkMode(darkMode),
      loadDefaultDoc: (loadTimeout) => this._loadDefaultDoc(loadTimeout),
      disposeUniver: () => this._disposeUniver()
    };
  }
  _setDarkMode(darkMode) {
    this._themeService.setDarkMode(darkMode);
  }
  async _loadAndRelease(releaseId, loadingTimeout = AWAIT_LOADING_TIMEOUT, disposingTimeout = AWAIT_DISPOSING_TIMEOUT) {
    const unitId = `e2e${releaseId}`;
    const snapshot = getDefaultWorkbookData();
    snapshot.id = unitId;
    this._univerInstanceService.createUnit(2 /* UNIVER_SHEET */, snapshot);
    await awaitTime(loadingTimeout);
    this._univerInstanceService.disposeUnit(unitId);
    await awaitTime(disposingTimeout);
  }
  async _loadDefaultSheet(loadingTimeout = AWAIT_LOADING_TIMEOUT) {
    this._univerInstanceService.createUnit(2 /* UNIVER_SHEET */, getDefaultWorkbookData());
    await awaitTime(loadingTimeout);
  }
  async _loadDemoSheet() {
    this._univerInstanceService.createUnit(2 /* UNIVER_SHEET */, DEFAULT_WORKBOOK_DATA_DEMO);
    await awaitTime(AWAIT_LOADING_TIMEOUT);
  }
  /**
   * sheet-003 in default data
   */
  async _loadMergeCellSheet(loadingTimeout = AWAIT_LOADING_TIMEOUT) {
    const data = { ...DEFAULT_WORKBOOK_DATA_DEMO };
    data.sheetOrder = ["sheet-0003"];
    this._univerInstanceService.createUnit(2 /* UNIVER_SHEET */, data);
    await awaitTime(loadingTimeout);
  }
  async _loadDefaultStyleSheet(loadingTimeout = AWAIT_LOADING_TIMEOUT) {
    const data = { ...DEFAULT_WORKBOOK_DATA_DEMO_DEFAULT_STYLE };
    this._univerInstanceService.createUnit(2 /* UNIVER_SHEET */, data);
    await awaitTime(loadingTimeout);
  }
  async _loadDefaultDoc(loadingTimeout = AWAIT_LOADING_TIMEOUT) {
    this._univerInstanceService.createUnit(1 /* UNIVER_DOC */, getDefaultDocData());
    await awaitTime(loadingTimeout);
  }
  async _disposeUniver() {
    var _a;
    (_a = window.univer) == null ? void 0 : _a.dispose();
    window.univer = void 0;
    window.univerAPI = void 0;
  }
  async _disposeDefaultSheetUnit(disposingTimeout = AWAIT_DISPOSING_TIMEOUT) {
    const unit = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const unitId = unit == null ? void 0 : unit.getUnitId();
    await this._univerInstanceService.disposeUnit(unitId || "");
    await awaitTime(disposingTimeout);
  }
};
E2EController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(ThemeService))
], E2EController);

// ../common/debugger/src/controllers/performance-monitor.controller.ts
var PerformanceMonitorController = class extends RxDisposable {
  constructor(lifecycleService, _instanceService, _renderManagerService) {
    super();
    __publicField(this, "_instanceService", _instanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_containerElement");
    __publicField(this, "_currentUnitSub");
    lifecycleService.subscribeWithPrevious().pipe(
      filter((stage) => stage === 2 /* Rendered */),
      take(1)
    ).subscribe(() => this._listenDocumentTypeChange());
  }
  dispose() {
    super.dispose();
    this._disposeCurrentObserver();
  }
  _disposeCurrentObserver() {
    var _a;
    (_a = this._currentUnitSub) == null ? void 0 : _a.unsubscribe();
    this._currentUnitSub = null;
  }
  _listenDocumentTypeChange() {
    this._instanceService.focused$.pipe(takeUntil(this.dispose$), distinctUntilChanged()).subscribe((unitId) => {
      this._disposeCurrentObserver();
      if (unitId) {
        this._listenToRenderer(unitId);
      }
    });
  }
  _listenToRenderer(unitId) {
    const renderer = this._renderManagerService.getRenderById(unitId);
    if (renderer) {
      const { engine } = renderer;
      this._currentUnitSub = engine.endFrame$.subscribe(() => {
        if (!this._containerElement) {
          this._containerElement = document.querySelector("[data-u-comp=debugger-fps]");
        } else {
          this._containerElement.textContent = `FPS: ${Math.round(engine.getFps()).toString()}`;
        }
      });
    }
  }
};
PerformanceMonitorController = __decorateClass([
  __decorateParam(0, Inject(LifecycleService)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, IRenderManagerService)
], PerformanceMonitorController);

// ../common/debugger/src/plugin.ts
var UniverDebuggerPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_debuggerController");
    const { menu: menu9, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu9) {
      this._configService.setConfig("menu", menu9, { merge: true });
    }
    this._configService.setConfig(DEBUGGER_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    var _a;
    const dependencies = [
      [DebuggerController],
      [E2EController],
      [UniverWatermarkMenuController]
    ];
    if (((_a = this._config.performanceMonitor) == null ? void 0 : _a.enabled) !== false) {
      dependencies.push([PerformanceMonitorController]);
    }
    registerDependencies(this._injector, dependencies);
    touchDependencies(this._injector, [
      [E2EController]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [DebuggerController]
    ]);
  }
  onRendered() {
    touchDependencies(this._injector, [
      [PerformanceMonitorController],
      [UniverWatermarkMenuController]
    ]);
  }
  getDebuggerController() {
    this._debuggerController = this._injector.get(DebuggerController);
    return this._debuggerController;
  }
};
__publicField(UniverDebuggerPlugin, "pluginName", "UNIVER_DEBUGGER_PLUGIN");
__publicField(UniverDebuggerPlugin, "packageName", package_default2.name);
__publicField(UniverDebuggerPlugin, "version", package_default2.version);
UniverDebuggerPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverDebuggerPlugin);

export {
  InsertDocImageCommand,
  UniverDocsDrawingUIPlugin,
  UniverDebuggerPlugin
};
