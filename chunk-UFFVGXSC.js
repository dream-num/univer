import {
  AddDecimalCommand,
  CURRENCYFORMAT,
  DATEFMTLISG,
  NUMBERFORMAT,
  SHEETS_NUMFMT_PLUGIN_CONFIG_KEY,
  SetCurrencyCommand,
  SetNumfmtCommand,
  SetPercentCommand,
  SheetsNumfmtCellContentController,
  SubtractDecimalCommand,
  UniverSheetsNumfmtPlugin,
  getCurrencyFormatOptions,
  getCurrencySymbolByLocale,
  getCurrencySymbolIconByLocale,
  getCurrencyType,
  getDateFormatOptions,
  getDecimalFromPattern,
  getNumberFormatOptions,
  getPatternPreview,
  getPatternPreviewIgnoreGeneral,
  getPatternType,
  isPatternHasDecimal,
  localeCurrencySymbolMap,
  setPatternDecimal
} from "./chunk-LZWJIT7W.js";
import {
  CellAlertManagerService,
  HoverManagerService,
  IEditorBridgeService,
  IRepeatLastActionService,
  SheetSkeletonManagerService,
  UniverSheetsUIPlugin,
  deriveStateFromActiveSheet$,
  getCurrentRangeDisable$
} from "./chunk-BHQGV2VJ.js";
import {
  Button,
  CheckMarkIcon,
  ComponentManager,
  ILayoutService,
  IMenuManagerService,
  ISidebarService,
  IZenZoneService,
  Input,
  InputNumber,
  Select,
  SelectList,
  Separator,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  scrollbarClassName,
  useDependency
} from "./chunk-VNXQUZSG.js";
import {
  AFTER_CELL_EDIT,
  BEFORE_CELL_EDIT,
  INTERCEPTOR_POINT,
  INumfmtService,
  RangeProtectionPermissionEditPoint,
  RemoveNumfmtMutation,
  SetNumfmtMutation,
  SetRangeValuesCommand,
  SheetInterceptorService,
  SheetsSelectionsService,
  WorkbookEditablePermission,
  WorksheetEditPermission,
  WorksheetSetCellStylePermission,
  factoryRemoveNumfmtUndoMutation,
  factorySetNumfmtUndoMutation,
  stripErrorMargin,
  transformCellsToRange
} from "./chunk-Q6Y4PHRI.js";
import {
  IRenderManagerService
} from "./chunk-XOCU2XR6.js";
import {
  DEFAULT_TEXT_FORMAT_EXCEL,
  DependentOn,
  Disposable,
  DisposableCollection,
  ICommandService,
  IConfigService,
  ILocalStorageService,
  IUniverInstanceService,
  Inject,
  Injector,
  LocaleService,
  Observable,
  Optional,
  Plugin,
  Range,
  ThemeService,
  Tools,
  combineLatest,
  currencySymbols,
  debounceTime,
  filter,
  fromCallback,
  getNumfmtParseValueFilter,
  isDefaultFormat,
  isPatternEqualWithoutDecimal,
  isRealNum,
  isTextFormat,
  lib_exports,
  map,
  merge,
  merge_default,
  registerDependencies,
  switchMap,
  tap,
  toDisposable,
  touchDependencies,
  willLoseNumericPrecision
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/sheets-numfmt-ui/package.json
var package_default = {
  name: "@univerjs/sheets-numfmt-ui",
  version: "0.25.2",
  private: false,
  description: "Number format menus, editors, and previews for Univer Sheets.",
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
    "number-format",
    "formatting",
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
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-numfmt": "workspace:*",
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

// ../packages/sheets-numfmt-ui/src/config/config.ts
var SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY = "sheets-numfmt-ui.config";
var configSymbol = Symbol(SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-numfmt-ui/src/controllers/numfmt-alert-render.controller.ts
var ALERT_KEY = "SHEET_NUMFMT_ALERT";
var NumfmtAlertRenderController = class extends Disposable {
  constructor(_context, _hoverManagerService, _cellAlertManagerService, _localeService, _zenZoneService, _numfmtService, _configService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_cellAlertManagerService", _cellAlertManagerService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_numfmtService", _numfmtService);
    __publicField(this, "_configService", _configService);
    this._init();
  }
  _init() {
    this._initCellAlertPopup();
    this._initZenService();
  }
  _initCellAlertPopup() {
    this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cellPos) => {
      var _a, _b;
      if (cellPos) {
        const location = cellPos.location;
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return this._hideAlert();
        const unitId = location.unitId;
        const sheetId = location.subUnitId;
        let numfmtValue;
        const cellData = worksheet.getCell(location.row, location.col);
        if (cellData == null ? void 0 : cellData.s) {
          const style = workbook.getStyles().get(cellData.s);
          if (style == null ? void 0 : style.n) {
            numfmtValue = style.n;
          }
        }
        if (!numfmtValue) {
          numfmtValue = this._numfmtService.getValue(unitId, sheetId, location.row, location.col);
        }
        if (!numfmtValue) {
          this._hideAlert();
          return;
        }
        if (isTextFormat(numfmtValue.pattern) && Tools.isDefine(cellData == null ? void 0 : cellData.v) && isRealNum(cellData.v)) {
          if ((_a = this._configService.getConfig(SHEETS_NUMFMT_PLUGIN_CONFIG_KEY)) == null ? void 0 : _a.disableTextFormatAlert) {
            return;
          }
          const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
          const currentLoc = (_b = currentAlert == null ? void 0 : currentAlert.alert) == null ? void 0 : _b.location;
          if (currentLoc && currentLoc.row === location.row && currentLoc.col === location.col && currentLoc.subUnitId === location.subUnitId && currentLoc.unitId === location.unitId) {
            this._hideAlert();
            return;
          }
          this._cellAlertManagerService.showAlert({
            type: 2 /* ERROR */,
            title: this._localeService.t("sheets-numfmt-ui.info.error"),
            message: this._localeService.t("sheets-numfmt-ui.info.forceStringInfo"),
            location,
            width: 200,
            height: 74,
            key: ALERT_KEY
          });
          return;
        }
      }
      this._hideAlert();
    }));
  }
  _initZenService() {
    this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
      if (visible) {
        this._hideAlert();
      }
    }));
  }
  _hideAlert() {
    this._cellAlertManagerService.removeAlert(ALERT_KEY);
  }
};
NumfmtAlertRenderController = __decorateClass([
  __decorateParam(1, Inject(HoverManagerService)),
  __decorateParam(2, Inject(CellAlertManagerService)),
  __decorateParam(3, Inject(LocaleService)),
  __decorateParam(4, IZenZoneService),
  __decorateParam(5, Inject(INumfmtService)),
  __decorateParam(6, IConfigService)
], NumfmtAlertRenderController);

