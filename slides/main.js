import {
  DEFAULT_SLIDE_DATA,
  ObjectProvider,
  UniverSlidesPlugin
} from "../chunk-VEBN3ADF.js";
import {
  DOCS_COMPONENT_MAIN_LAYER_INDEX,
  DRAWING_IMAGE_ALLOW_IMAGE_LIST,
  DeleteLeftCommand,
  DocSelectionManagerService,
  DocSelectionRenderService,
  DocSkeletonManagerService,
  IEditorService,
  MoveCursorOperation,
  MoveSelectionOperation,
  RichTextEditingMutation,
  UniverDocsPlugin,
  UniverDocsUIPlugin,
  UniverDrawingPlugin,
  getImageSize
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  AutofillDoubleIcon,
  BottomIcon,
  Button,
  ColorPicker,
  ComponentManager,
  DISABLE_AUTO_FOCUS_KEY,
  Dropdown,
  GraphIcon,
  ICanvasPopupService,
  ILayoutService,
  ILocalFileService,
  IMenuManagerService,
  IShortcutService,
  ISidebarService,
  IUIPartsService,
  InputNumber,
  MoreDownIcon,
  MoveDownIcon,
  MoveUpIcon,
  PaintBucketDoubleIcon,
  TextIcon,
  TopmostIcon,
  UniverUIPlugin,
  borderClassName,
  borderTopClassName,
  clsx,
  connectInjector,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useDependency,
  useObservable
} from "../chunk-VNXQUZSG.js";
import {
  zh_CN_default
} from "../chunk-QRLMZA6Y.js";
import "../chunk-YVPSS3XX.js";
import {
  UniverFormulaEnginePlugin
} from "../chunk-Q6Y4PHRI.js";
import {
  FIX_ONE_PIXEL_BLUR_OFFSET,
  IRenderManagerService,
  Rect,
  Scene,
  ScrollBar,
  Slide,
  UniverRenderEnginePlugin,
  Viewport,
  convertTextRotation,
  fixLineWidthByScale,
  getCurrentTypeOfRenderer,
  pxToNum
} from "../chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  DEFAULT_EMPTY_DOCUMENT_VALUE,
  Disposable,
  DisposableCollection,
  DocumentDataModel,
  EDITOR_ACTIVATED,
  FOCUSING_COMMON_DRAWINGS,
  FOCUSING_EDITOR_BUT_HIDDEN,
  FOCUSING_EDITOR_STANDALONE,
  FOCUSING_UNIVER_EDITOR,
  FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
  FORMULA_EDITOR_ACTIVATED,
  ICommandService,
  IConfigService,
  IContextService,
  IImageIoService,
  IUndoRedoService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  RxDisposable,
  Subject,
  Univer,
  createIdentifier,
  createInternalEditorID,
  debounce_default,
  filter,
  generateRandomId,
  getColorStyle,
  mergeOverrideWithDependencies,
  merge_default,
  takeUntil,
  toDisposable
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "../chunk-24OICD5T.js";

// ../packages/slides-ui/src/controllers/slide.render-controller.ts
var SlideRenderController = class extends RxDisposable {
  constructor(_renderContext, _injector, _univerInstanceService, _renderManagerService) {
    super();
    __publicField(this, "_renderContext", _renderContext);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_objectProvider", null);
    __publicField(this, "_refreshThumb", debounce_default(() => {
      this.createThumbs();
    }, 300));
    this._objectProvider = this._injector.createInstance(ObjectProvider);
    this._addNewRender();
  }
  _addNewRender() {
    const { unitId, engine, scene } = this._renderContext;
    const slideDataModel = this._getCurrUnitModel();
    if (!slideDataModel) return;
    const observer = engine.onTransformChange$.subscribeEvent(() => {
      this._scrollToCenter();
      observer == null ? void 0 : observer.unsubscribe();
    });
    engine.onTransformChange$.subscribeEvent(() => {
      setTimeout(() => {
        this.createThumbs();
      }, 300);
    });
    const viewMain = new Viewport("__mainView__" /* VIEW */, scene, {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      explicitViewportWidthSet: false,
      explicitViewportHeightSet: false,
      isWheelPreventDefaultX: true
    });
    scene.attachControl();
    scene.onMouseWheel$.subscribeEvent((evt, state) => {
      const e = evt;
      if (e.ctrlKey) {
        const deltaFactor = Math.abs(e.deltaX);
        let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
        scrollNum *= e.deltaY > 0 ? -1 : 1;
        if (scene.scaleX < 1) {
          scrollNum /= 2;
        }
        if (scene.scaleX + scrollNum > 4) {
          scene.scale(4, 4);
        } else if (scene.scaleX + scrollNum < 0.1) {
          scene.scale(0.1, 0.1);
        } else {
          const value = e.deltaY > 0 ? 0.1 : -0.1;
          e.preventDefault();
        }
      } else {
        viewMain.onMouseWheel(e, state);
      }
    });
    scene.onFileLoaded$.subscribeEvent(() => {
      this._refreshThumb();
    });
    ScrollBar.attachTo(viewMain);
    const slide = this._createSlide(scene);
    this._renderContext.mainComponent = slide;
    this._createSlidePages(slideDataModel, slide);
    this.createThumbs();
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
  _scrollToCenter() {
    var _a;
    const mainScene = (_a = this._currentRender()) == null ? void 0 : _a.scene;
    const viewMain = mainScene == null ? void 0 : mainScene.getViewport("__mainView__" /* VIEW */);
    const getCenterPositionViewPort = this._getCenterPositionViewPort(mainScene);
    if (!viewMain || !getCenterPositionViewPort) return;
    const { left: viewPortLeft, top: viewPortTop } = getCenterPositionViewPort;
    const { x, y } = viewMain.transViewportScroll2ScrollValue(viewPortLeft, viewPortTop);
    viewMain.scrollToBarPos({
      x,
      y
    });
  }
  _currentRender() {
    return getCurrentTypeOfRenderer(3 /* UNIVER_SLIDE */, this._univerInstanceService, this._renderManagerService);
  }
  /**
   * @param mainScene
   */
  _createSlide(mainScene) {
    const model = this._univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
    const { width: sceneWidth, height: sceneHeight } = mainScene;
    const pageSize = model.getPageSize();
    const { width = 100, height = 100 } = pageSize;
    const slideComponent = new Slide("__slideRender__" /* COMPONENT */, {
      left: (sceneWidth - width) / 2,
      top: (sceneHeight - height) / 2,
      width,
      height,
      zIndex: 10
    });
    slideComponent.enableSelectedClipElement();
    mainScene.addObject(slideComponent);
    return slideComponent;
  }
  _addBackgroundRect(scene, fill) {
    const model = this._univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
    const pageSize = model.getPageSize();
    const { width: pageWidth = 0, height: pageHeight = 0 } = pageSize;
    const page = new Rect("canvas", {
      left: 0,
      top: 0,
      width: pageWidth,
      height: pageHeight,
      strokeWidth: 1,
      stroke: "rgba(198,198,198,1)",
      fill: getColorStyle(fill) || "rgba(255,255,255,1)",
      zIndex: 0,
      evented: false
    });
    scene.addObject(page, 0);
  }
  _getCenterPositionViewPort(mainScene) {
    if (!mainScene) return { left: 0, top: 0 };
    const { width, height } = mainScene;
    const engine = mainScene.getEngine();
    const canvasWidth = (engine == null ? void 0 : engine.width) || 0;
    const canvasHeight = (engine == null ? void 0 : engine.height) || 0;
    return {
      left: (width - canvasWidth) / 2,
      top: (height - canvasHeight) / 2
    };
  }
  _thumbSceneRender(pageId, slide) {
    const render = this._renderManagerService.getRenderById(pageId);
    if (render == null) {
      return;
    }
    const { engine: thumbEngine } = render;
    if (thumbEngine == null) {
      return;
    }
    const { width, height } = slide;
    const { width: pageWidth = width, height: pageHeight = height } = thumbEngine;
    const thumbContext = thumbEngine.getCanvas().getContext();
    slide.renderToThumb(thumbContext, pageId, pageWidth / width, pageHeight / height);
  }
  /**
   * CreateScene by pages, and activate first one.
   * @param slideDataModel
   * @param slide
   */
  _createSlidePages(slideDataModel, slide) {
    const pages = slideDataModel.getPages();
    const pageOrder = slideDataModel.getPageOrder();
    if (!pages || !pageOrder) {
      return;
    }
    if (pageOrder.length === 0) {
      return;
    }
    for (let i = 0, len = pageOrder.length; i < len; i++) {
      const pageId = pageOrder[i];
      this.createPageScene(pageId, pages[pageId]);
      this._createThumb(pageId);
    }
    slide.activeFirstPage();
  }
  _createThumb(pageId) {
    this._renderManagerService.createRender(pageId);
  }
  /**
   * SlideDataModel is UnitModel
   */
  _getCurrUnitModel() {
    return this._renderContext.unit;
  }
  activePage(_pageId) {
    let pageId = _pageId;
    const model = this._getCurrUnitModel();
    let page;
    if (pageId) {
      page = model.getPage(pageId);
    } else {
      const pageElements = model.getPages();
      const pageOrder = model.getPageOrder();
      if (pageOrder == null || pageElements == null) {
        return;
      }
      page = pageElements[pageOrder[0]];
      pageId = page.id;
    }
    const render = this._currentRender();
    if (page == null || render == null || render.mainComponent == null) {
      return;
    }
    const { id } = page;
    const slide = render.mainComponent;
    model.setActivePage(page);
    if (slide == null ? void 0 : slide.hasPage(id)) {
      slide.changePage(id);
      return;
    }
    this.createPageScene(id, page);
  }
  createThumbs() {
    const slideDataModel = this._getCurrUnitModel();
    const pageOrder = slideDataModel.getPageOrder();
    const render = this._currentRender();
    if (!pageOrder || !render) {
      return;
    }
    if (pageOrder.length === 0) {
      return;
    }
    for (let i = 0, len = pageOrder.length; i < len; i++) {
      const pageId = pageOrder[i];
      this._thumbSceneRender(pageId, render.mainComponent);
    }
  }
  /**
   * Create scene by page and set to _sceneMap.
   * @param pageId
   * @param page
   */
  createPageScene(pageId, page) {
    const render = this._renderContext;
    if (!render || !this._objectProvider) {
      return;
    }
    const { scene: mainScene, mainComponent } = render;
    const slide = mainComponent;
    const { width, height } = slide;
    const pageScene = new Scene(pageId, slide, {
      width,
      height
    });
    const viewMain = new Viewport(`PageViewer_${pageId}`, pageScene, {
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      explicitViewportWidthSet: false,
      explicitViewportHeightSet: false
    });
    viewMain.closeClip();
    const { pageElements, pageBackgroundFill } = page;
    const objects = this._objectProvider.convertToRenderObjects(pageElements, mainScene);
    if (!objects || !slide) return;
    this._addBackgroundRect(pageScene, pageBackgroundFill);
    pageScene.addObjects(objects);
    pageScene.initTransformer();
    objects.forEach((object) => {
      pageScene.attachTransformerTo(object);
    });
    const transformer = pageScene.getTransformer();
    transformer == null ? void 0 : transformer.changeEnd$.subscribe(() => {
      this._thumbSceneRender(pageId, slide);
    });
    transformer == null ? void 0 : transformer.clearControl$.subscribe(() => {
      this._thumbSceneRender(pageId, slide);
    });
    slide.addPageScene(pageScene);
    return pageScene;
  }
  /**
   * Get pageScene from Slide.
   * @param pageId
   * @returns {Scene, Engine, UnitModel} scene & engine & unit from renderContext
   */
  getPageRenderUnit(pageId) {
    const subsceneMap = this._renderContext.mainComponent.getSubScenes();
    const pageScene = subsceneMap.get(pageId);
    const { engine, unit } = this._renderContext;
    return {
      scene: pageScene,
      engine,
      unit
    };
  }
  createObjectToPage(element, pageID) {
    const { scene } = this.getPageRenderUnit(pageID);
    if (!scene || !this._objectProvider) {
      return;
    }
    const object = this._objectProvider.convertToRenderObject(element, scene);
    if (object) {
      scene.addObject(object);
      scene.attachTransformerTo(object);
      scene.getLayer().makeDirty();
      return object;
    }
  }
  setObjectActiveByPage(obj, pageID) {
    const { scene } = this.getPageRenderUnit(pageID);
    if (!scene) return;
    const transformer = scene.getTransformer();
    transformer == null ? void 0 : transformer.activeAnObject(obj);
  }
  removeObjectById(id, pageID) {
    const { scene } = this.getPageRenderUnit(pageID);
    if (!scene) return;
    scene.removeObject(id);
    const transformer = scene.getTransformer();
    transformer == null ? void 0 : transformer.clearControls();
  }
  appendPage() {
    const model = this._getCurrUnitModel();
    const page = model.getBlankPage();
    const render = this._currentRender();
    if (page == null || render == null || render.mainComponent == null) {
      return;
    }
    const { id: pageId } = page;
    const slide = render.mainComponent;
    const scene = this.createPageScene(pageId, page);
    if (slide && scene) {
      slide.addPageScene(scene);
    }
    model.appendPage(page);
    model.setActivePage(page);
  }
};
SlideRenderController = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, IRenderManagerService)
], SlideRenderController);

