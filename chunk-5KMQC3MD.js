import {
  RemoveSheetFilterCommand,
  SetSheetFilterRangeCommand,
  SetSheetsFilterCriteriaCommand
} from "./chunk-ESCGSVMK.js";
import {
  SetRangeBoldCommand,
  SetRangeFontFamilyCommand,
  SetRangeFontSizeCommand,
  SetRangeItalicCommand,
  SetRangeStrickThroughCommand,
  SetRangeSubscriptCommand,
  SetRangeSuperscriptCommand,
  SetRangeTextColorCommand,
  SetRangeUnderlineCommand,
  SheetCopyCommand,
  SheetCutCommand,
  SheetPasteBesidesBorderCommand,
  SheetPasteColWidthCommand,
  SheetPasteCommand,
  SheetPasteFormatCommand,
  SheetPasteShortKeyCommand,
  SheetPasteValueCommand
} from "./chunk-BHQGV2VJ.js";
import {
  Button,
  ComponentManager,
  ILocalFileService,
  IMenuManagerService,
  IMessageService,
  IUIPartsService,
  RecordIcon,
  connectInjector,
  require_jsx_runtime,
  require_react,
  useDependency,
  useObservable
} from "./chunk-VNXQUZSG.js";
import {
  AddWorksheetMergeAllCommand,
  AddWorksheetMergeCommand,
  AddWorksheetMergeHorizontalCommand,
  AddWorksheetMergeVerticalCommand,
  AutoFillCommand,
  CancelFrozenCommand,
  CopySheetCommand,
  DeleteRangeMoveLeftCommand,
  DeleteRangeMoveUpCommand,
  DeltaColumnWidthCommand,
  DeltaRowHeightCommand,
  InsertColAfterCommand,
  InsertColBeforeCommand,
  InsertRowAfterCommand,
  InsertRowBeforeCommand,
  InsertSheetCommand,
  RefillCommand,
  RemoveSheetCommand,
  SetFrozenCommand,
  SetHorizontalTextAlignCommand,
  SetOverlineCommand,
  SetRangeValuesCommand,
  SetSelectionsOperation,
  SetStrikeThroughCommand,
  SetStyleCommand,
  SetTextColorCommand,
  SetTextRotationCommand,
  SetTextWrapCommand,
  SetVerticalTextAlignCommand,
  SetWorksheetActivateCommand,
  SetWorksheetActiveOperation
} from "./chunk-Q6Y4PHRI.js";
import {
  BehaviorSubject,
  Disposable,
  ICommandService,
  IConfigService,
  ILogService,
  IUniverInstanceService,
  Inject,
  Injector,
  Plugin,
  awaitTime,
  merge_default
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/action-recorder/package.json
var package_default = {
  name: "@univerjs/action-recorder",
  version: "0.25.2",
  private: false,
  description: "Record and replay user actions in Univer.",
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
    "action-recorder",
    "replay",
    "automation",
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
    "@univerjs/icons": "1.4.0",
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-filter": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    react: "18.3.1",
    rxjs: "^7.8.2",
    tailwindcss: "3.4.18",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/action-recorder/src/config/config.ts
var ACTION_RECORDER_PLUGIN_CONFIG_KEY = "action-recorder.config";
var configSymbol = Symbol(ACTION_RECORDER_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/action-recorder/src/services/action-recorder.service.ts
var ActionRecorderService = class extends Disposable {
  constructor(_commandSrv, _logService, _localFileService, _instanceService) {
    super();
    __publicField(this, "_commandSrv", _commandSrv);
    __publicField(this, "_logService", _logService);
    __publicField(this, "_localFileService", _localFileService);
    __publicField(this, "_instanceService", _instanceService);
    __publicField(this, "_shouldRecordCommands", /* @__PURE__ */ new Set());
    __publicField(this, "_panelOpened$", new BehaviorSubject(false));
    __publicField(this, "panelOpened$", this._panelOpened$.asObservable());
    __publicField(this, "_recorder", null);
    __publicField(this, "_recording$", new BehaviorSubject(false));
    __publicField(this, "recording$", this._recording$.asObservable());
    __publicField(this, "_recorded$", new BehaviorSubject([]));
    __publicField(this, "_recordedCommands$", new BehaviorSubject([]));
    __publicField(this, "recordedCommands$", this._recordedCommands$.asObservable());
  }
  get recording() {
    return this._recording$.getValue();
  }
  get _recorded() {
    return this._recorded$.getValue();
  }
  get _recordedCommands() {
    return this._recordedCommands$.getValue();
  }
  registerRecordedCommand(command) {
    if (command.type === 2 /* MUTATION */) throw new Error("[CommandRecorderService] Cannot record mutation commands.");
    this._shouldRecordCommands.add(command.id);
  }
  togglePanel(visible) {
    this._panelOpened$.next(visible);
    if (visible === false) this.stopRecording();
  }
  startRecording(replaceId = false) {
    this._recorder = this._commandSrv.onCommandExecuted((rawCommandInfo) => {
      var _a, _b;
      if (this._shouldRecordCommands.has(rawCommandInfo.id)) {
        const recorded = this._recorded;
        const commands = this._recordedCommands;
        let commandInfo = { ...rawCommandInfo };
        const focusUnitId = (_a = this._instanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
        const { unitId = focusUnitId, subUnitId } = commandInfo == null ? void 0 : commandInfo.params;
        if (replaceId && unitId && subUnitId) {
          const subUnitName = (_b = this._instanceService.getUnit(unitId).getSheetBySheetId(subUnitId)) == null ? void 0 : _b.getName();
          commandInfo = {
            ...commandInfo,
            params: {
              ...commandInfo.params,
              subUnitId: subUnitName
            }
          };
        }
        if (commandInfo.id === SetSelectionsOperation.id && recorded.length > 0 && recorded[recorded.length - 1].id === SetSelectionsOperation.id) {
          recorded[recorded.length - 1] = commandInfo;
        } else {
          recorded.push(commandInfo);
          this._recorded$.next(recorded);
          if (commandInfo.type === 0 /* COMMAND */) {
            commands.push(commandInfo);
            this._recordedCommands$.next(commands);
          }
        }
      }
    });
    this._recording$.next(true);
  }
  stopRecording() {
    var _a;
    (_a = this._recorder) == null ? void 0 : _a.dispose();
    this._recorder = null;
    this._recorded$.next([]);
    this._recordedCommands$.next([]);
    this._recording$.next(false);
  }
  completeRecording() {
    const commands = this._recorded.slice();
    this._localFileService.downloadFile(new Blob([JSON.stringify(commands, null, 2)]), "recorded-commands.json");
    this._logService.error("Recorded commands:", commands);
    this.stopRecording();
  }
};
ActionRecorderService = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILocalFileService),
  __decorateParam(3, IUniverInstanceService)
], ActionRecorderService);

// ../packages/action-recorder/src/commands/commands/record.command.ts
var StartRecordingActionCommand = {
  id: "action-recorder.command.start-recording",
  type: 0 /* COMMAND */,
  handler: (accessor, params) => {
    const actionRecorderService = accessor.get(ActionRecorderService);
    actionRecorderService.startRecording(!!(params == null ? void 0 : params.replaceId));
    return true;
  }
};
var CompleteRecordingActionCommand = {
  id: "action-recorder.command.complete-recording",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const actionRecorderService = accessor.get(ActionRecorderService);
    actionRecorderService.completeRecording();
    return true;
  }
};
var StopRecordingActionCommand = {
  id: "action-recorder.command.stop-recording",
  type: 0 /* COMMAND */,
  handler: (accessor) => {
    const actionRecorderService = accessor.get(ActionRecorderService);
    actionRecorderService.completeRecording();
    return true;
  }
};