// ../packages/sheets-numfmt-ui/src/controllers/numfmt-repeat-last-action.controller.ts
var NumfmtRepeatLastActionController = class extends Disposable {
  constructor(_repeatLastActionService) {
    super();
    __publicField(this, "_repeatLastActionService", _repeatLastActionService);
    this._initCommandRecording();
  }
  _initCommandRecording() {
    if (!this._repeatLastActionService) {
      return;
    }
    const handler = (selections, params) => {
      if (!params) return;
      const { values } = params;
      const numfmtCell = values.find((cell) => cell.pattern);
      if (!numfmtCell) return;
      const { pattern, type } = numfmtCell;
      const newValues = [];
      const cache = /* @__PURE__ */ new Set();
      for (const selection of selections) {
        const { startRow, startColumn, endRow, endColumn } = selection;
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startColumn; col <= endColumn; col++) {
            const key3 = `${row}-${col}`;
            if (cache.has(key3)) {
              continue;
            }
            cache.add(key3);
            newValues.push({ row, col, pattern, type });
          }
        }
      }
      return {
        ...params,
        values: newValues
      };
    };
    this.disposeWithMe(this._repeatLastActionService.registerRepeatableCommand(SetNumfmtCommand.id, handler, "cellStyle" /* CellStyle */));
  }
};
NumfmtRepeatLastActionController = __decorateClass([
  __decorateParam(0, Optional(IRepeatLastActionService))
], NumfmtRepeatLastActionController);

// ../packages/sheets-numfmt-ui/src/commands/operations/close.numfmt.panel.operation.ts
var CloseNumfmtPanelOperator = {
  id: "sheet.operation.close.numfmt.panel",
  type: 1 /* OPERATION */,
  handler: () => (
    // do nothing, just notify panel is closed
    true
  )
};

// ../packages/sheets-numfmt-ui/src/commands/operations/open.numfmt.panel.operation.ts
var OpenNumfmtPanelOperator = {
  id: "sheet.operation.open.numfmt.panel",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    const numfmtController = accessor.get(SheetNumfmtUIController);
    numfmtController.openPanel();
    return true;
  }
};

// ../packages/sheets-numfmt-ui/src/views/components/index.tsx
var import_react9 = __toESM(require_react());

// ../packages/sheets-numfmt-ui/src/controllers/user-habit.controller.ts
var import_react = __toESM(require_react());
var UserHabitCurrencyContext = (0, import_react.createContext)([]);
var UserHabitController = class {
  constructor(_localStorageService) {
    __publicField(this, "_localStorageService", _localStorageService);
  }
  _getKey(habit) {
    return `userHabitController_${habit}`;
  }
  async addHabit(habit, initValue) {
    const key3 = this._getKey(habit);
    return this._localStorageService.getItem(key3).then((item) => {
      if (!item) {
        this._localStorageService.setItem(key3, initValue);
      }
    });
  }
  markHabit(habit, value) {
    const key3 = this._getKey(habit);
    this._localStorageService.getItem(key3).then((list) => {
      if (list) {
        const index = list.findIndex((item) => item === value);
        index > -1 && list.splice(index, 1);
        list.unshift(value);
        this._localStorageService.setItem(key3, list);
      }
    });
  }
  async getHabit(habit, sortList) {
    const key3 = this._getKey(habit);
    const result = await this._localStorageService.getItem(key3);
    if (sortList && result) {
      const priority = result.map((item, index, arr) => {
        const length = arr.length;
        return {
          value: item,
          priority: length - index
        };
      });
      return sortList.sort((a, b) => {
        var _a, _b;
        const ap = ((_a = priority.find((item) => item.value === a)) == null ? void 0 : _a.priority) || -1;
        const bp = ((_b = priority.find((item) => item.value === b)) == null ? void 0 : _b.priority) || -1;
        return bp - ap;
      });
    }
    return result || [];
  }
  deleteHabit(habit) {
    this._localStorageService.removeItem(habit);
  }
};
UserHabitController = __decorateClass([
  __decorateParam(0, Inject(ILocalStorageService))
], UserHabitController);

// ../packages/sheets-numfmt-ui/src/views/hooks/use-currency-options.ts
var import_react2 = __toESM(require_react());
var key = "numfmtCurrency";
var useCurrencyOptions = (onOptionChange) => {
  const userHabitController = useDependency(UserHabitController);
  const [options, setOptions] = (0, import_react2.useState)(currencySymbols);
  (0, import_react2.useEffect)(() => {
    userHabitController.addHabit("numfmtCurrency", []).then(() => {
      userHabitController.getHabit(key, [...currencySymbols]).then((list) => {
        setOptions(list);
        onOptionChange && onOptionChange(list);
      });
    });
  }, []);
  const mark = (v) => {
    userHabitController.markHabit(key, v);
  };
  return { userHabitCurrency: options, mark };
};

// ../packages/sheets-numfmt-ui/src/views/hooks/use-next-tick.ts
var import_react3 = __toESM(require_react());
var useNextTick = () => {
  const effectList = (0, import_react3.useRef)([]);
  const [value, dispatch] = (0, import_react3.useState)({});
  (0, import_react3.useEffect)(() => {
    effectList.current.forEach((fn) => {
      fn();
    });
    effectList.current = [];
  }, [value]);
  const nextTick = (fn) => {
    effectList.current.push(fn);
    dispatch({});
  };
  return nextTick;
};

// ../packages/sheets-numfmt-ui/src/views/components/Accounting.tsx
var import_react4 = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var isAccountingPanel = (pattern) => {
  const type = getCurrencyType(pattern);
  return !!type && pattern.startsWith("_(");
};
var AccountingPanel = (props) => {
  const { defaultPattern, action, onChange } = props;
  const [decimal, setDecimal] = (0, import_react4.useState)(() => getDecimalFromPattern(defaultPattern || "", 2));
  const userHabitCurrency = (0, import_react4.useContext)(UserHabitCurrencyContext);
  const [suffix, setSuffix] = (0, import_react4.useState)(() => getCurrencyType(defaultPattern) || userHabitCurrency[0]);
  const options = (0, import_react4.useMemo)(() => userHabitCurrency.map((key3) => ({ label: key3, value: key3 })), []);
  const localeService = useDependency(LocaleService);
  const t = localeService.t;
  action.current = () => setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? ".0" : ""}_)`, decimal);
  const handleSelect = (v) => {
    setSuffix(v);
    onChange(setPatternDecimal(`_("${v}"* #,##0${decimal > 0 ? ".0" : ""}_)`, decimal));
  };
  const handleDecimalChange = (v) => {
    const decimal2 = v || 0;
    setDecimal(decimal2);
    onChange(setPatternDecimal(`_("${suffix}"* #,##0${decimal2 > 0 ? ".0" : ""}_)`, decimal2));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-mt-4 univer-flex univer-justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "option", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.decimalLength") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mt-2 univer-w-32", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          InputNumber,
          {
            value: decimal,
            step: 1,
            precision: 0,
            max: 20,
            min: 0,
            onChange: handleDecimalChange
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "option", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.currencyType") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mt-2 univer-w-36", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Select,
          {
            options,
            value: suffix,
            onChange: handleSelect
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.accountingDes") })
  ] });
};

