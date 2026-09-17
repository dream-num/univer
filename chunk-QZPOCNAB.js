import {
  AddCfCommand,
  AddConditionalRuleMutation,
  AddConditionalRuleMutationUndoFactory,
  CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH,
  ClearRangeCfCommand,
  ClearWorksheetCfCommand,
  ConditionalFormattingRuleModel,
  ConditionalFormattingService,
  ConditionalFormattingViewModel,
  DEFAULT_BG_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_PADDING,
  DEFAULT_WIDTH,
  DeleteCfCommand,
  DeleteConditionalRuleMutation,
  DeleteConditionalRuleMutationUndoFactory,
  MoveCfCommand,
  MoveConditionalRuleMutation,
  SHEET_CONDITIONAL_FORMATTING_PLUGIN,
  SetCfCommand,
  SetConditionalRuleMutation,
  UniverSheetsConditionalFormattingPlugin,
  compareWithNumber,
  createCfId,
  createDefaultRule,
  createDefaultValue,
  createDefaultValueByValueType,
  defaultDataBarNativeColor,
  defaultDataBarPositiveColor,
  getColorScaleFromValue,
  getOppositeOperator,
  iconGroup,
  iconMap,
  removeUndefinedAttr,
  setConditionalRuleMutationUndoFactory
} from "./chunk-VEA4DFFB.js";
import {
  ClearSheetsFilterCriteriaCommand,
  FILTER_MUTATIONS,
  ReCalcSheetsFilterCommand,
  ReCalcSheetsFilterMutation,
  RemoveSheetsFilterMutation,
  SetSheetsFilterCriteriaCommand,
  SetSheetsFilterCriteriaMutation,
  SetSheetsFilterRangeMutation,
  SheetsFilterService,
  SheetsFilterSyncController,
  SmartToggleSheetsFilterCommand,
  UniverSheetsFilterPlugin
} from "./chunk-ESCGSVMK.js";
import {
  FormulaEditor,
  RangeSelector
} from "./chunk-DMIB6PSO.js";
import {
  getPatternType
} from "./chunk-LZWJIT7W.js";
import {
  AutoHeightController,
  CellAlertManagerService,
  HoverManagerService,
  IEditorBridgeService,
  IFormatPainterService,
  IMarkSelectionService,
  ISheetCellDropdownManagerService,
  ISheetClipboardService,
  ISheetSelectionRenderService,
  PREDEFINED_HOOK_NAME_PASTE,
  SelectionControl,
  SetCellEditVisibleOperation,
  SheetCanvasPopManagerService,
  SheetSkeletonManagerService,
  SheetsRenderService,
  getCoordByCell,
  getCurrentRangeDisable$,
  getObservableWithExclusiveRange$,
  getRepeatRange,
  useHighlightRange,
  virtualizeDiscreteRanges,
  whenSheetEditorFocused
} from "./chunk-BHQGV2VJ.js";
import {
  AddSheetDataValidationCommand,
  BASE_FORMULA_INPUT_NAME,
  CHECKBOX_FORMULA_1,
  CHECKBOX_FORMULA_2,
  CHECKBOX_FORMULA_INPUT_NAME,
  CUSTOM_FORMULA_INPUT_NAME,
  DATA_VALIDATION_PLUGIN_NAME,
  DataValidationCacheService,
  DataValidationFormulaController,
  DataValidationFormulaService,
  DataValidationModel,
  DataValidatorRegistryService,
  LIST_FORMULA_INPUT_NAME,
  RemoveSheetAllDataValidationCommand,
  RemoveSheetDataValidationCommand,
  SheetDataValidationModel,
  SheetsDataValidationValidatorService,
  TWO_FORMULA_OPERATOR_COUNT,
  UniverSheetsDataValidationPlugin,
  UpdateSheetDataValidationOptionsCommand,
  UpdateSheetDataValidationRangeCommand,
  UpdateSheetDataValidationSettingCommand,
  createDefaultNewRule,
  getCellValueOrigin,
  getDataValidationCellValue,
  getDataValidationDiffMutations,
  getFormulaResult,
  getRuleOptions,
  getRuleSetting,
  isLegalFormulaResult,
  transformCheckboxValue
} from "./chunk-7ZOWWEOA.js";
import {
  AIcon,
  BanIcon,
  BoldIcon,
  Button,
  Checkbox,
  ColorPicker,
  ComponentContainer,
  ComponentManager,
  DataValidationIcon,
  DeleteIcon,
  DraggableList,
  Dropdown,
  FilterIcon,
  FontColorDoubleIcon,
  FormLayout,
  IDialogService,
  ILayoutService,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  ISidebarService,
  IZenZoneService,
  IncreaseIcon,
  InfoIcon,
  Input,
  InputNumber,
  ItalicIcon,
  MoreDownIcon,
  MoreUpIcon,
  PaintBucketDoubleIcon,
  Radio,
  RadioGroup,
  Segmented,
  Select,
  SequenceIcon,
  SlashDoubleIcon,
  StrikethroughIcon,
  SuccessIcon,
  Switch,
  Tooltip,
  Tree,
  UnderlineIcon,
  borderClassName,
  clsx,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  useComponentsOfPart,
  useDependency,
  useEvent,
  useObservable,
  useScrollYOverContainer,
  useSidebarClick
} from "./chunk-VNXQUZSG.js";
import {
  FormulaRefRangeService,
  UniverSheetsFormulaPlugin
} from "./chunk-YVPSS3XX.js";
import {
  AFTER_CELL_EDIT,
  ClearSelectionAllCommand,
  ClearSelectionFormatCommand,
  IAutoFillService,
  INTERCEPTOR_POINT,
  IRPCChannelService,
  RangeMergeUtil,
  RangeProtectionPermissionEditPoint,
  RangeProtectionPermissionViewPoint,
  RefRangeService,
  RemoveSheetMutation,
  SetRangeValuesCommand,
  SetRangeValuesMutation,
  SetSelectionsOperation,
  SetWorksheetActiveOperation,
  SheetInterceptorService,
  SheetPermissionCheckController,
  SheetsSelectionsService,
  VALIDATE_CELL,
  WorkbookEditablePermission,
  WorksheetEditPermission,
  WorksheetFilterPermission,
  WorksheetSetCellStylePermission,
  WorksheetViewPermission,
  attachSelectionWithCoord,
  checkRangesEditablePermission,
  createTopMatrixFromMatrix,
  deserializeListOptions,
  deserializeRangeWithSheet,
  expandToContinuousRange,
  findAllRectangle,
  fromModule,
  getSheetCommandTarget,
  rangeToDiscreteRange,
  serializeListOptions,
  serializeRange,
  setEndForRange,
  toModule,
  tools_default
} from "./chunk-Q6Y4PHRI.js";
import {
  COLOR_BLACK_RGB,
  CheckboxShape,
  DocSimpleSkeleton,
  FontCache,
  IRenderManagerService,
  Rect,
  Shape,
  Text,
  Transform,
  fixLineWidthByScale,
  getCurrentTypeOfRenderer,
  getFontStyleString
} from "./chunk-XOCU2XR6.js";
import {
  BehaviorSubject,
  ColorKit,
  DEFAULT_STYLES,
  DependentOn,
  Disposable,
  DisposableCollection,
  ICommandService,
  IConfigService,
  IContextService,
  ILogService,
  IUniverInstanceService,
  Inject,
  Injector,
  InterceptorManager,
  LocaleService,
  ObjectMatrix,
  Observable,
  Optional,
  Plugin,
  Quantity,
  Range,
  Rectangle,
  RedoCommand,
  ReplaySubject,
  RxDisposable,
  Subject,
  ThemeService,
  Tools,
  UndoCommand,
  awaitTime,
  bufferDebounceTime,
  bufferTime,
  combineLatest,
  createIdentifier,
  createInterceptorKey,
  dateKit,
  debounceTime,
  debounce_default,
  distinctUntilChanged,
  extractPureTextFromCell,
  filter,
  fromCallback,
  generateRandomId,
  get_default,
  isFormulaString,
  isNumeric,
  isUnitRangesEqual,
  lib_exports,
  map,
  merge,
  merge_default,
  of,
  queryObjectMatrix,
  registerDependencies,
  sequenceExecute,
  set_default,
  shallowEqual,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
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

// ../packages/sheets-conditional-formatting-ui/package.json
var package_default = {
  name: "@univerjs/sheets-conditional-formatting-ui",
  version: "0.25.2",
  private: false,
  description: "Conditional formatting UI for Univer Sheets.",
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
    "conditional-formatting",
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
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-conditional-formatting": "workspace:*",
    "@univerjs/sheets-formula": "workspace:*",
    "@univerjs/sheets-formula-ui": "workspace:*",
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

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-average-cf.command.ts
var AddAverageCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-average-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue, operator } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "average" /* average */,
        operator,
        style
      }
    };
    const result = commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
    return result;
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-color-scale-cf.command.ts
var AddColorScaleConditionalRuleCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-color-scale-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, config, stopIfTrue } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "colorScale" /* colorScale */,
        config
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-data-bar-cf.command.ts
var AddDataBarConditionalRuleCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-data-bar-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, min, max, nativeColor, positiveColor, isGradient, stopIfTrue, isShowValue } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const commandService = accessor.get(ICommandService);
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "dataBar" /* dataBar */,
        isShowValue,
        config: {
          min,
          max,
          nativeColor,
          positiveColor,
          isGradient
        }
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-duplicate-values-cf.command.ts
var AddDuplicateValuesCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-duplicate-values-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "duplicateValues" /* duplicateValues */,
        style
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-number-cf.command.ts
var AddNumberCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-number-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue, operator, value } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    let rule;
    if (["between" /* between */, "notBetween" /* notBetween */].includes(operator)) {
      const _value = value;
      if (_value.length !== 2 || !Array.isArray(_value)) {
        return false;
      }
      rule = {
        ranges,
        cfId,
        stopIfTrue: !!stopIfTrue,
        rule: {
          type: "highlightCell" /* highlightCell */,
          subType: "number" /* number */,
          operator,
          style,
          value: _value
        }
      };
    } else {
      const _value = value;
      if (typeof _value !== "number") {
        return false;
      }
      rule = {
        ranges,
        cfId,
        stopIfTrue: !!stopIfTrue,
        rule: {
          type: "highlightCell" /* highlightCell */,
          subType: "number" /* number */,
          operator,
          style,
          value: _value
        }
      };
    }
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-rank-cf.command.ts
var AddRankCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-rank-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue, isPercent, isBottom, value } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "rank" /* rank */,
        isPercent,
        isBottom,
        style,
        value
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-text-cf.command.ts
var AddTextCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-text-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue, operator, value } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const commandService = accessor.get(ICommandService);
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "text" /* text */,
        operator,
        style,
        value
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-time-period-cf.command.ts
var AddTimePeriodCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-time-period-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue, operator } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "timePeriod" /* timePeriod */,
        operator,
        style
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/commands/commands/add-unique-values-cf.command.ts
var AddUniqueValuesCfCommand = {
  type: 0 /* COMMAND */,
  id: "sheet.command.add-uniqueValues-conditional-rule",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ranges, style, stopIfTrue } = params;
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
    const rule = {
      ranges,
      cfId,
      stopIfTrue: !!stopIfTrue,
      rule: {
        type: "highlightCell" /* highlightCell */,
        subType: "uniqueValues" /* uniqueValues */,
        style
      }
    };
    return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule });
  }
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/index.tsx
var import_react12 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/index.tsx
var import_react10 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/ColorScale.tsx
var import_react3 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/components/color-picker/index.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var ColorPicker2 = (props) => {
  const { color, onChange, disable = false, Icon = PaintBucketDoubleIcon, className } = props;
  const colorKit = (0, import_react.useMemo)(() => new ColorKit(color), [color]);
  const renderIcon = () => {
    const iconProps = {
      className: clsx("univer-fill-primary-600", disable && className),
      extend: { colorChannel1: colorKit.isValid ? color : "" }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { ...iconProps });
  };
  return !disable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Dropdown,
    {
      overlay: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-rounded-lg univer-p-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorPicker, { value: color, onChange }) }),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: clsx(`univer-flex univer-cursor-pointer univer-items-center univer-rounded univer-p-1 hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`, className),
          children: renderIcon()
        }
      )
    }
  ) : renderIcon();
};

// ../packages/sheets-conditional-formatting-ui/src/components/preview/index.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var Preview = (props) => {
  var _a, _b, _c, _d, _e;
  const rule = props.rule;
  if (!rule) return null;
  const colorList = (0, import_react2.useMemo)(() => {
    if (rule.type === "colorScale" /* colorScale */) {
      const config = rule.config.map((c, index) => ({ color: new ColorKit(c.color), value: index }));
      const maxValue = config.length - 1;
      const valueList = new Array(5).fill("").map((_v, index, arr) => index * maxValue / (arr.length - 1));
      return valueList.map((value) => getColorScaleFromValue(config, value));
    }
    return null;
  }, [rule]);
  const iconSet = (0, import_react2.useMemo)(() => {
    if (rule.type === "iconSet" /* iconSet */) {
      return rule.config.map((item) => {
        const iconList = iconMap[item.iconType];
        return iconList && iconList[Number(item.iconId)];
      });
    }
  }, [rule]);
  const previewClassName2 = "univer-pointer-events-none univer-flex univer-h-5 univer-min-w-[72px] univer-items-center univer-justify-center univer-text-xs";
  switch (rule.type) {
    case "dataBar" /* dataBar */: {
      const { isGradient } = rule.config;
      const positiveColor = isGradient ? `linear-gradient(to right, ${rule.config.positiveColor || defaultDataBarPositiveColor}, rgb(255 255 255))` : rule.config.positiveColor;
      const nativeColor = isGradient ? `linear-gradient(to right,  rgb(255 255 255),${rule.config.nativeColor || defaultDataBarNativeColor})` : rule.config.nativeColor;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: previewClassName2, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: "univer-h-full univer-w-1/2 univer-border univer-border-solid",
            style: {
              background: nativeColor,
              borderColor: (_a = rule.config.nativeColor) != null ? _a : defaultDataBarNativeColor
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            className: "univer-h-full univer-w-1/2 univer-border univer-border-solid",
            style: {
              background: positiveColor,
              borderColor: (_b = rule.config.positiveColor) != null ? _b : defaultDataBarPositiveColor
            }
          }
        )
      ] });
    }
    case "colorScale" /* colorScale */: {
      return colorList && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: previewClassName2, children: colorList.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          className: "univer-h-full",
          style: { width: `${100 / colorList.length}%`, background: item }
        },
        index
      )) });
    }
    case "iconSet" /* iconSet */: {
      return iconSet && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: previewClassName2, children: iconSet.map((base64, index) => base64 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { className: "univer-h-full", src: base64, draggable: false }, index) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SlashDoubleIcon, {}, index)) });
    }
    case "highlightCell" /* highlightCell */: {
      const { ul, st, it, bl, bg, cl } = rule.style;
      const isUnderline = (ul == null ? void 0 : ul.s) === 1 /* TRUE */;
      const isStrikethrough = (st == null ? void 0 : st.s) === 1 /* TRUE */;
      const isItalic = it === 1 /* TRUE */;
      const isBold = bl === 1 /* TRUE */;
      const bgColor = (_c = bg == null ? void 0 : bg.rgb) != null ? _c : DEFAULT_BG_COLOR;
      const fontColor = (_d = cl == null ? void 0 : cl.rgb) != null ? _d : DEFAULT_FONT_COLOR;
      const style = {
        textDecoration: (_e = `${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.replace(/^ /, "")) != null ? _e : void 0,
        backgroundColor: bgColor,
        color: fontColor
      };
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          className: clsx(previewClassName2, {
            "univer-font-bold": isBold,
            "univer-italic": isItalic
          }),
          style,
          children: "123"
        }
      );
    }
  }
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/styles.ts
var previewClassName = clsx("univer-mt-5 univer-px-1 univer-py-2 univer-rounded", borderClassName);

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/ColorScale.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var createOptionItem = (text, localeService) => ({ label: localeService.t(`sheets-conditional-formatting-ui.valueType.${text}`), value: text });
var TextInput = (props) => {
  var _a;
  const { type, className, onChange, id, value } = props;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const unitId = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
  const subUnitId = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
  const formulaInitValue = (0, import_react3.useMemo)(() => {
    return String(value).startsWith("=") ? String(value) : "=";
  }, [value]);
  const config = (0, import_react3.useMemo)(() => {
    if (["max" /* max */, "min" /* min */, "none"].includes(type)) {
      return { disabled: true };
    }
    if (["percent" /* percent */, "percentile" /* percentile */].includes(type)) {
      return {
        min: 0,
        max: 100
      };
    }
    return {
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER
    };
  }, [type]);
  const formulaEditorRef = (0, import_react3.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react3.useState)(false);
  useSidebarClick((e) => {
    var _a2;
    const isOutSide = (_a2 = formulaEditorRef.current) == null ? void 0 : _a2.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  if (type === "formula" /* formula */) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-ml-1 univer-w-full", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      FormulaEditor,
      {
        ref: formulaEditorRef,
        className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
        initValue: formulaInitValue,
        unitId,
        subUnitId,
        isFocus: isFocusFormulaEditor,
        onChange: (v = "") => {
          const formula = v || "";
          onChange(formula);
        },
        onFocus: () => setIsFocusFormulaEditor(true)
      }
    ) });
  } else {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InputNumber, { className, value: Number(props.value) || 0, onChange: (v) => props.onChange(v || 0), ...config });
  }
};
var ColorScaleStyleEditor = (props) => {
  var _a;
  const { interceptorManager } = props;
  const localeService = useDependency(LocaleService);
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "colorScale" /* colorScale */ ? props.rule : void 0;
  const commonOptions = [createOptionItem("num" /* num */, localeService), createOptionItem("percent" /* percent */, localeService), createOptionItem("percentile" /* percentile */, localeService), createOptionItem("formula" /* formula */, localeService)];
  const minOptions = [createOptionItem("min" /* min */, localeService), ...commonOptions];
  const medianOptions = [createOptionItem("none", localeService), ...commonOptions];
  const maxOptions = [createOptionItem("max" /* max */, localeService), ...commonOptions];
  const [minType, setMinType] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "min" /* min */;
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config[0]) == null ? void 0 : _a2.value.type) || defaultV;
  });
  const [medianType, setMedianType] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "none";
    if (!rule) {
      return defaultV;
    }
    if (rule.config.length !== 3) {
      return defaultV;
    }
    return ((_a2 = rule.config[1]) == null ? void 0 : _a2.value.type) || defaultV;
  });
  const [maxType, setMaxType] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "max" /* max */;
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config[rule.config.length - 1]) == null ? void 0 : _a2.value.type) || defaultV;
  });
  const [minValue, setMinValue] = (0, import_react3.useState)(() => {
    const defaultV = 10;
    if (!rule) {
      return defaultV;
    }
    const valueConfig = rule.config[0];
    return (valueConfig == null ? void 0 : valueConfig.value.value) === void 0 ? defaultV : valueConfig == null ? void 0 : valueConfig.value.value;
  });
  const [medianValue, setMedianValue] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = 50;
    if (!rule) {
      return defaultV;
    }
    if (rule.config.length !== 3) {
      return defaultV;
    }
    const v = (_a2 = rule.config[1]) == null ? void 0 : _a2.value.value;
    return v === void 0 ? defaultV : v;
  });
  const [maxValue, setMaxValue] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = 90;
    if (!rule) {
      return defaultV;
    }
    const v = (_a2 = rule.config[rule.config.length - 1]) == null ? void 0 : _a2.value.value;
    return v === void 0 ? defaultV : v;
  });
  const [minColor, setMinColor] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "#d0d9fb";
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config[0]) == null ? void 0 : _a2.color) || defaultV;
  });
  const [medianColor, setMedianColor] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "#7790f3";
    if (!rule) {
      return defaultV;
    }
    if (rule.config.length !== 3) {
      return defaultV;
    }
    return ((_a2 = rule.config[1]) == null ? void 0 : _a2.color) || defaultV;
  });
  const [maxColor, setMaxColor] = (0, import_react3.useState)(() => {
    var _a2;
    const defaultV = "#2e55ef";
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config[rule.config.length - 1]) == null ? void 0 : _a2.color) || defaultV;
  });
  const getResult = (0, import_react3.useMemo)(() => (option) => {
    const { minType: minType2, medianType: medianType2, maxType: maxType2, minValue: minValue2, medianValue: medianValue2, maxValue: maxValue2, minColor: minColor2, medianColor: medianColor2, maxColor: maxColor2 } = option;
    const list = [];
    list.push({ color: minColor2, value: { type: minType2, value: minValue2 } });
    medianType2 !== "none" && list.push({ color: medianColor2, value: { type: medianType2, value: medianValue2 } });
    list.push({ color: maxColor2, value: { type: maxType2, value: maxValue2 } });
    const config = list.map((item, index) => ({ ...item, index }));
    return { config, type: "colorScale" /* colorScale */ };
  }, []);
  (0, import_react3.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        return getResult({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor });
      }
    });
    return dispose;
  }, [getResult, minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor, interceptorManager]);
  const handleChange = (option) => {
    props.onChange(getResult(option));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: previewClassName, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Preview, { rule: getResult({ minType, medianType, maxType, minValue, medianValue, maxValue, minColor, medianColor, maxColor }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-mt-3 univer-text-xs univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.valueType.min")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-3 univer-flex univer-h-8 univer-items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Select,
        {
          className: "univer-flex-shrink-0",
          options: minOptions,
          value: minType,
          onChange: (v) => {
            setMinType(v);
            const value = createDefaultValueByValueType(v, 10);
            setMinValue(value);
            handleChange({
              minType: v,
              medianType,
              maxType,
              minValue: value,
              medianValue,
              maxValue,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        TextInput,
        {
          id: "min",
          className: "univer-ml-1",
          value: minValue,
          type: minType,
          onChange: (v) => {
            setMinValue(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue: v,
              medianValue,
              maxValue,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        ColorPicker2,
        {
          className: "univer-ml-1",
          color: minColor,
          onChange: (v) => {
            setMinColor(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue,
              medianValue,
              maxValue,
              minColor: v,
              medianColor,
              maxColor
            });
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-mt-3 univer-text-xs univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.medianValue")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-3 univer-flex univer-h-8 univer-items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Select,
        {
          className: "univer-flex-shrink-0",
          options: medianOptions,
          value: medianType,
          onChange: (v) => {
            setMedianType(v);
            const value = createDefaultValueByValueType(v, 50);
            setMedianValue(value);
            handleChange({
              minType,
              medianType: v,
              maxType,
              minValue,
              medianValue: value,
              maxValue,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        TextInput,
        {
          id: "median",
          className: "univer-ml-1",
          value: medianValue,
          type: medianType,
          onChange: (v) => {
            setMedianValue(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue,
              medianValue: v,
              maxValue,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      medianType !== "none" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        ColorPicker2,
        {
          className: "univer-ml-1",
          color: medianColor,
          onChange: (v) => {
            setMedianColor(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue,
              medianValue,
              maxValue,
              minColor,
              medianColor: v,
              maxColor
            });
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        className: `univer-mt-3 univer-text-xs univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.valueType.max")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-3 univer-flex univer-h-8 univer-items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Select,
        {
          className: "univer-flex-shrink-0",
          options: maxOptions,
          value: maxType,
          onChange: (v) => {
            setMaxType(v);
            const value = createDefaultValueByValueType(v, 90);
            setMaxValue(value);
            handleChange({
              minType,
              medianType,
              maxType: v,
              minValue,
              medianValue,
              maxValue: value,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        TextInput,
        {
          id: "max",
          className: "univer-ml-1",
          value: maxValue,
          type: maxType,
          onChange: (v) => {
            setMaxValue(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue,
              medianValue,
              maxValue: v,
              minColor,
              medianColor,
              maxColor
            });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        ColorPicker2,
        {
          className: "univer-ml-1",
          color: maxColor,
          onChange: (v) => {
            setMaxColor(v);
            handleChange({
              minType,
              medianType,
              maxType,
              minValue,
              medianValue,
              maxValue,
              minColor,
              medianColor,
              maxColor: v
            });
          }
        }
      )
    ] })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/DataBar.tsx
var import_react4 = __toESM(require_react());
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
var createOptionItem2 = (text, localeService) => ({ label: localeService.t(`sheets-conditional-formatting-ui.valueType.${text}`), value: text });
var InputText = (props) => {
  var _a;
  const { onChange, className, value, type, id, disabled = false } = props;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const unitId = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
  const subUnitId = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
  const formulaEditorRef = (0, import_react4.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react4.useState)(false);
  useSidebarClick((e) => {
    var _a2;
    const isOutSide = (_a2 = formulaEditorRef.current) == null ? void 0 : _a2.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  const _value = (0, import_react4.useRef)(value);
  const config = (0, import_react4.useMemo)(() => {
    if (["percentile" /* percentile */, "percent" /* percent */].includes(type)) {
      return {
        max: 100,
        min: 0
      };
    }
    return {
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER
    };
  }, [type]);
  if (type === "formula" /* formula */) {
    const v = String(_value.current).startsWith("=") ? String(_value.current) || "" : "=";
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-ml-3 univer-w-full", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      FormulaEditor,
      {
        ref: formulaEditorRef,
        className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
        initValue: v,
        unitId,
        subUnitId,
        isFocus: isFocusFormulaEditor,
        onChange: (v2 = "") => {
          const formula = v2 || "";
          onChange(formula);
        },
        onFocus: () => setIsFocusFormulaEditor(true)
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    InputNumber,
    {
      className,
      value: Number(value) || 0,
      disabled,
      onChange: (v) => {
        onChange(v || 0);
      },
      ...config
    }
  );
};
var DataBarStyleEditor = (props) => {
  var _a;
  const { interceptorManager } = props;
  const localeService = useDependency(LocaleService);
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "dataBar" /* dataBar */ ? props.rule : void 0;
  const [isGradient, setIsGradient] = (0, import_react4.useState)(() => {
    var _a2;
    const defaultV = "0";
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config) == null ? void 0 : _a2.isGradient) ? "1" : "0";
  });
  const [positiveColor, setPositiveColor] = (0, import_react4.useState)(() => {
    var _a2;
    if (!rule) {
      return defaultDataBarPositiveColor;
    }
    return ((_a2 = rule.config) == null ? void 0 : _a2.positiveColor) || defaultDataBarPositiveColor;
  });
  const [nativeColor, setNativeColor] = (0, import_react4.useState)(() => {
    var _a2;
    if (!rule) {
      return defaultDataBarNativeColor;
    }
    return ((_a2 = rule.config) == null ? void 0 : _a2.nativeColor) || defaultDataBarNativeColor;
  });
  const commonOptions = [
    createOptionItem2("num" /* num */, localeService),
    createOptionItem2("percent" /* percent */, localeService),
    createOptionItem2("percentile" /* percentile */, localeService),
    createOptionItem2("formula" /* formula */, localeService)
  ];
  const minOptions = [createOptionItem2("min" /* min */, localeService), ...commonOptions];
  const maxOptions = [createOptionItem2("max" /* max */, localeService), ...commonOptions];
  const [minValueType, setMinValueType] = (0, import_react4.useState)(() => {
    var _a2;
    const defaultV = minOptions[0].value;
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config) == null ? void 0 : _a2.min.type) || defaultV;
  });
  const [maxValueType, setMaxValueType] = (0, import_react4.useState)(() => {
    var _a2;
    const defaultV = maxOptions[0].value;
    if (!rule) {
      return defaultV;
    }
    return ((_a2 = rule.config) == null ? void 0 : _a2.max.type) || defaultV;
  });
  const [minValue, setMinValue] = (0, import_react4.useState)(() => {
    var _a2;
    const defaultV = 0;
    if (!rule) {
      return defaultV;
    }
    const value = ((_a2 = rule.config) == null ? void 0 : _a2.min) || {};
    if (value.type === "formula" /* formula */) {
      return value.value || "=";
    }
    return value.value || defaultV;
  });
  const [maxValue, setMaxValue] = (0, import_react4.useState)(() => {
    var _a2;
    const defaultV = 100;
    if (!rule) {
      return defaultV;
    }
    const value = ((_a2 = rule.config) == null ? void 0 : _a2.max) || {};
    if (value.type === "formula" /* formula */) {
      return value.value || "=";
    }
    return value.value === void 0 ? defaultV : value.value;
  });
  const [isShowValue, setIsShowValue] = (0, import_react4.useState)(() => {
    const defaultV = true;
    if (!rule) {
      return defaultV;
    }
    return rule.isShowValue === void 0 ? defaultV : !!rule.isShowValue;
  });
  const getResult = (option) => {
    const config = {
      min: { type: option.minValueType, value: option.minValue },
      max: { type: option.maxValueType, value: option.maxValue },
      isGradient: option.isGradient === "1",
      positiveColor: option.positiveColor || defaultDataBarPositiveColor,
      nativeColor: option.nativeColor || defaultDataBarNativeColor
    };
    return { config, type: "dataBar" /* dataBar */, isShowValue: option.isShowValue };
  };
  (0, import_react4.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        return getResult({ isGradient, minValue, minValueType, maxValue, maxValueType, positiveColor, nativeColor, isShowValue });
      }
    });
    return dispose;
  }, [isGradient, minValue, minValueType, maxValue, maxValueType, positiveColor, nativeColor, interceptorManager, isShowValue]);
  const handleChange = (option) => {
    props.onChange(getResult(option));
  };
  const handlePositiveColorChange = (color) => {
    setPositiveColor(color);
    handleChange({
      isGradient,
      minValue,
      minValueType,
      maxValue,
      maxValueType,
      positiveColor: color,
      nativeColor,
      isShowValue
    });
  };
  const handleNativeColorChange = (color) => {
    setNativeColor(color);
    handleChange({
      isGradient,
      minValue,
      minValueType,
      maxValue,
      maxValueType,
      positiveColor,
      nativeColor: color,
      isShowValue
    });
  };
  const isShowInput = (type) => {
    return commonOptions.map((item) => item.value).includes(type);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: previewClassName, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Preview,
      {
        rule: getResult({
          isGradient,
          minValue,
          minValueType,
          maxValue,
          maxValueType,
          positiveColor,
          nativeColor,
          isShowValue
        })
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: `univer-mt-3 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
          children: localeService.t("sheets-conditional-formatting-ui.panel.fillType")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-ml-1 univer-mt-3 univer-flex univer-items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          RadioGroup,
          {
            value: isGradient,
            onChange: (v) => {
              setIsGradient(v);
              handleChange({
                isGradient: v,
                minValue,
                minValueType,
                maxValue,
                maxValueType,
                positiveColor,
                nativeColor,
                isShowValue
              });
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "0", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "univer-text-xs", children: localeService.t("sheets-conditional-formatting-ui.panel.pureColor") }) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Radio, { value: "1", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "univer-text-xs", children: localeService.t("sheets-conditional-formatting-ui.panel.gradient") }) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-ml-6 univer-flex univer-items-center univer-text-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Checkbox,
            {
              checked: !isShowValue,
              onChange: (v) => {
                setIsShowValue(!v);
                handleChange({
                  isGradient: v,
                  minValue,
                  minValueType,
                  maxValue,
                  maxValueType,
                  positiveColor,
                  nativeColor,
                  isShowValue: !v
                });
              }
            }
          ),
          localeService.t("sheets-conditional-formatting-ui.panel.onlyShowDataBar")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: `univer-mt-3 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
          children: localeService.t("sheets-conditional-formatting-ui.panel.colorSet")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-ml-1 univer-mt-3 univer-flex univer-items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-flex univer-items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-text-xs", children: localeService.t("sheets-conditional-formatting-ui.panel.native") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            ColorPicker2,
            {
              color: nativeColor,
              onChange: handleNativeColorChange
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-ml-3 univer-flex univer-items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "univer-text-xs", children: localeService.t("sheets-conditional-formatting-ui.panel.positive") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            ColorPicker2,
            {
              color: positiveColor,
              onChange: handlePositiveColorChange
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: `univer-mt-3 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
          children: localeService.t("sheets-conditional-formatting-ui.valueType.min")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-mt-3 univer-flex univer-items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          Select,
          {
            className: "univer-w-1/2 univer-flex-shrink-0",
            options: minOptions,
            value: minValueType,
            onChange: (v) => {
              setMinValueType(v);
              const value = createDefaultValueByValueType(v, 10);
              setMinValue(value);
              handleChange({
                isGradient,
                minValue: value,
                minValueType: v,
                maxValue,
                maxValueType,
                positiveColor,
                nativeColor,
                isShowValue
              });
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          InputText,
          {
            id: "min",
            className: "univer-ml-3",
            disabled: !isShowInput(minValueType),
            type: minValueType,
            value: minValue,
            onChange: (v) => {
              setMinValue(v || 0);
              handleChange({
                isGradient,
                minValue: v || 0,
                minValueType,
                maxValue,
                maxValueType,
                positiveColor,
                nativeColor,
                isShowValue
              });
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: `univer-mt-3 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
          children: localeService.t("sheets-conditional-formatting-ui.valueType.max")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-mt-3 univer-flex univer-items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          Select,
          {
            className: "univer-w-1/2 univer-flex-shrink-0",
            options: maxOptions,
            value: maxValueType,
            onChange: (v) => {
              setMaxValueType(v);
              const value = createDefaultValueByValueType(v, 90);
              setMaxValue(value);
              handleChange({
                isGradient,
                minValue,
                minValueType,
                maxValue: value,
                maxValueType: v,
                positiveColor,
                nativeColor,
                isShowValue
              });
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          InputText,
          {
            className: "univer-ml-3",
            disabled: !isShowInput(maxValueType),
            id: "max",
            type: maxValueType,
            value: maxValue,
            onChange: (v) => {
              setMaxValue(v || 0);
              handleChange({
                isGradient,
                minValue,
                minValueType,
                maxValue: v || 0,
                maxValueType,
                positiveColor,
                nativeColor,
                isShowValue
              });
            }
          }
        )
      ] })
    ] })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/Formula.tsx
var import_react6 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/components/conditional-style-editor/index.tsx
var import_react5 = __toESM(require_react());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var getAnotherBooleanNumber = (v) => {
  return [0 /* FALSE */, void 0].includes(v) ? 1 /* TRUE */ : 0 /* FALSE */;
};
var getBooleanFromNumber = (v) => v !== 0 /* FALSE */;
var ConditionalStyleEditor = (props) => {
  const { style, onChange, className } = props;
  const [isBold, setIsBold] = (0, import_react5.useState)(() => {
    const defaultV = void 0;
    if (!(style == null ? void 0 : style.bl)) {
      return defaultV;
    }
    return style.bl;
  });
  const [isItalic, setIsItalic] = (0, import_react5.useState)(() => {
    const defaultV = void 0;
    if (!(style == null ? void 0 : style.it)) {
      return defaultV;
    }
    return style.it;
  });
  const [isUnderline, setIsUnderline] = (0, import_react5.useState)(() => {
    const defaultV = void 0;
    if (!(style == null ? void 0 : style.ul)) {
      return defaultV;
    }
    return style.ul.s;
  });
  const [isStrikethrough, setIsStrikethrough] = (0, import_react5.useState)(() => {
    const defaultV = void 0;
    if (!(style == null ? void 0 : style.st)) {
      return defaultV;
    }
    return style.st.s;
  });
  const [fontColor, setFontColor] = (0, import_react5.useState)(() => {
    var _a;
    const defaultV = "#2f56ef";
    if (!((_a = style == null ? void 0 : style.cl) == null ? void 0 : _a.rgb)) {
      return defaultV;
    }
    return style.cl.rgb;
  });
  const [bgColor, setBgColor] = (0, import_react5.useState)(() => {
    var _a;
    const defaultV = "#e8ecfc";
    if (!((_a = style == null ? void 0 : style.bg) == null ? void 0 : _a.rgb)) {
      return defaultV;
    }
    return style.bg.rgb;
  });
  (0, import_react5.useEffect)(() => {
    const resultStyle = {
      bl: isBold,
      it: isItalic
    };
    if (fontColor !== void 0) {
      resultStyle.cl = { rgb: fontColor };
    }
    if (bgColor !== void 0) {
      resultStyle.bg = { rgb: bgColor };
    }
    if (isStrikethrough !== void 0) {
      resultStyle.st = { s: isStrikethrough };
    }
    if (isUnderline !== void 0) {
      resultStyle.ul = { s: isUnderline };
    }
    onChange(removeUndefinedAttr(resultStyle));
  }, [isBold, isItalic, isUnderline, isStrikethrough, fontColor, bgColor]);
  const buttonItemClassName = "univer-flex univer-cursor-pointer univer-items-center univer-rounded univer-px-1";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: clsx("univer-my-2.5 univer-flex univer-justify-between", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "div",
      {
        className: clsx(buttonItemClassName, {
          "univer-bg-gray-100 dark:!univer-bg-gray-700": getBooleanFromNumber(isBold || 0 /* FALSE */)
        }),
        onClick: () => setIsBold(getAnotherBooleanNumber(isBold)),
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(BoldIcon, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "div",
      {
        className: clsx(buttonItemClassName, {
          "univer-bg-gray-100 dark:!univer-bg-gray-700": getBooleanFromNumber(isItalic || 0 /* FALSE */)
        }),
        onClick: () => setIsItalic(getAnotherBooleanNumber(isItalic)),
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ItalicIcon, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "div",
      {
        className: clsx(buttonItemClassName, {
          "univer-bg-gray-100 dark:!univer-bg-gray-700": getBooleanFromNumber(isUnderline || 0 /* FALSE */)
        }),
        onClick: () => setIsUnderline(getAnotherBooleanNumber(isUnderline)),
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(UnderlineIcon, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "div",
      {
        className: clsx(buttonItemClassName, {
          "univer-bg-gray-100 dark:!univer-bg-gray-700": getBooleanFromNumber(isStrikethrough || 0 /* FALSE */)
        }),
        onClick: () => setIsStrikethrough(getAnotherBooleanNumber(isStrikethrough)),
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(StrikethroughIcon, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ColorPicker2, { color: fontColor, onChange: setFontColor, Icon: FontColorDoubleIcon }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ColorPicker2, { color: bgColor, onChange: setBgColor })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/Formula.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var FormulaStyleEditor = (props) => {
  var _a;
  const { onChange, interceptorManager } = props;
  const localeService = useDependency(LocaleService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
  const worksheet = workbook.getActiveSheet();
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "highlightCell" /* highlightCell */ ? props.rule : void 0;
  const divEleRef = (0, import_react6.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react6.useState)(false);
  const formulaEditorRef = (0, import_react6.useRef)(null);
  const [style, setStyle] = (0, import_react6.useState)({});
  const [formula, setFormula] = (0, import_react6.useState)(() => {
    if ((rule == null ? void 0 : rule.subType) === "formula" /* formula */) {
      return rule.value;
    }
    return "=";
  });
  const [formulaError, setFormulaError] = (0, import_react6.useState)(void 0);
  const getResult = (config) => {
    return {
      style: config.style,
      value: formula,
      type: "highlightCell" /* highlightCell */,
      subType: "formula" /* formula */
    };
  };
  (0, import_react6.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        return getResult({ style, formula });
      }
    });
    return dispose;
  }, [style, formula, interceptorManager]);
  (0, import_react6.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
      handler: (v, _c, next) => {
        if (formulaError || formula.length === 1 || !formula.startsWith("=")) {
          setFormulaError(localeService.t("sheets-conditional-formatting-ui.errorMessage.formulaError"));
          return false;
        }
        return next(v);
      }
    });
    return dispose;
  }, [formulaError, formula]);
  const _onChange = (config) => {
    onChange(getResult(config));
  };
  useSidebarClick((e) => {
    var _a2;
    const isOutSide = (_a2 = formulaEditorRef.current) == null ? void 0 : _a2.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { ref: divEleRef, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      FormulaEditor,
      {
        ref: formulaEditorRef,
        className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
        errorText: formulaError,
        isFocus: isFocusFormulaEditor,
        initValue: formula,
        unitId: workbook.getUnitId(),
        subUnitId: worksheet == null ? void 0 : worksheet.getSheetId(),
        onFocus: () => {
          setIsFocusFormulaEditor(true);
        },
        onChange: (formula2) => {
          setFormula(formula2);
          _onChange({ style, formula: formula2 });
        },
        onVerify: (result, formula2) => {
          if (!result || formula2.length === 1) {
            setFormulaError(localeService.t("sheets-conditional-formatting-ui.errorMessage.formulaError"));
          } else {
            setFormulaError(void 0);
          }
        }
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: previewClassName, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Preview, { rule: getResult({ style, formula }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ConditionalStyleEditor,
      {
        style: rule == null ? void 0 : rule.style,
        className: "univer-mt-3",
        onChange: (v) => {
          setStyle(v);
          _onChange({ style: v, formula });
        }
      }
    )
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/HighlightCell.tsx
var import_react7 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/components/wrapper-error/WrapperError.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
var WrapperError = (props) => {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "univer-relative", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "div",
      {
        className: "univer-absolute univer-bottom-[-13px] univer-z-[999] univer-text-[10px] univer-text-red-500",
        children: props.errorText
      }
    ),
    props.children
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/HighlightCell.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime());
var createOptionItem3 = (text, localeService) => ({ label: localeService.t(`sheets-conditional-formatting-ui.operator.${text}`), value: text });
function HighlightCellInput(props) {
  const { type, operator, onChange, value, interceptorManager } = props;
  const localeService = useDependency(LocaleService);
  const [inputNumberValue, setInputNumberValue] = (0, import_react7.useState)(() => typeof value === "number" ? value : 0);
  const [numberError, setNumberError] = (0, import_react7.useState)("");
  const [inputTextValue, setInputTextValue] = (0, import_react7.useState)(() => typeof value === "string" ? value : "");
  const [textError, setTextError] = (0, import_react7.useState)("");
  const [inputNumberMin, setInputNumberMin] = (0, import_react7.useState)(() => Array.isArray(value) ? value[0] === void 0 ? 0 : value[0] : 0);
  const [numberMinError, setNumberMinError] = (0, import_react7.useState)("");
  const [inputNumberMax, setInputNumberMax] = (0, import_react7.useState)(() => Array.isArray(value) ? value[1] === void 0 ? 100 : value[1] : 100);
  const [numberMaxError, setNumberMaxError] = (0, import_react7.useState)("");
  (0, import_react7.useEffect)(() => {
    switch (type) {
      case "text" /* text */: {
        if (["beginsWith" /* beginsWith */, "endsWith" /* endsWith */, "containsText" /* containsText */, "notContainsText" /* notContainsText */, "equal" /* equal */, "notEqual" /* notEqual */].includes(operator)) {
          onChange(inputTextValue);
        }
        break;
      }
      case "number" /* number */: {
        if (["equal" /* equal */, "notEqual" /* notEqual */, "greaterThan" /* greaterThan */, "greaterThanOrEqual" /* greaterThanOrEqual */, "lessThan" /* lessThan */, "lessThanOrEqual" /* lessThanOrEqual */].includes(operator)) {
          onChange(inputNumberValue);
        }
        if (["between" /* between */, "notBetween" /* notBetween */].includes(operator)) {
          onChange([inputNumberMin, inputNumberMax]);
        }
        break;
      }
    }
  }, [type]);
  (0, import_react7.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
      handler: (v, _c, next) => {
        switch (type) {
          case "text" /* text */: {
            if (["beginsWith" /* beginsWith */, "containsText" /* containsText */, "endsWith" /* endsWith */, "notEqual" /* notEqual */, "notContainsText" /* notContainsText */, "equal" /* equal */].includes(operator)) {
              if (!inputTextValue) {
                setTextError(localeService.t("sheets-conditional-formatting-ui.errorMessage.notBlank"));
                return false;
              }
              return next(v);
            }
          }
        }
        return next(v);
      }
    });
    return () => {
      dispose();
    };
  }, [type, inputNumberValue, inputTextValue, operator]);
  switch (type) {
    case "text" /* text */: {
      if (["beginsWith" /* beginsWith */, "endsWith" /* endsWith */, "containsText" /* containsText */, "notContainsText" /* notContainsText */, "equal" /* equal */, "notEqual" /* notEqual */].includes(operator)) {
        const _onChange = (value2) => {
          setInputTextValue(value2);
          onChange(value2);
        };
        return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "univer-mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WrapperError, { errorText: textError, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          Input,
          {
            value: inputTextValue,
            onChange: (v) => {
              setTextError("");
              _onChange(v);
            }
          }
        ) }) });
      }
      break;
    }
    case "number" /* number */: {
      if (["equal" /* equal */, "notEqual" /* notEqual */, "greaterThan" /* greaterThan */, "greaterThanOrEqual" /* greaterThanOrEqual */, "lessThan" /* lessThan */, "lessThanOrEqual" /* lessThanOrEqual */].includes(operator)) {
        const _onChange = (value2) => {
          setInputNumberValue(value2 || 0);
          onChange(value2 || 0);
          setNumberError("");
        };
        return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "univer-mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WrapperError, { errorText: numberError, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          InputNumber,
          {
            className: "univer-w-full",
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            value: inputNumberValue,
            onChange: _onChange
          }
        ) }) });
      }
      if (["between" /* between */, "notBetween" /* notBetween */].includes(operator)) {
        const onChangeMin = (_value) => {
          setInputNumberMin(_value || 0);
          const value2 = [_value || 0, inputNumberMax];
          onChange(value2);
          setNumberMinError("");
        };
        const onChangeMax = (_value) => {
          setInputNumberMax(_value || 0);
          const value2 = [inputNumberMin, _value || 0];
          onChange(value2);
          setNumberMaxError("");
        };
        return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "univer-mt-3 univer-flex univer-items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WrapperError, { errorText: numberMinError, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(InputNumber, { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, value: inputNumberMin, onChange: onChangeMin }) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WrapperError, { errorText: numberMaxError, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            InputNumber,
            {
              className: "univer-ml-3",
              min: Number.MIN_SAFE_INTEGER,
              max: Number.MAX_SAFE_INTEGER,
              value: inputNumberMax,
              onChange: onChangeMax
            }
          ) })
        ] });
      }
    }
  }
  return null;
}
var getOperatorOptions = (type, localeService) => {
  switch (type) {
    case "text" /* text */: {
      return [
        createOptionItem3("containsText" /* containsText */, localeService),
        createOptionItem3("notContainsText" /* notContainsText */, localeService),
        createOptionItem3("beginsWith" /* beginsWith */, localeService),
        createOptionItem3("endsWith" /* endsWith */, localeService),
        createOptionItem3("equal" /* equal */, localeService),
        createOptionItem3("notEqual" /* notEqual */, localeService),
        createOptionItem3("containsBlanks" /* containsBlanks */, localeService),
        createOptionItem3("notContainsBlanks" /* notContainsBlanks */, localeService),
        createOptionItem3("containsErrors" /* containsErrors */, localeService),
        createOptionItem3("notContainsErrors" /* notContainsErrors */, localeService)
      ];
    }
    case "number" /* number */: {
      return [
        createOptionItem3("between" /* between */, localeService),
        createOptionItem3("notBetween" /* notBetween */, localeService),
        createOptionItem3("equal" /* equal */, localeService),
        createOptionItem3("notEqual" /* notEqual */, localeService),
        createOptionItem3("greaterThan" /* greaterThan */, localeService),
        createOptionItem3("greaterThanOrEqual" /* greaterThanOrEqual */, localeService),
        createOptionItem3("lessThan" /* lessThan */, localeService),
        createOptionItem3("lessThanOrEqual" /* lessThanOrEqual */, localeService)
      ];
    }
    case "timePeriod" /* timePeriod */: {
      return [
        createOptionItem3("yesterday" /* yesterday */, localeService),
        createOptionItem3("today" /* today */, localeService),
        createOptionItem3("tomorrow" /* tomorrow */, localeService),
        createOptionItem3("last7Days" /* last7Days */, localeService),
        createOptionItem3("lastWeek" /* lastWeek */, localeService),
        createOptionItem3("thisWeek" /* thisWeek */, localeService),
        createOptionItem3("nextWeek" /* nextWeek */, localeService),
        createOptionItem3("lastMonth" /* lastMonth */, localeService),
        createOptionItem3("thisMonth" /* thisMonth */, localeService),
        createOptionItem3("nextMonth" /* nextMonth */, localeService)
      ];
    }
  }
};
var HighlightCellStyleEditor = (props) => {
  var _a;
  const { interceptorManager, onChange } = props;
  const localeService = useDependency(LocaleService);
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "highlightCell" /* highlightCell */ ? props.rule : void 0;
  const [subType, setSubType] = (0, import_react7.useState)(() => {
    const defaultV = "text" /* text */;
    if (!rule) {
      return defaultV;
    }
    return rule.subType || defaultV;
  });
  const typeOptions = [{
    value: "text" /* text */,
    label: localeService.t("sheets-conditional-formatting-ui.subRuleType.text")
  }, {
    value: "number" /* number */,
    label: localeService.t("sheets-conditional-formatting-ui.subRuleType.number")
  }, {
    value: "timePeriod" /* timePeriod */,
    label: localeService.t("sheets-conditional-formatting-ui.subRuleType.timePeriod")
  }, {
    value: "duplicateValues" /* duplicateValues */,
    label: localeService.t("sheets-conditional-formatting-ui.subRuleType.duplicateValues")
  }, {
    value: "uniqueValues" /* uniqueValues */,
    label: localeService.t("sheets-conditional-formatting-ui.subRuleType.uniqueValues")
  }];
  const operatorOptions = (0, import_react7.useMemo)(() => getOperatorOptions(subType, localeService), [subType]);
  const [operator, setOperator] = (0, import_react7.useState)(() => {
    const defaultV = operatorOptions ? operatorOptions[0].value : void 0;
    if (!rule) {
      return defaultV;
    }
    return rule.operator || defaultV;
  });
  const [value, setValue] = (0, import_react7.useState)(() => {
    var _a2;
    const defaultV = "";
    if (!rule) {
      return defaultV;
    }
    const v = (_a2 = rule.value) != null ? _a2 : createDefaultValue(rule.subType, rule.operator);
    return v;
  });
  const [style, setStyle] = (0, import_react7.useState)({});
  const getResult = (0, import_react7.useMemo)(() => (option) => {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    switch (option.subType || subType) {
      case "text" /* text */: {
        if (["beginsWith" /* beginsWith */, "endsWith" /* endsWith */, "containsText" /* containsText */, "notContainsText" /* notContainsText */, "equal" /* equal */, "notEqual" /* notEqual */].includes(operator)) {
          return {
            type: "highlightCell" /* highlightCell */,
            subType: (_a2 = option.subType) != null ? _a2 : subType,
            operator: (_b = option.operator) != null ? _b : operator,
            style: (_c = option.style) != null ? _c : style,
            value: (_d = option.value) != null ? _d : value
          };
        }
        break;
      }
      case "number" /* number */: {
        if (["equal" /* equal */, "notEqual" /* notEqual */, "greaterThan" /* greaterThan */, "greaterThanOrEqual" /* greaterThanOrEqual */, "lessThan" /* lessThan */, "lessThanOrEqual" /* lessThanOrEqual */].includes(operator)) {
          return {
            type: "highlightCell" /* highlightCell */,
            subType: (_e = option.subType) != null ? _e : subType,
            operator: (_f = option.operator) != null ? _f : operator,
            style: (_g = option.style) != null ? _g : style,
            value: (_h = option.value) != null ? _h : value
          };
        }
        if (["between" /* between */, "notBetween" /* notBetween */].includes(operator)) {
          return {
            type: "highlightCell" /* highlightCell */,
            subType: (_i = option.subType) != null ? _i : subType,
            operator: (_j = option.operator) != null ? _j : operator,
            style: (_k = option.style) != null ? _k : style,
            value: (_l = option.value) != null ? _l : value
          };
        }
        break;
      }
    }
    return {
      type: "highlightCell" /* highlightCell */,
      subType: (_m = option.subType) != null ? _m : subType,
      operator: (_n = option.operator) != null ? _n : operator,
      style: (_o = option.style) != null ? _o : style
    };
  }, [subType, operator, value, style]);
  (0, import_react7.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        return getResult({});
      }
    });
    return dispose;
  }, [getResult, interceptorManager]);
  (0, import_react7.useEffect)(() => {
    if (!typeOptions.some((item) => item.value === subType)) {
      setSubType(typeOptions[0].value);
    }
  }, [typeOptions]);
  const onTypeChange = (v) => {
    const _subType = v;
    const operatorList = getOperatorOptions(_subType, localeService);
    const _operator = operatorList && operatorList[0].value;
    setSubType(_subType);
    setOperator(_operator);
    _operator && setValue(createDefaultValue(_subType, _operator));
    onChange(getResult({ subType: _subType, operator: _operator }));
  };
  const onOperatorChange = (v) => {
    const _operator = v;
    setOperator(_operator);
    onChange(getResult({ operator: _operator }));
  };
  const onInputChange = (value2) => {
    setValue(value2);
    onChange(getResult({ value: value2 }));
  };
  const inputRenderKey = (0, import_react7.useMemo)(() => {
    return `${subType}_${operator}_${Math.random()}`;
  }, [subType, operator]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "univer-flex univer-justify-between univer-gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Select,
        {
          className: "univer-mt-3 univer-w-full",
          onChange: onTypeChange,
          value: subType,
          options: typeOptions
        }
      ),
      (operatorOptions == null ? void 0 : operatorOptions.length) && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Select,
        {
          className: "univer-mt-3 univer-w-full",
          onChange: onOperatorChange,
          value: operator || "",
          options: operatorOptions
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      HighlightCellInput,
      {
        value,
        interceptorManager,
        type: subType,
        operator,
        rule,
        onChange: onInputChange
      },
      inputRenderKey
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: previewClassName, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Preview, { rule: getResult({}) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      ConditionalStyleEditor,
      {
        style: rule == null ? void 0 : rule.style,
        className: "univer-ml-1",
        onChange: (v) => {
          setStyle(v);
          onChange(getResult({ style: v }));
        }
      }
    )
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/IconSet.tsx
var import_react8 = __toESM(require_react());
var import_jsx_runtime9 = __toESM(require_jsx_runtime());
var getIcon = (iconType, iconId) => {
  const arr = iconMap[iconType] || [];
  return arr[Number(iconId)] || "";
};
var TextInput2 = (props) => {
  var _a;
  const { error, type, onChange } = props;
  const univerInstanceService = useDependency(IUniverInstanceService);
  const unitId = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
  const subUnitId = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
  const formulaEditorRef = (0, import_react8.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react8.useState)(false);
  useSidebarClick((e) => {
    var _a2;
    const isOutSide = (_a2 = formulaEditorRef.current) == null ? void 0 : _a2.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-relative", children: type !== "formula" /* formula */ ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      InputNumber,
      {
        className: clsx({
          "univer-border-red-500": error
        }),
        value: Number(props.value) || 0,
        onChange: (v) => onChange(v != null ? v : 0)
      }
    ),
    error && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-absolute univer-text-xs univer-text-red-500", children: error })
  ] }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-w-full", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    FormulaEditor,
    {
      ref: formulaEditorRef,
      className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
      initValue: String(props.value),
      unitId,
      subUnitId,
      isFocus: isFocusFormulaEditor,
      onChange: (v = "") => {
        const formula = v || "";
        onChange(formula);
      },
      onFocus: () => setIsFocusFormulaEditor(true)
    }
  ) }) });
};
var createDefaultConfigItem = (iconType, index, list) => ({
  operator: "greaterThan" /* greaterThan */,
  value: { type: "num" /* num */, value: (list.length - 1 - index) * 10 },
  iconType,
  iconId: String(index)
});
var IconGroupList = (0, import_react8.forwardRef)((props, ref) => {
  const { onClick } = props;
  const localeService = useDependency(LocaleService);
  const handleClick = (iconType) => {
    onClick(iconType);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { ref, className: "univer-w-80", children: iconGroup.map((group, index) => {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-mb-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-mb-1 univer-text-sm", children: localeService.t(group.title) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-flex univer-flex-wrap", children: group.group.map((groupItem) => {
        return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "div",
          {
            className: "univer-mb-1 univer-flex univer-w-1/2 univer-items-center",
            onClick: () => {
              handleClick(groupItem.name);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "a",
              {
                className: `univer-flex univer-cursor-pointer univer-rounded hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
                children: groupItem.list.map((base64, index2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "img",
                  {
                    className: "univer-size-5",
                    src: base64,
                    draggable: false
                  },
                  index2
                ))
              }
            )
          },
          groupItem.name
        );
      }) })
    ] }, index);
  }) });
});
var IconItemList = (props) => {
  const { onClick } = props;
  const list = (0, import_react8.useMemo)(() => {
    const result = [];
    for (const key in iconMap) {
      const iconType = key;
      const list2 = iconMap[iconType];
      list2.forEach((base64, index) => {
        result.push({
          iconType,
          base64,
          iconId: String(index)
        });
      });
    }
    return result;
  }, []);
  const handleClick = (item) => {
    onClick(item.iconType, item.iconId);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      "div",
      {
        className: "univer-mb-2.5 univer-flex univer-cursor-pointer univer-items-center univer-pl-1",
        onClick: () => handleClick({ iconType: "EMPTY_ICON_TYPE" /* empty */, iconId: "", base64: "" }),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SlashDoubleIcon, { className: "univer-size-5" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "univer-ml-2", children: "\u65E0\u5355\u5143\u683C\u56FE\u6807" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-flex univer-w-64 univer-flex-wrap", children: list.map((item) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "div",
      {
        className: `univer-mb-2 univer-mr-2 univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-rounded hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`,
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "img",
          {
            className: "univer-size-5",
            src: item.base64,
            draggable: false,
            onClick: () => handleClick(item)
          }
        )
      },
      `${item.iconType}_${item.iconId}`
    )) })
  ] });
};
var IconSetRuleEdit = (props) => {
  const { onChange, configList, errorMap = {} } = props;
  const localeService = useDependency(LocaleService);
  const options = [{ label: localeService.t(`sheets-conditional-formatting-ui.symbol.${"greaterThan" /* greaterThan */}`), value: "greaterThan" /* greaterThan */ }, { label: localeService.t(`sheets-conditional-formatting-ui.symbol.${"greaterThanOrEqual" /* greaterThanOrEqual */}`), value: "greaterThanOrEqual" /* greaterThanOrEqual */ }];
  const valueTypeOptions = [
    { label: localeService.t(`sheets-conditional-formatting-ui.valueType.${"num" /* num */}`), value: "num" /* num */ },
    { label: localeService.t(`sheets-conditional-formatting-ui.valueType.${"percent" /* percent */}`), value: "percent" /* percent */ },
    { label: localeService.t(`sheets-conditional-formatting-ui.valueType.${"percentile" /* percentile */}`), value: "percentile" /* percentile */ },
    { label: localeService.t(`sheets-conditional-formatting-ui.valueType.${"formula" /* formula */}`), value: "formula" /* formula */ }
  ];
  const handleValueValueChange = (v, index) => {
    onChange([String(index), "value", "value"], v);
  };
  const handleOperatorChange = (operator, index) => {
    onChange([String(index), "operator"], operator);
    const defaultValue = createDefaultValue("number" /* number */, operator);
    handleValueValueChange(defaultValue, index);
  };
  const handleValueTypeChange = (v, index) => {
    onChange([String(index), "value", "type"], v);
    const item = configList[index];
    const defaultValue = createDefaultValue("number" /* number */, item.operator);
    handleValueValueChange(defaultValue, index);
  };
  const render = (0, import_react8.useMemo)(() => {
    return configList.map((item, index) => {
      const error = errorMap[index];
      const icon = getIcon(item.iconType, item.iconId);
      const isEnd = index === configList.length - 1;
      const isFirst = index === 0;
      const preItem = configList[index - 1];
      const lessThanText = (preItem == null ? void 0 : preItem.value.type) === "formula" /* formula */ ? localeService.t("sheets-conditional-formatting-ui.valueType.formula") : preItem == null ? void 0 : preItem.value.value;
      const handleIconClick = (iconType, iconId) => {
        const value = { ...item, iconId, iconType };
        onChange([String(index)], value);
      };
      return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        "div",
        {
          className: index ? "univer-mt-6" : "univer-mt-3",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
              "div",
              {
                className: `univer-mt-3 univer-flex univer-items-center univer-justify-between univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    {
                      className: "univer-w-[45%]",
                      children: [
                        localeService.t("sheets-conditional-formatting-ui.iconSet.icon"),
                        index + 1
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-w-[45%]", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
                    !isFirst && !isEnd && localeService.t("sheets-conditional-formatting-ui.iconSet.rule"),
                    !isFirst && !isEnd && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                      "span",
                      {
                        className: `univer-font-medium univer-text-gray-600 dark:!univer-text-gray-200`,
                        children: [
                          localeService.t("sheets-conditional-formatting-ui.iconSet.when"),
                          localeService.t(`sheets-conditional-formatting-ui.symbol.${getOppositeOperator(preItem.operator)}`),
                          lessThanText,
                          isEnd ? "" : ` ${localeService.t("sheets-conditional-formatting-ui.iconSet.and")} `
                        ]
                      }
                    )
                  ] }) })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-mt-3 univer-grid univer-grid-cols-2 univer-gap-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-flex univer-items-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Dropdown,
                {
                  overlay: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-rounded-lg univer-p-4", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(IconItemList, { onClick: handleIconClick, iconId: item.iconId, iconType: item.iconType }) }),
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                    "div",
                    {
                      className: clsx(`univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-between univer-rounded-md univer-bg-white univer-px-4 univer-py-2 univer-text-xs univer-text-gray-600 univer-transition-all hover:univer-border-primary-600 dark:!univer-text-gray-200`, borderClassName),
                      children: [
                        icon ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("img", { src: icon, className: "univer-size-4", draggable: false }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SlashDoubleIcon, { className: "univer-size-4" }),
                        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoreDownIcon, {})
                      ]
                    }
                  )
                }
              ) }),
              !isEnd ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                Select,
                {
                  options,
                  value: item.operator,
                  onChange: (v) => {
                    handleOperatorChange(v, index);
                  }
                }
              ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "div",
                {
                  className: `univer-mt-0 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
                  children: [
                    localeService.t("sheets-conditional-formatting-ui.iconSet.rule"),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "univer-font-medium", children: [
                      localeService.t("sheets-conditional-formatting-ui.iconSet.when"),
                      localeService.t(`sheets-conditional-formatting-ui.symbol.${getOppositeOperator(preItem.operator)}`),
                      lessThanText,
                      isEnd ? "" : ` ${localeService.t("sheets-conditional-formatting-ui.iconSet.and")} `
                    ] })
                  ]
                }
              )
            ] }),
            !isEnd ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "div",
                {
                  className: `univer-mt-3 univer-grid univer-grid-cols-2 univer-gap-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: localeService.t("sheets-conditional-formatting-ui.iconSet.type") }),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { children: localeService.t("sheets-conditional-formatting-ui.iconSet.value") })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
                "div",
                {
                  className: "univer-mt-3 univer-grid univer-grid-cols-2 univer-gap-4",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      Select,
                      {
                        options: valueTypeOptions,
                        value: item.value.type,
                        onChange: (v) => {
                          handleValueTypeChange(v, index);
                        }
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      TextInput2,
                      {
                        id: index,
                        type: item.value.type,
                        error,
                        value: item.value.value || "",
                        onChange: (v) => {
                          handleValueValueChange(v, index);
                        }
                      }
                    )
                  ]
                }
              )
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", {})
          ]
        },
        index
      );
    });
  }, [configList, errorMap]);
  return render;
};
var IconSet = (props) => {
  var _a;
  const { interceptorManager } = props;
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "iconSet" /* iconSet */ ? props.rule : void 0;
  const localeService = useDependency(LocaleService);
  const [errorMap, setErrorMap] = (0, import_react8.useState)({});
  const [currentIconType, setCurrentIconType] = (0, import_react8.useState)(() => {
    const defaultV = Object.keys(iconMap)[0];
    if (rule && rule.config.length) {
      const type = rule.config[0].iconType;
      const isNotSame = rule.config.some((item) => item.iconType !== type);
      if (!isNotSame) {
        return type;
      }
    }
    return defaultV;
  });
  const [configList, setConfigList] = (0, import_react8.useState)(() => {
    if (rule && rule.config.length) {
      return Tools.deepClone(rule == null ? void 0 : rule.config);
    }
    const list = iconMap[currentIconType] || [];
    return new Array(list.length).fill("").map((_e, index, list2) => {
      if (index === list2.length - 1) {
        return {
          operator: "lessThanOrEqual" /* lessThanOrEqual */,
          value: { type: "num" /* num */, value: Number.MAX_SAFE_INTEGER },
          iconType: currentIconType,
          iconId: String(index)
        };
      }
      return createDefaultConfigItem(currentIconType, index, list2);
    });
  });
  const [isShowValue, setIsShowValue] = (0, import_react8.useState)(() => {
    if (!rule) {
      return true;
    }
    return !!rule.isShowValue;
  });
  const previewIcon = (0, import_react8.useMemo)(() => {
    const list = configList.map((item) => {
      return getIcon(item.iconType, item.iconId);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-flex univer-items-center", children: list.map((icon, index) => icon ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      "img",
      {
        className: "univer-size-5",
        src: icon
      },
      index
    ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SlashDoubleIcon, { className: "univer-size-5" }, index)) });
  }, [configList]);
  const checkResult = (_configList) => {
    const isTypeSame = _configList.reduce((pre, cur, index) => {
      if (pre.preType && !pre.result || _configList.length - 1 === index) {
        return pre;
      }
      if (cur.value.type === "formula" /* formula */) {
        return {
          preType: "formula" /* formula */,
          result: false
        };
      }
      if (pre.preType) {
        return {
          result: pre.preType === cur.value.type,
          preType: cur.value.type
        };
      } else {
        return {
          result: true,
          preType: cur.value.type
        };
      }
    }, { result: true, preType: "" }).result;
    if (isTypeSame && ["num" /* num */, "percent" /* percent */, "percentile" /* percentile */].includes(_configList[0].value.type)) {
      const result = {};
      _configList.forEach((item, index, arr) => {
        const preIndex = index - 1;
        if (preIndex < 0 || index === arr.length - 1) {
          return;
        }
        const preItem = _configList[index - 1];
        const preOperator = getOppositeOperator(preItem.operator);
        if (!compareWithNumber({ operator: preOperator, value: preItem.value.value }, item.value.value)) {
          result[index] = `${localeService.t(`sheets-conditional-formatting-ui.form.${preOperator}`, String(preItem.value.value))} `;
        }
      });
      return result;
    }
    return {};
  };
  const handleChange = (keys, v) => {
    const oldV = get_default(configList, keys);
    if (oldV !== v) {
      set_default(configList, keys, v);
      setConfigList([...configList]);
      setErrorMap(checkResult(configList));
    }
  };
  const handleClickIconList = (iconType) => {
    setCurrentIconType(iconType);
    const list = iconMap[iconType] || [];
    const config = new Array(list.length).fill("").map((_e, index, list2) => createDefaultConfigItem(iconType, index, list2));
    setConfigList(config);
    setErrorMap(checkResult(config));
  };
  (0, import_react8.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        const result = { type: "iconSet" /* iconSet */, isShowValue, config: configList };
        return result;
      }
    });
    return () => {
      dispose();
    };
  }, [isShowValue, configList, interceptorManager]);
  (0, import_react8.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
      handler() {
        const keys = Object.keys(errorMap);
        return keys.length === 0;
      }
    });
    return () => {
      dispose();
    };
  }, [isShowValue, configList, interceptorManager, errorMap]);
  const reverseIcon = () => {
    const iconList = configList.map((item) => ({ ...item }));
    configList.forEach((item, index) => {
      const mirrorIndex = configList.length - 1 - index;
      const newIcon = iconList[mirrorIndex];
      item.iconId = newIcon.iconId;
      item.iconType = newIcon.iconType;
    });
    setConfigList([...configList]);
  };
  const layoutService = useDependency(ILayoutService);
  const [iconGroupListEl, setIconGroupListEl] = (0, import_react8.useState)();
  useScrollYOverContainer(iconGroupListEl, layoutService.rootContainerElement);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-mt-4 univer-text-sm univer-text-gray-600", children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule") }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      Dropdown,
      {
        overlay: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "univer-rounded-lg univer-p-4", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          IconGroupList,
          {
            ref: (el) => {
              !iconGroupListEl && el && setIconGroupListEl(el);
            },
            iconType: currentIconType,
            onClick: handleClickIconList
          }
        ) }),
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
          "div",
          {
            className: clsx(`univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-between univer-rounded-md univer-bg-white univer-px-4 univer-py-2 univer-text-xs univer-text-gray-600 univer-transition-all hover:univer-border-primary-600`, borderClassName),
            children: [
              previewIcon,
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoreDownIcon, {})
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-mt-3 univer-flex univer-items-center univer-text-xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-flex univer-items-center univer-text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Checkbox, { onChange: reverseIcon }),
        localeService.t("sheets-conditional-formatting-ui.iconSet.reverseIconOrder")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "univer-ml-6 univer-flex univer-items-center univer-text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Checkbox, { checked: !isShowValue, onChange: (v) => {
          setIsShowValue(!v);
        } }),
        localeService.t("sheets-conditional-formatting-ui.iconSet.onlyShowIcon")
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(IconSetRuleEdit, { errorMap, onChange: handleChange, configList })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/Rank.tsx
var import_react9 = __toESM(require_react());
var import_jsx_runtime10 = __toESM(require_jsx_runtime());
var RankStyleEditor = (props) => {
  var _a;
  const { onChange, interceptorManager } = props;
  const localeService = useDependency(LocaleService);
  const rule = ((_a = props.rule) == null ? void 0 : _a.type) === "highlightCell" /* highlightCell */ ? props.rule : void 0;
  const options = [{ label: localeService.t("sheets-conditional-formatting-ui.panel.isNotBottom"), value: "isNotBottom" }, { label: localeService.t("sheets-conditional-formatting-ui.panel.isBottom"), value: "isBottom" }, { label: localeService.t("sheets-conditional-formatting-ui.panel.greaterThanAverage"), value: "greaterThanAverage" }, { label: localeService.t("sheets-conditional-formatting-ui.panel.lessThanAverage"), value: "lessThanAverage" }];
  const [type, setType] = (0, import_react9.useState)(() => {
    const defaultV = options[0].value;
    const type2 = rule == null ? void 0 : rule.type;
    if (!rule) {
      return defaultV;
    }
    switch (type2) {
      case "highlightCell" /* highlightCell */: {
        const subType = rule.subType;
        switch (subType) {
          case "average" /* average */: {
            if (["greaterThan" /* greaterThan */, "greaterThanOrEqual" /* greaterThanOrEqual */].includes(rule.operator)) {
              return "greaterThanAverage";
            }
            if (["lessThan" /* lessThan */, "lessThanOrEqual" /* lessThanOrEqual */].includes(rule.operator)) {
              return "lessThanAverage";
            }
            return defaultV;
          }
          case "rank" /* rank */: {
            if (rule.isBottom) {
              return "isBottom";
            } else {
              return "isNotBottom";
            }
          }
        }
      }
    }
    return defaultV;
  });
  const [value, setValue] = (0, import_react9.useState)(() => {
    const defaultV = 10;
    const type2 = rule == null ? void 0 : rule.type;
    if (!rule) {
      return defaultV;
    }
    switch (type2) {
      case "highlightCell" /* highlightCell */: {
        const subType = rule.subType;
        switch (subType) {
          case "rank" /* rank */: {
            return rule.value || defaultV;
          }
        }
      }
    }
    return defaultV;
  });
  const [isPercent, setIsPercent] = (0, import_react9.useState)(() => {
    const defaultV = false;
    const type2 = rule == null ? void 0 : rule.type;
    if (!rule) {
      return defaultV;
    }
    switch (type2) {
      case "highlightCell" /* highlightCell */: {
        const subType = rule.subType;
        switch (subType) {
          case "rank" /* rank */: {
            return rule.isPercent || defaultV;
          }
        }
      }
    }
    return defaultV;
  });
  const [style, setStyle] = (0, import_react9.useState)({});
  const getResult = (config) => {
    const { type: type2, isPercent: isPercent2, value: value2, style: style2 } = config;
    if (type2 === "isNotBottom") {
      return { type: "highlightCell" /* highlightCell */, subType: "rank" /* rank */, isPercent: isPercent2, isBottom: false, value: value2, style: style2 };
    }
    if (type2 === "isBottom") {
      return { type: "highlightCell" /* highlightCell */, subType: "rank" /* rank */, isPercent: isPercent2, isBottom: true, value: value2, style: style2 };
    }
    if (type2 === "greaterThanAverage") {
      return { type: "highlightCell" /* highlightCell */, subType: "average" /* average */, operator: "greaterThan" /* greaterThan */, style: style2 };
    }
    if (type2 === "lessThanAverage") {
      return { type: "highlightCell" /* highlightCell */, subType: "average" /* average */, operator: "lessThan" /* lessThan */, style: style2 };
    }
  };
  (0, import_react9.useEffect)(() => {
    const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
      handler() {
        return getResult({ type, isPercent, value, style });
      }
    });
    return dispose;
  }, [type, isPercent, value, style, interceptorManager]);
  const _onChange = (config) => {
    onChange(getResult(config));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleRule")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Select,
      {
        className: "univer-mt-3 univer-w-full",
        value: type,
        options,
        onChange: (v) => {
          setType(v);
          _onChange({ type: v, isPercent, value, style });
        }
      }
    ),
    ["isNotBottom", "isBottom"].includes(type) && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "univer-mt-3 univer-flex univer-items-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        InputNumber,
        {
          min: 1,
          max: 1e3,
          value,
          onChange: (v) => {
            const value2 = v || 0;
            setValue(value2);
            _onChange({ type, isPercent, value: value2, style });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        "div",
        {
          className: "univer-ml-3 univer-flex univer-items-center univer-text-xs",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              Checkbox,
              {
                checked: isPercent,
                onChange: (v) => {
                  setIsPercent(!!v);
                  _onChange({ type, isPercent: !!v, value, style });
                }
              }
            ),
            localeService.t("sheets-conditional-formatting-ui.valueType.percent")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: previewClassName, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Preview, { rule: getResult({ type, isPercent, value, style }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      ConditionalStyleEditor,
      {
        style: rule == null ? void 0 : rule.style,
        className: "univer-mt-3",
        onChange: (v) => {
          setStyle(v);
          _onChange({ type, isPercent, value, style: v });
        }
      }
    )
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/type.ts
var beforeSubmit = createInterceptorKey("beforeSubmit");
var submit = createInterceptorKey("submit");

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-edit/index.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime());
var getUnitId = (univerInstanceService) => univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
var getSubUnitId = (univerInstanceService) => {
  var _a;
  return (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
};
var RuleEdit = (props) => {
  var _a, _b, _c;
  const localeService = useDependency(LocaleService);
  const commandService = useDependency(ICommandService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const conditionalFormattingRuleModel = useDependency(ConditionalFormattingRuleModel);
  const selectionManagerService = useDependency(SheetsSelectionsService);
  const unitId = getUnitId(univerInstanceService);
  const subUnitId = getSubUnitId(univerInstanceService);
  const [errorText, setErrorText] = (0, import_react10.useState)(void 0);
  const rangeResult = (0, import_react10.useRef)((_b = (_a = props.rule) == null ? void 0 : _a.ranges) != null ? _b : []);
  const rangeString = (0, import_react10.useMemo)(() => {
    var _a2, _b2, _c2;
    let ranges = (_a2 = props.rule) == null ? void 0 : _a2.ranges;
    if (!(ranges == null ? void 0 : ranges.length)) {
      ranges = (_c2 = (_b2 = selectionManagerService.getCurrentSelections()) == null ? void 0 : _b2.map((s) => s.range)) != null ? _c2 : [];
    }
    rangeResult.current = ranges;
    if (!(ranges == null ? void 0 : ranges.length)) {
      return "";
    }
    return ranges.map((range) => {
      const v = serializeRange(range);
      return v === "NaN" ? "" : v;
    }).filter((r) => !!r).join(",");
  }, [props.rule]);
  const options = [
    { label: localeService.t("sheets-conditional-formatting-ui.ruleType.highlightCell"), value: "1" },
    { label: localeService.t("sheets-conditional-formatting-ui.panel.rankAndAverage"), value: "2" },
    { label: localeService.t("sheets-conditional-formatting-ui.ruleType.dataBar"), value: "3" },
    { label: localeService.t("sheets-conditional-formatting-ui.ruleType.colorScale"), value: "4" },
    { label: localeService.t("sheets-conditional-formatting-ui.ruleType.formula"), value: "5" },
    { label: localeService.t("sheets-conditional-formatting-ui.ruleType.iconSet"), value: "6" }
  ];
  const [ruleType, setRuleType] = (0, import_react10.useState)(() => {
    var _a2, _b2;
    const type = (_a2 = props.rule) == null ? void 0 : _a2.rule.type;
    const defaultType = options[0].value;
    if (!type) {
      return defaultType;
    }
    switch (type) {
      case "highlightCell" /* highlightCell */: {
        const subType = (_b2 = props.rule) == null ? void 0 : _b2.rule.subType;
        switch (subType) {
          case "number" /* number */:
          case "text" /* text */:
          case "duplicateValues" /* duplicateValues */:
          case "uniqueValues" /* uniqueValues */:
          case "timePeriod" /* timePeriod */: {
            return "1";
          }
          case "average" /* average */:
          case "rank" /* rank */: {
            return "2";
          }
          case "formula" /* formula */: {
            return "5";
          }
        }
        break;
      }
      case "dataBar" /* dataBar */: {
        return "3";
      }
      case "colorScale" /* colorScale */: {
        return "4";
      }
      case "iconSet" /* iconSet */: {
        return "6";
      }
    }
    return defaultType;
  });
  const result = (0, import_react10.useRef)(void 0);
  const interceptorManager = (0, import_react10.useMemo)(() => {
    const _interceptorManager = new InterceptorManager({ beforeSubmit, submit });
    return _interceptorManager;
  }, []);
  const StyleEditor = (0, import_react10.useMemo)(() => {
    switch (ruleType) {
      case "1": {
        return HighlightCellStyleEditor;
      }
      case "2": {
        return RankStyleEditor;
      }
      case "3": {
        return DataBarStyleEditor;
      }
      case "4": {
        return ColorScaleStyleEditor;
      }
      case "5": {
        return FormulaStyleEditor;
      }
      case "6": {
        return IconSet;
      }
      default: {
        return HighlightCellStyleEditor;
      }
    }
  }, [ruleType]);
  (0, import_react10.useEffect)(() => {
    const disposable = commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === RemoveSheetMutation.id) {
        const params = commandInfo.params;
        if (params.subUnitId === subUnitId && params.unitId === unitId) {
          props.onCancel();
        }
      }
      if (commandInfo.id === SetWorksheetActiveOperation.id) {
        props.onCancel();
      }
    });
    return () => disposable.dispose();
  }, []);
  const onStyleChange = (config) => {
    result.current = config;
  };
  const onRangeSelectorChange = (rangeString2) => {
    const result2 = rangeString2.split(",").filter((e) => !!e).map(deserializeRangeWithSheet).map((item) => item.range);
    rangeResult.current = result2;
  };
  const handleSubmit = () => {
    if (errorText) {
      return;
    }
    const getRanges = () => {
      const worksheet = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet();
      if (!worksheet) {
        throw new Error("No active sheet found");
      }
      const ranges2 = rangeResult.current.map((range) => setEndForRange(range, worksheet.getRowCount(), worksheet.getColumnCount()));
      const result2 = ranges2.filter((range) => !(Number.isNaN(range.startRow) || Number.isNaN(range.startColumn)));
      return result2;
    };
    const ranges = getRanges();
    const beforeSubmitResult = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().beforeSubmit)(true, null);
    if (beforeSubmitResult) {
      const result2 = interceptorManager.fetchThroughInterceptors(interceptorManager.getInterceptPoints().submit)(null, null);
      if (result2) {
        const unitId2 = getUnitId(univerInstanceService);
        const subUnitId2 = getSubUnitId(univerInstanceService);
        if (!unitId2 || !subUnitId2) {
          throw new Error("No active sheet found");
        }
        let rule = {};
        if (props.rule && props.rule.cfId) {
          rule = { ...props.rule, ranges, rule: result2 };
          commandService.executeCommand(SetCfCommand.id, { unitId: unitId2, subUnitId: subUnitId2, rule });
          props.onCancel();
        } else {
          const cfId = conditionalFormattingRuleModel.createCfId(unitId2, subUnitId2);
          rule = { cfId, ranges, rule: result2, stopIfTrue: false };
          commandService.executeCommand(AddCfCommand.id, { unitId: unitId2, subUnitId: subUnitId2, rule });
          props.onCancel();
        }
      }
    }
  };
  const handleCancel = () => {
    props.onCancel();
  };
  const handleVerify = (v, rangeText) => {
    if (v) {
      if (rangeText.length < 1) {
        setErrorText(localeService.t("sheets-conditional-formatting-ui.errorMessage.rangeError"));
      } else {
        setErrorText(void 0);
      }
    } else {
      setErrorText(localeService.t("sheets-conditional-formatting-ui.errorMessage.rangeError"));
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.range")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "univer-mt-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        RangeSelector,
        {
          unitId,
          subUnitId,
          initialValue: rangeString,
          onChange: (_, text) => onRangeSelectorChange(text),
          onVerify: handleVerify
        }
      ),
      errorText && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "univer-mt-1 univer-text-xs univer-text-red-500", children: errorText })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "div",
      {
        className: `univer-mt-4 univer-text-sm univer-text-gray-600 dark:!univer-text-gray-200`,
        children: localeService.t("sheets-conditional-formatting-ui.panel.styleType")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      Select,
      {
        className: "univer-mt-4 univer-w-full",
        value: ruleType,
        options,
        onChange: (e) => setRuleType(e)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      StyleEditor,
      {
        interceptorManager,
        rule: (_c = props.rule) == null ? void 0 : _c.rule,
        onChange: onStyleChange
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "univer-mt-4 univer-flex univer-justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { onClick: handleCancel, children: localeService.t("sheets-conditional-formatting-ui.panel.cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { className: "univer-ml-3", variant: "primary", onClick: handleSubmit, children: localeService.t("sheets-conditional-formatting-ui.panel.submit") })
    ] })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-list/index.tsx
var import_react11 = __toESM(require_react());

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.i18n.controller.ts
var ConditionalFormattingI18nController = class extends Disposable {
  constructor(_localeService) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_initLocal", () => {
    });
    __publicField(this, "_findReplaceIndex", (text) => {
      const reg = /\{([^}]+)?\}/g;
      const result = [];
      let currentValue = reg.exec(text);
      while (currentValue) {
        result.push({
          startIndex: currentValue.index,
          key: Number(currentValue[1]),
          endIndex: currentValue.index + currentValue[0].length - 1
        });
        currentValue = reg.exec(text);
      }
      return result;
    });
    this._initLocal();
  }
  tWithReactNode(key, ...args) {
    const locale = this._localeService.getLocales();
    const keys = key.split(".");
    const resolvedValue = locale && this._localeService.resolveKeyPath(locale, keys);
    if (typeof resolvedValue === "string") {
      const result = [];
      this._findReplaceIndex(resolvedValue).forEach((item, index, list) => {
        const preItem = list[index - 1] || { startIndex: 0, endIndex: -1 };
        if (preItem.endIndex + 1 < item.startIndex) {
          const text = resolvedValue.slice(preItem.endIndex + 1, item.startIndex);
          text && result.push(text);
        }
        args[item.key] && result.push(args[item.key]);
        if (index === list.length - 1) {
          const text = resolvedValue.slice(item.endIndex + 1);
          text && result.push(text);
        }
      });
      return result;
    }
    return [];
  }
};
ConditionalFormattingI18nController = __decorateClass([
  __decorateParam(0, Inject(LocaleService))
], ConditionalFormattingI18nController);

// ../packages/sheets-conditional-formatting-ui/src/components/panel/rule-list/index.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime());
var getRuleDescribe = (rule, localeService) => {
  const ruleConfig = rule.rule;
  switch (ruleConfig.type) {
    case "colorScale" /* colorScale */: {
      return localeService.t("sheets-conditional-formatting-ui.ruleType.colorScale");
    }
    case "dataBar" /* dataBar */: {
      return localeService.t("sheets-conditional-formatting-ui.ruleType.dataBar");
    }
    case "iconSet" /* iconSet */: {
      return localeService.t("sheets-conditional-formatting-ui.ruleType.iconSet");
    }
    case "highlightCell" /* highlightCell */: {
      switch (ruleConfig.subType) {
        case "average" /* average */: {
          const operator = ruleConfig.operator;
          return localeService.t(`sheets-conditional-formatting-ui.preview.describe.${operator}`, localeService.t("sheets-conditional-formatting-ui.subRuleType.average"));
        }
        case "duplicateValues" /* duplicateValues */: {
          return localeService.t("sheets-conditional-formatting-ui.subRuleType.duplicateValues");
        }
        case "uniqueValues" /* uniqueValues */: {
          return localeService.t("sheets-conditional-formatting-ui.subRuleType.uniqueValues");
        }
        case "number" /* number */: {
          const operator = ruleConfig.operator;
          return localeService.t(`sheets-conditional-formatting-ui.preview.describe.${operator}`, ...Array.isArray(ruleConfig.value) ? ruleConfig.value.map((e) => String(e)) : [String(ruleConfig.value || "")]);
        }
        case "text" /* text */: {
          const operator = ruleConfig.operator;
          return localeService.t(`sheets-conditional-formatting-ui.preview.describe.${operator}`, ruleConfig.value || "");
        }
        case "timePeriod" /* timePeriod */: {
          const operator = ruleConfig.operator;
          return localeService.t(`sheets-conditional-formatting-ui.preview.describe.${operator}`);
        }
        case "rank" /* rank */: {
          if (ruleConfig.isPercent) {
            if (ruleConfig.isBottom) {
              return localeService.t("sheets-conditional-formatting-ui.preview.describe.bottomNPercent", String(ruleConfig.value));
            } else {
              return localeService.t("sheets-conditional-formatting-ui.preview.describe.topNPercent", String(ruleConfig.value));
            }
          } else {
            if (ruleConfig.isBottom) {
              return localeService.t("sheets-conditional-formatting-ui.preview.describe.bottomN", String(ruleConfig.value));
            } else {
              return localeService.t("sheets-conditional-formatting-ui.preview.describe.topN", String(ruleConfig.value));
            }
          }
        }
        case "formula" /* formula */: {
          return localeService.t("sheets-conditional-formatting-ui.ruleType.formula");
        }
      }
    }
  }
};
var RuleList = (props) => {
  const { onClick } = props;
  const conditionalFormattingRuleModel = useDependency(ConditionalFormattingRuleModel);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const selectionManagerService = useDependency(SheetsSelectionsService);
  const commandService = useDependency(ICommandService);
  const localeService = useDependency(LocaleService);
  const injector = useDependency(Injector);
  const conditionalFormattingI18nController = useDependency(ConditionalFormattingI18nController);
  const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */), void 0, void 0, []);
  const unitId = workbook.getUnitId();
  const worksheet = workbook.getActiveSheet();
  if (!worksheet) {
    throw new Error("No active sheet found");
  }
  const subUnitId = worksheet.getSheetId();
  const [currentRuleRanges, setCurrentRuleRanges] = (0, import_react11.useState)([]);
  const [selectValue, setSelectValue] = (0, import_react11.useState)("2");
  const [fetchRuleListId, setFetchRuleListId] = (0, import_react11.useState)(0);
  const [draggingId, setDraggingId] = (0, import_react11.useState)("");
  const selectOption = [
    { label: localeService.t("sheets-conditional-formatting-ui.panel.workSheet"), value: "2" },
    { label: localeService.t("sheets-conditional-formatting-ui.panel.selectedRange"), value: "1" }
  ];
  const getRuleList = () => {
    const ruleList2 = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
    if (!ruleList2 || !ruleList2.length) {
      return [];
    }
    if (selectValue === "1") {
      const selection = selectionManagerService.getCurrentLastSelection();
      if (!selection) {
        return [];
      }
      const range = selection.range;
      const _ruleList = ruleList2.filter((rule) => {
        return rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range));
      });
      return _ruleList;
    } else if (selectValue === "2") {
      return [...ruleList2];
    }
    return [];
  };
  const [ruleList, setRuleList] = (0, import_react11.useState)(getRuleList);
  useHighlightRange(currentRuleRanges);
  (0, import_react11.useEffect)(() => {
    const disposable = commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === SetWorksheetActiveOperation.id) {
        setFetchRuleListId(Math.random());
      }
    });
    return () => disposable.dispose();
  });
  (0, import_react11.useEffect)(() => {
    setRuleList(getRuleList);
  }, [selectValue, fetchRuleListId, unitId, subUnitId]);
  (0, import_react11.useEffect)(() => {
    if (selectValue === "2") {
      return;
    }
    const subscription = new Observable((commandSubscribe) => {
      const commandList2 = [SetSelectionsOperation.id, AddConditionalRuleMutation.id, SetConditionalRuleMutation.id, DeleteConditionalRuleMutation.id, MoveConditionalRuleMutation.id];
      const disposable = commandService.onCommandExecuted((commandInfo) => {
        const { id, params } = commandInfo;
        const unitId2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
        if (commandList2.includes(id) && params.unitId === unitId2) {
          commandSubscribe.next(null);
        }
      });
      return () => disposable.dispose();
    }).pipe(debounceTime(16)).subscribe(() => {
      setRuleList(getRuleList);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [univerInstanceService, selectValue, unitId, subUnitId]);
  (0, import_react11.useEffect)(() => {
    const dispose = conditionalFormattingRuleModel.$ruleChange.subscribe(() => {
      setFetchRuleListId(Math.random());
    });
    return () => dispose.unsubscribe();
  }, [conditionalFormattingRuleModel]);
  const handleDelete = (rule) => {
    var _a;
    const unitId2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
    const subUnitId2 = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
    if (!unitId2 || !subUnitId2) {
      throw new Error("No active sheet found");
    }
    commandService.executeCommand(DeleteCfCommand.id, { unitId: unitId2, subUnitId: subUnitId2, cfId: rule.cfId });
  };
  const handleDragStart = (_layout, from) => {
    var _a;
    const dragRule = ruleListByPermissionCheck[from.y];
    setDraggingId((_a = dragRule == null ? void 0 : dragRule.cfId) != null ? _a : "");
  };
  const handleDragStop = (_layout, from, to) => {
    var _a, _b, _c;
    setDraggingId("");
    const unitId2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
    const subUnitId2 = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
    if (!unitId2 || !subUnitId2) {
      throw new Error("No active sheet found");
    }
    const getSaveIndex = (index) => {
      const length = ruleListByPermissionCheck.length;
      return Math.min(length - 1, Math.max(0, index));
    };
    const cfId = (_b = ruleListByPermissionCheck[getSaveIndex(from.y)]) == null ? void 0 : _b.cfId;
    const targetCfId = (_c = ruleListByPermissionCheck[getSaveIndex(to.y)]) == null ? void 0 : _c.cfId;
    if (!cfId || !targetCfId) {
      return;
    }
    if (cfId !== targetCfId) {
      commandService.executeCommand(MoveCfCommand.id, { unitId: unitId2, subUnitId: subUnitId2, start: { id: cfId, type: "self" }, end: { id: targetCfId, type: to.y > from.y ? "after" : "before" } });
    }
  };
  const handleCreate = () => {
    props.onCreate();
  };
  const handleClear = () => {
    if (selectValue === "2") {
      commandService.executeCommand(ClearWorksheetCfCommand.id);
    } else if (selectValue === "1") {
      const list = ruleList.map((rule) => ({ unitId, subUnitId, cfId: rule.cfId }));
      list.forEach((config) => {
        commandService.executeCommand(DeleteCfCommand.id, config);
      });
    }
  };
  const ruleListByPermissionCheck = (0, import_react11.useMemo)(() => {
    const workbook2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const worksheet2 = workbook2.getActiveSheet();
    return ruleList.filter((rule) => {
      const ranges = rule.ranges;
      const hasPermission = checkRangesEditablePermission(injector, workbook2.getUnitId(), worksheet2.getSheetId(), ranges);
      return hasPermission;
    });
  }, [ruleList]);
  const isHasAllRuleEditPermission = (0, import_react11.useMemo)(() => {
    const workbook2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const worksheet2 = workbook2.getActiveSheet();
    return ruleList.every((rule) => {
      const ranges = rule.ranges;
      const hasPermission = checkRangesEditablePermission(injector, workbook2.getUnitId(), worksheet2.getSheetId(), ranges);
      return hasPermission;
    });
  }, [ruleList]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
      "div",
      {
        className: "\n                  univer-mb-2 univer-flex univer-items-center univer-justify-between univer-gap-2 univer-text-sm\n                ",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "univer-flex univer-items-center univer-gap-2", children: conditionalFormattingI18nController.tWithReactNode(
            "sheets-conditional-formatting-ui.panel.managerRuleSelect",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              Select,
              {
                className: "univer-w-36",
                options: selectOption,
                value: selectValue,
                onChange: (v) => {
                  setSelectValue(v);
                }
              }
            )
          ).map((ele, index) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: ele }, index)) }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "univer-flex univer-justify-end univer-space-x-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tooltip, { title: localeService.t("sheets-conditional-formatting-ui.panel.createRule"), placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "a",
              {
                className: "univer-size-5 univer-cursor-pointer",
                onClick: handleCreate,
                children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IncreaseIcon, {})
              }
            ) }),
            ruleList.length && isHasAllRuleEditPermission ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Tooltip, { title: localeService.t("sheets-conditional-formatting-ui.panel.clear"), placement: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "a",
              {
                className: "univer-size-5 univer-cursor-pointer",
                onClick: handleClear,
                children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DeleteIcon, { className: "univer-text-red-500" })
              }
            ) }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DeleteIcon, { className: "univer-text-gray-300" }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      DraggableList,
      {
        className: "univer-w-full",
        draggableHandle: ".draggableHandle",
        list: ruleListByPermissionCheck,
        onListChange: () => void 0,
        idKey: "cfId",
        rowHeight: 60,
        margin: [0, 10],
        onDragStop: handleDragStop,
        onDragStart: handleDragStart,
        itemRender: (rule) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
          "div",
          {
            className: clsx(`univer-group univer-relative univer-flex univer-items-center univer-justify-between univer-rounded univer-py-2 univer-pl-5 univer-pr-8 hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700`, {
              "univer-bg-gray-100 dark:!univer-bg-gray-700": draggingId === rule.cfId
            }),
            onMouseMove: () => {
              rule.ranges !== currentRuleRanges && setCurrentRuleRanges(rule.ranges);
            },
            onMouseLeave: () => setCurrentRuleRanges([]),
            onClick: () => {
              onClick(rule);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                "div",
                {
                  className: clsx(`univer-absolute univer-left-0 univer-hidden univer-size-5 univer-cursor-grab univer-items-center univer-justify-center univer-rounded group-hover:univer-flex`, "draggableHandle"),
                  onClick: (e) => e.stopPropagation(),
                  children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SequenceIcon, {})
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
                "div",
                {
                  className: "univer-min-w-0 univer-max-w-full univer-flex-shrink univer-overflow-hidden",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                      "div",
                      {
                        className: `univer-text-sm univer-text-gray-900 dark:!univer-text-white`,
                        children: getRuleDescribe(rule, localeService)
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                      "div",
                      {
                        className: "\n                                      univer-max-w-[250px] univer-overflow-hidden univer-text-ellipsis univer-text-xs\n                                      univer-text-gray-400\n                                    ",
                        children: rule.ranges.map((range) => serializeRange(range)).join(",")
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Preview, { rule: rule.rule }) }),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
                "div",
                {
                  className: clsx(`univer-absolute univer-right-1 univer-hidden univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded univer-text-red-500 group-hover:univer-flex hover:univer-bg-gray-200`, {
                    "univer-flex univer-items-center univer-justify-center": draggingId === rule.cfId
                  }),
                  onClick: (e) => {
                    e.stopPropagation();
                    handleDelete(rule);
                    setCurrentRuleRanges([]);
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DeleteIcon, {})
                }
              )
            ]
          }
        )
      }
    ) })
  ] });
};

// ../packages/sheets-conditional-formatting-ui/src/components/panel/index.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime());
var ConditionFormattingPanel = (props) => {
  const [currentEditRule, setCurrentEditRule] = (0, import_react12.useState)(props.rule);
  const [isShowRuleEditor, setIsShowRuleEditor] = (0, import_react12.useState)(!!props.rule);
  const createCfRule = () => {
    setIsShowRuleEditor(true);
  };
  const handleCancel = () => {
    setIsShowRuleEditor(false);
    setCurrentEditRule(void 0);
  };
  const handleRuleClick = (rule) => {
    setCurrentEditRule(rule);
    setIsShowRuleEditor(true);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "univer-flex univer-h-full univer-flex-col univer-justify-between univer-py-4", children: isShowRuleEditor ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(RuleEdit, { onCancel: handleCancel, rule: currentEditRule }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(RuleList, { onClick: handleRuleClick, onCreate: createCfRule }) });
};

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.panel.controller.ts
var CF_PANEL_KEY = "sheet.conditional.formatting.panel";
var ConditionalFormattingPanelController = class extends Disposable {
  constructor(_univerInstanceService, _injector, _componentManager, _sidebarService, _localeService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sidebarDisposable", null);
    this._initPanel();
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe((sheet) => {
        var _a;
        if (!sheet) (_a = this._sidebarDisposable) == null ? void 0 : _a.dispose();
      })
    );
    this.disposeWithMe(this._sidebarService.sidebarOptions$.subscribe((info) => {
      if (info.id === CF_PANEL_KEY) {
        if (!info.visible) {
          setTimeout(() => {
            this._sidebarService.sidebarOptions$.next({ visible: false });
          });
        }
      }
    }));
  }
  openPanel(rule) {
    const props = {
      id: CF_PANEL_KEY,
      header: { title: this._localeService.t("sheets-conditional-formatting-ui.title") },
      children: {
        label: CF_PANEL_KEY,
        rule,
        key: generateRandomId(4)
      },
      onClose: () => this._sidebarDisposable = null
    };
    this._sidebarDisposable = this._sidebarService.open(props);
  }
  _initPanel() {
    this.disposeWithMe(
      this._componentManager.register(CF_PANEL_KEY, ConditionFormattingPanel)
    );
  }
};
ConditionalFormattingPanelController = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ComponentManager)),
  __decorateParam(3, Inject(ISidebarService)),
  __decorateParam(4, Inject(LocaleService))
], ConditionalFormattingPanelController);

// ../packages/sheets-conditional-formatting-ui/src/commands/operations/open-conditional-formatting-panel.ts
var OpenConditionalFormattingOperator = {
  id: "sheet.operation.open.conditional.formatting.panel",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    var _a;
    const conditionalFormattingMenuController = accessor.get(ConditionalFormattingPanelController);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const ranges = ((_a = selectionManagerService.getCurrentSelections()) == null ? void 0 : _a.map((s) => s.range)) || [];
    const type = params.value;
    switch (type) {
      case 3 /* highlightCell */: {
        conditionalFormattingMenuController.openPanel({ ...createDefaultRule(), ranges });
        break;
      }
      case 4 /* rank */: {
        const rule = {
          ...createDefaultRule,
          ranges,
          rule: {
            type: "highlightCell" /* highlightCell */,
            subType: "rank" /* rank */
          }
        };
        conditionalFormattingMenuController.openPanel(rule);
        break;
      }
      case 5 /* formula */: {
        const rule = {
          ...createDefaultRule,
          ranges,
          rule: {
            type: "highlightCell" /* highlightCell */,
            subType: "formula" /* formula */,
            value: "="
          }
        };
        conditionalFormattingMenuController.openPanel(rule);
        break;
      }
      case 6 /* colorScale */: {
        const rule = {
          ...createDefaultRule,
          ranges,
          rule: {
            type: "colorScale" /* colorScale */,
            config: []
          }
        };
        conditionalFormattingMenuController.openPanel(rule);
        break;
      }
      case 7 /* dataBar */: {
        const rule = {
          ...createDefaultRule,
          ranges,
          rule: {
            type: "dataBar" /* dataBar */,
            isShowValue: true
          }
        };
        conditionalFormattingMenuController.openPanel(rule);
        break;
      }
      case 8 /* icon */: {
        const rule = {
          ...createDefaultRule,
          ranges,
          rule: {
            type: "iconSet" /* iconSet */,
            config: [],
            isShowValue: true
          }
        };
        conditionalFormattingMenuController.openPanel(rule);
        break;
      }
      case 2 /* viewRule */: {
        conditionalFormattingMenuController.openPanel();
        break;
      }
      case 1 /* createRule */: {
        conditionalFormattingMenuController.openPanel({ ...createDefaultRule(), ranges });
        break;
      }
      case 9 /* clearRangeRules */: {
        commandService.executeCommand(ClearRangeCfCommand.id, { ranges });
        break;
      }
      case 10 /* clearWorkSheetRules */: {
        commandService.executeCommand(ClearWorksheetCfCommand.id);
        break;
      }
    }
    return true;
  }
};

// ../packages/sheets-conditional-formatting-ui/src/config/config.ts
var SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY = "sheets-conditional-formatting-ui.config";
var configSymbol = Symbol(SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf-formula-ref-range.controller.ts
var ConditionalFormattingFormulaRefRangeController = class extends Disposable {
  constructor(_conditionalFormattingRuleModel, _formulaRefRangeService, _injector) {
    super();
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    __publicField(this, "_formulaRefRangeService", _formulaRefRangeService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_disposableMap", /* @__PURE__ */ new Map());
    this._initRefRange();
  }
  _getIdWithUnitId(unitID, subUnitId, cfId) {
    return `${unitID}_${subUnitId}_${cfId}`;
  }
  _getRuleFormulas(rule) {
    const formulas = [];
    const ruleConfig = rule.rule;
    switch (ruleConfig.type) {
      case "highlightCell" /* highlightCell */:
        if (ruleConfig.subType === "formula" /* formula */) {
          formulas.push(ruleConfig.value);
        }
        break;
      case "dataBar" /* dataBar */: {
        const dataBar = ruleConfig;
        if (dataBar.config.min.type === "formula" /* formula */) {
          formulas.push(dataBar.config.min.value);
        }
        if (dataBar.config.max.type === "formula" /* formula */) {
          formulas.push(dataBar.config.max.value);
        }
        break;
      }
      case "colorScale" /* colorScale */: {
        const colorScale = ruleConfig;
        colorScale.config.forEach((item) => {
          if (item.value.type === "formula" /* formula */) {
            formulas.push(item.value.value);
          }
        });
        break;
      }
      case "iconSet" /* iconSet */: {
        const iconSet = ruleConfig;
        iconSet.config.forEach((item) => {
          if (item.value.type === "formula" /* formula */) {
            formulas.push(item.value.value);
          }
        });
        break;
      }
    }
    return formulas;
  }
  _updateRuleFormulas(rule, formulas) {
    const newRule = Tools.deepClone(rule);
    const ruleConfig = newRule.rule;
    let formulaIndex = 0;
    switch (ruleConfig.type) {
      case "highlightCell" /* highlightCell */:
        if (ruleConfig.subType === "formula" /* formula */) {
          ruleConfig.value = formulas[formulaIndex++];
        }
        break;
      case "dataBar" /* dataBar */: {
        const dataBar = ruleConfig;
        if (dataBar.config.min.type === "formula" /* formula */) {
          dataBar.config.min.value = formulas[formulaIndex++];
        }
        if (dataBar.config.max.type === "formula" /* formula */) {
          dataBar.config.max.value = formulas[formulaIndex++];
        }
        break;
      }
      case "colorScale" /* colorScale */: {
        const colorScale = ruleConfig;
        colorScale.config.forEach((item) => {
          if (item.value.type === "formula" /* formula */) {
            item.value.value = formulas[formulaIndex++];
          }
        });
        break;
      }
      case "iconSet" /* iconSet */: {
        const iconSet = ruleConfig;
        iconSet.config.forEach((item) => {
          if (item.value.type === "formula" /* formula */) {
            item.value.value = formulas[formulaIndex++];
          }
        });
        break;
      }
    }
    return newRule;
  }
  register(unitId, subUnitId, rule) {
    const oldRanges = rule.ranges;
    const oldFormulas = this._getRuleFormulas(rule);
    const disposable = this._formulaRefRangeService.registerRangeFormula(unitId, subUnitId, oldRanges, oldFormulas, (res) => {
      if (res.length === 0) {
        return {
          undos: [{
            id: AddConditionalRuleMutation.id,
            params: {
              unitId,
              subUnitId,
              rule
            }
          }],
          redos: [{
            id: DeleteConditionalRuleMutation.id,
            params: {
              unitId,
              subUnitId,
              cfId: rule.cfId
            }
          }]
        };
      }
      const redos = [];
      const undos = [];
      const first = res[0];
      const firstRule = this._updateRuleFormulas(rule, first.formulas);
      firstRule.ranges = first.ranges;
      redos.push({
        id: SetConditionalRuleMutation.id,
        params: {
          unitId,
          subUnitId,
          cfId: rule.cfId,
          rule: firstRule
        }
      });
      undos.push(...setConditionalRuleMutationUndoFactory(this._injector, {
        unitId,
        subUnitId,
        cfId: rule.cfId,
        rule: firstRule
      }));
      for (let i = 1; i < res.length; i++) {
        const item = res[i];
        const newCfId = createCfId();
        const newRule = this._updateRuleFormulas(rule, item.formulas);
        newRule.cfId = newCfId;
        newRule.ranges = item.ranges;
        redos.push({
          id: AddConditionalRuleMutation.id,
          params: {
            unitId,
            subUnitId,
            rule: newRule
          }
        });
        undos.push(AddConditionalRuleMutationUndoFactory(this._injector, {
          unitId,
          subUnitId,
          rule: newRule
        }));
      }
      return {
        undos,
        redos
      };
    });
    const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
    this._disposableMap.set(id, disposable);
  }
  _initRefRange() {
    const allRules = this._conditionalFormattingRuleModel.getAll();
    for (const [unitId, subUnitMap] of allRules) {
      for (const [subUnitId, rules] of subUnitMap) {
        for (const rule of rules) {
          this.register(unitId, subUnitId, rule);
        }
      }
    }
    this.disposeWithMe(
      this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
        const { unitId, subUnitId, rule } = option;
        switch (option.type) {
          case "add": {
            this.register(unitId, subUnitId, rule);
            break;
          }
          case "delete": {
            const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
            const disposable = this._disposableMap.get(id);
            if (disposable) {
              disposable.dispose();
              this._disposableMap.delete(id);
            }
            break;
          }
          case "set": {
            const id = this._getIdWithUnitId(unitId, subUnitId, rule.cfId);
            const disposable = this._disposableMap.get(id);
            if (disposable) {
              disposable.dispose();
              this._disposableMap.delete(id);
            }
            this.register(unitId, subUnitId, rule);
            break;
          }
        }
      })
    );
    this.disposeWithMe(toDisposable(() => {
      this._disposableMap.forEach((item) => {
        item.dispose();
      });
      this._disposableMap.clear();
    }));
  }
};
ConditionalFormattingFormulaRefRangeController = __decorateClass([
  __decorateParam(0, Inject(ConditionalFormattingRuleModel)),
  __decorateParam(1, Inject(FormulaRefRangeService)),
  __decorateParam(2, Inject(Injector))
], ConditionalFormattingFormulaRefRangeController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.copy-paste.controller.ts
var specialPastes = [
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
  PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_BESIDES_BORDER
];
var ConditionalFormattingCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _conditionalFormattingRuleModel, _injector, _conditionalFormattingViewModel, _univerInstanceService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_conditionalFormattingViewModel", _conditionalFormattingViewModel);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_copyInfo");
    this._initClipboardHook();
  }
  _initClipboardHook() {
    this.disposeWithMe(
      this._sheetClipboardService.addClipboardHook({
        id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
        onBeforeCopy: (unitId, subUnitId, range) => this._collectConditionalRule(unitId, subUnitId, range),
        onPasteCells: (pasteFrom, pasteTo, _data, payload) => {
          if (!pasteFrom || !this._copyInfo || !specialPastes.includes(payload.pasteType)) {
            return { redos: [], undos: [] };
          }
          return this._generateConditionalFormattingMutations(pasteFrom, pasteTo, payload);
        }
      })
    );
  }
  _collectConditionalRule(unitId, subUnitId, range) {
    const matrix = new ObjectMatrix();
    const cfMap = {};
    this._copyInfo = {
      matrix,
      info: {
        unitId,
        subUnitId,
        cfMap
      }
    };
    const discreteRange = this._injector.invoke((accessor) => {
      return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
    });
    if (!discreteRange) {
      return;
    }
    const { rows, cols } = discreteRange;
    const cfIdSet = /* @__PURE__ */ new Set();
    rows.forEach((row, rowIndex) => {
      cols.forEach((col, colIndex) => {
        const cellCfList = this._conditionalFormattingViewModel.getCellCfs(unitId, subUnitId, row, col);
        if (!cellCfList) {
          return;
        }
        cellCfList.forEach((item) => cfIdSet.add(item.cfId));
        matrix.setValue(rowIndex, colIndex, cellCfList.map((item) => item.cfId));
      });
    });
    cfIdSet.forEach((cfId) => {
      const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
      if (rule) {
        cfMap[cfId] = rule.rule;
      }
    });
  }
  // eslint-disable-next-line max-lines-per-function
  _generateConditionalFormattingMutations(pasteFrom, pasteTo, payload) {
    const { unitId: copyUnitId, subUnitId: copySubUnitId, range: copyRange } = pasteFrom;
    const { unitId: pastedUnitId, subUnitId: pastedSubUnitId, range: pastedRange } = pasteTo;
    const { copyType = "COPY" /* COPY */ } = payload;
    const target = getSheetCommandTarget(this._univerInstanceService, { unitId: pastedUnitId, subUnitId: pastedSubUnitId });
    if (!target) {
      return { redos: [], undos: [] };
    }
    if (copyType === "CUT" /* CUT */ && pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId) {
      this._copyInfo = null;
      return { redos: [], undos: [] };
    }
    const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
    const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
    const effectedConditionalFormattingRuleMatrix = {};
    Range.foreach(vPastedRange, (row, col) => {
      const { row: realRow, col: realCol } = mapFunc(row, col);
      const cellCfList = this._conditionalFormattingViewModel.getCellCfs(pastedUnitId, pastedSubUnitId, realRow, realCol);
      if (cellCfList) {
        cellCfList.forEach((item) => {
          if (!effectedConditionalFormattingRuleMatrix[item.cfId]) {
            const ruleMatrix = new ObjectMatrix();
            effectedConditionalFormattingRuleMatrix[item.cfId] = {
              unitId: pastedUnitId,
              subUnitId: pastedSubUnitId,
              ruleMatrix
            };
            const rule = this._conditionalFormattingRuleModel.getRule(pastedUnitId, pastedSubUnitId, item.cfId);
            rule == null ? void 0 : rule.ranges.forEach((range) => {
              Range.foreach(range, (row2, col2) => {
                ruleMatrix.setValue(row2, col2, 1);
              });
            });
          }
          effectedConditionalFormattingRuleMatrix[item.cfId].ruleMatrix.realDeleteValue(realRow, realCol);
        });
      }
    });
    if (copyType === "CUT" /* CUT */ && (pastedUnitId !== copyUnitId || pastedSubUnitId !== copySubUnitId)) {
      Range.foreach(vCopyRange, (row, col) => {
        const { row: realRow, col: realCol } = mapFunc(row, col);
        const cellCfList = this._conditionalFormattingViewModel.getCellCfs(copyUnitId, copySubUnitId, realRow, realCol);
        if (cellCfList) {
          cellCfList.forEach((item) => {
            if (!effectedConditionalFormattingRuleMatrix[item.cfId]) {
              const ruleMatrix = new ObjectMatrix();
              effectedConditionalFormattingRuleMatrix[item.cfId] = {
                unitId: copyUnitId,
                subUnitId: copySubUnitId,
                ruleMatrix
              };
              const rule = this._conditionalFormattingRuleModel.getRule(copyUnitId, copySubUnitId, item.cfId);
              rule == null ? void 0 : rule.ranges.forEach((range) => {
                Range.foreach(range, (row2, col2) => {
                  ruleMatrix.setValue(row2, col2, 1);
                });
              });
            }
            effectedConditionalFormattingRuleMatrix[item.cfId].ruleMatrix.realDeleteValue(realRow, realCol);
          });
        }
      });
    }
    const { matrix, info } = this._copyInfo;
    const waitAddRule = [];
    const cacheCfIdMap = {};
    const getCurrentSheetCfRule = (copyRangeCfId) => {
      const oldRule = info == null ? void 0 : info.cfMap[copyRangeCfId];
      const targetRule = [...this._conditionalFormattingRuleModel.getSubunitRules(pastedUnitId, pastedSubUnitId) || [], ...waitAddRule].find((rule) => {
        return Tools.diffValue(rule.rule, oldRule);
      });
      if (targetRule) {
        cacheCfIdMap[copyRangeCfId] = targetRule;
        return targetRule;
      } else {
        const rule = {
          rule: oldRule,
          cfId: this._conditionalFormattingRuleModel.createCfId(pastedUnitId, pastedSubUnitId),
          ranges: [],
          stopIfTrue: false
        };
        cacheCfIdMap[copyRangeCfId] = rule;
        waitAddRule.push(rule);
        return rule;
      }
    };
    repeatRange.forEach((item) => {
      matrix && matrix.forValue((row, col, copyRangeCfIdList) => {
        const range = Rectangle.getPositionRange(
          {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col
          },
          item.startRange
        );
        const { row: _row, col: _col } = mapFunc(range.startRow, range.startColumn);
        copyRangeCfIdList.forEach((cfId) => {
          const rule = cacheCfIdMap[cfId] || getCurrentSheetCfRule(cfId);
          if (!effectedConditionalFormattingRuleMatrix[rule.cfId]) {
            const ruleMatrix = new ObjectMatrix();
            effectedConditionalFormattingRuleMatrix[rule.cfId] = {
              unitId: pastedUnitId,
              subUnitId: pastedSubUnitId,
              ruleMatrix
            };
            rule.ranges.forEach((range2) => {
              Range.foreach(range2, (row2, col2) => {
                ruleMatrix.setValue(row2, col2, 1);
              });
            });
          }
          effectedConditionalFormattingRuleMatrix[rule.cfId].ruleMatrix.setValue(_row, _col, 1);
        });
      });
    });
    const redos = [];
    const undos = [];
    for (const cfId in effectedConditionalFormattingRuleMatrix) {
      const { unitId, subUnitId, ruleMatrix } = effectedConditionalFormattingRuleMatrix[cfId];
      const ranges = findAllRectangle(createTopMatrixFromMatrix(ruleMatrix));
      if (!ranges.length) {
        const deleteParams = {
          unitId,
          subUnitId,
          cfId
        };
        redos.push({ id: DeleteConditionalRuleMutation.id, params: deleteParams });
        undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, deleteParams));
      }
      if (waitAddRule.some((rule) => rule.cfId === cfId)) {
        const rule = waitAddRule.find((rule2) => rule2.cfId === cfId);
        const addParams = {
          unitId: pastedUnitId,
          subUnitId: pastedSubUnitId,
          rule: { ...rule, ranges }
        };
        redos.push({ id: AddConditionalRuleMutation.id, params: addParams });
        undos.push(AddConditionalRuleMutationUndoFactory(this._injector, addParams));
      } else {
        const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
        if (!rule) {
          continue;
        }
        const setParams = {
          unitId,
          subUnitId,
          rule: { ...rule, ranges }
        };
        redos.push({ id: SetConditionalRuleMutation.id, params: setParams });
        undos.push(...setConditionalRuleMutationUndoFactory(this._injector, setParams));
      }
    }
    return {
      redos,
      undos
    };
  }
};
ConditionalFormattingCopyPasteController = __decorateClass([
  __decorateParam(0, Inject(ISheetClipboardService)),
  __decorateParam(1, Inject(ConditionalFormattingRuleModel)),
  __decorateParam(2, Inject(Injector)),
  __decorateParam(3, Inject(ConditionalFormattingViewModel)),
  __decorateParam(4, Inject(IUniverInstanceService))
], ConditionalFormattingCopyPasteController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.permission.controller.ts
var ConditionalFormattingPermissionController = class extends Disposable {
  constructor(_localeService, _commandService, _sheetPermissionCheckController) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        if (command.id === AddCfCommand.id) {
          const { unitId, subUnitId, rule: { ranges } } = command.params;
          const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission]
          }, ranges, unitId, subUnitId);
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-conditional-formatting-ui.permission.dialog.setStyleErr"));
          }
        }
      })
    );
  }
};
ConditionalFormattingPermissionController = __decorateClass([
  __decorateParam(0, Inject(LocaleService)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetPermissionCheckController))
], ConditionalFormattingPermissionController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.render.controller.ts
var SheetsCfRenderController = class extends Disposable {
  constructor(_sheetInterceptorService, _conditionalFormattingService, _univerInstanceService, _renderManagerService, _conditionalFormattingViewModel, _conditionalFormattingRuleModel) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_conditionalFormattingService", _conditionalFormattingService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_conditionalFormattingViewModel", _conditionalFormattingViewModel);
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    /**
     * When a set operation is triggered multiple times over a short period of time, it may result in some callbacks not being disposed,and caused a render cache exception.
     * The solution here is to store all the asynchronous tasks and focus on processing after the last callback
     */
    __publicField(this, "_ruleChangeCacheMap", /* @__PURE__ */ new Map());
    this._initViewModelInterceptor();
    this._initSkeleton();
    this.disposeWithMe(() => {
      this._ruleChangeCacheMap.clear();
    });
  }
  _markDirtySkeleton() {
    var _a, _b, _c;
    const unitId = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
    (_a = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a.with(SheetSkeletonManagerService).reCalculate();
    (_c = (_b = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _b.mainComponent) == null ? void 0 : _c.makeDirty();
  }
  _initSkeleton() {
    this.disposeWithMe(merge(this._conditionalFormattingRuleModel.$ruleChange, this._conditionalFormattingViewModel.markDirty$).pipe(
      bufferTime(16),
      filter((v) => !!v.length),
      filter((v) => {
        const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;
        return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
      })
    ).subscribe(() => this._markDirtySkeleton()));
  }
  _initViewModelInterceptor() {
    this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
      effect: 1 /* Style */,
      handler: (cell, context, next) => {
        const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
        if (!result) {
          return next(cell);
        }
        const styleMap = context.workbook.getStyles();
        const defaultStyle = (typeof (cell == null ? void 0 : cell.s) === "string" ? styleMap.get(cell == null ? void 0 : cell.s) : cell == null ? void 0 : cell.s) || {};
        const cloneCell = cell === context.rawData ? { ...context.rawData } : cell;
        if (result.style) {
          const activeStyle = {
            ...defaultStyle,
            ...result.style
          };
          Object.assign(cloneCell, { s: activeStyle });
        }
        if (!cloneCell.fontRenderExtension) {
          cloneCell.fontRenderExtension = {};
          if (result.isShowValue !== void 0) {
            cloneCell.fontRenderExtension.isSkip = !result.isShowValue;
          }
        }
        if (result.dataBar) {
          cloneCell.dataBar = result.dataBar;
        }
        if (result.iconSet) {
          cloneCell.iconSet = result.iconSet;
          cloneCell.fontRenderExtension.leftOffset = DEFAULT_PADDING + DEFAULT_WIDTH;
        }
        return next(cloneCell);
      },
      priority: 10
    }));
  }
};
SheetsCfRenderController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(ConditionalFormattingService)),
  __decorateParam(2, Inject(IUniverInstanceService)),
  __decorateParam(3, Inject(IRenderManagerService)),
  __decorateParam(4, Inject(ConditionalFormattingViewModel)),
  __decorateParam(5, Inject(ConditionalFormattingRuleModel))
], SheetsCfRenderController);

// ../packages/sheets-conditional-formatting-ui/src/mobile-plugin.ts
var UniverSheetsConditionalFormattingMobileUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY, rest);
    this._initCommand();
    this._injector.add([SheetsCfRenderController]);
    this._injector.add([ConditionalFormattingCopyPasteController]);
    this._injector.add([ConditionalFormattingPermissionController]);
    this._injector.add([ConditionalFormattingI18nController]);
    this._injector.add([ConditionalFormattingFormulaRefRangeController]);
  }
  _initCommand() {
    [
      AddAverageCfCommand,
      AddColorScaleConditionalRuleCommand,
      AddDataBarConditionalRuleCommand,
      AddDuplicateValuesCfCommand,
      AddNumberCfCommand,
      AddRankCfCommand,
      AddTextCfCommand,
      AddTimePeriodCfCommand,
      AddUniqueValuesCfCommand,
      OpenConditionalFormattingOperator
    ].forEach((m) => {
      this._commandService.registerCommand(m);
    });
  }
};
__publicField(UniverSheetsConditionalFormattingMobileUIPlugin, "pluginName", `${SHEET_CONDITIONAL_FORMATTING_PLUGIN}_MOBILE_UI_PLUGIN`);
__publicField(UniverSheetsConditionalFormattingMobileUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsConditionalFormattingMobileUIPlugin, "version", package_default.version);
__publicField(UniverSheetsConditionalFormattingMobileUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsConditionalFormattingMobileUIPlugin = __decorateClass([
  DependentOn(UniverSheetsConditionalFormattingPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, IConfigService)
], UniverSheetsConditionalFormattingMobileUIPlugin);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.auto-fill.controller.ts
var ConditionalFormattingAutoFillController = class extends Disposable {
  constructor(_injector, _univerInstanceService, _autoFillService, _conditionalFormattingRuleModel, _conditionalFormattingViewModel) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_autoFillService", _autoFillService);
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    __publicField(this, "_conditionalFormattingViewModel", _conditionalFormattingViewModel);
    this._initAutoFill();
  }
  // eslint-disable-next-line max-lines-per-function
  _initAutoFill() {
    const noopReturnFunc = () => ({ redos: [], undos: [] });
    const loopFunc = (sourceStartCell, targetStartCell, relativeRange, matrixMap, mapFunc) => {
      var _a;
      const unitId = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getUnitId();
      const subUnitId = (_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */).getActiveSheet()) == null ? void 0 : _a.getSheetId();
      if (!unitId || !subUnitId) {
        return;
      }
      const sourceRange = {
        startRow: sourceStartCell.row,
        startColumn: sourceStartCell.col,
        endColumn: sourceStartCell.col,
        endRow: sourceStartCell.row
      };
      const targetRange = {
        startRow: targetStartCell.row,
        startColumn: targetStartCell.col,
        endColumn: targetStartCell.col,
        endRow: targetStartCell.row
      };
      Range.foreach(relativeRange, (row, col) => {
        const sourcePositionRange = Rectangle.getPositionRange(
          {
            startRow: row,
            startColumn: col,
            endColumn: col,
            endRow: row
          },
          sourceRange
        );
        const targetPositionRange = Rectangle.getPositionRange(
          {
            startRow: row,
            startColumn: col,
            endColumn: col,
            endRow: row
          },
          targetRange
        );
        const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
        const sourceCellCf = this._conditionalFormattingViewModel.getCellCfs(
          unitId,
          subUnitId,
          sourceRow,
          sourceCol
        );
        const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);
        const targetCellCf = this._conditionalFormattingViewModel.getCellCfs(
          unitId,
          subUnitId,
          targetRow,
          targetCol
        );
        if (targetCellCf) {
          targetCellCf.forEach((cf) => {
            let matrix = matrixMap.get(cf.cfId);
            if (!matrixMap.get(cf.cfId)) {
              const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cf.cfId);
              if (!rule) {
                return;
              }
              matrix = new ObjectMatrix();
              rule.ranges.forEach((range) => {
                Range.foreach(range, (row2, col2) => {
                  matrix.setValue(row2, col2, 1);
                });
              });
              matrixMap.set(cf.cfId, matrix);
            }
            matrix.realDeleteValue(targetRow, targetCol);
          });
        }
        if (sourceCellCf) {
          sourceCellCf.forEach((cf) => {
            let matrix = matrixMap.get(cf.cfId);
            if (!matrixMap.get(cf.cfId)) {
              const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cf.cfId);
              if (!rule) {
                return;
              }
              matrix = new ObjectMatrix();
              rule.ranges.forEach((range) => {
                Range.foreach(range, (row2, col2) => {
                  matrix.setValue(row2, col2, 1);
                });
              });
              matrixMap.set(cf.cfId, matrix);
            }
            matrix.setValue(targetRow, targetCol, 1);
          });
        }
      });
    };
    const generalApplyFunc = (sourceRange, targetRange) => {
      var _a, _b, _c;
      const unitId = (_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getUnitId();
      const subUnitId = (_c = (_b = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _b.getActiveSheet()) == null ? void 0 : _c.getSheetId();
      const matrixMap = /* @__PURE__ */ new Map();
      const redos = [];
      const undos = [];
      if (!unitId || !subUnitId) {
        return noopReturnFunc();
      }
      const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
      const [vSourceRange, vTargetRange] = virtualRange.ranges;
      const { mapFunc } = virtualRange;
      const sourceStartCell = {
        row: vSourceRange.startRow,
        col: vSourceRange.startColumn
      };
      const repeats = tools_default.getAutoFillRepeatRange(vSourceRange, vTargetRange);
      repeats.forEach((repeat) => {
        loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange, matrixMap, mapFunc);
      });
      matrixMap.forEach((item, cfId) => {
        const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
        if (!rule) {
          return;
        }
        const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
        if (ranges.length) {
          const params = {
            unitId,
            subUnitId,
            rule: { ...rule, ranges }
          };
          redos.push({ id: SetConditionalRuleMutation.id, params });
          undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
        } else {
          const params = {
            unitId,
            subUnitId,
            cfId: rule.cfId
          };
          redos.push({ id: DeleteConditionalRuleMutation.id, params });
          undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
        }
      });
      return {
        undos,
        redos
      };
    };
    const hook = {
      id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
      onFillData: (location, direction, applyType) => {
        if (applyType === "COPY" /* COPY */ || applyType === "ONLY_FORMAT" /* ONLY_FORMAT */ || applyType === "SERIES" /* SERIES */) {
          const { source, target } = location;
          return generalApplyFunc(source, target);
        }
        return noopReturnFunc();
      }
    };
    this.disposeWithMe(this._autoFillService.addHook(hook));
  }
};
ConditionalFormattingAutoFillController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(IAutoFillService)),
  __decorateParam(3, Inject(ConditionalFormattingRuleModel)),
  __decorateParam(4, Inject(ConditionalFormattingViewModel))
], ConditionalFormattingAutoFillController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.clear.controller.ts
var ConditionalFormattingClearController = class extends Disposable {
  constructor(_injector, _univerInstanceService, _sheetInterceptorService, _selectionManagerService, _conditionalFormattingRuleModel) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_selectionManagerService", _selectionManagerService);
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    this._init();
  }
  _init() {
    this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
      getMutations: (commandInfo) => {
        var _a;
        const redos = [];
        const undos = [];
        const defaultV = { redos, undos };
        if ([ClearSelectionFormatCommand.id, ClearSelectionAllCommand.id].includes(commandInfo.id)) {
          const ranges = (_a = this._selectionManagerService.getCurrentSelections()) == null ? void 0 : _a.map((s) => s.range);
          if (!ranges) {
            return defaultV;
          }
          const workbook = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
          const worksheet = workbook.getActiveSheet();
          if (!worksheet) {
            return defaultV;
          }
          const unitId = workbook.getUnitId();
          const subUnitId = worksheet.getSheetId();
          const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
          if (!allRules || !allRules.length) {
            return defaultV;
          }
          const { redos: interceptRedos, undos: interceptUndos } = generateClearCfMutations(this._injector, allRules, ranges, unitId, subUnitId);
          redos.push(...interceptRedos);
          undos.push(...interceptUndos);
        }
        return defaultV;
      }
    }));
    this.disposeWithMe(this._sheetInterceptorService.interceptRanges({
      getMutations: ({ unitId, subUnitId, ranges }) => {
        const redos = [];
        const undos = [];
        const emptyInterceptorArr = { redos, undos };
        if (!ranges || !ranges.length) {
          return emptyInterceptorArr;
        }
        const allRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
        if (!allRules || !allRules.length) {
          return emptyInterceptorArr;
        }
        const { redos: interceptRedos, undos: interceptUndos } = generateClearCfMutations(this._injector, allRules, ranges, unitId, subUnitId);
        redos.push(...interceptRedos);
        undos.push(...interceptUndos);
        return emptyInterceptorArr;
      }
    }));
  }
};
ConditionalFormattingClearController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(SheetInterceptorService)),
  __decorateParam(3, Inject(SheetsSelectionsService)),
  __decorateParam(4, Inject(ConditionalFormattingRuleModel))
], ConditionalFormattingClearController);
function generateClearCfMutations(injector, allRules, ranges, unitId, subUnitId) {
  const redos = [];
  const undos = [];
  allRules.filter((rule) => {
    return ranges.some((range) => rule.ranges.some((ruleRange) => Rectangle.getIntersects(ruleRange, range)));
  }).forEach((rule) => {
    const mergeUtil = new RangeMergeUtil();
    const mergeRanges = mergeUtil.add(...rule.ranges).subtract(...ranges).merge();
    if (mergeRanges.length) {
      const redo = {
        id: SetConditionalRuleMutation.id,
        params: {
          unitId,
          subUnitId,
          rule: { ...rule, ranges: mergeRanges }
        }
      };
      const undo = setConditionalRuleMutationUndoFactory(injector, redo.params);
      redos.push(redo);
      undos.push(...undo);
    } else {
      const redo = {
        id: DeleteConditionalRuleMutation.id,
        params: {
          unitId,
          subUnitId,
          cfId: rule.cfId
        }
      };
      const undo = DeleteConditionalRuleMutationUndoFactory(injector, redo.params);
      redos.push(redo);
      undos.push(...undo);
    }
  });
  return { redos, undos };
}

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.editor.controller.ts
var ConditionalFormattingEditorController = class extends Disposable {
  constructor(_sheetInterceptorService, _conditionalFormattingService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_conditionalFormattingService", _conditionalFormattingService);
    this._initInterceptorEditorEnd();
  }
  /**
   * Process the  values after  edit
   * @private
   * @memberof NumfmtService
   */
  _initInterceptorEditorEnd() {
    this.disposeWithMe(
      toDisposable(
        this._sheetInterceptorService.writeCellInterceptor.intercept(
          AFTER_CELL_EDIT,
          {
            handler: (value, context, next) => {
              var _a, _b, _c;
              if (!value) {
                next(value);
              }
              const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
              const cfStyle = (_a = result == null ? void 0 : result.style) != null ? _a : {};
              const keys = Object.keys(cfStyle);
              if (value == null ? void 0 : value.p) {
                (_c = (_b = value.p.body) == null ? void 0 : _b.textRuns) == null ? void 0 : _c.forEach((item) => {
                  if (item.ts) {
                    keys.forEach((key) => {
                      var _a2;
                      (_a2 = item.ts) == null ? true : delete _a2[key];
                    });
                  }
                });
                return next(value);
              } else {
                const s = { ...(typeof (value == null ? void 0 : value.s) === "string" ? context.workbook.getStyles().get(value.s) : value == null ? void 0 : value.s) || {} };
                keys.forEach((key) => {
                  delete s[key];
                });
                const cellData = { ...value, s: { ...s } };
                return next(cellData);
              }
            }
          }
        )
      )
    );
  }
};
ConditionalFormattingEditorController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(ConditionalFormattingService))
], ConditionalFormattingEditorController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.painter.controller.ts
var repeatByRange = (sourceRange, targetRange) => {
  const getRowLength = (range) => range.endRow - range.startRow + 1;
  const getColLength = (range) => range.endColumn - range.startColumn + 1;
  const rowMod = getRowLength(targetRange) % getRowLength(sourceRange);
  const colMod = getColLength(targetRange) % getColLength(sourceRange);
  const repeatRow = Math.floor(getRowLength(targetRange) / getRowLength(sourceRange));
  const repeatCol = Math.floor(getColLength(targetRange) / getColLength(sourceRange));
  const repeatList = [];
  const repeatRelativeRange = {
    startRow: 0,
    endRow: getRowLength(sourceRange) - 1,
    startColumn: 0,
    endColumn: getColLength(sourceRange) - 1
  };
  if (getRowLength(targetRange) === 1 && getColLength(targetRange) === 1) {
    const startRange = {
      startRow: targetRange.startRow,
      endRow: targetRange.startRow,
      startColumn: targetRange.startColumn,
      endColumn: targetRange.startColumn
    };
    repeatList.push({ repeatRelativeRange, startRange });
    return repeatList;
  }
  for (let countRow = 0; countRow < repeatRow + (rowMod ? 0.1 : 0); countRow++) {
    for (let countCol = 0; countCol < repeatCol + (colMod ? 0.1 : 0); countCol++) {
      const row = getRowLength(sourceRange) * countRow;
      const col = getColLength(sourceRange) * countCol;
      const startRange = {
        startRow: row + targetRange.startRow,
        endRow: row + targetRange.startRow,
        startColumn: col + targetRange.startColumn,
        endColumn: col + targetRange.startColumn
      };
      let _repeatRelativeRange = repeatRelativeRange;
      if (countRow === repeatRow && rowMod) {
        _repeatRelativeRange = { ..._repeatRelativeRange };
        _repeatRelativeRange.endRow = _repeatRelativeRange.endRow - (getRowLength(sourceRange) - rowMod);
      }
      if (countCol === repeatCol && colMod) {
        _repeatRelativeRange = { ..._repeatRelativeRange };
        _repeatRelativeRange.endColumn = _repeatRelativeRange.endColumn - (getColLength(sourceRange) - colMod);
      }
      repeatList.push({ repeatRelativeRange: _repeatRelativeRange, startRange });
    }
  }
  return repeatList;
};
var ConditionalFormattingPainterController = class extends Disposable {
  constructor(_injector, _univerInstanceService, _formatPainterService, _sheetsSelectionsService, _conditionalFormattingRuleModel, _conditionalFormattingViewModel) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_formatPainterService", _formatPainterService);
    __publicField(this, "_sheetsSelectionsService", _sheetsSelectionsService);
    __publicField(this, "_conditionalFormattingRuleModel", _conditionalFormattingRuleModel);
    __publicField(this, "_conditionalFormattingViewModel", _conditionalFormattingViewModel);
    __publicField(this, "_painterConfig", null);
    this._initFormattingPainter();
  }
  // eslint-disable-next-line max-lines-per-function
  _initFormattingPainter() {
    const noopReturnFunc = () => ({ redos: [], undos: [] });
    const loopFunc = (sourceStartCell, targetStartCell, relativeRange, matrixMap, config) => {
      const { unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._painterConfig;
      const { targetUnitId, targetSubUnitId } = config;
      const sourceRange = {
        startRow: sourceStartCell.row,
        startColumn: sourceStartCell.col,
        endColumn: sourceStartCell.col,
        endRow: sourceStartCell.row
      };
      const targetRange = {
        startRow: targetStartCell.row,
        startColumn: targetStartCell.col,
        endColumn: targetStartCell.col,
        endRow: targetStartCell.row
      };
      Range.foreach(relativeRange, (row, col) => {
        const sourcePositionRange = Rectangle.getPositionRange(
          {
            startRow: row,
            startColumn: col,
            endColumn: col,
            endRow: row
          },
          sourceRange
        );
        const targetPositionRange = Rectangle.getPositionRange(
          {
            startRow: row,
            startColumn: col,
            endColumn: col,
            endRow: row
          },
          targetRange
        );
        const sourceCellCf = this._conditionalFormattingViewModel.getCellCfs(
          sourceUnitId,
          sourceSubUnitId,
          sourcePositionRange.startRow,
          sourcePositionRange.startColumn
        );
        const targetCellCf = this._conditionalFormattingViewModel.getCellCfs(
          targetUnitId,
          targetSubUnitId,
          targetPositionRange.startRow,
          targetPositionRange.startColumn
        );
        if (targetCellCf) {
          targetCellCf.forEach((cf) => {
            let matrix = matrixMap.get(cf.cfId);
            if (!matrixMap.get(cf.cfId)) {
              const rule = this._conditionalFormattingRuleModel.getRule(targetUnitId, targetSubUnitId, cf.cfId);
              if (!rule) {
                return;
              }
              matrix = new ObjectMatrix();
              rule.ranges.forEach((range) => {
                Range.foreach(range, (row2, col2) => {
                  matrix.setValue(row2, col2, 1);
                });
              });
              matrixMap.set(cf.cfId, matrix);
            }
            matrix.realDeleteValue(targetPositionRange.startRow, targetPositionRange.startColumn);
          });
        }
        if (sourceCellCf) {
          sourceCellCf.forEach((cf) => {
            const matrix = matrixMap.get(cf.cfId);
            matrix && matrix.setValue(targetPositionRange.startRow, targetPositionRange.startColumn, 1);
          });
        }
      });
    };
    const generalApplyFunc = (targetUnitId, targetSubUnitId, targetRange) => {
      var _a;
      const { range: sourceRange, unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._painterConfig;
      const isSkipSheet = targetUnitId !== sourceUnitId || sourceSubUnitId !== targetSubUnitId;
      const matrixMap = /* @__PURE__ */ new Map();
      const redos = [];
      const undos = [];
      if (!targetUnitId || !targetSubUnitId || !sourceUnitId || !sourceSubUnitId) {
        return noopReturnFunc();
      }
      const ruleList = (_a = this._conditionalFormattingRuleModel.getSubunitRules(sourceUnitId, sourceSubUnitId)) != null ? _a : [];
      ruleList == null ? void 0 : ruleList.forEach((rule) => {
        const { ranges, cfId } = rule;
        if (ranges.some((range) => Rectangle.intersects(sourceRange, range))) {
          const matrix = new ObjectMatrix();
          if (!isSkipSheet) {
            ranges.forEach((range) => {
              Range.foreach(range, (row, col) => {
                matrix.setValue(row, col, 1);
              });
            });
          }
          matrixMap.set(cfId, matrix);
        }
      });
      const sourceStartCell = {
        row: sourceRange.startRow,
        col: sourceRange.startColumn
      };
      const repeats = repeatByRange(sourceRange, targetRange);
      repeats.forEach((repeat) => {
        loopFunc(sourceStartCell, { row: repeat.startRange.startRow, col: repeat.startRange.startColumn }, repeat.repeatRelativeRange, matrixMap, { targetUnitId, targetSubUnitId });
      });
      matrixMap.forEach((item, cfId) => {
        if (!isSkipSheet) {
          const rule = this._conditionalFormattingRuleModel.getRule(sourceUnitId, sourceSubUnitId, cfId);
          if (!rule) {
            return;
          }
          const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
          if (ranges.length) {
            const params = {
              unitId: sourceUnitId,
              subUnitId: sourceSubUnitId,
              rule: { ...rule, ranges }
            };
            redos.push({ id: SetConditionalRuleMutation.id, params });
            undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
          } else {
            const params = {
              unitId: sourceUnitId,
              subUnitId: sourceSubUnitId,
              cfId: rule.cfId
            };
            redos.push({ id: DeleteConditionalRuleMutation.id, params });
            undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
          }
        } else {
          const rule = this._conditionalFormattingRuleModel.getRule(targetUnitId, targetSubUnitId, cfId);
          const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
          if (!rule) {
            if (ranges.length) {
              const sourceRule = this._conditionalFormattingRuleModel.getRule(sourceUnitId, sourceSubUnitId, cfId);
              if (sourceRule) {
                const params = {
                  unitId: targetUnitId,
                  subUnitId: targetSubUnitId,
                  rule: {
                    ...Tools.deepClone(sourceRule),
                    cfId: this._conditionalFormattingRuleModel.createCfId(targetUnitId, targetSubUnitId),
                    ranges
                  }
                };
                redos.push({ id: AddConditionalRuleMutation.id, params });
                undos.push(AddConditionalRuleMutationUndoFactory(this._injector, params));
              }
            }
          } else {
            if (ranges.length) {
              const params = {
                unitId: targetUnitId,
                subUnitId: targetSubUnitId,
                rule: { ...rule, ranges }
              };
              redos.push({ id: SetConditionalRuleMutation.id, params });
              undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
            } else {
              const params = {
                unitId: targetUnitId,
                subUnitId: targetSubUnitId,
                cfId: rule.cfId
              };
              redos.push({ id: DeleteConditionalRuleMutation.id, params });
              undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
            }
          }
        }
      });
      return {
        undos,
        redos
      };
    };
    const hook = {
      id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
      onStatusChange: (status) => {
        var _a, _b, _c;
        switch (status) {
          case 2 /* INFINITE */:
          case 1 /* ONCE */: {
            const unitId = (_a = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getUnitId();
            const subUnitId = (_c = (_b = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _b.getActiveSheet()) == null ? void 0 : _c.getSheetId();
            const selection = this._sheetsSelectionsService.getCurrentLastSelection();
            const range = selection == null ? void 0 : selection.range;
            if (unitId && subUnitId && range) {
              this._painterConfig = { unitId, subUnitId, range };
            }
            break;
          }
          case 0 /* OFF */: {
            this._painterConfig = null;
            break;
          }
        }
      },
      onApply: (unitId, subUnitId, targetRange) => {
        if (this._painterConfig) {
          return generalApplyFunc(unitId, subUnitId, targetRange);
        }
        return {
          redos: [],
          undos: []
        };
      }
    };
    this._formatPainterService.addHook(hook);
  }
};
ConditionalFormattingPainterController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(IUniverInstanceService)),
  __decorateParam(2, Inject(IFormatPainterService)),
  __decorateParam(3, Inject(SheetsSelectionsService)),
  __decorateParam(4, Inject(ConditionalFormattingRuleModel)),
  __decorateParam(5, Inject(ConditionalFormattingViewModel))
], ConditionalFormattingPainterController);

// ../packages/sheets-conditional-formatting-ui/src/controllers/cf.viewport.controller.ts
var ConditionalFormattingViewportController = class extends Disposable {
  constructor(_conditionalFormattingViewModel, _univerInstanceService, _renderManagerService) {
    super();
    __publicField(this, "_conditionalFormattingViewModel", _conditionalFormattingViewModel);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_unitDisposable", new DisposableCollection());
    this._init();
  }
  _init() {
    const unit = this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const bindUnit = (unit2) => {
      this._unitDisposable.dispose();
      this._unitDisposable = new DisposableCollection();
      const unitId = unit2.getUnitId();
      const render = this._renderManagerService.getRenderById(unitId);
      if (!render) {
        return;
      }
      const sheetSkeletonManagerService = render.with(SheetSkeletonManagerService);
      this._unitDisposable.add(sheetSkeletonManagerService.currentSkeleton$.subscribe((s) => {
        if (s) {
          const range = s.skeleton.rowColumnSegment;
          const col = range.endColumn - range.startColumn + 1;
          const row = range.endRow - range.startRow + 1;
          const length = row * col * 9;
          const result = Math.max(CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH, length);
          this._conditionalFormattingViewModel.setCacheLength(result);
        }
      }));
    };
    if (unit) {
      bindUnit(unit);
    }
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).subscribe((unit2) => {
        if (!unit2) {
          this._unitDisposable.dispose();
          return;
        }
        bindUnit(unit2);
      })
    );
  }
  dispose() {
    this._unitDisposable.dispose();
    super.dispose();
  }
};
ConditionalFormattingViewportController = __decorateClass([
  __decorateParam(0, Inject(ConditionalFormattingViewModel)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, IRenderManagerService)
], ConditionalFormattingViewportController);

// ../packages/sheets-conditional-formatting-ui/src/menu/manage-rule.ts
var commandList = [
  SetWorksheetActiveOperation.id,
  AddConditionalRuleMutation.id,
  SetConditionalRuleMutation.id,
  DeleteConditionalRuleMutation.id,
  MoveConditionalRuleMutation.id
];
var commonSelections = [
  {
    label: {
      name: "sheets-conditional-formatting-ui.ruleType.highlightCell",
      selectable: false
    },
    value: 3 /* highlightCell */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.panel.rankAndAverage",
      selectable: false
    },
    value: 4 /* rank */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.ruleType.formula",
      selectable: false
    },
    value: 5 /* formula */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.ruleType.colorScale",
      selectable: false
    },
    value: 6 /* colorScale */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.ruleType.dataBar",
      selectable: false
    },
    value: 7 /* dataBar */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.ruleType.iconSet",
      selectable: false
    },
    value: 8 /* icon */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.menu.manageConditionalFormatting",
      selectable: false
    },
    value: 2 /* viewRule */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.menu.createConditionalFormatting",
      selectable: false
    },
    value: 1 /* createRule */
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.menu.clearRangeRules",
      selectable: false
    },
    value: 9 /* clearRangeRules */,
    disabled: false
  },
  {
    label: {
      name: "sheets-conditional-formatting-ui.menu.clearWorkSheetRules",
      selectable: false
    },
    value: 10 /* clearWorkSheetRules */
  }
];
var FactoryManageConditionalFormattingRule = (accessor) => {
  const selectionManagerService = accessor.get(SheetsSelectionsService);
  const commandService = accessor.get(ICommandService);
  const univerInstanceService = accessor.get(IUniverInstanceService);
  const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
  const clearRangeEnable$ = new Observable((subscriber) => merge(
    selectionManagerService.selectionMoveEnd$,
    selectionManagerService.selectionSet$,
    new Observable((commandSubscribe) => {
      const disposable = commandService.onCommandExecuted((commandInfo) => {
        var _a;
        const { id, params } = commandInfo;
        const unitId = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getUnitId();
        if (commandList.includes(id) && params.unitId === unitId) {
          commandSubscribe.next(null);
        }
      });
      return () => disposable.dispose();
    })
  ).pipe(debounceTime(16)).subscribe(() => {
    var _a;
    const ranges = ((_a = selectionManagerService.getCurrentSelections()) == null ? void 0 : _a.map((selection) => selection.range)) || [];
    const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) return;
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) return;
    const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId()) || [];
    const ruleList = allRule.filter((rule) => rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(range, ruleRange))));
    const hasPermission = ruleList.map((rule) => rule.ranges).every((ranges2) => {
      return checkRangesEditablePermission(accessor, workbook.getUnitId(), worksheet.getSheetId(), ranges2);
    });
    subscriber.next(hasPermission);
  }));
  const clearSheetEnable$ = new Observable(
    (subscriber) => new Observable((commandSubscribe) => {
      const disposable = commandService.onCommandExecuted((commandInfo) => {
        var _a;
        const { id, params } = commandInfo;
        const unitId = (_a = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _a.getUnitId();
        if (commandList.includes(id) && params.unitId === unitId) {
          commandSubscribe.next(null);
        }
      });
      return () => disposable.dispose();
    }).pipe(debounceTime(16)).subscribe(() => {
      const workbook = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
      if (!workbook) return;
      const worksheet = workbook.getActiveSheet();
      if (!worksheet) return;
      const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId()) || [];
      if (!allRule.length) {
        subscriber.next(false);
        return false;
      }
      const hasPermission = allRule.map((rule) => rule.ranges).every((ranges) => {
        return checkRangesEditablePermission(accessor, workbook.getUnitId(), worksheet.getSheetId(), ranges);
      });
      subscriber.next(hasPermission);
    })
  );
  const selections$ = new Observable((subscriber) => {
    clearRangeEnable$.subscribe((v) => {
      const item = commonSelections.find((item2) => item2.value === 9 /* clearRangeRules */);
      if (item) {
        item.disabled = !v;
        subscriber.next(commonSelections);
      }
    });
    clearSheetEnable$.subscribe((v) => {
      const item = commonSelections.find((item2) => item2.value === 10 /* clearWorkSheetRules */);
      if (item) {
        item.disabled = !v;
        subscriber.next(commonSelections);
      }
    });
    subscriber.next(commonSelections);
  });
  return {
    id: OpenConditionalFormattingOperator.id,
    type: 1 /* SELECTOR */,
    icon: "ConditionsDoubleIcon",
    tooltip: "sheets-conditional-formatting-ui.title",
    selections: selections$,
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
};

// ../packages/sheets-conditional-formatting-ui/src/menu/schema.ts
var menuSchema = {
  ["ribbon.data.rules" /* RULES */]: {
    [OpenConditionalFormattingOperator.id]: {
      order: 1,
      menuItemFactory: FactoryManageConditionalFormattingRule
    }
  }
};

// ../packages/sheets-conditional-formatting-ui/src/menu/cf.menu.controller.ts
var ConditionalFormattingMenuController = class extends Disposable {
  constructor(_injector, _menuManagerService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_sidebarDisposable", null);
    this._menuManagerService.mergeMenu(menuSchema);
  }
};
ConditionalFormattingMenuController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, IMenuManagerService)
], ConditionalFormattingMenuController);

// ../packages/sheets-conditional-formatting-ui/src/plugin.ts
var UniverSheetsConditionalFormattingUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY, rest);
    this._initCommand();
  }
  onStarting() {
    registerDependencies(this._injector, [
      [SheetsCfRenderController],
      [ConditionalFormattingCopyPasteController],
      [ConditionalFormattingAutoFillController],
      [ConditionalFormattingPermissionController],
      [ConditionalFormattingPanelController],
      [ConditionalFormattingMenuController],
      [ConditionalFormattingI18nController],
      [ConditionalFormattingEditorController],
      [ConditionalFormattingClearController],
      [ConditionalFormattingPainterController],
      [ConditionalFormattingViewportController],
      [ConditionalFormattingFormulaRefRangeController]
    ]);
    touchDependencies(this._injector, [
      [SheetsCfRenderController],
      [ConditionalFormattingFormulaRefRangeController]
    ]);
  }
  onReady() {
    touchDependencies(this._injector, [
      [ConditionalFormattingMenuController],
      [ConditionalFormattingPanelController]
    ]);
  }
  onRendered() {
    touchDependencies(this._injector, [
      [ConditionalFormattingAutoFillController],
      [ConditionalFormattingClearController],
      [ConditionalFormattingCopyPasteController],
      [ConditionalFormattingEditorController],
      [ConditionalFormattingI18nController],
      [ConditionalFormattingPainterController],
      [ConditionalFormattingPermissionController],
      [ConditionalFormattingViewportController]
    ]);
  }
  _initCommand() {
    [
      AddAverageCfCommand,
      AddColorScaleConditionalRuleCommand,
      AddDataBarConditionalRuleCommand,
      AddDuplicateValuesCfCommand,
      AddNumberCfCommand,
      AddRankCfCommand,
      AddTextCfCommand,
      AddTimePeriodCfCommand,
      AddUniqueValuesCfCommand,
      OpenConditionalFormattingOperator
    ].forEach((m) => {
      this._commandService.registerCommand(m);
    });
  }
};
__publicField(UniverSheetsConditionalFormattingUIPlugin, "pluginName", `${SHEET_CONDITIONAL_FORMATTING_PLUGIN}_UI_PLUGIN`);
__publicField(UniverSheetsConditionalFormattingUIPlugin, "packageName", package_default.name);
__publicField(UniverSheetsConditionalFormattingUIPlugin, "version", package_default.version);
__publicField(UniverSheetsConditionalFormattingUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsConditionalFormattingUIPlugin = __decorateClass([
  DependentOn(UniverSheetsConditionalFormattingPlugin, UniverSheetsFormulaPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(ICommandService)),
  __decorateParam(3, IConfigService)
], UniverSheetsConditionalFormattingUIPlugin);

// ../packages/sheets-data-validation-ui/package.json
var package_default2 = {
  name: "@univerjs/sheets-data-validation-ui",
  version: "0.25.2",
  private: false,
  description: "Data validation UI for Univer Sheets.",
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
    "data-validation",
    "validation",
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
    dev: "vite",
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    "build:bundle": "univer-cli build",
    "build:types": "tsc -p tsconfig.node.json",
    build: "pnpm run build:bundle && pnpm run build:types",
    typecheck: "tsc --noEmit"
  },
  peerDependencies: {
    react: "^16.9.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc",
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/data-validation": "workspace:*",
    "@univerjs/design": "workspace:*",
    "@univerjs/engine-formula": "workspace:*",
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-data-validation": "workspace:*",
    "@univerjs/sheets-formula-ui": "workspace:*",
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

// ../packages/sheets-data-validation-ui/src/services/data-validation-panel.service.ts
var DataValidationPanelService = class extends Disposable {
  constructor(_univerInstanceService, _sidebarService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_sidebarService", _sidebarService);
    __publicField(this, "_open$", new BehaviorSubject(false));
    __publicField(this, "open$", this._open$.pipe(distinctUntilChanged()));
    __publicField(this, "_activeRule");
    __publicField(this, "_activeRule$", new BehaviorSubject(void 0));
    __publicField(this, "activeRule$", this._activeRule$.asObservable());
    __publicField(this, "_closeDisposable", null);
    // Record the worksheet to which the rule using the range selector belongs, so that the rule list is not switched when making cross-sheet selections
    __publicField(this, "_focusFormulaEditorActiveRuleSubUnitId", null);
    this.disposeWithMe(
      this._univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */).pipe(filter((sheet) => !sheet)).subscribe(() => {
        this.close();
      })
    );
    this.disposeWithMe(this._sidebarService.sidebarOptions$.subscribe((info) => {
      if (info.id === DATA_VALIDATION_PANEL) {
        if (!info.visible) {
          setTimeout(() => {
            this._sidebarService.sidebarOptions$.next({ visible: false });
          });
        }
      }
    }));
  }
  get activeRule() {
    return this._activeRule;
  }
  get isOpen() {
    return this._open$.getValue();
  }
  dispose() {
    var _a;
    super.dispose();
    this._open$.next(false);
    this._open$.complete();
    this._activeRule$.complete();
    (_a = this._closeDisposable) == null ? void 0 : _a.dispose();
  }
  open() {
    this._open$.next(true);
  }
  close() {
    var _a;
    this._open$.next(false);
    (_a = this._closeDisposable) == null ? void 0 : _a.dispose();
  }
  setCloseDisposable(disposable) {
    this._closeDisposable = toDisposable(() => {
      disposable.dispose();
      this._closeDisposable = null;
    });
  }
  setActiveRule(rule) {
    this._activeRule = rule;
    this._activeRule$.next(rule);
  }
  setFocusFormulaEditorActiveRuleSubUnitId(subUnitId) {
    this._focusFormulaEditorActiveRuleSubUnitId = subUnitId;
  }
  getFocusFormulaEditorActiveRuleSubUnitId() {
    return this._focusFormulaEditorActiveRuleSubUnitId;
  }
};
DataValidationPanelService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, ISidebarService)
], DataValidationPanelService);

// ../packages/sheets-data-validation-ui/src/config/config.ts
var SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY = "sheets-data-validation-ui.config";
var configSymbol2 = Symbol(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig2 = {};

// ../packages/sheets-data-validation-ui/src/const.ts
var DROP_DOWN_DEFAULT_COLOR = "#ECECEC";

// ../packages/sheets-data-validation-ui/src/controllers/dv-reject-input.controller.ts
var import_react13 = __toESM(require_react());
var DataValidationRejectInputController = class extends Disposable {
  constructor(_sheetInterceptorService, _dataValidationModel, _dataValidatorRegistryService, _dialogService, _localeService, _sheetsDataValidationValidatorService) {
    super();
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
    __publicField(this, "_dataValidatorRegistryService", _dataValidatorRegistryService);
    __publicField(this, "_dialogService", _dialogService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_sheetsDataValidationValidatorService", _sheetsDataValidationValidatorService);
    this._initEditorBridgeInterceptor();
  }
  _initEditorBridgeInterceptor() {
    this.disposeWithMe(this._sheetInterceptorService.writeCellInterceptor.intercept(
      VALIDATE_CELL,
      {
        handler: async (lastResult, context, next) => {
          const cell = await lastResult;
          const { row, col, unitId, subUnitId } = context;
          const ruleId = this._dataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
          const rule = ruleId ? this._dataValidationModel.getRuleById(unitId, subUnitId, ruleId) : void 0;
          if (cell === false) {
            return next(Promise.resolve(false));
          }
          if (!rule || rule.errorStyle !== 1 /* STOP */) {
            return next(Promise.resolve(true));
          }
          const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
          if (!validator) {
            return next(Promise.resolve(true));
          }
          const res = await this._sheetsDataValidationValidatorService.validatorCell(unitId, subUnitId, row, col);
          if (res === "valid" /* VALID */) {
            return next(Promise.resolve(true));
          }
          this._dialogService.open({
            width: 368,
            title: {
              title: this._localeService.t("sheets-data-validation-ui.alert.title")
            },
            id: "reject-input-dialog",
            children: {
              title: validator.getRuleFinalError(rule, { row, col, unitId, subUnitId })
            },
            footer: {
              title: (0, import_react13.createElement)(
                Button,
                {
                  variant: "primary",
                  onClick: () => this._dialogService.close("reject-input-dialog")
                },
                this._localeService.t("sheets-data-validation-ui.alert.ok")
              )
            },
            onClose: () => {
              this._dialogService.close("reject-input-dialog");
            }
          });
          return next(Promise.resolve(false));
        }
      }
    ));
  }
  showReject(title) {
    this._dialogService.open({
      width: 368,
      title: {
        title: this._localeService.t("sheets-data-validation-ui.alert.title")
      },
      id: "reject-input-dialog",
      children: {
        title
      },
      footer: {
        title: (0, import_react13.createElement)(
          Button,
          {
            variant: "primary",
            onClick: () => this._dialogService.close("reject-input-dialog")
          },
          this._localeService.t("sheets-data-validation-ui.alert.ok")
        )
      },
      onClose: () => {
        this._dialogService.close("reject-input-dialog");
      }
    });
  }
};
DataValidationRejectInputController = __decorateClass([
  __decorateParam(0, Inject(SheetInterceptorService)),
  __decorateParam(1, Inject(SheetDataValidationModel)),
  __decorateParam(2, Inject(DataValidatorRegistryService)),
  __decorateParam(3, IDialogService),
  __decorateParam(4, Inject(LocaleService)),
  __decorateParam(5, Inject(SheetsDataValidationValidatorService))
], DataValidationRejectInputController);

// ../packages/sheets-data-validation-ui/src/services/dropdown-manager.service.ts
var transformDate = (value) => {
  if (value === void 0 || value === null || typeof value === "boolean") {
    return void 0;
  }
  if (value === "") return dateKit();
  if (typeof value === "number" || !Number.isNaN(+value)) {
    return dateKit(lib_exports.format("yyyy-MM-dd HH:mm:ss", Number(value)));
  }
  const date = dateKit(value);
  if (date.isValid()) {
    return date;
  }
  return void 0;
};
function getDefaultFormat(patternType, format) {
  const originPartternType = getPatternType(format);
  if (patternType === originPartternType) {
    return format;
  }
  switch (patternType) {
    case "datetime":
      return "yyyy-MM-dd hh:mm:ss";
    case "date":
      return "yyyy-MM-dd";
    case "time":
      return "HH:mm:ss";
  }
}
var DataValidationDropdownManagerService = class extends Disposable {
  constructor(_univerInstanceService, _dataValidatorRegistryService, _zenZoneService, _dataValidationModel, _sheetsSelectionsService, _cellDropdownManagerService, _sheetDataValidationModel, _commandService, _editorBridgeService, _injector, _configService) {
    super();
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_dataValidatorRegistryService", _dataValidatorRegistryService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
    __publicField(this, "_sheetsSelectionsService", _sheetsSelectionsService);
    __publicField(this, "_cellDropdownManagerService", _cellDropdownManagerService);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_activeDropdown");
    __publicField(this, "_activeDropdown$", new Subject());
    __publicField(this, "_currentPopup", null);
    __publicField(this, "activeDropdown$", this._activeDropdown$.asObservable());
    __publicField(this, "_zenVisible", false);
    this._init();
    this._initSelectionChange();
    this.disposeWithMe(() => {
      this._activeDropdown$.complete();
    });
  }
  get activeDropdown() {
    return this._activeDropdown;
  }
  _init() {
    this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
      this._zenVisible = visible;
      if (visible) {
        this.hideDropdown();
      }
    }));
  }
  _getDropdownByCell(unitId, subUnitId, row, col) {
    const workbook = unitId ? this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */) : this._univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    if (!workbook) {
      return;
    }
    const worksheet = subUnitId ? workbook.getSheetBySheetId(subUnitId) : workbook.getActiveSheet();
    if (!worksheet) {
      return;
    }
    const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
    return validator == null ? void 0 : validator.dropdownType;
  }
  _initSelectionChange() {
    this.disposeWithMe(this._sheetsSelectionsService.selectionMoveEnd$.subscribe((selections) => {
      if (selections && selections.every((selection) => !(selection.primary && this._getDropdownByCell(selection.primary.unitId, selection.primary.sheetId, selection.primary.actualRow, selection.primary.actualColumn)))) {
        this.hideDropdown();
      }
    }));
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  showDropdown(param) {
    var _a, _b, _c, _d, _e, _f;
    const { location } = param;
    const { row, col, unitId, subUnitId, workbook, worksheet } = location;
    if (this._currentPopup) {
      this._currentPopup.dispose();
    }
    ;
    if (this._zenVisible) {
      return;
    }
    this._activeDropdown = param;
    this._activeDropdown$.next(this._activeDropdown);
    const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
    if (!(validator == null ? void 0 : validator.dropdownType)) {
      return;
    }
    let popupDisposable;
    const handleSave = async (date, targetPatternType) => {
      var _a2, _b2, _c2;
      if (!date) {
        return true;
      }
      const newValue = date;
      const cellData = worksheet.getCell(row, col);
      const dateStr = newValue.format(targetPatternType === "date" ? "YYYY-MM-DD 00:00:00" : "YYYY-MM-DD HH:mm:ss");
      const serialNum = (_a2 = lib_exports.parseDate(dateStr)) == null ? void 0 : _a2.v;
      const serialTime = targetPatternType === "time" ? serialNum % 1 : serialNum;
      const cellStyle = workbook.getStyles().getStyleByCell(cellData);
      const format = (_c2 = (_b2 = cellStyle == null ? void 0 : cellStyle.n) == null ? void 0 : _b2.pattern) != null ? _c2 : "";
      if (rule.errorStyle !== 1 /* STOP */ || await validator.validator({
        value: serialTime,
        unitId,
        subUnitId,
        row,
        column: col,
        worksheet,
        workbook,
        interceptValue: dateStr.replace("Z", "").replace("T", " "),
        t: 2 /* NUMBER */
      }, rule)) {
        await this._commandService.executeCommand(SetRangeValuesCommand.id, {
          unitId,
          subUnitId,
          range: {
            startColumn: col,
            endColumn: col,
            startRow: row,
            endRow: row
          },
          value: {
            v: serialTime,
            t: 2,
            p: null,
            f: null,
            si: null,
            s: {
              n: {
                pattern: getDefaultFormat(targetPatternType, format)
              }
            }
          }
        });
        await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
          visible: false,
          eventType: 4 /* Keyboard */,
          unitId,
          keycode: 27 /* ESC */
        });
        return true;
      } else {
        if (this._injector.has(DataValidationRejectInputController)) {
          const rejectInputController = this._injector.get(DataValidationRejectInputController);
          rejectInputController.showReject(validator.getRuleFinalError(rule, { row, col, unitId, subUnitId }));
        }
        return false;
      }
    };
    let dropdownParam;
    switch (validator.dropdownType) {
      case "date" /* DATE */: {
        const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const originDate = transformDate(cellStr);
        const showTime = Boolean((_a = rule.bizInfo) == null ? void 0 : _a.showTime);
        dropdownParam = {
          location,
          type: "datepicker",
          props: {
            showTime,
            onChange: (newValue) => handleSave(newValue, showTime ? "datetime" : "date"),
            defaultValue: originDate,
            patternType: "date"
          }
        };
        break;
      }
      case "time" /* TIME */: {
        const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const originDate = transformDate(cellStr);
        dropdownParam = {
          location,
          type: "datepicker",
          props: {
            onChange: (newValue) => handleSave(newValue, "time"),
            defaultValue: originDate,
            patternType: "time"
          }
        };
        break;
      }
      case "datetime" /* DATETIME */: {
        const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const originDate = transformDate(cellStr);
        dropdownParam = {
          location,
          type: "datepicker",
          props: {
            onChange: (newValue) => handleSave(newValue, "datetime"),
            defaultValue: originDate,
            patternType: "datetime"
          }
        };
        break;
      }
      case "list" /* LIST */:
      case "multipleList" /* MULTIPLE_LIST */: {
        const multiple = validator.dropdownType === "multipleList" /* MULTIPLE_LIST */;
        const handleSave2 = async (newValue) => {
          var _a2;
          const str = multiple ? serializeListOptions(newValue) : (_a2 = newValue[0]) != null ? _a2 : "";
          const params = {
            unitId,
            subUnitId,
            range: {
              startColumn: col,
              endColumn: col,
              startRow: row,
              endRow: row
            },
            value: {
              v: str,
              p: null,
              f: null,
              si: null
            }
          };
          this._commandService.executeCommand(SetRangeValuesCommand.id, params);
          if (this._editorBridgeService.isVisible().visible) {
            await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
              visible: false,
              eventType: 4 /* Keyboard */,
              unitId,
              keycode: 27 /* ESC */
            });
          }
          if (multiple) {
            return false;
          }
          return true;
        };
        const showColor = (rule == null ? void 0 : rule.renderMode) === 2 /* CUSTOM */ || (rule == null ? void 0 : rule.renderMode) === void 0;
        const list = validator.getListWithColor(rule, unitId, subUnitId);
        const cellStr = getDataValidationCellValue(worksheet.getCellRaw(row, col));
        const handleEdit = () => {
          this._commandService.executeCommand(OpenValidationPanelOperation.id, {
            ruleId: rule.uid
          });
          popupDisposable == null ? void 0 : popupDisposable.dispose();
        };
        const options = list.map((item) => ({
          label: item.label,
          value: item.label,
          color: showColor || item.color ? item.color || DROP_DOWN_DEFAULT_COLOR : "transparent"
        }));
        dropdownParam = {
          location,
          type: "list",
          props: {
            onChange: (newValue) => handleSave2(newValue),
            options,
            onEdit: handleEdit,
            defaultValue: cellStr,
            multiple,
            showEdit: (_c = (_b = this._configService.getConfig(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY)) == null ? void 0 : _b.showEditOnDropdown) != null ? _c : true,
            showSearch: (_e = (_d = this._configService.getConfig(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY)) == null ? void 0 : _d.showSearchOnDropdown) != null ? _e : true
          }
        };
        break;
      }
      case "cascade" /* CASCADE */: {
        const handleSave2 = (newValue) => {
          const params = {
            unitId,
            subUnitId,
            range: {
              startColumn: col,
              endColumn: col,
              startRow: row,
              endRow: row
            },
            value: {
              v: newValue.join("/"),
              p: null,
              f: null,
              si: null
            }
          };
          this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
          if (this._editorBridgeService.isVisible().visible) {
            this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
              visible: false,
              eventType: 4 /* Keyboard */,
              unitId,
              keycode: 27 /* ESC */
            });
          }
          return true;
        };
        dropdownParam = {
          type: "cascader",
          props: {
            onChange: handleSave2,
            defaultValue: getDataValidationCellValue(worksheet.getCellRaw(row, col)).split("/"),
            options: JSON.parse((_f = rule.formula1) != null ? _f : "[]")
          },
          location
        };
        break;
      }
      case "color" /* COLOR */: {
        const handleSave2 = (newValue) => {
          const params = {
            unitId,
            subUnitId,
            range: {
              startColumn: col,
              endColumn: col,
              startRow: row,
              endRow: row
            },
            value: {
              v: newValue,
              p: null,
              f: null,
              si: null
            }
          };
          this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
          if (this._editorBridgeService.isVisible().visible) {
            this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
              visible: false,
              eventType: 4 /* Keyboard */,
              unitId,
              keycode: 27 /* ESC */
            });
          }
          return true;
        };
        dropdownParam = {
          type: "color",
          props: {
            onChange: handleSave2,
            defaultValue: getDataValidationCellValue(worksheet.getCellRaw(row, col))
          },
          location
        };
        break;
      }
      default:
        throw new Error("[DataValidationDropdownManagerService]: unknown type!");
    }
    popupDisposable = this._cellDropdownManagerService.showDropdown({
      ...dropdownParam,
      onHide: () => {
        this._activeDropdown = null;
        this._activeDropdown$.next(null);
      }
    });
    if (!popupDisposable) {
      throw new Error("[DataValidationDropdownManagerService]: cannot show dropdown!");
    }
    const disposableCollection = new DisposableCollection();
    disposableCollection.add(popupDisposable);
    disposableCollection.add({
      dispose: () => {
        var _a2, _b2;
        (_b2 = (_a2 = this._activeDropdown) == null ? void 0 : _a2.onHide) == null ? void 0 : _b2.call(_a2);
      }
    });
    this._currentPopup = disposableCollection;
  }
  hideDropdown() {
    if (!this._activeDropdown) {
      return;
    }
    this._currentPopup && this._currentPopup.dispose();
    this._currentPopup = null;
    this._activeDropdown = null;
    this._activeDropdown$.next(null);
  }
  showDataValidationDropdown(unitId, subUnitId, row, col, onHide) {
    const workbook = this._univerInstanceService.getUnit(unitId, 2 /* UNIVER_SHEET */);
    if (!workbook) {
      return;
    }
    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
      return;
    }
    const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
    if (!validator || !validator.dropdownType) {
      this.hideDropdown();
      return;
    }
    this.showDropdown({
      location: {
        workbook,
        worksheet,
        row,
        col,
        unitId,
        subUnitId
      },
      onHide
    });
  }
};
DataValidationDropdownManagerService = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(DataValidatorRegistryService)),
  __decorateParam(2, IZenZoneService),
  __decorateParam(3, Inject(SheetDataValidationModel)),
  __decorateParam(4, Inject(SheetsSelectionsService)),
  __decorateParam(5, Inject(ISheetCellDropdownManagerService)),
  __decorateParam(6, Inject(SheetDataValidationModel)),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IEditorBridgeService),
  __decorateParam(9, Inject(Injector)),
  __decorateParam(10, IConfigService)
], DataValidationDropdownManagerService);

// ../packages/sheets-data-validation-ui/src/commands/operations/data-validation.operation.ts
var DATA_VALIDATION_PANEL = "DataValidationPanel";
var OpenValidationPanelOperation = {
  id: "data-validation.operation.open-validation-panel",
  type: 1 /* OPERATION */,
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const { ruleId, isAdd } = params;
    const dataValidationPanelService = accessor.get(DataValidationPanelService);
    const dataValidationModel = accessor.get(DataValidationModel);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sidebarService = accessor.get(ISidebarService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { unitId, subUnitId } = target;
    const rule = ruleId ? dataValidationModel.getRuleById(unitId, subUnitId, ruleId) : void 0;
    dataValidationPanelService.open();
    dataValidationPanelService.setActiveRule(rule && {
      unitId,
      subUnitId,
      rule
    });
    const disposable = sidebarService.open({
      id: DATA_VALIDATION_PANEL,
      header: { title: isAdd ? "sheets-data-validation-ui.panel.addTitle" : "sheets-data-validation-ui.panel.title" },
      children: { label: DATA_VALIDATION_PANEL },
      width: 312,
      onClose: () => dataValidationPanelService.close()
    });
    dataValidationPanelService.setCloseDisposable(disposable);
    return true;
  }
};
var CloseValidationPanelOperation = {
  id: "data-validation.operation.close-validation-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const dataValidationPanelService = accessor.get(DataValidationPanelService);
    dataValidationPanelService.close();
    return true;
  }
};
var ToggleValidationPanelOperation = {
  id: "data-validation.operation.toggle-validation-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const commandService = accessor.get(ICommandService);
    const dataValidationPanelService = accessor.get(DataValidationPanelService);
    dataValidationPanelService.open();
    const isOpen = dataValidationPanelService.isOpen;
    if (isOpen) {
      commandService.executeCommand(CloseValidationPanelOperation.id);
    } else {
      commandService.executeCommand(OpenValidationPanelOperation.id);
    }
    return true;
  }
};
var ShowDataValidationDropdown = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.show-data-validation-dropdown",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
    const { unitId, subUnitId, row, column } = params;
    const activeDropdown = dataValidationDropdownManagerService.activeDropdown;
    const currLoc = activeDropdown == null ? void 0 : activeDropdown.location;
    if (currLoc && currLoc.unitId === unitId && currLoc.subUnitId === subUnitId && currLoc.row === row && currLoc.col === column) {
      return true;
    }
    dataValidationDropdownManagerService.showDataValidationDropdown(
      unitId,
      subUnitId,
      row,
      column
    );
    return true;
  }
};
var HideDataValidationDropdown = {
  type: 1 /* OPERATION */,
  id: "sheet.operation.hide-data-validation-dropdown",
  handler(accessor, params) {
    if (!params) {
      return false;
    }
    const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
    dataValidationDropdownManagerService.hideDropdown();
    return true;
  }
};

// ../packages/sheets-data-validation-ui/src/commands/commands/data-validation-ui.command.ts
var AddSheetDataValidationAndOpenCommand = {
  type: 0 /* COMMAND */,
  id: "data-validation.command.addRuleAndOpen",
  handler(accessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return false;
    const { workbook, worksheet } = target;
    const rule = createDefaultNewRule(accessor);
    const commandService = accessor.get(ICommandService);
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();
    const addParams = {
      rule,
      unitId,
      subUnitId
    };
    const res = commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, addParams);
    if (res) {
      commandService.syncExecuteCommand(OpenValidationPanelOperation.id, {
        ruleId: rule.uid,
        isAdd: true
      });
      return true;
    }
    return false;
  }
};

// ../packages/sheets-data-validation-ui/src/controllers/dv-alert.controller.ts
var ALERT_KEY = "SHEET_DATA_VALIDATION_ALERT";
var DataValidationAlertController = class extends Disposable {
  constructor(_hoverManagerService, _cellAlertManagerService, _univerInstanceService, _localeService, _zenZoneService, _dataValidationModel) {
    super();
    __publicField(this, "_hoverManagerService", _hoverManagerService);
    __publicField(this, "_cellAlertManagerService", _cellAlertManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_zenZoneService", _zenZoneService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
    this._init();
  }
  _init() {
    this._initCellAlertPopup();
    this._initZenService();
  }
  _initCellAlertPopup() {
    this.disposeWithMe(this._hoverManagerService.currentCell$.pipe(debounceTime(100)).subscribe((cellPos) => {
      var _a;
      if (cellPos) {
        const workbook = this._univerInstanceService.getUnit(cellPos.location.unitId, 2 /* UNIVER_SHEET */);
        const worksheet = workbook.getSheetBySheetId(cellPos.location.subUnitId);
        if (!worksheet) return;
        const rule = this._dataValidationModel.getRuleByLocation(cellPos.location.unitId, cellPos.location.subUnitId, cellPos.location.row, cellPos.location.col);
        if (!rule) {
          this._cellAlertManagerService.removeAlert(ALERT_KEY);
          return;
        }
        const validStatus = this._dataValidationModel.validator(rule, { ...cellPos.location, workbook, worksheet });
        if (validStatus === "invalid" /* INVALID */) {
          const currentAlert = this._cellAlertManagerService.currentAlert.get(ALERT_KEY);
          const currentLoc = (_a = currentAlert == null ? void 0 : currentAlert.alert) == null ? void 0 : _a.location;
          if (currentLoc && currentLoc.row === cellPos.location.row && currentLoc.col === cellPos.location.col && currentLoc.subUnitId === cellPos.location.subUnitId && currentLoc.unitId === cellPos.location.unitId) {
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
            return;
          }
          const validator = this._dataValidationModel.getValidator(rule.type);
          if (!validator) {
            this._cellAlertManagerService.removeAlert(ALERT_KEY);
            return;
          }
          this._cellAlertManagerService.showAlert({
            type: 2 /* ERROR */,
            title: this._localeService.t("sheets-data-validation-ui.error.title"),
            message: validator == null ? void 0 : validator.getRuleFinalError(rule, cellPos.location),
            location: cellPos.location,
            width: 200,
            height: 74,
            key: ALERT_KEY
          });
          return;
        }
      }
      this._cellAlertManagerService.removeAlert(ALERT_KEY);
    }));
  }
  _initZenService() {
    this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
      if (visible) {
        this._cellAlertManagerService.removeAlert(ALERT_KEY);
      }
    }));
  }
};
DataValidationAlertController = __decorateClass([
  __decorateParam(0, Inject(HoverManagerService)),
  __decorateParam(1, Inject(CellAlertManagerService)),
  __decorateParam(2, IUniverInstanceService),
  __decorateParam(3, Inject(LocaleService)),
  __decorateParam(4, IZenZoneService),
  __decorateParam(5, Inject(SheetDataValidationModel))
], DataValidationAlertController);

// ../packages/sheets-data-validation-ui/src/controllers/dv-auto-fill.controller.ts
var DataValidationAutoFillController = class extends Disposable {
  constructor(_autoFillService, _sheetDataValidationModel, _injector) {
    super();
    __publicField(this, "_autoFillService", _autoFillService);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_injector", _injector);
    this._initAutoFill();
  }
  // eslint-disable-next-line max-lines-per-function
  _initAutoFill() {
    const noopReturnFunc = () => ({ redos: [], undos: [] });
    const generalApplyFunc = (location, applyType) => {
      const { source: sourceRange, target: targetRange, unitId, subUnitId } = location;
      const ruleMatrixCopy = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
      const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
      const [vSourceRange, vTargetRange] = virtualRange.ranges;
      const { mapFunc } = virtualRange;
      const sourceStartCell = {
        row: vSourceRange.startRow,
        col: vSourceRange.startColumn
      };
      const repeats = tools_default.getAutoFillRepeatRange(vSourceRange, vTargetRange);
      const additionMatrix = new ObjectMatrix();
      const additionRules = /* @__PURE__ */ new Set();
      repeats.forEach((repeat) => {
        const targetStartCell = repeat.repeatStartCell;
        const relativeRange = repeat.relativeRange;
        const sourceRange2 = {
          startRow: sourceStartCell.row,
          startColumn: sourceStartCell.col,
          endColumn: sourceStartCell.col,
          endRow: sourceStartCell.row
        };
        const targetRange2 = {
          startRow: targetStartCell.row,
          startColumn: targetStartCell.col,
          endColumn: targetStartCell.col,
          endRow: targetStartCell.row
        };
        Range.foreach(relativeRange, (row, col) => {
          const sourcePositionRange = Rectangle.getPositionRange(
            {
              startRow: row,
              startColumn: col,
              endColumn: col,
              endRow: row
            },
            sourceRange2
          );
          const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
          const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, sourceRow, sourceCol) || "";
          const targetPositionRange = Rectangle.getPositionRange(
            {
              startRow: row,
              startColumn: col,
              endColumn: col,
              endRow: row
            },
            targetRange2
          );
          const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);
          additionMatrix.setValue(targetRow, targetCol, ruleId);
          additionRules.add(ruleId);
        });
      });
      const additions = Array.from(additionRules).map((id) => ({ id, ranges: queryObjectMatrix(additionMatrix, (value) => value === id) }));
      ruleMatrixCopy.addRangeRules(additions);
      const diffs = ruleMatrixCopy.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId));
      const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, this._injector, "patched", applyType === "ONLY_FORMAT" /* ONLY_FORMAT */);
      return {
        undos: undoMutations,
        redos: redoMutations
      };
    };
    const hook = {
      id: DATA_VALIDATION_PLUGIN_NAME,
      onBeforeFillData: (location) => {
        const { source: sourceRange, unitId, subUnitId } = location;
        for (const row of sourceRange.rows) {
          for (const col of sourceRange.cols) {
            const dv = this._sheetDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
            if (dv && dv.type === "checkbox" /* CHECKBOX */) {
              this._autoFillService.setDisableApplyType("SERIES" /* SERIES */, true);
              return;
            }
          }
        }
      },
      onFillData: (location, direction, applyType) => {
        if (applyType === "COPY" /* COPY */ || applyType === "ONLY_FORMAT" /* ONLY_FORMAT */ || applyType === "SERIES" /* SERIES */) {
          return generalApplyFunc(location, applyType);
        }
        return noopReturnFunc();
      },
      onAfterFillData: () => {
      }
    };
    this.disposeWithMe(this._autoFillService.addHook(hook));
  }
};
DataValidationAutoFillController = __decorateClass([
  __decorateParam(0, IAutoFillService),
  __decorateParam(1, Inject(SheetDataValidationModel)),
  __decorateParam(2, Inject(Injector))
], DataValidationAutoFillController);

// ../packages/sheets-data-validation-ui/src/controllers/dv-copy-paste.controller.ts
var specialPastes2 = [
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
  PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA
];
var DataValidationCopyPasteController = class extends Disposable {
  constructor(_sheetClipboardService, _sheetDataValidationModel, _injector, _univerInstanceService) {
    super();
    __publicField(this, "_sheetClipboardService", _sheetClipboardService);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_copyInfo");
    this._initCopyPaste();
  }
  _initCopyPaste() {
    this._sheetClipboardService.addClipboardHook({
      id: DATA_VALIDATION_PLUGIN_NAME,
      onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
      onPasteCells: (pasteFrom, pasteTo, data, payload) => {
        if (!pasteFrom || !this._copyInfo || specialPastes2.includes(payload.pasteType)) {
          return { redos: [], undos: [] };
        }
        return this._generateMutations(pasteFrom, pasteTo, payload);
      }
    });
  }
  _collect(unitId, subUnitId, range) {
    const matrix = new ObjectMatrix();
    this._copyInfo = {
      unitId,
      subUnitId,
      matrix
    };
    const discreteRange = this._injector.invoke((accessor) => {
      return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
    });
    if (!discreteRange) {
      return;
    }
    const { rows, cols } = discreteRange;
    rows.forEach((row, rowIndex) => {
      cols.forEach((col, colIndex) => {
        const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
        matrix.setValue(rowIndex, colIndex, ruleId != null ? ruleId : "");
      });
    });
  }
  // eslint-disable-next-line max-lines-per-function
  _generateMutations(pasteFrom, pasteTo, payload) {
    const { unitId: copyUnitId, subUnitId: copySubUnitId, range: copyRange } = pasteFrom;
    const { unitId: pastedUnitId, subUnitId: pastedSubUnitId, range: pastedRange } = pasteTo;
    const { copyType = "COPY" /* COPY */ } = payload;
    const target = getSheetCommandTarget(this._univerInstanceService, { unitId: pastedUnitId, subUnitId: pastedSubUnitId });
    if (!target) {
      return { redos: [], undos: [] };
    }
    if (copyType === "CUT" /* CUT */ && pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId) {
      this._copyInfo = null;
      return { redos: [], undos: [] };
    }
    if (pastedUnitId !== copyUnitId || pastedSubUnitId !== copySubUnitId) {
      const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(pastedUnitId, pastedSubUnitId).clone();
      const additionMatrix = new ObjectMatrix();
      const addRules = /* @__PURE__ */ new Set();
      const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
      const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
      const additionRules = /* @__PURE__ */ new Map();
      repeatRange.forEach(({ startRange }) => {
        var _a;
        (_a = this._copyInfo) == null ? void 0 : _a.matrix.forValue((row, col, ruleId) => {
          const range = Rectangle.getPositionRange(
            {
              startRow: row,
              endRow: row,
              startColumn: col,
              endColumn: col
            },
            startRange
          );
          const transformedRuleId = `${copySubUnitId}-${ruleId}`;
          const oldRule = this._sheetDataValidationModel.getRuleById(copyUnitId, copySubUnitId, ruleId);
          if (!this._sheetDataValidationModel.getRuleById(pastedUnitId, pastedSubUnitId, transformedRuleId) && oldRule) {
            additionRules.set(transformedRuleId, { ...oldRule, uid: transformedRuleId });
          }
          const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
          addRules.add(transformedRuleId);
          additionMatrix.setValue(startRow, startColumn, transformedRuleId);
        });
      });
      const additions = Array.from(addRules).map((id) => ({ id, ranges: queryObjectMatrix(additionMatrix, (value) => value === id) }));
      ruleMatrix.addRangeRules(additions);
      const { redoMutations, undoMutations } = getDataValidationDiffMutations(
        pastedUnitId,
        pastedSubUnitId,
        ruleMatrix.diffWithAddition(this._sheetDataValidationModel.getRules(pastedUnitId, pastedSubUnitId), additionRules.values()),
        this._injector,
        "patched",
        false
      );
      if (copyType === "CUT" /* CUT */) {
        const copySheetRuleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(copyUnitId, copySubUnitId).clone();
        const deleteRangeStartCell = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
        const deleteRangeEndCell = mapFunc(vCopyRange.endRow, vCopyRange.endColumn);
        copySheetRuleMatrix.addRangeRules([
          {
            id: "",
            ranges: [{
              startRow: deleteRangeStartCell.row,
              endRow: deleteRangeEndCell.row,
              startColumn: deleteRangeStartCell.col,
              endColumn: deleteRangeEndCell.col
            }]
          }
        ]);
        const { redoMutations: cutRedos, undoMutations: cutUndos } = getDataValidationDiffMutations(
          copyUnitId,
          copySubUnitId,
          copySheetRuleMatrix.diff(this._sheetDataValidationModel.getRules(copyUnitId, copySubUnitId)),
          this._injector,
          "patched",
          false
        );
        redoMutations.push(...cutRedos);
        undoMutations.push(...cutUndos);
      }
      return {
        redos: redoMutations,
        undos: undoMutations
      };
    } else {
      const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(copyUnitId, copySubUnitId).clone();
      const additionMatrix = new ObjectMatrix();
      const additionRules = /* @__PURE__ */ new Set();
      const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
      const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
      repeatRange.forEach(({ startRange }) => {
        var _a;
        (_a = this._copyInfo) == null ? void 0 : _a.matrix.forValue((row, col, ruleId) => {
          const range = Rectangle.getPositionRange(
            {
              startRow: row,
              endRow: row,
              startColumn: col,
              endColumn: col
            },
            startRange
          );
          const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
          additionMatrix.setValue(startRow, startColumn, ruleId);
          additionRules.add(ruleId);
        });
      });
      const additions = Array.from(additionRules).map((id) => ({ id, ranges: queryObjectMatrix(additionMatrix, (value) => value === id) }));
      ruleMatrix.addRangeRules(additions);
      const { redoMutations, undoMutations } = getDataValidationDiffMutations(
        pastedUnitId,
        pastedSubUnitId,
        ruleMatrix.diff(this._sheetDataValidationModel.getRules(copyUnitId, copySubUnitId)),
        this._injector,
        "patched",
        false
      );
      return {
        redos: redoMutations,
        undos: undoMutations
      };
    }
  }
};
DataValidationCopyPasteController = __decorateClass([
  __decorateParam(0, ISheetClipboardService),
  __decorateParam(1, Inject(SheetDataValidationModel)),
  __decorateParam(2, Inject(Injector)),
  __decorateParam(3, Inject(IUniverInstanceService))
], DataValidationCopyPasteController);

// ../packages/sheets-data-validation-ui/src/controllers/dv-permission.controller.ts
var DataValidationPermissionController = class extends Disposable {
  constructor(_localeService, _commandService, _sheetPermissionCheckController) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetPermissionCheckController", _sheetPermissionCheckController);
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        if (command.id === AddSheetDataValidationCommand.id) {
          const { unitId, subUnitId, rule: { ranges } } = command.params;
          const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission]
          }, ranges, unitId, subUnitId);
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-data-validation-ui.permission.dialog.setStyleErr"));
          }
        }
        if (command.id === UpdateSheetDataValidationRangeCommand.id) {
          const { unitId, subUnitId, ranges } = command.params;
          const permission = this._sheetPermissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission]
          }, ranges, unitId, subUnitId);
          if (!permission) {
            this._sheetPermissionCheckController.blockExecuteWithoutPermission(this._localeService.t("sheets-data-validation-ui.permission.dialog.setStyleErr"));
          }
        }
      })
    );
  }
};
DataValidationPermissionController = __decorateClass([
  __decorateParam(0, Inject(LocaleService)),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(SheetPermissionCheckController))
], DataValidationPermissionController);

// ../packages/sheets-data-validation-ui/src/menu/dv.menu.ts
var DATA_VALIDATION_MENU_ID = "sheet.menu.data-validation";
function dataValidationMenuFactory(accessor) {
  return {
    id: DATA_VALIDATION_MENU_ID,
    type: 3 /* SUBITEMS */,
    icon: "DataValidationIcon",
    tooltip: "sheets-data-validation-ui.title",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}
function openDataValidationMenuFactory(_accessor) {
  return {
    id: OpenValidationPanelOperation.id,
    title: "sheets-data-validation-ui.panel.title",
    type: 0 /* BUTTON */
  };
}
function addDataValidationMenuFactory(_accessor) {
  return {
    id: AddSheetDataValidationAndOpenCommand.id,
    title: "sheets-data-validation-ui.panel.add",
    type: 0 /* BUTTON */
  };
}

// ../packages/sheets-data-validation-ui/src/menu/schema.ts
var menuSchema2 = {
  ["ribbon.data.rules" /* RULES */]: {
    [DATA_VALIDATION_MENU_ID]: {
      order: 0,
      menuItemFactory: dataValidationMenuFactory,
      [OpenValidationPanelOperation.id]: {
        order: 0,
        menuItemFactory: openDataValidationMenuFactory
      },
      [AddSheetDataValidationAndOpenCommand.id]: {
        order: 1,
        menuItemFactory: addDataValidationMenuFactory
      }
    }
  }
};

// ../packages/sheets-data-validation-ui/src/controllers/dv-render.controller.ts
var INVALID_MARK = {
  tr: {
    size: 6,
    color: "#fe4b4b"
  }
};
var SheetsDataValidationRenderController = class extends RxDisposable {
  constructor(_commandService, _menuManagerService, _renderManagerService, _univerInstanceService, _autoHeightController, _dropdownManagerService, _sheetDataValidationModel, _dataValidatorRegistryService, _sheetInterceptorService, _dataValidationCacheService, _editorBridgeService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_autoHeightController", _autoHeightController);
    __publicField(this, "_dropdownManagerService", _dropdownManagerService);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_dataValidatorRegistryService", _dataValidatorRegistryService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_dataValidationCacheService", _dataValidationCacheService);
    __publicField(this, "_editorBridgeService", _editorBridgeService);
    this._initMenu();
    this._initDropdown();
    this._initViewModelIntercept();
    this._initAutoHeight();
  }
  _initMenu() {
    this._menuManagerService.mergeMenu(menuSchema2);
  }
  _initDropdown() {
    if (!this._editorBridgeService) {
      return;
    }
    this.disposeWithMe(this._editorBridgeService.visible$.subscribe((visible) => {
      var _a;
      if (!visible.visible) {
        if (((_a = this._dropdownManagerService.activeDropdown) == null ? void 0 : _a.trigger) === "editor-bridge") {
          this._dropdownManagerService.hideDropdown();
        }
        return;
      }
      const state = this._editorBridgeService.getEditCellState();
      if (state) {
        const { unitId, sheetId, row, column } = state;
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
          return;
        }
        const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, sheetId, row, column);
        if (!rule) {
          return;
        }
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (!(validator == null ? void 0 : validator.dropdownType)) {
          return;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        const activeDropdown = this._dropdownManagerService.activeDropdown;
        const currLoc = activeDropdown == null ? void 0 : activeDropdown.location;
        if (currLoc && currLoc.unitId === unitId && currLoc.subUnitId === sheetId && currLoc.row === row && currLoc.col === column) {
          return;
        }
        this._dropdownManagerService.showDropdown(
          {
            location: {
              unitId,
              subUnitId: sheetId,
              row,
              col: column,
              workbook,
              worksheet
            },
            trigger: "editor-bridge",
            closeOnOutSide: false
          }
        );
      }
    }));
  }
  // eslint-disable-next-line max-lines-per-function
  _initViewModelIntercept() {
    this.disposeWithMe(
      this._sheetInterceptorService.intercept(
        INTERCEPTOR_POINT.CELL_CONTENT,
        {
          effect: 1 /* Style */,
          // must be after numfmt
          priority: 9 /* DATA_VALIDATION */,
          // eslint-disable-next-line max-lines-per-function, complexity
          handler: (cell, pos, next) => {
            var _a, _b, _c, _d, _e;
            const { row, col, unitId, subUnitId, workbook, worksheet } = pos;
            const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
            if (!ruleId) {
              return next(cell);
            }
            const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            if (!rule) {
              return next(cell);
            }
            const validStatus = (_a = this._dataValidationCacheService.getValue(unitId, subUnitId, row, col)) != null ? _a : "valid" /* VALID */;
            const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
            const cellOrigin = pos.rawData;
            let cache;
            const cellValue = {
              get value() {
                var _a2;
                if (cache !== void 0) {
                  return cache;
                }
                cache = (_a2 = getCellValueOrigin(cellOrigin)) != null ? _a2 : null;
                return cache;
              }
            };
            const valueStr = {
              get value() {
                var _a2;
                return `${(_a2 = cellValue.value) != null ? _a2 : ""}`;
              }
            };
            if (!cell || cell === pos.rawData) {
              cell = { ...pos.rawData };
            }
            cell.markers = {
              ...cell == null ? void 0 : cell.markers,
              ...validStatus === "invalid" /* INVALID */ ? INVALID_MARK : null
            };
            cell.customRender = [
              ...(_b = cell == null ? void 0 : cell.customRender) != null ? _b : [],
              ...(validator == null ? void 0 : validator.canvasRender) ? [validator.canvasRender] : []
            ];
            cell.fontRenderExtension = {
              ...cell == null ? void 0 : cell.fontRenderExtension,
              isSkip: ((_c = cell == null ? void 0 : cell.fontRenderExtension) == null ? void 0 : _c.isSkip) || ((_d = validator == null ? void 0 : validator.skipDefaultFontRender) == null ? void 0 : _d.call(validator, rule, cellValue.value, pos))
            };
            cell.interceptorStyle = {
              ...cell == null ? void 0 : cell.interceptorStyle,
              ...validator == null ? void 0 : validator.getExtraStyle(rule, valueStr.value, {
                get style() {
                  const styleMap = workbook.getStyles();
                  return (typeof (cell == null ? void 0 : cell.s) === "string" ? styleMap.get(cell == null ? void 0 : cell.s) : cell == null ? void 0 : cell.s) || {};
                }
              }, row, col)
            };
            cell.interceptorAutoHeight = () => {
              var _a2, _b2, _c2, _d2, _e2, _f;
              const skeleton = (_b2 = (_a2 = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a2.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b2.skeleton;
              if (!skeleton) {
                return void 0;
              }
              const mergeCell = skeleton.worksheet.getMergedCell(row, col);
              const info = {
                data: cell,
                style: skeleton.getStyles().getStyleByCell(cell),
                primaryWithCoord: skeleton.getCellWithCoordByIndex((_c2 = mergeCell == null ? void 0 : mergeCell.startRow) != null ? _c2 : row, (_d2 = mergeCell == null ? void 0 : mergeCell.startColumn) != null ? _d2 : col),
                unitId,
                subUnitId,
                row,
                col,
                workbook,
                worksheet
              };
              return (_f = (_e2 = validator == null ? void 0 : validator.canvasRender) == null ? void 0 : _e2.calcCellAutoHeight) == null ? void 0 : _f.call(_e2, info);
            };
            cell.interceptorAutoWidth = () => {
              var _a2, _b2, _c2, _d2, _e2, _f;
              const skeleton = (_b2 = (_a2 = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a2.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b2.skeleton;
              if (!skeleton) {
                return void 0;
              }
              const mergeCell = skeleton.worksheet.getMergedCell(row, col);
              const info = {
                data: cell,
                style: skeleton.getStyles().getStyleByCell(cell),
                primaryWithCoord: skeleton.getCellWithCoordByIndex((_c2 = mergeCell == null ? void 0 : mergeCell.startRow) != null ? _c2 : row, (_d2 = mergeCell == null ? void 0 : mergeCell.startColumn) != null ? _d2 : col),
                unitId,
                subUnitId,
                row,
                col,
                workbook,
                worksheet
              };
              return (_f = (_e2 = validator == null ? void 0 : validator.canvasRender) == null ? void 0 : _e2.calcCellAutoWidth) == null ? void 0 : _f.call(_e2, info);
            };
            cell.coverable = ((_e = cell == null ? void 0 : cell.coverable) != null ? _e : true) && !(rule.type === "list" /* LIST */ || rule.type === "listMultiple" /* LIST_MULTIPLE */);
            return next(cell);
          }
        }
      )
    );
  }
  _initAutoHeight() {
    this._sheetDataValidationModel.ruleChange$.pipe(
      // patched data-validation change don't need to re-calc row height
      // re-calc of row height will be triggered precisely by the origin command
      filter((change) => change.source === "command"),
      bufferTime(100)
    ).subscribe((infos) => {
      if (infos.length === 0) {
        return;
      }
      const ranges = [];
      infos.forEach((info) => {
        var _a;
        if (info.rule.type === "listMultiple" /* LIST_MULTIPLE */ || info.rule.type === "list" /* LIST */) {
          if ((_a = info.rule) == null ? void 0 : _a.ranges) {
            ranges.push(...info.rule.ranges);
          }
        }
      });
      if (ranges.length) {
        const mutations = this._autoHeightController.getUndoRedoParamsOfAutoHeight(ranges);
        sequenceExecute(mutations.redos, this._commandService);
      }
    });
  }
};
SheetsDataValidationRenderController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IMenuManagerService),
  __decorateParam(2, IRenderManagerService),
  __decorateParam(3, IUniverInstanceService),
  __decorateParam(4, Inject(AutoHeightController)),
  __decorateParam(5, Inject(DataValidationDropdownManagerService)),
  __decorateParam(6, Inject(SheetDataValidationModel)),
  __decorateParam(7, Inject(DataValidatorRegistryService)),
  __decorateParam(8, Inject(SheetInterceptorService)),
  __decorateParam(9, Inject(DataValidationCacheService)),
  __decorateParam(10, Optional(IEditorBridgeService))
], SheetsDataValidationRenderController);
var SheetsDataValidationMobileRenderController = class extends RxDisposable {
  constructor(_commandService, _renderManagerService, _autoHeightController, _dataValidatorRegistryService, _sheetInterceptorService, _sheetDataValidationModel, _dataValidationCacheService) {
    super();
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_autoHeightController", _autoHeightController);
    __publicField(this, "_dataValidatorRegistryService", _dataValidatorRegistryService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_dataValidationCacheService", _dataValidationCacheService);
    this._initViewModelIntercept();
    this._initAutoHeight();
  }
  // eslint-disable-next-line max-lines-per-function
  _initViewModelIntercept() {
    this.disposeWithMe(
      this._sheetInterceptorService.intercept(
        INTERCEPTOR_POINT.CELL_CONTENT,
        {
          effect: 1 /* Style */,
          // must be after numfmt
          priority: 9 /* DATA_VALIDATION */,
          // eslint-disable-next-line complexity, max-lines-per-function
          handler: (cell, pos, next) => {
            var _a, _b, _c, _d, _e;
            const { row, col, unitId, subUnitId, workbook, worksheet } = pos;
            const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
            if (!ruleId) {
              return next(cell);
            }
            const rule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            if (!rule) {
              return next(cell);
            }
            const validStatus = (_a = this._dataValidationCacheService.getValue(unitId, subUnitId, row, col)) != null ? _a : "valid" /* VALID */;
            const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
            const cellOrigin = worksheet.getCellRaw(row, col);
            const cellValue = getCellValueOrigin(cellOrigin);
            const valueStr = `${cellValue != null ? cellValue : ""}`;
            if (!cell || cell === pos.rawData) {
              cell = { ...pos.rawData };
            }
            cell.markers = {
              ...cell == null ? void 0 : cell.markers,
              ...validStatus === "invalid" /* INVALID */ ? INVALID_MARK : null
            };
            cell.customRender = [
              ...(_b = cell == null ? void 0 : cell.customRender) != null ? _b : [],
              ...(validator == null ? void 0 : validator.canvasRender) ? [validator.canvasRender] : []
            ];
            cell.fontRenderExtension = {
              ...cell == null ? void 0 : cell.fontRenderExtension,
              isSkip: ((_c = cell == null ? void 0 : cell.fontRenderExtension) == null ? void 0 : _c.isSkip) || ((_d = validator == null ? void 0 : validator.skipDefaultFontRender) == null ? void 0 : _d.call(validator, rule, cellValue, pos))
            };
            cell.interceptorStyle = {
              ...cell == null ? void 0 : cell.interceptorStyle,
              ...validator == null ? void 0 : validator.getExtraStyle(rule, valueStr, {
                get style() {
                  const styleMap = workbook.getStyles();
                  return (typeof (cell == null ? void 0 : cell.s) === "string" ? styleMap.get(cell == null ? void 0 : cell.s) : cell == null ? void 0 : cell.s) || {};
                }
              }, row, col)
            };
            cell.interceptorAutoHeight = () => {
              var _a2, _b2, _c2, _d2, _e2, _f;
              const skeleton = (_b2 = (_a2 = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a2.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b2.skeleton;
              if (!skeleton) {
                return void 0;
              }
              const mergeCell = skeleton.worksheet.getMergedCell(row, col);
              const info = {
                data: cell,
                style: skeleton.getStyles().getStyleByCell(cell),
                primaryWithCoord: skeleton.getCellWithCoordByIndex((_c2 = mergeCell == null ? void 0 : mergeCell.startRow) != null ? _c2 : row, (_d2 = mergeCell == null ? void 0 : mergeCell.startColumn) != null ? _d2 : col),
                unitId,
                subUnitId,
                row,
                col,
                workbook,
                worksheet
              };
              return (_f = (_e2 = validator == null ? void 0 : validator.canvasRender) == null ? void 0 : _e2.calcCellAutoHeight) == null ? void 0 : _f.call(_e2, info);
            };
            cell.interceptorAutoWidth = () => {
              var _a2, _b2, _c2, _d2, _e2, _f;
              const skeleton = (_b2 = (_a2 = this._renderManagerService.getRenderById(unitId)) == null ? void 0 : _a2.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId)) == null ? void 0 : _b2.skeleton;
              if (!skeleton) {
                return void 0;
              }
              const mergeCell = skeleton.worksheet.getMergedCell(row, col);
              const info = {
                data: cell,
                style: skeleton.getStyles().getStyleByCell(cell),
                primaryWithCoord: skeleton.getCellWithCoordByIndex((_c2 = mergeCell == null ? void 0 : mergeCell.startRow) != null ? _c2 : row, (_d2 = mergeCell == null ? void 0 : mergeCell.startColumn) != null ? _d2 : col),
                unitId,
                subUnitId,
                row,
                col,
                workbook,
                worksheet
              };
              return (_f = (_e2 = validator == null ? void 0 : validator.canvasRender) == null ? void 0 : _e2.calcCellAutoWidth) == null ? void 0 : _f.call(_e2, info);
            };
            cell.coverable = ((_e = cell == null ? void 0 : cell.coverable) != null ? _e : true) && !(rule.type === "list" /* LIST */ || rule.type === "listMultiple" /* LIST_MULTIPLE */);
            return next(cell);
          }
        }
      )
    );
  }
  _initAutoHeight() {
    this._sheetDataValidationModel.ruleChange$.pipe(
      filter((change) => change.source === "command"),
      bufferTime(16)
    ).subscribe((infos) => {
      const ranges = [];
      infos.forEach((info) => {
        var _a;
        if (info.rule.type === "listMultiple" /* LIST_MULTIPLE */ || info.rule.type === "list" /* LIST */) {
          if ((_a = info.rule) == null ? void 0 : _a.ranges) {
            ranges.push(...info.rule.ranges);
          }
        }
      });
      if (ranges.length) {
        const mutations = this._autoHeightController.getUndoRedoParamsOfAutoHeight(ranges);
        sequenceExecute(mutations.redos, this._commandService);
      }
    });
  }
};
SheetsDataValidationMobileRenderController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IRenderManagerService),
  __decorateParam(2, Inject(AutoHeightController)),
  __decorateParam(3, Inject(DataValidatorRegistryService)),
  __decorateParam(4, Inject(SheetInterceptorService)),
  __decorateParam(5, Inject(SheetDataValidationModel)),
  __decorateParam(6, Inject(DataValidationCacheService))
], SheetsDataValidationMobileRenderController);

// ../packages/sheets-data-validation-ui/src/controllers/dv-rerender.controller.ts
var SheetsDataValidationReRenderController = class extends Disposable {
  constructor(_context, _sheetDataValidationModel, _sheetSkeletonManagerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_sheetDataValidationModel", _sheetDataValidationModel);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    this._initSkeletonChange();
  }
  _initSkeletonChange() {
    const reRender = (values) => {
      var _a;
      if (!values.length) {
        return;
      }
      const sheetIds = /* @__PURE__ */ new Set();
      values.forEach((value) => {
        sheetIds.add(value.subUnitId);
      });
      sheetIds.forEach((sheetId) => {
        var _a2;
        (_a2 = this._sheetSkeletonManagerService.getSkeletonParam(sheetId)) == null ? void 0 : _a2.skeleton.makeDirty(true);
      });
      (_a = this._context.mainComponent) == null ? void 0 : _a.makeForceDirty();
    };
    this.disposeWithMe(this._sheetDataValidationModel.validStatusChange$.pipe(bufferDebounceTime(16)).subscribe(reRender));
  }
};
SheetsDataValidationReRenderController = __decorateClass([
  __decorateParam(1, Inject(SheetDataValidationModel)),
  __decorateParam(2, Inject(SheetSkeletonManagerService))
], SheetsDataValidationReRenderController);

// ../packages/sheets-data-validation-ui/src/views/components/detail/index.tsx
var import_react15 = __toESM(require_react());

// ../packages/sheets-data-validation-ui/src/views/components/options/index.tsx
var import_react14 = __toESM(require_react());
var import_jsx_runtime14 = __toESM(require_jsx_runtime());
function DataValidationOptions(props) {
  var _a;
  const localeService = useDependency(LocaleService);
  const componentManager = useDependency(ComponentManager);
  const { value, onChange, extraComponent } = props;
  const [show, setShow] = (0, import_react14.useState)(false);
  const ExtraOptions = extraComponent ? componentManager.get(extraComponent) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
      "div",
      {
        className: `univer-mb-3 univer-flex univer-cursor-pointer univer-items-center univer-text-sm univer-text-gray-900 dark:!univer-text-white`,
        onClick: () => setShow(!show),
        children: [
          localeService.t("sheets-data-validation-ui.panel.options"),
          show ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MoreUpIcon, { className: "univer-ml-1" }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MoreDownIcon, { className: "univer-ml-1" })
        ]
      }
    ),
    show && /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
      ExtraOptions ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ExtraOptions, { value, onChange }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        FormLayout,
        {
          label: localeService.t("sheets-data-validation-ui.panel.invalid"),
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(
            RadioGroup,
            {
              value: `${(_a = value.errorStyle) != null ? _a : 2 /* WARNING */}`,
              onChange: (errorStyle) => onChange({ ...value, errorStyle: +errorStyle }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Radio, { value: `${2 /* WARNING */}`, children: localeService.t("sheets-data-validation-ui.panel.showWarning") }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Radio, { value: `${1 /* STOP */}`, children: localeService.t("sheets-data-validation-ui.panel.rejectInput") })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        FormLayout,
        {
          label: localeService.t("sheets-data-validation-ui.panel.messageInfo"),
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            Checkbox,
            {
              checked: value.showErrorMessage,
              onChange: () => onChange({
                ...value,
                showErrorMessage: !value.showErrorMessage
              }),
              children: localeService.t("sheets-data-validation-ui.panel.showInfo")
            }
          )
        }
      ),
      value.showErrorMessage ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Input, { value: value.error, onChange: (error) => onChange({ ...value, error }) }) }) : null
    ] })
  ] });
}

// ../packages/sheets-data-validation-ui/src/views/components/detail/index.tsx
var import_jsx_runtime15 = __toESM(require_jsx_runtime());
var debounceExecuteFactory = (commandService) => debounce_default(
  async (id, params, options, callback) => {
    const res = await commandService.executeCommand(id, params, options);
    callback == null ? void 0 : callback(res);
  },
  1e3
);
function getSheetIdByName(univerInstanceService, unitId, name) {
  var _a, _b, _c, _d;
  if (unitId) {
    return ((_b = (_a = univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetName(name)) == null ? void 0 : _b.getSheetId()) || "";
  }
  return ((_d = (_c = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */)) == null ? void 0 : _c.getSheetBySheetName(name)) == null ? void 0 : _d.getSheetId()) || "";
}
function DataValidationDetail() {
  var _a, _b;
  const [key, setKey] = (0, import_react15.useState)(0);
  const dataValidationPanelService = useDependency(DataValidationPanelService);
  const activeRuleInfo = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule);
  const { unitId, subUnitId, rule } = activeRuleInfo || {};
  const ruleId = rule.uid;
  const validatorService = useDependency(DataValidatorRegistryService);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const componentManager = useDependency(ComponentManager);
  const commandService = useDependency(ICommandService);
  const dataValidationModel = useDependency(DataValidationModel);
  const localeService = useDependency(LocaleService);
  const workbook = useObservable(
    () => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */),
    void 0,
    void 0,
    []
  );
  const worksheet = useObservable(() => {
    var _a2;
    return (_a2 = workbook == null ? void 0 : workbook.activeSheet$) != null ? _a2 : of(null);
  }, void 0, void 0, []);
  const [localRule, setLocalRule] = (0, import_react15.useState)(rule);
  const validator = validatorService.getValidatorItem(localRule.type);
  const [showError, setShowError] = (0, import_react15.useState)(false);
  const validators = validatorService.getValidatorsByScope("sheet" /* SHEET */);
  const [localRanges, setLocalRanges] = (0, import_react15.useState)(() => localRule.ranges.map((i) => ({ unitId: "", sheetId: "", range: i })));
  const debounceExecute = (0, import_react15.useMemo)(() => debounceExecuteFactory(commandService), [commandService]);
  const [isRangeError, setIsRangeError] = (0, import_react15.useState)(false);
  const [isFocusRangeSelector, setIsFocusRangeSelector] = (0, import_react15.useState)(false);
  const rangeSelectorInstance = (0, import_react15.useRef)(null);
  const sheetSelectionService = useDependency(SheetsSelectionsService);
  (0, import_react15.useEffect)(() => {
    return () => {
      const currentSelection = sheetSelectionService.getCurrentLastSelection();
      if (currentSelection) {
        sheetSelectionService.setSelections([currentSelection]);
      }
    };
  }, [sheetSelectionService]);
  (0, import_react15.useEffect)(() => {
    commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === UndoCommand.id || commandInfo.id === RedoCommand.id) {
        setTimeout(() => {
          const activeRule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
          setKey((k) => k + 1);
          if (activeRule) {
            setLocalRule(activeRule);
            setLocalRanges(activeRule.ranges.map((i) => ({ unitId: "", sheetId: "", range: i })));
          }
        }, 20);
      }
    });
  }, [commandService, dataValidationModel, ruleId, subUnitId, unitId]);
  if (!validator) {
    return null;
  }
  const operators = validator.operators;
  const operatorNames = validator.operatorNames;
  const isTwoFormula = localRule.operator ? TWO_FORMULA_OPERATOR_COUNT.includes(localRule.operator) : false;
  const goBackActiveRuleSheet = () => {
    if ((worksheet == null ? void 0 : worksheet.getSheetId()) !== subUnitId) {
      commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
        unitId,
        subUnitId
      });
    }
  };
  const handleOk = () => {
    var _a2, _b2, _c;
    if ((_b2 = (_a2 = rangeSelectorInstance.current) == null ? void 0 : _a2.editor) == null ? void 0 : _b2.isFocus()) {
      handleUpdateRuleRanges((_c = rangeSelectorInstance.current) == null ? void 0 : _c.getValue());
    }
    if (!localRule.ranges.length || isRangeError) {
      return;
    }
    if (validator.validatorFormula(localRule, unitId, subUnitId).success) {
      dataValidationPanelService.setActiveRule(null);
    } else {
      setShowError(true);
    }
    goBackActiveRuleSheet();
  };
  const handleUpdateRuleRanges = useEvent((rangeText) => {
    const unitRanges = rangeText.split(",").filter(Boolean).map(deserializeRangeWithSheet).map((unitRange) => {
      const sheetName = unitRange.sheetName;
      if (sheetName) {
        const sheetId = getSheetIdByName(univerInstanceService, unitRange.unitId, sheetName);
        return { ...unitRange, sheetId };
      }
      return {
        ...unitRange,
        sheetId: ""
      };
    });
    if (isUnitRangesEqual(unitRanges, localRanges)) {
      return;
    }
    setLocalRanges(unitRanges);
    const ranges = unitRanges.filter((i) => (!i.unitId || i.unitId === unitId) && (!i.sheetId || i.sheetId === subUnitId)).map((i) => i.range);
    setLocalRule({
      ...localRule,
      ranges
    });
    if (ranges.length === 0) {
      return;
    }
    const params = {
      unitId,
      subUnitId,
      ruleId,
      ranges
    };
    debounceExecute(UpdateSheetDataValidationRangeCommand.id, params);
  });
  const handleUpdateRuleSetting = (setting) => {
    if (shallowEqual(setting, getRuleSetting(localRule))) {
      return;
    }
    setLocalRule({
      ...localRule,
      ...setting
    });
    const params = {
      unitId,
      subUnitId,
      ruleId,
      setting
    };
    debounceExecute(
      UpdateSheetDataValidationSettingCommand.id,
      params,
      void 0
    );
  };
  const handleDelete = async () => {
    await commandService.executeCommand(RemoveSheetDataValidationCommand.id, {
      ruleId,
      unitId,
      subUnitId
    });
    dataValidationPanelService.setActiveRule(null);
    goBackActiveRuleSheet();
  };
  const baseRule = {
    type: localRule.type,
    operator: localRule.operator,
    formula1: localRule.formula1,
    formula2: localRule.formula2,
    allowBlank: localRule.allowBlank
  };
  const handleChangeType = (newType) => {
    const validator2 = validatorService.getValidatorItem(newType);
    if (!validator2) {
      return;
    }
    const operators2 = validator2.operators;
    const rule2 = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
    const newRule = newType === (rule2 == null ? void 0 : rule2.type) || newType.includes("list") && (rule2 == null ? void 0 : rule2.type.includes("list")) ? {
      ...rule2,
      type: newType
    } : {
      ...localRule,
      type: newType,
      operator: operators2[0],
      formula1: void 0,
      formula2: void 0
    };
    setLocalRule(newRule);
    commandService.executeCommand(UpdateSheetDataValidationSettingCommand.id, {
      unitId,
      subUnitId,
      ruleId: localRule.uid,
      setting: getRuleSetting(newRule)
    });
  };
  const FormulaInput = componentManager.get(validator.formulaInput);
  const rangeStr = (0, import_react15.useMemo)(() => localRanges.map((i) => serializeRange(i.range)).join(","), []);
  const options = getRuleOptions(localRule);
  const handleUpdateRuleOptions = (newOptions) => {
    if (shallowEqual(newOptions, getRuleOptions(localRule))) {
      return;
    }
    setLocalRule({
      ...localRule,
      ...newOptions
    });
    debounceExecute(
      UpdateSheetDataValidationOptionsCommand.id,
      {
        unitId,
        subUnitId,
        ruleId,
        options: newOptions
      }
    );
  };
  const shouldHideFormula = operators.length && !localRule.operator;
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { "data-u-comp": "data-validation-detail", className: "univer-py-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      FormLayout,
      {
        label: localeService.t("sheets-data-validation-ui.panel.range"),
        error: !localRule.ranges.length || isRangeError ? localeService.t("sheets-data-validation-ui.panel.rangeError") : "",
        children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          RangeSelector,
          {
            selectorRef: rangeSelectorInstance,
            unitId,
            subUnitId,
            initialValue: rangeStr,
            onChange: (doc, str) => {
              var _a2;
              if (!isFocusRangeSelector && ((_a2 = rangeSelectorInstance.current) == null ? void 0 : _a2.verify())) {
                handleUpdateRuleRanges(str);
              }
            },
            onFocusChange: (focusing, str) => {
              var _a2;
              setIsFocusRangeSelector(focusing);
              if (!focusing && str && ((_a2 = rangeSelectorInstance.current) == null ? void 0 : _a2.verify())) {
                handleUpdateRuleRanges(str);
              }
            },
            onVerify: (isValid) => setIsRangeError(!isValid)
          }
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.panel.type"), children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      Select,
      {
        className: "univer-w-full",
        value: localRule.type,
        options: (_a = validators == null ? void 0 : validators.sort((a, b) => a.order - b.order)) == null ? void 0 : _a.map((validator2) => ({
          label: localeService.t(validator2.title),
          value: validator2.id
        })),
        onChange: handleChangeType
      }
    ) }),
    (operators == null ? void 0 : operators.length) ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.panel.operator"), children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      Select,
      {
        className: "univer-w-full",
        value: `${localRule.operator}`,
        options: [
          {
            value: "",
            label: localeService.t("data-validation.operators.legal")
          },
          ...operators.map((op, i) => ({
            value: `${op}`,
            label: operatorNames[i]
          }))
        ],
        onChange: (operator) => {
          handleUpdateRuleSetting({
            ...baseRule,
            operator
          });
        }
      }
    ) }) : null,
    FormulaInput && !shouldHideFormula ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      FormulaInput,
      {
        isTwoFormula,
        value: {
          formula1: localRule.formula1,
          formula2: localRule.formula2
        },
        onChange: (value) => {
          handleUpdateRuleSetting({
            ...baseRule,
            ...value
          });
        },
        showError,
        validResult: validator.validatorFormula(localRule, unitId, subUnitId),
        unitId,
        subUnitId,
        ruleId
      },
      key + localRule.type
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      Checkbox,
      {
        checked: (_b = localRule.allowBlank) != null ? _b : true,
        onChange: () => {
          var _a2;
          return handleUpdateRuleSetting({
            ...baseRule,
            allowBlank: !((_a2 = localRule.allowBlank) != null ? _a2 : true)
          });
        },
        children: localeService.t("sheets-data-validation-ui.panel.allowBlank")
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(DataValidationOptions, { value: options, onChange: handleUpdateRuleOptions, extraComponent: validator.optionsInput }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "univer-mt-5 univer-flex univer-flex-row univer-justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Button, { className: "univer-ml-3", onClick: handleDelete, children: localeService.t("sheets-data-validation-ui.panel.removeRule") }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Button, { className: "univer-ml-3", variant: "primary", onClick: handleOk, children: localeService.t("sheets-data-validation-ui.panel.done") })
    ] })
  ] });
}

// ../packages/sheets-data-validation-ui/src/views/components/list/index.tsx
var import_react17 = __toESM(require_react());

// ../packages/sheets-data-validation-ui/src/views/components/item/index.tsx
var import_react16 = __toESM(require_react());
var import_jsx_runtime16 = __toESM(require_jsx_runtime());
var DataValidationItem = (props) => {
  const { rule, onClick, unitId, subUnitId, disable } = props;
  const validatorRegistry = useDependency(DataValidatorRegistryService);
  const commandService = useDependency(ICommandService);
  const markSelectionService = useDependency(IMarkSelectionService);
  const validator = validatorRegistry.getValidatorItem(rule.type);
  const ids = (0, import_react16.useRef)(void 0);
  const [isHover, setIsHover] = (0, import_react16.useState)(false);
  const themeService = useDependency(ThemeService);
  const theme = useObservable(themeService.currentTheme$);
  const style = (0, import_react16.useMemo)(() => {
    var _a;
    const defaultColor = themeService.getColorFromTheme("primary.600");
    const key = themeService.getColorFromTheme("loop-color.2");
    const color = (_a = themeService.getColorFromTheme(key)) != null ? _a : defaultColor;
    const rgb = new ColorKit(color).toRgb();
    return {
      fill: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      stroke: color
    };
  }, [theme]);
  const handleDelete = (e) => {
    commandService.executeCommand(RemoveSheetDataValidationCommand.id, {
      ruleId: rule.uid,
      unitId,
      subUnitId
    });
    e.stopPropagation();
  };
  (0, import_react16.useEffect)(() => {
    return () => {
      var _a;
      if (ids.current) {
        (_a = ids.current) == null ? void 0 : _a.forEach((id) => {
          id && markSelectionService.removeShape(id);
        });
      }
    };
  }, [markSelectionService]);
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
    "div",
    {
      className: clsx(
        `univer-bg-secondary univer-relative univer--mx-2 univer-box-border univer-flex univer-w-[287px] univer-cursor-pointer univer-flex-col univer-justify-between univer-overflow-hidden univer-rounded-md univer-p-2 univer-pr-9`,
        {
          "hover:univer-bg-gray-50 dark:hover:!univer-bg-gray-700": !disable,
          "univer-opacity-50": disable
        }
      ),
      onClick,
      onMouseEnter: () => {
        if (disable) return;
        setIsHover(true);
        ids.current = rule.ranges.map((range) => markSelectionService.addShape({
          range,
          style,
          primary: null
        }));
      },
      onMouseLeave: () => {
        var _a;
        setIsHover(false);
        (_a = ids.current) == null ? void 0 : _a.forEach((id) => {
          id && markSelectionService.removeShape(id);
        });
        ids.current = void 0;
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "div",
          {
            className: `univer-truncate univer-text-sm univer-font-medium univer-leading-[22px] univer-text-gray-900 dark:!univer-text-white`,
            children: validator == null ? void 0 : validator.generateRuleName(rule)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "div",
          {
            className: `univer-text-secondary univer-truncate univer-text-xs univer-leading-[18px] dark:!univer-text-gray-300`,
            children: rule.ranges.map((range) => serializeRange(range)).join(",")
          }
        ),
        isHover ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "div",
          {
            className: `univer-absolute univer-right-2 univer-top-[19px] univer-flex univer-size-5 univer-items-center univer-justify-center univer-rounded hover:univer-bg-gray-200 dark:!univer-text-gray-300 dark:hover:!univer-bg-gray-700`,
            onClick: handleDelete,
            children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(DeleteIcon, {})
          }
        ) : null
      ]
    }
  );
};

// ../packages/sheets-data-validation-ui/src/views/components/list/index.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime());
function DataValidationList(props) {
  const sheetDataValidationModel = useDependency(SheetDataValidationModel);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const commandService = useDependency(ICommandService);
  const injector = useDependency(Injector);
  const dataValidationPanelService = useDependency(DataValidationPanelService);
  const localeService = useDependency(LocaleService);
  const [rules, setRules] = (0, import_react17.useState)([]);
  const { workbook } = props;
  const worksheet = useObservable(workbook.activeSheet$, void 0, true);
  const unitId = workbook.getUnitId();
  const subUnitId = worksheet == null ? void 0 : worksheet.getSheetId();
  (0, import_react17.useEffect)(() => {
    setRules(sheetDataValidationModel.getRules(unitId, subUnitId));
    const subscription = sheetDataValidationModel.ruleChange$.subscribe((change) => {
      if (change.unitId === unitId && change.subUnitId === subUnitId) {
        setRules(sheetDataValidationModel.getRules(unitId, subUnitId));
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [unitId, subUnitId, sheetDataValidationModel]);
  const handleAddRule = async () => {
    const rule = createDefaultNewRule(injector);
    const params = {
      unitId,
      subUnitId,
      rule
    };
    await commandService.executeCommand(AddSheetDataValidationCommand.id, params);
    dataValidationPanelService.setActiveRule({
      unitId,
      subUnitId,
      rule
    });
  };
  const handleRemoveAll = () => {
    commandService.executeCommand(RemoveSheetAllDataValidationCommand.id, {
      unitId,
      subUnitId
    });
  };
  const getDvRulesByPermissionCorrect = (rules2) => {
    const workbook2 = univerInstanceService.getCurrentUnitOfType(2 /* UNIVER_SHEET */);
    const worksheet2 = workbook2.getActiveSheet();
    const unitId2 = workbook2.getUnitId();
    const subUnitId2 = worksheet2.getSheetId();
    const rulesByPermissionCheck2 = rules2.map((rule) => {
      const hasPermission = checkRangesEditablePermission(injector, unitId2, subUnitId2, rule.ranges);
      if (hasPermission) {
        return { ...rule };
      } else {
        return { ...rule, disable: true };
      }
    });
    return rulesByPermissionCheck2;
  };
  const rulesByPermissionCheck = getDvRulesByPermissionCorrect(rules);
  const hasDisableRule = rulesByPermissionCheck == null ? void 0 : rulesByPermissionCheck.some((rule) => rule.disable);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "univer-pb-4", children: [
    rulesByPermissionCheck == null ? void 0 : rulesByPermissionCheck.map((rule) => {
      var _a;
      return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        DataValidationItem,
        {
          unitId,
          subUnitId,
          onClick: () => {
            if (rule.disable) return;
            dataValidationPanelService.setActiveRule({
              unitId,
              subUnitId,
              rule
            });
          },
          rule,
          disable: (_a = rule.disable) != null ? _a : false
        },
        rule.uid
      );
    }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "univer-mt-4 univer-flex univer-flex-row univer-justify-end univer-gap-2", children: [
      rules.length && !hasDisableRule ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Button, { onClick: handleRemoveAll, children: localeService.t("sheets-data-validation-ui.panel.removeAll") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Button, { variant: "primary", onClick: handleAddRule, children: localeService.t("sheets-data-validation-ui.panel.add") })
    ] })
  ] });
}

// ../packages/sheets-data-validation-ui/src/views/components/panel/index.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime());
var DataValidationPanel = () => {
  const dataValidationPanelService = useDependency(DataValidationPanelService);
  const activeRule = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule);
  const univerInstanceService = useDependency(IUniverInstanceService);
  const workbook = useObservable(
    () => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */),
    void 0,
    void 0,
    []
  );
  const worksheet = useObservable(() => {
    var _a;
    return (_a = workbook == null ? void 0 : workbook.activeSheet$) != null ? _a : of(null);
  }, void 0, void 0, []);
  if (!workbook || !worksheet) return null;
  return activeRule && (activeRule.subUnitId === worksheet.getSheetId() || activeRule.subUnitId === dataValidationPanelService.getFocusFormulaEditorActiveRuleSubUnitId()) ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(DataValidationDetail, {}, activeRule.rule.uid) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(DataValidationList, { workbook });
};

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/BaseFormulaInput.tsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime());
var BaseFormulaInput = (props) => {
  const { isTwoFormula = false, value, onChange, showError, validResult } = props;
  const localeService = useDependency(LocaleService);
  const formula1Res = showError ? validResult == null ? void 0 : validResult.formula1 : "";
  const formula2Res = showError ? validResult == null ? void 0 : validResult.formula2 : "";
  if (isTwoFormula) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(FormLayout, { error: formula1Res, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        Input,
        {
          className: "univer-w-full",
          placeholder: localeService.t("sheets-data-validation-ui.panel.formulaPlaceholder"),
          value: value == null ? void 0 : value.formula1,
          onChange: (newValue) => {
            onChange == null ? void 0 : onChange({
              ...value,
              formula1: newValue
            });
          }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "-univer-mt-2 univer-mb-1 univer-text-sm univer-text-gray-400", children: localeService.t("sheets-data-validation-ui.panel.formulaAnd") }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(FormLayout, { error: formula2Res, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        Input,
        {
          className: "univer-w-full",
          placeholder: localeService.t("sheets-data-validation-ui.panel.formulaPlaceholder"),
          value: value == null ? void 0 : value.formula2,
          onChange: (newValue) => {
            onChange == null ? void 0 : onChange({
              ...value,
              formula2: newValue
            });
          }
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(FormLayout, { error: formula1Res, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
    Input,
    {
      className: "univer-w-full",
      placeholder: localeService.t("sheets-data-validation-ui.panel.formulaPlaceholder"),
      value: value == null ? void 0 : value.formula1,
      onChange: (newValue) => {
        onChange == null ? void 0 : onChange({ formula1: newValue });
      }
    }
  ) });
};

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/CheckboxFormulaInput.tsx
var import_react18 = __toESM(require_react());
var import_jsx_runtime20 = __toESM(require_jsx_runtime());
function CheckboxFormulaInput(props) {
  const { value, onChange, showError, validResult } = props;
  const localeService = useDependency(LocaleService);
  const formula1Res = showError ? validResult == null ? void 0 : validResult.formula1 : "";
  const formula2Res = showError ? validResult == null ? void 0 : validResult.formula2 : "";
  const [checked, setChecked] = (0, import_react18.useState)(!((value == null ? void 0 : value.formula1) === void 0 && (value == null ? void 0 : value.formula2) === void 0));
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      Checkbox,
      {
        checked,
        onChange: (newValue) => {
          if (newValue) {
            setChecked(true);
          } else {
            setChecked(false);
            onChange == null ? void 0 : onChange({
              ...value,
              formula1: void 0,
              formula2: void 0
            });
          }
        },
        children: localeService.t("sheets-data-validation-ui.checkbox.tips")
      }
    ) }),
    checked ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.checkbox.checked"), error: formula1Res, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      Input,
      {
        className: "univer-w-full",
        placeholder: localeService.t("sheets-data-validation-ui.panel.valuePlaceholder"),
        value: value == null ? void 0 : value.formula1,
        onChange: (newValue) => {
          onChange == null ? void 0 : onChange({
            ...value,
            formula1: newValue || void 0
          });
        }
      }
    ) }) : null,
    checked ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.checkbox.unchecked"), error: formula2Res, children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      Input,
      {
        className: "univer-w-full",
        placeholder: localeService.t("sheets-data-validation-ui.panel.valuePlaceholder"),
        value: value == null ? void 0 : value.formula2,
        onChange: (newValue) => {
          onChange == null ? void 0 : onChange({
            ...value,
            formula2: newValue || void 0
          });
        }
      }
    ) }) : null
  ] });
}

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/CustomFormulaInput.tsx
var import_react19 = __toESM(require_react());
var import_jsx_runtime21 = __toESM(require_jsx_runtime());
function CustomFormulaInput(props) {
  var _a;
  const { unitId, subUnitId, value, onChange, showError, validResult } = props;
  const formula1Res = showError ? validResult == null ? void 0 : validResult.formula1 : void 0;
  const formulaEditorRef = (0, import_react19.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react19.useState)(false);
  useSidebarClick((e) => {
    var _a2;
    const isOutSide = (_a2 = formulaEditorRef.current) == null ? void 0 : _a2.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(FormLayout, { error: formula1Res, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
    FormulaEditor,
    {
      ref: formulaEditorRef,
      className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
      initValue: (_a = value == null ? void 0 : value.formula1) != null ? _a : "=",
      unitId,
      subUnitId,
      isFocus: isFocusFormulaEditor,
      isSupportAcrossSheet: true,
      onChange: (newValue) => {
        const newFormula = (newValue != null ? newValue : "").trim();
        if (newFormula === (value == null ? void 0 : value.formula1)) {
          return;
        }
        onChange == null ? void 0 : onChange({
          ...value,
          formula1: newFormula
        });
      },
      onFocus: () => setIsFocusFormulaEditor(true)
    }
  ) });
}

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/ListFormulaInput.tsx
var import_react20 = __toESM(require_react());

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/utils.ts
function buildCustomListFormulaPayload(items, defaultColor) {
  const labelSet = /* @__PURE__ */ new Set();
  const finalList = [];
  items.forEach((item) => {
    if (!item.label || labelSet.has(item.label)) {
      return;
    }
    labelSet.add(item.label);
    finalList.push(item);
  });
  return {
    formula1: serializeListOptions(finalList.map((item) => item.label)),
    formula2: finalList.map((item) => item.color === defaultColor ? "" : item.color).join(",")
  };
}

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/ListFormulaInput.tsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime());
var DEFAULT_COLOR_PRESET = [
  "#FFFFFF",
  "#FEE7E7",
  "#FEF0E6",
  "#EFFBD0",
  "#E4F4FE",
  "#E8ECFD",
  "#F1EAFA",
  "#FDE8F3",
  "#E5E5E5",
  "#FDCECE",
  "#FDC49B",
  "#DEF6A2",
  "#9FDAFF",
  "#D0D9FB",
  "#E3D5F6",
  "#FBD0E8",
  "#656565",
  "#FE4B4B",
  "#FF8C51",
  "#8BBB11",
  "#0B9EFB",
  "#3A60F7",
  "#9E6DE3",
  "#F248A6"
];
var ColorSelect = (props) => {
  const { value, onChange, disabled } = props;
  const [open, setOpen] = (0, import_react20.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    Dropdown,
    {
      align: "start",
      disabled,
      open,
      onOpenChange: setOpen,
      overlay: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
        "div",
        {
          className: `univer-box-border univer-grid univer-w-fit univer-grid-cols-6 univer-flex-wrap univer-gap-2 univer-p-1.5`,
          children: DEFAULT_COLOR_PRESET.map(
            (color) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
              "div",
              {
                className: clsx("univer-box-border univer-size-4 univer-cursor-pointer univer-rounded", borderClassName),
                style: { background: color },
                onClick: () => {
                  onChange(color);
                  setOpen(false);
                }
              },
              color
            )
          )
        }
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(
        "div",
        {
          className: clsx(`univer-box-border univer-inline-flex univer-h-8 univer-w-16 univer-cursor-pointer univer-items-center univer-justify-between univer-gap-2 univer-rounded-lg univer-bg-white univer-px-2.5 univer-transition-colors univer-duration-200 hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white`, borderClassName),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
              "div",
              {
                className: "univer-box-border univer-size-4 univer-rounded univer-text-base",
                style: { background: value }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(MoreDownIcon, {})
          ]
        }
      )
    }
  );
};
var Template = (props) => {
  const { item, commonProps, className } = props;
  const { onItemChange, onItemDelete } = commonProps;
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: clsx("univer-flex univer-items-center univer-gap-2", className), children: [
    !item.isRef && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: clsx("univer-cursor-move", "draggableHandle"), children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(SequenceIcon, {}) }),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      ColorSelect,
      {
        value: item.color,
        onChange: (color) => {
          onItemChange(item.id, item.label, color);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      Input,
      {
        disabled: item.isRef,
        value: item.label,
        onChange: (label) => {
          onItemChange(item.id, label, item.color);
        }
      }
    ),
    item.isRef ? null : /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      "div",
      {
        className: `univer-ml-1 univer-cursor-pointer univer-rounded univer-text-base hover:univer-bg-gray-200`,
        children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(DeleteIcon, { onClick: () => onItemDelete(item.id) })
      }
    )
  ] });
};
var NOOP = () => {
};
function ListFormulaInput(props) {
  const { value, onChange: _onChange = NOOP, unitId, subUnitId, validResult, showError, ruleId } = props;
  const { formula1 = "", formula2 = "" } = value || {};
  const [isFormulaStr, setIsFormulaStr] = (0, import_react20.useState)(() => isFormulaString(formula1) ? "1" : "0");
  const [formulaStr, setFormulaStr] = (0, import_react20.useState)(isFormulaStr === "1" ? formula1 : "=");
  const [formulaStrCopy, setFormulaStrCopy] = (0, import_react20.useState)(isFormulaStr === "1" ? formula1 : "=");
  const localeService = useDependency(LocaleService);
  const dataValidatorRegistryService = useDependency(DataValidatorRegistryService);
  const dataValidationModel = useDependency(DataValidationModel);
  const dataValidationFormulaController = useDependency(DataValidationFormulaController);
  const dataValidationPanelService = useDependency(DataValidationPanelService);
  const [refColors, setRefColors] = (0, import_react20.useState)(() => formula2.split(","));
  const listValidator = dataValidatorRegistryService.getValidatorItem("list" /* LIST */);
  const [refOptions, setRefOptions] = (0, import_react20.useState)([]);
  const [localError, setLocalError] = (0, import_react20.useState)("");
  const formula1Res = showError ? validResult == null ? void 0 : validResult.formula1 : "";
  const ruleChange$ = (0, import_react20.useMemo)(() => dataValidationModel.ruleChange$.pipe(debounceTime(16)), []);
  const ruleChange = useObservable(ruleChange$);
  const onChange = useEvent(_onChange);
  (0, import_react20.useEffect)(() => {
    (async () => {
      await awaitTime(100);
      const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
      const formula12 = rule == null ? void 0 : rule.formula1;
      if (isFormulaString(formula12) && listValidator && rule) {
        const res = await listValidator.getListAsync(rule, unitId, subUnitId);
        setRefOptions(res);
      }
    })();
  }, [dataValidationModel, ruleChange, listValidator, ruleId, subUnitId, unitId]);
  (0, import_react20.useEffect)(() => {
    if (isFormulaString(formula1) && formula1 !== formulaStrCopy) {
      setFormulaStr(formula1);
      setFormulaStrCopy(formulaStrCopy);
    }
  }, [formulaStrCopy, formula1]);
  const [strList, setStrList] = (0, import_react20.useState)(() => {
    const strOptions = isFormulaStr !== "1" ? deserializeListOptions(formula1) : [];
    const strColors = formula2.split(",");
    return strOptions.map((label, i) => ({
      label,
      color: strColors[i] || DROP_DOWN_DEFAULT_COLOR,
      isRef: false,
      id: generateRandomId(4)
    }));
  });
  const handleStrItemChange = (id, value2, color) => {
    const item = strList.find((i) => i.id === id);
    if (!item) {
      return;
    }
    item.label = value2;
    item.color = color;
    setStrList([...strList]);
  };
  const handleStrItemDelete = (id) => {
    const index = strList.findIndex((i) => i.id === id);
    if (index !== -1) {
      strList.splice(index, 1);
      setStrList([...strList]);
    }
  };
  const refFinalList = (0, import_react20.useMemo)(() => refOptions.map((label, i) => ({
    label,
    color: refColors[i] || DROP_DOWN_DEFAULT_COLOR,
    id: `${i}`,
    isRef: true
  })), [refColors, refOptions]);
  const handleRefItemChange = (id, value2, color) => {
    const newColors = [...refColors];
    newColors[+id] = color;
    setRefColors(newColors);
    onChange({
      formula1,
      formula2: newColors.join(",")
    });
  };
  const handleAdd = () => {
    setStrList([
      ...strList,
      {
        label: "",
        color: DROP_DOWN_DEFAULT_COLOR,
        isRef: false,
        id: generateRandomId(4)
      }
    ]);
  };
  (0, import_react20.useEffect)(() => {
    if (isFormulaStr === "1") {
      return;
    }
    onChange(buildCustomListFormulaPayload(strList, DROP_DOWN_DEFAULT_COLOR));
  }, [strList, onChange, isFormulaStr]);
  const updateFormula = useEvent(async (str) => {
    if (!isFormulaString(str)) {
      onChange == null ? void 0 : onChange({
        formula1: "",
        formula2
      });
      return;
    }
    if (dataValidationFormulaController.getFormulaRefCheck(str)) {
      onChange == null ? void 0 : onChange({
        formula1: isFormulaString(str) ? str : "",
        formula2
      });
      setLocalError("");
    } else {
      onChange == null ? void 0 : onChange({
        formula1: "",
        formula2
      });
      setFormulaStr("=");
      setLocalError(localeService.t("sheets-data-validation-ui.validFail.formulaError"));
    }
  });
  const formulaEditorRef = (0, import_react20.useRef)(null);
  const [isFocusFormulaEditor, setIsFocusFormulaEditor] = (0, import_react20.useState)(false);
  useSidebarClick((e) => {
    var _a;
    const isOutSide = (_a = formulaEditorRef.current) == null ? void 0 : _a.isClickOutSide(e);
    isOutSide && setIsFocusFormulaEditor(false);
  });
  (0, import_react20.useEffect)(() => {
    if (isFocusFormulaEditor) {
      dataValidationPanelService.setFocusFormulaEditorActiveRuleSubUnitId(subUnitId);
    } else {
      dataValidationPanelService.setFocusFormulaEditorActiveRuleSubUnitId(null);
    }
  }, [isFocusFormulaEditor, subUnitId, dataValidationPanelService]);
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.list.options"), children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(
      RadioGroup,
      {
        value: isFormulaStr,
        onChange: (v) => {
          setIsFormulaStr(v);
          setFormulaStr(formulaStrCopy);
          if (v === "1") {
            onChange({
              formula1: formulaStrCopy === "=" ? "" : formulaStrCopy,
              formula2: refColors.join(",")
            });
          }
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Radio, { value: "0", children: localeService.t("sheets-data-validation-ui.list.customOptions") }),
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Radio, { value: "1", children: localeService.t("sheets-data-validation-ui.list.refOptions") })
        ]
      }
    ) }),
    isFormulaStr === "1" ? /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(FormLayout, { error: formula1Res || localError || void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
        FormulaEditor,
        {
          ref: formulaEditorRef,
          className: clsx(`univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors hover:univer-border-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-white [&>div:first-child]:univer-px-2.5 [&>div]:univer-h-5 [&>div]:univer-ring-transparent`, borderClassName),
          initValue: formulaStr,
          unitId,
          subUnitId,
          isFocus: isFocusFormulaEditor,
          isSupportAcrossSheet: true,
          onFocus: () => setIsFocusFormulaEditor(true),
          onChange: (v = "") => {
            const str = (v != null ? v : "").trim();
            setFormulaStrCopy(str);
            updateFormula(str);
          }
        }
      ),
      refFinalList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "univer-mt-3", children: refFinalList.map((item) => {
        return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
          Template,
          {
            className: "univer-mb-3",
            item,
            commonProps: { onItemChange: handleRefItemChange }
          },
          item.id
        );
      }) })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(FormLayout, { error: formula1Res, children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
        DraggableList,
        {
          list: strList,
          onListChange: setStrList,
          rowHeight: 28,
          margin: [0, 12],
          draggableHandle: ".draggableHandle",
          itemRender: (item) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
            Template,
            {
              item,
              commonProps: {
                onItemChange: handleStrItemChange,
                onItemDelete: handleStrItemDelete
              }
            },
            item.id
          ),
          idKey: "id"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(
        "a",
        {
          className: `univer-text-primary univer-flex univer-w-fit univer-cursor-pointer univer-flex-row univer-items-center univer-rounded univer-p-1 univer-px-2 univer-text-sm hover:univer-bg-primary-50 dark:hover:!univer-bg-gray-800`,
          onClick: handleAdd,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(IncreaseIcon, { className: "univer-mr-1" }),
            localeService.t("sheets-data-validation-ui.list.add")
          ]
        }
      )
    ] }) })
  ] });
}

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/index.ts
var FORMULA_INPUTS = [
  [
    CUSTOM_FORMULA_INPUT_NAME,
    CustomFormulaInput
  ],
  [
    BASE_FORMULA_INPUT_NAME,
    BaseFormulaInput
  ],
  [
    LIST_FORMULA_INPUT_NAME,
    ListFormulaInput
  ],
  [
    CHECKBOX_FORMULA_INPUT_NAME,
    CheckboxFormulaInput
  ]
];

// ../packages/sheets-data-validation-ui/src/views/components/render-mode/index.tsx
var import_jsx_runtime23 = __toESM(require_jsx_runtime());
var LIST_RENDER_MODE_OPTION_INPUT = "LIST_RENDER_MODE_OPTION_INPUT";
function ListRenderModeInput(props) {
  var _a;
  const { value, onChange } = props;
  const localeService = useDependency(LocaleService);
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(FormLayout, { label: localeService.t("sheets-data-validation-ui.renderMode.label"), children: /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(RadioGroup, { value: `${(_a = value.renderMode) != null ? _a : 2 /* CUSTOM */}`, onChange: (renderMode) => onChange({ ...value, renderMode: +renderMode }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Radio, { value: `${2 /* CUSTOM */}`, children: localeService.t("sheets-data-validation-ui.renderMode.chip") }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Radio, { value: `${1 /* ARROW */}`, children: localeService.t("sheets-data-validation-ui.renderMode.arrow") }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Radio, { value: `${0 /* TEXT */}`, children: localeService.t("sheets-data-validation-ui.renderMode.text") })
  ] }) });
}
ListRenderModeInput.componentKey = LIST_RENDER_MODE_OPTION_INPUT;

// ../packages/sheets-data-validation-ui/src/views/components/show-time/index.tsx
var import_jsx_runtime24 = __toESM(require_jsx_runtime());
var DATE_SHOW_TIME_OPTION = "DATE_SHOW_TIME_OPTION";
function DateShowTimeOption(props) {
  var _a;
  const { value, onChange } = props;
  const localeService = useDependency(LocaleService);
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(FormLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
    Checkbox,
    {
      checked: (_a = value.bizInfo) == null ? void 0 : _a.showTime,
      onChange: (showTime) => {
        onChange({
          ...value,
          bizInfo: {
            ...value.bizInfo,
            showTime
          }
        });
      },
      children: localeService.t("sheets-data-validation-ui.showTime.label")
    }
  ) });
}
DateShowTimeOption.componentKey = DATE_SHOW_TIME_OPTION;

// ../packages/sheets-data-validation-ui/src/views/widgets/checkbox-widget.ts
var MARGIN_H = 6;
var CheckboxRender = class {
  constructor(_commandService, _univerInstanceService, _formulaService, _themeService, _renderManagerService, _dataValidationModel) {
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_formulaService", _formulaService);
    __publicField(this, "_themeService", _themeService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
  }
  _calc(cellInfo, style) {
    var _a, _b, _c;
    const { vt, ht } = style || {};
    const width = cellInfo.endX - cellInfo.startX - MARGIN_H * 2;
    const height = cellInfo.endY - cellInfo.startY;
    const size = ((_a = style == null ? void 0 : style.fs) != null ? _a : 10) * 1.6;
    let widgetLeft = 0;
    let widgetTop = 0;
    switch (vt) {
      case 1 /* TOP */:
        widgetTop = 0;
        break;
      case 3 /* BOTTOM */:
        widgetTop = 0 + (height - size);
        break;
      default:
        widgetTop = 0 + (height - size) / 2;
        break;
    }
    switch (ht) {
      case 1 /* LEFT */:
        widgetLeft = MARGIN_H;
        break;
      case 3 /* RIGHT */:
        widgetLeft = MARGIN_H + (width - size);
        break;
      default:
        widgetLeft = MARGIN_H + (width - size) / 2;
        break;
    }
    return {
      left: cellInfo.startX + widgetLeft,
      top: cellInfo.startY + widgetTop,
      width: ((_b = style == null ? void 0 : style.fs) != null ? _b : 10) * 1.6,
      height: ((_c = style == null ? void 0 : style.fs) != null ? _c : 10) * 1.6
    };
  }
  calcCellAutoHeight(info) {
    var _a;
    const { style } = info;
    return ((_a = style == null ? void 0 : style.fs) != null ? _a : 10) * 1.6;
  }
  calcCellAutoWidth(info) {
    var _a;
    const { style } = info;
    return ((_a = style == null ? void 0 : style.fs) != null ? _a : 10) * 1.6;
  }
  async _parseFormula(rule, unitId, subUnitId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
    const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
    const formulaResult1 = getFormulaResult((_c = (_b = (_a = results == null ? void 0 : results[0]) == null ? void 0 : _a.result) == null ? void 0 : _b[0]) == null ? void 0 : _c[0]);
    const formulaResult2 = getFormulaResult((_f = (_e = (_d = results == null ? void 0 : results[1]) == null ? void 0 : _d.result) == null ? void 0 : _e[0]) == null ? void 0 : _f[0]);
    const isFormulaValid = isLegalFormulaResult(String(formulaResult1)) && isLegalFormulaResult(String(formulaResult2));
    return {
      formula1: isFormulaString(formula1) ? getFormulaResult((_i = (_h = (_g = results == null ? void 0 : results[0]) == null ? void 0 : _g.result) == null ? void 0 : _h[0]) == null ? void 0 : _i[0]) : formula1,
      formula2: isFormulaString(formula2) ? formulaResult2 : formula2,
      isFormulaValid
    };
  }
  drawWith(ctx, info) {
    var _a, _b, _c, _d;
    const { style, primaryWithCoord, unitId, subUnitId, worksheet, row, col } = info;
    const cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const value = getCellValueOrigin(worksheet.getCellRaw(row, col));
    const rule = this._dataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    if (!((_a = validator.skipDefaultFontRender) == null ? void 0 : _a.call(validator, rule, value, { unitId, subUnitId, row, column: col }))) {
      return;
    }
    const result = validator.parseFormulaSync(rule, unitId, subUnitId);
    const { formula1 } = result;
    const layout = this._calc(cellBounding, style);
    const { a: scaleX, d: scaleY } = ctx.getTransform();
    const left = fixLineWidthByScale(layout.left, scaleX);
    const top = fixLineWidthByScale(layout.top, scaleY);
    const transform = Transform.create().composeMatrix({
      left,
      top,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      skewX: 0,
      skewY: 0,
      flipX: false,
      flipY: false
    });
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const cellHeight = cellBounding.endY - cellBounding.startY;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cellBounding.startX, cellBounding.startY, cellWidth, cellHeight);
    ctx.clip();
    const m = transform.getMatrix();
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    const size = ((_b = style == null ? void 0 : style.fs) != null ? _b : 10) * 1.6;
    const checked = String(value) === String(formula1);
    const defaultColor = this._themeService.getColorFromTheme("primary.600");
    CheckboxShape.drawWith(ctx, {
      checked,
      width: size,
      height: size,
      fill: (_d = (_c = style == null ? void 0 : style.cl) == null ? void 0 : _c.rgb) != null ? _d : defaultColor
    });
    ctx.restore();
  }
  isHit(evt, info) {
    const cellBounding = info.primaryWithCoord.isMergedMainCell ? info.primaryWithCoord.mergeInfo : info.primaryWithCoord;
    const layout = this._calc(cellBounding, info.style);
    const startY = layout.top;
    const endY = layout.top + layout.height;
    const startX = layout.left;
    const endX = layout.left + layout.width;
    const { x: offsetX, y: offsetY } = evt;
    if (offsetX <= endX && offsetX >= startX && offsetY <= endY && offsetY >= startY) {
      return true;
    }
    return false;
  }
  async onPointerDown(info, evt) {
    var _a;
    if (evt.button === 2) {
      return;
    }
    const { primaryWithCoord, unitId, subUnitId, worksheet, row, col } = info;
    const value = getCellValueOrigin(worksheet.getCellRaw(row, col));
    const rule = this._dataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    if (!((_a = validator.skipDefaultFontRender) == null ? void 0 : _a.call(validator, rule, value, { unitId, subUnitId, row, column: col }))) {
      return;
    }
    const { formula1, formula2 } = await this._parseFormula(rule, unitId, subUnitId);
    const params = {
      range: {
        startColumn: primaryWithCoord.actualColumn,
        endColumn: primaryWithCoord.actualColumn,
        startRow: primaryWithCoord.actualRow,
        endRow: primaryWithCoord.actualRow
      },
      value: {
        v: String(value) === transformCheckboxValue(String(formula1)) ? formula2 : formula1,
        p: null
      }
    };
    this._commandService.executeCommand(
      SetRangeValuesCommand.id,
      params
    );
  }
  onPointerEnter(info, evt) {
    var _a, _b;
    (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("pointer" /* POINTER */);
  }
  onPointerLeave(info, evt) {
    var _a, _b;
    (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("default" /* DEFAULT */);
  }
};
CheckboxRender = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(DataValidationFormulaService)),
  __decorateParam(3, Inject(ThemeService)),
  __decorateParam(4, Inject(IRenderManagerService)),
  __decorateParam(5, Inject(SheetDataValidationModel))
], CheckboxRender);

// ../packages/sheets-data-validation-ui/src/views/validator-views/sheet-validator-view.ts
var BaseSheetDataValidatorView = class {
  constructor(injector) {
    __publicField(this, "injector", injector);
    __publicField(this, "canvasRender", null);
    __publicField(this, "dropdownType");
    __publicField(this, "optionsInput");
    __publicField(this, "formulaInput", LIST_FORMULA_INPUT_NAME);
  }
};
BaseSheetDataValidatorView = __decorateClass([
  __decorateParam(0, Inject(Injector))
], BaseSheetDataValidatorView);

// ../packages/sheets-data-validation-ui/src/views/validator-views/checkbox-validator-view.ts
var CheckboxValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "checkbox" /* CHECKBOX */);
    __publicField(this, "canvasRender", this.injector.createInstance(CheckboxRender));
    __publicField(this, "formulaInput", CHECKBOX_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/views/validator-views/custom-validator-view.ts
var CustomFormulaValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "custom" /* CUSTOM */);
    __publicField(this, "formulaInput", CUSTOM_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/views/components/formula-input/formula-input.ts
var BASE_FORMULA_INPUT_NAME2 = "data-validation.formula-input";

// ../packages/sheets-data-validation-ui/src/views/validator-views/date-validator-view.ts
var DateValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "date" /* DATE */);
    __publicField(this, "formulaInput", BASE_FORMULA_INPUT_NAME2);
    __publicField(this, "optionsInput", DateShowTimeOption.componentKey);
    __publicField(this, "dropdownType", "date" /* DATE */);
  }
};

// ../packages/sheets-data-validation-ui/src/views/validator-views/decimal-validator-view.ts
var DecimalValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "decimal" /* DECIMAL */);
    __publicField(this, "formulaInput", BASE_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/views/widgets/shape/layout.ts
var PADDING_H = 4;
var PADDING_V = 0;
var MARGIN_H2 = 4;
var MARGIN_V = 4;
var CELL_PADDING_H = 6;
var CELL_PADDING_V = 6;
var ICON_PLACE = 14;
function getDropdownItemSize(text, fontStyle) {
  const bBox = FontCache.getTextSize(text, fontStyle);
  const rectWidth = bBox.width + PADDING_H * 2;
  const { ba, bd } = bBox;
  const height = ba + bd;
  return {
    width: rectWidth,
    height: height + PADDING_V * 2,
    ba
  };
}
function layoutDropdowns(items, fontStyle, cellWidth, cellHeight) {
  const cellPaddingH = ICON_PLACE + CELL_PADDING_H * 2;
  const widthAvailableForContent = cellWidth - cellPaddingH;
  const heightAvailableForContent = cellHeight - CELL_PADDING_V * 2;
  const textLayout = items.map((item) => ({
    layout: getDropdownItemSize(item, fontStyle),
    text: item
  }));
  let currentLine;
  const lines = [];
  textLayout.forEach((item) => {
    const { layout } = item;
    const { width, height } = layout;
    if (!currentLine || currentLine.width + width + MARGIN_H2 > widthAvailableForContent) {
      currentLine = {
        width,
        height,
        items: [{
          ...item,
          left: 0
        }]
      };
      lines.push(currentLine);
    } else {
      currentLine.items.push({
        ...item,
        left: currentLine.width + MARGIN_H2
      });
      currentLine.width = currentLine.width + width + MARGIN_H2;
    }
  });
  let totalHeight = 0;
  let maxLineWidth = 0;
  lines.forEach((line, index) => {
    maxLineWidth = Math.max(maxLineWidth, line.width);
    if (index === lines.length - 1) {
      totalHeight += line.height;
    } else {
      totalHeight += line.height + MARGIN_V;
    }
  });
  return {
    lines,
    totalHeight,
    contentWidth: widthAvailableForContent,
    contentHeight: heightAvailableForContent,
    cellAutoHeight: totalHeight + CELL_PADDING_V * 2,
    calcAutoWidth: maxLineWidth + cellPaddingH
  };
}

// ../packages/sheets-data-validation-ui/src/views/widgets/shape/dropdown.ts
var RADIUS = 8;
var Dropdown2 = class extends Shape {
  static drawWith(ctx, props) {
    const { fontString, info, fill, color } = props;
    const { layout, text } = info;
    ctx.save();
    Rect.drawWith(ctx, {
      width: layout.width,
      height: layout.height,
      radius: RADIUS,
      fill: fill || DROP_DOWN_DEFAULT_COLOR
    });
    ctx.translateWithPrecision(PADDING_H, layout.ba);
    ctx.font = fontString;
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
};

// ../packages/sheets-data-validation-ui/src/views/widgets/dropdown-multiple-widget.ts
var downPath = new Path2D("M3.32201 4.84556C3.14417 5.05148 2.85583 5.05148 2.67799 4.84556L0.134292 1.90016C-0.152586 1.56798 0.0505937 1 0.456301 1L5.5437 1C5.94941 1 6.15259 1.56798 5.86571 1.90016L3.32201 4.84556Z");
var DropdownMultipleWidget = class {
  constructor(_commandService, _univerInstanceService, _renderManagerService, _dataValidationModel) {
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
    __publicField(this, "zIndex");
    __publicField(this, "_dropdownInfoMap", /* @__PURE__ */ new Map());
  }
  _ensureMap(subUnitId) {
    let map2 = this._dropdownInfoMap.get(subUnitId);
    if (!map2) {
      map2 = /* @__PURE__ */ new Map();
      this._dropdownInfoMap.set(subUnitId, map2);
    }
    return map2;
  }
  _generateKey(row, col) {
    return `${row}.${col}`;
  }
  _drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, vt) {
    const left = cellWidth - ICON_PLACE + 4;
    let top = 4;
    switch (vt) {
      case 2 /* MIDDLE */:
        top = (cellHeight - ICON_PLACE) / 2 + 4;
        break;
      case 3 /* BOTTOM */:
        top = cellHeight - ICON_PLACE + 4;
        break;
      default:
        break;
    }
    ctx.save();
    ctx.translateWithPrecision(cellBounding.startX + left, cellBounding.startY + top);
    ctx.fillStyle = "#565656";
    ctx.fill(downPath);
    ctx.restore();
  }
  // eslint-disable-next-line max-lines-per-function
  drawWith(ctx, info, skeleton, spreadsheets) {
    var _a, _b;
    const { primaryWithCoord, row, col, style, data, subUnitId } = info;
    const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    const map2 = this._ensureMap(subUnitId);
    const key = this._generateKey(row, col);
    const _row = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo.startRow : row;
    const _col = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo.startColumn : col;
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, _row, _col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    const cellBounding = {
      startX: _cellBounding.startX + leftOffset,
      endX: _cellBounding.endX - rightOffset,
      startY: _cellBounding.startY + topOffset,
      endY: _cellBounding.endY - downOffset
    };
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const cellHeight = cellBounding.endY - cellBounding.startY;
    const { cl } = style || {};
    const color = (_a = typeof cl === "object" ? cl == null ? void 0 : cl.rgb : cl) != null ? _a : "#000";
    const fontStyle = getFontStyleString(style != null ? style : void 0);
    const { vt: _vt, ht } = style || {};
    const vt = _vt != null ? _vt : 2 /* MIDDLE */;
    const cellValue = (_b = getCellValueOrigin(data)) != null ? _b : "";
    const items = validator.parseCellValue(cellValue);
    const labelColorMap = validator.getListWithColorMap(rule);
    const layout = layoutDropdowns(items, fontStyle, cellWidth, cellHeight);
    this._drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, vt);
    ctx.save();
    ctx.translateWithPrecision(cellBounding.startX, cellBounding.startY);
    ctx.beginPath();
    ctx.rect(0, 0, cellWidth - ICON_PLACE, cellHeight);
    ctx.clip();
    ctx.translateWithPrecision(CELL_PADDING_H, CELL_PADDING_V);
    let top = 0;
    switch (vt) {
      case 2 /* MIDDLE */:
        top = (layout.contentHeight - layout.totalHeight) / 2;
        break;
      case 3 /* BOTTOM */:
        top = layout.contentHeight - layout.totalHeight;
        break;
      default:
        break;
    }
    ctx.translateWithPrecision(0, top);
    layout.lines.forEach((line, index) => {
      ctx.save();
      const { width, height, items: items2 } = line;
      let left = 0;
      switch (ht) {
        case 3 /* RIGHT */:
          left = layout.contentWidth - width;
          break;
        case 2 /* CENTER */:
          left = (layout.contentWidth - width) / 2;
          break;
        default:
          break;
      }
      ctx.translate(left, index * (height + MARGIN_V));
      items2.forEach((item) => {
        ctx.save();
        ctx.translateWithPrecision(item.left, 0);
        Dropdown2.drawWith(ctx, {
          ...fontStyle,
          info: item,
          color,
          fill: labelColorMap[item.text]
        });
        ctx.restore();
      });
      ctx.restore();
    });
    ctx.restore();
    map2.set(key, {
      left: cellBounding.startX,
      top: cellBounding.startY,
      width: layout.contentWidth + CELL_PADDING_H + ICON_PLACE,
      height: layout.contentHeight + CELL_PADDING_V * 2
    });
  }
  calcCellAutoHeight(info) {
    var _a;
    const { primaryWithCoord, style, data, row, col } = info;
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const cellBounding = {
      startX: _cellBounding.startX + leftOffset,
      endX: _cellBounding.endX - rightOffset,
      startY: _cellBounding.startY + topOffset,
      endY: _cellBounding.endY - downOffset
    };
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const cellHeight = cellBounding.endY - cellBounding.startY;
    const cellValue = (_a = getCellValueOrigin(data)) != null ? _a : "";
    const items = validator.parseCellValue(cellValue);
    const fontStyle = getFontStyleString(style != null ? style : void 0);
    const layout = layoutDropdowns(items, fontStyle, cellWidth, cellHeight);
    return layout.cellAutoHeight;
  }
  calcCellAutoWidth(info) {
    var _a;
    const { primaryWithCoord, style, data, row, col } = info;
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const cellBounding = {
      startX: _cellBounding.startX + leftOffset,
      endX: _cellBounding.endX - rightOffset,
      startY: _cellBounding.startY + topOffset,
      endY: _cellBounding.endY - downOffset
    };
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const cellHeight = cellBounding.endY - cellBounding.startY;
    const cellValue = (_a = getCellValueOrigin(data)) != null ? _a : "";
    const items = validator.parseCellValue(cellValue);
    const fontStyle = getFontStyleString(style != null ? style : void 0);
    const layout = layoutDropdowns(items, fontStyle, cellWidth, cellHeight);
    return layout.calcAutoWidth;
  }
  isHit(position, info) {
    const { primaryWithCoord } = info;
    const cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const { endX } = cellBounding;
    const { x } = position;
    if (x >= endX - ICON_PLACE && x <= endX) {
      return true;
    }
    return false;
  }
  onPointerDown(info, evt) {
    if (evt.button === 2) {
      return;
    }
    const { unitId, subUnitId, row, col } = info;
    const params = {
      unitId,
      subUnitId,
      row,
      column: col
    };
    this._commandService.executeCommand(ShowDataValidationDropdown.id, params);
  }
  onPointerEnter(info, evt) {
    var _a, _b;
    return (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("pointer" /* POINTER */);
  }
  onPointerLeave(info, evt) {
    var _a, _b;
    return (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("default" /* DEFAULT */);
  }
};
DropdownMultipleWidget = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, Inject(IRenderManagerService)),
  __decorateParam(3, Inject(SheetDataValidationModel))
], DropdownMultipleWidget);

// ../packages/sheets-data-validation-ui/src/views/validator-views/list-multiple-view.ts
var ListMultipleValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "listMultiple" /* LIST_MULTIPLE */);
    __publicField(this, "canvasRender", this.injector.createInstance(DropdownMultipleWidget));
    __publicField(this, "dropdownType", "multipleList" /* MULTIPLE_LIST */);
  }
};

// ../packages/sheets-data-validation-ui/src/views/widgets/dropdown-widget.ts
var PADDING_H2 = 4;
var ICON_SIZE = 4;
var ICON_PLACE2 = 14;
var PADDING_V2 = 1;
var MARGIN_H3 = 6;
var MARGIN_V2 = 3;
var RADIUS_BG = 8;
var DROP_DOWN_ICON_COLOR = "#565656";
var downPath2 = new Path2D("M3.32201 4.84556C3.14417 5.05148 2.85583 5.05148 2.67799 4.84556L0.134292 1.90016C-0.152586 1.56798 0.0505937 1 0.456301 1L5.5437 1C5.94941 1 6.15259 1.56798 5.86571 1.90016L3.32201 4.84556Z");
function calcPadding(cellWidth, cellHeight, fontWidth, fontHeight, vt, ht, margin = true) {
  let paddingTop = 0;
  const realMargin = margin ? MARGIN_V2 : 0;
  switch (vt) {
    case 3 /* BOTTOM */:
      paddingTop = cellHeight - fontHeight - realMargin;
      break;
    case 2 /* MIDDLE */:
      paddingTop = (cellHeight - fontHeight) / 2;
      break;
    default:
      paddingTop = realMargin;
      break;
  }
  paddingTop = Math.max(MARGIN_V2, paddingTop);
  let paddingLeft = 0;
  switch (ht) {
    case 2 /* CENTER */:
      paddingLeft = (cellWidth - fontWidth) / 2;
      break;
    case 3 /* RIGHT */:
      paddingLeft = cellWidth - fontWidth;
      break;
    default:
      break;
  }
  paddingLeft = Math.max(MARGIN_H3, paddingLeft);
  return {
    paddingLeft,
    paddingTop
  };
}
var DropdownWidget = class {
  constructor(_univerInstanceService, _localeService, _commandService, _renderManagerService, _dataValidationModel) {
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_dataValidationModel", _dataValidationModel);
    __publicField(this, "_dropdownInfoMap", /* @__PURE__ */ new Map());
    __publicField(this, "zIndex");
  }
  _ensureMap(subUnitId) {
    let map2 = this._dropdownInfoMap.get(subUnitId);
    if (!map2) {
      map2 = /* @__PURE__ */ new Map();
      this._dropdownInfoMap.set(subUnitId, map2);
    }
    return map2;
  }
  _generateKey(row, col) {
    return `${row}.${col}`;
  }
  _drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, fontHeight, vt, pd) {
    const { t = DEFAULT_STYLES.pd.t, b = DEFAULT_STYLES.pd.b } = pd;
    const left = cellWidth - ICON_PLACE2;
    let top;
    switch (vt) {
      case 2 /* MIDDLE */:
        top = (cellHeight - ICON_SIZE) / 2;
        break;
      case 3 /* BOTTOM */:
        top = cellHeight - b - fontHeight - MARGIN_V2 + (fontHeight / 2 - ICON_SIZE / 2);
        break;
      default:
        top = t + MARGIN_V2 + (fontHeight / 2 - ICON_SIZE / 2);
        break;
    }
    ctx.save();
    ctx.translateWithPrecision(cellBounding.startX + left, cellBounding.startY + top);
    ctx.fillStyle = "#565656";
    ctx.fill(downPath2);
    ctx.restore();
  }
  // eslint-disable-next-line max-lines-per-function, complexity
  drawWith(ctx, info, skeleton) {
    var _a, _b, _c, _d, _e, _f;
    const { primaryWithCoord, row, col, style, data, subUnitId } = info;
    const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const _row = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo.startRow : row;
    const _col = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo.startColumn : col;
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, _row, _col);
    if (!rule) {
      return;
    }
    const validator = this._dataValidationModel.getValidator(rule.type);
    if (!validator) {
      return;
    }
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    if (!rule || !validator || !validator || validator.id.indexOf("list" /* LIST */) !== 0) {
      return;
    }
    if (!validator.skipDefaultFontRender(rule)) {
      return;
    }
    const cellBounding = {
      startX: _cellBounding.startX + leftOffset,
      endX: _cellBounding.endX - rightOffset,
      startY: _cellBounding.startY + topOffset,
      endY: _cellBounding.endY - downOffset
    };
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const cellHeight = cellBounding.endY - cellBounding.startY;
    const map2 = this._ensureMap(subUnitId);
    const key = this._generateKey(row, col);
    const colorMap = validator.getListWithColorMap(rule);
    const value = getCellValueOrigin(data);
    const valueStr = `${value != null ? value : ""}`;
    const activeColor = colorMap[valueStr];
    let { tb, vt, ht, pd } = style || {};
    tb = tb != null ? tb : 3 /* WRAP */;
    vt = vt != null ? vt : 3 /* BOTTOM */;
    ht = ht != null ? ht : DEFAULT_STYLES.ht;
    pd = pd != null ? pd : DEFAULT_STYLES.pd;
    const fontStyle = getFontStyleString(style).fontCache;
    if (rule.renderMode === 1 /* ARROW */) {
      const { l = DEFAULT_STYLES.pd.l, t = DEFAULT_STYLES.pd.t, r = DEFAULT_STYLES.pd.r, b = DEFAULT_STYLES.pd.b } = pd;
      const realWidth = cellWidth - l - r - ICON_PLACE2 - 4;
      const textSkeleton = new DocSimpleSkeleton(
        valueStr,
        fontStyle,
        Boolean(tb === 3 /* WRAP */),
        realWidth,
        Infinity
      );
      textSkeleton.calculate();
      const fontWidth = textSkeleton.getTotalWidth();
      const fontHeight = textSkeleton.getTotalHeight();
      const { paddingTop, paddingLeft } = calcPadding(realWidth, cellHeight - t - b, fontWidth, fontHeight, vt, ht, true);
      this._drawDownIcon(ctx, cellBounding, cellWidth, cellHeight, fontHeight, vt, pd);
      ctx.save();
      ctx.translateWithPrecision(cellBounding.startX + l, cellBounding.startY + t);
      ctx.beginPath();
      ctx.rect(0, 0, cellWidth - l - r, cellHeight - t - b);
      ctx.clip();
      ctx.translateWithPrecision(0, paddingTop);
      ctx.save();
      ctx.translateWithPrecision(paddingLeft, 0);
      ctx.beginPath();
      ctx.rect(0, 0, realWidth, fontHeight);
      ctx.clip();
      Text.drawWith(ctx, {
        text: valueStr,
        fontStyle,
        width: realWidth,
        height: fontHeight,
        color: (_a = style == null ? void 0 : style.cl) == null ? void 0 : _a.rgb,
        strokeLine: Boolean((_b = style == null ? void 0 : style.st) == null ? void 0 : _b.s),
        underline: Boolean((_c = style == null ? void 0 : style.ul) == null ? void 0 : _c.s),
        warp: tb === 3 /* WRAP */,
        hAlign: 1 /* LEFT */
      }, textSkeleton);
      ctx.restore();
      ctx.restore();
      map2.set(key, {
        left: cellBounding.endX - ICON_PLACE2 + skeleton.rowHeaderWidth,
        top: cellBounding.startY + t + skeleton.columnHeaderHeight,
        width: ICON_PLACE2,
        height: cellHeight - t - b
      });
    } else {
      ctx.save();
      ctx.translateWithPrecision(cellBounding.startX, cellBounding.startY);
      ctx.beginPath();
      ctx.rect(0, 0, cellWidth, cellHeight);
      ctx.clip();
      const realWidth = cellWidth - MARGIN_H3 * 2 - PADDING_H2 - ICON_PLACE2 - 4;
      const textSkeleton = new DocSimpleSkeleton(
        valueStr,
        fontStyle,
        Boolean(tb === 3 /* WRAP */),
        realWidth,
        Infinity
      );
      textSkeleton.calculate();
      const fontWidth = textSkeleton.getTotalWidth();
      const fontHeight = textSkeleton.getTotalHeight();
      const rectHeight = fontHeight + PADDING_V2 * 2;
      const rectWidth = Math.max(cellWidth - MARGIN_H3 * 2, 1);
      const { paddingTop } = calcPadding(rectWidth, cellHeight, fontWidth, rectHeight, vt, ht);
      ctx.translateWithPrecision(MARGIN_H3, paddingTop);
      Rect.drawWith(ctx, {
        width: rectWidth,
        height: rectHeight,
        fill: activeColor || DROP_DOWN_DEFAULT_COLOR,
        radius: RADIUS_BG
      });
      ctx.save();
      ctx.translateWithPrecision(PADDING_H2, PADDING_V2);
      ctx.beginPath();
      ctx.rect(0, 0, realWidth, fontHeight);
      ctx.clip();
      Text.drawWith(ctx, {
        text: valueStr,
        fontStyle,
        width: realWidth,
        height: fontHeight,
        color: (_d = style == null ? void 0 : style.cl) == null ? void 0 : _d.rgb,
        strokeLine: Boolean((_e = style == null ? void 0 : style.st) == null ? void 0 : _e.s),
        underline: Boolean((_f = style == null ? void 0 : style.ul) == null ? void 0 : _f.s),
        warp: tb === 3 /* WRAP */,
        hAlign: 1 /* LEFT */
      }, textSkeleton);
      ctx.restore();
      ctx.translateWithPrecision(realWidth + PADDING_H2 + 4, (fontHeight - ICON_SIZE) / 2);
      ctx.fillStyle = DROP_DOWN_ICON_COLOR;
      ctx.fill(downPath2);
      ctx.restore();
      map2.set(key, {
        left: cellBounding.startX + MARGIN_H3 + skeleton.rowHeaderWidth,
        top: cellBounding.startY + paddingTop + skeleton.columnHeaderHeight,
        width: rectWidth,
        height: rectHeight
      });
    }
  }
  calcCellAutoHeight(info) {
    const { primaryWithCoord, style, data, row, col } = info;
    const _cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
    if (!rule) {
      return;
    }
    if (rule.renderMode === 0 /* TEXT */) {
      return void 0;
    }
    const cellBounding = {
      startX: _cellBounding.startX + leftOffset,
      endX: _cellBounding.endX - rightOffset,
      startY: _cellBounding.startY + topOffset,
      endY: _cellBounding.endY - downOffset
    };
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const value = getCellValueOrigin(data);
    const valueStr = `${value != null ? value : ""}`;
    let { tb, pd } = style || {};
    const { t = DEFAULT_STYLES.pd.t, b = DEFAULT_STYLES.pd.b } = pd != null ? pd : {};
    tb = tb != null ? tb : 3 /* WRAP */;
    if (rule.renderMode === 1 /* ARROW */) {
      const { l = DEFAULT_STYLES.pd.l, r = DEFAULT_STYLES.pd.r } = pd != null ? pd : {};
      const realWidth = cellWidth - l - r - ICON_PLACE2 - 4;
      const skeleton = new DocSimpleSkeleton(
        valueStr,
        getFontStyleString(style).fontCache,
        Boolean(tb === 3 /* WRAP */),
        realWidth,
        Infinity
      );
      skeleton.calculate();
      return skeleton.getTotalHeight() + t + b + MARGIN_V2 * 2;
    } else {
      const realWidth = Math.max(cellWidth - MARGIN_H3 * 2 - PADDING_H2 - ICON_PLACE2 - 4, 10);
      const skeleton = new DocSimpleSkeleton(
        valueStr,
        getFontStyleString(style).fontCache,
        Boolean(tb === 3 /* WRAP */),
        realWidth,
        Infinity
      );
      skeleton.calculate();
      return skeleton.getTotalHeight() + MARGIN_V2 * 2 + PADDING_V2 * 2;
    }
  }
  calcCellAutoWidth(info) {
    const { primaryWithCoord, style, data, row, col } = info;
    const cellRange = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
    const fontRenderExtension = data == null ? void 0 : data.fontRenderExtension;
    const { leftOffset = 0, rightOffset = 0, topOffset = 0, downOffset = 0 } = fontRenderExtension || {};
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
    if (!rule) {
      return;
    }
    if (rule.renderMode === 0 /* TEXT */) {
      return;
    }
    const cellBounding = {
      startX: cellRange.startX + leftOffset,
      endX: cellRange.endX - rightOffset,
      startY: cellRange.startY + topOffset,
      endY: cellRange.endY - downOffset
    };
    const cellWidth = cellBounding.endX - cellBounding.startX;
    const value = getCellValueOrigin(data);
    const valueStr = `${value != null ? value : ""}`;
    let { tb, pd } = style || {};
    const { l = DEFAULT_STYLES.pd.l, r = DEFAULT_STYLES.pd.r } = pd != null ? pd : {};
    tb = tb != null ? tb : 3 /* WRAP */;
    let paddingAll = MARGIN_H3 * 2 + ICON_PLACE2;
    switch (rule.renderMode) {
      case 1 /* ARROW */:
        paddingAll = ICON_PLACE2 + 4 + r + l;
        break;
      case 2 /* CUSTOM */:
        paddingAll = ICON_PLACE2 + MARGIN_H3 * 2 + PADDING_H2 * 2 + r + l + RADIUS_BG / 2 + 1;
        break;
      // default is CUSTOM
      default:
        paddingAll = ICON_PLACE2 + MARGIN_H3 * 2 + PADDING_H2 * 2 + r + l + RADIUS_BG / 2 + 1;
    }
    const widthForTextLayout = cellWidth - paddingAll;
    const skeleton = new DocSimpleSkeleton(
      valueStr,
      getFontStyleString(style).fontCache,
      Boolean(tb === 3 /* WRAP */),
      widthForTextLayout,
      Infinity
    );
    skeleton.calculate();
    return skeleton.getTotalWidth() + paddingAll;
  }
  isHit(position, info) {
    const { subUnitId, row, col } = info;
    const map2 = this._ensureMap(subUnitId);
    const dropdownInfo = map2.get(this._generateKey(row, col));
    const rule = this._dataValidationModel.getRuleByLocation(info.unitId, info.subUnitId, row, col);
    if (!rule) {
      return false;
    }
    if (!dropdownInfo) {
      return false;
    }
    if (rule.renderMode === 0 /* TEXT */) {
      return false;
    }
    const { top, left, width, height } = dropdownInfo;
    const { x, y } = position;
    if (x >= left && x <= left + width && y >= top && y <= top + height) {
      return true;
    }
    return false;
  }
  onPointerDown(info, evt) {
    if (evt.button === 2) {
      return;
    }
    const { unitId, subUnitId, row, col } = info;
    const params = {
      unitId,
      subUnitId,
      row,
      column: col
    };
    this._commandService.executeCommand(ShowDataValidationDropdown.id, params);
  }
  onPointerEnter(_info, _evt) {
    var _a, _b;
    (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("pointer" /* POINTER */);
  }
  onPointerLeave(_info, _evt) {
    var _a, _b;
    (_b = (_a = getCurrentTypeOfRenderer(2 /* UNIVER_SHEET */, this._univerInstanceService, this._renderManagerService)) == null ? void 0 : _a.mainComponent) == null ? void 0 : _b.setCursor("default" /* DEFAULT */);
  }
};
DropdownWidget = __decorateClass([
  __decorateParam(0, IUniverInstanceService),
  __decorateParam(1, Inject(LocaleService)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, Inject(IRenderManagerService)),
  __decorateParam(4, Inject(SheetDataValidationModel))
], DropdownWidget);

// ../packages/sheets-data-validation-ui/src/views/validator-views/list-validator-view.ts
var ListValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "list" /* LIST */);
    __publicField(this, "canvasRender", this.injector.createInstance(DropdownWidget));
    __publicField(this, "dropdownType", "list" /* LIST */);
    __publicField(this, "optionsInput", ListRenderModeInput.componentKey);
    __publicField(this, "formulaInput", LIST_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/views/validator-views/text-length-validator.view.ts
var TextLengthValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "textLength" /* TEXT_LENGTH */);
    __publicField(this, "formulaInput", BASE_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/views/validator-views/whole-validator-view.ts
var WholeValidatorView = class extends BaseSheetDataValidatorView {
  constructor() {
    super(...arguments);
    __publicField(this, "id", "whole" /* WHOLE */);
    __publicField(this, "formulaInput", BASE_FORMULA_INPUT_NAME);
  }
};

// ../packages/sheets-data-validation-ui/src/controllers/dv-ui.controller.ts
var SheetsDataValidationUIController = class extends RxDisposable {
  constructor(_injector, _componentManger, _dataValidatorRegistryService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_componentManger", _componentManger);
    __publicField(this, "_dataValidatorRegistryService", _dataValidatorRegistryService);
    this._initComponents();
    this._registerValidatorViews();
  }
  _initComponents() {
    [
      ["DataValidationIcon", DataValidationIcon],
      [DATA_VALIDATION_PANEL, DataValidationPanel],
      [ListRenderModeInput.componentKey, ListRenderModeInput],
      [DateShowTimeOption.componentKey, DateShowTimeOption],
      ...FORMULA_INPUTS
    ].forEach(([key, comp]) => {
      this.disposeWithMe(this._componentManger.register(
        key,
        comp
      ));
    });
  }
  _registerValidatorViews() {
    [
      DecimalValidatorView,
      WholeValidatorView,
      TextLengthValidatorView,
      DateValidatorView,
      CheckboxValidatorView,
      ListValidatorView,
      ListMultipleValidatorView,
      CustomFormulaValidatorView
    ].forEach((v) => {
      const view = this._injector.createInstance(v);
      const validator = this._dataValidatorRegistryService.getValidatorItem(view.id);
      if (validator) {
        validator.formulaInput = view.formulaInput;
        validator.canvasRender = view.canvasRender;
        validator.dropdownType = view.dropdownType;
        validator.optionsInput = view.optionsInput;
      }
    });
  }
};
SheetsDataValidationUIController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(ComponentManager)),
  __decorateParam(2, Inject(DataValidatorRegistryService))
], SheetsDataValidationUIController);

// ../packages/sheets-data-validation-ui/src/mobile-plugin.ts
var UniverSheetsDataValidationMobileUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [DataValidationPanelService],
      [DataValidationDropdownManagerService],
      [DataValidationAlertController],
      [DataValidationAutoFillController],
      [SheetsDataValidationRenderController],
      [DataValidationPermissionController],
      [DataValidationCopyPasteController],
      [SheetsDataValidationUIController]
    ].forEach((dep) => {
      this._injector.add(dep);
    });
    [
      AddSheetDataValidationAndOpenCommand,
      ShowDataValidationDropdown,
      HideDataValidationDropdown,
      CloseValidationPanelOperation,
      OpenValidationPanelOperation,
      ToggleValidationPanelOperation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
  }
  onReady() {
    this._injector.get(DataValidationCopyPasteController);
    this._injector.get(DataValidationPermissionController);
    const renderManager = this._injector.get(IRenderManagerService);
    renderManager.registerRenderModule(
      2 /* UNIVER_SHEET */,
      [SheetsDataValidationReRenderController]
    );
  }
  onRendered() {
    this._injector.get(SheetsDataValidationUIController);
    this._injector.get(SheetsDataValidationRenderController);
  }
  onSteady() {
    this._injector.get(DataValidationAutoFillController);
  }
};
__publicField(UniverSheetsDataValidationMobileUIPlugin, "pluginName", "SHEET_DATA_VALIDATION_UI_PLUGIN");
__publicField(UniverSheetsDataValidationMobileUIPlugin, "packageName", package_default2.name);
__publicField(UniverSheetsDataValidationMobileUIPlugin, "version", package_default2.version);
__publicField(UniverSheetsDataValidationMobileUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsDataValidationMobileUIPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigService)
], UniverSheetsDataValidationMobileUIPlugin);

// ../packages/sheets-data-validation-ui/src/plugin.ts
var UniverSheetsDataValidationUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig2, _injector, _commandService, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig2,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [DataValidationPanelService],
      [DataValidationDropdownManagerService],
      [DataValidationAlertController],
      [DataValidationAutoFillController],
      [SheetsDataValidationRenderController],
      [DataValidationPermissionController],
      [DataValidationCopyPasteController],
      [DataValidationRejectInputController],
      [SheetsDataValidationUIController]
    ].forEach((dep) => {
      this._injector.add(dep);
    });
    [
      AddSheetDataValidationAndOpenCommand,
      ShowDataValidationDropdown,
      HideDataValidationDropdown,
      CloseValidationPanelOperation,
      OpenValidationPanelOperation,
      ToggleValidationPanelOperation
    ].forEach((command) => {
      this._commandService.registerCommand(command);
    });
  }
  onReady() {
    this._injector.get(DataValidationCopyPasteController);
    this._injector.get(DataValidationPermissionController);
    this._injector.get(DataValidationRejectInputController);
    this._injector.get(DataValidationAlertController);
    const renderManager = this._injector.get(IRenderManagerService);
    renderManager.registerRenderModule(
      2 /* UNIVER_SHEET */,
      [SheetsDataValidationReRenderController]
    );
  }
  onRendered() {
    this._injector.get(SheetsDataValidationUIController);
    this._injector.get(SheetsDataValidationRenderController);
  }
  onSteady() {
    this._injector.get(DataValidationAutoFillController);
  }
};
__publicField(UniverSheetsDataValidationUIPlugin, "pluginName", "SHEET_DATA_VALIDATION_UI_PLUGIN");
__publicField(UniverSheetsDataValidationUIPlugin, "packageName", package_default2.name);
__publicField(UniverSheetsDataValidationUIPlugin, "version", package_default2.version);
__publicField(UniverSheetsDataValidationUIPlugin, "type", 2 /* UNIVER_SHEET */);
UniverSheetsDataValidationUIPlugin = __decorateClass([
  DependentOn(UniverSheetsDataValidationPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigService)
], UniverSheetsDataValidationUIPlugin);

// ../packages/sheets-filter-ui/package.json
var package_default3 = {
  name: "@univerjs/sheets-filter-ui",
  version: "0.25.2",
  private: false,
  description: "Filtering menus and panels for Univer Sheets.",
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
    "filter",
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
    "@univerjs/engine-render": "workspace:*",
    "@univerjs/icons": "1.4.0",
    "@univerjs/rpc": "workspace:*",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-filter": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    "@univerjs/engine-formula": "workspace:*",
    postcss: "^8.5.15",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/sheets-filter-ui/src/config/config.ts
var SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY = "sheets-filter-ui.config";
var configSymbol3 = Symbol(SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY);
var defaultPluginConfig3 = {};

// ../packages/sheets-filter-ui/src/models/conditions.ts
var FilterConditionItems;
((FilterConditionItems2) => {
  FilterConditionItems2.NONE = {
    label: "sheets-filter-ui.conditions.none",
    operator: "none" /* NONE */,
    order: 1 /* SECOND */,
    numOfParameters: 0,
    getDefaultFormParams: () => {
      throw new Error("[FilterConditionItems.NONE]: should not have initial form params!");
    },
    testMappingParams: (params) => {
      return params.operator1 === "none" /* NONE */;
    },
    mapToFilterColumn: () => null,
    testMappingFilterColumn: (filterColumn) => {
      if (!filterColumn.customFilters && !filterColumn.filters) return {};
      return false;
    }
  };
  FilterConditionItems2.EMPTY = {
    label: "sheets-filter-ui.conditions.empty",
    operator: "empty" /* EMPTY */,
    order: 1 /* SECOND */,
    numOfParameters: 0,
    getDefaultFormParams: () => {
      throw new Error("[FilterConditionItems.EMPTY]: should not have initial form params!");
    },
    testMappingParams: ({ operator1 }) => operator1 === "empty" /* EMPTY */,
    mapToFilterColumn: () => ({ customFilters: { customFilters: [{ val: "" }] } }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const mapped = firstCustomFilter.val === "" && firstCustomFilter.operator === void 0;
      if (!mapped) {
        return false;
      }
      return { operator1: "empty" /* EMPTY */ };
    }
  };
  FilterConditionItems2.NOT_EMPTY = {
    label: "sheets-filter-ui.conditions.not-empty",
    operator: "notEmpty" /* NOT_EMPTY */,
    order: 1 /* SECOND */,
    numOfParameters: 0,
    getDefaultFormParams: () => {
      throw new Error("[FilterConditionItems.NOT_EMPTY]: should not have initial form params!");
    },
    testMappingParams: ({ operator1 }) => operator1 === "notEmpty" /* NOT_EMPTY */,
    mapToFilterColumn: () => ({ customFilters: { customFilters: [{ val: "", operator: "notEqual" /* NOT_EQUALS */ }] } }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const canMap = firstCustomFilter.val === " " && firstCustomFilter.operator === "notEqual" /* NOT_EQUALS */;
      if (!canMap) {
        return false;
      }
      return { operator1: "notEmpty" /* NOT_EMPTY */ };
    }
  };
  FilterConditionItems2.TEXT_CONTAINS = {
    label: "sheets-filter-ui.conditions.text-contains",
    operator: "contains" /* CONTAINS */,
    order: 0 /* FIRST */,
    numOfParameters: 1,
    getDefaultFormParams: () => ({ operator1: "contains" /* CONTAINS */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "contains" /* CONTAINS */;
    },
    mapToFilterColumn: (mapParams) => {
      const { val1 } = mapParams;
      if (val1 === "") return null;
      return {
        customFilters: { customFilters: [{ val: `*${val1}*` }] }
      };
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const valAsString = firstCustomFilter.val.toString();
      if (!firstCustomFilter.operator && valAsString.startsWith("*") && valAsString.endsWith("*")) {
        return { operator1: "contains" /* CONTAINS */, val1: valAsString.slice(1, -1) };
      }
      return false;
    }
  };
  FilterConditionItems2.DOES_NOT_CONTAIN = {
    label: "sheets-filter-ui.conditions.does-not-contain",
    operator: "doesNotContain" /* DOES_NOT_CONTAIN */,
    order: 0 /* FIRST */,
    numOfParameters: 1,
    getDefaultFormParams: () => ({ operator1: "doesNotContain" /* DOES_NOT_CONTAIN */, val1: "" }),
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: `*${mapParams.val1}*`, operator: "notEqual" /* NOT_EQUALS */ }] }
    }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "doesNotContain" /* DOES_NOT_CONTAIN */;
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const valAsString = firstCustomFilter.val.toString();
      if (firstCustomFilter.operator === "notEqual" /* NOT_EQUALS */ && valAsString.startsWith("*") && valAsString.endsWith("*")) {
        return { operator1: "doesNotContain" /* DOES_NOT_CONTAIN */, val1: valAsString.slice(1, -1) };
      }
      return false;
    }
  };
  FilterConditionItems2.STARTS_WITH = {
    label: "sheets-filter-ui.conditions.starts-with",
    operator: "startsWith" /* STARTS_WITH */,
    order: 0 /* FIRST */,
    numOfParameters: 1,
    getDefaultFormParams: () => ({ operator1: "startsWith" /* STARTS_WITH */, val1: "" }),
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: `${mapParams.val1}*` }] }
    }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "startsWith" /* STARTS_WITH */;
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const valAsString = firstCustomFilter.val.toString();
      if (!firstCustomFilter.operator && valAsString.endsWith("*") && !valAsString.startsWith("*")) {
        return { operator1: "startsWith" /* STARTS_WITH */, val1: valAsString.slice(0, -1) };
      }
      return false;
    }
  };
  FilterConditionItems2.ENDS_WITH = {
    label: "sheets-filter-ui.conditions.ends-with",
    operator: "endsWith" /* ENDS_WITH */,
    order: 0 /* FIRST */,
    numOfParameters: 1,
    getDefaultFormParams: () => ({ operator1: "endsWith" /* ENDS_WITH */, val1: "" }),
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: `*${mapParams.val1}` }] }
    }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "endsWith" /* ENDS_WITH */;
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      const valAsString = firstCustomFilter.val.toString();
      if (!firstCustomFilter.operator && valAsString.startsWith("*") && !valAsString.endsWith("*")) {
        return { operator1: "endsWith" /* ENDS_WITH */, val1: valAsString.slice(1) };
      }
      return false;
    }
  };
  FilterConditionItems2.EQUALS = {
    label: "sheets-filter-ui.conditions.equals",
    operator: "equals" /* EQUALS */,
    order: 0 /* FIRST */,
    numOfParameters: 1,
    getDefaultFormParams: () => ({ operator1: "equals" /* EQUALS */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "equals" /* EQUALS */;
    },
    mapToFilterColumn: (mapParams) => {
      const { val1 } = mapParams;
      if (val1 === "") return null;
      return {
        customFilters: { customFilters: [{ val: val1 }] }
      };
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a, _b, _c;
      if (((_b = (_a = filterColumn.filters) == null ? void 0 : _a.filters) == null ? void 0 : _b.length) === 1) {
        return { operator1: "equals" /* EQUALS */, val1: "" };
      }
      if (((_c = filterColumn.customFilters) == null ? void 0 : _c.customFilters.length) === 1 && !filterColumn.customFilters.customFilters[0].operator) {
        return { operator1: "equals" /* EQUALS */, val1: filterColumn.customFilters.customFilters[0].val.toString() };
      }
      return false;
    }
  };
  FilterConditionItems2.GREATER_THAN = {
    label: "sheets-filter-ui.conditions.greater-than",
    operator: "greaterThan" /* GREATER_THAN */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "greaterThan" /* GREATER_THAN */, val1: "" }),
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "greaterThan" /* GREATER_THAN */ }] }
    }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "greaterThan" /* GREATER_THAN */;
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "greaterThan" /* GREATER_THAN */) {
        return false;
      }
      return { operator1: "greaterThan" /* GREATER_THAN */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.GREATER_THAN_OR_EQUAL = {
    label: "sheets-filter-ui.conditions.greater-than-or-equal",
    operator: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */;
    },
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */ }] }
    }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */) {
        return false;
      }
      return { operator1: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.LESS_THAN = {
    label: "sheets-filter-ui.conditions.less-than",
    operator: "lessThan" /* LESS_THAN */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "lessThan" /* LESS_THAN */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "lessThan" /* LESS_THAN */;
    },
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "lessThan" /* LESS_THAN */ }] }
    }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "lessThan" /* LESS_THAN */) {
        return false;
      }
      return { operator1: "lessThan" /* LESS_THAN */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.LESS_THAN_OR_EQUAL = {
    label: "sheets-filter-ui.conditions.less-than-or-equal",
    operator: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */;
    },
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */ }] }
    }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */) {
        return false;
      }
      return { operator1: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.EQUAL = {
    label: "sheets-filter-ui.conditions.equal",
    operator: "equal" /* EQUAL */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "equal" /* EQUAL */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "equal" /* EQUAL */;
    },
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "equal" /* EQUAL */ }] }
    }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "equal" /* EQUAL */) {
        return false;
      }
      return { operator1: "equal" /* EQUAL */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.NOT_EQUAL = {
    label: "sheets-filter-ui.conditions.not-equal",
    operator: "notEqual" /* NOT_EQUALS */,
    numOfParameters: 1,
    order: 0 /* FIRST */,
    getDefaultFormParams: () => ({ operator1: "notEqual" /* NOT_EQUALS */, val1: "" }),
    testMappingParams: (params) => {
      const [op] = getOnlyOperatorAndVal(params);
      return op === "notEqual" /* NOT_EQUALS */;
    },
    mapToFilterColumn: (mapParams) => ({
      customFilters: { customFilters: [{ val: mapParams.val1, operator: "notEqual" /* NOT_EQUALS */ }] }
    }),
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 1) {
        return false;
      }
      const firstCustomFilter = filterColumn.customFilters.customFilters[0];
      if (firstCustomFilter.operator !== "notEqual" /* NOT_EQUALS */) {
        return false;
      }
      return { operator1: "notEqual" /* NOT_EQUALS */, val1: firstCustomFilter.val.toString() };
    }
  };
  FilterConditionItems2.BETWEEN = {
    label: "sheets-filter-ui.conditions.between",
    operator: "between" /* BETWEEN */,
    order: 1 /* SECOND */,
    numOfParameters: 2,
    getDefaultFormParams: () => ({
      and: true,
      operator1: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */,
      val1: "",
      operator2: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */,
      val2: ""
    }),
    testMappingParams: (params) => {
      const { and, operator1, operator2 } = params;
      if (!and) return false;
      const operators = [operator1, operator2];
      return operators.includes("greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */) && operators.includes("lessThanOrEqual" /* LESS_THAN_OR_EQUAL */);
    },
    mapToFilterColumn: (mapParams) => {
      const { val1, val2, operator1 } = mapParams;
      const operator1IsGreater = operator1 === "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */;
      return {
        customFilters: {
          and: 1 /* TRUE */,
          customFilters: [
            { val: operator1IsGreater ? val1 : val2, operator: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */ },
            { val: operator1IsGreater ? val2 : val1, operator: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */ }
          ]
        }
      };
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 2) {
        return false;
      }
      const [firstCustomFilter, secondCustomFilter] = filterColumn.customFilters.customFilters;
      if (firstCustomFilter.operator === "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */ && secondCustomFilter.operator === "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */ && filterColumn.customFilters.and) {
        return {
          and: true,
          operator1: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */,
          val1: firstCustomFilter.val.toString(),
          operator2: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */,
          val2: secondCustomFilter.val.toString()
        };
      }
      if (secondCustomFilter.operator === "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */ && firstCustomFilter.operator === "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */ && filterColumn.customFilters.and) {
        return {
          and: true,
          operator1: "greaterThanOrEqual" /* GREATER_THAN_OR_EQUAL */,
          val1: secondCustomFilter.val.toString(),
          operator2: "lessThanOrEqual" /* LESS_THAN_OR_EQUAL */,
          val2: firstCustomFilter.val.toLocaleString()
        };
      }
      return false;
    }
  };
  FilterConditionItems2.NOT_BETWEEN = {
    label: "sheets-filter-ui.conditions.not-between",
    operator: "notBetween" /* NOT_BETWEEN */,
    order: 1 /* SECOND */,
    numOfParameters: 2,
    getDefaultFormParams: () => ({
      operator1: "lessThan" /* LESS_THAN */,
      val1: "",
      operator2: "greaterThan" /* GREATER_THAN */,
      val2: ""
    }),
    testMappingParams: (params) => {
      const { and, operator1, operator2 } = params;
      if (and) return false;
      const operators = [operator1, operator2];
      return operators.includes("greaterThan" /* GREATER_THAN */) && operators.includes("lessThan" /* LESS_THAN */);
    },
    mapToFilterColumn: (mapParams) => {
      const { val1, val2, operator1 } = mapParams;
      const operator1IsGreater = operator1 === "greaterThan" /* GREATER_THAN */;
      return {
        customFilters: {
          customFilters: [
            { val: operator1IsGreater ? val1 : val2, operator: "greaterThan" /* GREATER_THAN */ },
            { val: operator1IsGreater ? val2 : val1, operator: "lessThan" /* LESS_THAN */ }
          ]
        }
      };
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 2) {
        return false;
      }
      const [firstCustomFilter, secondCustomFilter] = filterColumn.customFilters.customFilters;
      if (firstCustomFilter.operator === "lessThan" /* LESS_THAN */ && secondCustomFilter.operator === "greaterThan" /* GREATER_THAN */ && !filterColumn.customFilters.and) {
        return {
          operator1: "lessThan" /* LESS_THAN */,
          val1: firstCustomFilter.val.toString(),
          operator2: "greaterThan" /* GREATER_THAN */,
          val2: secondCustomFilter.val.toString()
        };
      }
      if (secondCustomFilter.operator === "lessThan" /* LESS_THAN */ && firstCustomFilter.operator === "greaterThan" /* GREATER_THAN */ && !filterColumn.customFilters.and) {
        return {
          operator1: "greaterThan" /* GREATER_THAN */,
          val1: secondCustomFilter.val.toString(),
          operator2: "lessThan" /* LESS_THAN */,
          val2: firstCustomFilter.val.toLocaleString()
        };
      }
      return false;
    }
  };
  FilterConditionItems2.CUSTOM = {
    label: "sheets-filter-ui.conditions.custom",
    operator: "custom" /* CUSTOM */,
    order: 1 /* SECOND */,
    numOfParameters: 2,
    getDefaultFormParams: () => {
      return {
        operator1: "none" /* NONE */,
        val1: "",
        operator2: "none" /* NONE */,
        val2: ""
      };
    },
    testMappingParams: () => true,
    mapToFilterColumn: (mapParams) => {
      const { and, val1, val2, operator1, operator2 } = mapParams;
      function mapOperator(operator, val) {
        for (const condition of FilterConditionItems2.ALL_CONDITIONS) {
          if (condition.operator === operator) {
            return condition.mapToFilterColumn({ val1: val, operator1: operator });
          }
        }
      }
      const operator1IsNone = !operator1 || operator1 === FilterConditionItems2.NONE.operator;
      const operator2IsNone = !operator2 || operator2 === FilterConditionItems2.NONE.operator;
      if (operator1IsNone && operator2IsNone) {
        return FilterConditionItems2.NONE.mapToFilterColumn({});
      }
      if (operator1IsNone) {
        return mapOperator(operator2, val2);
      }
      if (operator2IsNone) {
        return mapOperator(operator1, val1);
      }
      const mappedCustomFilter1 = mapOperator(operator1, val1);
      const mappedCustomFilter2 = mapOperator(operator2, val2);
      const customFilters = {
        customFilters: [
          mappedCustomFilter1.customFilters.customFilters[0],
          mappedCustomFilter2.customFilters.customFilters[0]
        ]
      };
      if (and) customFilters.and = 1 /* TRUE */;
      return { customFilters };
    },
    testMappingFilterColumn: (filterColumn) => {
      var _a;
      if (((_a = filterColumn.customFilters) == null ? void 0 : _a.customFilters.length) !== 2) {
        return false;
      }
      const params = filterColumn.customFilters.customFilters.map((customFilter) => {
        return testMappingFilterColumn({ customFilters: { customFilters: [customFilter] } });
      });
      const result = {
        operator1: params[0][0].operator,
        val1: params[0][1].val1,
        operator2: params[1][0].operator,
        val2: params[1][1].val1
      };
      if (filterColumn.customFilters.and) {
        result.and = true;
      }
      return result;
    }
  };
  FilterConditionItems2.ALL_CONDITIONS = [
    // ------------------------------
    FilterConditionItems2.NONE,
    // ------------------------------
    FilterConditionItems2.EMPTY,
    FilterConditionItems2.NOT_EMPTY,
    // ------------------------------
    FilterConditionItems2.TEXT_CONTAINS,
    FilterConditionItems2.DOES_NOT_CONTAIN,
    FilterConditionItems2.STARTS_WITH,
    FilterConditionItems2.ENDS_WITH,
    FilterConditionItems2.EQUALS,
    // ------------------------------
    FilterConditionItems2.GREATER_THAN,
    FilterConditionItems2.GREATER_THAN_OR_EQUAL,
    FilterConditionItems2.LESS_THAN,
    FilterConditionItems2.LESS_THAN_OR_EQUAL,
    FilterConditionItems2.EQUAL,
    FilterConditionItems2.NOT_EQUAL,
    FilterConditionItems2.BETWEEN,
    FilterConditionItems2.NOT_BETWEEN,
    // ------------------------------
    FilterConditionItems2.CUSTOM
  ];
  function getItemByOperator(operator) {
    const item = FilterConditionItems2.ALL_CONDITIONS.find((condition) => condition.operator === operator);
    if (!item) {
      throw new Error(`[SheetsFilter]: no condition item found for operator: ${operator}`);
    }
    return item;
  }
  FilterConditionItems2.getItemByOperator = getItemByOperator;
  function testMappingParams(mapParams, numOfParameters) {
    for (const condition of FilterConditionItems2.ALL_CONDITIONS.filter((condition2) => condition2.numOfParameters === numOfParameters)) {
      if (condition.numOfParameters !== 0 && condition.testMappingParams(mapParams)) {
        return condition;
      }
    }
    for (const condition of FilterConditionItems2.ALL_CONDITIONS) {
      if (condition.testMappingParams(mapParams)) {
        return condition;
      }
    }
    throw new Error("[SheetsFilter]: no condition item can be mapped from the filter map params!");
  }
  FilterConditionItems2.testMappingParams = testMappingParams;
  function getInitialFormParams(operator) {
    const condition = FilterConditionItems2.ALL_CONDITIONS.find((condition2) => condition2.operator === operator);
    if ((condition == null ? void 0 : condition.numOfParameters) === 0) {
      return { operator1: condition.operator };
    }
    return condition.getDefaultFormParams();
  }
  FilterConditionItems2.getInitialFormParams = getInitialFormParams;
  function mapToFilterColumn(condition, mapParams) {
    return condition.mapToFilterColumn(mapParams);
  }
  FilterConditionItems2.mapToFilterColumn = mapToFilterColumn;
  function testMappingFilterColumn(filterColumn) {
    if (!filterColumn) {
      return [FilterConditionItems2.NONE, {}];
    }
    for (const condition of FilterConditionItems2.ALL_CONDITIONS) {
      const mapParams = condition.testMappingFilterColumn(filterColumn);
      if (mapParams) {
        return [condition, mapParams];
      }
    }
    return [FilterConditionItems2.NONE, {}];
  }
  FilterConditionItems2.testMappingFilterColumn = testMappingFilterColumn;
})(FilterConditionItems || (FilterConditionItems = {}));
function getOnlyOperatorAndVal(mapParams) {
  const { operator1, operator2, val1, val2 } = mapParams;
  if (operator1 && operator2) {
    throw new Error("Both operator1 and operator2 are set!");
  }
  if (!operator1 && !operator2) {
    throw new Error("Neither operator1 and operator2 and both not set!");
  }
  return operator1 ? [operator1, val1] : [operator2, val2];
}

// ../packages/sheets-filter-ui/src/models/utils.ts
function statisticFilterByValueItems(items) {
  const checkedItems = [];
  const uncheckedItems = [];
  let checked = 0;
  let unchecked = 0;
  function traverse(node) {
    if (node.leaf) {
      if (node.checked) {
        checkedItems.push(node);
        checked += node.count;
      } else {
        uncheckedItems.push(node);
        unchecked += node.count;
      }
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  items.forEach(traverse);
  return {
    checkedItems,
    uncheckedItems,
    checked,
    unchecked
  };
}

// ../packages/sheets-filter-ui/src/worker/generate-filter-values.service.ts
var SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME = "sheets-filter.generate-filter-values.service";
var ISheetsGenerateFilterValuesService = createIdentifier(SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME);
var SheetsGenerateFilterValuesService = class extends Disposable {
  constructor(_localeService, _univerInstanceService, _logService) {
    super();
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_univerInstanceService", _univerInstanceService);
    __publicField(this, "_logService", _logService);
  }
  async getFilterValues(params) {
    var _a;
    const { unitId, subUnitId, filteredOutRowsByOtherColumns, filterColumn, filters, blankChecked, iterateRange, alreadyChecked } = params;
    const workbook = this._univerInstanceService.getUnit(unitId);
    const worksheet = (_a = this._univerInstanceService.getUnit(unitId)) == null ? void 0 : _a.getSheetBySheetId(subUnitId);
    if (!workbook || !worksheet) return [];
    this._logService.debug("[SheetsGenerateFilterValuesService]", "getFilterValues for", { unitId, subUnitId });
    return getFilterTreeByValueItems(
      filters,
      this._localeService,
      iterateRange,
      worksheet,
      new Set(filteredOutRowsByOtherColumns),
      filterColumn,
      new Set(alreadyChecked.map(String)),
      blankChecked,
      workbook.getStyles()
    );
  }
};
SheetsGenerateFilterValuesService = __decorateClass([
  __decorateParam(0, Inject(LocaleService)),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, ILogService)
], SheetsGenerateFilterValuesService);
function getFilterTreeByValueItems(filters, localeService, iterateRange, worksheet, filteredOutRowsByOtherColumns, filterColumn, alreadyChecked, blankChecked, styles) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const items = /* @__PURE__ */ new Map();
  const treeMap = /* @__PURE__ */ new Map();
  const DefaultPattern = "yyyy-mm-dd";
  const EmptyKey = "empty";
  const isNeedClearCheckedStatus = !filters && ((filterColumn == null ? void 0 : filterColumn.filterBy) === 1 /* COLORS */ || (filterColumn == null ? void 0 : filterColumn.filterBy) === 2 /* CONDITIONS */) && ((_a = filterColumn.filteredOutRows) == null ? void 0 : _a.size);
  let emptyCount = 0;
  for (const cell of worksheet.iterateByColumn(iterateRange, false, false)) {
    const { row, rowSpan = 1 } = cell;
    let rowIndex = 0;
    while (rowIndex < rowSpan) {
      const targetRow = row + rowIndex;
      if (filteredOutRowsByOtherColumns.has(targetRow)) {
        rowIndex++;
        continue;
      }
      const value = (cell == null ? void 0 : cell.value) ? extractPureTextFromCell(cell.value) : "";
      if (!value) {
        emptyCount += 1;
        rowIndex += rowSpan;
        continue;
      }
      const fmtStr = ((_b = cell.value) == null ? void 0 : _b.v) && !cell.value.p ? (_e = (_d = styles.get((_c = cell.value) == null ? void 0 : _c.s)) == null ? void 0 : _d.n) == null ? void 0 : _e.pattern : "";
      const isDateValue = fmtStr && lib_exports.getFormatInfo(fmtStr).isDate;
      let isIncludeDatePart = false;
      if (isDateValue) {
        const { year, month, day } = lib_exports.getFormatDateInfo(fmtStr);
        isIncludeDatePart = year || month || day;
      }
      if (fmtStr && isDateValue && isIncludeDatePart) {
        const originValue = (_f = worksheet.getCellRaw(cell.row, cell.col)) == null ? void 0 : _f.v;
        if (!originValue) {
          rowIndex++;
          continue;
        }
        const valueParsedByDefaultPattern = lib_exports.format(DefaultPattern, Number(originValue));
        const [year, month, day] = valueParsedByDefaultPattern.split("-").map(Number);
        let yearItem = items.get(`${year}`);
        if (!yearItem) {
          yearItem = {
            title: `${year}`,
            key: `${year}`,
            children: [],
            count: 0,
            leaf: false,
            checked: false
          };
          items.set(`${year}`, yearItem);
          treeMap.set(`${year}`, [`${year}`]);
        }
        let monthItem = (_g = yearItem.children) == null ? void 0 : _g.find((item) => item.key === `${year}-${month}`);
        if (!monthItem) {
          monthItem = {
            title: localeService.t(`sheets-filter-ui.date.${month}`),
            key: `${year}-${month}`,
            children: [],
            count: 0,
            leaf: false,
            checked: false
          };
          (_h = yearItem.children) == null ? void 0 : _h.push(monthItem);
          treeMap.set(`${year}-${month}`, [`${year}`, `${year}-${month}`]);
        }
        const dayItem = (_i = monthItem == null ? void 0 : monthItem.children) == null ? void 0 : _i.find((item) => item.key === `${year}-${month}-${day}`);
        if (!dayItem) {
          (_j = monthItem.children) == null ? void 0 : _j.push({
            title: `${day}`,
            key: `${year}-${month}-${day}`,
            count: 1,
            originValues: /* @__PURE__ */ new Set([value]),
            leaf: true,
            checked: isNeedClearCheckedStatus ? false : alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked
          });
          monthItem.count++;
          yearItem.count++;
          treeMap.set(`${year}-${month}-${day}`, [`${year}`, `${year}-${month}`, `${year}-${month}-${day}`]);
        } else {
          dayItem.originValues.add(value);
          dayItem.count++;
          monthItem.count++;
          yearItem.count++;
        }
      } else {
        const key = value;
        let item = items.get(key);
        if (!item) {
          item = {
            title: value,
            leaf: true,
            checked: isNeedClearCheckedStatus ? false : alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked,
            key,
            count: 1
          };
          items.set(key, item);
          treeMap.set(key, [key]);
        } else {
          item.count++;
        }
      }
      rowIndex++;
    }
  }
  const initialBlankChecked = isNeedClearCheckedStatus ? false : filters ? blankChecked : true;
  if (emptyCount > 0) {
    const item = {
      title: localeService.t("sheets-filter-ui.panel.empty"),
      count: emptyCount,
      leaf: true,
      checked: initialBlankChecked,
      key: EmptyKey
    };
    items.set("empty", item);
    treeMap.set("empty", [EmptyKey]);
  }
  return {
    filterTreeItems: generateFilterTreeBySort(Array.from(items.values())),
    filterTreeMapCache: treeMap
  };
}
function generateFilterTreeBySort(tree) {
  return Array.from(tree).sort((a, b) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return compare(a.title, b.title);
  }).map((yearItem) => {
    if (yearItem.children) {
      yearItem.children.sort((a, b) => {
        const monthA = Number.parseInt(a.key.split("-")[1], 10);
        const monthB = Number.parseInt(b.key.split("-")[1], 10);
        return monthA - monthB;
      }).forEach((monthItem) => {
        if (monthItem.children) {
          monthItem.children.sort((a, b) => {
            const dayA = Number.parseInt(a.key.split("-")[2], 10);
            const dayB = Number.parseInt(b.key.split("-")[2], 10);
            return dayA - dayB;
          });
        }
      });
    }
    return yearItem;
  });
}
function compare(strA, strB) {
  const aIsNumeric = isNumeric(strA);
  const bIsNumeric = isNumeric(strB);
  if (aIsNumeric && bIsNumeric) {
    return Number.parseFloat(strA) - Number.parseFloat(strB);
  } else if (aIsNumeric && !bIsNumeric) {
    return -1;
  } else if (!aIsNumeric && bIsNumeric) {
    return 1;
  } else {
    return strA.localeCompare(strB);
  }
}

// ../packages/sheets-filter-ui/src/services/util.ts
function findObjectByKey(data, targetKey) {
  for (const node of data) {
    if (node.key === targetKey) {
      return node;
    }
    if (node.children) {
      const result = findObjectByKey(node.children, targetKey);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
function areAllLeafNodesChecked(node) {
  if (node.leaf) {
    return node.checked;
  }
  return node.children ? node.children.every((child) => areAllLeafNodesChecked(child)) : true;
}
function updateLeafNodesCheckedStatus(node, status) {
  if (node.leaf) {
    if (status !== void 0) {
      node.checked = status;
    } else {
      node.checked = !node.checked;
    }
  }
  if (node.children) {
    node.children.forEach((child) => updateLeafNodesCheckedStatus(child, status));
  }
}
function searchTree(items, searchKeywords) {
  const result = [];
  items.forEach((item) => {
    const originMatches = item.originValues ? searchKeywords.some(
      (keyword) => Array.from(item.originValues).some(
        (value) => value.toLowerCase().includes(keyword.toLowerCase())
      )
    ) : false;
    const titleMatches = !originMatches && searchKeywords.some(
      (keyword) => item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    const matches = originMatches || titleMatches;
    if (matches) {
      result.push({ ...item });
    } else if (item.children) {
      const filteredChildren = searchTree(item.children, searchKeywords);
      if (filteredChildren.length > 0) {
        const aggregatedCount = filteredChildren.reduce((sum, child) => sum + child.count, 0);
        result.push({ ...item, count: aggregatedCount, children: filteredChildren });
      }
    }
  });
  return result;
}

// ../packages/sheets-filter-ui/src/services/sheets-filter-panel.service.ts
var ISheetsFilterPanelService = createIdentifier("sheets-filter-ui.sheets-filter-panel.service");
var SheetsFilterPanelService = class extends Disposable {
  constructor(_injector, _refRangeService) {
    super();
    __publicField(this, "_injector", _injector);
    __publicField(this, "_refRangeService", _refRangeService);
    __publicField(this, "_filterBy$", new BehaviorSubject(0 /* VALUES */));
    __publicField(this, "filterBy$", this._filterBy$.asObservable());
    __publicField(this, "_filterByModel$", new ReplaySubject(1));
    __publicField(this, "filterByModel$", this._filterByModel$.asObservable());
    __publicField(this, "_filterByModel", null);
    __publicField(this, "_hasCriteria$", new BehaviorSubject(false));
    __publicField(this, "hasCriteria$", this._hasCriteria$.asObservable());
    __publicField(this, "_filterModel", null);
    __publicField(this, "_col$", new BehaviorSubject(-1));
    __publicField(this, "col$", this._col$.asObservable());
    __publicField(this, "_filterHeaderListener", null);
  }
  get filterBy() {
    return this._filterBy$.getValue();
  }
  get filterByModel() {
    return this._filterByModel;
  }
  set filterByModel(model) {
    this._filterByModel = model;
    this._filterByModel$.next(model);
  }
  get filterModel() {
    return this._filterModel;
  }
  get col() {
    return this._col$.getValue();
  }
  dispose() {
    this._filterBy$.complete();
    this._filterByModel$.complete();
    this._hasCriteria$.complete();
  }
  setupCol(filterModel, col) {
    this.terminate();
    this._filterModel = filterModel;
    this._col$.next(col);
    const filterColumn = filterModel.getFilterColumn(col);
    if (filterColumn) {
      const info = filterColumn.getColumnData();
      if (info.customFilters) {
        this._hasCriteria$.next(true);
        this._setupByConditions(filterModel, col);
        return;
      }
      if (info.colorFilters) {
        this._hasCriteria$.next(true);
        this._setupByColors(filterModel, col);
        return;
      }
      if (info.filters) {
        this._hasCriteria$.next(true);
        this._setupByValues(filterModel, col);
        return;
      }
      this._hasCriteria$.next(false);
      this._setupByValues(filterModel, col);
      return;
    }
    this._hasCriteria$.next(false);
    this._setupByValues(filterModel, col);
  }
  changeFilterBy(filterBy) {
    if (!this._filterModel || this.col === -1) {
      return false;
    }
    switch (filterBy) {
      case 0 /* VALUES */:
        this._setupByValues(this._filterModel, this.col);
        break;
      case 1 /* COLORS */:
        this._setupByColors(this._filterModel, this.col);
        break;
      case 2 /* CONDITIONS */:
        this._setupByConditions(this._filterModel, this.col);
        break;
    }
    return true;
  }
  terminate() {
    this._filterModel = null;
    this._col$.next(-1);
    this._disposeFilterHeaderChangeListener();
    return true;
  }
  _disposeFilterHeaderChangeListener() {
    var _a;
    (_a = this._filterHeaderListener) == null ? void 0 : _a.dispose();
    this._filterHeaderListener = null;
  }
  _listenToFilterHeaderChange(filterModel, col) {
    this._disposeFilterHeaderChangeListener();
    const unitId = filterModel.unitId;
    const subUnitId = filterModel.subUnitId;
    const filterRange = filterModel.getRange();
    const columnHeaderRange = {
      startColumn: col,
      startRow: filterRange.startRow,
      endRow: filterRange.startRow,
      endColumn: col
    };
    this._filterHeaderListener = this._refRangeService.watchRange(unitId, subUnitId, columnHeaderRange, (before, after) => {
      if (!after) {
        this.terminate();
      } else {
        const offset = after.startColumn - before.startColumn;
        if (offset !== 0) {
          this._filterByModel.deltaCol(offset);
        }
      }
    });
  }
  async _setupByValues(filterModel, col) {
    this._disposePreviousModel();
    const range = filterModel.getRange();
    if (range.startRow === range.endRow) return false;
    const filterByModel = await ByValuesModel.fromFilterColumn(
      this._injector,
      filterModel,
      col
    );
    this.filterByModel = filterByModel;
    this._filterBy$.next(0 /* VALUES */);
    this._listenToFilterHeaderChange(filterModel, col);
    return true;
  }
  async _setupByColors(filterModel, col) {
    this._disposePreviousModel();
    const range = filterModel.getRange();
    if (range.startRow === range.endRow) return false;
    const filterByModel = await ByColorsModel.fromFilterColumn(
      this._injector,
      filterModel,
      col
    );
    this.filterByModel = filterByModel;
    this._filterBy$.next(1 /* COLORS */);
    this._listenToFilterHeaderChange(filterModel, col);
    return true;
  }
  _setupByConditions(filterModel, col) {
    this._disposePreviousModel();
    const range = filterModel.getRange();
    if (range.startRow === range.endRow) return false;
    const model = ByConditionsModel.fromFilterColumn(
      this._injector,
      filterModel,
      col,
      filterModel.getFilterColumn(col)
    );
    this.filterByModel = model;
    this._filterBy$.next(2 /* CONDITIONS */);
    this._listenToFilterHeaderChange(filterModel, col);
    return true;
  }
  _disposePreviousModel() {
    var _a;
    (_a = this._filterByModel) == null ? void 0 : _a.dispose();
    this.filterByModel = null;
  }
};
SheetsFilterPanelService = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(RefRangeService))
], SheetsFilterPanelService);
var ByConditionsModel = class extends Disposable {
  constructor(_filterModel, col, conditionItem, conditionParams, _commandService) {
    super();
    __publicField(this, "_filterModel", _filterModel);
    __publicField(this, "col", col);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "canApply$", of(true));
    __publicField(this, "_conditionItem$");
    __publicField(this, "conditionItem$");
    __publicField(this, "_filterConditionFormParams$");
    __publicField(this, "filterConditionFormParams$");
    this._conditionItem$ = new BehaviorSubject(conditionItem);
    this.conditionItem$ = this._conditionItem$.asObservable();
    this._filterConditionFormParams$ = new BehaviorSubject(conditionParams);
    this.filterConditionFormParams$ = this._filterConditionFormParams$.asObservable();
  }
  /**
   * Create a model with targeting filter column. If there is not a filter column, the model would be created with
   * default values.
   *
   * @param injector
   * @param filterModel
   * @param col
   * @param filterColumn
   *
   * @returns the model to control the panel's state
   */
  static fromFilterColumn(injector, filterModel, col, filterColumn) {
    const [conditionItem, conditionParams] = FilterConditionItems.testMappingFilterColumn(filterColumn == null ? void 0 : filterColumn.getColumnData());
    const model = injector.createInstance(ByConditionsModel, filterModel, col, conditionItem, conditionParams);
    return model;
  }
  get conditionItem() {
    return this._conditionItem$.getValue();
  }
  get filterConditionFormParams() {
    return this._filterConditionFormParams$.getValue();
  }
  dispose() {
    super.dispose();
    this._conditionItem$.complete();
    this._filterConditionFormParams$.complete();
  }
  deltaCol(offset) {
    this.col += offset;
  }
  clear() {
    if (this._disposed) return Promise.resolve(false);
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria: null
    });
  }
  /**
   * Apply the filter condition to the target filter column.
   */
  async apply() {
    if (this._disposed) return false;
    const filterColumn = FilterConditionItems.mapToFilterColumn(this.conditionItem, this.filterConditionFormParams);
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria: filterColumn
    });
  }
  /**
   * This method would be called when user changes the primary condition. The model would load the corresponding
   * `IFilterConditionFormParams` and load default condition form params.
   */
  onPrimaryConditionChange(operator) {
    const conditionItem = FilterConditionItems.ALL_CONDITIONS.find((item) => item.operator === operator);
    if (!conditionItem) {
      throw new Error(`[ByConditionsModel]: condition item not found for operator: ${operator}!`);
    }
    this._conditionItem$.next(conditionItem);
    this._filterConditionFormParams$.next(FilterConditionItems.getInitialFormParams(operator));
  }
  /**
   * This method would be called when user changes the primary conditions, the input values or "AND" "OR" ratio.
   * If the primary conditions or the ratio is changed, the method would load the corresponding `IFilterCondition`.
   *
   * When the panel call this method, it only has to pass the changed keys.
   *
   * @param params
   */
  onConditionFormChange(params) {
    const newParams = { ...this.filterConditionFormParams, ...params };
    if (newParams.and !== true) {
      delete newParams.and;
    }
    if (typeof params.and !== "undefined" || typeof params.operator1 !== "undefined" || typeof params.operator2 !== "undefined") {
      const conditionItem = FilterConditionItems.testMappingParams(newParams, this.conditionItem.numOfParameters);
      this._conditionItem$.next(conditionItem);
    }
    this._filterConditionFormParams$.next(newParams);
  }
};
ByConditionsModel = __decorateClass([
  __decorateParam(4, ICommandService)
], ByConditionsModel);
var ByValuesModel = class extends Disposable {
  constructor(_filterModel, col, items, cache, _commandService) {
    super();
    __publicField(this, "_filterModel", _filterModel);
    __publicField(this, "col", col);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_rawFilterItems$");
    __publicField(this, "rawFilterItems$");
    __publicField(this, "filterItems$");
    __publicField(this, "_filterItems", []);
    __publicField(this, "_treeMapCache");
    __publicField(this, "canApply$");
    __publicField(this, "_manuallyUpdateFilterItems$");
    __publicField(this, "_searchString$");
    __publicField(this, "searchString$");
    this._treeMapCache = cache;
    this._searchString$ = new BehaviorSubject("");
    this.searchString$ = this._searchString$.asObservable();
    this._rawFilterItems$ = new BehaviorSubject(items);
    this.rawFilterItems$ = this._rawFilterItems$.asObservable();
    this._manuallyUpdateFilterItems$ = new Subject();
    this.filterItems$ = merge(
      combineLatest([
        this._searchString$.pipe(
          throttleTime(500, void 0, { leading: true, trailing: true }),
          startWith(void 0)
        ),
        this._rawFilterItems$
      ]).pipe(
        map(([searchString, items2]) => {
          if (!searchString) return items2;
          const lowerSearchString = searchString.toLowerCase();
          const searchKeyWords = lowerSearchString.split(/\s+/).filter((s) => !!s);
          return searchTree(items2, searchKeyWords);
        })
      ),
      this._manuallyUpdateFilterItems$
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.canApply$ = this.filterItems$.pipe(map((items2) => {
      const stat = statisticFilterByValueItems(items2);
      return stat.checked > 0;
    }));
    this.disposeWithMe(this.filterItems$.subscribe((items2) => this._filterItems = items2));
  }
  /**
   * Create a model with targeting filter column. If there is not a filter column, the model would be created with
   * default values.
   *
   * @param injector
   * @param filterModel
   * @param col
   *
   * @returns the model to control the panel's state
   */
  static async fromFilterColumn(injector, filterModel, col) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const localeService = injector.get(LocaleService);
    const generateFilterValuesService = injector.get(ISheetsGenerateFilterValuesService, Quantity.OPTIONAL);
    const { unitId, subUnitId } = filterModel;
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    if (!workbook) throw new Error(`[ByValuesModel]: Workbook not found for filter model with unitId: ${unitId}!`);
    const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) throw new Error(`[ByValuesModel]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);
    const range = filterModel.getRange();
    const column = col;
    const filterColumn = filterModel.getFilterColumn(col);
    const filters = filterColumn == null ? void 0 : filterColumn.getColumnData().filters;
    const alreadyChecked = new Set(filters == null ? void 0 : filters.filters);
    const blankChecked = !!(filters && filters.blank);
    const filteredOutRowsByOtherColumns = filterModel.getFilteredOutRowsExceptCol(col);
    const iterateRange = { ...range, startRow: range.startRow + 1, startColumn: column, endColumn: column };
    let items;
    let cache;
    if (generateFilterValuesService) {
      const res = await generateFilterValuesService.getFilterValues({
        unitId,
        subUnitId,
        filteredOutRowsByOtherColumns: Array.from(filteredOutRowsByOtherColumns),
        filterColumn,
        filters: !!filters,
        blankChecked,
        iterateRange,
        alreadyChecked: Array.from(alreadyChecked)
      });
      items = res.filterTreeItems;
      cache = res.filterTreeMapCache;
    } else {
      const res = getFilterTreeByValueItems(
        !!filters,
        localeService,
        iterateRange,
        worksheet,
        filteredOutRowsByOtherColumns,
        filterColumn,
        alreadyChecked,
        blankChecked,
        workbook.getStyles()
      );
      items = res.filterTreeItems;
      cache = res.filterTreeMapCache;
    }
    return injector.createInstance(ByValuesModel, filterModel, col, items, cache);
  }
  get rawFilterItems() {
    return this._rawFilterItems$.getValue();
  }
  get filterItems() {
    return this._filterItems;
  }
  get treeMapCache() {
    return this._treeMapCache;
  }
  dispose() {
    this._rawFilterItems$.complete();
    this._searchString$.complete();
  }
  deltaCol(offset) {
    this.col += offset;
  }
  setSearchString(str) {
    this._searchString$.next(str);
  }
  onCheckAllToggled(checked) {
    const items = Tools.deepClone(this._filterItems);
    items.forEach((item) => updateLeafNodesCheckedStatus(item, checked));
    this._manuallyUpdateFilterItems(items);
  }
  /**
   * Toggle a filter item.
   */
  onFilterCheckToggled(item) {
    const items = Tools.deepClone(this._filterItems);
    const changedItem = findObjectByKey(items, item.key);
    if (!changedItem) {
      return;
    }
    const allLeafChecked = areAllLeafNodesChecked(changedItem);
    updateLeafNodesCheckedStatus(changedItem, !allLeafChecked);
    this._manuallyUpdateFilterItems(items);
  }
  onFilterOnly(itemKeys) {
    const items = Tools.deepClone(this._filterItems);
    items.forEach((item) => updateLeafNodesCheckedStatus(item, false));
    itemKeys.forEach((key) => {
      const changedItem = findObjectByKey(items, key);
      if (changedItem) {
        updateLeafNodesCheckedStatus(changedItem, true);
      }
    });
    this._manuallyUpdateFilterItems(items);
  }
  _manuallyUpdateFilterItems(items) {
    this._manuallyUpdateFilterItems$.next(items);
  }
  // expose method here to let the panel change filter items
  // #region ByValuesModel apply methods
  clear() {
    if (this._disposed) return Promise.resolve(false);
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria: null
    });
  }
  /**
   * Apply the filter condition to the target filter column.
   */
  async apply() {
    if (this._disposed) {
      return false;
    }
    const statistics = statisticFilterByValueItems(this._filterItems);
    const { checked, checkedItems } = statistics;
    const rawFilterItems = this.rawFilterItems;
    let rawFilterCount = 0;
    for (const item of rawFilterItems) {
      rawFilterCount += item.count;
    }
    const noChecked = checked === 0;
    const allChecked = statistics.checked === rawFilterCount;
    const criteria = { colId: this.col };
    if (noChecked) {
      throw new Error("[ByValuesModel]: no checked items!");
    } else if (allChecked) {
      return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
        unitId: this._filterModel.unitId,
        subUnitId: this._filterModel.subUnitId,
        col: this.col,
        criteria: null
      });
    } else {
      criteria.filters = {};
      const nonEmptyItems = checkedItems.filter((item) => item.key !== "empty");
      if (nonEmptyItems.length > 0) {
        criteria.filters = {
          filters: nonEmptyItems.flatMap((item) => item.originValues ? Array.from(item.originValues) : [item.title])
        };
      }
      const hasEmpty = nonEmptyItems.length !== checkedItems.length;
      if (hasEmpty) {
        criteria.filters.blank = true;
      }
    }
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria
    });
  }
  // #endregion
};
ByValuesModel = __decorateClass([
  __decorateParam(4, ICommandService)
], ByValuesModel);
var ByColorsModel = class extends Disposable {
  constructor(_filterModel, col, cellFillColors, cellTextColors, _commandService) {
    super();
    __publicField(this, "_filterModel", _filterModel);
    __publicField(this, "col", col);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "canApply$", of(true));
    __publicField(this, "_cellFillColors$");
    __publicField(this, "cellFillColors$");
    __publicField(this, "_cellTextColors$");
    __publicField(this, "cellTextColors$");
    this._cellFillColors$ = new BehaviorSubject(Array.from(cellFillColors.values()));
    this.cellFillColors$ = this._cellFillColors$.asObservable();
    this._cellTextColors$ = new BehaviorSubject(Array.from(cellTextColors.values()));
    this.cellTextColors$ = this._cellTextColors$.asObservable();
  }
  /**
   * Create a model with targeting filter column. If there is not a filter column, the model would be created with
   * default values.
   *
   * @param injector
   * @param filterModel
   * @param col
   *
   * @returns the model to control the panel's state
   */
  static async fromFilterColumn(injector, filterModel, col) {
    var _a, _b, _c;
    const univerInstanceService = injector.get(IUniverInstanceService);
    const { unitId, subUnitId } = filterModel;
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);
    if (!workbook) throw new Error(`[ByColorsModel]: Workbook not found for filter model with unitId: ${unitId}!`);
    const worksheet = workbook == null ? void 0 : workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) throw new Error(`[ByColorsModel]: Worksheet not found for filter model with unitId: ${unitId} and subUnitId: ${subUnitId}!`);
    const range = filterModel.getRange();
    const column = col;
    const colorFilters = (_a = filterModel.getFilterColumn(col)) == null ? void 0 : _a.getColumnData().colorFilters;
    const filteredOutRowsByOtherColumns = filterModel.getFilteredOutRowsExceptCol(col);
    const iterateRange = { ...range, startRow: range.startRow + 1, startColumn: column, endColumn: column };
    const cellFillColors = /* @__PURE__ */ new Map();
    const cellFillColorsChecked = new Set((_b = colorFilters == null ? void 0 : colorFilters.cellFillColors) != null ? _b : []);
    const cellTextColors = /* @__PURE__ */ new Map();
    const cellTextColorsChecked = new Set((_c = colorFilters == null ? void 0 : colorFilters.cellTextColors) != null ? _c : []);
    for (const cell of worksheet.iterateByColumn(iterateRange, false, true)) {
      const { row, col: col2, value } = cell;
      if (filteredOutRowsByOtherColumns.has(row)) {
        continue;
      }
      const style = worksheet.getComposedCellStyleByCellData(row, col2, value);
      if (style.bg && style.bg.rgb) {
        const bg = new ColorKit(style.bg.rgb).toRgbString();
        if (!cellFillColors.has(bg)) {
          cellFillColors.set(bg, { color: bg, checked: cellFillColorsChecked.has(bg) });
        }
      } else {
        cellFillColors.set("default-fill-color", { color: null, checked: cellFillColorsChecked.has(null) });
      }
      if (style.cl && style.cl.rgb) {
        const cl = new ColorKit(style.cl.rgb).toRgbString();
        if (!cellTextColors.has(cl)) {
          cellTextColors.set(cl, { color: cl, checked: cellTextColorsChecked.has(cl) });
        }
      } else {
        cellTextColors.set("default-font-color", { color: COLOR_BLACK_RGB, checked: cellTextColorsChecked.has(COLOR_BLACK_RGB) });
      }
    }
    return injector.createInstance(ByColorsModel, filterModel, col, cellFillColors, cellTextColors);
  }
  get cellFillColors() {
    return this._cellFillColors$.getValue();
  }
  get cellTextColors() {
    return this._cellTextColors$.getValue();
  }
  dispose() {
    super.dispose();
    this._cellFillColors$.complete();
  }
  deltaCol(offset) {
    this.col += offset;
  }
  // expose method here to let the panel change filter items
  // #region ByColorsModel apply methods
  clear() {
    if (this._disposed) return Promise.resolve(false);
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria: null
    });
  }
  onFilterCheckToggled(item, isFillColor = true) {
    const colors = isFillColor ? this.cellFillColors : this.cellTextColors;
    const items = [];
    let found = false;
    for (let i = 0; i < colors.length; i++) {
      const colorItem = colors[i];
      if (colorItem.color === item.color) {
        found = true;
        items.push({
          color: colorItem.color,
          checked: !colorItem.checked
        });
        continue;
      }
      items.push({
        color: colorItem.color,
        checked: colorItem.checked
      });
    }
    if (!found) {
      return;
    }
    this._resetColorsCheckedStatus(!isFillColor);
    if (isFillColor) {
      this._cellFillColors$.next([...items]);
    } else {
      this._cellTextColors$.next([...items]);
    }
  }
  _resetColorsCheckedStatus(isFillColor = true) {
    const colors = isFillColor ? this.cellFillColors : this.cellTextColors;
    const items = [];
    for (let i = 0; i < colors.length; i++) {
      items.push({
        color: colors[i].color,
        checked: false
      });
    }
    if (isFillColor) {
      this._cellFillColors$.next([...items]);
    } else {
      this._cellTextColors$.next([...items]);
    }
  }
  /**
   * Apply the filter condition to the target filter column.
   */
  async apply() {
    if (this._disposed) {
      return false;
    }
    const cellFillColorsChecked = this.cellFillColors.filter((item) => item.checked).map((item) => item.color);
    const cellTextColorsChecked = this.cellTextColors.filter((item) => item.checked).map((item) => item.color);
    if (cellFillColorsChecked.length === 0 && cellTextColorsChecked.length === 0) {
      return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
        unitId: this._filterModel.unitId,
        subUnitId: this._filterModel.subUnitId,
        col: this.col,
        criteria: null
      });
    }
    const criteria = { colId: this.col };
    if (cellFillColorsChecked.length > 0) {
      criteria.colorFilters = {
        cellFillColors: cellFillColorsChecked
      };
    } else if (cellTextColorsChecked.length > 0) {
      criteria.colorFilters = {
        cellTextColors: cellTextColorsChecked
      };
    }
    return this._commandService.executeCommand(SetSheetsFilterCriteriaCommand.id, {
      unitId: this._filterModel.unitId,
      subUnitId: this._filterModel.subUnitId,
      col: this.col,
      criteria
    });
  }
  // #endregion
};
ByColorsModel = __decorateClass([
  __decorateParam(4, ICommandService)
], ByColorsModel);

// ../packages/sheets-filter-ui/src/commands/operations/sheets-filter.operation.ts
var FILTER_PANEL_OPENED_KEY = "FILTER_PANEL_OPENED";
var OpenFilterPanelOperation = {
  id: "sheet.operation.open-filter-panel",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const contextService = accessor.get(IContextService);
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
    const commandService = accessor.get(ICommandService);
    const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;
    if (editorBridgeService == null ? void 0 : editorBridgeService.isVisible().visible) {
      commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, { visible: false });
    }
    const { unitId, subUnitId, col } = params;
    const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
    if (!filterModel) return false;
    sheetsFilterPanelService.setupCol(filterModel, col);
    if (!contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
      contextService.setContextValue(FILTER_PANEL_OPENED_KEY, true);
    }
    return true;
  }
};
var CloseFilterPanelOperation = {
  id: "sheet.operation.close-filter-panel",
  type: 1 /* OPERATION */,
  handler: (accessor) => {
    const contextService = accessor.get(IContextService);
    const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
    const layoutService = accessor.get(ILayoutService, Quantity.OPTIONAL);
    if (contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
      contextService.setContextValue(FILTER_PANEL_OPENED_KEY, false);
      layoutService == null ? void 0 : layoutService.focus();
      return sheetsFilterPanelService.terminate();
    }
    return false;
  }
};
var ChangeFilterByOperation = {
  id: "sheet.operation.apply-filter",
  type: 1 /* OPERATION */,
  handler: (accessor, params) => {
    const { filterBy } = params;
    const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
    return sheetsFilterPanelService.changeFilterBy(filterBy);
  }
};

// ../packages/sheets-filter-ui/src/controllers/sheets-filter-permission.controller.ts
var SheetsFilterPermissionController = class extends Disposable {
  constructor(_sheetsFilterService, _localeService, _commandService, _sheetPermissionCheckPermission, _injector, _sheetsSelectionService) {
    super();
    __publicField(this, "_sheetsFilterService", _sheetsFilterService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_sheetPermissionCheckPermission", _sheetPermissionCheckPermission);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetsSelectionService", _sheetsSelectionService);
    this._commandExecutedListener();
  }
  _commandExecutedListener() {
    this.disposeWithMe(
      this._commandService.beforeCommandExecuted((command) => {
        var _a, _b, _c;
        if (command.id === SmartToggleSheetsFilterCommand.id) {
          const univerInstanceService = this._injector.get(IUniverInstanceService);
          const target = getSheetCommandTarget(univerInstanceService);
          if (!target) return;
          const { unitId, subUnitId, worksheet } = target;
          const filterRange = (_a = this._sheetsFilterService.getFilterModel(unitId, subUnitId)) == null ? void 0 : _a.getRange();
          let permission;
          if (filterRange) {
            permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
              rangeTypes: [RangeProtectionPermissionViewPoint],
              worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission]
            }, [filterRange], unitId, subUnitId);
          } else {
            const range = (_b = this._sheetsSelectionService.getCurrentLastSelection()) == null ? void 0 : _b.range;
            if (range) {
              let newRange = { ...range };
              const isCellRange = range.startColumn === range.endColumn && range.startRow === range.endRow;
              newRange = isCellRange ? expandToContinuousRange(newRange, { left: true, right: true, up: true, down: true }, worksheet) : newRange;
              permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
                rangeTypes: [RangeProtectionPermissionViewPoint],
                worksheetTypes: [WorksheetViewPermission, WorksheetFilterPermission]
              }, [newRange], unitId, subUnitId);
            } else {
              permission = this._sheetPermissionCheckPermission.permissionCheckWithoutRange({
                rangeTypes: [RangeProtectionPermissionViewPoint],
                worksheetTypes: [WorksheetViewPermission, WorksheetFilterPermission]
              });
            }
          }
          if (!permission) {
            this._sheetPermissionCheckPermission.blockExecuteWithoutPermission(this._localeService.t("sheets-filter-ui.permission.filterErr"));
          }
        }
        if (command.id === OpenFilterPanelOperation.id) {
          const params = command.params;
          const { unitId, subUnitId } = params;
          const filterRange = (_c = this._sheetsFilterService.getFilterModel(unitId, subUnitId)) == null ? void 0 : _c.getRange();
          const colRange = Tools.deepClone(filterRange);
          if (colRange) {
            colRange.startColumn = params.col;
            colRange.endColumn = params.col;
            const permission = this._sheetPermissionCheckPermission.permissionCheckWithRanges({
              rangeTypes: [RangeProtectionPermissionViewPoint],
              worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission]
            }, [colRange], unitId, subUnitId);
            if (!permission) {
              this._sheetPermissionCheckPermission.blockExecuteWithoutPermission(this._localeService.t("sheets-filter-ui.permission.filterErr"));
            }
          }
        }
      })
    );
  }
};
SheetsFilterPermissionController = __decorateClass([
  __decorateParam(0, Inject(SheetsFilterService)),
  __decorateParam(1, Inject(LocaleService)),
  __decorateParam(2, ICommandService),
  __decorateParam(3, Inject(SheetPermissionCheckController)),
  __decorateParam(4, Inject(Injector)),
  __decorateParam(5, Inject(SheetsSelectionsService))
], SheetsFilterPermissionController);

// ../packages/sheets-filter-ui/src/views/widgets/drawings.ts
var BUTTON_VIEWPORT = 16;
var FILTER_BUTTON_EMPTY = new Path2D("M3.30363 3C2.79117 3 2.51457 3.60097 2.84788 3.99024L6.8 8.60593V12.5662C6.8 12.7184 6.8864 12.8575 7.02289 12.9249L8.76717 13.7863C8.96655 13.8847 9.2 13.7396 9.2 13.5173V8.60593L13.1521 3.99024C13.4854 3.60097 13.2088 3 12.6964 3H3.30363Z");
var FilterButton = class {
  static drawNoCriteria(ctx, size, fgColor, bgColor) {
    ctx.save();
    Rect.drawWith(ctx, {
      radius: 2,
      width: BUTTON_VIEWPORT,
      height: BUTTON_VIEWPORT,
      fill: bgColor
    });
    ctx.lineCap = "square";
    ctx.strokeStyle = fgColor;
    ctx.scale(size / BUTTON_VIEWPORT, size / BUTTON_VIEWPORT);
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.moveTo(3, 4);
    ctx.lineTo(13, 4);
    ctx.moveTo(4.5, 8);
    ctx.lineTo(11.5, 8);
    ctx.moveTo(6, 12);
    ctx.lineTo(10, 12);
    ctx.stroke();
    ctx.restore();
  }
  static drawHasCriteria(ctx, size, fgColor, bgColor) {
    ctx.save();
    Rect.drawWith(ctx, {
      radius: 2,
      width: BUTTON_VIEWPORT,
      height: BUTTON_VIEWPORT,
      fill: bgColor
    });
    ctx.scale(size / BUTTON_VIEWPORT, size / BUTTON_VIEWPORT);
    ctx.fillStyle = fgColor;
    ctx.fill(FILTER_BUTTON_EMPTY);
    ctx.restore();
  }
};

// ../packages/sheets-filter-ui/src/views/widgets/filter-button.shape.ts
var FILTER_ICON_SIZE = 16;
var FILTER_ICON_PADDING = 1;
var SheetsFilterButtonShape = class extends Shape {
  constructor(key, props, _contextService, _commandService, _themeService) {
    super(key, props);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_themeService", _themeService);
    __publicField(this, "_cellWidth", 0);
    __publicField(this, "_cellHeight", 0);
    __publicField(this, "_filterParams");
    __publicField(this, "_hovered", false);
    this.setShapeProps(props);
    this.onPointerDown$.subscribeEvent((evt) => this.onPointerDown(evt));
    this.onPointerEnter$.subscribeEvent(() => this.onPointerEnter());
    this.onPointerLeave$.subscribeEvent(() => this.onPointerLeave());
  }
  setShapeProps(props) {
    if (typeof props.cellHeight !== "undefined") {
      this._cellHeight = props.cellHeight;
    }
    if (typeof props.cellWidth !== "undefined") {
      this._cellWidth = props.cellWidth;
    }
    if (typeof props.filterParams !== "undefined") {
      this._filterParams = props.filterParams;
    }
    this.transformByState({
      width: props.width,
      height: props.height
    });
  }
  _draw(ctx) {
    const cellHeight = this._cellHeight;
    const cellWidth = this._cellWidth;
    const left = FILTER_ICON_SIZE - cellWidth;
    const top = FILTER_ICON_SIZE - cellHeight;
    ctx.save();
    const cellRegion = new Path2D();
    cellRegion.rect(left, top, cellWidth, cellHeight);
    ctx.clip(cellRegion);
    const { hasCriteria } = this._filterParams;
    const fgColor = this._themeService.getColorFromTheme("primary.600");
    const bgColor = this._hovered ? this._themeService.getColorFromTheme("gray.50") : "rgba(255, 255, 255, 1.0)";
    if (hasCriteria) {
      FilterButton.drawHasCriteria(ctx, FILTER_ICON_SIZE, fgColor, bgColor);
    } else {
      FilterButton.drawNoCriteria(ctx, FILTER_ICON_SIZE, fgColor, bgColor);
    }
    ctx.restore();
  }
  onPointerDown(evt) {
    if (evt.button === 2) {
      return;
    }
    const { col, unitId, subUnitId } = this._filterParams;
    const opened = this._contextService.getContextValue(FILTER_PANEL_OPENED_KEY);
    if (opened || !this._commandService.hasCommand(OpenFilterPanelOperation.id)) {
      return;
    }
    setTimeout(() => {
      this._commandService.executeCommand(OpenFilterPanelOperation.id, {
        unitId,
        subUnitId,
        col
      });
    }, 200);
  }
  onPointerEnter() {
    this._hovered = true;
    this.makeDirty(true);
  }
  onPointerLeave() {
    this._hovered = false;
    this.makeDirty(true);
  }
};
SheetsFilterButtonShape = __decorateClass([
  __decorateParam(2, IContextService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, Inject(ThemeService))
], SheetsFilterButtonShape);

// ../packages/sheets-filter-ui/src/views/render-modules/sheets-filter.render-controller.ts
var DEFAULT_Z_INDEX = 1e3;
var SHEETS_FILTER_BUTTON_Z_INDEX = 5e3;
function computeIconTop(startY, endY, cellHeight, verticalAlign) {
  switch (verticalAlign) {
    case 1 /* TOP */:
      return startY + FILTER_ICON_PADDING;
    case 2 /* MIDDLE */:
      return startY + Math.max(0, (cellHeight - FILTER_ICON_SIZE) / 2);
    case 3 /* BOTTOM */:
    default:
      return endY - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
  }
}
var SheetsFilterRenderController = class extends RxDisposable {
  constructor(_context, _injector, _sheetSkeletonManagerService, _sheetsFilterService, _themeService, _sheetInterceptorService, _commandService, _selectionRenderService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_sheetSkeletonManagerService", _sheetSkeletonManagerService);
    __publicField(this, "_sheetsFilterService", _sheetsFilterService);
    __publicField(this, "_themeService", _themeService);
    __publicField(this, "_sheetInterceptorService", _sheetInterceptorService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_selectionRenderService", _selectionRenderService);
    __publicField(this, "_currentRenderParams", null);
    __publicField(this, "_filterRangeShape", null);
    __publicField(this, "_buttonRenderDisposable", null);
    __publicField(this, "_filterButtonShapes", []);
    this._initRenderer();
  }
  dispose() {
    super.dispose();
    this._disposeRendering();
  }
  _initRenderer() {
    this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => {
      this._refreshRendering(this._currentRenderParams);
    }));
    this._sheetSkeletonManagerService.currentSkeleton$.pipe(
      switchMap((skeletonParams) => {
        var _a, _b;
        if (!skeletonParams) return of(null);
        const { unit: workbook, unitId } = this._context;
        const worksheetId = ((_a = workbook.getActiveSheet()) == null ? void 0 : _a.getSheetId()) || "";
        const filterModel = (_b = this._sheetsFilterService.getFilterModel(unitId, worksheetId)) != null ? _b : void 0;
        const getParams = () => ({
          unitId,
          worksheetId,
          filterModel,
          range: filterModel == null ? void 0 : filterModel.getRange(),
          skeleton: skeletonParams.skeleton
        });
        return fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(
          filter(
            ([command]) => {
              var _a2;
              return command.type === 2 /* MUTATION */ && ((_a2 = command.params) == null ? void 0 : _a2.unitId) === workbook.getUnitId() && (FILTER_MUTATIONS.has(command.id) || command.id === SetRangeValuesMutation.id);
            }
          ),
          throttleTime(20, void 0, { leading: false, trailing: true }),
          map(getParams),
          startWith(getParams())
          // must trigger once
        );
      }),
      takeUntil(this.dispose$)
    ).subscribe((renderParams) => {
      this._currentRenderParams = renderParams;
      this._refreshRendering(renderParams);
    });
  }
  _refreshRendering(renderParams) {
    this._disposeRendering();
    if (!renderParams || !renderParams.range) {
      return;
    }
    this._renderRange(renderParams.range, renderParams.skeleton);
    this._renderButtons(renderParams);
  }
  _renderRange(range, skeleton) {
    const { scene } = this._context;
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const filterRangeShape = this._filterRangeShape = new SelectionControl(
      scene,
      DEFAULT_Z_INDEX,
      this._themeService,
      {
        rowHeaderWidth,
        columnHeaderHeight,
        enableAutoFill: false,
        highlightHeader: false
      }
    );
    const selectionWithStyle = {
      range,
      primary: null,
      style: { fill: "rgba(0, 0, 0, 0.0)" }
    };
    const selectionWithCoord = attachSelectionWithCoord(selectionWithStyle, skeleton);
    filterRangeShape.updateRangeBySelectionWithCoord(selectionWithCoord);
    filterRangeShape.setEvent(false);
    scene.makeDirty(true);
  }
  _renderButtons(params) {
    const { range, filterModel, unitId, skeleton, worksheetId } = params;
    const { unit: workbook, scene } = this._context;
    const worksheet = workbook.getSheetBySheetId(worksheetId);
    if (!worksheet) {
      return;
    }
    this._interceptCellContent(unitId, worksheetId, params.range);
    const { startColumn, endColumn, startRow } = range;
    for (let col = startColumn; col <= endColumn; col++) {
      const key = `sheets-filter-button-${col}`;
      const startPosition = getCoordByCell(startRow, col, scene, skeleton);
      const cellStyle = worksheet.getComposedCellStyle(startRow, col);
      const verticalAlign = (cellStyle == null ? void 0 : cellStyle.vt) || 3 /* BOTTOM */;
      const { startX, startY, endX, endY } = startPosition;
      const cellWidth = endX - startX;
      const cellHeight = endY - startY;
      if (cellHeight <= FILTER_ICON_PADDING || cellWidth <= FILTER_ICON_PADDING) {
        continue;
      }
      const hasCriteria = !!filterModel.getFilterColumn(col);
      const iconStartX = endX - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
      const iconStartY = computeIconTop(startY, endY, cellHeight, verticalAlign);
      const props = {
        left: iconStartX,
        top: iconStartY,
        height: FILTER_ICON_SIZE,
        width: FILTER_ICON_SIZE,
        zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
        cellHeight,
        cellWidth,
        filterParams: { unitId, subUnitId: worksheetId, col, hasCriteria }
      };
      const buttonShape = this._injector.createInstance(SheetsFilterButtonShape, key, props);
      this._filterButtonShapes.push(buttonShape);
    }
    scene.addObjects(this._filterButtonShapes);
    scene.makeDirty();
  }
  _interceptCellContent(workbookId, worksheetId, range) {
    const { startRow, startColumn, endColumn } = range;
    this._buttonRenderDisposable = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
      effect: 1 /* Style */,
      handler: (cell, pos, next) => {
        const { row, col, unitId, subUnitId } = pos;
        if (unitId !== workbookId || subUnitId !== worksheetId || row !== startRow || col < startColumn || col > endColumn) {
          return next(cell);
        }
        if (!cell || cell === pos.rawData) {
          cell = { ...pos.rawData };
        }
        cell.fontRenderExtension = {
          ...cell == null ? void 0 : cell.fontRenderExtension,
          rightOffset: FILTER_ICON_SIZE
        };
        return next(cell);
      },
      priority: 10
    });
  }
  _disposeRendering() {
    var _a, _b;
    (_a = this._filterRangeShape) == null ? void 0 : _a.dispose();
    this._filterButtonShapes.forEach((s) => s.dispose());
    (_b = this._buttonRenderDisposable) == null ? void 0 : _b.dispose();
    this._filterRangeShape = null;
    this._buttonRenderDisposable = null;
    this._filterButtonShapes = [];
  }
};
SheetsFilterRenderController = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, Inject(SheetSkeletonManagerService)),
  __decorateParam(3, Inject(SheetsFilterService)),
  __decorateParam(4, Inject(ThemeService)),
  __decorateParam(5, Inject(SheetInterceptorService)),
  __decorateParam(6, ICommandService),
  __decorateParam(7, ISheetSelectionRenderService)
], SheetsFilterRenderController);

// ../packages/sheets-filter-ui/src/controllers/sheets-filter-ui-mobile.controller.ts
var SheetsFilterUIMobileController = class extends RxDisposable {
  constructor(_renderManagerService, _sheetsRenderService) {
    super();
    __publicField(this, "_renderManagerService", _renderManagerService);
    __publicField(this, "_sheetsRenderService", _sheetsRenderService);
    [
      SetSheetsFilterRangeMutation,
      SetSheetsFilterCriteriaMutation,
      RemoveSheetsFilterMutation,
      ReCalcSheetsFilterMutation
    ].forEach((m) => this.disposeWithMe(this._sheetsRenderService.registerSkeletonChangingMutations(m.id)));
    this.disposeWithMe(this._renderManagerService.registerRenderModule(
      2 /* UNIVER_SHEET */,
      [SheetsFilterRenderController]
    ));
  }
};
SheetsFilterUIMobileController = __decorateClass([
  __decorateParam(0, IRenderManagerService),
  __decorateParam(1, Inject(SheetsRenderService))
], SheetsFilterUIMobileController);

// ../packages/sheets-filter-ui/src/mobile-plugin.ts
var UniverSheetsFilterMobileUIPlugin = class extends Plugin {
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
    this._configService.setConfig(SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    [
      [SheetsFilterPermissionController],
      [SheetsFilterUIMobileController]
    ].forEach((d) => this._injector.add(d));
  }
  onReady() {
    this._injector.get(SheetsFilterPermissionController);
  }
  onRendered() {
    this._injector.get(SheetsFilterUIMobileController);
  }
};
__publicField(UniverSheetsFilterMobileUIPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsFilterMobileUIPlugin, "pluginName", "SHEET_FILTER_UI_PLUGIN");
__publicField(UniverSheetsFilterMobileUIPlugin, "packageName", package_default3.name);
__publicField(UniverSheetsFilterMobileUIPlugin, "version", package_default3.version);
UniverSheetsFilterMobileUIPlugin = __decorateClass([
  DependentOn(UniverSheetsFilterPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverSheetsFilterMobileUIPlugin);

// ../packages/sheets-filter-ui/src/menu/sheets-filter.menu.ts
function SmartToggleFilterMenuItemFactory(accessor) {
  const sheetsFilterService = accessor.get(SheetsFilterService);
  return {
    id: SmartToggleSheetsFilterCommand.id,
    type: 2 /* BUTTON_SELECTOR */,
    icon: "FilterIcon",
    tooltip: "sheets-filter-ui.toolbar.smart-toggle-filter-tooltip",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    activated$: sheetsFilterService.activeFilterModel$.pipe(map((model) => !!model)),
    disabled$: getObservableWithExclusiveRange$(
      accessor,
      getCurrentRangeDisable$(
        accessor,
        {
          worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
          rangeTypes: [RangeProtectionPermissionViewPoint]
        }
      )
    )
  };
}
function ClearFilterCriteriaMenuItemFactory(accessor) {
  const sheetsFilterService = accessor.get(SheetsFilterService);
  return {
    id: ClearSheetsFilterCriteriaCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-filter-ui.toolbar.clear-filter-criteria",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => {
      var _a;
      return (_a = model == null ? void 0 : model.hasCriteria$.pipe(map((m) => !m))) != null ? _a : of(true);
    }))
  };
}
function ReCalcFilterMenuItemFactory(accessor) {
  const sheetsFilterService = accessor.get(SheetsFilterService);
  return {
    id: ReCalcSheetsFilterCommand.id,
    type: 0 /* BUTTON */,
    title: "sheets-filter-ui.toolbar.re-calc-filter-conditions",
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => {
      var _a;
      return (_a = model == null ? void 0 : model.hasCriteria$.pipe(map((m) => !m))) != null ? _a : of(true);
    }))
  };
}

// ../packages/sheets-filter-ui/src/menu/schema.ts
var menuSchema3 = {
  ["ribbon.data.organization" /* ORGANIZATION */]: {
    [SmartToggleSheetsFilterCommand.id]: {
      order: 2,
      menuItemFactory: SmartToggleFilterMenuItemFactory,
      [ClearSheetsFilterCriteriaCommand.id]: {
        order: 0,
        menuItemFactory: ClearFilterCriteriaMenuItemFactory
      },
      [ReCalcSheetsFilterCommand.id]: {
        order: 1,
        menuItemFactory: ReCalcFilterMenuItemFactory
      }
    }
  }
};

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterPanel.tsx
var import_react24 = __toESM(require_react());

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterByColorsPanel.tsx
var import_react21 = __toESM(require_react());
var import_jsx_runtime25 = __toESM(require_jsx_runtime());
function FilterByColor(props) {
  const { model } = props;
  const localeService = useDependency(LocaleService);
  const cellFillColors = useObservable(model.cellFillColors$, [], true);
  const cellTextColors = useObservable(model.cellTextColors$, [], true);
  const handleSelectCellFillColor = (0, import_react21.useCallback)((color) => {
    model.onFilterCheckToggled(color);
  }, [model]);
  const handleSelectCellTextColor = (0, import_react21.useCallback)((color) => {
    model.onFilterCheckToggled(color, false);
  }, [model]);
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
    "div",
    {
      "data-u-comp": "sheets-filter-panel-colors-container",
      className: "univer-flex univer-h-full univer-min-h-[300px] univer-flex-col",
      children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
        "div",
        {
          "data-u-comp": "sheets-filter-panel",
          className: clsx(`univer-mt-2 univer-box-border univer-flex univer-h-[300px] univer-flex-grow univer-flex-col univer-gap-4 univer-overflow-auto univer-rounded-md univer-px-2 univer-py-2.5`, borderClassName),
          children: [
            cellFillColors.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                "div",
                {
                  className: `univer-mb-2 univer-text-sm univer-text-gray-900 dark:!univer-text-white`,
                  children: localeService.t("sheets-filter-ui.panel.filter-by-cell-fill-color")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                "div",
                {
                  className: `univer-grid univer-grid-cols-8 univer-items-center univer-justify-start univer-gap-2`,
                  children: cellFillColors.map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
                    "div",
                    {
                      className: "univer-relative univer-size-6",
                      onClick: () => handleSelectCellFillColor(color),
                      children: [
                        !color.color ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                          BanIcon,
                          {
                            className: `univer-size-6 univer-cursor-pointer univer-rounded-full hover:univer-ring-2 hover:univer-ring-offset-2 hover:univer-ring-offset-white`
                          }
                        ) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                          "button",
                          {
                            type: "button",
                            className: clsx(`univer-box-border univer-size-6 univer-cursor-pointer univer-rounded-full univer-border univer-border-solid univer-border-transparent univer-bg-gray-300 univer-transition-shadow hover:univer-ring-2 hover:univer-ring-offset-2 hover:univer-ring-offset-white`),
                            style: { backgroundColor: color.color }
                          }
                        ),
                        color.checked && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CheckedIcon, {})
                      ]
                    },
                    `sheets-filter-cell-fill-color-${index}`
                  ))
                }
              )
            ] }),
            cellTextColors.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                "div",
                {
                  className: `univer-mb-2 univer-text-sm univer-text-gray-900 dark:!univer-text-white`,
                  children: localeService.t("sheets-filter-ui.panel.filter-by-cell-text-color")
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                "div",
                {
                  className: `univer-grid univer-grid-cols-8 univer-items-center univer-justify-start univer-gap-2`,
                  children: cellTextColors.map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
                    "div",
                    {
                      className: "univer-relative univer-size-6",
                      onClick: () => handleSelectCellTextColor(color),
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                          "div",
                          {
                            className: `univer-box-border univer-flex univer-size-full univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full univer-border univer-border-solid univer-border-[rgba(13,13,13,0.06)] univer-p-0.5 hover:univer-ring-2 hover:univer-ring-offset-2 hover:univer-ring-offset-white dark:!univer-border-[rgba(255,255,255,0.06)]`,
                            children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(AIcon, { style: { color: color.color } })
                          }
                        ),
                        color.checked && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CheckedIcon, {})
                      ]
                    },
                    `sheets-filter-cell-text-color-${index}`
                  ))
                }
              )
            ] }),
            cellFillColors.length <= 1 && cellTextColors.length <= 1 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
              "div",
              {
                className: `univer-flex univer-size-full univer-items-center univer-justify-center univer-text-sm univer-text-gray-900 dark:!univer-text-gray-200`,
                children: localeService.t("sheets-filter-ui.panel.filter-by-color-none")
              }
            )
          ]
        }
      )
    }
  );
}
function CheckedIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
    "div",
    {
      className: `univer-absolute -univer-bottom-0.5 -univer-right-0.5 univer-flex univer-size-3 univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full univer-bg-white`,
      children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        SuccessIcon,
        {
          className: "univer-size-full univer-font-bold univer-text-[#418F1F]"
        }
      )
    }
  );
}

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterByConditionsPanel.tsx
var import_react22 = __toESM(require_react());
var import_jsx_runtime26 = __toESM(require_jsx_runtime());
function FilterByCondition(props) {
  var _a, _b;
  const { model } = props;
  const localeService = useDependency(LocaleService);
  const condition = useObservable(model.conditionItem$, void 0);
  const formParams = useObservable(model.filterConditionFormParams$, void 0);
  const radioValue = (formParams == null ? void 0 : formParams.and) ? "AND" : "OR";
  const onRadioChange = (0, import_react22.useCallback)((key) => {
    model.onConditionFormChange({ and: key === "AND" });
  }, [model]);
  const primaryOptions = usePrimaryOptions(localeService);
  const onPrimaryConditionChange = (0, import_react22.useCallback)((value) => {
    model.onPrimaryConditionChange(value);
  }, [model]);
  const secondaryOptions = useSecondaryOptions(localeService);
  const onFormParamsChange = (0, import_react22.useCallback)((diffParams) => {
    model.onConditionFormChange(diffParams);
  }, [model]);
  const placeholder = localeService.t("sheets-filter-ui.panel.input-values-placeholder");
  function renderSecondaryCondition(operator, val, name) {
    const shouldRenderInput = FilterConditionItems.getItemByOperator(operator).numOfParameters === 1;
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(import_jsx_runtime26.Fragment, { children: [
      name === "operator2" && /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(RadioGroup, { value: radioValue, onChange: onRadioChange, children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Radio, { value: "AND", children: localeService.t("sheets-filter-ui.panel.and") }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Radio, { value: "OR", children: localeService.t("sheets-filter-ui.panel.or") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
        Select,
        {
          value: operator,
          options: secondaryOptions,
          onChange: (operator2) => onFormParamsChange({ [name]: operator2 })
        }
      ),
      shouldRenderInput && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
        Input,
        {
          className: "univer-mt-2",
          value: val,
          placeholder,
          onChange: (value) => onFormParamsChange({ [name === "operator1" ? "val1" : "val2"]: value })
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
    "div",
    {
      "data-u-comp": "sheets-filter-panel-conditions-container",
      className: "univer-flex univer-h-full univer-min-h-[300px] univer-flex-col",
      children: condition && formParams && /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(import_jsx_runtime26.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Select, { value: condition.operator, options: primaryOptions, onChange: onPrimaryConditionChange }),
        FilterConditionItems.getItemByOperator(condition.operator).numOfParameters !== 0 ? /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(
          "div",
          {
            "data-u-comp": "sheets-filter-panel-conditions-container-inner",
            className: clsx(`univer-mt-2 univer-flex-grow univer-overflow-hidden univer-rounded-md univer-p-2`, borderClassName),
            children: [
              condition.numOfParameters >= 1 && renderSecondaryCondition(formParams.operator1, (_a = formParams.val1) != null ? _a : "", "operator1"),
              condition.numOfParameters >= 2 && renderSecondaryCondition(formParams.operator2, (_b = formParams.val2) != null ? _b : "", "operator2"),
              /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(
                "div",
                {
                  "data-u-comp": "sheets-filter-panel-conditions-desc",
                  className: "univer-mt-2 univer-text-xs univer-text-gray-500",
                  children: [
                    localeService.t("sheets-filter-ui.panel.?"),
                    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("br", {}),
                    localeService.t("sheets-filter-ui.panel.*")
                  ]
                }
              )
            ]
          }
        ) : null
      ] })
    }
  );
}
function usePrimaryOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  return (0, import_react22.useMemo)(() => [
    {
      options: [
        { label: localeService.t(FilterConditionItems.NONE.label), value: FilterConditionItems.NONE.operator }
      ]
    },
    {
      options: [
        { label: localeService.t(FilterConditionItems.EMPTY.label), value: FilterConditionItems.EMPTY.operator },
        { label: localeService.t(FilterConditionItems.NOT_EMPTY.label), value: FilterConditionItems.NOT_EMPTY.operator }
      ]
    },
    {
      options: [
        { label: localeService.t(FilterConditionItems.TEXT_CONTAINS.label), value: FilterConditionItems.TEXT_CONTAINS.operator },
        { label: localeService.t(FilterConditionItems.DOES_NOT_CONTAIN.label), value: FilterConditionItems.DOES_NOT_CONTAIN.operator },
        { label: localeService.t(FilterConditionItems.STARTS_WITH.label), value: FilterConditionItems.STARTS_WITH.operator },
        { label: localeService.t(FilterConditionItems.ENDS_WITH.label), value: FilterConditionItems.ENDS_WITH.operator },
        { label: localeService.t(FilterConditionItems.EQUALS.label), value: FilterConditionItems.EQUALS.operator }
      ]
    },
    {
      options: [
        { label: localeService.t(FilterConditionItems.GREATER_THAN.label), value: FilterConditionItems.GREATER_THAN.operator },
        { label: localeService.t(FilterConditionItems.GREATER_THAN_OR_EQUAL.label), value: FilterConditionItems.GREATER_THAN_OR_EQUAL.operator },
        { label: localeService.t(FilterConditionItems.LESS_THAN.label), value: FilterConditionItems.LESS_THAN.operator },
        { label: localeService.t(FilterConditionItems.LESS_THAN_OR_EQUAL.label), value: FilterConditionItems.LESS_THAN_OR_EQUAL.operator },
        { label: localeService.t(FilterConditionItems.EQUAL.label), value: FilterConditionItems.EQUAL.operator },
        { label: localeService.t(FilterConditionItems.NOT_EQUAL.label), value: FilterConditionItems.NOT_EQUAL.operator },
        { label: localeService.t(FilterConditionItems.BETWEEN.label), value: FilterConditionItems.BETWEEN.operator },
        { label: localeService.t(FilterConditionItems.NOT_BETWEEN.label), value: FilterConditionItems.NOT_BETWEEN.operator }
      ]
    },
    {
      options: [
        { label: localeService.t(FilterConditionItems.CUSTOM.label), value: FilterConditionItems.CUSTOM.operator }
      ]
    }
  ], [locale, localeService]);
}
function useSecondaryOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  return (0, import_react22.useMemo)(() => FilterConditionItems.ALL_CONDITIONS.filter((c) => c.numOfParameters !== 2).map((c) => ({ label: localeService.t(c.label), value: c.operator })), [locale, localeService]);
}

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterByValuesPanel.tsx
var import_react23 = __toESM(require_react());
var import_jsx_runtime27 = __toESM(require_jsx_runtime());
function FilterByValue(props) {
  const { model } = props;
  const localeService = useDependency(LocaleService);
  const searchText = useObservable(model.searchString$, "", true);
  const items = useObservable(model.filterItems$, void 0, true);
  const filterOnly = localeService.t("sheets-filter-ui.panel.filter-only");
  const stat = statisticFilterByValueItems(items);
  const allChecked = stat.checked > 0 && stat.unchecked === 0;
  const indeterminate = stat.checked > 0 && stat.unchecked > 0;
  const treeMap = model.treeMapCache;
  const onCheckAllToggled = (0, import_react23.useCallback)(() => {
    model.onCheckAllToggled(!allChecked);
  }, [model, allChecked]);
  const onSearchValueChange = (0, import_react23.useCallback)((str) => {
    model.setSearchString(str);
  }, [model]);
  function extractCheckedKeys(items2) {
    let checkedKeys = [];
    items2.forEach((item) => {
      if (item.checked) {
        checkedKeys.push(item.key);
      }
      if (item.children) {
        checkedKeys = checkedKeys.concat(extractCheckedKeys(item.children));
      }
    });
    return checkedKeys;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
    "div",
    {
      "data-u-comp": "sheets-filter-panel-values-container",
      className: "univer-flex univer-h-full univer-min-h-[300px] univer-flex-col",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
          Input,
          {
            autoFocus: true,
            value: searchText,
            placeholder: localeService.t("sheets-filter-ui.panel.search-placeholder"),
            onChange: onSearchValueChange
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
          "div",
          {
            "data-u-comp": "sheets-filter-panel",
            className: clsx(`univer-mt-2 univer-box-border univer-flex univer-flex-grow univer-flex-col univer-overflow-hidden univer-rounded-md univer-px-2 univer-py-2.5`, borderClassName),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                "div",
                {
                  "data-u-comp": "sheets-filter-panel-values-item",
                  className: "univer-box-border univer-h-8 univer-w-full univer-py-0.5",
                  children: /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
                    "div",
                    {
                      "data-u-comp": "sheets-filter-panel-values-item-inner",
                      className: `univer-box-border univer-flex univer-h-7 univer-items-center univer-rounded-md univer-py-0 univer-pl-5 univer-pr-0.5 univer-text-sm`,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                          Checkbox,
                          {
                            indeterminate,
                            disabled: items.length === 0,
                            checked: allChecked,
                            onChange: onCheckAllToggled
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                          "span",
                          {
                            "data-u-comp": "sheets-filter-panel-values-item-text",
                            className: `univer-mx-1 univer-inline-block univer-flex-shrink univer-truncate univer-text-gray-900 dark:!univer-text-white`,
                            children: `${localeService.t("sheets-filter-ui.panel.select-all")}`
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                          "span",
                          {
                            "data-u-comp": "sheets-filter-panel-values-item-count",
                            className: `univer-text-gray-400 dark:!univer-text-gray-500`,
                            children: `(${stat.checked}/${stat.checked + stat.unchecked})`
                          }
                        )
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", { "data-u-comp": "sheets-filter-panel-values-virtual", className: "univer-flex-grow", children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                Tree,
                {
                  data: items,
                  defaultExpandAll: false,
                  valueGroup: extractCheckedKeys(items),
                  onChange: (node) => {
                    model.onFilterCheckToggled(node);
                  },
                  defaultCache: treeMap,
                  itemHeight: 28,
                  treeNodeClassName: `
                          univer-pr-2 univer-border-box univer-rounded-md
                          [&:hover_a]:univer-inline-block
                          hover:univer-bg-gray-50 univer-h-full
                          univer-text-gray-900 dark:hover:!univer-bg-gray-900
                          dark:!univer-text-white
                        `,
                  attachRender: (item) => /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
                    "div",
                    {
                      className: `univer-ml-1 univer-flex univer-h-5 univer-flex-1 univer-cursor-pointer univer-items-center univer-justify-between univer-text-sm univer-text-primary-500`,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                          "span",
                          {
                            "data-u-comp": "sheets-filter-panel-values-item-count",
                            className: `univer-text-gray-400 dark:!univer-text-gray-500`,
                            children: `(${item.count})`
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                          "a",
                          {
                            className: `univer-box-border univer-hidden univer-h-4 univer-whitespace-nowrap univer-px-1.5`,
                            onClick: () => {
                              const filterValues = [];
                              if (item.children) {
                                item.children.forEach((child) => {
                                  if (child.children) {
                                    child.children.forEach((subChild) => {
                                      filterValues.push(subChild.key);
                                    });
                                  } else {
                                    filterValues.push(child.key);
                                  }
                                });
                              } else {
                                filterValues.push(item.key);
                              }
                              model.onFilterOnly(filterValues);
                            },
                            children: filterOnly
                          }
                        )
                      ]
                    }
                  )
                }
              ) })
            ]
          }
        )
      ]
    }
  );
}

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterSyncSwitch.tsx
var import_jsx_runtime28 = __toESM(require_jsx_runtime());
function FilterSyncSwitch() {
  const sheetsFilterSyncController = useDependency(SheetsFilterSyncController);
  const visible = useObservable(sheetsFilterSyncController.visible$, void 0, true);
  if (!visible) return null;
  const localeService = useDependency(LocaleService);
  const messageService = useDependency(IMessageService);
  const enabled = useObservable(sheetsFilterSyncController.enabled$, void 0, true);
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(
    "div",
    {
      className: `univer-mt-2 univer-flex univer-items-center univer-justify-between univer-text-sm univer-text-gray-900 dark:!univer-text-gray-200`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "univer-flex univer-items-center univer-gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { children: localeService.t("sheets-filter-ui.sync.title") }),
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
            Tooltip,
            {
              title: enabled ? localeService.t("sheets-filter-ui.sync.statusTips.off") : localeService.t("sheets-filter-ui.sync.statusTips.on"),
              asChild: true,
              children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(InfoIcon, { className: "univer-block" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
          Switch,
          {
            defaultChecked: enabled,
            onChange: (checked) => {
              const message = checked ? localeService.t("sheets-filter-ui.sync.switchTips.on") : localeService.t("sheets-filter-ui.sync.switchTips.off");
              sheetsFilterSyncController.setEnabled(checked);
              messageService.show({
                content: message,
                type: "success" /* Success */,
                duration: 2e3
              });
            }
          }
        )
      ]
    }
  );
}

// ../packages/sheets-filter-ui/src/views/components/SheetsFilterPanel.tsx
var import_jsx_runtime29 = __toESM(require_jsx_runtime());
function FilterPanel() {
  var _a;
  const sheetsFilterPanelService = useDependency(SheetsFilterPanelService);
  const localeService = useDependency(LocaleService);
  const commandService = useDependency(ICommandService);
  const filterBy = useObservable(sheetsFilterPanelService.filterBy$, void 0, true);
  const filterByModel = useObservable(sheetsFilterPanelService.filterByModel$, void 0, false);
  const canApply = useObservable(() => (filterByModel == null ? void 0 : filterByModel.canApply$) || of(false), void 0, false, [filterByModel]);
  const items = useFilterByOptions(localeService);
  const clearFilterDisabled = !useObservable(sheetsFilterPanelService.hasCriteria$);
  const onFilterByTypeChange = (0, import_react24.useCallback)((value) => {
    commandService.executeCommand(ChangeFilterByOperation.id, { filterBy: value });
  }, [commandService]);
  const onClearCriteria = (0, import_react24.useCallback)(async () => {
    await (filterByModel == null ? void 0 : filterByModel.clear());
    commandService.executeCommand(CloseFilterPanelOperation.id);
  }, [filterByModel, commandService]);
  const onCancel = (0, import_react24.useCallback)(() => {
    commandService.executeCommand(CloseFilterPanelOperation.id);
  }, [commandService]);
  const onApply = (0, import_react24.useCallback)(async () => {
    await (filterByModel == null ? void 0 : filterByModel.apply());
    commandService.executeCommand(CloseFilterPanelOperation.id);
  }, [filterByModel, commandService]);
  const filterService = useDependency(SheetsFilterService);
  const range = (_a = filterService.activeFilterModel) == null ? void 0 : _a.getRange();
  const colIndex = sheetsFilterPanelService.col;
  const FilterPanelEmbedPointPart = useComponentsOfPart("filter-panel-embed-point" /* FILTER_PANEL_EMBED_POINT */);
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(
    "div",
    {
      "data-u-comp": "sheets-filter-panel",
      className: `univer-box-border univer-flex univer-max-h-[500px] univer-w-[400px] univer-flex-col univer-rounded-lg univer-bg-white univer-p-4 univer-shadow-lg dark:!univer-border-gray-600 dark:!univer-bg-gray-700`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          ComponentContainer,
          {
            components: FilterPanelEmbedPointPart,
            sharedProps: { range, colIndex, onClose: onCancel }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "univer-mb-1 univer-flex-shrink-0 univer-flex-grow-0", children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          Segmented,
          {
            value: filterBy,
            items,
            onChange: (value) => onFilterByTypeChange(value)
          }
        ) }),
        filterByModel ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          "div",
          {
            "data-u-comp": "sheets-filter-panel-content",
            className: "univer-flex-shrink univer-flex-grow univer-pt-2",
            children: filterBy === 0 /* VALUES */ ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FilterByValue, { model: filterByModel }) : filterBy === 1 /* COLORS */ ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FilterByColor, { model: filterByModel }) : /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FilterByCondition, { model: filterByModel })
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "univer-flex-1" }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FilterSyncSwitch, {}),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(
          "div",
          {
            "data-u-comp": "sheets-filter-panel-footer",
            className: `univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-nowrap univer-justify-between univer-overflow-hidden`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Button, { variant: "link", onClick: onClearCriteria, disabled: clearFilterDisabled, children: localeService.t("sheets-filter-ui.panel.clear-filter") }),
              /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("span", { className: "univer-flex univer-gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Button, { variant: "default", onClick: onCancel, children: localeService.t("sheets-filter-ui.panel.cancel") }),
                /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Button, { disabled: !canApply, variant: "primary", onClick: onApply, children: localeService.t("sheets-filter-ui.panel.confirm") })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function useFilterByOptions(localeService) {
  const locale = localeService.getCurrentLocale();
  return (0, import_react24.useMemo)(() => [
    { label: localeService.t("sheets-filter-ui.panel.by-values"), value: 0 /* VALUES */ },
    { label: localeService.t("sheets-filter-ui.panel.by-colors"), value: 1 /* COLORS */ },
    { label: localeService.t("sheets-filter-ui.panel.by-conditions"), value: 2 /* CONDITIONS */ }
  ], [locale, localeService]);
}

// ../packages/sheets-filter-ui/src/controllers/sheets-filter.shortcut.ts
var SmartToggleFilterShortcut = {
  id: SmartToggleSheetsFilterCommand.id,
  binding: 76 /* L */ | 4096 /* CTRL_COMMAND */ | 1024 /* SHIFT */,
  description: "sheets-filter-ui.shortcut.smart-toggle-filter",
  preconditions: whenSheetEditorFocused,
  group: "4_sheet-edit",
  groupTitle: "sheets-ui.shortcut.sheet-edit"
};

// ../packages/sheets-filter-ui/src/controllers/sheets-filter-ui-desktop.controller.ts
var FILTER_PANEL_POPUP_KEY = "FILTER_PANEL_POPUP";
var SheetsFilterUIDesktopController = class extends SheetsFilterUIMobileController {
  constructor(_injector, _componentManager, _sheetsFilterPanelService, _sheetCanvasPopupService, _sheetsFilterService, _localeService, _shortcutService, _commandService, _menuManagerService, _contextService, _messageService, sheetsRenderService, renderManagerService) {
    super(renderManagerService, sheetsRenderService);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_sheetsFilterPanelService", _sheetsFilterPanelService);
    __publicField(this, "_sheetCanvasPopupService", _sheetCanvasPopupService);
    __publicField(this, "_sheetsFilterService", _sheetsFilterService);
    __publicField(this, "_localeService", _localeService);
    __publicField(this, "_shortcutService", _shortcutService);
    __publicField(this, "_commandService", _commandService);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_contextService", _contextService);
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_popupDisposable");
    this._initCommands();
    this._initShortcuts();
    this._initMenuItems();
    this._initUI();
  }
  dispose() {
    super.dispose();
    this._closeFilterPopup();
  }
  _initShortcuts() {
    [
      SmartToggleFilterShortcut
    ].forEach((shortcut) => {
      this.disposeWithMe(this._shortcutService.registerShortcut(shortcut));
    });
  }
  _initCommands() {
    [
      SmartToggleSheetsFilterCommand,
      ChangeFilterByOperation,
      OpenFilterPanelOperation,
      CloseFilterPanelOperation
    ].forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }
  _initMenuItems() {
    this._menuManagerService.mergeMenu(menuSchema3);
  }
  _initUI() {
    [
      [FILTER_PANEL_POPUP_KEY, FilterPanel],
      ["FilterIcon", FilterIcon]
    ].forEach(([key, comp]) => {
      this.disposeWithMe(
        this._componentManager.register(key, comp)
      );
    });
    this.disposeWithMe(this._contextService.subscribeContextValue$(FILTER_PANEL_OPENED_KEY).pipe(distinctUntilChanged()).subscribe((open) => {
      if (open) {
        this._openFilterPopup();
      } else {
        this._closeFilterPopup();
      }
    }));
    this.disposeWithMe(this._sheetsFilterService.errorMsg$.subscribe((content) => {
      if (content) {
        this._messageService.show({
          type: "error" /* Error */,
          content: this._localeService.t(content)
        });
      }
    }));
  }
  _openFilterPopup() {
    const currentFilterModel = this._sheetsFilterPanelService.filterModel;
    if (!currentFilterModel) {
      throw new Error("[SheetsFilterUIController]: no filter model when opening filter popup!");
    }
    const range = currentFilterModel.getRange();
    const col = this._sheetsFilterPanelService.col;
    const { startRow } = range;
    this._popupDisposable = this._sheetCanvasPopupService.attachPopupToCell(startRow, col, {
      componentKey: FILTER_PANEL_POPUP_KEY,
      direction: "horizontal",
      onClickOutside: () => this._commandService.syncExecuteCommand(CloseFilterPanelOperation.id),
      offset: [5, 0]
    });
  }
  _closeFilterPopup() {
    var _a;
    (_a = this._popupDisposable) == null ? void 0 : _a.dispose();
    this._popupDisposable = null;
  }
};
SheetsFilterUIDesktopController = __decorateClass([
  __decorateParam(0, Inject(Injector)),
  __decorateParam(1, Inject(ComponentManager)),
  __decorateParam(2, Inject(SheetsFilterPanelService)),
  __decorateParam(3, Inject(SheetCanvasPopManagerService)),
  __decorateParam(4, Inject(SheetsFilterService)),
  __decorateParam(5, Inject(LocaleService)),
  __decorateParam(6, IShortcutService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IMenuManagerService),
  __decorateParam(9, IContextService),
  __decorateParam(10, IMessageService),
  __decorateParam(11, Inject(SheetsRenderService)),
  __decorateParam(12, IRenderManagerService)
], SheetsFilterUIDesktopController);

// ../packages/sheets-filter-ui/src/plugin.ts
var UniverSheetsFilterUIPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig3, _injector, _configService, _rpcChannelService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_rpcChannelService", _rpcChannelService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig3,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(SHEETS_FILTER_UI_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    registerDependencies(this._injector, [
      [SheetsFilterPanelService],
      [SheetsFilterPermissionController],
      [SheetsFilterUIDesktopController]
    ]);
    if (this._config.useRemoteFilterValuesGenerator && this._rpcChannelService) {
      this._injector.add([ISheetsGenerateFilterValuesService, {
        useFactory: () => toModule(
          this._rpcChannelService.requestChannel(SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME)
        )
      }]);
    }
  }
  onReady() {
    touchDependencies(this._injector, [
      [SheetsFilterPermissionController]
    ]);
  }
  onRendered() {
    touchDependencies(this._injector, [
      [SheetsFilterUIDesktopController]
    ]);
  }
};
__publicField(UniverSheetsFilterUIPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsFilterUIPlugin, "pluginName", "SHEET_FILTER_UI_PLUGIN");
__publicField(UniverSheetsFilterUIPlugin, "packageName", package_default3.name);
__publicField(UniverSheetsFilterUIPlugin, "version", package_default3.version);
UniverSheetsFilterUIPlugin = __decorateClass([
  DependentOn(UniverSheetsFilterPlugin),
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService),
  __decorateParam(3, Optional(IRPCChannelService))
], UniverSheetsFilterUIPlugin);

// ../packages/sheets-filter-ui/src/worker/plugin.ts
var UniverSheetsFilterUIWorkerPlugin = class extends Plugin {
  constructor(_config, _injector, _rpcChannelService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_rpcChannelService", _rpcChannelService);
  }
  onStarting() {
    [
      [ISheetsGenerateFilterValuesService, { useClass: SheetsGenerateFilterValuesService }]
    ].forEach((d) => this._injector.add(d));
  }
  onReady() {
    this._rpcChannelService.registerChannel(
      SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME,
      fromModule(this._injector.get(ISheetsGenerateFilterValuesService))
    );
  }
};
__publicField(UniverSheetsFilterUIWorkerPlugin, "type", 2 /* UNIVER_SHEET */);
__publicField(UniverSheetsFilterUIWorkerPlugin, "pluginName", "SHEET_FILTER_UI_WORKER_PLUGIN");
__publicField(UniverSheetsFilterUIWorkerPlugin, "packageName", package_default3.name);
__publicField(UniverSheetsFilterUIWorkerPlugin, "version", package_default3.version);
UniverSheetsFilterUIWorkerPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IRPCChannelService)
], UniverSheetsFilterUIWorkerPlugin);

export {
  UniverSheetsConditionalFormattingMobileUIPlugin,
  UniverSheetsConditionalFormattingUIPlugin,
  UniverSheetsDataValidationMobileUIPlugin,
  UniverSheetsDataValidationUIPlugin,
  UniverSheetsFilterMobileUIPlugin,
  UniverSheetsFilterUIPlugin
};