// ../packages/slides-ui/src/controllers/canvas-view.ts
var CanvasView = class extends RxDisposable {
  constructor(_renderManagerService) {
    super();
    __publicField(this, "_renderManagerService", _renderManagerService);
  }
  _getSlideRenderControllerFromRenderUnit(unitId) {
    const renderUnit = this._renderManagerService.getRenderById(unitId);
    const slideRC = renderUnit.with(SlideRenderController);
    return slideRC;
  }
  createThumbs(unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    slideRC.createThumbs();
  }
  activePage(pageId, unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    slideRC.activePage(pageId);
  }
  getRenderUnitByPageId(pageId, unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    return slideRC.getPageRenderUnit(pageId);
  }
  createObjectToPage(element, pageID, unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    return slideRC.createObjectToPage(element, pageID);
  }
  setObjectActiveByPage(obj, pageID, unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    return slideRC.setObjectActiveByPage(obj, pageID);
  }
  removeObjectById(id, pageID, unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    slideRC.removeObjectById(id, pageID);
  }
  /**
   * append blank page
   */
  appendPage(unitId) {
    const slideRC = this._getSlideRenderControllerFromRenderUnit(unitId);
    slideRC.appendPage();
  }
};
CanvasView = __decorateClass([
  __decorateParam(0, IRenderManagerService)
], CanvasView);

// ../packages/slides-ui/src/commands/operations/activate.operation.ts
var ActivateSlidePageOperation = {
  id: "slide.operation.activate-slide",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    var _a, _b;
    const unitId = params.unitId;
    const canvasView = accessor.get(CanvasView);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const model = univerInstanceService.getUnit(unitId);
    const pageId = (_a = model == null ? void 0 : model.getActivePage()) == null ? void 0 : _a.id;
    if (!pageId) return false;
    const page = canvasView.getRenderUnitByPageId(pageId, unitId);
    if (!page) return false;
    const transformer = (_b = page.scene) == null ? void 0 : _b.getTransformer();
    if (transformer) {
      transformer.clearControls();
    }
    canvasView.activePage(params.id, unitId);
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/append-slide.operation.ts
var AppendSlideOperation = {
  id: "slide.operation.append-slide",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const unitId = params.unitId;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const canvasView = accessor.get(CanvasView);
    canvasView.appendPage(unitId);
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/delete-element.operation.ts
var DeleteSlideElementOperation = {
  id: "slide.operation.delete-element",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    if (!(params == null ? void 0 : params.id)) return false;
    const unitId = params.unitId;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    delete activePage.pageElements[params.id];
    slideData.updatePage(activePage.id, activePage);
    const canvasview = accessor.get(CanvasView);
    canvasview.removeObjectById(params.id, activePage.id, unitId);
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/insert-image.operation.ts
var InsertSlideFloatImageCommand = {
  id: "slide.command.insert-float-image",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    var _a;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const unitId = (_a = univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */)) == null ? void 0 : _a.getUnitId();
    if (!unitId) return false;
    const fileOpenerService = accessor.get(ILocalFileService);
    const files = await fileOpenerService.openFile({
      multiple: true,
      accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image2) => `.${image2.replace("image/", "")}`).join(",")
    });
    if (files.length !== 1) return false;
    const imageIoService = accessor.get(IImageIoService);
    const imageParam = await imageIoService.saveImage(files[0]);
    if (!imageParam) return false;
    const { imageId, imageSourceType, source, base64Cache } = imageParam;
    const { width, height, image } = await getImageSize(base64Cache || "");
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    const elements = Object.values(activePage.pageElements);
    const maxIndex = (elements == null ? void 0 : elements.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
    const data = {
      id: imageId,
      zIndex: maxIndex + 1,
      left: 0,
      top: 0,
      width,
      height,
      title: "",
      description: "",
      type: 1 /* IMAGE */,
      image: {
        imageProperties: {
          contentUrl: base64Cache,
          imageSourceType,
          source,
          base64Cache,
          image
        }
      }
    };
    activePage.pageElements[imageId] = data;
    slideData.updatePage(activePage.id, activePage);
    const canvasView = accessor.get(CanvasView);
    const sceneObject = canvasView.createObjectToPage(data, activePage.id, unitId);
    if (sceneObject) {
      canvasView.setObjectActiveByPage(sceneObject, activePage.id, unitId);
    }
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/update-element.operation.ts
var UpdateSlideElementOperation = {
  id: "slide.operation.update-element",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const { oKey, props } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const unitId = params == null ? void 0 : params.unitId;
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    activePage.pageElements[oKey] = merge_default(activePage.pageElements[oKey], props);
    slideData.updatePage(activePage.id, activePage);
    return true;
  }
};

// ../packages/slides-ui/src/components/panels/ArrangePanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
function ArrangePanel(props) {
  const { pageId, unitId } = props;
  const localeService = useDependency(LocaleService);
  const canvasView = useDependency(CanvasView);
  const commandService = useDependency(ICommandService);
  const page = canvasView.getRenderUnitByPageId(pageId, unitId);
  const scene = page == null ? void 0 : page.scene;
  if (!scene) return null;
  const transformer = scene.getTransformer();
  if (!transformer) return null;
  const selectedObjects = transformer.getSelectedObjectMap();
  const object = selectedObjects.values().next().value;
  if (!object) return null;
  const onArrangeBtnClick = (arrangeType) => {
    const allObjects = scene.getAllObjects();
    const [minZIndex, maxZIndex] = allObjects.reduce(([min, max], obj) => {
      const zIndex2 = obj.zIndex;
      const minZIndex2 = zIndex2 < min ? zIndex2 : min;
      const maxZIndex2 = zIndex2 > max ? zIndex2 : max;
      return [minZIndex2, maxZIndex2];
    }, [0, 0]);
    let zIndex = object.zIndex;
    if (arrangeType === 3 /* back */) {
      zIndex = minZIndex - 1;
    } else if (arrangeType === 2 /* front */) {
      zIndex = maxZIndex + 1;
    } else if (arrangeType === 0 /* forward */) {
      zIndex = object.zIndex + 1;
    } else if (arrangeType === 1 /* backward */) {
      zIndex = object.zIndex - 1;
    }
    object.setProps({
      zIndex
    });
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      unitId,
      oKey: object == null ? void 0 : object.oKey,
      props: {
        zIndex
      }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-relative univer-w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: `univer-w-full univer-text-left univer-text-gray-600 dark:!univer-text-gray-200`,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: localeService.t("slides-ui.image-panel.arrange.title") })
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-w-1/2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: () => {
        onArrangeBtnClick(0 /* forward */);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "univer-flex univer-items-center univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveUpIcon, {}),
        localeService.t("slides-ui.image-panel.arrange.forward")
      ] }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-w-1/2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: () => {
        onArrangeBtnClick(1 /* backward */);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "univer-flex univer-items-center univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveDownIcon, {}),
        localeService.t("slides-ui.image-panel.arrange.backward")
      ] }) }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-w-1/2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: () => {
        onArrangeBtnClick(2 /* front */);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "univer-flex univer-items-center univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopmostIcon, {}),
        localeService.t("slides-ui.image-panel.arrange.front")
      ] }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-w-1/2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: () => {
        onArrangeBtnClick(3 /* back */);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "univer-flex univer-items-center univer-gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomIcon, {}),
        localeService.t("slides-ui.image-panel.arrange.back")
      ] }) }) })
    ] })
  ] });
}

// ../packages/slides-ui/src/components/panels/FillPanel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
function ArrangePanel2(props) {
  var _a, _b;
  const { pageId, unitId } = props;
  const localeService = useDependency(LocaleService);
  const canvasView = useDependency(CanvasView);
  const commandService = useDependency(ICommandService);
  const page = canvasView.getRenderUnitByPageId(pageId, unitId);
  const scene = page == null ? void 0 : page.scene;
  if (!scene) return null;
  const transformer = scene.getTransformer();
  if (!transformer) return null;
  const selectedObjects = transformer.getSelectedObjectMap();
  const object = selectedObjects.values().next().value;
  if (!object) return null;
  const [color, setColor] = (0, import_react.useState)((_b = (_a = object.fill) == null ? void 0 : _a.toString()) != null ? _b : "");
  function handleChangeColor(color2) {
    object == null ? void 0 : object.setProps({
      fill: color2
    });
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      unitId,
      oKey: object == null ? void 0 : object.oKey,
      props: {
        shape: {
          shapeProperties: {
            shapeBackgroundFill: {
              rgb: color2
            }
          }
        }
      }
    });
    setColor(color2);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: clsx("univer-relative univer-bottom-0 univer-mt-5 univer-w-full", borderTopClassName),
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-relative univer-w-full", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: `univer-w-full univer-text-left univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: localeService.t("slides-ui.panel.fill.title") })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-w-1/2", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          Dropdown,
          {
            overlay: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-rounded-lg univer-p-4", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              ColorPicker,
              {
                value: "#fff",
                onChange: handleChangeColor
              }
            ) }),
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("a", { className: "univer-flex univer-cursor-pointer univer-items-center univer-gap-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PaintBucketDoubleIcon, { className: "univer-fill-primary-600" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MoreDownIcon, {})
            ] })
          }
        ) }) })
      ] })
    }
  );
}