// ../packages/action-recorder/src/services/replay.service.ts
var ActionReplayService = class extends Disposable {
  constructor(_messageService, _instanceService, _localFileService, _logService, _commandService) {
    super();
    __publicField(this, "_messageService", _messageService);
    __publicField(this, "_instanceService", _instanceService);
    __publicField(this, "_localFileService", _localFileService);
    __publicField(this, "_logService", _logService);
    __publicField(this, "_commandService", _commandService);
  }
  /**
   * Read a local file and try to replay commands in this JSON.
   */
  async replayLocalJSON(mode = "default" /* DEFAULT */) {
    const files = await this._localFileService.openFile({ multiple: false, accept: ".json" });
    if (files.length !== 1) return false;
    const file = files[0];
    try {
      return this.replayCommands(JSON.parse(await file.text()), { mode });
    } catch {
      this._messageService.show({
        type: "error" /* Error */,
        content: `Failed to replay commands from local file ${file.name}.`
      });
      return false;
    }
  }
  /**
   * Replay a list of commands. Note that `unitId` of these commands would be changed to the focused unit.
   * @param commands - The commands to replay.
   * @returns If the replay is successful.
   */
  async replayCommands(commands, options) {
    var _a, _b, _c;
    const focusedUnitId = (_a = this._instanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    if (!focusedUnitId) {
      this._logService.error("[ReplayService]", "no focused unit to replay commands");
    }
    const { mode } = options || {};
    for (const command of commands) {
      const { id, params } = command;
      const commandParams = params;
      if (commandParams) {
        if (typeof commandParams.unitId !== "undefined") {
          commandParams.unitId = focusedUnitId;
        }
        if (mode === "name" /* NAME */ && commandParams.subUnitId !== "undefined") {
          const realSubUnitId = (_b = this._instanceService.getFocusedUnit().getSheetBySheetName(commandParams.subUnitId)) == null ? void 0 : _b.getSheetId();
          if (realSubUnitId) {
            commandParams.subUnitId = realSubUnitId;
          } else {
            this._logService.error("[ReplayService]", `failed to find subunit by subUnitName = ${commandParams.subUnitId}`);
          }
        }
        if (mode === "active" /* ACTIVE */ && commandParams.subUnitId !== "undefined") {
          const realSubUnitId = (_c = this._instanceService.getFocusedUnit().getActiveSheet()) == null ? void 0 : _c.getSheetId();
          if (realSubUnitId) {
            commandParams.subUnitId = realSubUnitId;
          } else {
            this._logService.error("[ReplayService]", "failed to find active subunit");
          }
        }
        const result = await this._commandService.executeCommand(id, params);
        if (!result) return false;
      } else {
        const result = await this._commandService.executeCommand(id);
        if (!result) return false;
      }
    }
    return true;
  }
  /**
   * Replay a list of commands with a random delay between each command.
   * @param commands - The commands to replay.
   */
  async replayCommandsWithDelay(commands) {
    var _a;
    const focusedUnitId = (_a = this._instanceService.getFocusedUnit()) == null ? void 0 : _a.getUnitId();
    if (!focusedUnitId) {
      this._logService.error("[ReplayService]", "no focused unit to replay commands");
    }
    for (const command of commands) {
      await awaitTime(randomBetween200And1k());
      const { id, params } = command;
      if (params) {
        if (typeof params.unitId !== "undefined") {
          params.unitId = focusedUnitId;
        }
        const result = await this._commandService.executeCommand(id, params);
        if (!result) return false;
      } else {
        const result = await this._commandService.executeCommand(id);
        if (!result) return false;
      }
    }
    return true;
  }
};
ActionReplayService = __decorateClass([
  __decorateParam(0, IMessageService),
  __decorateParam(1, IUniverInstanceService),
  __decorateParam(2, ILocalFileService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ICommandService)
], ActionReplayService);
function randomBetween200And1k() {
  return Math.floor(Math.random() * 800) + 200;
}

// ../packages/action-recorder/src/commands/commands/replay.command.ts
var ReplayLocalRecordCommand = {
  id: "action-recorder.command.replay-local-records",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const replayService = accessor.get(ActionReplayService);
    const result = await replayService.replayLocalJSON();
    if (result) {
      const messageService = accessor.get(IMessageService);
      messageService.show({
        type: "success" /* Success */,
        content: "Successfully replayed local records"
      });
    }
    return result;
  }
};
var ReplayLocalRecordOnNamesakeCommand = {
  id: "action-recorder.command.replay-local-records-name",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const replayService = accessor.get(ActionReplayService);
    const result = await replayService.replayLocalJSON("name" /* NAME */);
    if (result) {
      const messageService = accessor.get(IMessageService);
      messageService.show({
        type: "success" /* Success */,
        content: "Successfully replayed local records"
      });
    }
    return result;
  }
};
var ReplayLocalRecordOnActiveCommand = {
  id: "action-recorder.command.replay-local-records-active",
  type: 0 /* COMMAND */,
  handler: async (accessor) => {
    const replayService = accessor.get(ActionReplayService);
    const result = await replayService.replayLocalJSON("active" /* ACTIVE */);
    if (result) {
      const messageService = accessor.get(IMessageService);
      messageService.show({
        type: "success" /* Success */,
        content: "Successfully replayed local records"
      });
    }
    return result;
  }
};

