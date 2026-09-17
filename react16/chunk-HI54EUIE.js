import {
  SheetsSortService,
  SortRangeCommand,
  UniverSheetsSortPlugin
} from "./chunk-7OGYBNIL.js";
import {
  SheetsRenderService,
  getCurrentExclusiveRangeInterest$,
  getCurrentRangeDisable$
} from "./chunk-BHQGV2VJ.js";
import {
  AscendingIcon,
  Button,
  ButtonGroup,
  CheckMarkIcon,
  Checkbox,
  ComponentManager,
  CustomSortIcon,
  DeleteEmptyIcon,
  DescendingIcon,
  DraggableList,
  Dropdown,
  ExpandAscendingIcon,
  ExpandDescendingIcon,
  IDialogService,
  ILayoutService,
  IMenuManagerService,
  IUIPartsService,
  IncreaseIcon,
  MoreDownIcon,
  Radio,
  RadioGroup,
  SequenceIcon,
  clsx,
  connectInjector,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  RangeProtectionPermissionEditPoint,
  SetSelectionsOperation,
  SheetsSelectionsService,
  WorkbookEditablePermission,
  WorksheetEditPermission,
  WorksheetSortPermission,
  expandToContinuousRange,
  getPrimaryForRange,
  getSheetCommandTarget,
  serializeRange
} from "./chunk-Q6Y4PHRI.js";
import {
  BehaviorSubject,
  DependentOn,
  Disposable,
  ICommandService,
  IConfigService,
  IConfirmService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  RxDisposable,
  Tools,
  merge_default,
  takeUntil,
  throttle
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-sort-ui/package.json
var package_default = {
  name: "@univerjs/sheets-sort-ui",
  version: "0.25.2",
  private: false,
  description: "Sorting menus and panels for Univer Sheets.",
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
    "sort",
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-sort": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    "@univerjs/sheets-formula-ui": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-sort-ui/src/config/config.ts
var SHEETS_SORT_UI_PLUGIN_CONFIG_KEY = "sheets-sort-ui.config";
var configSymbol = Symbol(SHEETS_SORT_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-sort-ui/src/views/ExtendConfirm.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var ExtendConfirm = (props) => {
  const [extend, setExtend] = (0, import_react.useState)("0");
  const localeService = useDependency(LocaleService);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-text-sm", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "extend-confirm-desc", children: localeService.t("sheets-sort-ui.dialog.sort-reminder-desc") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      RadioGroup,
      {
        className: "univer-mt-4",
        value: extend,
        direction: "vertical",
        onChange: (value) => {
          setExtend(value);
          props.onChange(value);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { value: "0", children: localeService.t("sheets-sort-ui.dialog.sort-reminder-no") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { value: "1", children: localeService.t("sheets-sort-ui.dialog.sort-reminder-ext") })
        ]
      }
    )
  ] });
};