// ../packages/slides-ui/src/components/panels/TransformPanel.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function TransformPanel(props) {
  const { pageId, unitId } = props;
  const localeService = useDependency(LocaleService);
  const canvasView = useDependency(CanvasView);
  const commandService = useDependency(ICommandService);
  const page = canvasView.getRenderUnitByPageId(pageId, unitId);
  const scene = page == null ? void 0 : page.scene;
  if (!scene) return null;
  const transformer = scene.getTransformer();
  if (!transformer) return null;
  const selectedObjects = transformer.getSelectedObjectMap();
  const object = selectedObjects.values().next().value;
  if (!object) return null;
  const {
    width: originWidth = 0,
    height: originHeight = 0,
    left: originX = 0,
    top: originY = 0,
    angle: originRotation = 0
  } = object;
  const [width, setWidth] = (0, import_react2.useState)(originWidth);
  const [height, setHeight] = (0, import_react2.useState)(originHeight);
  const [xPosition, setXPosition] = (0, import_react2.useState)(originX);
  const [yPosition, setYPosition] = (0, import_react2.useState)(originY);
  const [rotation, setRotation] = (0, import_react2.useState)(originRotation);
  const changeObs = (state) => {
    const { objects } = state;
    const object2 = objects.values().next().value;
    const {
      width: originWidth2 = 0,
      height: originHeight2 = 0,
      left: originX2 = 0,
      top: originY2 = 0,
      angle: originRotation2 = 0
    } = object2;
    setWidth(originWidth2);
    setHeight(originHeight2);
    setXPosition(originX2);
    setYPosition(originY2);
    setRotation(originRotation2);
  };
  (0, import_react2.useEffect)(() => {
    const changeStartSub = transformer.changeStart$.subscribe((state) => {
      changeObs(state);
    });
    const changingSub = transformer.changing$.subscribe((state) => {
      changeObs(state);
    });
    return () => {
      changingSub.unsubscribe();
      changeStartSub.unsubscribe();
    };
  }, []);
  function handleWidthChange(val) {
    if (!val || !object) return;
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      pageId,
      oKey: object.oKey,
      props: {
        width: val
      }
    });
    object == null ? void 0 : object.resize(val, object.height);
    setWidth(val);
    transformer == null ? void 0 : transformer.refreshControls();
  }
  function handleHeightChange(val) {
    if (!val || !object) return;
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      pageId,
      oKey: object.oKey,
      props: {
        height: val
      }
    });
    object == null ? void 0 : object.resize(object.width, val);
    setHeight(val);
    transformer == null ? void 0 : transformer.refreshControls();
  }
  function handleXChange(val) {
    if (!val || !object) return;
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      pageId,
      oKey: object.oKey,
      props: {
        left: val
      }
    });
    object == null ? void 0 : object.translate(val, object.top);
    setXPosition(val);
    transformer == null ? void 0 : transformer.refreshControls();
  }
  function handleYChange(val) {
    if (!val || !object) return;
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      pageId,
      oKey: object.oKey,
      props: {
        right: val
      }
    });
    object == null ? void 0 : object.translate(object.left, val);
    setYPosition(val);
    transformer == null ? void 0 : transformer.refreshControls();
  }
  function handleChangeRotation(val) {
    if (!val || !object) return;
    commandService.executeCommand(UpdateSlideElementOperation.id, {
      pageId,
      oKey: object.oKey,
      props: {
        angle: val
      }
    });
    object == null ? void 0 : object.transformByState({
      angle: val
    });
    setRotation(val);
    transformer == null ? void 0 : transformer.refreshControls();
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: clsx("univer-grid univer-gap-2 univer-py-2 univer-text-gray-400", borderTopClassName),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "header",
          {
            className: `univer-text-gray-600 dark:!univer-text-gray-200`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: localeService.t("slides-ui.image-panel.transform.title") })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: `univer-grid univer-grid-cols-3 univer-gap-2 [&>div]:univer-grid [&>div]:univer-gap-2`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("slides-ui.image-panel.transform.width") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  InputNumber,
                  {
                    min: 1,
                    value: width,
                    onChange: (val) => {
                      handleWidthChange(val);
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("slides-ui.image-panel.transform.height") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  InputNumber,
                  {
                    min: 1,
                    value: height,
                    onChange: (val) => {
                      handleHeightChange(val);
                    }
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-relative univer-mt-2.5 univer-flex univer-h-full", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("slides-ui.image-panel.transform.x") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InputNumber, { min: 0, precision: 1, value: xPosition, onChange: (val) => {
              handleXChange(val);
            } })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("slides-ui.image-panel.transform.y") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InputNumber, { min: 0, precision: 1, value: yPosition, onChange: (val) => {
              handleYChange(val);
            } })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: localeService.t("slides-ui.image-panel.transform.rotate") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              InputNumber,
              {
                precision: 1,
                value: rotation,
                onChange: handleChangeRotation
              }
            )
          ] })
        ] })
      ]
    }
  );
}

// ../packages/slides-ui/src/components/sidebar/Sidebar.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var COMPONENT_SLIDE_SIDEBAR = "COMPONENT_SLIDE_SIDEBAR";
function RectSidebar() {
  var _a, _b, _c;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const canvasView = useDependency(CanvasView);
  const currentSlide = univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
  const pageId = (_a = currentSlide == null ? void 0 : currentSlide.getActivePage()) == null ? void 0 : _a.id;
  const unitId = ((_b = univerInstanceService.getFocusedUnit()) == null ? void 0 : _b.getUnitId()) || "";
  if (!pageId || !unitId) return null;
  const page = canvasView.getRenderUnitByPageId(pageId, unitId);
  const transformer = (_c = page.scene) == null ? void 0 : _c.getTransformer();
  if (!transformer) return null;
  const selectedObjects = transformer.getSelectedObjectMap();
  const object = selectedObjects.values().next().value;
  if (!object) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "univer-p-2 univer-text-center univer-text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ArrangePanel, { pageId, unitId }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(TransformPanel, { pageId, unitId }),
    object.objectType === 4 /* RECT */ && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ArrangePanel2, { pageId, unitId })
  ] });
}

// ../packages/slides-ui/src/commands/operations/insert-shape.operation.ts
var InsertSlideShapeRectangleCommand = {
  id: "slide.command.insert-float-shape.rectangle",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    var _a;
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);
    const unitId = (_a = instanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    return commandService.executeCommand(InsertSlideShapeRectangleOperation.id, { unitId });
  }
};
var InsertSlideShapeRectangleOperation = {
  id: "slide.operation.insert-float-shape.rectangle",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    const id = generateRandomId(6);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const unitId = params.unitId;
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    const elements = Object.values(activePage.pageElements);
    const maxIndex = (elements == null ? void 0 : elements.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
    const data = {
      id,
      zIndex: maxIndex + 1,
      left: 378,
      top: 142,
      width: 250,
      height: 250,
      title: id,
      description: "",
      type: 0 /* SHAPE */,
      shape: {
        shapeType: "rect" /* Rect */,
        text: "",
        shapeProperties: {
          shapeBackgroundFill: {
            rgb: "rgb(0,0,255)"
          }
        }
      }
    };
    activePage.pageElements[id] = data;
    slideData.updatePage(activePage.id, activePage);
    const canvasview = accessor.get(CanvasView);
    const sceneObject = canvasview.createObjectToPage(data, activePage.id, unitId);
    if (sceneObject) {
      canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
    }
    return true;
  }
};
var ToggleSlideEditSidebarOperation = {
  id: "sidebar.operation.slide-shape",
  type: 0 /* COMMAND */,
  handler: async (accessor, params) => {
    const { visible, objectType } = params;
    const sidebarService = accessor.get(ISidebarService);
    const localeService = accessor.get(LocaleService);
    let title = "";
    let children = "";
    if (objectType === 4 /* RECT */) {
      title = "slides-ui.sidebar.shape";
      children = COMPONENT_SLIDE_SIDEBAR;
    } else if (objectType === 3 /* IMAGE */) {
      title = "slides-ui.sidebar.image";
      children = COMPONENT_SLIDE_SIDEBAR;
    } else if (objectType === 1 /* RICH_TEXT */) {
      title = "slides-ui.sidebar.text";
      children = COMPONENT_SLIDE_SIDEBAR;
    }
    if (visible) {
      sidebarService.open({
        header: { title: localeService.t(title) },
        children: { label: children },
        onClose: () => {
        },
        width: 360
      });
    } else {
      sidebarService.close();
    }
    return true;
  }
};
var InsertSlideShapeEllipseCommand = {
  id: "slide.command.insert-float-shape.ellipse",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    var _a;
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);
    const unitId = (_a = instanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    return commandService.executeCommand(InsertSlideShapeEllipseOperation.id, { unitId });
  }
};
var InsertSlideShapeEllipseOperation = {
  id: "slide.operation.insert-float-shape.ellipse",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    const id = generateRandomId(6);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const unitId = params.unitId;
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    const elements = Object.values(activePage.pageElements);
    const maxIndex = (elements == null ? void 0 : elements.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
    const data = {
      id,
      zIndex: maxIndex + 1,
      left: 378,
      top: 142,
      width: 250,
      height: 250,
      title: id,
      description: "",
      type: 0 /* SHAPE */,
      shape: {
        shapeType: "ellipse" /* Ellipse */,
        text: "",
        shapeProperties: {
          radius: 100,
          shapeBackgroundFill: {
            rgb: "rgb(0,0,255)"
          }
        }
      }
    };
    activePage.pageElements[id] = data;
    slideData.updatePage(activePage.id, activePage);
    const canvasview = accessor.get(CanvasView);
    const sceneObject = canvasview.createObjectToPage(data, activePage.id, unitId);
    if (sceneObject) {
      canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
    }
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/insert-text.operation.ts
var SlideAddTextCommand = {
  id: "slide.command.add-text",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    var _a;
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const unitId = (_a = univerInstanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    return await commandService.executeCommand(SlideAddTextOperation.id, { unitId });
  }
};
var SlideAddTextOperation = {
  id: "slide.operation.add-text",
  type: 1 /* OPERATION */,
  handler: async (accessor, params) => {
    const unitId = params.unitId;
    const elementId = generateRandomId(6);
    const defaultWidth = 220;
    const defaultheight = 40;
    const left = 230;
    const top = 142;
    const textContent = (params == null ? void 0 : params.text) || "A New Text";
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const slideData = univerInstanceService.getUnit(unitId);
    if (!slideData) return false;
    const activePage = slideData.getActivePage();
    const elements = Object.values(activePage.pageElements);
    const maxIndex = (elements == null ? void 0 : elements.length) ? Math.max(...elements.map((element) => element.zIndex)) : 21;
    const elementData = {
      id: elementId,
      zIndex: maxIndex + 1,
      left,
      top,
      width: defaultWidth,
      height: defaultheight,
      title: "text",
      description: "",
      type: 2 /* TEXT */,
      richText: {
        text: textContent,
        fs: 30,
        cl: {
          rgb: "rgb(51, 51, 51)"
        },
        bl: 1
      }
    };
    activePage.pageElements[elementId] = elementData;
    slideData.updatePage(activePage.id, activePage);
    const canvasview = accessor.get(CanvasView);
    const sceneObject = canvasview.createObjectToPage(elementData, activePage.id, unitId);
    if (sceneObject) {
      canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
    }
    return true;
  }
};

// ../packages/slides-ui/src/commands/operations/set-thumb.operation.ts
var SetSlidePageThumbOperation = {
  id: "slide.operation.set-slide-page-thumb",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const canvasView = accessor.get(CanvasView);
    canvasView.createThumbs(params.unitId);
    return true;
  }
};

// ../packages/slides-ui/src/components/slide-bar/SlideBar.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function SlideSideBar() {
  var _a, _b;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const commandService = useDependency(ICommandService);
  const renderManagerService = useDependency(IRenderManagerService);
  const localeService = useDependency(LocaleService);
  const slideBarRef = (0, import_react3.useRef)(null);
  const currentSlide = univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
  const pages = currentSlide == null ? void 0 : currentSlide.getPages();
  const pageOrder = currentSlide == null ? void 0 : currentSlide.getPageOrder();
  if (!pages || !pageOrder) {
    return null;
  }
  const slideList = pageOrder.map((id) => pages[id]);
  const [activatePageId, setActivatePageId] = (0, import_react3.useState)((_b = (_a = currentSlide == null ? void 0 : currentSlide.getActivePage()) == null ? void 0 : _a.id) != null ? _b : null);
  const divRefs = (0, import_react3.useMemo)(() => slideList.map(() => (0, import_react3.createRef)()), [slideList]);
  (0, import_react3.useEffect)(() => {
    const subscriber = currentSlide == null ? void 0 : currentSlide.activePage$.subscribe((page) => {
      var _a2;
      const id = (_a2 = page == null ? void 0 : page.id) != null ? _a2 : null;
      id && setActivatePageId(id);
    });
    return () => {
      subscriber == null ? void 0 : subscriber.unsubscribe();
    };
  }, []);
  (0, import_react3.useEffect)(() => {
    divRefs.forEach((ref, index) => {
      var _a2;
      if (ref.current) {
        const slide = slideList[index];
        (_a2 = renderManagerService.getRenderById(slide.id)) == null ? void 0 : _a2.engine.setContainer(ref.current);
      }
    });
    if (divRefs.length > 0) {
      commandService.syncExecuteCommand(SetSlidePageThumbOperation.id, { unitId: currentSlide == null ? void 0 : currentSlide.getUnitId() });
    }
  }, [divRefs, slideList, renderManagerService, commandService, currentSlide]);
  const activatePage = (0, import_react3.useCallback)((page) => {
    commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page, unitId: currentSlide == null ? void 0 : currentSlide.getUnitId() });
  }, [commandService, currentSlide]);
  const handleAppendSlide = (0, import_react3.useCallback)(() => {
    commandService.syncExecuteCommand(AppendSlideOperation.id, { unitId: currentSlide == null ? void 0 : currentSlide.getUnitId() });
  }, [commandService, currentSlide]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "aside",
    {
      ref: slideBarRef,
      className: clsx(`univer-flex univer-h-full univer-w-64 univer-flex-col univer-overflow-y-auto univer-overflow-x-hidden`, scrollbarClassName),
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "univer-px-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("header", { className: "univer-flex univer-justify-center univer-pt-4", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "a",
          {
            className: clsx(`univer-box-border univer-block univer-h-8 univer-w-full univer-cursor-pointer univer-rounded-md univer-bg-white univer-text-center univer-text-sm univer-leading-8 univer-transition-colors`, borderClassName),
            onClick: handleAppendSlide,
            children: localeService.t("slides-ui.append")
          }
        ) }),
        slideList.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            className: clsx("univer-my-4 univer-flex univer-gap-2", {
              "[&>div]:univer-border-primary-600 [&>span]:univer-text-primary-600": item.id === activatePageId
            }),
            onClick: () => activatePage(item.id),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: index + 1 }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "div",
                {
                  ref: divRefs[index],
                  className: clsx(`univer-relative univer-box-border univer-h-32 univer-w-52 univer-bg-white hover:univer-border-primary-600`, borderClassName)
                }
              )
            ]
          },
          item.id
        ))
      ] })
    }
  );
}

