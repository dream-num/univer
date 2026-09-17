import {
  UniverDocsMentionUIPlugin
} from "../chunk-YCGC2XFC.js";
import {
  SetActiveCommentOperation,
  ThreadCommentPanel,
  ThreadCommentPanelService,
  UniverThreadCommentUIPlugin
} from "../chunk-3WOCRIC2.js";
import "../chunk-WHQBYF3J.js";
import {
  InsertDocImageCommand,
  UniverDebuggerPlugin,
  UniverDocsDrawingUIPlugin
} from "../chunk-3ZF3VDGH.js";
import {
  AddCommentMutation,
  IThreadCommentDataSourceService,
  ThreadCommentModel,
  getDT
} from "../chunk-CER5CEC6.js";
import "../chunk-FRWZDCQD.js";
import {
  UniverDocsDrawingPlugin,
  UniverDrawingUIPlugin
} from "../chunk-FXH7NPJ2.js";
import {
  FUniver
} from "../chunk-2WA7JL2E.js";
import "../chunk-BHQGV2VJ.js";
import {
  DEFAULT_DOCUMENT_DATA_SIMPLE
} from "../chunk-VEBN3ADF.js";
import {
  BulletListCommand,
  CutContentCommand,
  DOC_INTERCEPTOR_POINT,
  DeleteCommand,
  DeleteLeftCommand,
  DocBackScrollRenderController,
  DocCanvasPopManagerService,
  DocCreateTableOperation,
  DocEventManagerService,
  DocInterceptorService,
  DocRenderController,
  DocSelectionManagerService,
  DocSelectionRenderService,
  DocSkeletonManagerService,
  EMPTY_PARAGRAPH_MENU_ID,
  HorizontalLineCommand,
  IMEInputCommand,
  INSERT_BELLOW_MENU_ID,
  InsertCommand,
  MoveCursorOperation,
  NodePositionConvertToCursor,
  OrderListCommand,
  RichTextEditingMutation,
  SetTextSelectionsOperation,
  UniverDocsPlugin,
  UniverDocsUIPlugin,
  UniverDrawingPlugin,
  addCustomDecorationBySelectionFactory,
  addCustomRangeBySelectionFactory,
  deleteCustomDecorationFactory,
  deleteCustomRangeFactory,
  getAnchorBounding,
  replaceSelectionFactory,
  whenDocAndEditorFocused
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  Button,
  CommentIcon,
  ComponentManager,
  CopyIcon,
  DividerIcon,
  FormLayout,
  ILayoutService,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  ISidebarService,
  IncreaseIcon,
  Input,
  LinkIcon,
  TextIcon,
  Tooltip,
  UniverUIPlugin,
  UnlinkIcon,
  WriteIcon,
  borderBottomClassName,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useDependency,
  useEvent,
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
  IRenderManagerService,
  UniverRenderEnginePlugin,
  ptToPixel,
  withCurrentTypeOfRenderer
} from "../chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  BuildTextUtils,
  DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
  DOCS_ZEN_EDITOR_UNIT_ID_KEY,
  DependentOn,
  Disposable,
  DisposableCollection,
  ICommandService,
  IConfigService,
  IResourceManagerService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Observable,
  Plugin,
  SHEET_EDITOR_UNITS,
  Tools,
  Univer,
  UserManagerService,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  generateRandomId,
  getBodySlice,
  isInternalEditorID,
  isSafeUrl,
  map,
  merge_default,
  of,
  pairwise,
  sequenceExecute,
  tap,
  toDisposable
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "../chunk-24OICD5T.js";

// ../packages/docs-hyper-link/package.json
var package_default = {
  name: "@univerjs/docs-hyper-link",
  version: "0.25.2",
  private: false,
  description: "Hyperlink model and commands for Univer Docs.",
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
    "hyperlink",
    "link",
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
    "@univerjs/core": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/docs-hyper-link/src/commands/mutations/hyper-link.mutation.ts
var AddHyperLinkMuatation = {
  id: "docs.mutation.add-hyper-link",
  type: 2 /* MUTATION */,
  handler: () => {
    return true;
  }
};
var UpdateHyperLinkMuatation = {
  id: "docs.mutation.update-hyper-link",
  type: 2 /* MUTATION */,
  handler: () => {
    return true;
  }
};
var DeleteHyperLinkMuatation = {
  id: "docs.mutation.delete-hyper-link",
  type: 2 /* MUTATION */,
  handler: () => {
    return true;
  }
};

// ../packages/docs-hyper-link/src/config/config.ts
var DOCS_HYPER_LINK_PLUGIN_CONFIG_KEY = "docs-hyper-link.config";
var configSymbol = Symbol(DOCS_HYPER_LINK_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/docs-hyper-link/src/controllers/resource.controller.ts
var DOC_HYPER_LINK_PLUGIN = "DOC_HYPER_LINK_PLUGIN";
var DocHyperLinkResourceController = class extends Disposable {
  constructor(_resourceManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_resourceManagerService", _resourceManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this._init();
  }
  _init() {
    this._resourceManagerService.registerPluginResource({
      pluginName: DOC_HYPER_LINK_PLUGIN,
      businesses: [1 /* UNIVER_DOC */],
      onLoad: (unitID, resource) => {
        const doc = this._univerInstanceService.getUnit(unitID, 1 /* UNIVER_DOC */);
        if (!doc) {
          return;
        }
        const customRangeMap = /* @__PURE__ */ new Map();
        const handleDoc = (model) => {
          var _a, _b;
          (_b = (_a = model.getBody()) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.forEach((customRange) => {
            if (customRange.rangeType === 0 /* HYPERLINK */) {
              customRangeMap.set(customRange.rangeId, customRange);
            }
          });
          return customRangeMap;
        };
        doc.headerModelMap.forEach((headerModel) => {
          handleDoc(headerModel);
        });
        doc.footerModelMap.forEach((footerModel) => {
          handleDoc(footerModel);
        });
        handleDoc(doc);
        resource.links.forEach((link) => {
          const customRange = customRangeMap.get(link.id);
          if (customRange) {
            customRange.properties = {
              ...customRange.properties,
              url: link.payload
            };
          }
        });
      },
      onUnLoad: (unitID) => {
      },
      toJson: (unitID) => {
        const doc = this._univerInstanceService.getUnit(unitID, 1 /* UNIVER_DOC */);
        const links = [];
        if (doc) {
          const handleDoc = (model) => {
            var _a, _b;
            (_b = (_a = model.getBody()) == null ? void 0 : _a.customRanges) == null ? void 0 : _b.forEach((customRange) => {
              var _a2;
              if (customRange.rangeType === 0 /* HYPERLINK */) {
                links.push({
                  id: customRange.rangeId,
                  payload: ((_a2 = customRange.properties) == null ? void 0 : _a2.url) || ""
                });
              }
            });
          };
          doc.headerModelMap.forEach((headerModel) => {
            handleDoc(headerModel);
          });
          doc.footerModelMap.forEach((footerModel) => {
            handleDoc(footerModel);
          });
          handleDoc(doc);
        }
        return JSON.stringify({ links });
      },
      parseJson(bytes) {
        return JSON.parse(bytes);
      }
    });
  }
};
DocHyperLinkResourceController = __decorateClass([
  __decorateParam(0, Inject(IResourceManagerService)),
  __decorateParam(1, IUniverInstanceService)
], DocHyperLinkResourceController);

// ../packages/docs-hyper-link/src/plugin.ts
var UniverDocsHyperLinkPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService, _commandService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_commandService", _commandService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(DOCS_HYPER_LINK_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const deps = [[DocHyperLinkResourceController]];
    deps.forEach((dep) => this._injector.add(dep));
    [AddHyperLinkMuatation, DeleteHyperLinkMuatation, UpdateHyperLinkMuatation].forEach((mutation) => {
      this.disposeWithMe(this._commandService.registerCommand(mutation));
    });
    this._injector.get(DocHyperLinkResourceController);
  }
};
__publicField(UniverDocsHyperLinkPlugin, "pluginName", DOC_HYPER_LINK_PLUGIN);
__publicField(UniverDocsHyperLinkPlugin, "packageName", package_default.name);
__publicField(UniverDocsHyperLinkPlugin, "version", package_default.version);
__publicField(UniverDocsHyperLinkPlugin, "type", 1 /* UNIVER_DOC */);
UniverDocsHyperLinkPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService),
  __decorateParam(3, ICommandService)
], UniverDocsHyperLinkPlugin);

// ../packages/docs-hyper-link-ui/package.json
var package_default2 = {
  name: "@univerjs/docs-hyper-link-ui",
  version: "0.25.2",
  private: false,
  description: "Hyperlink editing UI for Univer Docs.",
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
    "hyperlink",
    "link",
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
    "@univerjs/docs-hyper-link": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
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

// ../packages/docs-hyper-link-ui/src/config/config.ts
var DOCS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY = "docs-hyper-link-ui.config";
var configSymbol2 = Symbol(DOCS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/docs-hyper-link-ui/src/views/hyper-link-edit/index.tsx
var import_react = __toESM(require_react());

// ../packages/docs-hyper-link-ui/src/commands/commands/add-link.command.ts
var AddDocHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "docs.command.add-hyper-link",
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { payload, unitId, selections } = params;
    const commandService = accessor.get(ICommandService);
    const id = generateRandomId();
    const doMutation = addCustomRangeBySelectionFactory(
      accessor,
      {
        rangeId: id,
        rangeType: 0 /* HYPERLINK */,
        properties: {
          url: payload
        },
        unitId,
        selections
      }
    );
    if (doMutation) {
      return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    }
    return false;
  }
};

// ../packages/docs-hyper-link-ui/src/commands/commands/update-link.command.ts
var UpdateDocHyperLinkCommand = {
  id: "docs.command.update-hyper-link",
  type: 0 /* COMMAND */,
  handler(accessor, params) {
    var _a;
    if (!params) {
      return false;
    }
    const { unitId, payload, segmentId, linkId } = params;
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const currentSelection = docSelectionManagerService.getActiveTextRange();
    const doc = univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
    if (!currentSelection || !doc) {
      return false;
    }
    const oldBody = getBodySlice(doc.getSelfOrHeaderFooterModel(segmentId).getBody(), currentSelection.startOffset, currentSelection.endOffset);
    const textRun = (_a = oldBody.textRuns) == null ? void 0 : _a[0];
    if (textRun) {
      textRun.ed = params.label.length + 1;
    }
    const replaceSelection = replaceSelectionFactory(accessor, {
      unitId,
      body: {
        dataStream: `${params.label}`,
        customRanges: [{
          rangeId: linkId,
          rangeType: 0 /* HYPERLINK */,
          startIndex: 0,
          endIndex: params.label.length + 1,
          properties: {
            url: payload
          }
        }],
        textRuns: textRun ? [textRun] : void 0
      },
      selection: {
        startOffset: currentSelection.startOffset,
        endOffset: currentSelection.endOffset,
        collapsed: false,
        segmentId
      }
    });
    if (!replaceSelection) {
      return false;
    }
    return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
  }
};

// ../packages/docs-hyper-link-ui/src/views/hyper-link-edit/utils.ts
function isBlankInput(value) {
  return value.trim().length === 0;
}