// ../packages/sheets-numfmt-ui/src/views/components/Currency.tsx
var import_react5 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var isCurrencyPanel = (pattern) => {
  const type = getCurrencyType(pattern);
  return !!type && !pattern.startsWith("_(");
};
var CurrencyPanel = (props) => {
  const localeService = useDependency(LocaleService);
  const t = localeService.t;
  const userHabitCurrency = (0, import_react5.useContext)(UserHabitCurrencyContext);
  const [suffix, setSuffix] = (0, import_react5.useState)(() => getCurrencyType(props.defaultPattern) || userHabitCurrency[0]);
  const [decimal, setDecimal] = (0, import_react5.useState)(() => getDecimalFromPattern(props.defaultPattern || "", 2));
  const [pattern, setPattern] = (0, import_react5.useState)(() => {
    var _a;
    const negativeOptions2 = getCurrencyFormatOptions(suffix);
    const pattern2 = ((_a = negativeOptions2.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern))) == null ? void 0 : _a.value) || negativeOptions2[0].value;
    return pattern2;
  });
  const negativeOptions = (0, import_react5.useMemo)(() => getCurrencyFormatOptions(suffix), [suffix]);
  const options = (0, import_react5.useMemo)(() => userHabitCurrency.map((key3) => ({ label: key3, value: key3 })), [userHabitCurrency]);
  props.action.current = () => setPatternDecimal(pattern, decimal);
  const onSelect = (value) => {
    if (value === void 0) {
      return;
    }
    setSuffix(value);
    const pattern2 = getCurrencyFormatOptions(value)[0].value;
    setPattern(pattern2);
    props.onChange(setPatternDecimal(pattern2, decimal));
  };
  const onChange = (value) => {
    if (value === void 0) {
      return;
    }
    setPattern(value);
    props.onChange(setPatternDecimal(value, decimal));
  };
  const onDecimalChange = (v) => {
    setDecimal(v || 0);
    props.onChange(setPatternDecimal(pattern, v || 0));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-mt-4 univer-flex univer-justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "option", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.decimalLength") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-mt-2 univer-w-32", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          InputNumber,
          {
            value: decimal,
            max: 20,
            min: 0,
            onChange: onDecimalChange
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "option", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.currencyType") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-mt-2 univer-w-36", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          Select,
          {
            value: suffix,
            options,
            onChange: onSelect
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "label univer-mt-4", children: t("sheets-numfmt-ui.negType") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SelectList, { value: pattern, options: negativeOptions, onChange }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.currencyDes") })
  ] });
};

// ../packages/sheets-numfmt-ui/src/views/components/CustomFormat.tsx
var import_react6 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var key2 = "customFormat";
var historyPatternKey = "numfmt_custom_pattern";
function CustomFormat(props) {
  const { defaultPattern, action, onChange } = props;
  const userHabitController = useDependency(UserHabitController);
  const localStorageService = useDependency(ILocalStorageService);
  const localeService = useDependency(LocaleService);
  const [pattern, setPattern] = (0, import_react6.useState)(defaultPattern);
  action.current = () => {
    userHabitController.markHabit(key2, pattern);
    localStorageService.getItem(historyPatternKey).then((list = []) => {
      const _list = [.../* @__PURE__ */ new Set([pattern, ...list || []])].splice(0, 10).filter((e) => !!e);
      localStorageService.setItem(historyPatternKey, _list);
    });
    return pattern;
  };
  const [options, setOptions] = (0, import_react6.useState)([]);
  (0, import_react6.useEffect)(() => {
    localStorageService.getItem(historyPatternKey).then((historyList) => {
      const list = [
        ...CURRENCYFORMAT.map((item) => item.suffix("$")),
        ...DATEFMTLISG.map((item) => item.suffix),
        ...NUMBERFORMAT.map((item) => item.suffix)
      ];
      list.push(...historyList || []);
      userHabitController.addHabit(key2, []).finally(() => {
        userHabitController.getHabit(key2, list).then((list2) => {
          setOptions([...new Set(list2)]);
        });
      });
    });
  }, []);
  const handleClick = (p) => {
    setPattern(p);
    onChange(p);
  };
  const handleBlur = () => {
    onChange(pattern);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: localeService.t("sheets-numfmt-ui.customFormat") }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      Input,
      {
        placeholder: localeService.t("sheets-numfmt-ui.customFormat"),
        onBlur: handleBlur,
        value: pattern,
        onChange: setPattern,
        className: "univer-mt-2 univer-w-full"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: clsx("univer-mt-2 univer-max-h-[400px] univer-overflow-auto univer-rounded-lg univer-p-2", borderClassName),
        children: options.map((p) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            onClick: () => handleClick(p),
            className: `univer-flex univer-cursor-pointer univer-items-center univer-gap-1.5 univer-py-1.5 univer-text-sm`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-flex univer-w-4 univer-items-center univer-text-primary-600", children: pattern === p && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CheckMarkIcon, {}) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: p })
            ]
          },
          p
        ))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-mt-3 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-numfmt-ui.customFormatDes")
      }
    )
  ] });
}