// ../packages/slides-ui/src/const.ts
var SLIDE_EDITOR_ID = createInternalEditorID("SLIDE_EDITOR");

// ../packages/slides-ui/src/commands/operations/text-edit.operation.ts
var SetTextEditArrowOperation = {
  id: "slide.operation.edit-arrow",
  type: 1 /* OPERATION */,
  handler: () => true
};

// ../packages/slides-ui/src/components/image-popup-menu/component-name.ts
var COMPONENT_SLIDE_IMAGE_POPUP_MENU = "COMPONENT_SLIDE_IMAGE_POPUP_MENU";

// ../packages/slides-ui/src/components/image-popup-menu/ImagePopupMenu.tsx
var import_react4 = __toESM(require_react());
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
function SlideImagePopupMenu(props) {
  var _a, _b;
  const menuItems = (_b = (_a = props.popup) == null ? void 0 : _a.extraProps) == null ? void 0 : _b.menuItems;
  if (!menuItems) {
    return null;
  }
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const [visible, setVisible] = (0, import_react4.useState)(false);
  const [isHovered, setHovered] = (0, import_react4.useState)(false);
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
  const availableMenu = menuItems.filter((item) => !item.disable);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Dropdown,
        {
          align: "start",
          overlay: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "ul",
            {
              className: clsx(`univer-m-0 univer-box-border univer-grid univer-list-none univer-items-center univer-gap-1 univer-rounded-lg univer-bg-white univer-p-1.5 univer-text-sm univer-shadow-lg`, borderClassName),
              children: availableMenu.map((item) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                "li",
                {
                  className: `univer-relative univer-box-border univer-flex univer-h-8 univer-cursor-pointer univer-items-center univer-rounded univer-text-sm univer-transition-colors hover:univer-bg-gray-100`,
                  onClick: () => handleClick(item),
                  children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "univer-px-2 univer-py-1.5 univer-align-middle", children: localeService.t(item.label) })
                },
                item.index
              ))
            }
          ),
          open: visible,
          onOpenChange: onVisibleChange,
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
            "div",
            {
              className: clsx(`univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1 hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-800`, borderClassName, {
                "univer-bg-gray-100 dark:!univer-bg-gray-800": visible,
                "univer-bg-white dark:!univer-bg-gray-900": !visible
              }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  AutofillDoubleIcon,
                  {
                    className: `univer-fill-primary-600 univer-text-gray-900 dark:!univer-text-white`
                  }
                ),
                showMore && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(MoreDownIcon, { className: "dark:!univer-text-white" })
              ]
            }
          )
        }
      )
    }
  );
}

// ../packages/slides-ui/src/menu/image.menu.ts
var SLIDES_IMAGE_MENU_ID = "slide.menu.image";
function SlideImageMenuFactory(accessor) {
  return {
    id: SLIDES_IMAGE_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "AddImageIcon",
    tooltip: "slides-ui.image.insert.title",
    hidden$: getMenuHiddenObservable(accessor, 3 /* UNIVER_SLIDE */)
  };
}
function UploadSlideFloatImageMenuFactory(_accessor) {
  return {
    id: InsertSlideFloatImageCommand.id,
    title: "slides-ui.image.insert.float",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(_accessor, 3 /* UNIVER_SLIDE */)
  };
}

// ../packages/slides-ui/src/menu/shape.menu.ts
var SHAPE_MENU_ID = "slide.menu.shape";
function SlideShapeMenuFactory(accessor) {
  return {
    id: SHAPE_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "GraphIcon",
    tooltip: "slides-ui.shape.insert.title",
    hidden$: getMenuHiddenObservable(accessor, 3 /* UNIVER_SLIDE */)
    // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
  };
}
function UploadSlideFloatRectangleShapeMenuFactory(_accessor) {
  return {
    id: InsertSlideShapeRectangleCommand.id,
    title: "slides-ui.shape.insert.rectangle",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(_accessor, 3 /* UNIVER_SLIDE */)
  };
}
function UploadSlideFloatEllipseShapeMenuFactory(_accessor) {
  return {
    id: InsertSlideShapeEllipseCommand.id,
    title: "slides-ui.shape.insert.ellipse",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(_accessor, 3 /* UNIVER_SLIDE */)
  };
}

// ../packages/slides-ui/src/menu/text.menu.ts
function SlideAddTextMenuItemFactory(_accessor) {
  return {
    id: SlideAddTextCommand.id,
    type: 0 /* BUTTON */,
    icon: "TextIcon",
    tooltip: "slides-ui.text.insert.title",
    hidden$: getMenuHiddenObservable(_accessor, 3 /* UNIVER_SLIDE */)
  };
}

// ../packages/slides-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.start.format" /* FORMAT */]: {
    [SlideAddTextCommand.id]: {
      order: 0,
      menuItemFactory: SlideAddTextMenuItemFactory
    },
    [SLIDES_IMAGE_MENU_ID]: {
      order: 0,
      menuItemFactory: SlideImageMenuFactory,
      [InsertSlideFloatImageCommand.id]: {
        order: 0,
        menuItemFactory: UploadSlideFloatImageMenuFactory
      }
    },
    [SHAPE_MENU_ID]: {
      order: 0,
      menuItemFactory: SlideShapeMenuFactory,
      [InsertSlideShapeRectangleCommand.id]: {
        order: 0,
        menuItemFactory: UploadSlideFloatRectangleShapeMenuFactory
      },
      [InsertSlideShapeEllipseCommand.id]: {
        order: 0,
        menuItemFactory: UploadSlideFloatEllipseShapeMenuFactory
      }
    }
  }
};

// ../packages/slides-ui/src/views/editor-container/EditorContainer.tsx
var import_react5 = __toESM(require_react());

// ../packages/slides-ui/src/services/slide-editor-manager.service.ts
var SlideEditorManagerService = class {
  constructor() {
    __publicField(this, "_state", null);
    __publicField(this, "_rect", null);
    __publicField(this, "_state$", new BehaviorSubject(null));
    __publicField(this, "state$", this._state$.asObservable());
    __publicField(this, "_rect$", new BehaviorSubject(null));
    __publicField(this, "rect$", this._rect$.asObservable());
    __publicField(this, "_focus", false);
    __publicField(this, "_focus$", new BehaviorSubject(this._focus));
    __publicField(this, "focus$", this._focus$.asObservable());
  }
  dispose() {
    this._state$.complete();
    this._state = null;
    this._rect$.complete();
    this._rect = null;
  }
  setState(param) {
    this._state = param;
    this._refresh(param);
  }
  getRect() {
    return this._rect;
  }
  setRect(param) {
    this._rect = param;
    this._rect$.next(param);
  }
  getState() {
    return this._state;
  }
  setFocus(param = false) {
    this._focus = param;
    this._focus$.next(param);
  }
  _refresh(param) {
    this._state$.next(param);
  }
};
var ISlideEditorManagerService = createIdentifier(
  "univer.slide-editor-manager.service"
);

// ../packages/slides-ui/src/views/editor-container/EditorContainer.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var HIDDEN_EDITOR_POSITION = -1e3;
var EDITOR_DEFAULT_POSITION = {
  width: 0,
  height: 0,
  top: HIDDEN_EDITOR_POSITION,
  left: HIDDEN_EDITOR_POSITION
};
function SlideEditorContainer() {
  const [state, setState] = (0, import_react5.useState)({
    ...EDITOR_DEFAULT_POSITION
  });
  const slideEditorManagerService = useDependency(ISlideEditorManagerService);
  const editorService = useDependency(IEditorService);
  const contextService = useDependency(IContextService);
  const disableAutoFocus = useObservable(
    () => contextService.subscribeContextValue$(DISABLE_AUTO_FOCUS_KEY),
    false,
    void 0,
    [contextService, DISABLE_AUTO_FOCUS_KEY]
  );
  const snapshot = {
    id: SLIDE_EDITOR_ID,
    body: {
      dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
      textRuns: [],
      paragraphs: [
        {
          startIndex: 0
        }
      ]
    },
    documentStyle: {
      documentFlavor: 0 /* UNSPECIFIED */
    }
  };
  (0, import_react5.useEffect)(() => {
    slideEditorManagerService.state$.subscribe((param) => {
      if (param == null) {
        return;
      }
      const {
        startX = HIDDEN_EDITOR_POSITION,
        startY = HIDDEN_EDITOR_POSITION,
        endX = 0,
        endY = 0,
        show = false
      } = param;
      if (!show) {
        setState({
          ...EDITOR_DEFAULT_POSITION
        });
      } else {
        setState({
          width: endX - startX - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
          height: endY - startY - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
          left: startX + FIX_ONE_PIXEL_BLUR_OFFSET,
          top: startY + FIX_ONE_PIXEL_BLUR_OFFSET
        });
        const editor = editorService.getEditor(SLIDE_EDITOR_ID);
        if (editor == null) {
          return;
        }
        const { left, top, width, height } = editor.getBoundingClientRect();
        slideEditorManagerService.setRect({ left, top, width, height });
      }
    });
  }, []);
  (0, import_react5.useEffect)(() => {
    if (!disableAutoFocus) {
      slideEditorManagerService.setFocus(true);
    }
  }, [disableAutoFocus, state]);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      className: clsx("univer-absolute univer-z-10 univer-box-border univer-flex", borderClassName),
      style: {
        left: state.left,
        top: state.top,
        width: state.width,
        height: state.height
      }
    }
  );
}

// ../packages/slides-ui/src/controllers/shortcuts/utils.ts
function whenEditorActivated(contextService) {
  return contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && contextService.getContextValue(EDITOR_ACTIVATED);
}
function whenFormulaEditorFocused(contextService) {
  return contextService.getContextValue(FORMULA_EDITOR_ACTIVATED) && contextService.getContextValue(FOCUSING_UNIVER_EDITOR);
}