// ../packages/docs-hyper-link-ui/src/views/hyper-link-edit/index.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
function hasProtocol(urlString) {
  const pattern = /^[a-zA-Z]+:\/\//;
  return pattern.test(urlString);
}
function isEmail(url) {
  const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return pattern.test(url);
}
function transformUrl(urlStr) {
  return hasProtocol(urlStr) ? urlStr : isEmail(urlStr) ? `mailto://${urlStr}` : `https://${urlStr}`;
}
var DocHyperLinkEdit = () => {
  const hyperLinkService = useDependency(DocHyperLinkPopupService);
  const localeService = useDependency(LocaleService);
  const editing = useObservable(hyperLinkService.editingLink$);
  const commandService = useDependency(ICommandService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const [link, setLink] = (0, import_react.useState)("");
  const [label, setLabel] = (0, import_react.useState)("");
  const [showError, setShowError] = (0, import_react.useState)(false);
  const isLegal = Tools.isLegalUrl(link);
  const doc = editing ? univerInstanceService.getUnit(editing.unitId, 1 /* UNIVER_DOC */) : univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
  (0, import_react.useEffect)(() => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const activeRange = docSelectionManagerService.getActiveTextRange();
    if (!activeRange) {
      return;
    }
    if (editing) {
      const body2 = (_a = doc == null ? void 0 : doc.getSelfOrHeaderFooterModel(editing.segmentId)) == null ? void 0 : _a.getBody();
      const matchedRange2 = (_b = body2 == null ? void 0 : body2.customRanges) == null ? void 0 : _b.find((i) => (editing == null ? void 0 : editing.linkId) === i.rangeId && i.startIndex === editing.startIndex && i.endIndex === editing.endIndex);
      if (doc && matchedRange2) {
        setLink((_d = (_c = matchedRange2.properties) == null ? void 0 : _c.url) != null ? _d : "");
        setLabel(BuildTextUtils.transform.getPlainText(getBodySlice(body2, matchedRange2.startIndex, matchedRange2.endIndex + 1).dataStream));
      }
      return;
    }
    const body = (_e = doc == null ? void 0 : doc.getSelfOrHeaderFooterModel(activeRange.segmentId)) == null ? void 0 : _e.getBody();
    const selection = body ? activeRange : null;
    const matchedRange = selection && ((_g = BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, (_f = body == null ? void 0 : body.customRanges) != null ? _f : [])) == null ? void 0 : _g[0]);
    if (doc && matchedRange) {
      setLink((_i = (_h = matchedRange == null ? void 0 : matchedRange.properties) == null ? void 0 : _h.url) != null ? _i : "");
    }
  }, [doc, editing, docSelectionManagerService, univerInstanceService]);
  const handleCancel = () => {
    hyperLinkService.hideEditPopup();
  };
  const handleConfirm = () => {
    setShowError(true);
    if (!isLegal || !doc) {
      return;
    }
    const linkFinal = transformUrl(link);
    if (!editing) {
      commandService.executeCommand(AddDocHyperLinkCommand.id, {
        unitId: doc.getUnitId(),
        payload: linkFinal
      });
    } else {
      if (isBlankInput(label)) {
        return;
      }
      commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
        unitId: doc.getUnitId(),
        payload: linkFinal,
        linkId: editing.linkId,
        label,
        segmentId: editing.segmentId
      });
    }
    hyperLinkService.hideEditPopup();
  };
  if (!doc) {
    return;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: clsx(`univer-box-border univer-w-[328px] univer-rounded-xl univer-bg-white univer-px-6 univer-py-5 univer-shadow dark:!univer-bg-gray-900`, borderClassName),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            FormLayout,
            {
              label: localeService.t("docs-hyper-link-ui.edit.label"),
              error: showError && isBlankInput(label) ? localeService.t("docs-hyper-link-ui.edit.labelError") : "",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Input,
                {
                  value: label,
                  onChange: setLabel,
                  autoFocus: true,
                  onKeyDown: (evt) => {
                    if (evt.keyCode === 13 /* ENTER */) {
                      handleConfirm();
                    }
                  }
                }
              )
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            FormLayout,
            {
              label: localeService.t("docs-hyper-link-ui.edit.address"),
              error: showError && !isLegal ? localeService.t("docs-hyper-link-ui.edit.addressError") : "",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Input,
                {
                  value: link,
                  onChange: setLink,
                  autoFocus: true,
                  onKeyDown: (evt) => {
                    if (evt.keyCode === 13 /* ENTER */) {
                      handleConfirm();
                    }
                  }
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-flex univer-justify-end univer-gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { onClick: handleCancel, children: localeService.t("docs-hyper-link-ui.edit.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Button,
            {
              variant: "primary",
              disabled: isBlankInput(link),
              onClick: handleConfirm,
              children: localeService.t("docs-hyper-link-ui.edit.confirm")
            }
          )
        ] })
      ]
    }
  );
};
DocHyperLinkEdit.componentKey = "docs-hyper-link-edit";

// ../packages/docs-hyper-link-ui/src/commands/commands/delete-link.command.ts
var DeleteDocHyperLinkCommand = {
  type: 0 /* COMMAND */,
  id: "docs.command.delete-hyper-link",
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { unitId, linkId, segmentId } = params;
    const commandService = accessor.get(ICommandService);
    const doMutation = deleteCustomRangeFactory(accessor, { unitId, rangeId: linkId, segmentId });
    if (!doMutation) {
      return false;
    }
    return await commandService.syncExecuteCommand(doMutation.id, doMutation.params);
  }
};

// ../packages/docs-hyper-link-ui/src/commands/operations/popup.operation.ts
var shouldDisableAddLink = (accessor) => {
  const textSelectionService = accessor.get(DocSelectionManagerService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const textRanges = textSelectionService.getTextRanges();
  if (!(textRanges == null ? void 0 : textRanges.length)) {
    return true;
  }
  const activeRange = textRanges[0];
  const doc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
  if (!doc || !activeRange || activeRange.collapsed) {
    return true;
  }
  return false;
};
var ShowDocHyperLinkEditPopupOperation = {
  type: 1 /* OPERATION */,
  id: "doc.operation.show-hyper-link-edit-popup",
  handler(accessor, params) {
    var _a;
    const linkInfo = params == null ? void 0 : params.link;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    if (shouldDisableAddLink(accessor) && !linkInfo) {
      return false;
    }
    const hyperLinkService = accessor.get(DocHyperLinkPopupService);
    const unitId = (linkInfo == null ? void 0 : linkInfo.unitId) || ((_a = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */)) == null ? void 0 : _a.getUnitId());
    if (!unitId) {
      return false;
    }
    hyperLinkService.showEditPopup(unitId, linkInfo);
    return true;
  }
};
var ToggleDocHyperLinkInfoPopupOperation = {
  type: 1 /* OPERATION */,
  id: "doc.operation.toggle-hyper-link-info-popup",
  handler(accessor, params) {
    const hyperLinkService = accessor.get(DocHyperLinkPopupService);
    if (!params) {
      hyperLinkService.hideInfoPopup();
      return true;
    }
    hyperLinkService.showInfoPopup(params);
    return true;
  }
};
var ClickDocHyperLinkOperation = {
  type: 1 /* OPERATION */,
  id: "doc.operation.click-hyper-link",
  handler(accessor, params) {
    var _a, _b, _c;
    if (!params) {
      return false;
    }
    const { unitId, linkId, segmentId } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const doc = univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
    const body = doc == null ? void 0 : doc.getSelfOrHeaderFooterModel(segmentId).getBody();
    const link = (_c = (_b = (_a = body == null ? void 0 : body.customRanges) == null ? void 0 : _a.find((range) => range.rangeId === linkId && range.rangeType === 0 /* HYPERLINK */)) == null ? void 0 : _b.properties) == null ? void 0 : _c.url;
    if (!isSafeUrl(link)) {
      return false;
    }
    window.open(link, "_blank", "noopener noreferrer");
    return true;
  }
};

// ../packages/docs-hyper-link-ui/src/views/hyper-link-popup/index.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var DocLinkPopup = () => {
  var _a, _b;
  const hyperLinkService = useDependency(DocHyperLinkPopupService);
  const commandService = useDependency(ICommandService);
  const messageService = useDependency(IMessageService);
  const localeService = useDependency(LocaleService);
  const currentPopup = useObservable(hyperLinkService.showingLink$);
  const univerInstanceService = useDependency(IUniverInstanceService);
  if (!currentPopup) {
    return null;
  }
  const { unitId, linkId, segmentId, startIndex, endIndex } = currentPopup;
  const doc = univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
  const body = doc == null ? void 0 : doc.getSelfOrHeaderFooterModel(segmentId).getBody();
  const link = (_a = body == null ? void 0 : body.customRanges) == null ? void 0 : _a.find((range) => range.rangeId === linkId && range.rangeType === 0 /* HYPERLINK */ && range.startIndex === startIndex && range.endIndex === endIndex);
  if (!link) {
    return null;
  }
  const url = (_b = link.properties) == null ? void 0 : _b.url;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: clsx(`univer-box-border univer-flex univer-max-w-80 univer-items-center univer-justify-between univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-3 univer-shadow dark:!univer-bg-gray-900`, borderClassName),
      onClick: () => {
        hyperLinkService.hideInfoPopup();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: `univer-flex univer-h-6 univer-flex-1 univer-cursor-pointer univer-items-center univer-truncate univer-text-sm univer-leading-5 univer-text-primary-500`,
            onClick: () => window.open(url, void 0, "noopener noreferrer"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "div",
                {
                  className: `univer-mr-2 univer-flex univer-size-5 univer-flex-[0_0_auto] univer-items-center univer-justify-center univer-text-base univer-text-gray-900 dark:!univer-text-white`,
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LinkIcon, {})
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { showIfEllipsis: true, title: url, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "univer-flex-1 univer-truncate", children: url }) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-flex univer-h-6 univer-flex-[0_0_auto] univer-items-center univer-justify-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-text-base`,
              onClick: () => {
                navigator.clipboard.writeText(url);
                messageService.show({
                  content: localeService.t("docs-hyper-link-ui.info.coped"),
                  type: "info" /* Info */
                });
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("docs-hyper-link-ui.info.copy"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CopyIcon, {}) })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-text-base`,
              onClick: () => {
                commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, {
                  link: currentPopup
                });
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("docs-hyper-link-ui.info.edit"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WriteIcon, {}) })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              className: `univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-text-base`,
              onClick: () => {
                commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
                  unitId,
                  linkId: link.rangeId,
                  segmentId
                });
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tooltip, { placement: "bottom", title: localeService.t("docs-hyper-link-ui.info.cancel"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UnlinkIcon, {}) })
            }
          )
        ] })
      ]
    }
  );
};
DocLinkPopup.componentKey = "univer.doc.link-info-popup";

// ../packages/docs-hyper-link-ui/src/services/hyper-link-popup.service.ts
var DocHyperLinkPopupService = class extends Disposable {
  constructor(_docCanvasPopupManagerService, _textSelectionManagerService, _univerInstanceService) {
    super();
    __publicField(this, "_docCanvasPopupManagerService", _docCanvasPopupManagerService);
    __publicField(this, "_textSelectionManagerService", _textSelectionManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_editingLink$", new BehaviorSubject(null));
    __publicField(this, "_showingLink$", new BehaviorSubject(null));
    __publicField(this, "editingLink$", this._editingLink$.asObservable());
    __publicField(this, "showingLink$", this._showingLink$.asObservable());
    __publicField(this, "_editPopup", null);
    __publicField(this, "_infoPopup", null);
    this.disposeWithMe(() => {
      this._editingLink$.complete();
      this._showingLink$.complete();
    });
  }
  get editing() {
    return this._editingLink$.value;
  }
  get showing() {
    return this._showingLink$.value;
  }
  showEditPopup(unitId, linkInfo) {
    if (this._editPopup) {
      this._editPopup.dispose();
    }
    this._editingLink$.next(linkInfo);
    const textRanges = this._textSelectionManagerService.getTextRanges({ unitId, subUnitId: unitId });
    let activeRange = textRanges == null ? void 0 : textRanges[textRanges.length - 1];
    if (linkInfo) {
      const { segmentId, segmentPage, startIndex, endIndex } = linkInfo;
      activeRange = {
        collapsed: false,
        startOffset: startIndex,
        endOffset: endIndex + 1,
        segmentId,
        segmentPage
      };
      this._textSelectionManagerService.replaceDocRanges([{
        startOffset: startIndex,
        endOffset: endIndex + 1
      }]);
    }
    if (activeRange) {
      this._editPopup = this._docCanvasPopupManagerService.attachPopupToRange(
        activeRange,
        {
          componentKey: DocHyperLinkEdit.componentKey,
          direction: "bottom"
        },
        unitId
      );
      return this._editPopup;
    }
    return null;
  }
  hideEditPopup() {
    var _a;
    this._editingLink$.next(null);
    (_a = this._editPopup) == null ? void 0 : _a.dispose();
  }
  showInfoPopup(info) {
    var _a, _b, _c, _d, _e, _f;
    const { linkId, unitId, segmentId, segmentPage, startIndex, endIndex } = info;
    if (((_a = this.showing) == null ? void 0 : _a.linkId) === linkId && ((_b = this.showing) == null ? void 0 : _b.unitId) === unitId && ((_c = this.showing) == null ? void 0 : _c.segmentId) === segmentId && ((_d = this.showing) == null ? void 0 : _d.segmentPage) === segmentPage && ((_e = this.showing) == null ? void 0 : _e.startIndex) === startIndex && ((_f = this.showing) == null ? void 0 : _f.endIndex) === endIndex) {
      return;
    }
    if (this._infoPopup) {
      this._infoPopup.dispose();
    }
    const doc = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
    if (!doc) {
      return;
    }
    this._showingLink$.next({ unitId, linkId, segmentId, segmentPage, startIndex, endIndex });
    this._infoPopup = this._docCanvasPopupManagerService.attachPopupToRange(
      {
        collapsed: false,
        startOffset: startIndex,
        endOffset: endIndex + 1,
        segmentId,
        segmentPage
      },
      {
        componentKey: DocLinkPopup.componentKey,
        direction: "top-center",
        multipleDirection: "top",
        onClickOutside: () => {
          this.hideInfoPopup();
        }
      },
      unitId
    );
    return this._infoPopup;
  }
  hideInfoPopup() {
    var _a;
    this._showingLink$.next(null);
    (_a = this._infoPopup) == null ? void 0 : _a.dispose();
  }
};
DocHyperLinkPopupService = __decorateClass([
  __decorateParam(0, Inject(DocCanvasPopManagerService)),
  __decorateParam(1, Inject(DocSelectionManagerService)),
  __decorateParam(2, IUniverInstanceService)
], DocHyperLinkPopupService);

// ../packages/docs-hyper-link-ui/src/controllers/doc-hyper-link-selection.controller.ts
var DocHyperLinkSelectionController = class extends Disposable {
  constructor(_commandService, _univerInstanceService, _docHyperLinkService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_docHyperLinkService", _docHyperLinkService);
    this._initSelectionChange();
  }
  _initSelectionChange() {
    this.disposeWithMe(
      this._commandService.onCommandExecuted((commandInfo) => {
        var _a, _b, _c;
        if (commandInfo.id === SetTextSelectionsOperation.id) {
          const params = commandInfo.params;
          const { unitId, ranges, segmentId } = params;
          const doc = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
          const primary = ranges[0];
          if (primary && doc) {
            const { startOffset, endOffset, collapsed, segmentPage } = primary;
            const customRanges = (_b = (_a = doc.getSelfOrHeaderFooterModel(segmentId)) == null ? void 0 : _a.getBody()) == null ? void 0 : _b.customRanges;
            if (collapsed) {
              const index = (_c = customRanges == null ? void 0 : customRanges.findIndex((value) => value.startIndex < startOffset && value.endIndex > endOffset - 1)) != null ? _c : -1;
              if (index > -1) {
                const customRange = customRanges[index];
                this._docHyperLinkService.showInfoPopup({ unitId, linkId: customRange.rangeId, segmentId, segmentPage, startIndex: customRange.startIndex, endIndex: customRange.endIndex });
                return;
              }
            } else {
              const range = customRanges == null ? void 0 : customRanges.find((value) => value.startIndex <= startOffset && value.endIndex >= endOffset - 1);
              if (range) {
                return;
              }
            }
          }
          this._docHyperLinkService.hideInfoPopup();
          this._docHyperLinkService.hideEditPopup();
        }
      })
    );
  }
};
DocHyperLinkSelectionController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(DocHyperLinkPopupService))
], DocHyperLinkSelectionController);