// ../packages/sheets-numfmt-ui/src/views/components/Date.tsx
var import_react7 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var isDatePanel = (pattern) => {
  const info = lib_exports.getFormatInfo(pattern);
  return getDateFormatOptions().map((item) => item.value).includes(pattern) || ["date", "datetime", "time"].includes(info.type);
};
function DatePanel(props) {
  const { onChange, defaultPattern } = props;
  const options = (0, import_react7.useMemo)(getDateFormatOptions, []);
  const localeService = useDependency(LocaleService);
  const [suffix, setSuffix] = (0, import_react7.useState)(() => {
    if (defaultPattern) {
      const item = options.find((item2) => item2.value === defaultPattern);
      if (item) {
        return item.value;
      }
    }
    return options[0].value;
  });
  props.action.current = () => suffix;
  const handleChange = (v) => {
    if (v === void 0) {
      return;
    }
    setSuffix(v);
    onChange(v);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: localeService.t("sheets-numfmt-ui.dateType") }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SelectList, { value: suffix, options, onChange: handleChange }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        className: `univer-mt-3.5 univer-text-sm/5 univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-numfmt-ui.dateDes")
      }
    )
  ] });
}

// ../packages/sheets-numfmt-ui/src/views/components/General.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var isGeneralPanel = (pattern) => !pattern;
var GeneralPanel = (props) => {
  const localeService = useDependency(LocaleService);
  const t = localeService.t;
  props.action.current = () => "";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: `univer-mt-3.5 univer-text-sm/5 univer-text-gray-600 dark:!univer-text-gray-200`,
      children: t("sheets-numfmt-ui.generalDes")
    }
  ) });
};

// ../packages/sheets-numfmt-ui/src/views/components/ThousandthPercentile.tsx
var import_react8 = __toESM(require_react());
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var isThousandthPercentilePanel = (pattern) => getNumberFormatOptions().some((item) => isPatternEqualWithoutDecimal(item.value, pattern));
function ThousandthPercentilePanel(props) {
  const localeService = useDependency(LocaleService);
  const options = (0, import_react8.useMemo)(getNumberFormatOptions, []);
  const [decimal, setDecimal] = (0, import_react8.useState)(() => getDecimalFromPattern(props.defaultPattern || "", 0));
  const [suffix, setSuffix] = (0, import_react8.useState)(() => {
    const item = options.find((item2) => isPatternEqualWithoutDecimal(item2.value, props.defaultPattern || ""));
    return (item == null ? void 0 : item.value) || options[0].value;
  });
  const pattern = (0, import_react8.useMemo)(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);
  const isInputDisable = (0, import_react8.useMemo)(() => !isPatternHasDecimal(suffix), [suffix]);
  const handleDecimalChange = (decimal2) => {
    setDecimal(decimal2 || 0);
    props.onChange(setPatternDecimal(suffix, Number(decimal2 || 0)));
  };
  const handleClick = (v) => {
    if (v === void 0) {
      return;
    }
    setDecimal(getDecimalFromPattern(v, 0));
    setSuffix(v);
    props.onChange(v);
  };
  props.action.current = () => pattern;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: localeService.t("sheets-numfmt-ui.decimalLength") }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      InputNumber,
      {
        disabled: isInputDisable,
        value: decimal,
        max: 20,
        min: 0,
        onChange: handleDecimalChange
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-400", children: [
      " ",
      localeService.t("sheets-numfmt-ui.negType")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(SelectList, { onChange: handleClick, options, value: suffix }) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "div",
      {
        className: `univer-mt-3.5 univer-text-sm/5 univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-numfmt-ui.thousandthPercentileDes")
      }
    )
  ] });
}

// ../packages/sheets-numfmt-ui/src/views/components/index.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var import_react10 = __toESM(require_react());
var SheetNumfmtPanel = (props) => {
  const { defaultValue, defaultPattern, row, col } = props.value;
  const localeService = useDependency(LocaleService);
  const getCurrentPattern = (0, import_react9.useRef)(() => "");
  const t = localeService.t;
  const nextTick = useNextTick();
  const typeOptions = (0, import_react9.useMemo)(
    () => [
      { label: "sheets-numfmt-ui.general", component: GeneralPanel },
      { label: "sheets-numfmt-ui.accounting", component: AccountingPanel },
      { label: "sheets-numfmt-ui.currency", component: CurrencyPanel },
      { label: "sheets-numfmt-ui.date", component: DatePanel },
      { label: "sheets-numfmt-ui.thousandthPercentile", component: ThousandthPercentilePanel },
      { label: "sheets-numfmt-ui.customFormat", component: CustomFormat }
    ].map((item) => ({ ...item, label: t(item.label) })),
    []
  );
  const [type, setType] = (0, import_react9.useState)(findDefaultType);
  const [key3, setKey] = (0, import_react9.useState)(() => `${row}_${col}`);
  const { mark, userHabitCurrency } = useCurrencyOptions(() => setKey(`${row}_${col}_userCurrency'`));
  const BusinessComponent = (0, import_react9.useMemo)(() => {
    var _a;
    return (_a = typeOptions.find((item) => item.label === type)) == null ? void 0 : _a.component;
  }, [type]);
  function findDefaultType() {
    const list = [isGeneralPanel, isAccountingPanel, isCurrencyPanel, isDatePanel, isThousandthPercentilePanel];
    return list.reduce((pre, curFn, index) => pre || (curFn(defaultPattern) ? typeOptions[index].label : ""), "") || typeOptions[0].label;
  }
  const selectOptions = typeOptions.map((option) => ({
    label: option.label,
    value: option.label
  }));
  const handleSelect = (value) => {
    setType(value);
    nextTick(() => props.onChange({ type: "change", value: getCurrentPattern.current() || "" }));
  };
  const handleChange = (0, import_react9.useCallback)((v) => {
    props.onChange({ type: "change", value: v });
  }, []);
  const handleConfirm = () => {
    const pattern = getCurrentPattern.current() || "";
    const currency = getCurrencyType(pattern);
    if (currency) {
      mark(currency);
    }
    props.onChange({ type: "confirm", value: pattern });
  };
  const handleCancel = () => {
    props.onChange({ type: "cancel", value: "" });
  };
  const subProps = {
    onChange: handleChange,
    defaultValue,
    defaultPattern,
    action: getCurrentPattern
  };
  (0, import_react9.useEffect)(() => {
    setType(findDefaultType());
    setKey(`${row}_${col}`);
  }, [row, col]);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      className: clsx(`univer-flex univer-h-full univer-flex-col univer-justify-between univer-overflow-y-auto univer-pb-5`, scrollbarClassName),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-mt-3.5 univer-text-sm univer-text-gray-400", children: t("sheets-numfmt-ui.numfmtType") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "univer-mt-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Select, { className: "univer-w-full", value: type, options: selectOptions, onChange: handleSelect }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { children: BusinessComponent && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(UserHabitCurrencyContext.Provider, { value: userHabitCurrency, children: /* @__PURE__ */ (0, import_react10.createElement)(BusinessComponent, { ...subProps, key: key3 }) }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-mb-5 univer-mt-3.5 univer-flex univer-justify-end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { onClick: handleCancel, className: "univer-mr-3", children: t("sheets-numfmt-ui.cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { variant: "primary", onClick: handleConfirm, children: t("sheets-numfmt-ui.confirm") })
        ] })
      ]
    }
  );
};