// ../packages/slides-ui/src/controllers/shortcuts/editor.shortcuts.ts
var ARROW_SELECTION_KEYCODE_LIST = [
  40 /* ARROW_DOWN */,
  38 /* ARROW_UP */,
  37 /* ARROW_LEFT */,
  39 /* ARROW_RIGHT */
];
var MOVE_SELECTION_KEYCODE_LIST = [13 /* ENTER */, 9 /* TAB */, ...ARROW_SELECTION_KEYCODE_LIST];
function generateArrowSelectionShortCutItem() {
  const shortcutList = [];
  for (const keycode of ARROW_SELECTION_KEYCODE_LIST) {
    shortcutList.push({
      id: SetTextEditArrowOperation.id,
      binding: keycode,
      preconditions: (contextService) => whenEditorActivated(contextService),
      staticParameters: {
        visible: false,
        eventType: 4 /* Keyboard */,
        keycode,
        isShift: false
      }
    });
    shortcutList.push({
      id: SetTextEditArrowOperation.id,
      binding: keycode | 1024 /* SHIFT */,
      preconditions: (contextService) => whenEditorActivated(contextService),
      staticParameters: {
        visible: false,
        eventType: 4 /* Keyboard */,
        keycode,
        isShift: true
      }
    });
  }
  return shortcutList;
}
var EditorDeleteLeftShortcut = {
  id: DeleteLeftCommand.id,
  preconditions: (contextService) => {
    return whenEditorActivated(contextService) || whenFormulaEditorFocused(contextService);
  },
  binding: 8 /* BACKSPACE */
};

// ../packages/slides-ui/src/controllers/slide-ui.controller.ts
var SlidesUIController = class extends Disposable {
  constructor(_injector, _menuManagerService, _componentManager, _uiPartsService, _commandService, _shortcutService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_uiPartsService", _uiPartsService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_shortcutService", _shortcutService);
    this._initCommands();
    this._initCustomComponents();
    this._initUIComponents();
    this._initMenus();
    this._initShortcuts();
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initCustomComponents() {
    const componentManager = this._componentManager;
    this.disposeWithMe(componentManager.register("TextIcon", TextIcon));
    this.disposeWithMe(componentManager.register("GraphIcon", GraphIcon));
    this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_IMAGE_POPUP_MENU, SlideImagePopupMenu));
    this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_SIDEBAR, RectSidebar));
  }
  _initCommands() {
    [
      AppendSlideOperation,
      ActivateSlidePageOperation,
      SetSlidePageThumbOperation,
      InsertSlideFloatImageCommand,
      SlideAddTextOperation,
      SlideAddTextCommand,
      InsertSlideShapeEllipseCommand,
      InsertSlideShapeEllipseOperation,
      InsertSlideShapeRectangleOperation,
      InsertSlideShapeRectangleCommand,
      ToggleSlideEditSidebarOperation,
      DeleteSlideElementOperation,
      UpdateSlideElementOperation,
      // commands for editor
      SetTextEditArrowOperation
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
  }
  _initUIComponents() {
    this.disposeWithMe(
      this._uiPartsService.registerComponent("left-sidebar" /* LEFT_SIDEBAR */, () => connectInjector(SlideSideBar, this._injector))
    );
    this.disposeWithMe(
      this._uiPartsService.registerComponent("content" /* CONTENT */, () => connectInjector(SlideEditorContainer, this._injector))
    );
  }
  _initShortcuts() {
    [
      EditorDeleteLeftShortcut,
      ...generateArrowSelectionShortCutItem()
    ].forEach((item) => {
      this.disposeWithMe(this._shortcutService.registerShortcut(item));
    });
  }
};
SlidesUIController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, Inject(ComponentManager)),
  __decorateParam(3, IUIPartsService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IShortcutService)
], SlidesUIController);

// ../packages/slides-ui/package.json
var package_default = {
  name: "@univerjs/slides-ui",
  version: "0.25.2",
  private: false,
  description: "Presentation editor UI layer for Univer Slides.",
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
    "slides",
    "presentation",
    "editor",
    "ui"
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
    "@univerjs/docs-ui": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/slides": "workspace:*",
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

// ../packages/slides-ui/src/config/config.ts
var SLIDES_UI_PLUGIN_CONFIG_KEY = "slides-ui.config";
var configSymbol = Symbol(SLIDES_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/slides-ui/src/services/slide-editor-bridge.service.ts
var ISlideEditorBridgeService = createIdentifier("univer.slide-editor-bridge.service");
var SlideEditorBridgeService = class extends Disposable {
  constructor(_editorService, _contextService, _renderManagerService) {
    super();
    __publicField(this, "_editorService", _editorService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_editorUnitId", SLIDE_EDITOR_ID);
    __publicField(this, "_isForceKeepVisible", false);
    __publicField(this, "_editorIsDirty", false);
    __publicField(this, "_currentEditRectState", null);
    __publicField(this, "_currentEditRectState$", new BehaviorSubject(null));
    __publicField(this, "currentEditRectState$", this._currentEditRectState$.asObservable());
    __publicField(this, "_visibleParam", {
      visible: false,
      eventType: 3 /* Dblclick */,
      unitId: ""
    });
    __publicField(this, "_visible$", new BehaviorSubject(this._visibleParam));
    __publicField(this, "visible$", this._visible$.asObservable());
    __publicField(this, "_afterVisible$", new BehaviorSubject(this._visibleParam));
    __publicField(this, "afterVisible$", this._afterVisible$.asObservable());
    __publicField(this, "endEditing$", new Subject());
    __publicField(this, "_currentEditRectInfo");
  }
  dispose() {
    super.dispose();
  }
  getEditorRect() {
    return this._currentEditRectInfo;
  }
  /**
   * 1st part of startEditing.
   * @editorInfo editorInfo
   */
  setEditorRect(editorInfo) {
    this._currentEditRectInfo = editorInfo;
    if (!this._editorService.getFocusEditor()) {
      this._editorService.focus(SLIDE_EDITOR_ID);
      this._contextService.setContextValue(EDITOR_ACTIVATED, false);
      this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
      this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, false);
    }
    const editRectState = this.getEditRectState();
    this._currentEditRectState = editRectState;
    this._currentEditRectState$.next(editRectState);
  }
  changeVisible(param) {
    this._visibleParam = param;
    if (param.visible) {
      this._editorIsDirty = false;
    }
    this._visible$.next(this._visibleParam);
    this._afterVisible$.next(this._visibleParam);
  }
  /**
   * get info from _currentEditRectInfo
   *
   * invoked by slide-editing.render-controller.ts@_handleEditorVisible
   * && this@setEditorRect
   */
  getEditRectState() {
    const editorUnitId = SLIDE_EDITOR_ID;
    const editorRectInfo = this._currentEditRectInfo;
    const unitId = editorRectInfo.unitId;
    const docData = editorRectInfo.richTextObj.documentData;
    docData.id = editorUnitId;
    docData.documentStyle = {
      ...docData.documentStyle,
      ...{
        pageSize: { width: editorRectInfo.richTextObj.width, height: Infinity }
      }
    };
    const docDataModel = new DocumentDataModel(docData);
    const documentLayoutObject = {
      documentModel: docDataModel,
      fontString: "document",
      textRotation: { a: 0, v: 0 },
      wrapStrategy: 0,
      verticalAlign: 1 /* TOP */,
      horizontalAlign: 1 /* LEFT */,
      paddingData: { t: 0, b: 1, l: 2, r: 2 }
    };
    const editorWidth = editorRectInfo.richTextObj.width;
    const editorHeight = editorRectInfo.richTextObj.height;
    const left = editorRectInfo.richTextObj.left;
    const top = editorRectInfo.richTextObj.top;
    const canvasOffset = {
      left: 0,
      top: 0
    };
    const renderUnit = this._renderManagerService.getRenderById(unitId);
    const mainScene = renderUnit == null ? void 0 : renderUnit.scene;
    const mainViewport = mainScene == null ? void 0 : mainScene.getViewport("__mainView__" /* VIEW */);
    const slideMainRect = mainScene == null ? void 0 : mainScene.getObject("__slideRender__" /* COMPONENT */);
    const slidePos = {
      x: (slideMainRect == null ? void 0 : slideMainRect.left) || 0,
      y: (slideMainRect == null ? void 0 : slideMainRect.top) || 0
    };
    const scrollX = (mainViewport == null ? void 0 : mainViewport.viewportScrollX) || 0;
    const scrollY = (mainViewport == null ? void 0 : mainViewport.viewportScrollY) || 0;
    canvasOffset.left = slidePos.x - scrollX;
    canvasOffset.top = slidePos.y - scrollY;
    return {
      position: {
        startX: left,
        startY: top,
        endX: left + editorWidth,
        endY: top + editorHeight
      },
      scaleX: 1,
      scaleY: 1,
      slideCardOffset: canvasOffset,
      unitId,
      editorUnitId,
      documentLayoutObject
    };
  }
  changeEditorDirty(dirtyStatus) {
    this._editorIsDirty = dirtyStatus;
  }
  isVisible() {
    return this._visibleParam.visible;
  }
  getEditorDirty() {
    return this._editorIsDirty;
  }
  getCurrentEditorId() {
    return this._editorUnitId;
  }
  /**
   * @deprecated
   */
  genDocData(target) {
    const editorUnitId = this.getCurrentEditorId();
    const content = target.text;
    const fontSize = target.fs;
    const docData = {
      id: editorUnitId,
      body: {
        dataStream: `${content}\r
`,
        textRuns: [{ st: 0, ed: content.length }],
        paragraphs: [{
          paragraphStyle: {
            // no use
            // textStyle: { fs: 30 },
            // horizontalAlign: HorizontalAlign.CENTER,
            // verticalAlign: VerticalAlign.MIDDLE,
          },
          startIndex: content.length + 1
        }],
        sectionBreaks: [{ startIndex: content.length + 2 }]
      },
      documentStyle: {
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        pageSize: { width: Infinity, height: Infinity },
        textStyle: { fs: fontSize },
        renderConfig: {
          // horizontalAlign: HorizontalAlign.CENTER,
          verticalAlign: 2 /* MIDDLE */,
          centerAngle: 0,
          vertexAngle: 0,
          wrapStrategy: 0
        }
      },
      drawings: {},
      drawingsOrder: [],
      settings: { zoomRatio: 1 }
    };
    return docData;
  }
};
SlideEditorBridgeService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IContextService),
  __decorateParam(2, IRenderManagerService)
], SlideEditorBridgeService);