// ../packages/sheets-sort-ui/src/services/sheets-sort-ui.service.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var SORT_ERROR_MESSAGE = {
  MERGE_ERROR: "sheets-sort-ui.error.merge-size",
  EMPTY_ERROR: "sheets-sort-ui.error.empty",
  SINGLE_ERROR: "sheets-sort-ui.error.single",
  FORMULA_ARRAY: "sheets-sort-ui.error.formula-array"
};
var SheetsSortUIService = class extends Disposable {
  constructor(_univerInstanceService, _confirmService, _selectionManagerService, _sheetsSortService, _localeService, _commandService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_confirmService", _confirmService);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_sheetsSortService", _sheetsSortService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_customSortState$", new BehaviorSubject(null));
    __publicField(this, "customSortState$", this._customSortState$.asObservable());
  }
  async triggerSortDirectly(asc, extend, sheetRangeLocation) {
    const location = sheetRangeLocation || await this._detectSortLocation(extend);
    if (!location) {
      return false;
    }
    const check = this._check(location);
    if (!check) {
      return false;
    }
    const sortOption = {
      orderRules: [{
        type: asc ? "asc" /* ASC */ : "desc" /* DESC */,
        colIndex: location.colIndex
      }],
      range: location.range
    };
    this._sheetsSortService.applySort(sortOption, location.unitId, location.subUnitId);
    return true;
  }
  async triggerSortCustomize() {
    const location = await this._detectSortLocation();
    if (!location) {
      return false;
    }
    const check = this._check(location);
    if (!check) {
      return false;
    }
    this.showCustomSortPanel(location);
    return true;
  }
  customSortState() {
    return this._customSortState$.getValue();
  }
  getTitles(hasTitle) {
    var _a, _b;
    const location = (_a = this.customSortState()) == null ? void 0 : _a.location;
    if (!location) {
      return [];
    }
    const { unitId, subUnitId, range } = location;
    const worksheet = (_b = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _b.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return [];
    }
    const colTranslator = colIndexTranslator(this._localeService);
    return Array.from({ length: range.endColumn - range.startColumn + 1 }, (_, i) => {
      var _a2;
      const cellValue = (_a2 = worksheet.getCell(range.startRow, i + range.startColumn)) == null ? void 0 : _a2.v;
      return {
        index: i + range.startColumn,
        label: hasTitle ? `${cellValue != null ? cellValue : colTranslator(i + range.startColumn)}` : colTranslator(i + range.startColumn)
      };
    });
  }
  setSelection(unitId, subUnitId, range) {
    var _a;
    const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return;
    }
    const setSelectionsOperationParams = {
      unitId,
      subUnitId,
      selections: [{ range, primary: getPrimaryForRange(range, worksheet), style: null }]
    };
    this._commandService.executeCommand(SetSelectionsOperation.id, setSelectionsOperationParams);
  }
  async showCheckError(content) {
    return await this._confirmService.confirm({
      id: "sort-range-check-error",
      title: {
        title: this._localeService.t("sheets-sort-ui.info.tooltip")
      },
      children: {
        title: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: this._localeService.t(content) })
      },
      cancelText: this._localeService.t("sheets-sort-ui.dialog.cancel"),
      confirmText: this._localeService.t("sheets-sort-ui.dialog.confirm")
    });
  }
  async showExtendConfirm() {
    let shouldExtend = false;
    const confirm = await this._confirmService.confirm({
      id: "extend-sort-range-dialog",
      title: {
        title: this._localeService.t("sheets-sort-ui.dialog.sort-reminder")
      },
      children: {
        title: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          ExtendConfirm,
          {
            onChange: (value) => {
              shouldExtend = value === "1";
            }
          }
        )
      },
      width: 400,
      cancelText: this._localeService.t("sheets-sort-ui.dialog.cancel"),
      confirmText: this._localeService.t("sheets-sort-ui.dialog.confirm")
    });
    if (confirm) {
      return shouldExtend ? "extend" /* EXTEND */ : "keep" /* KEEP */;
    }
    return "cancel" /* CANCEL */;
  }
  showCustomSortPanel(location) {
    this._customSortState$.next({ location, show: true });
  }
  closeCustomSortPanel() {
    this._customSortState$.next({ show: false });
  }
  _check(location) {
    const singleCheck = this._sheetsSortService.singleCheck(location);
    if (!singleCheck) {
      this.showCheckError(SORT_ERROR_MESSAGE.SINGLE_ERROR);
      return false;
    }
    const mergeCheck = this._sheetsSortService.mergeCheck(location);
    if (!mergeCheck) {
      this.showCheckError(SORT_ERROR_MESSAGE.MERGE_ERROR);
      return false;
    }
    const formulaCheck = this._sheetsSortService.formulaCheck(location);
    if (!formulaCheck) {
      this.showCheckError(SORT_ERROR_MESSAGE.FORMULA_ARRAY);
      return false;
    }
    const emptyCheck = this._sheetsSortService.emptyCheck(location);
    if (!emptyCheck) {
      this.showCheckError(SORT_ERROR_MESSAGE.EMPTY_ERROR);
      return false;
    }
    return true;
  }
  async _detectSortLocation(extend) {
    const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const worksheet = workbook.getActiveSheet();
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const selection = this._selectionManagerService.getCurrentLastSelection();
    if (!selection) {
      return null;
    }
    let range;
    if (extend === true) {
      range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
      this.setSelection(unitId, subUnitId, range);
    } else if (extend === false) {
      range = selection.range;
    } else {
      const confirmRes = await this.showExtendConfirm();
      if (confirmRes === "cancel" /* CANCEL */) {
        return null;
      }
      if (confirmRes === "keep" /* KEEP */) {
        range = selection.range;
      } else {
        range = expandToContinuousRange(selection.range, { up: true, down: true, left: true, right: true }, worksheet);
        this.setSelection(unitId, subUnitId, range);
      }
    }
    return {
      range,
      unitId,
      subUnitId,
      colIndex: selection.primary.actualColumn
    };
  }
};
SheetsSortUIService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, IConfirmService),
  __decorateParam(2, Inject(SheetsSelectionsService)),
  __decorateParam(3, Inject(SheetsSortService)),
  __decorateParam(4, Inject(LocaleService)),
  __decorateParam(5, ICommandService)
], SheetsSortUIService);
function colIndexTranslator(localeService) {
  return (colIndex) => {
    const colName = Tools.chatAtABC(colIndex);
    const currentLocale = localeService.getCurrentLocale();
    switch (currentLocale) {
      case "zhCN" /* ZH_CN */:
        return `"${colName}"\u5217`;
      case "enUS" /* EN_US */:
        return `Column "${colName}"`;
      default:
        return `Column "${colName}"`;
    }
  };
}