// ../packages/sheets-numfmt-ui/src/controllers/numfmt.controller.ts
var SHEET_NUMFMT_PANEL = "SHEET_NUMFMT_PANEL";
var SheetNumfmtUIController = class extends Disposable {
  constructor(_sheetInterceptorService, _themeService, _univerInstanceService, _commandService, _selectionManagerService, _renderManagerService, _numfmtService, _componentManager, _sidebarService, _localeService, _sheetsNumfmtCellContentController) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_themeService", _themeService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_numfmtService", _numfmtService);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sheetsNumfmtCellContentController", _sheetsNumfmtCellContentController);
    /**
     * If _previewPattern is null ,the realTimeRenderingInterceptor will skip and if it is '',realTimeRenderingInterceptor will clear numfmt.
     * @private
     * @type {(string | null)}
     * @memberof NumfmtController
     */
    __publicField(this, "_previewPattern", "");
    __publicField(this, "_sidebarDisposable", null);
    this._initRealTimeRenderingInterceptor();
    this._initPanel();
    this._initCommands();
    this._initCloseListener();
    this._commandExecutedListener();
    this._initNumfmtLocalChange();
  }
  _initNumfmtLocalChange() {
    this.disposeWithMe(merge(this._sheetsNumfmtCellContentController.locale$, this._localeService.currentLocale$).subscribe(() => {
      this._forceUpdate();
    }));
  }
  openPanel() {
    var _a;
    const sidebarService = this._sidebarService;
    const selectionManagerService = this._selectionManagerService;
    const commandService = this._commandService;
    const univerInstanceService = this._univerInstanceService;
    const numfmtService = this._numfmtService;
    const localeService = this._localeService;
    const selections = ((_a = selectionManagerService.getCurrentSelections()) == null ? void 0 : _a.map((s) => s.range)) || [];
    const range = selections[0];
    if (!range) {
      return false;
    }
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const sheet = workbook.getActiveSheet();
    if (!sheet) {
      return false;
    }
    const cellValue = sheet.getCellRaw(range.startRow, range.startColumn);
    const numfmtValue = numfmtService.getValue(
      workbook.getUnitId(),
      sheet.getSheetId(),
      range.startRow,
      range.startColumn
    );
    let pattern = "";
    if (numfmtValue) {
      pattern = numfmtValue.pattern;
    }
    const defaultValue = (cellValue == null ? void 0 : cellValue.t) === 2 /* NUMBER */ ? cellValue.v : 12345678;
    const props = {
      onChange: (config) => {
        var _a2;
        if (config.type === "change") {
          this._previewPattern = config.value;
          this._forceUpdate();
        } else if (config.type === "confirm") {
          const selections2 = ((_a2 = selectionManagerService.getCurrentSelections()) == null ? void 0 : _a2.map((s) => s.range)) || [];
          const params = { values: [] };
          const patternType = getPatternType(config.value);
          selections2.forEach((rangeInfo) => {
            Range.foreach(rangeInfo, (row, col) => {
              params.values.push({
                row,
                col,
                pattern: config.value,
                type: patternType
              });
            });
          });
          commandService.executeCommand(SetNumfmtCommand.id, params);
          sidebarService.close();
        } else if (config.type === "cancel") {
          sidebarService.close();
        }
      },
      value: { defaultPattern: pattern, defaultValue, row: range.startRow, col: range.startColumn }
    };
    this._sidebarDisposable = sidebarService.open({
      header: { title: localeService.t("sheets-numfmt-ui.title") },
      children: {
        label: SHEET_NUMFMT_PANEL,
        ...props
        // need passthrough to react props.
      },
      onClose: () => {
        this._forceUpdate();
        commandService.executeCommand(CloseNumfmtPanelOperator.id);
      }
    });
    return true;
  }
  _forceUpdate(unitId) {
    var _a;
    const renderUnit = this._renderManagerService.getRenderById(
      unitId != null ? unitId : this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId()
    );
    renderUnit == null ? void 0 : renderUnit.with(SheetSkeletonManagerService).reCalculate();
    (_a = renderUnit == null ? void 0 : renderUnit.mainComponent) == null ? void 0 : _a.makeDirty();
  }
  _initCommands() {
    [
      OpenNumfmtPanelOperator,
      CloseNumfmtPanelOperator
    ].forEach((config) => {
      this.disposeWithMe(this._commandService.registerCommand(config));
    });
  }
  _initPanel() {
    this.disposeWithMe(
      this._componentManager.register(SHEET_NUMFMT_PANEL, SheetNumfmtPanel)
    );
  }
  // eslint-disable-next-line max-lines-per-function
  _initRealTimeRenderingInterceptor() {
    const isPanelOpenObserver = new Observable((subscriber) => {
      this._commandService.onCommandExecuted((commandInfo) => {
        if (commandInfo.id === OpenNumfmtPanelOperator.id) {
          subscriber.next(true);
        }
        if (commandInfo.id === CloseNumfmtPanelOperator.id) {
          subscriber.next(false);
        }
      });
    });
    const combineOpenAndSelection$ = combineLatest([
      isPanelOpenObserver,
      this._selectionManagerService.selectionMoveEnd$.pipe(
        map((selectionInfos) => {
          if (!selectionInfos) {
            return [];
          }
          return selectionInfos.map((selectionInfo) => selectionInfo.range);
        })
      )
    ]);
    this.disposeWithMe(
      toDisposable(
        combineOpenAndSelection$.pipe(
          switchMap(
            ([isOpen, selectionRanges]) => new Observable((subscribe) => {
              const disposableCollection = new DisposableCollection();
              isOpen && selectionRanges.length && subscribe.next({ selectionRanges, disposableCollection });
              return () => {
                disposableCollection.dispose();
              };
            })
          ),
          tap(() => {
            this._previewPattern = null;
          })
        ).subscribe(({ disposableCollection, selectionRanges }) => {
          var _a, _b;
          const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
          this.openPanel();
          disposableCollection.add(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
              priority: 99,
              effect: 2 /* Value */ | 1 /* Style */,
              handler: (cell, location, next) => {
                var _a2;
                const { row, col } = location;
                const defaultValue = next(cell) || {};
                if (selectionRanges.find(
                  (range) => range.startColumn <= col && range.endColumn >= col && range.startRow <= row && range.endRow >= row
                )) {
                  const rawValue = location.worksheet.getCellRaw(row, col);
                  const value = rawValue == null ? void 0 : rawValue.v;
                  const type = rawValue == null ? void 0 : rawValue.t;
                  if (value === void 0 || value === null || type !== 2 /* NUMBER */ || this._previewPattern === null) {
                    return defaultValue;
                  }
                  const info = getPatternPreviewIgnoreGeneral(this._previewPattern, value, this._sheetsNumfmtCellContentController.locale);
                  if (info.color) {
                    const color = (_a2 = this._themeService.getColorFromTheme(`${info.color}.500`)) != null ? _a2 : info.color;
                    return {
                      ...defaultValue,
                      v: info.result,
                      t: 1 /* STRING */,
                      s: { cl: { rgb: color } }
                    };
                  }
                  return {
                    ...defaultValue,
                    v: info.result,
                    t: 1 /* STRING */
                  };
                }
                return defaultValue;
              }
            })
          );
          (_b = (_a = this._renderManagerService.getRenderById(workbook.getUnitId())) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.makeDirty();
        })
      )
    );
  }
  _commandExecutedListener() {
    const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
    this.disposeWithMe(
      new Observable((subscribe) => {
        const disposable = this._commandService.onCommandExecuted((command) => {
          if (commandList.includes(command.id)) {
            const params = command.params;
            subscribe.next(params.unitId);
          }
        });
        return () => disposable.dispose();
      }).pipe(debounceTime(16)).subscribe((unitId) => this._forceUpdate(unitId))
    );
  }
  _initCloseListener() {
    this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe((unit) => {
      var _a;
      if (!unit) {
        (_a = this._sidebarDisposable) == null ? void 0 : _a.dispose();
        this._sidebarDisposable = null;
      }
    });
  }
};
SheetNumfmtUIController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(ThemeService)),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, Inject(SheetsSelectionsService)),
  __decorateParam(5, IRenderManagerService),
  __decorateParam(6, INumfmtService),
  __decorateParam(7, Inject(ComponentManager)),
  __decorateParam(8, ISidebarService),
  __decorateParam(9, Inject(LocaleService)),
  __decorateParam(10, Inject(SheetsNumfmtCellContentController))
], SheetNumfmtUIController);