// ../packages/slides-ui/src/controllers/slide-editing.render-controller.ts
var HIDDEN_EDITOR_POSITION2 = -1e3;
var EDITOR_INPUT_SELF_EXTEND_GAP = 5;
var EDITOR_BORDER_SIZE = 2;
var SlideEditingRenderController = class extends Disposable {
  constructor(_renderContext, _layoutService, _undoRedoService, _contextService, _instanceSrv, _renderManagerService, _editorBridgeService, _cellEditorManagerService, _textSelectionManagerService, _commandService, _localService, _editorService) {
    super();
    __publicField(this, "_renderContext", _renderContext);
    __publicField(this, "_layoutService", _layoutService);
    __publicField(this, "_undoRedoService", _undoRedoService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_instanceSrv", _instanceSrv);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_cellEditorManagerService", _cellEditorManagerService);
    __publicField(this, "_textSelectionManagerService", _textSelectionManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_localService", _localService);
    __publicField(this, "_editorService", _editorService);
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    __publicField(this, "_cursorChange", 0 /* InitialState */);
    /** If the corresponding unit is active and prepared for editing. */
    __publicField(this, "_isUnitEditing", false);
    __publicField(this, "_d");
    this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(3 /* UNIVER_SLIDE */).subscribe((slideDataModel) => {
      if (slideDataModel && slideDataModel.getUnitId() === this._renderContext.unitId) {
        this._d = this._init();
      } else {
        this._disposeCurrent();
        if (this._isUnitEditing) {
          this._handleEditorInvisible({
            visible: false,
            eventType: 4 /* Keyboard */,
            keycode: 27 /* ESC */,
            unitId: this._renderContext.unitId
          });
          this._isUnitEditing = false;
        }
      }
    }));
    this._initEditorVisibilityListener();
  }
  dispose() {
    super.dispose();
    this._disposeCurrent();
  }
  _disposeCurrent() {
    var _a;
    (_a = this._d) == null ? void 0 : _a.dispose();
    this._d = null;
  }
  _init() {
    const d = new DisposableCollection();
    this._subscribeToCurrentCell(d);
    this._initialKeyboardListener(d);
    this._initialCursorSync(d);
    this._listenEditorFocus(d);
    this._commandExecutedListener(d);
    setTimeout(() => {
      this._cursorStateListener(d);
    }, 1e3);
    return d;
  }
  _initEditorVisibilityListener() {
    this.disposeWithMe(this._editorBridgeService.visible$.subscribe((param) => {
      if (param.visible) {
        this._isUnitEditing = true;
        this._handleEditorVisible(param);
      } else if (this._isUnitEditing) {
        this._handleEditorInvisible(param);
        this._isUnitEditing = false;
      }
    }));
  }
  _listenEditorFocus(d) {
    const renderConfig = this._getEditorObject();
    if (!renderConfig) return;
    d.add(renderConfig.document.onPointerDown$.subscribeEvent(() => {
    }));
  }
  _getEditorSkeleton(editorId) {
    var _a;
    return (_a = this._renderManagerService.getRenderById(editorId)) == null ? void 0 : _a.with(DocSkeletonManagerService).getSkeleton();
  }
  _getEditorViewModel(editorId) {
    var _a;
    return (_a = this._renderManagerService.getRenderById(editorId)) == null ? void 0 : _a.with(DocSkeletonManagerService).getViewModel();
  }
  _initialCursorSync(d) {
    d.add(this._cellEditorManagerService.focus$.pipe(filter((f) => !!f)).subscribe(() => {
      var _a;
      (_a = getCurrentTypeOfRenderer(1 /* UNIVER_DOC */, this._instanceSrv, this._renderManagerService)) == null ? void 0 : _a.with(DocSelectionRenderService).sync();
    }));
  }
  /**
   * Set editorUnitId to curr doc.
   * @param d DisposableCollection
   */
  _subscribeToCurrentCell(d) {
    d.add(this._editorBridgeService.currentEditRectState$.subscribe((editCellState) => {
      var _a;
      if (editCellState == null) {
        return;
      }
      if (this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) || this._contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE)) {
        return;
      }
      const {
        position: { startX, endX },
        documentLayoutObject: { textRotation, wrapStrategy, documentModel },
        scaleX,
        editorUnitId
      } = editCellState;
      const { vertexAngle: angle } = convertTextRotation(textRotation);
      documentModel.updateDocumentId(editorUnitId);
      if (wrapStrategy === 3 /* WRAP */ && angle === 0) {
        documentModel.updateDocumentDataPageSize((endX - startX) / scaleX);
      }
      this._instanceSrv.changeDoc(editorUnitId, documentModel);
      this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true);
      this._textSelectionManagerService.replaceTextRanges([{
        startOffset: 0,
        endOffset: 0
      }]);
      (_a = getCurrentTypeOfRenderer(1 /* UNIVER_DOC */, this._instanceSrv, this._renderManagerService)) == null ? void 0 : _a.with(DocSelectionRenderService).activate(HIDDEN_EDITOR_POSITION2, HIDDEN_EDITOR_POSITION2);
    }));
  }
  /**
   * Set size and pos of editing area.
   * @param positionFromEditRectState
   * @param canvasOffset
   * @param documentSkeleton
   * @param documentLayoutObject
   * @param scaleX
   * @param scaleY
   */
  _fitTextSize(positionFromEditRectState, canvasOffset, documentSkeleton, documentLayoutObject, scaleX = 1, scaleY = 1) {
    const { startX, startY, endX, endY } = positionFromEditRectState;
    const documentDataModel = documentLayoutObject.documentModel;
    if (documentDataModel == null) {
      return;
    }
    const { actualWidth, actualHeight } = this._predictingSize(
      positionFromEditRectState,
      canvasOffset,
      documentSkeleton,
      documentLayoutObject,
      scaleX,
      scaleY
    );
    const { verticalAlign, paddingData, fill } = documentLayoutObject;
    let editorWidth = endX - startX;
    let editorHeight = endY - startY;
    if (editorWidth < actualWidth) {
      editorWidth = actualWidth;
    }
    if (editorHeight < actualHeight) {
      editorHeight = actualHeight;
      documentDataModel.updateDocumentDataMargin(paddingData);
    } else {
      let offsetTop = 0;
      if (verticalAlign === 2 /* MIDDLE */) {
        offsetTop = (editorHeight - actualHeight) / 2 / scaleY;
      } else if (verticalAlign === 1 /* TOP */) {
        offsetTop = paddingData.t || 0;
      } else {
        offsetTop = (editorHeight - actualHeight) / scaleY - (paddingData.b || 0);
      }
      offsetTop = offsetTop < (paddingData.t || 0) ? paddingData.t || 0 : offsetTop;
      documentDataModel.updateDocumentDataMargin({
        t: offsetTop
      });
    }
    documentSkeleton.calculate();
    this._editAreaProcessing(editorWidth, editorHeight, positionFromEditRectState, canvasOffset, fill, scaleX, scaleY);
  }
  /**
   * Mainly used to pre-calculate the width of the editor,
   * to determine whether it needs to be automatically widened.
   */
  _predictingSize(actualRangeWithCoord, canvasOffset, documentSkeleton, documentLayoutObject, scaleX = 1, scaleY = 1) {
    const { startX, endX } = actualRangeWithCoord;
    const { textRotation, wrapStrategy } = documentLayoutObject;
    const documentDataModel = documentLayoutObject.documentModel;
    const { vertexAngle: angle } = convertTextRotation(textRotation);
    const clientWidth = document.body.clientWidth;
    if (wrapStrategy === 3 /* WRAP */ && angle === 0) {
      const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
      return {
        actualWidth: actualWidth * scaleX,
        actualHeight: actualHeight * scaleY
      };
    }
    documentDataModel == null ? void 0 : documentDataModel.updateDocumentDataPageSize((clientWidth - startX - canvasOffset.left) / scaleX);
    documentSkeleton.calculate();
    const size = documentSkeleton.getActualSize();
    let editorWidth = endX - startX;
    if (editorWidth < size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX) {
      editorWidth = size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX;
    }
    documentDataModel == null ? void 0 : documentDataModel.updateDocumentDataPageSize(editorWidth / scaleX);
    documentDataModel == null ? void 0 : documentDataModel.updateDocumentRenderConfig({
      horizontalAlign: 0 /* UNSPECIFIED */,
      cellValueType: void 0
    });
    return {
      actualWidth: editorWidth,
      actualHeight: size.actualHeight * scaleY
    };
  }
  /**
   * control the size of editing area
   */
  // eslint-disable-next-line max-lines-per-function
  _editAreaProcessing(editorWidth, editorHeight, positionFromEditRectState, canvasOffset, fill, scaleX = 1, scaleY = 1) {
    var _a;
    const editorObject = this._getEditorObject();
    if (editorObject == null) {
      return;
    }
    function pxToNum2(width2) {
      return Number.parseInt(width2.replace("px", ""));
    }
    const engine = this._renderContext.engine;
    const canvasElement = engine.getCanvasElement();
    const canvasClientRect = canvasElement.getBoundingClientRect();
    const widthOfCanvas = pxToNum2(canvasElement.style.width);
    const { top, left, width } = canvasClientRect;
    const scaleAdjust = width / widthOfCanvas;
    let { startX, startY } = positionFromEditRectState;
    startX += canvasOffset.left;
    startY += canvasOffset.top;
    const { document: documentComponent, scene: editorScene, engine: docEngine } = editorObject;
    const viewportMain = editorScene.getViewport("viewMain" /* VIEW_MAIN */);
    const clientHeight = document.body.clientHeight - startY - canvasOffset.top - EDITOR_BORDER_SIZE * 2;
    const clientWidth = document.body.clientWidth - startX - canvasOffset.left;
    let physicHeight = editorHeight;
    let scrollBar = viewportMain == null ? void 0 : viewportMain.getScrollBar();
    if (physicHeight > clientHeight) {
      physicHeight = clientHeight;
      if (scrollBar == null) {
        if (viewportMain) {
          const sb = new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
        }
      } else {
        viewportMain == null ? void 0 : viewportMain.resetCanvasSizeAndUpdateScroll();
      }
    } else {
      scrollBar = null;
      (_a = viewportMain == null ? void 0 : viewportMain.getScrollBar()) == null ? void 0 : _a.dispose();
    }
    editorWidth += (scrollBar == null ? void 0 : scrollBar.barSize) || 0;
    editorWidth = Math.min(editorWidth, clientWidth);
    startX -= FIX_ONE_PIXEL_BLUR_OFFSET;
    startY -= FIX_ONE_PIXEL_BLUR_OFFSET;
    this._addBackground(editorScene, editorWidth / scaleX, editorHeight / scaleY, fill);
    const { scaleX: precisionScaleX, scaleY: precisionScaleY } = editorScene.getPrecisionScale();
    editorScene.transformByState({
      width: editorWidth * scaleAdjust / scaleX,
      height: editorHeight * scaleAdjust / scaleY,
      scaleX: scaleX * scaleAdjust,
      scaleY: scaleY * scaleAdjust
    });
    documentComponent.resize(editorWidth / scaleX, editorHeight / scaleY);
    setTimeout(() => {
      docEngine.resizeBySize(
        fixLineWidthByScale(editorWidth, precisionScaleX),
        fixLineWidthByScale(physicHeight, precisionScaleY)
      );
    }, 0);
    const contentBoundingRect = this._layoutService.getContentElement().getBoundingClientRect();
    const canvasBoundingRect = canvasElement.getBoundingClientRect();
    startX = startX * scaleAdjust + (canvasBoundingRect.left - contentBoundingRect.left);
    startY = startY * scaleAdjust + (canvasBoundingRect.top - contentBoundingRect.top);
    this._cellEditorManagerService.setState({
      startX,
      startY,
      endX: editorWidth * scaleAdjust + startX,
      endY: physicHeight * scaleAdjust + startY,
      show: true
    });
  }
  /**
   * Since the document does not support cell background color, an additional rect needs to be added.
   */
  _addBackground(scene, editorWidth, editorHeight, fill) {
    const fillRectKey = "_backgroundRectHelperColor_";
    const rect = scene.getObject(fillRectKey);
    if (rect == null && fill == null) {
      return;
    }
    if (rect == null) {
      scene.addObjects(
        [
          new Rect(fillRectKey, {
            width: editorWidth,
            height: editorHeight,
            fill,
            evented: false
          })
        ],
        DOCS_COMPONENT_MAIN_LAYER_INDEX
      );
    } else if (fill == null) {
      rect.dispose();
    } else {
      rect.setProps({
        fill
      });
      rect.transformByState({
        width: editorWidth,
        height: editorHeight
      });
    }
  }
  /**
   * Show input area, resize input area and then place input to right place.
   * @TODO why do resize in show input area?
   * @param param
   */
  // handleVisible is the 2nd part of editing.
  // first part: startEditing --> _updateEditor
  // 2nd part: startEditing --> changeVisible --> slide-editor-bridge.render-controller.ts@changeVisible --> _editorBridgeService.changeVisible
  _handleEditorVisible(param) {
    var _a, _b;
    const { eventType } = param;
    this._cursorChange = [1 /* PointerDown */, 3 /* Dblclick */].includes(eventType) ? 2 /* CursorChange */ : 1 /* StartEditor */;
    const editCellState = this._editorBridgeService.getEditRectState();
    if (editCellState == null) {
      return;
    }
    const {
      position,
      documentLayoutObject,
      slideCardOffset: canvasOffset,
      scaleX,
      scaleY,
      editorUnitId,
      unitId
    } = editCellState;
    const editorObject = this._getEditorObject();
    if (editorObject == null) {
      return;
    }
    const { scene } = editorObject;
    this._contextService.setContextValue(EDITOR_ACTIVATED, true);
    const { documentModel: documentDataModel } = documentLayoutObject;
    const skeleton = this._getEditorSkeleton(editorUnitId);
    if (!skeleton || !documentDataModel) {
      return;
    }
    this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
    const cursor = documentDataModel.getBody().dataStream.length - 2 || 0;
    (_a = scene.getViewport("viewMain" /* VIEW_MAIN */)) == null ? void 0 : _a.scrollToViewportPos({
      viewportScrollX: Number.POSITIVE_INFINITY
    });
    this._textSelectionManagerService.replaceTextRanges([
      {
        startOffset: cursor,
        endOffset: cursor
      }
    ]);
    (_b = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _b.scene.resetCursor();
  }
  _resetBodyStyle(body, removeStyle = false) {
    body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;
    if (body.textRuns != null) {
      if (body.textRuns.length === 1 && !removeStyle) {
        body.textRuns[0].st = 0;
        body.textRuns[0].ed = 1;
      } else {
        body.textRuns = void 0;
      }
    }
    if (body.paragraphs != null) {
      if (body.paragraphs.length === 1) {
        body.paragraphs[0].startIndex = 0;
      } else {
        body.paragraphs = [
          {
            startIndex: 0
          }
        ];
      }
    }
    if (body.sectionBreaks != null) {
      body.sectionBreaks = void 0;
    }
    if (body.tables != null) {
      body.tables = void 0;
    }
    if (body.customRanges != null) {
      body.customRanges = void 0;
    }
    if (body.customBlocks != null) {
      body.customBlocks = void 0;
    }
  }
  /**
   * Should activate the editor when the user inputs text.
   * @param d DisposableCollection
   */
  _initialKeyboardListener(d) {
  }
  _showEditorByKeyboard(config) {
    if (config == null) {
    }
  }
  _commandExecutedListener(d) {
    const moveCursorOP = [SetTextEditArrowOperation.id];
    const editedMutations = [RichTextEditingMutation.id];
    d.add(this._commandService.onCommandExecuted((command) => {
      if (this._editorService.getFocusId() !== SLIDE_EDITOR_ID) {
        return;
      }
      if (moveCursorOP.includes(command.id)) {
        this._moveCursorCmdHandler(command);
      }
      if (editedMutations.includes(command.id)) {
        if (this._editorBridgeService.isVisible()) {
          this._editingChangedHandler();
        }
      }
    }));
  }
  _moveCursorCmdHandler(command) {
    const params = command.params;
    const { keycode, isShift } = params;
    if (keycode != null && this._cursorChange === 2 /* CursorChange */) {
      this._moveInEditor(keycode, isShift);
    } else {
      this._editorBridgeService.changeVisible(params);
    }
  }
  _editingChangedHandler() {
    const editRect = this._editorBridgeService.getEditorRect();
    if (!editRect) {
      return;
    }
    const editingRichText = editRect.richTextObj;
    editingRichText.refreshDocumentByDocData();
    editingRichText.resizeToContentSize();
    const { unitId } = this._renderContext;
    this._handleEditorVisible({ visible: true, eventType: 3, unitId });
  }
  _getEditorObject() {
    return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
  }
  async _handleEditorInvisible(param) {
    const { keycode } = param;
    this._cursorChange = 0 /* InitialState */;
    this._exitInput(param);
    const editCellState = this._editorBridgeService.getEditRectState();
    if (editCellState == null) {
      return;
    }
    const editorIsDirty = this._editorBridgeService.getEditorDirty();
    if (editorIsDirty === false) {
      this._moveCursor(keycode);
      return;
    }
    this._moveCursor(keycode);
  }
  _exitInput(param) {
    this._contextService.setContextValue(EDITOR_ACTIVATED, false);
    this._cellEditorManagerService.setState({
      show: param.visible
    });
    const editorUnitId = this._editorBridgeService.getCurrentEditorId();
    if (editorUnitId == null) {
      return;
    }
    this._undoRedoService.clearUndoRedo(editorUnitId);
  }
  _moveCursor(keycode) {
    if (keycode == null) {
      return;
    }
    let direction = 3 /* LEFT */;
    switch (keycode) {
      case 13 /* ENTER */:
        direction = 2 /* DOWN */;
        break;
      case 9 /* TAB */:
        direction = 1 /* RIGHT */;
        break;
      case 40 /* ARROW_DOWN */:
        direction = 2 /* DOWN */;
        break;
      case 38 /* ARROW_UP */:
        direction = 0 /* UP */;
        break;
      case 37 /* ARROW_LEFT */:
        direction = 3 /* LEFT */;
        break;
      case 39 /* ARROW_RIGHT */:
        direction = 1 /* RIGHT */;
        break;
    }
  }
  /**
   * The user's operations follow the sequence of opening the editor and then moving the cursor.
   * The logic here predicts the user's first cursor movement behavior based on this rule
   */
  _cursorStateListener(d) {
    const editorObject = this._getEditorObject();
    if (!editorObject) {
      return;
    }
    const { document: documentComponent } = editorObject;
    d.add(toDisposable(documentComponent.onPointerDown$.subscribeEvent(() => {
      if (this._cursorChange === 1 /* StartEditor */) {
        this._cursorChange = 2 /* CursorChange */;
      }
    })));
  }
  // TODO: @JOCS, is it necessary to move these commands MoveSelectionOperation\MoveCursorOperation to shortcut? and use multi-commands?
  _moveInEditor(keycode, isShift) {
    let direction = 3 /* LEFT */;
    if (keycode === 40 /* ARROW_DOWN */) {
      direction = 2 /* DOWN */;
    } else if (keycode === 38 /* ARROW_UP */) {
      direction = 0 /* UP */;
    } else if (keycode === 39 /* ARROW_RIGHT */) {
      direction = 1 /* RIGHT */;
    }
    if (isShift) {
      this._commandService.executeCommand(MoveSelectionOperation.id, {
        direction
      });
    } else {
      this._commandService.executeCommand(MoveCursorOperation.id, {
        direction
      });
    }
  }
};
SlideEditingRenderController = __decorateClass([
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IContextService),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, IRenderManagerService),
  __decorateParam(6, ISlideEditorBridgeService),
  __decorateParam(7, ISlideEditorManagerService),
  __decorateParam(8, Inject(DocSelectionManagerService)),
  __decorateParam(9, ICommandService),
  __decorateParam(10, Inject(LocaleService)),
  __decorateParam(11, IEditorService)
], SlideEditingRenderController);
function getEditorObject(unitId, renderManagerService) {
  if (unitId == null) {
    return;
  }
  const currentRender = renderManagerService.getRenderById(unitId);
  if (currentRender == null) {
    return;
  }
  const { mainComponent, scene, engine, components } = currentRender;
  const document2 = mainComponent;
  const docBackground = components.get("__Document_Render_Background__" /* BACKGROUND */);
  return {
    document: document2,
    docBackground,
    scene,
    engine
  };
}