// ../packages/action-recorder/src/commands/operations/operation.ts
var OpenRecordPanelOperation = {
  id: "action-recorder.operation.open-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const s = accessor.get(ActionRecorderService);
    s.togglePanel(true);
    return true;
  }
};
var CloseRecordPanelOperation = {
  id: "action-recorder.operation.close-panel",
  type: 1 /* OPERATION */,
  handler(accessor) {
    const s = accessor.get(ActionRecorderService);
    s.togglePanel(false);
    return true;
  }
};

// ../packages/action-recorder/src/menu/action-recorder.menu.ts
var RECORD_MENU_ITEM_ID = "RECORD_MENU_ITEM";
function RecordMenuItemFactory() {
  return {
    id: RECORD_MENU_ITEM_ID,
    type: 3 /* SUBITEMS */,
    icon: "RecordIcon",
    tooltip: "action-recorder.menu.title"
  };
}
function OpenRecorderMenuItemFactory(accessor) {
  const actionRecorderService = accessor.get(ActionRecorderService);
  return {
    id: OpenRecordPanelOperation.id,
    title: "action-recorder.menu.record",
    type: 0 /* BUTTON */,
    disabled$: actionRecorderService.panelOpened$
  };
}
function ReplayLocalRecordMenuItemFactory() {
  return {
    id: ReplayLocalRecordCommand.id,
    title: "action-recorder.menu.replay-local",
    type: 0 /* BUTTON */
  };
}
function ReplayLocalRecordOnNamesakeMenuItemFactory() {
  return {
    id: ReplayLocalRecordOnNamesakeCommand.id,
    title: "action-recorder.menu.replay-local-name",
    type: 0 /* BUTTON */
  };
}
function ReplayLocalRecordOnActiveMenuItemFactory() {
  return {
    id: ReplayLocalRecordOnActiveCommand.id,
    title: "action-recorder.menu.replay-local-active",
    type: 0 /* BUTTON */
  };
}
var menuSchema = {
  ["ribbon.others.others" /* OTHERS */]: {
    [RECORD_MENU_ITEM_ID]: {
      order: 1,
      menuItemFactory: RecordMenuItemFactory,
      [OpenRecordPanelOperation.id]: {
        order: 1,
        menuItemFactory: OpenRecorderMenuItemFactory
      },
      [ReplayLocalRecordCommand.id]: {
        order: 2,
        menuItemFactory: ReplayLocalRecordMenuItemFactory
      },
      [ReplayLocalRecordOnNamesakeCommand.id]: {
        order: 3,
        menuItemFactory: ReplayLocalRecordOnNamesakeMenuItemFactory
      },
      [ReplayLocalRecordOnActiveCommand.id]: {
        order: 4,
        menuItemFactory: ReplayLocalRecordOnActiveMenuItemFactory
      }
    }
  }
};