// ../packages/docs-hyper-link-ui/src/controllers/render-controllers/hyper-link-event.render-controller.ts
var DocHyperLinkEventRenderController = class extends Disposable {
  constructor(_context, _docEventManagerService, _commandService, _hyperLinkPopupService, _docSkeletonManagerService, _docSelectionManagerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_docEventManagerService", _docEventManagerService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_hyperLinkPopupService", _hyperLinkPopupService);
    __publicField(this, "_docSkeletonManagerService", _docSkeletonManagerService);
    __publicField(this, "_docSelectionManagerService", _docSelectionManagerService);
    if (this._context.unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY || this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
      return;
    }
    this._initHover();
    this._initClick();
  }
  get _skeleton() {
    return this._docSkeletonManagerService.getSkeleton();
  }
  _hideInfoPopup() {
    if (this._hyperLinkPopupService.showing) {
      this._commandService.executeCommand(
        ToggleDocHyperLinkInfoPopupOperation.id
      );
    }
  }
  _initHover() {
    this.disposeWithMe(
      this._docEventManagerService.hoverCustomRanges$.subscribe((ranges) => {
        var _a, _b;
        const link = ranges.find((range) => range.range.rangeType === 0 /* HYPERLINK */);
        const activeRanges = this._docSelectionManagerService.getTextRanges();
        const currentSegmentId = (_a = activeRanges == null ? void 0 : activeRanges[0]) == null ? void 0 : _a.segmentId;
        if (((_b = link == null ? void 0 : link.segmentId) != null ? _b : "") !== currentSegmentId) {
          this._hideInfoPopup();
          return;
        }
        if (link) {
          this._commandService.executeCommand(
            ToggleDocHyperLinkInfoPopupOperation.id,
            {
              unitId: this._context.unitId,
              linkId: link.range.rangeId,
              segmentId: link.segmentId,
              segmentPage: link.segmentPageIndex,
              rangeId: link.range.rangeId,
              startIndex: link.range.startIndex,
              endIndex: link.range.endIndex
            }
          );
        } else {
          this._hideInfoPopup();
        }
      })
    );
  }
  _initClick() {
    this.disposeWithMe(
      this._docEventManagerService.clickCustomRanges$.subscribe((range) => {
        const link = range.range;
        if (link) {
          this._commandService.executeCommand(
            ClickDocHyperLinkOperation.id,
            {
              unitId: this._context.unitId,
              linkId: link.rangeId,
              segmentId: range.segmentId
            }
          );
        }
      })
    );
  }
};
DocHyperLinkEventRenderController = __decorateClass([
  __decorateParam(1, Inject(DocEventManagerService)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, Inject(DocHyperLinkPopupService)),
  __decorateParam(4, Inject(DocSkeletonManagerService)),
  __decorateParam(5, Inject(DocSelectionManagerService))
], DocHyperLinkEventRenderController);

// ../packages/docs-hyper-link-ui/src/controllers/render-controllers/render.controller.ts
var DocHyperLinkRenderController = class extends Disposable {
  constructor(_context, _docInterceptorService, _hyperLinkService, _docRenderController) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_docInterceptorService", _docInterceptorService);
    __publicField(this, "_hyperLinkService", _hyperLinkService);
    __publicField(this, "_docRenderController", _docRenderController);
    this._init();
    this._initReRender();
  }
  _init() {
    this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_RANGE, {
      handler: (data, pos, next) => {
        if (!data) {
          return next(data);
        }
        const { unitId, index } = pos;
        const activeLink = this._hyperLinkService.showing;
        if (!activeLink) {
          return next({
            ...data,
            active: false
          });
        }
        const { linkId, unitId: linkUnitId, startIndex, endIndex } = activeLink;
        const isActive = linkUnitId === unitId && data.rangeId === linkId && index >= startIndex && index <= endIndex;
        return next({
          ...data,
          active: isActive
        });
      }
    });
  }
  _initReRender() {
    this.disposeWithMe(this._hyperLinkService.showingLink$.pipe(
      distinctUntilChanged((prev, aft) => (prev == null ? void 0 : prev.linkId) === (aft == null ? void 0 : aft.linkId) && (prev == null ? void 0 : prev.unitId) === (aft == null ? void 0 : aft.unitId) && (prev == null ? void 0 : prev.startIndex) === (aft == null ? void 0 : aft.startIndex)),
      pairwise()
    ).subscribe(([preLink, link]) => {
      if (link) {
        if (link.unitId === this._context.unitId) {
          this._docRenderController.reRender(link.unitId);
        }
      } else {
        if (preLink && preLink.unitId === this._context.unitId) {
          this._docRenderController.reRender(preLink.unitId);
        }
      }
    }));
  }
};
DocHyperLinkRenderController = __decorateClass([
  __decorateParam(1, Inject(DocInterceptorService)),
  __decorateParam(2, Inject(DocHyperLinkPopupService)),
  __decorateParam(3, Inject(DocRenderController))
], DocHyperLinkRenderController);

// ../packages/docs-hyper-link-ui/src/menu/menu.ts
var DOC_LINK_ICON = "doc-hyper-link-icon";
function AddHyperLinkMenuItemFactory(accessor) {
  return {
    id: ShowDocHyperLinkEditPopupOperation.id,
    type: 0 /* BUTTON */,
    icon: DOC_LINK_ICON,
    title: "docs-hyper-link-ui.menu.tooltip",
    tooltip: "docs-hyper-link-ui.menu.tooltip",
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */),
    disabled$: new Observable(function(subscribe) {
      const textSelectionService = accessor.get(DocSelectionManagerService);
      const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
        subscribe.next(shouldDisableAddLink(accessor));
      });
      return () => {
        observer.unsubscribe();
      };
    })
  };
}
var addLinkShortcut = {
  id: ShowDocHyperLinkEditPopupOperation.id,
  binding: 4096 /* CTRL_COMMAND */ | 75 /* K */,
  description: "docs-hyper-link-ui.menu.tooltip",
  preconditions: whenDocAndEditorFocused
};

// ../packages/docs-hyper-link-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [ShowDocHyperLinkEditPopupOperation.id]: {
      order: 1,
      menuItemFactory: AddHyperLinkMenuItemFactory
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.data" /* DATA */]: {
      [ShowDocHyperLinkEditPopupOperation.id]: {
        order: 0,
        menuItemFactory: AddHyperLinkMenuItemFactory
      }
    }
  },
  ["contextMenu.paragraph" /* PARAGRAPH */]: {
    ["contextMenu.layout" /* LAYOUT */]: {
      [INSERT_BELLOW_MENU_ID]: {
        [ShowDocHyperLinkEditPopupOperation.id]: {
          order: 6,
          menuItemFactory: AddHyperLinkMenuItemFactory
        }
      }
    },
    [EMPTY_PARAGRAPH_MENU_ID]: {
      ["contextMenu.layout" /* LAYOUT */]: {
        [ShowDocHyperLinkEditPopupOperation.id]: {
          order: 6,
          menuItemFactory: AddHyperLinkMenuItemFactory
        }
      }
    }
  }
};

// ../packages/docs-hyper-link-ui/src/controllers/ui.controller.ts
var DocHyperLinkUIController = class extends Disposable {
  constructor(_componentManager, _commandService, _menuManagerService, _shortcutService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_shortcutService", _shortcutService);
    this._initComponents();
    this._initCommands();
    this._initMenus();
    this._initShortcut();
  }
  _initComponents() {
    [
      [DocHyperLinkEdit.componentKey, DocHyperLinkEdit],
      [DocLinkPopup.componentKey, DocLinkPopup],
      [DOC_LINK_ICON, LinkIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
  }
  _initCommands() {
    [
      AddDocHyperLinkCommand,
      UpdateDocHyperLinkCommand,
      DeleteDocHyperLinkCommand,
      ShowDocHyperLinkEditPopupOperation,
      ToggleDocHyperLinkInfoPopupOperation,
      ClickDocHyperLinkOperation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
  }
  _initShortcut() {
    [addLinkShortcut].forEach((shortcut) => {
      this._shortcutService.registerShortcut(shortcut);
    });
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
};
DocHyperLinkUIController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IMenuManagerService),
  __decorateParam(3, IShortcutService)
], DocHyperLinkUIController);

// ../packages/docs-hyper-link-ui/src/types/const/index.ts
var DOC_HYPER_LINK_UI_PLUGIN = "DOC_HYPER_LINK_UI_PLUGIN";

// ../packages/docs-hyper-link-ui/src/plugin.ts
var UniverDocsHyperLinkUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _renderManagerSrv, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(DOCS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const deps = [
      [DocHyperLinkPopupService],
      [DocHyperLinkUIController],
      [DocHyperLinkSelectionController]
    ];
    deps.forEach((dep) => {
      this._injector.add(dep);
    });
    this._injector.get(DocHyperLinkUIController);
  }
  onReady() {
    this._injector.get(DocHyperLinkSelectionController);
  }
  onRendered() {
    this._initRenderModule();
  }
  _initRenderModule() {
    [
      [DocHyperLinkRenderController],
      [DocHyperLinkEventRenderController]
    ].forEach((dep) => {
      this._renderManagerSrv.registerRenderModule(1 /* UNIVER_DOC */, dep);
    });
  }
};
__publicField(UniverDocsHyperLinkUIPlugin, "pluginName", DOC_HYPER_LINK_UI_PLUGIN);
__publicField(UniverDocsHyperLinkUIPlugin, "packageName", package_default2.name);
__publicField(UniverDocsHyperLinkUIPlugin, "version", package_default2.version);
__publicField(UniverDocsHyperLinkUIPlugin, "type", 1 /* UNIVER_DOC */);
UniverDocsHyperLinkUIPlugin = __decorateClass([
  DependentOn(UniverDocsHyperLinkPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService)
], UniverDocsHyperLinkUIPlugin);

// ../packages/docs-quick-insert-ui/src/commands/commands/doc-quick-insert.command.ts
var DeleteSearchKeyCommand = {
  id: "doc.command.delete-search-key",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const commandService = accessor.get(ICommandService);
    const { start, end } = params;
    return commandService.syncExecuteCommand(CutContentCommand.id, {
      segmentId: "",
      textRanges: [{
        startOffset: start,
        endOffset: start,
        collapsed: true
      }],
      selections: [{
        startOffset: start,
        endOffset: end,
        collapsed: false,
        direction: "forward" /* FORWARD */
      }]
    });
  }
};