// ../packages/sheets-numfmt-ui/src/controllers/numfmt.editor.controller.ts
var createCollectEffectMutation = () => {
  let list = [];
  const add = (unitId, subUnitId, row, col, value) => list.push({ unitId, subUnitId, row, col, value });
  const getEffects = () => list;
  const clean = () => {
    list = [];
  };
  return {
    add,
    getEffects,
    clean
  };
};
var NumfmtEditorController = class extends Disposable {
  constructor(_sheetInterceptorService, _numfmtService, _univerInstanceService, _injector, _editorBridgeService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_numfmtService", _numfmtService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    // collect effect mutations when edit end and push this to  commands stack in next commands progress
    __publicField(this, "_collectEffectMutation", createCollectEffectMutation());
    this._initInterceptorEditorStart();
    this._initInterceptorEditorEnd();
    this._initInterceptorCommands();
  }
  _initInterceptorEditorStart() {
    if (!this._editorBridgeService) {
      return;
    }
    this.disposeWithMe(
      toDisposable(
        this._sheetInterceptorService.writeCellInterceptor.intercept(BEFORE_CELL_EDIT, {
          handler: (value, context, next) => {
            const row = context.row;
            const col = context.col;
            const numfmtCell = this._numfmtService.getValue(
              context.unitId,
              context.subUnitId,
              row,
              col
            );
            if (numfmtCell) {
              const type = getPatternType(numfmtCell.pattern);
              switch (type) {
                /**
                 * For scientific, currency, grouped and number format, the editor should display the raw number value without format, unlike the cell render which display the formatted value.
                 */
                case "scientific":
                case "currency":
                case "grouped":
                case "number": {
                  const cell = { ...context.worksheet.getCellRaw(row, col) };
                  if ((cell == null ? void 0 : cell.t) === 2 /* NUMBER */ && isRealNum(cell.v)) {
                    cell.v = stripErrorMargin(Number(cell.v));
                  }
                  return next && next(cell);
                }
                /**
                 * For percent format, the editor should display the full percent value, unlike the cell render which display the limited decimal places.
                 * e.g. { v: 1.001234567, t: 2, s: { n: { pattern: '0.00%' } } } should display as '100.12%' in cell render, but when edit this cell, the editor should display '100.1234567%' rather than '100.12%'.
                 * If the editor also display '100.12%', will lose precision when before edit.
                 */
                case "percent": {
                  const cell = { ...context.worksheet.getCellRaw(row, col) };
                  if ((cell == null ? void 0 : cell.t) === 2 /* NUMBER */ && isRealNum(cell.v)) {
                    cell.v = `${stripErrorMargin(Number(cell.v) * 100)}%`;
                  }
                  return next && next(cell);
                }
                /**
                 * For date, time and datetime format, the editor should display the formatted value like the cell render.
                 */
                case "date":
                case "time":
                case "datetime":
                default: {
                  return next && next(value);
                }
              }
            }
            return next(value);
          }
        })
      )
    );
  }
  /**
   * Process the  values after  edit
   * @private
   * @memberof NumfmtService
   */
  // eslint-disable-next-line max-lines-per-function
  _initInterceptorEditorEnd() {
    this.disposeWithMe(
      toDisposable(
        this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
          // eslint-disable-next-line max-lines-per-function,complexity
          handler: (value, context, next) => {
            var _a, _b, _c;
            if (!(value == null ? void 0 : value.v) && !(value == null ? void 0 : value.p)) {
              return next(value);
            }
            this._collectEffectMutation.clean();
            const currentNumfmtValue = this._numfmtService.getValue(
              context.unitId,
              context.subUnitId,
              context.row,
              context.col
            );
            const originCell = context.worksheet.getCellRaw(context.row, context.col);
            if (isTextFormat(currentNumfmtValue == null ? void 0 : currentNumfmtValue.pattern) || value.t === 4 /* FORCE_STRING */) {
              return next(value);
            }
            const body = (_a = value.p) == null ? void 0 : _a.body;
            const content = ((_c = (_b = value == null ? void 0 : value.p) == null ? void 0 : _b.body) == null ? void 0 : _c.dataStream) ? value.p.body.dataStream.replace(/\r\n$/, "") : String(value.v);
            const numfmtInfo = getNumfmtParseValueFilter(content);
            if (body) {
              if (!canConvertRichTextToNumfmt(body)) {
                return next(value);
              } else {
                const { dataStream } = body;
                const dataStreamWithoutEnd = dataStream.replace(/\r\n$/, "");
                const num = Number(dataStreamWithoutEnd);
                if (Number.isNaN(num) && !numfmtInfo) {
                  return next(value);
                }
              }
            }
            if (numfmtInfo) {
              if (!numfmtInfo.z && !(currentNumfmtValue == null ? void 0 : currentNumfmtValue.pattern) && (originCell == null ? void 0 : originCell.t) !== 1 /* STRING */ && (originCell == null ? void 0 : originCell.t) !== 4 /* FORCE_STRING */ && willLoseNumericPrecision(content)) {
                return next({
                  ...value,
                  p: void 0,
                  v: content,
                  t: 4 /* FORCE_STRING */
                });
              }
              if (numfmtInfo.z && (!(currentNumfmtValue == null ? void 0 : currentNumfmtValue.pattern) || getPatternType(numfmtInfo.z) !== getPatternType(currentNumfmtValue.pattern))) {
                this._collectEffectMutation.add(
                  context.unitId,
                  context.subUnitId,
                  context.row,
                  context.col,
                  {
                    pattern: numfmtInfo.z
                  }
                );
              }
              const v = stripErrorMargin(Number(numfmtInfo.v), 16);
              return next({ ...value, p: void 0, v, t: 2 /* NUMBER */ });
            }
            return next(value);
          }
        })
      )
    );
  }
  _initInterceptorCommands() {
    const self = this;
    this.disposeWithMe(
      this._sheetInterceptorService.interceptCommand({
        getMutations(command) {
          var _a;
          switch (command.id) {
            case SetRangeValuesCommand.id: {
              const workbook = self._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
              const unitId = workbook.getUnitId();
              const subUnitId = (_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId();
              if (!subUnitId) {
                return {
                  redos: [],
                  undos: []
                };
              }
              const list = self._collectEffectMutation.getEffects();
              self._collectEffectMutation.clean();
              if (!list.length) {
                return {
                  redos: [],
                  undos: []
                };
              }
              const cells = list.filter((item) => {
                var _a2;
                return !!((_a2 = item.value) == null ? void 0 : _a2.pattern);
              }).map((item) => ({
                row: item.row,
                col: item.col,
                pattern: item.value.pattern
              }));
              const removeCells = list.filter((item) => {
                var _a2;
                return !((_a2 = item.value) == null ? void 0 : _a2.pattern);
              }).map((item) => ({
                startRow: item.row,
                endColumn: item.col,
                startColumn: item.col,
                endRow: item.row
              }));
              const redos = [];
              const undos = [];
              if (cells.length) {
                const redo = {
                  id: SetNumfmtMutation.id,
                  params: transformCellsToRange(unitId, subUnitId, cells)
                };
                redos.push(redo);
                undos.push(...factorySetNumfmtUndoMutation(self._injector, redo.params));
              }
              if (removeCells.length) {
                const redo = {
                  id: RemoveNumfmtMutation.id,
                  params: {
                    unitId,
                    subUnitId,
                    ranges: removeCells
                  }
                };
                redos.push(redo);
                undos.push(...factoryRemoveNumfmtUndoMutation(self._injector, redo.params));
              }
              return {
                redos,
                undos: undos.reverse()
              };
            }
          }
          return {
            redos: [],
            undos: []
          };
        }
      })
    );
  }
  dispose() {
    super.dispose();
    this._collectEffectMutation.clean();
  }
};
NumfmtEditorController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(INumfmtService)),
  __decorateParam(2, Inject(IUniverInstanceService)),
  __decorateParam(3, Inject(Injector)),
  __decorateParam(4, Optional(IEditorBridgeService))
], NumfmtEditorController);
function canConvertRichTextToNumfmt(body) {
  const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;
  const richTextStyle = ["va"];
  return !(textRuns.some((textRun) => {
    const hasRichTextStyle = Boolean(textRun.ts && Object.keys(textRun.ts).some((property) => {
      return richTextStyle.includes(property);
    }));
    return hasRichTextStyle;
  }) || paragraphs.some((paragraph) => paragraph.bullet) || paragraphs.length >= 2 || Boolean(customRanges == null ? void 0 : customRanges.length) || customBlocks.length > 0);
}