// ../packages/action-recorder/src/views/components/RecorderPanel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
function RecorderPanel() {
  const s = useDependency(ActionRecorderService);
  const opened = useObservable(s.panelOpened$);
  if (!opened) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordPanelImpl, {});
}
function RecordPanelImpl() {
  var _a;
  const commandService = useDependency(ICommandService);
  const actionRecorderService = useDependency(ActionRecorderService);
  const recording = useObservable(actionRecorderService.recording$);
  const recordedCommands = useObservable(actionRecorderService.recordedCommands$);
  const len = (_a = recordedCommands == null ? void 0 : recordedCommands.length) != null ? _a : 0;
  const closePanel = (0, import_react.useCallback)(() => {
    if (!recording) commandService.executeCommand(CloseRecordPanelOperation.id);
  }, [commandService, recording]);
  const startRecording = (0, import_react.useCallback)((replaceId) => {
    if (!recording) commandService.executeCommand(StartRecordingActionCommand.id, { replaceId });
  }, [commandService, recording]);
  const completeRecording = (0, import_react.useCallback)(() => {
    if (recording) commandService.executeCommand(CompleteRecordingActionCommand.id);
  }, [commandService, recording]);
  const stopRecording = (0, import_react.useCallback)(() => {
    if (recording) commandService.executeCommand(StopRecordingActionCommand.id);
  }, [commandService, recording]);
  const titleText = recording ? len === 0 ? "Recording..." : `${len}: ${recordedCommands[len - 1].id}` : "Start Recording";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: `univer-fixed univer-bottom-20 univer-left-1/2 univer-z-[1000] univer-flex univer-h-16 univer-w-[512px] -univer-translate-x-1/2 univer-items-center univer-rounded-lg univer-bg-white univer-px-5 univer-shadow-lg`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mr-2 univer-size-5 univer-shrink-0 univer-grow-0 univer-text-xl", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordIcon, {}) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-flex-1 univer-text-sm", children: titleText }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-flex univer-w-64 univer-shrink-0 univer-grow-0 univer-justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Button,
            {
              className: "univer-w-20",
              onClick: recording ? stopRecording : closePanel,
              children: recording ? "Cancel" : "Close"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Button,
            {
              className: "univer-w-20",
              variant: "primary",
              onClick: recording ? completeRecording : () => startRecording(),
              children: recording ? "Save" : "Start"
            }
          ),
          !recording && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { variant: "primary", onClick: () => startRecording(true), children: "Start(N)" })
        ] })
      ]
    }
  );
}