// ../packages/docs-quick-insert-ui/src/views/KeywordInputPlaceholder.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var KeywordInputPlaceholderComponentKey = "docs.quick.insert.keyword-input-placeholder";
var DEFAULT_FONT_SIZE = 11;
function measureTextWidth(text, font) {
  if (typeof document === "undefined") {
    return text.length * DEFAULT_FONT_SIZE;
  }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return text.length * DEFAULT_FONT_SIZE;
  }
  context.font = font;
  return Math.ceil(context.measureText(text).width);
}
var KeywordInputPlaceholder = ({ popup }) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const localeService = useDependency(LocaleService);
  const placeholder = localeService.t("docs-quick-insert-ui.keywordInputPlaceholder");
  const fontSize = (_b = (_a = popup.extraProps) == null ? void 0 : _a.fontSize) != null ? _b : DEFAULT_FONT_SIZE;
  const fontSizePx = ptToPixel(fontSize);
  const fontString = (_d = (_c = popup.extraProps) == null ? void 0 : _c.fontString) != null ? _d : `${fontSizePx}px sans-serif`;
  const ascent = (_f = (_e = popup.extraProps) == null ? void 0 : _e.ascent) != null ? _f : fontSizePx;
  const contentHeight = Math.max((_h = (_g = popup.extraProps) == null ? void 0 : _g.contentHeight) != null ? _h : fontSizePx, fontSizePx);
  const textWidth = (0, import_react2.useMemo)(() => measureTextWidth(placeholder, fontString), [fontString, placeholder]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      className: `univer-select-none univer-font-normal univer-text-gray-500 univer-transition-colors dark:!univer-text-gray-400`,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "svg",
        {
          width: textWidth,
          height: contentHeight,
          viewBox: `0 0 ${textWidth} ${contentHeight}`,
          style: { overflow: "visible", display: "block" },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "text",
            {
              x: 0,
              y: ascent,
              fill: "currentColor",
              style: {
                font: fontString,
                fontFamily: (_i = popup.extraProps) == null ? void 0 : _i.fontFamily,
                fontStyle: (_j = popup.extraProps) == null ? void 0 : _j.fontStyle,
                fontWeight: (_k = popup.extraProps) == null ? void 0 : _k.fontWeight
              },
              children: placeholder
            }
          )
        }
      )
    }
  );
};
KeywordInputPlaceholder.componentKey = KeywordInputPlaceholderComponentKey;

// ../packages/docs-quick-insert-ui/src/views/QuickInsertPopup.tsx
var import_react4 = __toESM(require_react());

// ../packages/docs-quick-insert-ui/src/views/QuickInsertMenu.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
function isMenuGroup(menu) {
  return "children" in menu;
}
function flattenMenuItems(menus) {
  return menus.flatMap((menu) => {
    if (isMenuGroup(menu)) {
      return flattenMenuItems(menu.children);
    }
    return menu;
  });
}
function getQuickInsertMenuLeafCount(menus) {
  return flattenMenuItems(menus).length;
}
function QuickInsertMenu(props) {
  const {
    menus,
    focusedMenuIndex,
    focusedMenuRef,
    menuNodeMapRef,
    componentManager,
    onFocusedMenuIndexChange,
    onSelect
  } = props;
  const flatMenus = (0, import_react3.useMemo)(() => flattenMenuItems(menus), [menus]);
  (0, import_react3.useEffect)(() => {
    var _a, _b;
    const focusedMenu = Number.isNaN(focusedMenuIndex) ? null : (_a = flatMenus[focusedMenuIndex]) != null ? _a : null;
    focusedMenuRef.current = focusedMenu;
    if (!focusedMenu) {
      return;
    }
    (_b = menuNodeMapRef.current.get(focusedMenu.id)) == null ? void 0 : _b.scrollIntoView({
      block: "nearest"
    });
  }, [flatMenus, focusedMenuIndex, focusedMenuRef, menuNodeMapRef]);
  const itemIndexRef = (0, import_react3.useRef)(0);
  itemIndexRef.current = 0;
  function renderMenus(currentMenus) {
    return currentMenus.map((menu, index) => {
      const iconKey = menu.icon;
      const Icon = iconKey ? componentManager.get(iconKey) : null;
      if (isMenuGroup(menu)) {
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: clsx("univer-grid univer-gap-1 univer-py-1", index !== currentMenus.length - 1 && borderBottomClassName),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                "div",
                {
                  className: `univer-box-border univer-inline-flex univer-items-center univer-gap-2 univer-px-2 univer-text-xs univer-font-semibold univer-text-gray-600 dark:!univer-text-gray-300`,
                  children: [
                    Icon && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "univer-inline-flex univer-text-base", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, {}) }),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: menu.title })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-grid univer-gap-1", children: renderMenus(menu.children) })
            ]
          },
          menu.id
        );
      }
      const currentMenuIndex = itemIndexRef.current;
      const isFocused = focusedMenuIndex === currentMenuIndex;
      itemIndexRef.current += 1;
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          ref: (node) => {
            if (node) {
              menuNodeMapRef.current.set(menu.id, node);
              return;
            }
            menuNodeMapRef.current.delete(menu.id);
          },
          role: "button",
          tabIndex: -1,
          className: clsx(`univer-relative univer-box-border univer-flex univer-min-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-justify-between univer-gap-3 univer-rounded-md univer-border-none univer-bg-transparent univer-px-2 univer-text-left univer-text-sm univer-text-gray-900 univer-outline-none hover:univer-bg-gray-50 dark:!univer-text-white dark:hover:!univer-bg-gray-600`, {
            "hover:univer-bg-transparent": !isFocused,
            "univer-bg-gray-50 dark:!univer-bg-gray-600": isFocused
          }),
          onMouseEnter: () => onFocusedMenuIndexChange(currentMenuIndex),
          onMouseLeave: () => onFocusedMenuIndexChange(Number.NaN),
          onClick: () => onSelect(menu),
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-inline-flex univer-w-full univer-items-center univer-gap-2", children: [
            Icon && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "univer-inline-flex univer-text-base", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, {}) }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Tooltip, { showIfEllipsis: true, title: menu.title, placement: "right", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "univer-truncate", children: menu.title }) })
          ] })
        },
        menu.id
      );
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      className: clsx(`univer-box-border univer-grid univer-max-h-[360px] univer-gap-1 univer-overflow-y-auto univer-overflow-x-hidden univer-overscroll-contain univer-rounded-md univer-bg-white univer-px-2 univer-py-1 univer-text-sm univer-text-gray-900 univer-shadow-md dark:!univer-bg-gray-700 dark:!univer-text-white`, borderClassName, scrollbarClassName),
      onWheel: (event) => event.stopPropagation(),
      children: renderMenus(menus)
    }
  );
}

// ../packages/docs-quick-insert-ui/src/views/QuickInsertPlaceholder.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var QuickInsertPlaceholderComponentKey = "docs.quick.insert.placeholder";
var QuickInsertPlaceholder = () => {
  const localeService = useDependency(LocaleService);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: `univer-flex univer-h-full univer-items-center univer-justify-center univer-rounded-lg univer-bg-white univer-px-12 univer-py-6 univer-text-gray-400 univer-shadow-lg`,
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: localeService.t("docs-quick-insert-ui.placeholder") })
    }
  );
};
QuickInsertPlaceholder.componentKey = QuickInsertPlaceholderComponentKey;

// ../packages/docs-quick-insert-ui/src/views/QuickInsertPopup.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
function filterMenusByKeyword(menus, keyword) {
  return menus.map((menu) => ({ ...menu })).filter((menu) => {
    if ("children" in menu) {
      menu.children = filterMenusByKeyword(menu.children, keyword);
      return menu.children.length > 0;
    }
    const keywords = menu.keywords;
    if (keywords) {
      return keywords.some((word) => word.includes(keyword));
    }
    return menu.title.toLowerCase().includes(keyword);
  });
}
function translateMenus(menus, localeService) {
  return menus.map((_menu) => {
    const menu = { ..._menu };
    if ("children" in menu) {
      menu.children = translateMenus(menu.children, localeService);
    }
    menu.title = localeService.t(menu.title);
    if ("keywords" in menu) {
      menu.keywords = menu.keywords.concat(menu.title).map((word) => word.toLowerCase());
    }
    return menu;
  });
}
var interceptKeys = [38 /* ARROW_UP */, 40 /* ARROW_DOWN */, 13 /* ENTER */];
var QuickInsertPopup = () => {
  const localeService = useDependency(LocaleService);
  const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
  const componentManager = useDependency(ComponentManager);
  const shortcutService = useDependency(IShortcutService);
  const commandService = useDependency(ICommandService);
  const id = (0, import_react4.useMemo)(() => generateRandomId(), []);
  const [focusedMenuIndex, setFocusedMenuIndex] = (0, import_react4.useState)(0);
  const focusedMenuRef = (0, import_react4.useRef)(null);
  const filterKeyword = useObservable(docQuickInsertPopupService.filterKeyword$, "");
  const currentPopup = useObservable(docQuickInsertPopupService.editPopup$);
  const menus = useObservable(currentPopup == null ? void 0 : currentPopup.popup.menus$, []);
  const translatedMenus = (0, import_react4.useMemo)(() => {
    return translateMenus(menus, localeService);
  }, [menus]);
  const [filteredMenus, setFilteredMenus] = (0, import_react4.useState)(() => {
    return filterMenusByKeyword(translatedMenus, filterKeyword.toLowerCase());
  });
  const filteredMenuCount = (0, import_react4.useMemo)(() => getQuickInsertMenuLeafCount(filteredMenus), [filteredMenus]);
  const filteredMenuCountRef = (0, import_react4.useRef)(filteredMenuCount);
  (0, import_react4.useEffect)(() => {
    filteredMenuCountRef.current = filteredMenuCount;
  }, [filteredMenuCount]);
  (0, import_react4.useEffect)(() => {
    const id2 = requestIdleCallback(() => {
      setFilteredMenus(filterMenusByKeyword(translatedMenus, filterKeyword.toLowerCase()));
    });
    return () => {
      cancelIdleCallback(id2);
    };
  }, [translatedMenus, filterKeyword]);
  const handleMenuSelect = (menu) => {
    docQuickInsertPopupService.emitMenuSelected(menu);
    commandService.executeCommand(CloseQuickInsertPopupOperation.id);
  };
  (0, import_react4.useEffect)(() => {
    const disposableCollection = new DisposableCollection();
    const shortcutItems = shortcutService.getAllShortcuts();
    const interceptedShortcutItems = shortcutItems.filter((item) => item.binding && interceptKeys.includes(item.binding));
    interceptedShortcutItems.forEach((item) => {
      const rawPreconditions = item.preconditions;
      item.preconditions = () => false;
      disposableCollection.add(toDisposable(() => {
        item.preconditions = rawPreconditions;
      }));
    });
    const enterCommand = {
      id: `quick.insert.popup.enter.${id}`,
      type: 1 /* OPERATION */,
      handler: () => {
        const menu = focusedMenuRef.current;
        if (menu) {
          handleMenuSelect(menu);
        }
      }
    };
    const moveCursorUpCommand = {
      id: `quick.insert.popup.move.cursor.up.${id}`,
      type: 1 /* OPERATION */,
      handler: () => {
        setFocusedMenuIndex((index) => {
          if (filteredMenuCountRef.current <= 0) {
            return 0;
          }
          const nextIndex = index - 1;
          return nextIndex >= 0 ? nextIndex : filteredMenuCountRef.current - 1;
        });
      }
    };
    const moveCursorDownCommand = {
      id: `quick.insert.popup.move.cursor.down.${id}`,
      type: 1 /* OPERATION */,
      handler: () => {
        setFocusedMenuIndex((index) => {
          if (filteredMenuCountRef.current <= 0) {
            return 0;
          }
          const nextIndex = index + 1;
          return nextIndex <= filteredMenuCountRef.current - 1 ? nextIndex : 0;
        });
      }
    };
    disposableCollection.add(commandService.registerCommand(moveCursorUpCommand));
    disposableCollection.add(commandService.registerCommand(moveCursorDownCommand));
    disposableCollection.add(commandService.registerCommand(enterCommand));
    disposableCollection.add(shortcutService.registerShortcut({
      priority: 1e3,
      id: moveCursorUpCommand.id,
      binding: 38 /* ARROW_UP */,
      preconditions: () => true,
      staticParameters: {
        direction: 0 /* UP */
      }
    }));
    disposableCollection.add(shortcutService.registerShortcut({
      priority: 1e3,
      id: moveCursorDownCommand.id,
      binding: 40 /* ARROW_DOWN */,
      preconditions: () => true,
      staticParameters: {
        direction: 2 /* DOWN */
      }
    }));
    disposableCollection.add(shortcutService.registerShortcut({
      priority: 1e3,
      id: enterCommand.id,
      binding: 13 /* ENTER */,
      preconditions: () => true
    }));
    return () => {
      disposableCollection.dispose();
    };
  }, [commandService, id, shortcutService]);
  (0, import_react4.useEffect)(() => {
    setFocusedMenuIndex(0);
  }, [filteredMenus]);
  const menuNodeMapRef = (0, import_react4.useRef)(/* @__PURE__ */ new Map());
  (0, import_react4.useEffect)(() => {
    return () => {
      menuNodeMapRef.current.clear();
    };
  }, []);
  const hasMenus = filteredMenus.length > 0;
  const Placeholder = (currentPopup == null ? void 0 : currentPopup.popup.Placeholder) || componentManager.get(QuickInsertPlaceholder.componentKey);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-2", children: hasMenus ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    QuickInsertMenu,
    {
      menus: filteredMenus,
      focusedMenuIndex,
      focusedMenuRef,
      menuNodeMapRef,
      componentManager,
      onFocusedMenuIndexChange: setFocusedMenuIndex,
      onSelect: handleMenuSelect
    }
  ) : Placeholder && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Placeholder, {}) });
};
QuickInsertPopup.componentKey = "docs.quick.insert.popup";