// ../packages/slides-ui/src/controllers/slide-editor-bridge.render-controller.ts
var SlideEditorBridgeRenderController = class extends RxDisposable {
  constructor(_renderContext, _instanceSrv, _commandService, _editorBridgeService) {
    super();
    __publicField(this, "_renderContext", _renderContext);
    __publicField(this, "_instanceSrv", _instanceSrv);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    // private _cursorChange: CursorChange = CursorChange.InitialState;
    /** If the corresponding unit is active and prepared for editing. */
    // private _isUnitEditing = false;
    __publicField(this, "setSlideTextEditor$", new Subject());
    __publicField(this, "_curRichText", null);
    __publicField(this, "_d");
    this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(3 /* UNIVER_SLIDE */).subscribe((slideDataModel) => {
      if (slideDataModel && slideDataModel.getUnitId() === this._renderContext.unitId) {
        this._d = this._init();
      } else {
        this._disposeCurrent();
      }
    }));
  }
  _init() {
    const d = new DisposableCollection();
    this._initEventListener(d);
    return d;
  }
  _disposeCurrent() {
    var _a;
    (_a = this._d) == null ? void 0 : _a.dispose();
    this._d = null;
  }
  _setEditorRect(pageId, targetObject) {
    this._curRichText = targetObject;
    const { scene, engine } = this._renderContext;
    const unitId = this._renderContext.unitId;
    const setEditorRect = {
      scene,
      engine,
      unitId,
      pageId,
      richTextObj: targetObject
    };
    this._editorBridgeService.setEditorRect(setEditorRect);
  }
  _initEventListener(d) {
    const listenersForPageScene = (scene) => {
      const transformer = scene.getTransformer();
      if (!transformer) return;
      d.add(transformer.clearControl$.subscribe(() => {
        this.setEditorVisible(false);
        this.pickOtherObjects();
      }));
      d.add(transformer.createControl$.subscribe(() => {
        this.setEditorVisible(false);
      }));
      d.add(scene.onDblclick$.subscribeEvent(() => {
        transformer.clearControls();
        const selectedObjects = transformer.getSelectedObjectMap();
        const object = selectedObjects.values().next().value;
        if (!object) return;
        if (object.objectType !== 1 /* RICH_TEXT */) {
          this.pickOtherObjects();
        } else {
          this.startEditing(scene.sceneKey, object);
        }
      }));
      d.add(this._instanceSrv.focused$.subscribe((fc) => {
        this.endEditing();
      }));
    };
    const { mainComponent } = this._renderContext;
    const slide = mainComponent;
    slide.subSceneChanged$.subscribeEvent((pageScene) => {
      listenersForPageScene(pageScene);
    });
    const pageSceneList = Array.from(mainComponent.getSubScenes().values());
    for (let i = 0; i < pageSceneList.length; i++) {
      const pageScene = pageSceneList[i];
      listenersForPageScene(pageScene);
    }
  }
  pickOtherObjects() {
    this.endEditing();
  }
  /**
   * invoked when picking other object.
   *
   * save editing state to curr richText.
   */
  endEditing() {
    var _a;
    if (!this._curRichText) return;
    this.setEditorVisible(false);
    const curRichText = this._curRichText;
    const slideData = this._instanceSrv.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
    if (!slideData) return false;
    curRichText.refreshDocumentByDocData();
    curRichText.resizeToContentSize();
    this._editorBridgeService.endEditing$.next(curRichText);
    const richText = {
      bl: 1,
      fs: curRichText.fs,
      text: curRichText.text
    };
    const textRuns = (_a = curRichText.documentData.body) == null ? void 0 : _a.textRuns;
    if (textRuns && textRuns.length) {
      const textRun = textRuns[0];
      const ts = textRun.ts;
      richText.cl = ts == null ? void 0 : ts.cl;
    }
    this._commandService.executeCommand(UpdateSlideElementOperation.id, {
      unitId: this._renderContext.unitId,
      oKey: curRichText == null ? void 0 : curRichText.oKey,
      props: {
        richText
      }
    });
    this._curRichText = null;
  }
  /**
   * TODO calling twice ？？？？
   * editingParam derives from RichText object.
   *
   * TODO @lumixraku need scale param
   * @param target
   */
  startEditing(pageId, target) {
    this._setEditorRect(pageId, target);
    this.setEditorVisible(true);
  }
  setEditorVisible(visible) {
    var _a, _b;
    if (visible) {
      (_a = this._curRichText) == null ? void 0 : _a.hide();
    } else {
      (_b = this._curRichText) == null ? void 0 : _b.show();
    }
    const { unitId } = this._renderContext;
    this._editorBridgeService.changeVisible({ visible, eventType: 1 /* PointerDown */, unitId });
  }
};
SlideEditorBridgeRenderController = __decorateClass([
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, ISlideEditorBridgeService)
], SlideEditorBridgeRenderController);