// ../packages/action-recorder/src/controllers/action-recorder.controller.ts
var ActionRecorderController = class extends Disposable {
  constructor(_commandSrv, _uiPartsSrv, _menuManagerService, _componentManager, _actionRecorderService, _injector) {
    super();
    __publicField(this, "_commandSrv", _commandSrv);
    __publicField(this, "_uiPartsSrv", _uiPartsSrv);
    __publicField(this, "_menuManagerService", _menuManagerService);
    __publicField(this, "_componentManager", _componentManager);
    __publicField(this, "_actionRecorderService", _actionRecorderService);
    __publicField(this, "_injector", _injector);
    this._initCommands();
    this._initUI();
    this._initSheetsCommands();
    this._initDocsCommands();
  }
  _initCommands() {
    [
      StartRecordingActionCommand,
      StopRecordingActionCommand,
      CompleteRecordingActionCommand,
      OpenRecordPanelOperation,
      CloseRecordPanelOperation,
      ReplayLocalRecordCommand,
      ReplayLocalRecordOnNamesakeCommand,
      ReplayLocalRecordOnActiveCommand
    ].forEach((command) => this._commandSrv.registerCommand(command));
  }
  _initUI() {
    this._uiPartsSrv.registerComponent("global" /* GLOBAL */, () => connectInjector(RecorderPanel, this._injector));
    this.disposeWithMe(
      this._componentManager.register("RecordIcon", RecordIcon)
    );
    this._menuManagerService.mergeMenu(menuSchema);
  }
  _initSheetsCommands() {
    [
      // InsertColCommand,
      // InsertRowCommand,
      // #region basic commands
      CopySheetCommand,
      DeleteRangeMoveLeftCommand,
      DeleteRangeMoveUpCommand,
      DeltaColumnWidthCommand,
      DeltaRowHeightCommand,
      InsertSheetCommand,
      InsertColAfterCommand,
      InsertColBeforeCommand,
      InsertRowAfterCommand,
      InsertRowBeforeCommand,
      RemoveSheetCommand,
      SetStyleCommand,
      AddWorksheetMergeCommand,
      AddWorksheetMergeAllCommand,
      AddWorksheetMergeVerticalCommand,
      AddWorksheetMergeHorizontalCommand,
      // ResetBackgroundColorCommand,
      // ResetTextColorCommand,
      // SetBackgroundColorCommand,
      // SetBoldCommand,
      // SetFontFamilyCommand,
      // SetFontSizeCommand,
      SetFrozenCommand,
      CancelFrozenCommand,
      SetHorizontalTextAlignCommand,
      // SetItalicCommand,
      SetOverlineCommand,
      SetRangeBoldCommand,
      SetRangeFontFamilyCommand,
      SetRangeFontSizeCommand,
      SetRangeItalicCommand,
      SetRangeStrickThroughCommand,
      SetRangeSubscriptCommand,
      SetRangeSuperscriptCommand,
      SetRangeTextColorCommand,
      SetRangeUnderlineCommand,
      SetRangeValuesCommand,
      SetStrikeThroughCommand,
      SetTextColorCommand,
      SetTextRotationCommand,
      SetTextWrapCommand,
      // SetUnderlineCommand,
      SetVerticalTextAlignCommand,
      SheetCopyCommand,
      SheetCutCommand,
      SheetPasteBesidesBorderCommand,
      SheetPasteColWidthCommand,
      SheetPasteCommand,
      SheetPasteFormatCommand,
      SheetPasteShortKeyCommand,
      SheetPasteValueCommand,
      AutoFillCommand,
      RefillCommand,
      SetWorksheetActivateCommand,
      SetWorksheetActiveOperation,
      SetSelectionsOperation,
      // #endregion
      // #region data validation command
      // #endregion
      // #region conditional formatting command
      // #endregion
      // #region filter command
      SetSheetFilterRangeCommand,
      SetSheetsFilterCriteriaCommand,
      RemoveSheetFilterCommand
      // #endregion
    ].forEach((command) => this._actionRecorderService.registerRecordedCommand(command));
  }
  _initDocsCommands() {
  }
};
ActionRecorderController = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IUIPartsService),
  __decorateParam(2, IMenuManagerService),
  __decorateParam(3, Inject(ComponentManager)),
  __decorateParam(4, Inject(ActionRecorderService)),
  __decorateParam(5, Inject(Injector))
], ActionRecorderController);

// ../packages/action-recorder/src/plugin.ts
var UniverActionRecorderPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    const { menu, ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    if (menu) {
      this._configService.setConfig("menu", menu, { merge: true });
    }
    this._configService.setConfig(ACTION_RECORDER_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const dependency = this._config.replayOnly ? [[ActionReplayService]] : [
      [ActionRecorderService],
      [ActionReplayService],
      [ActionRecorderController]
    ];
    dependency.forEach((d) => this._injector.add(d));
  }
  onSteady() {
    if (this._config.replayOnly) {
      return;
    }
    this._injector.get(ActionRecorderController);
  }
};
__publicField(UniverActionRecorderPlugin, "pluginName", "UNIVER_ACTION_RECORDER_PLUGIN");
__publicField(UniverActionRecorderPlugin, "packageName", package_default.name);
__publicField(UniverActionRecorderPlugin, "version", package_default.version);
UniverActionRecorderPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverActionRecorderPlugin);

export {
  UniverActionRecorderPlugin
};