// ../packages/docs-quick-insert-ui/src/services/doc-quick-insert-popup.service.ts
var noopDisposable = {
  dispose: () => {
  }
};
var DocQuickInsertPopupService = class extends Disposable {
  constructor(_docCanvasPopupManagerService, _univerInstanceService, _commandService, _renderManagerService, _docSelectionManagerService) {
    super();
    __publicField(this, "_docCanvasPopupManagerService", _docCanvasPopupManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_docSelectionManagerService", _docSelectionManagerService);
    __publicField(this, "_popups", /* @__PURE__ */ new Set());
    __publicField(this, "_editPopup$", new BehaviorSubject(void 0));
    __publicField(this, "editPopup$", this._editPopup$.asObservable());
    __publicField(this, "_isComposing$", new BehaviorSubject(false));
    __publicField(this, "isComposing$", this._isComposing$.asObservable());
    __publicField(this, "_inputOffset$", new BehaviorSubject({ start: 0, end: 0 }));
    __publicField(this, "inputOffset$", this._inputOffset$.asObservable());
    __publicField(this, "filterKeyword$");
    __publicField(this, "_menuSelectedCallbacks", /* @__PURE__ */ new Set());
    __publicField(this, "_inputPlaceholderRenderRoot", null);
    this.disposeWithMe(this._editPopup$);
    const getBodySlice2 = (start, end) => {
      var _a, _b;
      return (_b = (_a = this._univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */)) == null ? void 0 : _a.getBody()) == null ? void 0 : _b.dataStream.slice(start, end);
    };
    let lastFilterKeyword = "";
    this.filterKeyword$ = this._inputOffset$.pipe(
      map((offset) => {
        var _a;
        const slice = getBodySlice2(offset.start, offset.end);
        return (_a = slice == null ? void 0 : slice.slice(1)) != null ? _a : "";
      }),
      distinctUntilChanged(),
      tap((filterKeyword) => {
        lastFilterKeyword = filterKeyword;
      })
    );
    this.disposeWithMe(combineLatest([
      this.filterKeyword$.pipe(tap((filterKeyword) => {
        var _a, _b, _c;
        if (filterKeyword.length > 0) {
          (_b = (_a = this._inputPlaceholderRenderRoot) == null ? void 0 : _a.unmount) == null ? void 0 : _b.dispose();
        } else {
          (_c = this._inputPlaceholderRenderRoot) == null ? void 0 : _c.mount();
        }
      })),
      this.isComposing$.pipe(tap((isComposing) => {
        var _a, _b, _c;
        if (isComposing) {
          (_b = (_a = this._inputPlaceholderRenderRoot) == null ? void 0 : _a.unmount) == null ? void 0 : _b.dispose();
        } else {
          lastFilterKeyword.length <= 0 && ((_c = this._inputPlaceholderRenderRoot) == null ? void 0 : _c.mount());
        }
      })),
      this.editPopup$.pipe(tap((popup) => {
        var _a, _b;
        if (!popup) {
          (_b = (_a = this._inputPlaceholderRenderRoot) == null ? void 0 : _a.unmount) == null ? void 0 : _b.dispose();
          this._inputPlaceholderRenderRoot = null;
        }
      }))
    ]).subscribe());
  }
  get popups() {
    return Array.from(this._popups);
  }
  get editPopup() {
    return this._editPopup$.value;
  }
  get isComposing() {
    return this._isComposing$.value;
  }
  setIsComposing(isComposing) {
    this._isComposing$.next(isComposing);
  }
  get inputOffset() {
    return this._inputOffset$.value;
  }
  setInputOffset(offset) {
    this._inputOffset$.next(offset);
  }
  getDocEventManagerService(unitId) {
    var _a;
    return (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(DocEventManagerService);
  }
  resolvePopup(keyword) {
    return Array.from(this._popups).find((popup) => popup.keyword === keyword);
  }
  registerPopup(popup) {
    this._popups.add(popup);
    return () => {
      this._popups.delete(popup);
    };
  }
  _createInputPlaceholderRenderRoot(mount) {
    const renderRoot = {
      isMounted: false,
      mount() {
        if (this.isMounted) {
          return;
        }
        this.isMounted = true;
        const unmount = mount();
        this.unmount = {
          dispose: () => {
            unmount.dispose();
            this.isMounted = false;
          }
        };
      }
    };
    return renderRoot;
  }
  _getParagraphBound(unitId, index) {
    var _a, _b, _c;
    const currentDoc = this._univerInstanceService.getUnit(unitId);
    const paragraph = (_b = (_a = currentDoc == null ? void 0 : currentDoc.getBody()) == null ? void 0 : _a.paragraphs) == null ? void 0 : _b.find((p) => p.startIndex > index);
    if (!paragraph) {
      return null;
    }
    const docEventManagerService = this.getDocEventManagerService(unitId);
    return (_c = docEventManagerService == null ? void 0 : docEventManagerService.findParagraphBoundByIndex(paragraph.startIndex)) != null ? _c : null;
  }
  _getKeywordPlaceholderAnchorRect(document2, skeleton, activeRange, fallbackRect) {
    const startPosition = skeleton.findNodePositionByCharIndex(activeRange.startOffset, true, activeRange.segmentId, activeRange.segmentPage);
    if (!startPosition) {
      return fallbackRect;
    }
    const documentOffsetConfig = document2.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { contentBoxPointGroup } = convertor.getRangePointData(startPosition, startPosition);
    if (contentBoxPointGroup.length === 0) {
      return fallbackRect;
    }
    const anchor = getAnchorBounding(contentBoxPointGroup);
    const left = anchor.left + documentOffsetConfig.docsLeft;
    const top = anchor.top + documentOffsetConfig.docsTop;
    return {
      left,
      right: left,
      top,
      bottom: top + anchor.height
    };
  }
  _getKeywordPlaceholderExtraProps(curGlyph) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    return {
      fontSize: (_a = curGlyph.ts) == null ? void 0 : _a.fs,
      fontString: (_b = curGlyph.fontStyle) == null ? void 0 : _b.fontString,
      fontFamily: (_f = (_e = (_c = curGlyph.fontStyle) == null ? void 0 : _c.fontFamily) != null ? _e : (_d = curGlyph.ts) == null ? void 0 : _d.ff) != null ? _f : void 0,
      fontStyle: ((_g = curGlyph.ts) == null ? void 0 : _g.it) ? "italic" : "normal",
      fontWeight: ((_h = curGlyph.ts) == null ? void 0 : _h.bl) ? "bold" : "normal",
      ascent: (_i = curGlyph.bBox) == null ? void 0 : _i.ba,
      contentHeight: ((_k = (_j = curGlyph.bBox) == null ? void 0 : _j.ba) != null ? _k : 0) + ((_m = (_l = curGlyph.bBox) == null ? void 0 : _l.bd) != null ? _m : 0) || void 0
    };
  }
  _mountInputPlaceholder(unitId, fallbackRect) {
    const currentRender = this._renderManagerService.getRenderById(unitId);
    const docSkeletonManagerService = currentRender == null ? void 0 : currentRender.with(DocSkeletonManagerService);
    const activeRange = this._docSelectionManagerService.getActiveTextRange();
    if (!currentRender || !docSkeletonManagerService || !activeRange) {
      return noopDisposable;
    }
    const skeleton = docSkeletonManagerService.getSkeleton();
    const curGlyph = skeleton.findNodeByCharIndex(activeRange.startOffset, activeRange.segmentId, activeRange.segmentPage);
    const isEmptyLine = (curGlyph == null ? void 0 : curGlyph.content) === "\r";
    if (!isEmptyLine || !curGlyph) {
      return noopDisposable;
    }
    const document2 = currentRender.mainComponent;
    const placeholderAnchorRect = this._getKeywordPlaceholderAnchorRect(document2, skeleton, activeRange, fallbackRect);
    const extraProps = this._getKeywordPlaceholderExtraProps(curGlyph);
    const disposable = this._docCanvasPopupManagerService.attachPopupToRect(
      placeholderAnchorRect,
      {
        componentKey: KeywordInputPlaceholder.componentKey,
        extraProps,
        onClickOutside: () => {
          disposable.dispose();
        },
        direction: "horizontal"
      },
      unitId
    );
    return disposable;
  }
  showPopup(options) {
    const { popup, index, unitId } = options;
    this.closePopup();
    const paragraphBound = this._getParagraphBound(unitId, index);
    if (!paragraphBound) {
      return;
    }
    this._inputPlaceholderRenderRoot = this._createInputPlaceholderRenderRoot(() => this._mountInputPlaceholder(unitId, paragraphBound.firstLine));
    this._inputPlaceholderRenderRoot.mount();
    const disposable = this._docCanvasPopupManagerService.attachPopupToRect(
      paragraphBound.firstLine,
      {
        componentKey: QuickInsertPopup.componentKey,
        onClickOutside: () => {
          this.closePopup();
        },
        direction: "bottom"
      },
      unitId
    );
    this._editPopup$.next({ disposable, popup, anchor: index, unitId });
  }
  closePopup() {
    if (this.editPopup) {
      this.editPopup.disposable.dispose();
      this._editPopup$.next(null);
    }
  }
  onMenuSelected(callback) {
    this._menuSelectedCallbacks.add(callback);
    return () => {
      this._menuSelectedCallbacks.delete(callback);
    };
  }
  emitMenuSelected(menu) {
    const { start, end } = this.inputOffset;
    this._commandService.syncExecuteCommand(DeleteSearchKeyCommand.id, {
      start,
      end
    });
    setTimeout(() => {
      this._menuSelectedCallbacks.forEach((callback) => callback(menu));
    }, 0);
  }
};
DocQuickInsertPopupService = __decorateClass([
  __decorateParam(0, Inject(DocCanvasPopManagerService)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, Inject(IRenderManagerService)),
  __decorateParam(4, Inject(DocSelectionManagerService))
], DocQuickInsertPopupService);

// ../packages/docs-quick-insert-ui/src/commands/operations/quick-insert-popup.operation.ts
var ShowQuickInsertPopupOperation = {
  type: 1 /* OPERATION */,
  id: "doc.operation.show-quick-insert-popup",
  handler(accessor, params) {
    const docQuickInsertPopupService = accessor.get(DocQuickInsertPopupService);
    if (!params) {
      return false;
    }
    docQuickInsertPopupService.showPopup(params);
    return true;
  }
};
var CloseQuickInsertPopupOperation = {
  type: 1 /* OPERATION */,
  id: "doc.operation.close-quick-insert-popup",
  handler(accessor) {
    const docQuickInsertPopupService = accessor.get(DocQuickInsertPopupService);
    docQuickInsertPopupService.closePopup();
    return true;
  }
};

// ../packages/docs-quick-insert-ui/src/menu/menu.ts
var textMenu = {
  id: "quick-insert.text.menu",
  title: "docs-quick-insert-ui.menu.text",
  icon: "TextIcon",
  keywords: ["text"]
};
var numberedListMenu = {
  id: OrderListCommand.id,
  title: "docs-quick-insert-ui.menu.numberedList",
  icon: "OrderIcon",
  keywords: ["numbered", "list", "ordered"]
};
var bulletedListMenu = {
  id: BulletListCommand.id,
  title: "docs-quick-insert-ui.menu.bulletedList",
  icon: "UnorderIcon",
  keywords: ["bulleted", "list", "unordered"]
};
var dividerMenu = {
  id: HorizontalLineCommand.id,
  title: "docs-quick-insert-ui.menu.divider",
  icon: "DividerIcon",
  keywords: ["divider", "line", "separate"]
};
var tableMenu = {
  id: DocCreateTableOperation.id,
  title: "docs-quick-insert-ui.menu.table",
  icon: "GridIcon",
  keywords: ["table", "grid", "spreadsheet"]
};
var imageMenu = {
  id: InsertDocImageCommand.id,
  title: "docs-quick-insert-ui.menu.image",
  icon: "AdditionAndSubtractionIcon",
  keywords: ["image", "picture", "photo"]
};
var builtInMenus = [
  {
    title: "docs-quick-insert-ui.group.basics",
    id: "quick.insert.group.basic" /* Basic */,
    children: [
      textMenu,
      numberedListMenu,
      bulletedListMenu,
      dividerMenu,
      tableMenu,
      imageMenu
    ]
  }
];
var builtInMenuCommandIds = /* @__PURE__ */ new Set([
  numberedListMenu.id,
  bulletedListMenu.id,
  dividerMenu.id,
  tableMenu.id,
  imageMenu.id
]);