// ../packages/slides-ui/src/services/slide-popup-manager.service.ts
function transformBound2OffsetBound(originBound, scene) {
  const topLeft = transformPosition2Offset(originBound.left, originBound.top, scene);
  const bottomRight = transformPosition2Offset(originBound.right, originBound.bottom, scene);
  return {
    left: topLeft.x,
    top: topLeft.y,
    right: bottomRight.x,
    bottom: bottomRight.y
  };
}
function transformPosition2Offset(x, y, scene) {
  const { scaleX, scaleY } = scene.getAncestorScale();
  const viewMain = scene.getViewport("__mainView__" /* VIEW */);
  if (!viewMain) {
    return {
      x,
      y
    };
  }
  const { viewportScrollX: actualScrollX, viewportScrollY: actualScrollY } = viewMain;
  const offsetX = (x - actualScrollX) * scaleX;
  const offsetY = (y - actualScrollY) * scaleY;
  return {
    x: offsetX,
    y: offsetY
  };
}
var SlideCanvasPopMangerService = class extends Disposable {
  constructor(_globalPopupManagerService, _renderManagerService, _univerInstanceService, _commandService) {
    super();
    __publicField(this, "_globalPopupManagerService", _globalPopupManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
  }
  _createObjectPositionObserver(targetObject, currentRender) {
    const calc = () => {
      var _a, _b, _c, _d;
      const { scene, engine } = currentRender;
      const { left, top, width, height } = targetObject;
      const horizontalOffset = (scene.width - ((_b = (_a = currentRender.mainComponent) == null ? void 0 : _a.width) != null ? _b : 0)) / 2;
      const verticalOffset = (scene.height - ((_d = (_c = currentRender.mainComponent) == null ? void 0 : _c.height) != null ? _d : 0)) / 2;
      const bound = {
        left,
        right: left + width,
        top,
        bottom: top + height
      };
      const canvasElement = engine.getCanvasElement();
      const canvasClientRect = canvasElement.getBoundingClientRect();
      const widthOfCanvas = pxToNum(canvasElement.style.width);
      const { scaleX, scaleY } = scene.getAncestorScale();
      const offsetBound = transformBound2OffsetBound(bound, scene);
      const { top: topOffset, left: leftOffset, width: domWidth } = canvasClientRect;
      const scaleAdjust = domWidth / widthOfCanvas;
      const position2 = {
        left: offsetBound.left * scaleAdjust * scaleX + leftOffset + horizontalOffset,
        right: offsetBound.right * scaleAdjust * scaleX + leftOffset + horizontalOffset,
        top: offsetBound.top * scaleAdjust * scaleY + topOffset + verticalOffset,
        bottom: offsetBound.bottom * scaleAdjust * scaleY + topOffset + verticalOffset
      };
      return position2;
    };
    const position = calc();
    const position$ = new BehaviorSubject(position);
    const disposable = new DisposableCollection();
    return {
      position,
      position$,
      disposable
    };
  }
  attachPopupToObject(targetObject, popup) {
    const workbook = this._univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
    const unitId = workbook.getUnitId();
    const currentRender = this._renderManagerService.getRenderById(unitId);
    if (!currentRender) {
      return {
        dispose: () => {
        }
      };
    }
    const { position, position$, disposable } = this._createObjectPositionObserver(targetObject, currentRender);
    const id = this._globalPopupManagerService.addPopup({
      ...popup,
      unitId,
      subUnitId: "default",
      anchorRect: position,
      anchorRect$: position$,
      canvasElement: currentRender.engine.getCanvasElement()
    });
    return {
      dispose: () => {
        this._globalPopupManagerService.removePopup(id);
        position$.complete();
        disposable.dispose();
      }
    };
  }
};
SlideCanvasPopMangerService = __decorateClass([
  __decorateParam(0, Inject(ICanvasPopupService)),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, ICommandService)
], SlideCanvasPopMangerService);

// ../packages/slides-ui/src/menu/popup-menu.controller.ts
var SlidePopupMenuController = class extends RxDisposable {
  constructor(_canvasPopManagerService, _renderManagerService, _univerInstanceService, _contextService, _canvasView, _sidebarService, _commandService) {
    super();
    __publicField(this, "_canvasPopManagerService", _canvasPopManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_canvasView", _canvasView);
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_initImagePopupMenu", /* @__PURE__ */ new Set());
    this._init();
  }
  _init() {
    this._univerInstanceService.getAllUnitsForType(3 /* UNIVER_SLIDE */).forEach((slide) => this._create(slide));
  }
  _create(slide) {
    if (!slide) {
      return;
    }
    const unitId = slide.getUnitId();
    if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
      this._popupMenuListener(unitId);
      this._initImagePopupMenu.add(unitId);
    }
  }
  _hasCropObject(scene) {
  }
  // eslint-disable-next-line max-lines-per-function
  _popupMenuListener(unitId) {
    var _a;
    const model = this._univerInstanceService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
    const pages = (_a = model == null ? void 0 : model.getPages()) != null ? _a : {};
    Object.keys(pages).forEach((pageId) => {
      var _a2;
      const page = this._canvasView.getRenderUnitByPageId(pageId, unitId);
      const transformer = (_a2 = page.scene) == null ? void 0 : _a2.getTransformer();
      if (!transformer) return;
      let singletonPopupDisposer;
      this.disposeWithMe(
        toDisposable(
          transformer.createControl$.subscribe(() => {
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
            singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
            singletonPopupDisposer = this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
              componentKey: COMPONENT_SLIDE_IMAGE_POPUP_MENU,
              direction: "horizontal",
              offset: [2, 0],
              extraProps: {
                menuItems: this._getMenuItemsByObjectType(object.objectType, oKey, unitId)
              }
            }));
            if (this._sidebarService.visible) {
              this._commandService.executeCommand(ToggleSlideEditSidebarOperation.id, {
                visible: true,
                objectType: object.objectType
              });
            }
          })
        )
      );
      this.disposeWithMe(
        transformer.clearControl$.subscribe(() => {
          singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
          this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
        })
      );
      this.disposeWithMe(
        transformer.changing$.subscribe(() => {
          singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
          const selectedObjects = transformer.getSelectedObjectMap();
          if (selectedObjects.size > 1) {
            singletonPopupDisposer == null ? void 0 : singletonPopupDisposer.dispose();
            return;
          }
          const object = selectedObjects.values().next().value;
          if (!object) {
            return;
          }
          this._commandService.executeCommand(UpdateSlideElementOperation.id, {
            unitId,
            oKey: object.oKey,
            props: {
              width: object.width,
              height: object.height,
              left: object.left,
              top: object.top
            }
          });
        })
      );
    });
  }
  _getMenuItemsByObjectType(objectType, oKey, unitId) {
    const menuItems = [{
      label: "slides-ui.popup.edit",
      index: 0,
      commandId: ToggleSlideEditSidebarOperation.id,
      commandParams: {
        visible: true,
        objectType
      },
      disable: false
    }, {
      label: "slides-ui.popup.delete",
      index: 5,
      commandId: DeleteSlideElementOperation.id,
      commandParams: {
        id: oKey,
        unitId
      },
      disable: false
    }];
    return menuItems;
  }
};
SlidePopupMenuController = __decorateClass([
  __decorateParam(0, Inject(SlideCanvasPopMangerService)),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, IContextService),
  __decorateParam(4, Inject(CanvasView)),
  __decorateParam(5, ISidebarService),
  __decorateParam(6, ICommandService)
], SlidePopupMenuController);

// ../packages/slides-ui/src/services/slide-render.service.ts
var SlideRenderService = class extends RxDisposable {
  // private _skeletonChangeMutations = new Set<string>();
  constructor(_contextService, _instanceSrv, _renderManagerService) {
    super();
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_instanceSrv", _instanceSrv);
    __publicField(this, "_renderManagerService", _renderManagerService);
    Promise.resolve().then(() => this._init());
  }
  _init() {
    this._initSlideDataListener();
    this._initContextListener();
  }
  _initSlideDataListener() {
    this._instanceSrv.getTypeOfUnitAdded$(3 /* UNIVER_SLIDE */).pipe(takeUntil(this.dispose$)).subscribe((event) => {
      this._createRenderer(event.unit.getUnitId());
    });
    this._instanceSrv.getAllUnitsForType(3 /* UNIVER_SLIDE */).forEach((slideModel) => {
      this._createRenderer(slideModel.getUnitId());
    });
    this._instanceSrv.getTypeOfUnitDisposed$(3 /* UNIVER_SLIDE */).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._disposeRenderer(workbook));
  }
  _createRenderer(unitId) {
    if (unitId == null) {
      return;
    }
    const model = this._instanceSrv.getUnit(unitId, 3 /* UNIVER_SLIDE */);
    if (model == null) {
      return;
    }
    this._renderManagerService.createRender(unitId);
  }
  _disposeRenderer(workbook) {
    const unitId = workbook.getUnitId();
    this._renderManagerService.removeRender(unitId);
  }
  _initContextListener() {
  }
};
SlideRenderService = __decorateClass([
  __decorateParam(0, IContextService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, IRenderManagerService)
], SlideRenderService);

// ../packages/slides-ui/src/plugin.ts
var UniverSlidesUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _renderManagerService, _univerInstanceService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SLIDES_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    mergeOverrideWithDependencies([
      [SlideRenderService],
      [ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }],
      // used by SlideUIController --> EditorContainer
      [ISlideEditorManagerService, { useClass: SlideEditorManagerService }],
      [SlideCanvasPopMangerService]
    ], this._config.override).forEach((d) => this._injector.add(d));
  }
  onReady() {
    [
      // SlideRenderService will be init in ready stage, and then calling RenderManagerService@createRender --> init all deps in this rendering register block.
      [SlideRenderController]
    ].forEach((m) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(3 /* UNIVER_SLIDE */, m));
    });
    mergeOverrideWithDependencies([
      [CanvasView],
      // cannot register in _renderManagerService now.
      // [ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }],
      // // used by SlideUIController --> EditorContainer
      // [ISlideEditorManagerService, { useClass: SlideEditorManagerService }],
      // SlidesUIController controller should be registered in Ready stage.
      // SlidesUIController controller would add a new RenderUnit (__INTERNAL_EDITOR__DOCS_NORMAL)
      [SlidesUIController],
      // editor service was create in renderManagerService
      [SlideRenderController],
      [SlidePopupMenuController]
    ], this._config.override).forEach((m) => {
      this._injector.add(m);
    });
    this._injector.get(CanvasView);
    this._injector.get(SlideRenderService);
  }
  onRendered() {
    [
      // need slideEditorBridgeService
      // need TextSelectionRenderService which init by EditorContainer
      [SlideEditorBridgeRenderController],
      [SlideEditingRenderController]
    ].forEach((m) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(3 /* UNIVER_SLIDE */, m));
    });
    this._markSlideAsFocused();
    this._injector.get(SlidesUIController);
  }
  onSteady() {
    this._injector.get(SlidePopupMenuController);
  }
  _markSlideAsFocused() {
    const currentService = this._univerInstanceService;
    try {
      const slideDataModel = currentService.getCurrentUnitOfType(3 /* UNIVER_SLIDE */);
      currentService.focusUnit(slideDataModel.getUnitId());
    } catch (e) {
    }
  }
};
__publicField(UniverSlidesUIPlugin, "pluginName", "UNIVER_SLIDES_UI_PLUGIN");
__publicField(UniverSlidesUIPlugin, "packageName", package_default.name);
__publicField(UniverSlidesUIPlugin, "version", package_default.version);
__publicField(UniverSlidesUIPlugin, "type", 3 /* UNIVER_SLIDE */);
UniverSlidesUIPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService),
  __decorateParam(4, IConfigService)
], UniverSlidesUIPlugin);

// src/slides/main.ts
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  }
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
  ribbonType: "classic"
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverDrawingPlugin);
univer.registerPlugin(UniverSlidesPlugin);
univer.registerPlugin(UniverSlidesUIPlugin);
univer.createUnit(3 /* UNIVER_SLIDE */, DEFAULT_SLIDE_DATA);
window.univer = univer;