// ../packages/sheets-numfmt-ui/src/views/components/MoreNumfmtType.tsx
var import_react11 = __toESM(require_react());

// ../packages/sheets-numfmt-ui/src/menu/menu.ts
var MENU_OPTIONS = (currencySymbol) => {
  return [
    {
      label: "sheets-numfmt-ui.general",
      pattern: null
    },
    {
      label: "sheets-numfmt-ui.text",
      pattern: DEFAULT_TEXT_FORMAT_EXCEL
    },
    "|",
    {
      label: "sheets-numfmt-ui.number",
      pattern: "0"
    },
    {
      label: "sheets-numfmt-ui.percent",
      pattern: "0.00%"
    },
    {
      label: "sheets-numfmt-ui.scientific",
      pattern: "0.00E+00"
    },
    "|",
    {
      label: "sheets-numfmt-ui.accounting",
      pattern: `"${currencySymbol}" #,##0.00_);[Red]("${currencySymbol}"#,##0.00)`
    },
    {
      label: "sheets-numfmt-ui.financialValue",
      pattern: "#,##0.00;[Red]#,##0.00"
    },
    {
      label: "sheets-numfmt-ui.currency",
      pattern: `"${currencySymbol}"#,##0.00_);[Red]("${currencySymbol}"#,##0.00)`
    },
    {
      label: "sheets-numfmt-ui.roundingCurrency",
      pattern: `"${currencySymbol}"#,##0;[Red]"${currencySymbol}"#,##0`
    },
    "|",
    {
      label: "sheets-numfmt-ui.date",
      pattern: "yyyy-mm-dd;@"
    },
    {
      label: "sheets-numfmt-ui.time",
      pattern: 'am/pm h":"mm":"ss'
    },
    {
      label: "sheets-numfmt-ui.dateTime",
      pattern: "yyyy-m-d am/pm h:mm"
    },
    {
      label: "sheets-numfmt-ui.timeDuration",
      pattern: "h:mm:ss"
    },
    "|",
    {
      label: "sheets-numfmt-ui.moreFmt",
      pattern: ""
    }
  ];
};
var CurrencySymbolIconMenuItem = (accessor) => {
  return {
    icon: new Observable((subscribe) => {
      const localeService = accessor.get(LocaleService);
      subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
      return localeService.localeChanged$.subscribe(() => {
        subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
      });
    }),
    id: SetCurrencyCommand.id,
    title: "sheets-numfmt-ui.currency",
    tooltip: "sheets-numfmt-ui.currency",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};
var AddDecimalMenuItem = (accessor) => {
  return {
    icon: "AddDigitsIcon",
    id: AddDecimalCommand.id,
    title: "sheets-numfmt-ui.addDecimal",
    tooltip: "sheets-numfmt-ui.addDecimal",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};
var SubtractDecimalMenuItem = (accessor) => {
  return {
    icon: "ReduceDigitsIcon",
    id: SubtractDecimalCommand.id,
    title: "sheets-numfmt-ui.subtractDecimal",
    tooltip: "sheets-numfmt-ui.subtractDecimal",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};
var PercentMenuItem = (accessor) => {
  return {
    icon: "PercentIcon",
    id: SetPercentCommand.id,
    title: "sheets-numfmt-ui.percent",
    tooltip: "sheets-numfmt-ui.percent",
    type: 0 /* BUTTON */,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};
var FactoryOtherMenuItem = (accessor) => {
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const commandService = accessor.get(ICommandService);
  const localeService = accessor.get(LocaleService);
  const selectionManagerService = accessor.get(SheetsSelectionsService);
  const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
  const value$ = deriveStateFromActiveSheet$(
    univerInstanceService,
    "",
    ({ workbook, worksheet }) => new Observable(
      (subscribe) => merge(
        selectionManagerService.selectionMoveEnd$,
        fromCallback(commandService.onCommandExecuted.bind(commandService)).pipe(
          filter(([commandInfo]) => commandList.includes(commandInfo.id))
        )
      ).subscribe(() => {
        var _a, _b;
        const selections = selectionManagerService.getCurrentSelections();
        if (selections && selections[0]) {
          const range = selections[0].range;
          const row = range.startRow;
          const col = range.startColumn;
          const numfmtValue = (_b = workbook.getStyles().get((_a = worksheet.getCell(row, col)) == null ? void 0 : _a.s)) == null ? void 0 : _b.n;
          const pattern = numfmtValue == null ? void 0 : numfmtValue.pattern;
          const currencySymbol = getCurrencySymbolByLocale(localeService.getCurrentLocale());
          let value = localeService.t("sheets-numfmt-ui.general");
          if (isDefaultFormat(pattern)) {
            subscribe.next(value);
            return;
          }
          if (pattern) {
            const item = MENU_OPTIONS(currencySymbol).filter((item2) => typeof item2 === "object" && item2.pattern).find(
              (item2) => isPatternEqualWithoutDecimal(pattern, item2.pattern)
            );
            if (item && typeof item === "object" && item.pattern) {
              value = localeService.t(item.label);
            } else {
              value = localeService.t("sheets-numfmt-ui.moreFmt");
            }
          }
          subscribe.next(value);
        }
      })
    )
  );
  return {
    label: MORE_NUMFMT_TYPE_KEY,
    id: OpenNumfmtPanelOperator.id,
    tooltip: "sheets-numfmt-ui.title",
    type: 1 /* SELECTOR */,
    slot: true,
    selections: [{
      label: {
        name: OPTIONS_KEY,
        hoverable: false,
        selectable: false
      }
    }],
    value$,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};

// ../packages/sheets-numfmt-ui/src/views/components/MoreNumfmtType.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var MORE_NUMFMT_TYPE_KEY = "sheets-numfmt-ui.moreNumfmtType";
var OPTIONS_KEY = "sheets-numfmt-ui.moreNumfmtType.options";
function MoreNumfmtType(props) {
  const { value } = props;
  const localeService = useDependency(LocaleService);
  const text = value != null ? value : localeService.t("sheets-numfmt-ui.general");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "univer-text-sm", children: text });
}
function Options() {
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const layoutService = useDependency(ILayoutService);
  const sheetsNumfmtCellContentController = useDependency(SheetsNumfmtCellContentController);
  const selectionManagerService = useDependency(SheetsSelectionsService);
  const setNumfmt = (pattern) => {
    const selection = selectionManagerService.getCurrentLastSelection();
    if (!selection) {
      return;
    }
    const range = selection.range;
    const values = [];
    Range.foreach(range, (row, col) => {
      if (pattern) {
        values.push({ row, col, pattern, type: getPatternType(pattern) });
      } else {
        values.push({ row, col });
      }
    });
    commandService.executeCommand(SetNumfmtCommand.id, { values });
    layoutService.focus();
  };
  const menuOptions = (0, import_react11.useMemo)(() => {
    const currencySymbol = localeCurrencySymbolMap.get(localeService.getCurrentLocale());
    return MENU_OPTIONS(currencySymbol);
  }, [localeService]);
  const handleClick = (index) => {
    if (index === 0) {
      setNumfmt(null);
    } else if (index === menuOptions.length - 1) {
      commandService.executeCommand(OpenNumfmtPanelOperator.id);
      layoutService.focus();
    } else {
      const item = menuOptions[index];
      item.pattern && setNumfmt(item.pattern);
    }
  };
  const defaultValue = 1220;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "univer-grid univer-gap-1 univer-p-1.5", children: menuOptions.map((item, index) => {
    if (item === "|") {
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Separator, {}, index);
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "div",
      {
        className: `univer-flex univer-h-7 univer-cursor-default univer-items-center univer-justify-between univer-gap-6 univer-rounded univer-px-2 univer-text-sm hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
        onClick: () => handleClick(index),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: localeService.t(item.label) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "span",
            {
              className: `univer-text-xs univer-text-gray-500 dark:!univer-text-gray-400`,
              children: item.pattern ? getPatternPreview(item.pattern || "", defaultValue, sheetsNumfmtCellContentController.locale).result.trim() : ""
            }
          )
        ]
      },
      index
    );
  }) });
}

// ../packages/sheets-numfmt-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.start.layout" /* LAYOUT */]: {
    [OpenNumfmtPanelOperator.id]: {
      order: 9,
      menuItemFactory: FactoryOtherMenuItem
    },
    [SetPercentCommand.id]: {
      order: 9.1,
      menuItemFactory: PercentMenuItem
    },
    [SetCurrencyCommand.id]: {
      order: 9.2,
      menuItemFactory: CurrencySymbolIconMenuItem
    },
    [AddDecimalCommand.id]: {
      order: 9.3,
      menuItemFactory: AddDecimalMenuItem
    },
    [SubtractDecimalCommand.id]: {
      order: 9.4,
      menuItemFactory: SubtractDecimalMenuItem
    }
  }
};

// ../packages/sheets-numfmt-ui/src/menu/numfmt.menu.controller.ts
var NumfmtMenuController = class extends Disposable {
  constructor(_componentManager, _menuManagerService) {
    super();
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_menuManagerService", _menuManagerService);
    this._initMenu();
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema);
    [
      [MORE_NUMFMT_TYPE_KEY, MoreNumfmtType],
      [OPTIONS_KEY, Options]
    ].forEach(([key3, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key3, comp)
      );
    });
  }
};
NumfmtMenuController = __decorateClass([
  __decorateParam(0, Inject(ComponentManager)),
  __decorateParam(1, IMenuManagerService)
], NumfmtMenuController);

// ../packages/sheets-numfmt-ui/src/plugin.ts
var UniverSheetsNumfmtUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService, _renderManagerService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig("sheets-numfmt-ui.config", rest);
  }
  onStarting() {
    registerDependencies(this._injector, [
      [SheetNumfmtUIController],
      [NumfmtEditorController],
      [UserHabitController],
      [NumfmtMenuController],
      [NumfmtRepeatLastActionController]
    ]);
  }
  onRendered() {
    this._registerRenderModules();
    touchDependencies(this._injector, [
      [SheetNumfmtUIController],
      [NumfmtEditorController],
      [NumfmtMenuController],
      [NumfmtRepeatLastActionController]
    ]);
  }
  _registerRenderModules() {
    const modules = [
      [NumfmtAlertRenderController]
    ];
    modules.forEach((m) => {
      this.disposeWithMe(this._renderManagerService.registerRenderModule(2 /* UNIVER_SHEET */, m));
    });
  }
};
__publicField(UniverSheetsNumfmtUIPlugin, "pluginName", "SHEET_NUMFMT_UI_PLUGIN");
__publicField(UniverSheetsNumfmtUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsNumfmtUIPlugin, "version", package_default.version);
__publicField(UniverSheetsNumfmtUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsNumfmtUIPlugin = __decorateClass([
  DependentOn(UniverSheetsUIPlugin, UniverSheetsNumfmtPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService),
  __decorateParam(3, IRenderManagerService)
], UniverSheetsNumfmtUIPlugin);

export {
  UniverSheetsNumfmtUIPlugin
};