// ../packages/docs-quick-insert-ui/src/controllers/doc-quick-insert-trigger.controller.ts
var DocQuickInsertTriggerController = class extends Disposable {
  constructor(_commandService, _textSelectionManagerService, _docQuickInsertPopupService, _shortcutService, _univerInstanceService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_textSelectionManagerService", _textSelectionManagerService);
    __publicField(this, "_docQuickInsertPopupService", _docQuickInsertPopupService);
    __publicField(this, "_shortcutService", _shortcutService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    this.disposeWithMe(this._shortcutService.registerShortcut({
      id: CloseQuickInsertPopupOperation.id,
      binding: 27 /* ESC */,
      preconditions: () => Boolean(this._docQuickInsertPopupService.editPopup),
      priority: 1e3
    }));
    this._initTrigger();
    this._initMenuHandler();
  }
  // eslint-disable-next-line max-lines-per-function
  _initTrigger() {
    this.disposeWithMe(
      // eslint-disable-next-line complexity, max-lines-per-function
      this._commandService.onCommandExecuted((commandInfo) => {
        var _a, _b, _c;
        const { _docQuickInsertPopupService, _textSelectionManagerService, _commandService } = this;
        const documentDataModel = this._univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
        if (documentDataModel == null ? void 0 : documentDataModel.getDisabled()) {
          return;
        }
        if (commandInfo.id === InsertCommand.id) {
          const params = commandInfo.params;
          if (_docQuickInsertPopupService.editPopup) {
            _docQuickInsertPopupService.setInputOffset({
              start: _docQuickInsertPopupService.inputOffset.start,
              end: params.range.endOffset + 1
            });
            return;
          }
          const activeRange = _textSelectionManagerService.getActiveTextRange();
          if (!activeRange) {
            return;
          }
          const popup = _docQuickInsertPopupService.resolvePopup(params.body.dataStream);
          if (!popup) {
            return;
          }
          const available = popup.preconditions ? popup.preconditions(params) : true;
          if (!available) {
            return;
          }
          _docQuickInsertPopupService.setInputOffset({ start: activeRange.startOffset - 1, end: activeRange.startOffset });
          setTimeout(() => {
            _commandService.executeCommand(ShowQuickInsertPopupOperation.id, {
              index: activeRange.startOffset - 1,
              unitId: params.unitId,
              popup
            });
          }, 100);
        }
        if (commandInfo.id === IMEInputCommand.id) {
          const params = commandInfo.params;
          if (!_docQuickInsertPopupService.isComposing && params.isCompositionStart) {
            _docQuickInsertPopupService.setIsComposing(true);
          }
          if (_docQuickInsertPopupService.isComposing && params.isCompositionEnd) {
            _docQuickInsertPopupService.setIsComposing(false);
          }
        }
        if (commandInfo.id === RichTextEditingMutation.id) {
          const params = commandInfo.params;
          if (params.isCompositionEnd) {
            const endOffset = (_b = (_a = params.textRanges) == null ? void 0 : _a[0]) == null ? void 0 : _b.endOffset;
            if (endOffset) {
              _docQuickInsertPopupService.setInputOffset({ start: _docQuickInsertPopupService.inputOffset.start, end: endOffset });
            }
          }
        }
        if (commandInfo.id === DeleteCommand.id) {
          const params = commandInfo.params;
          if (_docQuickInsertPopupService.editPopup && params.direction === 0 /* LEFT */) {
            const len = (_c = params.len) != null ? _c : 0;
            _docQuickInsertPopupService.setInputOffset({ start: _docQuickInsertPopupService.inputOffset.start, end: params.range.endOffset - len });
          }
        }
        if (commandInfo.id === MoveCursorOperation.id) {
          const params = commandInfo.params;
          if (params.direction === 3 /* LEFT */ || params.direction === 1 /* RIGHT */) {
            _docQuickInsertPopupService.editPopup && _commandService.executeCommand(CloseQuickInsertPopupOperation.id);
          }
        }
        if (commandInfo.id === DeleteLeftCommand.id) {
          const activeRange = _textSelectionManagerService.getActiveTextRange();
          if (!_docQuickInsertPopupService.editPopup || !activeRange) {
            return;
          }
          if (activeRange.endOffset <= _docQuickInsertPopupService.editPopup.anchor) {
            _commandService.executeCommand(CloseQuickInsertPopupOperation.id);
          }
        }
      })
    );
  }
  _initMenuHandler() {
    this.disposeWithMe(this._docQuickInsertPopupService.onMenuSelected((menu) => {
      if (menu.id === textMenu.id) {
        return;
      }
      if (builtInMenuCommandIds.has(menu.id)) {
        this._commandService.executeCommand(menu.id);
      }
    }));
  }
};
DocQuickInsertTriggerController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(DocSelectionManagerService)),
  __decorateParam(2, Inject(DocQuickInsertPopupService)),
  __decorateParam(3, Inject(IShortcutService)),
  __decorateParam(4, Inject(IUniverInstanceService))
], DocQuickInsertTriggerController);

// ../packages/docs-quick-insert-ui/src/views/QuickInsertButton.tsx
var import_react5 = __toESM(require_react());

// ../packages/docs-quick-insert-ui/src/menu/doc-quick-insert-menu.controller.ts
var DocQuickInsertMenuController = class extends Disposable {
  constructor(_context, _docEventManagerService, _docQuickInsertPopupService, _docCanvasPopManagerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_docEventManagerService", _docEventManagerService);
    __publicField(this, "_docQuickInsertPopupService", _docQuickInsertPopupService);
    __publicField(this, "_docCanvasPopManagerService", _docCanvasPopManagerService);
    __publicField(this, "_popup$", new BehaviorSubject(null));
    __publicField(this, "popup$", this._popup$.asObservable());
    this._init();
  }
  get popup() {
    return this._popup$.value;
  }
  _init() {
    this.disposeWithMe(combineLatest([this._docEventManagerService.hoverParagraphLeftRealTime$, this._docEventManagerService.hoverParagraphRealTime$]).subscribe(([left, paragraph]) => {
      var _a;
      const p = left != null ? left : paragraph;
      const isDisabled = this._context.unit.getDisabled();
      if (!p || isDisabled) {
        this._hideMenu(true);
        return;
      }
      if (p.paragraphStart === p.paragraphEnd) {
        if (this._docQuickInsertPopupService.editPopup || p.startIndex === ((_a = this.popup) == null ? void 0 : _a.startIndex)) return;
        this._hideMenu(true);
        const disposable = this._docCanvasPopManagerService.attachPopupToRect(p.firstLine, {
          componentKey: QuickInsertButtonComponentKey,
          direction: "left-center"
        }, this._context.unit.getUnitId());
        this._popup$.next({
          startIndex: p.startIndex,
          disposable
        });
      } else {
        this._hideMenu(true);
      }
    }));
  }
  _hideMenu(force) {
    if (this._docQuickInsertPopupService.editPopup) return;
    if (this.popup && (force || this.popup.disposable.canDispose())) {
      this.popup.disposable.dispose();
      this._popup$.next(null);
    }
  }
};
DocQuickInsertMenuController = __decorateClass([
  __decorateParam(1, Inject(DocEventManagerService)),
  __decorateParam(2, Inject(DocQuickInsertPopupService)),
  __decorateParam(3, Inject(DocCanvasPopManagerService))
], DocQuickInsertMenuController);

// ../packages/docs-quick-insert-ui/src/views/QuickInsertButton.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var QuickInsertButtonComponentKey = "doc.quick-insert.button";
var QuickInsertButton = ({ className = "" }) => {
  const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const renderManagerService = useDependency(IRenderManagerService);
  const currentDoc = useObservable((0, import_react5.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */), [univerInstanceService]));
  const currentUnit = currentDoc && renderManagerService.getRenderById(currentDoc.getUnitId());
  const docQuickInsertMenuController = currentUnit == null ? void 0 : currentUnit.with(DocQuickInsertMenuController);
  const layoutService = useDependency(ILayoutService);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const editPopup = useObservable(docQuickInsertPopupService.editPopup$);
  const onClick = useEvent(() => {
    var _a;
    const p = docQuickInsertMenuController == null ? void 0 : docQuickInsertMenuController.popup;
    if (!p) {
      return;
    }
    const allPopups = docQuickInsertPopupService.popups;
    const popup = {
      keyword: "",
      menus$: combineLatest(allPopups.map((p2) => p2.menus$)).pipe(
        map((menusCollection) => menusCollection.flat())
      )
    };
    docSelectionManagerService.replaceDocRanges([{
      startOffset: p.startIndex,
      endOffset: p.startIndex
    }]);
    docQuickInsertPopupService.setInputOffset({ start: p.startIndex - 1, end: p.startIndex - 1 });
    docQuickInsertPopupService.showPopup({
      popup,
      index: p.startIndex - 1,
      unitId: (_a = currentDoc == null ? void 0 : currentDoc.getUnitId()) != null ? _a : ""
    });
    setTimeout(() => {
      layoutService.focus();
    });
  });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    "div",
    {
      className: clsx(`univer-mr-1 univer-flex univer-cursor-pointer univer-items-center univer-gap-2.5 univer-rounded-full univer-p-1.5 univer-shadow-sm hover:univer-bg-gray-100 dark:!univer-text-gray-200 dark:hover:!univer-bg-gray-700`, borderClassName, {
        "univer-bg-gray-100 dark:!univer-bg-gray-700": editPopup,
        "univer-bg-white dark:!univer-bg-gray-900": !editPopup
      }, className),
      role: "button",
      tabIndex: 0,
      onClick,
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        IncreaseIcon,
        {
          className: `univer-text-gray-800 dark:!univer-text-gray-200`
        }
      )
    }
  );
};
QuickInsertButton.componentKey = QuickInsertButtonComponentKey;

// ../packages/docs-quick-insert-ui/src/controllers/doc-quick-insert-ui.controller.ts
var DocQuickInsertUIController = class extends Disposable {
  constructor(_commandService, _docQuickInsertPopupService, _componentManager) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_docQuickInsertPopupService", _docQuickInsertPopupService);
    __publicField(this, "_componentManager", _componentManager);
    this._initCommands();
    this._initComponents();
    this._initMenus();
  }
  _initCommands() {
    [
      DeleteSearchKeyCommand,
      ShowQuickInsertPopupOperation,
      CloseQuickInsertPopupOperation
    ].forEach((operation) => {
      this.disposeWithMe(this._commandService.registerCommand(operation));
    });
  }
  _initComponents() {
    [
      [QuickInsertPopup.componentKey, QuickInsertPopup],
      [KeywordInputPlaceholder.componentKey, KeywordInputPlaceholder],
      [QuickInsertPlaceholder.componentKey, QuickInsertPlaceholder],
      [DividerIcon.displayName, DividerIcon],
      [TextIcon.displayName, TextIcon],
      [QuickInsertButton.componentKey, QuickInsertButton]
    ].forEach(([key, comp]) => {
      if (key) {
        this.disposeWithMe(this._componentManager.register(key, comp));
      }
    });
    const popups = [
      {
        keyword: "/",
        menus$: of(builtInMenus),
        // only show when the cursor is at the beginning of a line
        preconditions: (params) => {
          var _a;
          return ((_a = params.range.startNodePosition) == null ? void 0 : _a.glyph) === 0;
        }
      }
    ];
    popups.forEach((popup) => {
      this.disposeWithMe(this._docQuickInsertPopupService.registerPopup(popup));
    });
  }
  _initMenus() {
  }
};
DocQuickInsertUIController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, Inject(DocQuickInsertPopupService)),
  __decorateParam(2, Inject(ComponentManager))
], DocQuickInsertUIController);

// ../packages/docs-quick-insert-ui/package.json
var package_default3 = {
  name: "@univerjs/docs-quick-insert-ui",
  version: "0.25.2",
  private: false,
  description: "Quick insert UI integration for Univer Docs.",
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
    "quick-insert",
    "insert",
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
    "@univerjs/docs-drawing": "workspace:*",
    "@univerjs/docs-drawing-ui": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
    "@univerjs/drawing": "workspace:*",
    "@univerjs/drawing-ui": "workspace:*",
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

// ../packages/docs-quick-insert-ui/src/config/config.ts
var DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY = "docs-quick-insert-ui.config";
var configSymbol3 = Symbol(DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig3 = {};

// ../packages/docs-quick-insert-ui/src/plugin.ts
var UniverDocsQuickInsertUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig3, _injector, _renderManagerSrv, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig3,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const dependencies = [
      [DocQuickInsertUIController],
      [DocQuickInsertTriggerController],
      [DocQuickInsertPopupService]
    ];
    dependencies.forEach((dependency) => this._injector.add(dependency));
    this._injector.get(DocQuickInsertUIController);
  }
  onRendered() {
    this._injector.get(DocQuickInsertTriggerController);
    this._injector.get(DocQuickInsertPopupService);
    [
      [DocQuickInsertMenuController]
    ].forEach((m) => {
      this._renderManagerSrv.registerRenderModule(1 /* UNIVER_DOC */, m);
    });
  }
};
__publicField(UniverDocsQuickInsertUIPlugin, "type", 1 /* UNIVER_DOC */);
__publicField(UniverDocsQuickInsertUIPlugin, "pluginName", "DOC_QUICK_INSERT_UI_PLUGIN");
__publicField(UniverDocsQuickInsertUIPlugin, "packageName", package_default3.name);
__publicField(UniverDocsQuickInsertUIPlugin, "version", package_default3.version);
UniverDocsQuickInsertUIPlugin = __decorateClass([
  DependentOn(UniverDrawingUIPlugin, UniverDrawingPlugin, UniverDocsDrawingUIPlugin, UniverDocsDrawingPlugin, UniverUIPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(IRenderManagerService)),
  __decorateParam(3, IConfigService)
], UniverDocsQuickInsertUIPlugin);