// ../packages/sheets-sort-ui/src/commands/commands/sheets-sort.command.ts
var SortRangeAscCommand = {
  id: "sheet.command.sort-range-asc",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(true, false);
  }
};
var SortRangeAscExtCommand = {
  id: "sheet.command.sort-range-asc-ext",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(true, true);
  }
};
var SortRangeDescCommand = {
  id: "sheet.command.sort-range-desc",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(false, false);
  }
};
var SortRangeDescExtCommand = {
  id: "sheet.command.sort-range-desc-ext",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(false, true);
  }
};
var SortRangeCustomCommand = {
  id: "sheet.command.sort-range-custom",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortCustomize();
  }
};
var SortRangeAscInCtxMenuCommand = {
  id: "sheet.command.sort-range-asc-ctx",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(true, false);
  }
};
var SortRangeAscExtInCtxMenuCommand = {
  id: "sheet.command.sort-range-asc-ext-ctx",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(true, true);
  }
};
var SortRangeDescInCtxMenuCommand = {
  id: "sheet.command.sort-range-desc-ctx",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(false, false);
  }
};
var SortRangeDescExtInCtxMenuCommand = {
  id: "sheet.command.sort-range-desc-ext-ctx",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortDirectly(false, true);
  }
};
var SortRangeCustomInCtxMenuCommand = {
  id: "sheet.command.sort-range-custom-ctx",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const sortService = accessor.get(SheetsSortUIService);
    return await sortService.triggerSortCustomize();
  }
};