// ../packages/docs-thread-comment-ui/src/common/const.ts
var DOCS_THREAD_COMMENT_PANEL = "univer.doc.thread-comment-panel";
var PLUGIN_NAME = "DOC_THREAD_COMMENT_UI_PLUGIN";
var DEFAULT_DOC_SUBUNIT_ID = "default_doc";

// ../packages/docs-thread-comment-ui/src/commands/commands/add-doc-comment.command.ts
var AddDocCommentComment = {
  id: "docs.command.add-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { comment: originComment, unitId } = params;
    const dataSourceService = accessor.get(IThreadCommentDataSourceService);
    const comment = await dataSourceService.addComment(originComment);
    const commandService = accessor.get(ICommandService);
    const doMutation = addCustomDecorationBySelectionFactory(
      accessor,
      {
        id: comment.threadId,
        type: 0 /* COMMENT */,
        unitId
      }
    );
    if (doMutation) {
      const addComment = {
        id: AddCommentMutation.id,
        params: {
          unitId,
          subUnitId: DEFAULT_DOC_SUBUNIT_ID,
          comment
        }
      };
      const activeOperation = {
        id: SetActiveCommentOperation.id,
        params: {
          unitId,
          subUnitId: DEFAULT_DOC_SUBUNIT_ID,
          commentId: comment.id
        }
      };
      return (await sequenceExecute([addComment, doMutation, activeOperation], commandService)).result;
    }
    return false;
  }
};

// ../packages/docs-thread-comment-ui/src/commands/commands/delete-doc-comment.command.ts
var DeleteDocCommentComment = {
  id: "docs.command.delete-comment",
  type: 0 /* COMMAND */,
  async handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { commentId, unitId } = params;
    const commandService = accessor.get(ICommandService);
    const doMutation = deleteCustomDecorationFactory(accessor, {
      id: commentId,
      unitId
    });
    if (doMutation) {
      return (await sequenceExecute([doMutation], commandService)).result;
    }
    return false;
  }
};

// ../packages/docs-thread-comment-ui/src/services/doc-thread-comment.service.ts
var DocThreadCommentService = class extends Disposable {
  constructor(_sidebarService, _threadCommentPanelService) {
    super();
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_threadCommentPanelService", _threadCommentPanelService);
    __publicField(this, "_addingComment$", new BehaviorSubject(void 0));
    __publicField(this, "addingComment$", this._addingComment$.asObservable());
    this.disposeWithMe(() => {
      this._addingComment$.complete();
    });
  }
  get addingComment() {
    return this._addingComment$.getValue();
  }
  startAdd(comment) {
    this._addingComment$.next(comment);
  }
  endAdd() {
    this._addingComment$.next(void 0);
  }
};
DocThreadCommentService = __decorateClass([
  __decorateParam(0, ISidebarService),
  __decorateParam(1, Inject(ThreadCommentPanelService))
], DocThreadCommentService);

// ../packages/docs-thread-comment-ui/src/commands/operations/show-comment-panel.operation.ts
var ShowCommentPanelOperation = {
  id: "docs.operation.show-comment-panel",
  type: 1 /* OPERATION */,
  handler(accessor, params) {
    var _a;
    const panelService = accessor.get(ThreadCommentPanelService);
    const sidebarService = accessor.get(ISidebarService);
    if (!panelService.panelVisible || ((_a = sidebarService.options.children) == null ? void 0 : _a.label) !== DOCS_THREAD_COMMENT_PANEL) {
      sidebarService.open({
        header: { title: "docs-thread-comment-ui.panel.title" },
        children: { label: DOCS_THREAD_COMMENT_PANEL },
        width: 320,
        onClose: () => panelService.setPanelVisible(false)
      });
      panelService.setPanelVisible(true);
    }
    if (params) {
      panelService.setActiveComment(params == null ? void 0 : params.activeComment);
    }
    return true;
  }
};
var ToggleCommentPanelOperation = {
  id: "docs.operation.toggle-comment-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    var _a;
    const panelService = accessor.get(ThreadCommentPanelService);
    const sidebarService = accessor.get(ISidebarService);
    if (!panelService.panelVisible || ((_a = sidebarService.options.children) == null ? void 0 : _a.label) !== DOCS_THREAD_COMMENT_PANEL) {
      sidebarService.open({
        header: { title: "docs-thread-comment-ui.panel.title" },
        children: { label: DOCS_THREAD_COMMENT_PANEL },
        width: 320,
        onClose: () => panelService.setPanelVisible(false)
      });
      panelService.setPanelVisible(true);
    } else {
      sidebarService.close();
      panelService.setPanelVisible(false);
      panelService.setActiveComment(null);
    }
    return true;
  }
};
var StartAddCommentOperation = {
  id: "docs.operation.start-add-comment",
  type: 1 /* OPERATION */,
  handler(accessor) {
    var _a, _b, _c;
    const panelService = accessor.get(ThreadCommentPanelService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const doc = univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */);
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const renderManagerService = accessor.get(IRenderManagerService);
    const userManagerService2 = accessor.get(UserManagerService);
    const docCommentService = accessor.get(DocThreadCommentService);
    const commandService = accessor.get(ICommandService);
    const sidebarService = accessor.get(ISidebarService);
    const textRange = docSelectionManagerService.getActiveTextRange();
    if (!doc || !textRange) {
      return false;
    }
    const docSelectionRenderManager = (_a = renderManagerService.getRenderById(doc.getUnitId())) == null ? void 0 : _a.with(DocSelectionRenderService);
    docSelectionRenderManager == null ? void 0 : docSelectionRenderManager.setReserveRangesStatus(true);
    if (textRange.collapsed) {
      if (panelService.panelVisible) {
        panelService.setPanelVisible(false);
        sidebarService.close();
      } else {
        commandService.executeCommand(ShowCommentPanelOperation.id);
      }
      return true;
    }
    commandService.executeCommand(ShowCommentPanelOperation.id);
    const unitId = doc.getUnitId();
    const dataStream = ((_c = (_b = doc.getBody()) == null ? void 0 : _b.dataStream) != null ? _c : "").slice(textRange.startOffset, textRange.endOffset);
    const text = BuildTextUtils.transform.getPlainText(dataStream);
    const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
    const commentId = "";
    const comment = {
      unitId,
      subUnitId,
      id: commentId,
      ref: text,
      dT: getDT(),
      personId: userManagerService2.getCurrentUser().userID,
      text: {
        dataStream: "\r\n"
      },
      startOffset: textRange.startOffset,
      endOffset: textRange.endOffset,
      collapsed: true,
      threadId: commentId
    };
    docSelectionRenderManager == null ? void 0 : docSelectionRenderManager.blur();
    docCommentService.startAdd(comment);
    panelService.setActiveComment({
      unitId,
      subUnitId,
      commentId
    });
    return true;
  }
};

// ../packages/docs-thread-comment-ui/package.json
var package_default4 = {
  name: "@univerjs/docs-thread-comment-ui",
  version: "0.25.2",
  private: false,
  description: "Thread comment UI integration for Univer Docs.",
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
    "comment",
    "thread-comment",
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
    "@univerjs/docs": "workspace:*",
    "@univerjs/docs-ui": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/thread-comment": "workspace:*",
    "@univerjs/thread-comment-ui": "workspace:*",
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

// ../packages/docs-thread-comment-ui/src/config/config.ts
var DOCS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY = "docs-thread-comment-ui.config";
var configSymbol4 = Symbol(DOCS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig4 = {};

// ../packages/docs-thread-comment-ui/src/controllers/doc-thread-comment-selection.controller.ts
var DocThreadCommentSelectionController = class extends Disposable {
  constructor(_threadCommentPanelService, _univerInstanceService, _commandService, _docThreadCommentService, _renderManagerService, _threadCommentModel) {
    super();
    __publicField(this, "_threadCommentPanelService", _threadCommentPanelService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_docThreadCommentService", _docThreadCommentService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    this._initSelectionChange();
    this._initActiveCommandChange();
  }
  _initSelectionChange() {
    let lastSelection;
    this.disposeWithMe(
      this._commandService.onCommandExecuted((commandInfo) => {
        var _a, _b, _c, _d;
        if (commandInfo.id === SetTextSelectionsOperation.id) {
          const params = commandInfo.params;
          const { unitId, ranges } = params;
          if (isInternalEditorID(unitId)) return;
          const doc = this._univerInstanceService.getUnit(unitId, 1 /* UNIVER_DOC */);
          const primary = ranges[0];
          if ((lastSelection == null ? void 0 : lastSelection.startOffset) === (primary == null ? void 0 : primary.startOffset) && (lastSelection == null ? void 0 : lastSelection.endOffset) === (primary == null ? void 0 : primary.endOffset)) {
            return;
          }
          lastSelection = primary;
          if (primary && doc) {
            const { startOffset, endOffset, collapsed } = primary;
            let customRange;
            if (collapsed) {
              customRange = (_b = (_a = doc.getBody()) == null ? void 0 : _a.customDecorations) == null ? void 0 : _b.find((value) => value.startIndex <= startOffset && value.endIndex >= endOffset - 1);
            } else {
              customRange = (_d = (_c = doc.getBody()) == null ? void 0 : _c.customDecorations) == null ? void 0 : _d.find((value) => value.startIndex <= startOffset && value.endIndex >= endOffset - 1);
            }
            if (customRange) {
              const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, customRange.id);
              if (comment && !comment.resolved) {
                this._commandService.executeCommand(ShowCommentPanelOperation.id, {
                  activeComment: {
                    unitId,
                    subUnitId: DEFAULT_DOC_SUBUNIT_ID,
                    commentId: customRange.id
                  }
                });
              }
              return;
            }
          }
          if (!this._threadCommentPanelService.activeCommentId) {
            return;
          }
          const addingComment = this._docThreadCommentService.addingComment;
          const activeComment = this._threadCommentPanelService.activeCommentId;
          if (addingComment && (activeComment == null ? void 0 : activeComment.unitId) === addingComment.unitId && (activeComment == null ? void 0 : activeComment.subUnitId) === DEFAULT_DOC_SUBUNIT_ID && (activeComment == null ? void 0 : activeComment.commentId) === addingComment.id) {
            return;
          }
          this._commandService.executeCommand(SetActiveCommentOperation.id);
        }
      })
    );
  }
  _initActiveCommandChange() {
    this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe((activeComment) => {
      var _a, _b, _c, _d;
      if (activeComment) {
        const doc = this._univerInstanceService.getUnit(activeComment.unitId);
        if (doc) {
          const backScrollController = (_a = this._renderManagerService.getRenderById(activeComment.unitId)) == null ? void 0 : _a.with(DocBackScrollRenderController);
          const customRange = (_c = (_b = doc.getBody()) == null ? void 0 : _b.customDecorations) == null ? void 0 : _c.find((range) => range.id === activeComment.commentId);
          if (customRange && backScrollController) {
            backScrollController.scrollToRange({
              startOffset: customRange.startIndex,
              endOffset: customRange.endIndex,
              collapsed: false
            });
          }
        }
      }
      if (!activeComment || activeComment.commentId !== ((_d = this._docThreadCommentService.addingComment) == null ? void 0 : _d.id)) {
        this._docThreadCommentService.endAdd();
      }
    }));
  }
};
DocThreadCommentSelectionController = __decorateClass([
  __decorateParam(0, Inject(ThreadCommentPanelService)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, Inject(DocThreadCommentService)),
  __decorateParam(4, IRenderManagerService),
  __decorateParam(5, Inject(ThreadCommentModel))
], DocThreadCommentSelectionController);

// ../packages/docs-thread-comment-ui/src/menu/menu.ts
var shouldDisableAddComment = (accessor) => {
  var _a;
  const renderManagerService = accessor.get(IRenderManagerService);
  const docSelectionManagerService = accessor.get(DocSelectionManagerService);
  const skeleton = (_a = withCurrentTypeOfRenderer(
    1 /* UNIVER_DOC */,
    DocSkeletonManagerService,
    accessor.get(IUniverInstanceService),
    renderManagerService
  )) == null ? void 0 : _a.getSkeleton();
  const editArea = skeleton == null ? void 0 : skeleton.getViewModel().getEditArea();
  if (editArea === "FOOTER" /* FOOTER */ || editArea === "HEADER" /* HEADER */) {
    return true;
  }
  const range = docSelectionManagerService.getActiveTextRange();
  if (range == null || range.collapsed) {
    return true;
  }
  return false;
};
function AddDocCommentMenuItemFactory(accessor) {
  return {
    id: StartAddCommentOperation.id,
    type: 0 /* BUTTON */,
    icon: "CommentIcon",
    title: "docs-thread-comment-ui.panel.addComment",
    tooltip: "docs-thread-comment-ui.panel.addComment",
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */, void 0, SHEET_EDITOR_UNITS),
    disabled$: new Observable(function(subscribe) {
      const textSelectionService = accessor.get(DocSelectionManagerService);
      const observer = textSelectionService.textSelection$.pipe(debounceTime(16)).subscribe(() => {
        subscribe.next(shouldDisableAddComment(accessor));
      });
      return () => {
        observer.unsubscribe();
      };
    })
  };
}
function ToolbarDocCommentMenuItemFactory(accessor) {
  return {
    id: ToggleCommentPanelOperation.id,
    type: 0 /* BUTTON */,
    icon: "CommentIcon",
    title: "docs-thread-comment-ui.panel.addComment",
    tooltip: "docs-thread-comment-ui.panel.addComment",
    hidden$: getMenuHiddenObservable(accessor, 1 /* UNIVER_DOC */)
  };
}