// ../packages/sheets-sort-ui/src/menu/sheets-sort.menu.ts
var SHEETS_SORT_MENU_ID = "sheet.menu.sheets-sort";
var SHEETS_SORT_CTX_MENU_ID = "sheet.menu.sheets-sort-ctx";
var SHEETS_SORT_ASC_ICON = "AscendingIcon";
var SHEETS_SORT_ASC_EXT_ICON = "ExpandAscendingIcon";
var SHEETS_SORT_DESC_ICON = "DescendingIcon";
var SHEETS_SORT_DESC_EXT_ICON = "ExpandDescendingIcon";
var SHEETS_SORT_CUSTOM_ICON = "CustomSortIcon";
function sortRangeMenuFactory(accessor) {
  return {
    id: SHEETS_SORT_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: SHEETS_SORT_ASC_ICON,
    tooltip: "sheets-sort-ui.general.sort",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function sortRangeAscMenuFactory(_accessor) {
  return {
    id: SortRangeAscCommand.id,
    icon: SHEETS_SORT_ASC_ICON,
    title: "sheets-sort-ui.general.sort-asc-cur",
    type: 0 /* BUTTON */,
    hidden$: getCurrentExclusiveRangeInterest$(_accessor)
  };
}
function sortRangeAscExtMenuFactory(_accessor) {
  return {
    id: SortRangeAscExtCommand.id,
    title: "sheets-sort-ui.general.sort-asc-ext",
    icon: SHEETS_SORT_ASC_EXT_ICON,
    type: 0 /* BUTTON */
  };
}
function sortRangeDescMenuFactory(_accessor) {
  return {
    id: SortRangeDescCommand.id,
    title: "sheets-sort-ui.general.sort-desc-cur",
    icon: SHEETS_SORT_DESC_ICON,
    type: 0 /* BUTTON */
  };
}
function sortRangeDescExtMenuFactory(_accessor) {
  return {
    id: SortRangeDescExtCommand.id,
    title: "sheets-sort-ui.general.sort-desc-ext",
    icon: SHEETS_SORT_DESC_EXT_ICON,
    type: 0 /* BUTTON */
  };
}
function sortRangeCustomMenuFactory(_accessor) {
  return {
    id: SortRangeCustomCommand.id,
    title: "sheets-sort-ui.general.sort-custom",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_CUSTOM_ICON
  };
}
function sortRangeCtxMenuFactory(accessor) {
  return {
    id: SHEETS_SORT_CTX_MENU_ID,
    title: "sheets-sort-ui.general.sort",
    type: 3 /* SUBITEMS */,
    icon: SHEETS_SORT_ASC_ICON,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, {
      workbookTypes: [WorkbookEditablePermission],
      worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
      rangeTypes: [RangeProtectionPermissionEditPoint]
    })
  };
}
function sortRangeAscCtxMenuFactory(_accessor) {
  return {
    id: SortRangeAscInCtxMenuCommand.id,
    title: "sheets-sort-ui.general.sort-asc-cur",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_ASC_ICON,
    disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function sortRangeAscExtCtxMenuFactory(_accessor) {
  return {
    id: SortRangeAscExtInCtxMenuCommand.id,
    title: "sheets-sort-ui.general.sort-asc-ext",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_ASC_EXT_ICON,
    disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function sortRangeDescCtxMenuFactory(_accessor) {
  return {
    id: SortRangeDescInCtxMenuCommand.id,
    title: "sheets-sort-ui.general.sort-desc-cur",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_DESC_ICON,
    disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function sortRangeDescExtCtxMenuFactory(_accessor) {
  return {
    id: SortRangeDescExtInCtxMenuCommand.id,
    title: "sheets-sort-ui.general.sort-desc-ext",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_DESC_EXT_ICON,
    disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function sortRangeCustomCtxMenuFactory(_accessor) {
  return {
    id: SortRangeCustomInCtxMenuCommand.id,
    title: "sheets-sort-ui.general.sort-custom",
    type: 0 /* BUTTON */,
    icon: SHEETS_SORT_CUSTOM_ICON,
    disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}

// ../packages/sheets-sort-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.data.organization" /* ORGANIZATION */]: {
    [SHEETS_SORT_MENU_ID]: {
      order: 3,
      menuItemFactory: sortRangeMenuFactory,
      [SortRangeAscCommand.id]: {
        order: 0,
        menuItemFactory: sortRangeAscMenuFactory
      },
      [SortRangeAscExtCommand.id]: {
        order: 1,
        menuItemFactory: sortRangeAscExtMenuFactory
      },
      [SortRangeDescCommand.id]: {
        order: 2,
        menuItemFactory: sortRangeDescMenuFactory
      },
      [SortRangeDescExtCommand.id]: {
        order: 3,
        menuItemFactory: sortRangeDescExtMenuFactory
      },
      [SortRangeCustomCommand.id]: {
        order: 4,
        menuItemFactory: sortRangeCustomMenuFactory
      }
    }
  },
  ["contextMenu.mainArea" /* MAIN_AREA */]: {
    ["contextMenu.data" /* DATA */]: {
      [SHEETS_SORT_CTX_MENU_ID]: {
        order: 0,
        menuItemFactory: sortRangeCtxMenuFactory,
        [SortRangeAscInCtxMenuCommand.id]: {
          order: 0,
          menuItemFactory: sortRangeAscCtxMenuFactory
        },
        [SortRangeAscExtInCtxMenuCommand.id]: {
          order: 1,
          menuItemFactory: sortRangeAscExtCtxMenuFactory
        },
        [SortRangeDescInCtxMenuCommand.id]: {
          order: 2,
          menuItemFactory: sortRangeDescCtxMenuFactory
        },
        [SortRangeDescExtInCtxMenuCommand.id]: {
          order: 3,
          menuItemFactory: sortRangeDescExtCtxMenuFactory
        },
        [SortRangeCustomInCtxMenuCommand.id]: {
          order: 4,
          menuItemFactory: sortRangeCustomCtxMenuFactory
        }
      }
    }
  }
};

// ../packages/sheets-sort-ui/src/views/CustomSortPanel.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function CustomSortPanel() {
  const sheetsSortUIService = useDependency(SheetsSortUIService);
  const state = useObservable(sheetsSortUIService.customSortState$);
  if (!state || !state.location) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CustomSortPanelImpl, { state });
}
function CustomSortPanelImpl({ state }) {
  const sheetsSortService = useDependency(SheetsSortService);
  const localeService = useDependency(LocaleService);
  const sheetsSortUIService = useDependency(SheetsSortUIService);
  const [hasTitle, setHasTitle] = (0, import_react2.useState)(false);
  const [scrollPosition, setScrollPosition] = (0, import_react2.useState)(0);
  const listEndRef = (0, import_react2.useRef)(null);
  const { range, unitId, subUnitId } = state.location;
  const titles = sheetsSortUIService.getTitles(hasTitle);
  const [list, setList] = (0, import_react2.useState)([
    { type: "asc" /* ASC */, colIndex: range.startColumn }
  ]);
  const onItemChange = (0, import_react2.useCallback)((index, value) => {
    const newList = [...list];
    if (value === null) {
      newList.splice(index, 1);
    } else {
      newList[index] = value;
    }
    setList(newList);
  }, [list]);
  const newItem = (0, import_react2.useCallback)(
    throttle(() => {
      const newList = [...list];
      const nextColIndex = findNextColIndex(range, list);
      if (nextColIndex !== null) {
        newList.push({ type: "asc" /* ASC */, colIndex: nextColIndex });
        setList(newList);
      }
    }, 200),
    [list, range]
  );
  const apply = (0, import_react2.useCallback)((orderRules, hasTitle2) => {
    sheetsSortService.applySort({ range, orderRules, hasTitle: hasTitle2 });
    sheetsSortUIService.closeCustomSortPanel();
  }, [sheetsSortService, sheetsSortUIService, range]);
  const cancel = (0, import_react2.useCallback)(() => {
    sheetsSortUIService.closeCustomSortPanel();
  }, [sheetsSortUIService]);
  const setTitle = (0, import_react2.useCallback)((value) => {
    setHasTitle(value);
    if (value) {
      sheetsSortUIService.setSelection(unitId, subUnitId, { ...range, startRow: range.startRow + 1 });
    } else {
      sheetsSortUIService.setSelection(unitId, subUnitId, range);
    }
  }, [sheetsSortUIService, range, subUnitId, unitId]);
  (0, import_react2.useEffect)(() => {
    if (listEndRef.current && list.length > 5) {
      listEndRef.current.scrollTop = listEndRef.current.scrollHeight;
    }
  }, [list]);
  const canNew = list.length < titles.length;
  const dragList = list.map((item) => ({ ...item, id: `${item.colIndex}` }));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { onMouseDown: (e) => {
      e.stopPropagation();
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mb-2 univer-flex univer-items-center univer-justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Checkbox, { checked: hasTitle, onChange: (value) => setTitle(!!value), children: localeService.t("sheets-sort-ui.dialog.first-row-check") }),
        canNew ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: `univer-flex univer-cursor-pointer univer-select-none univer-items-center univer-text-base`,
            onClick: newItem,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IncreaseIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-ml-1.5", children: localeService.t("sheets-sort-ui.dialog.add-condition") })
            ]
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: `univer-flex univer-cursor-pointer univer-select-none univer-items-center univer-text-base univer-text-primary-500 disabled:univer-cursor-not-allowed disabled:univer-divide-opacity-30 disabled:univer-text-gray-800`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IncreaseIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-ml-1.5 univer-text-xs", children: localeService.t("sheets-sort-ui.dialog.add-condition") })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          ref: listEndRef,
          className: clsx("univer-max-h-[310px] univer-overflow-y-auto univer-overflow-x-hidden", scrollbarClassName),
          onScroll: (e) => {
            const position = e.currentTarget.scrollTop;
            setScrollPosition(position);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            DraggableList,
            {
              list: dragList,
              onListChange: setList,
              idKey: "id",
              draggableHandle: "[data-u-comp=sort-panel-item-handler]",
              itemRender: (item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                SortOptionItem,
                {
                  titles,
                  list: dragList,
                  item,
                  onChange: (value, index) => onItemChange(index, value),
                  scrollPosition
                }
              ),
              rowHeight: 32,
              margin: [0, 12]
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-5 univer-flex univer-justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Button,
        {
          className: "univer-ml-3",
          onClick: () => cancel(),
          children: localeService.t("sheets-sort-ui.dialog.cancel")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Button,
        {
          className: "univer-ml-3",
          variant: "primary",
          onClick: () => apply(list, hasTitle),
          children: localeService.t("sheets-sort-ui.dialog.confirm")
        }
      )
    ] })
  ] });
}
function SortOptionItem(props) {
  var _a;
  const { list, item, titles, onChange, scrollPosition } = props;
  const localeService = useDependency(LocaleService);
  const availableMenu = titles.filter((title) => !list.some((item2) => item2.colIndex === title.index) || title.index === item.colIndex);
  const currentIndex = list.findIndex((listItem) => listItem.colIndex === item.colIndex);
  const handleChangeColIndex = (0, import_react2.useCallback)((menuItem) => {
    onChange({ ...item, colIndex: menuItem.index }, currentIndex);
    setVisible(false);
  }, [currentIndex, item, onChange]);
  const [visible, setVisible] = (0, import_react2.useState)(false);
  const onVisibleChange = (visible2) => {
    setVisible(visible2);
  };
  (0, import_react2.useEffect)(() => {
    setVisible(false);
  }, [scrollPosition]);
  const showDelete = list.length > 1;
  const itemLabel = (_a = titles.find((title) => title.index === item.colIndex)) == null ? void 0 : _a.label;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-grid univer-grid-flow-col univer-grid-cols-2 univer-items-center univer-gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          "data-u-comp": "sort-panel-item-handler",
          className: `univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-text-base univer-text-gray-700`,
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SequenceIcon, {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Dropdown,
        {
          overlay: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "ul",
            {
              className: clsx(`univer-my-0 univer-box-border univer-grid univer-max-h-[310px] univer-w-[--radix-popper-anchor-width] univer-items-center univer-gap-1 univer-overflow-y-auto univer-overflow-x-hidden univer-rounded-lg univer-border univer-bg-white univer-p-1 univer-text-base univer-shadow-lg`, scrollbarClassName),
              children: availableMenu.map((menuItem) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                "li",
                {
                  onClick: () => handleChangeColIndex(menuItem),
                  className: `univer-relative univer-box-border univer-flex univer-h-7 univer-cursor-pointer univer-list-none univer-items-center univer-justify-between univer-rounded univer-px-2 univer-text-sm univer-transition-all hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "univer-max-w-[220px] univer-truncate", children: menuItem.label }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: menuItem.index === item.colIndex && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CheckMarkIcon, {}) })
                  ]
                },
                menuItem.index
              ))
            }
          ),
          open: visible,
          onOpenChange: onVisibleChange,
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              className: clsx(`univer-ml-2 univer-flex univer-w-full univer-items-center univer-justify-between univer-overflow-hidden univer-rounded-md univer-py-1.5 univer-text-sm univer-text-gray-900 dark:!univer-text-white`),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    className: "univer-max-w-[220px] univer-truncate",
                    children: itemLabel
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MoreDownIcon, {})
              ]
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-items-center univer-justify-end univer-gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        RadioGroup,
        {
          value: item.type,
          onChange: (value) => {
            onChange({ ...item, type: value }, currentIndex);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Radio, { value: "asc" /* ASC */, children: localeService.t("sheets-sort-ui.general.sort-asc") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Radio, { value: "desc" /* DESC */, children: localeService.t("sheets-sort-ui.general.sort-desc") })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "a",
        {
          className: `univer-flex univer-cursor-pointer univer-items-center univer-text-sm univer-transition-colors hover:univer-text-red-500`,
          onClick: () => onChange(null, currentIndex),
          children: !showDelete && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(DeleteEmptyIcon, {})
        }
      )
    ] })
  ] });
}
function findNextColIndex(range, list) {
  const { startColumn, endColumn } = range;
  const used = new Set(list.map((item) => item == null ? void 0 : item.colIndex));
  for (let i = startColumn; i <= endColumn; i++) {
    if (!used.has(i)) {
      return i;
    }
  }
  return null;
}

// ../packages/sheets-sort-ui/src/views/EmbedSortBtn.tsx
var import_react3 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
function EmbedSortBtn(props) {
  const { range, colIndex, onClose } = props;
  const sheetsSortUIService = useDependency(SheetsSortUIService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const localeService = useDependency(LocaleService);
  const apply = (0, import_react3.useCallback)((asc) => {
    const { unitId, subUnitId } = getSheetCommandTarget(univerInstanceService) || {};
    if (range && unitId && subUnitId) {
      const noTitleRange = { ...range, startRow: range.startRow + 1 };
      sheetsSortUIService.triggerSortDirectly(asc, false, { unitId, subUnitId, range: noTitleRange, colIndex });
    } else {
      throw new Error(`Cannot find the target to sort. unitId: ${unitId}, subUnitId: ${subUnitId}, range: ${range}, colIndex: ${colIndex}`);
    }
    onClose();
  }, [range, colIndex, sheetsSortUIService, univerInstanceService, onClose]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(ButtonGroup, { className: "univer-mb-3 univer-w-full univer-grid-cols-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { onClick: () => apply(true), children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(AscendingIcon, {}),
      localeService.t("sheets-sort-ui.general.sort-asc")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Button, { onClick: () => apply(false), children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DescendingIcon, {}),
      localeService.t("sheets-sort-ui.general.sort-desc")
    ] })
  ] });
}

// ../packages/sheets-sort-ui/src/controllers/sheets-sort-ui.controller.ts
var CUSTOM_SORT_DIALOG_ID = "custom-sort-dialog";
var CUSTOM_SORT_PANEL_WIDTH = 560;
var CUSTOM_SORT_PANEL_TOP = 128;
var SheetsSortUIController = class extends RxDisposable {
  constructor(_commandService, _menuManagerService, _dialogService, _layoutService, _uiPartsService, _sheetRenderService, _localeService, _sheetsSortUIService, _injector, _componentManager) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_layoutService", _layoutService);
    __publicField(this, "_uiPartsService", _uiPartsService);
    __publicField(this, "_sheetRenderService", _sheetRenderService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sheetsSortUIService", _sheetsSortUIService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_componentManager", _componentManager);
    this._initCommands();
    this._initMenu();
    this._initUI();
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initCommands() {
    [
      SortRangeAscCommand,
      SortRangeAscExtCommand,
      SortRangeDescCommand,
      SortRangeDescExtCommand,
      SortRangeCustomCommand,
      SortRangeAscInCtxMenuCommand,
      SortRangeAscExtInCtxMenuCommand,
      SortRangeDescInCtxMenuCommand,
      SortRangeDescExtInCtxMenuCommand,
      SortRangeCustomInCtxMenuCommand
    ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    this.disposeWithMe(this._sheetRenderService.registerSkeletonChangingMutations(SortRangeCommand.id));
  }
  _initUI() {
    this.disposeWithMe(
      this._uiPartsService.registerComponent("filter-panel-embed-point" /* FILTER_PANEL_EMBED_POINT */, () => connectInjector(EmbedSortBtn, this._injector))
    );
    [
      ["CustomSortPanel", CustomSortPanel],
      [SHEETS_SORT_ASC_ICON, AscendingIcon],
      [SHEETS_SORT_ASC_EXT_ICON, ExpandAscendingIcon],
      [SHEETS_SORT_DESC_ICON, DescendingIcon],
      [SHEETS_SORT_DESC_EXT_ICON, ExpandDescendingIcon],
      [SHEETS_SORT_CUSTOM_ICON, CustomSortIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
    this._sheetsSortUIService.customSortState$.pipe(takeUntil(this.dispose$)).subscribe((newState) => {
      if (newState && newState.show && newState.location) {
        this._openCustomSortPanel(newState.location);
      } else if (newState && !(newState == null ? void 0 : newState.show)) {
        this._closePanel();
      }
    });
  }
  _openCustomSortPanel(location) {
    this._dialogService.open({
      id: CUSTOM_SORT_DIALOG_ID,
      draggable: true,
      width: CUSTOM_SORT_PANEL_WIDTH,
      title: { title: `${this._localeService.t("sheets-sort-ui.general.sort-custom")}: ${serializeRange(location.range)}` },
      children: { label: "CustomSortPanel" },
      destroyOnClose: true,
      defaultPosition: getCustomSortDialogDefaultPosition(),
      preservePositionOnDestroy: false,
      onClose: () => this._closePanel(),
      mask: true
    });
  }
  _closePanel() {
    this._dialogService.close(CUSTOM_SORT_DIALOG_ID);
    queueMicrotask(() => this._layoutService.focus());
  }
};
SheetsSortUIController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IUIPartsService),
  __decorateParam(5, Inject(SheetsRenderService)),
  __decorateParam(6, Inject(LocaleService)),
  __decorateParam(7, Inject(SheetsSortUIService)),
  __decorateParam(8, Inject(Injector)),
  __decorateParam(9, Inject(ComponentManager))
], SheetsSortUIController);
function getCustomSortDialogDefaultPosition() {
  const x = (window.innerWidth - CUSTOM_SORT_PANEL_WIDTH) / 2;
  const y = CUSTOM_SORT_PANEL_TOP;
  return { x, y };
}

// ../packages/sheets-sort-ui/src/plugin.ts
var UniverSheetsSortUIPlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_SORT_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsSortUIService],
      [SheetsSortUIController]
    ].forEach((d) => this._injector.add(d));
  }
  onRendered() {
    this._injector.get(SheetsSortUIController);
  }
};
__publicField(UniverSheetsSortUIPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsSortUIPlugin, "pluginName", "SHEET_SORT_UI_PLUGIN");
__publicField(UniverSheetsSortUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsSortUIPlugin, "version", package_default.version);
UniverSheetsSortUIPlugin = __decorateClass([
  DependentOn(UniverSheetsSortPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsSortUIPlugin);

export {
  UniverSheetsSortUIPlugin
};