// ../packages/docs-thread-comment-ui/src/menu/schema.ts
var menuSchema2 = {
  ["ribbon.insert.media" /* MEDIA */]: {
    [ToggleCommentPanelOperation.id]: {
      order: 3,
      menuItemFactory: ToolbarDocCommentMenuItemFactory
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.data" /* DATA */]: {
      [StartAddCommentOperation.id]: {
        order: 1,
        menuItemFactory: AddDocCommentMenuItemFactory
      }
    }
  }
};

// ../packages/docs-thread-comment-ui/src/views/doc-thread-comment-panel/index.tsx
var import_react6 = __toESM(require_react());
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var DocThreadCommentPanel = () => {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const injector2 = useDependency(Injector);
  const doc$ = (0, import_react6.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(1 /* UNIVER_DOC */).pipe(filter((doc2) => !!doc2 && !isInternalEditorID(doc2.getUnitId()))), [univerInstanceService]);
  const doc = useObservable(doc$);
  const subUnitId$ = (0, import_react6.useMemo)(() => new Observable((sub) => sub.next(DEFAULT_DOC_SUBUNIT_ID)), []);
  const docSelectionManagerService = useDependency(DocSelectionManagerService);
  const selectionChange$ = (0, import_react6.useMemo)(
    () => docSelectionManagerService.textSelection$.pipe(debounceTime(16)),
    [docSelectionManagerService.textSelection$]
  );
  useObservable(selectionChange$);
  const commandService = useDependency(ICommandService);
  const docCommentService = useDependency(DocThreadCommentService);
  const tempComment = useObservable(docCommentService.addingComment$);
  const [commentIds, setCommentIds] = (0, import_react6.useState)([]);
  (0, import_react6.useEffect)(() => {
    var _a;
    const set = /* @__PURE__ */ new Set();
    const customRanges = doc == null ? void 0 : doc.getCustomDecorations();
    setCommentIds((_a = customRanges == null ? void 0 : customRanges.map((r) => r.id).filter((i) => {
      const hasRepeat = set.has(i);
      set.add(i);
      return !hasRepeat;
    })) != null ? _a : []);
    const dispose = commandService.onCommandExecuted((command) => {
      var _a2;
      if (command.id === RichTextEditingMutation.id) {
        const set2 = /* @__PURE__ */ new Set();
        const customRanges2 = doc == null ? void 0 : doc.getCustomDecorations();
        setCommentIds((_a2 = customRanges2 == null ? void 0 : customRanges2.map((r) => r.id).filter((i) => {
          const hasRepeat = set2.has(i);
          set2.add(i);
          return !hasRepeat;
        })) != null ? _a2 : []);
      }
    });
    return () => {
      dispose.dispose();
    };
  }, [commandService, doc]);
  if (!doc) {
    return null;
  }
  const isInValidSelection = shouldDisableAddComment(injector2);
  const unitId = doc.getUnitId();
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    ThreadCommentPanel,
    {
      unitId,
      subUnitId$,
      type: 1 /* UNIVER_DOC */,
      onAdd: () => {
        commandService.executeCommand(StartAddCommentOperation.id);
      },
      getSubUnitName: () => "",
      disableAdd: isInValidSelection,
      tempComment,
      onAddComment: (comment) => {
        if (!comment.parentId) {
          const params = {
            unitId,
            range: tempComment,
            comment
          };
          commandService.executeCommand(AddDocCommentComment.id, params);
          docCommentService.endAdd();
          return false;
        }
        return true;
      },
      onDeleteComment: (comment) => {
        if (!comment.parentId) {
          const params = {
            unitId,
            commentId: comment.id
          };
          commandService.executeCommand(DeleteDocCommentComment.id, params);
          return false;
        }
        return true;
      },
      showComments: commentIds
    }
  );
};

// ../packages/docs-thread-comment-ui/src/controllers/doc-thread-comment-ui.controller.ts
var DocThreadCommentUIController = class extends Disposable {
  constructor(_commandService, _menuManagerService, _componentManager) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    this._initCommands();
    this._initMenus();
    this._initComponents();
  }
  _initCommands() {
    [
      AddDocCommentComment,
      DeleteDocCommentComment,
      ShowCommentPanelOperation,
      StartAddCommentOperation,
      ToggleCommentPanelOperation
    ].forEach((command) => {
      this.disposeWithMe(this._commandService.registerCommand(command));
    });
  }
  _initMenus() {
    this._menuManagerService.mergeMenu(menuSchema2);
  }
  _initComponents() {
    [
      [DOCS_THREAD_COMMENT_PANEL, DocThreadCommentPanel],
      ["CommentIcon", CommentIcon]
    ].forEach(([id, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(id, comp)
      );
    });
  }
};
DocThreadCommentUIController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, Inject(ComponentManager))
], DocThreadCommentUIController);

// ../packages/docs-thread-comment-ui/src/controllers/render-controllers/render.controller.ts
var DocThreadCommentRenderController = class extends Disposable {
  constructor(_context, _docInterceptorService, _threadCommentPanelService, _docRenderController, _univerInstanceService, _threadCommentModel, _commandService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_docInterceptorService", _docInterceptorService);
    __publicField(this, "_threadCommentPanelService", _threadCommentPanelService);
    __publicField(this, "_docRenderController", _docRenderController);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_threadCommentModel", _threadCommentModel);
    __publicField(this, "_commandService", _commandService);
    this._interceptorViewModel();
    this._initReRender();
    this._initSyncComments();
  }
  _initReRender() {
    this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe((activeComment) => {
      var _a;
      if (activeComment) {
        this._docRenderController.reRender(activeComment.unitId);
        return;
      }
      const unitId = (_a = this._univerInstanceService.getCurrentUnitOfType(1 /* UNIVER_DOC */)) == null ? void 0 : _a.getUnitId();
      if (unitId) {
        this._docRenderController.reRender(unitId);
      }
    }));
    this.disposeWithMe(this._threadCommentModel.commentUpdate$.subscribe((update) => {
      if (update.type === "resolve") {
        this._docRenderController.reRender(update.unitId);
      }
    }));
  }
  _interceptorViewModel() {
    this._docInterceptorService.intercept(DOC_INTERCEPTOR_POINT.CUSTOM_DECORATION, {
      handler: (data, pos, next) => {
        if (!data) {
          return next(data);
        }
        const { unitId, index, customDecorations } = pos;
        const activeComment = this._threadCommentPanelService.activeCommentId;
        const { commentId, unitId: commentUnitID } = activeComment || {};
        const activeCustomDecoration = customDecorations.find((i) => i.id === commentId);
        const comment = this._threadCommentModel.getComment(unitId, DEFAULT_DOC_SUBUNIT_ID, data.id);
        if (!comment) {
          return next({
            ...data,
            show: false
          });
        }
        const isActiveIndex = activeCustomDecoration && index >= activeCustomDecoration.startIndex && index <= activeCustomDecoration.endIndex;
        const isActive = commentUnitID === unitId && data.id === commentId;
        return next({
          ...data,
          active: isActive || isActiveIndex,
          show: !comment.resolved
        });
      }
    });
  }
  _initSyncComments() {
    var _a, _b, _c;
    const unitId = this._context.unit.getUnitId();
    const subUnitId = DEFAULT_DOC_SUBUNIT_ID;
    const threadIds = (_c = (_b = (_a = this._context.unit.getBody()) == null ? void 0 : _a.customDecorations) == null ? void 0 : _b.filter((i) => i.type === 0 /* COMMENT */).map((i) => i.id)) != null ? _c : [];
    threadIds.length && this._threadCommentModel.syncThreadComments(this._context.unit.getUnitId(), DEFAULT_DOC_SUBUNIT_ID, threadIds);
    let prevThreadIds = threadIds.sort();
    this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
      var _a2, _b2, _c2;
      if (commandInfo.id === RichTextEditingMutation.id) {
        const params = commandInfo.params;
        if (params.unitId !== this._context.unit.getUnitId()) {
          return;
        }
        const currentThreadIds = (_c2 = (_b2 = (_a2 = this._context.unit.getBody()) == null ? void 0 : _a2.customDecorations) == null ? void 0 : _b2.filter((i) => i.type === 0 /* COMMENT */).map((i) => i.id)) != null ? _c2 : [];
        const currentThreadIdsSorted = currentThreadIds.sort();
        if (JSON.stringify(prevThreadIds) !== JSON.stringify(currentThreadIdsSorted)) {
          const preIds = new Set(prevThreadIds);
          const addIds = /* @__PURE__ */ new Set();
          currentThreadIds.forEach((id) => {
            if (!preIds.has(id)) {
              addIds.add(id);
            }
          });
          prevThreadIds = currentThreadIdsSorted;
          this._threadCommentModel.syncThreadComments(unitId, subUnitId, [...addIds]);
        }
      }
    }));
  }
};
DocThreadCommentRenderController = __decorateClass([
  __decorateParam(1, Inject(DocInterceptorService)),
  __decorateParam(2, Inject(ThreadCommentPanelService)),
  __decorateParam(3, Inject(DocRenderController)),
  __decorateParam(4, IUniverInstanceService),
  __decorateParam(5, Inject(ThreadCommentModel)),
  __decorateParam(6, ICommandService)
], DocThreadCommentRenderController);

// ../packages/docs-thread-comment-ui/src/plugin.ts
var UniverDocsThreadCommentUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig4, _injector, _renderManagerSrv, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig4,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(DOCS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [DocThreadCommentUIController],
      [DocThreadCommentSelectionController],
      [DocThreadCommentService]
    ].forEach((dep) => {
      this._injector.add(dep);
    });
  }
  onRendered() {
    this._initRenderModule();
    this._injector.get(DocThreadCommentSelectionController);
    this._injector.get(DocThreadCommentUIController);
  }
  _initRenderModule() {
    [DocThreadCommentRenderController].forEach((dep) => {
      this._renderManagerSrv.registerRenderModule(1 /* UNIVER_DOC */, dep);
    });
  }
};
__publicField(UniverDocsThreadCommentUIPlugin, "pluginName", PLUGIN_NAME);
__publicField(UniverDocsThreadCommentUIPlugin, "packageName", package_default4.name);
__publicField(UniverDocsThreadCommentUIPlugin, "version", package_default4.version);
__publicField(UniverDocsThreadCommentUIPlugin, "type", 1 /* UNIVER_DOC */);
UniverDocsThreadCommentUIPlugin = __decorateClass([
  DependentOn(UniverThreadCommentUIPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IConfigService)
], UniverDocsThreadCommentUIPlugin);

// src/docs/main.ts
var IS_E2E = false;
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  },
  logLevel: 4 /* VERBOSE */
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
  ribbonType: "classic"
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin, {
  container: "univerdoc"
});
univer.registerPlugin(UniverDocsDrawingUIPlugin);
univer.registerPlugin(UniverDocsThreadCommentUIPlugin);
univer.registerPlugin(UniverDocsHyperLinkUIPlugin);
univer.registerPlugin(UniverDocsMentionUIPlugin);
univer.registerPlugin(UniverDocsQuickInsertUIPlugin);
if (!IS_E2E) {
  univer.createUnit(1 /* UNIVER_DOC */, DEFAULT_DOCUMENT_DATA_SIMPLE);
  univer.registerPlugin(UniverDebuggerPlugin, {
    fabEntryUnitType: 1 /* UNIVER_DOC */
  });
} else {
  univer.registerPlugin(UniverDebuggerPlugin, {
    fab: false,
    performanceMonitor: {
      enabled: false
    }
  });
}
window.univer = univer;
var injector = univer.__getInjector();
var userManagerService = injector.get(UserManagerService);
var mockUser = {
  userID: "Owner_qxVnhPbQ",
  name: "Owner",
  avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==",
  anonymous: false,
  canBindAnonymous: false
};
userManagerService.setCurrentUser(mockUser);
window.univerAPI = FUniver.newAPI(univer);
