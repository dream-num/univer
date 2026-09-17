import {
  monaco_contribution_exports
} from "./chunk-GCGI23F5.js";
import {
  Emitter,
  MarkerSeverity,
  MarkerTag,
  editor,
  editor_api2_exports,
  languages
} from "./chunk-CLMLYKFF.js";
import {
  FUniver
} from "./chunk-2WA7JL2E.js";
import {
  getCurrentRangeDisable$
} from "./chunk-BHQGV2VJ.js";
import {
  Button,
  ComponentManager,
  IMenuManagerService,
  IMessageService,
  IShortcutService,
  ISidebarService,
  getMenuHiddenObservable,
  require_jsx_runtime,
  require_react,
  useDependency
} from "./chunk-VNXQUZSG.js";
import {
  RangeProtectionPermissionEditPoint,
  WorkbookEditablePermission,
  WorksheetEditPermission,
  WorksheetSetCellStylePermission,
  WorksheetSetCellValuePermission
} from "./chunk-Q6Y4PHRI.js";
import {
  BehaviorSubject,
  Disposable,
  DisposableCollection,
  ICommandService,
  IConfigService,
  ILogService,
  Inject,
  Injector,
  LocaleService,
  Plugin,
  ThemeService,
  createIdentifier,
  distinctUntilChanged,
  merge_default,
  toDisposable
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __export,
  __publicField,
  __toESM
} from "./chunk-24OICD5T.js";

// ../packages/uniscript/package.json
var package_default = {
  name: "@univerjs/uniscript",
  version: "0.25.2",
  private: false,
  description: "Monaco-based scripting editor for operating Univer through Facade APIs.",
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
    "uniscript",
    "scripting",
    "monaco-editor",
    "automation"
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
    "@univerjs/sheets": "workspace:*",
    "@univerjs/sheets-ui": "workspace:*",
    "@univerjs/ui": "workspace:*",
    "monaco-editor": "0.55.1"
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

// ../packages/uniscript/src/config/config.ts
var UNISCRIPT_PLUGIN_CONFIG_KEY = "uniscript.config";
var configSymbol = Symbol(UNISCRIPT_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/uniscript/src/services/script-panel.service.ts
var ScriptPanelService = class extends Disposable {
  constructor() {
    super(...arguments);
    __publicField(this, "_open$", new BehaviorSubject(false));
    __publicField(this, "open$", this._open$.pipe(distinctUntilChanged()));
  }
  get isOpen() {
    return this._open$.getValue();
  }
  dispose() {
    super.dispose();
    this._open$.next(false);
    this._open$.complete();
  }
  open() {
    this._open$.next(true);
  }
  close() {
    this._open$.next(false);
  }
};

// ../packages/uniscript/src/commands/operations/panel.operation.ts
var ScriptPanelComponentName = "ScriptPanel";
var ToggleScriptPanelOperation = {
  type: 1 /* OPERATION */,
  id: "univer.operation.toggle-script-panel",
  handler: (accessor) => {
    const scriptPanelService = accessor.get(ScriptPanelService);
    const sidebarService = accessor.get(ISidebarService);
    const isOpen = scriptPanelService.isOpen;
    if (isOpen) {
      scriptPanelService.close();
      sidebarService.close();
    } else {
      scriptPanelService.open();
      sidebarService.open({
        header: { title: "uniscript.title" },
        children: { label: ScriptPanelComponentName },
        width: 600
      });
    }
    return true;
  }
};

// ../packages/uniscript/src/menu/menu.ts
function UniscriptMenuItemFactory(accessor) {
  return {
    id: ToggleScriptPanelOperation.id,
    title: "toggle-script-panel",
    tooltip: "uniscript.tooltip.menu-button",
    icon: "CodeIcon",
    type: 0 /* BUTTON */,
    // FIXME hidden$ and disabled$ are not correctly in doc
    hidden$: getMenuHiddenObservable(accessor, 2 /* UNIVER_SHEET */),
    disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })
  };
}

// ../packages/uniscript/src/menu/schema.ts
var menuSchema = {
  ["ribbon.others.others" /* OTHERS */]: {
    [ToggleScriptPanelOperation.id]: {
      order: 0,
      menuItemFactory: UniscriptMenuItemFactory
    }
  }
};

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/language/css/monaco.contribution.js
var monaco_contribution_exports2 = {};
__export(monaco_contribution_exports2, {
  cssDefaults: () => cssDefaults,
  lessDefaults: () => lessDefaults,
  scssDefaults: () => scssDefaults
});
var LanguageServiceDefaultsImpl = class {
  constructor(languageId, options, modeConfiguration) {
    this._onDidChange = new Emitter();
    this._languageId = languageId;
    this.setOptions(options);
    this.setModeConfiguration(modeConfiguration);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get languageId() {
    return this._languageId;
  }
  get modeConfiguration() {
    return this._modeConfiguration;
  }
  get diagnosticsOptions() {
    return this.options;
  }
  get options() {
    return this._options;
  }
  setOptions(options) {
    this._options = options || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
  setDiagnosticsOptions(options) {
    this.setOptions(options);
  }
  setModeConfiguration(modeConfiguration) {
    this._modeConfiguration = modeConfiguration || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
};
var optionsDefault = {
  validate: true,
  lint: {
    compatibleVendorPrefixes: "ignore",
    vendorPrefix: "warning",
    duplicateProperties: "warning",
    emptyRules: "warning",
    importStatement: "ignore",
    boxModel: "ignore",
    universalSelector: "ignore",
    zeroUnits: "ignore",
    fontFaceProperties: "warning",
    hexColorLength: "error",
    argumentsInColorFunction: "error",
    unknownProperties: "warning",
    ieHack: "ignore",
    unknownVendorSpecificProperties: "ignore",
    propertyIgnoredDueToDisplay: "warning",
    important: "ignore",
    float: "ignore",
    idSelector: "ignore"
  },
  data: { useDefaultDataProvider: true },
  format: {
    newlineBetweenSelectors: true,
    newlineBetweenRules: true,
    spaceAroundSelectorSeparator: false,
    braceStyle: "collapse",
    maxPreserveNewLines: void 0,
    preserveNewLines: true
  }
};
var modeConfigurationDefault = {
  completionItems: true,
  hovers: true,
  documentSymbols: true,
  definitions: true,
  references: true,
  documentHighlights: true,
  rename: true,
  colors: true,
  foldingRanges: true,
  diagnostics: true,
  selectionRanges: true,
  documentFormattingEdits: true,
  documentRangeFormattingEdits: true
};
var cssDefaults = new LanguageServiceDefaultsImpl(
  "css",
  optionsDefault,
  modeConfigurationDefault
);
var scssDefaults = new LanguageServiceDefaultsImpl(
  "scss",
  optionsDefault,
  modeConfigurationDefault
);
var lessDefaults = new LanguageServiceDefaultsImpl(
  "less",
  optionsDefault,
  modeConfigurationDefault
);
function getMode() {
  return import("./cssMode-XIVSOMWI.js");
}
languages.onLanguage("less", () => {
  getMode().then((mode2) => mode2.setupMode(lessDefaults));
});
languages.onLanguage("scss", () => {
  getMode().then((mode2) => mode2.setupMode(scssDefaults));
});
languages.onLanguage("css", () => {
  getMode().then((mode2) => mode2.setupMode(cssDefaults));
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/language/html/monaco.contribution.js
var monaco_contribution_exports3 = {};
__export(monaco_contribution_exports3, {
  handlebarDefaults: () => handlebarDefaults,
  handlebarLanguageService: () => handlebarLanguageService,
  htmlDefaults: () => htmlDefaults,
  htmlLanguageService: () => htmlLanguageService,
  razorDefaults: () => razorDefaults,
  razorLanguageService: () => razorLanguageService,
  registerHTMLLanguageService: () => registerHTMLLanguageService
});
var LanguageServiceDefaultsImpl2 = class {
  constructor(languageId, options, modeConfiguration) {
    this._onDidChange = new Emitter();
    this._languageId = languageId;
    this.setOptions(options);
    this.setModeConfiguration(modeConfiguration);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get languageId() {
    return this._languageId;
  }
  get options() {
    return this._options;
  }
  get modeConfiguration() {
    return this._modeConfiguration;
  }
  setOptions(options) {
    this._options = options || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
  setModeConfiguration(modeConfiguration) {
    this._modeConfiguration = modeConfiguration || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
};
var formatDefaults = {
  tabSize: 4,
  insertSpaces: false,
  wrapLineLength: 120,
  unformatted: 'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, object, q, samp, select, small, span, strong, sub, sup, textarea, tt, var',
  contentUnformatted: "pre",
  indentInnerHtml: false,
  preserveNewLines: true,
  maxPreserveNewLines: void 0,
  indentHandlebars: false,
  endWithNewline: false,
  extraLiners: "head, body, /html",
  wrapAttributes: "auto"
};
var optionsDefault2 = {
  format: formatDefaults,
  suggest: {},
  data: { useDefaultDataProvider: true }
};
function getConfigurationDefault(languageId) {
  return {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    links: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    selectionRanges: true,
    diagnostics: languageId === htmlLanguageId,
    // turned off for Razor and Handlebar
    documentFormattingEdits: languageId === htmlLanguageId,
    // turned off for Razor and Handlebar
    documentRangeFormattingEdits: languageId === htmlLanguageId
    // turned off for Razor and Handlebar
  };
}
var htmlLanguageId = "html";
var handlebarsLanguageId = "handlebars";
var razorLanguageId = "razor";
var htmlLanguageService = registerHTMLLanguageService(
  htmlLanguageId,
  optionsDefault2,
  getConfigurationDefault(htmlLanguageId)
);
var htmlDefaults = htmlLanguageService.defaults;
var handlebarLanguageService = registerHTMLLanguageService(
  handlebarsLanguageId,
  optionsDefault2,
  getConfigurationDefault(handlebarsLanguageId)
);
var handlebarDefaults = handlebarLanguageService.defaults;
var razorLanguageService = registerHTMLLanguageService(
  razorLanguageId,
  optionsDefault2,
  getConfigurationDefault(razorLanguageId)
);
var razorDefaults = razorLanguageService.defaults;
function getMode2() {
  return import("./htmlMode-JV3HQLSA.js");
}
function registerHTMLLanguageService(languageId, options = optionsDefault2, modeConfiguration = getConfigurationDefault(languageId)) {
  const defaults = new LanguageServiceDefaultsImpl2(languageId, options, modeConfiguration);
  let mode2;
  const onLanguageListener = languages.onLanguage(languageId, async () => {
    mode2 = (await getMode2()).setupMode(defaults);
  });
  return {
    defaults,
    dispose() {
      onLanguageListener.dispose();
      mode2 == null ? void 0 : mode2.dispose();
      mode2 = void 0;
    }
  };
}

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/language/json/monaco.contribution.js
var monaco_contribution_exports4 = {};
__export(monaco_contribution_exports4, {
  getWorker: () => getWorker,
  jsonDefaults: () => jsonDefaults
});
var LanguageServiceDefaultsImpl3 = class {
  constructor(languageId, diagnosticsOptions, modeConfiguration) {
    this._onDidChange = new Emitter();
    this._languageId = languageId;
    this.setDiagnosticsOptions(diagnosticsOptions);
    this.setModeConfiguration(modeConfiguration);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get languageId() {
    return this._languageId;
  }
  get modeConfiguration() {
    return this._modeConfiguration;
  }
  get diagnosticsOptions() {
    return this._diagnosticsOptions;
  }
  setDiagnosticsOptions(options) {
    this._diagnosticsOptions = options || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
  setModeConfiguration(modeConfiguration) {
    this._modeConfiguration = modeConfiguration || /* @__PURE__ */ Object.create(null);
    this._onDidChange.fire(this);
  }
};
var diagnosticDefault = {
  validate: true,
  allowComments: true,
  schemas: [],
  enableSchemaRequest: false,
  schemaRequest: "warning",
  schemaValidation: "warning",
  comments: "error",
  trailingCommas: "error"
};
var modeConfigurationDefault2 = {
  documentFormattingEdits: true,
  documentRangeFormattingEdits: true,
  completionItems: true,
  hovers: true,
  documentSymbols: true,
  tokens: true,
  colors: true,
  foldingRanges: true,
  diagnostics: true,
  selectionRanges: true
};
var jsonDefaults = new LanguageServiceDefaultsImpl3(
  "json",
  diagnosticDefault,
  modeConfigurationDefault2
);
var getWorker = () => getMode3().then((mode2) => mode2.getWorker());
function getMode3() {
  return import("./jsonMode-LHZ7KDKZ.js");
}
languages.register({
  id: "json",
  extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc", ".har"],
  aliases: ["JSON", "json"],
  mimetypes: ["application/json"]
});
languages.onLanguage("json", () => {
  getMode3().then((mode2) => mode2.setupMode(jsonDefaults));
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/_.contribution.js
var languageDefinitions = {};
var lazyLanguageLoaders = {};
var LazyLanguageLoader = class _LazyLanguageLoader {
  static getOrCreate(languageId) {
    if (!lazyLanguageLoaders[languageId]) {
      lazyLanguageLoaders[languageId] = new _LazyLanguageLoader(languageId);
    }
    return lazyLanguageLoaders[languageId];
  }
  constructor(languageId) {
    this._languageId = languageId;
    this._loadingTriggered = false;
    this._lazyLoadPromise = new Promise((resolve, reject) => {
      this._lazyLoadPromiseResolve = resolve;
      this._lazyLoadPromiseReject = reject;
    });
  }
  load() {
    if (!this._loadingTriggered) {
      this._loadingTriggered = true;
      languageDefinitions[this._languageId].loader().then(
        (mod) => this._lazyLoadPromiseResolve(mod),
        (err) => this._lazyLoadPromiseReject(err)
      );
    }
    return this._lazyLoadPromise;
  }
};
function registerLanguage(def) {
  const languageId = def.id;
  languageDefinitions[languageId] = def;
  languages.register(def);
  const lazyLanguageLoader = LazyLanguageLoader.getOrCreate(languageId);
  languages.registerTokensProviderFactory(languageId, {
    create: async () => {
      const mod = await lazyLanguageLoader.load();
      return mod.language;
    }
  });
  languages.onLanguageEncountered(languageId, async () => {
    const mod = await lazyLanguageLoader.load();
    languages.setLanguageConfiguration(languageId, mod.conf);
  });
}

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/abap/abap.contribution.js
registerLanguage({
  id: "abap",
  extensions: [".abap"],
  aliases: ["abap", "ABAP"],
  loader: () => import("./abap-UTQDEKTM.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/apex/apex.contribution.js
registerLanguage({
  id: "apex",
  extensions: [".cls"],
  aliases: ["Apex", "apex"],
  mimetypes: ["text/x-apex-source", "text/x-apex"],
  loader: () => import("./apex-5LM2V7GU.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/azcli/azcli.contribution.js
registerLanguage({
  id: "azcli",
  extensions: [".azcli"],
  aliases: ["Azure CLI", "azcli"],
  loader: () => import("./azcli-XI4ONXOM.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js
registerLanguage({
  id: "bat",
  extensions: [".bat", ".cmd"],
  aliases: ["Batch", "bat"],
  loader: () => import("./bat-BJA4X3RI.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/bicep/bicep.contribution.js
registerLanguage({
  id: "bicep",
  extensions: [".bicep"],
  aliases: ["Bicep"],
  loader: () => import("./bicep-2YH7NNUM.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/cameligo/cameligo.contribution.js
registerLanguage({
  id: "cameligo",
  extensions: [".mligo"],
  aliases: ["Cameligo"],
  loader: () => import("./cameligo-IQEBSWAQ.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/clojure/clojure.contribution.js
registerLanguage({
  id: "clojure",
  extensions: [".clj", ".cljs", ".cljc", ".edn"],
  aliases: ["clojure", "Clojure"],
  loader: () => import("./clojure-A4JQLBUU.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js
registerLanguage({
  id: "coffeescript",
  extensions: [".coffee"],
  aliases: ["CoffeeScript", "coffeescript", "coffee"],
  mimetypes: ["text/x-coffeescript", "text/coffeescript"],
  loader: () => import("./coffee-NSNBLB7G.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js
registerLanguage({
  id: "c",
  extensions: [".c", ".h"],
  aliases: ["C", "c"],
  loader: () => import("./cpp-7KX44LMS.js")
});
registerLanguage({
  id: "cpp",
  extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"],
  aliases: ["C++", "Cpp", "cpp"],
  loader: () => import("./cpp-7KX44LMS.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js
registerLanguage({
  id: "csharp",
  extensions: [".cs", ".csx", ".cake"],
  aliases: ["C#", "csharp"],
  loader: () => import("./csharp-CQNCUV2K.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js
registerLanguage({
  id: "csp",
  extensions: [".csp"],
  aliases: ["CSP", "csp"],
  loader: () => import("./csp-AREWLROC.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/css/css.contribution.js
registerLanguage({
  id: "css",
  extensions: [".css"],
  aliases: ["CSS", "css"],
  mimetypes: ["text/css"],
  loader: () => import("./css-6WIVATAV.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/cypher/cypher.contribution.js
registerLanguage({
  id: "cypher",
  extensions: [".cypher", ".cyp"],
  aliases: ["Cypher", "OpenCypher"],
  loader: () => import("./cypher-4ARBW2SL.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/dart/dart.contribution.js
registerLanguage({
  id: "dart",
  extensions: [".dart"],
  aliases: ["Dart", "dart"],
  mimetypes: ["text/x-dart-source", "text/x-dart"],
  loader: () => import("./dart-263YGB27.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js
registerLanguage({
  id: "dockerfile",
  extensions: [".dockerfile"],
  filenames: ["Dockerfile"],
  aliases: ["Dockerfile"],
  loader: () => import("./dockerfile-PTZ3KNKL.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/ecl/ecl.contribution.js
registerLanguage({
  id: "ecl",
  extensions: [".ecl"],
  aliases: ["ECL", "Ecl", "ecl"],
  loader: () => import("./ecl-O6SK54VI.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/elixir/elixir.contribution.js
registerLanguage({
  id: "elixir",
  extensions: [".ex", ".exs"],
  aliases: ["Elixir", "elixir", "ex"],
  loader: () => import("./elixir-APV4VBCL.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/flow9/flow9.contribution.js
registerLanguage({
  id: "flow9",
  extensions: [".flow"],
  aliases: ["Flow9", "Flow", "flow9", "flow"],
  loader: () => import("./flow9-M5CUVGAK.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js
registerLanguage({
  id: "fsharp",
  extensions: [".fs", ".fsi", ".ml", ".mli", ".fsx", ".fsscript"],
  aliases: ["F#", "FSharp", "fsharp"],
  loader: () => import("./fsharp-M56IWJIR.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/freemarker2/freemarker2.contribution.js
registerLanguage({
  id: "freemarker2",
  extensions: [".ftl", ".ftlh", ".ftlx"],
  aliases: ["FreeMarker2", "Apache FreeMarker2"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagAutoInterpolationDollar);
  }
});
registerLanguage({
  id: "freemarker2.tag-angle.interpolation-dollar",
  aliases: ["FreeMarker2 (Angle/Dollar)", "Apache FreeMarker2 (Angle/Dollar)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagAngleInterpolationDollar);
  }
});
registerLanguage({
  id: "freemarker2.tag-bracket.interpolation-dollar",
  aliases: ["FreeMarker2 (Bracket/Dollar)", "Apache FreeMarker2 (Bracket/Dollar)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagBracketInterpolationDollar);
  }
});
registerLanguage({
  id: "freemarker2.tag-angle.interpolation-bracket",
  aliases: ["FreeMarker2 (Angle/Bracket)", "Apache FreeMarker2 (Angle/Bracket)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagAngleInterpolationBracket);
  }
});
registerLanguage({
  id: "freemarker2.tag-bracket.interpolation-bracket",
  aliases: ["FreeMarker2 (Bracket/Bracket)", "Apache FreeMarker2 (Bracket/Bracket)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagBracketInterpolationBracket);
  }
});
registerLanguage({
  id: "freemarker2.tag-auto.interpolation-dollar",
  aliases: ["FreeMarker2 (Auto/Dollar)", "Apache FreeMarker2 (Auto/Dollar)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagAutoInterpolationDollar);
  }
});
registerLanguage({
  id: "freemarker2.tag-auto.interpolation-bracket",
  aliases: ["FreeMarker2 (Auto/Bracket)", "Apache FreeMarker2 (Auto/Bracket)"],
  loader: () => {
    return import("./freemarker2-GZJFXXLX.js").then((m) => m.TagAutoInterpolationBracket);
  }
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/go/go.contribution.js
registerLanguage({
  id: "go",
  extensions: [".go"],
  aliases: ["Go"],
  loader: () => import("./go-URKMVFOV.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js
registerLanguage({
  id: "graphql",
  extensions: [".graphql", ".gql"],
  aliases: ["GraphQL", "graphql", "gql"],
  mimetypes: ["application/graphql"],
  loader: () => import("./graphql-WNILNO7H.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js
registerLanguage({
  id: "handlebars",
  extensions: [".handlebars", ".hbs"],
  aliases: ["Handlebars", "handlebars", "hbs"],
  mimetypes: ["text/x-handlebars-template"],
  loader: () => import("./handlebars-AE5EEXKG.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/hcl/hcl.contribution.js
registerLanguage({
  id: "hcl",
  extensions: [".tf", ".tfvars", ".hcl"],
  aliases: ["Terraform", "tf", "HCL", "hcl"],
  loader: () => import("./hcl-YDCUQUCQ.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/html/html.contribution.js
registerLanguage({
  id: "html",
  extensions: [".html", ".htm", ".shtml", ".xhtml", ".mdoc", ".jsp", ".asp", ".aspx", ".jshtm"],
  aliases: ["HTML", "htm", "html", "xhtml"],
  mimetypes: ["text/html", "text/x-jshtm", "text/template", "text/ng-template"],
  loader: () => import("./html-6K3Z5TBO.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js
registerLanguage({
  id: "ini",
  extensions: [".ini", ".properties", ".gitconfig"],
  filenames: ["config", ".gitattributes", ".gitconfig", ".editorconfig"],
  aliases: ["Ini", "ini"],
  loader: () => import("./ini-5VOEB4ZH.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/java/java.contribution.js
registerLanguage({
  id: "java",
  extensions: [".java", ".jav"],
  aliases: ["Java", "java"],
  mimetypes: ["text/x-java-source", "text/x-java"],
  loader: () => import("./java-5BXRQOLK.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js
registerLanguage({
  id: "javascript",
  extensions: [".js", ".es6", ".jsx", ".mjs", ".cjs"],
  firstLine: "^#!.*\\bnode",
  filenames: ["jakefile"],
  aliases: ["JavaScript", "javascript", "js"],
  mimetypes: ["text/javascript"],
  loader: () => import("./javascript-HM5GWXN7.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/julia/julia.contribution.js
registerLanguage({
  id: "julia",
  extensions: [".jl"],
  aliases: ["julia", "Julia"],
  loader: () => import("./julia-RWE4TTYW.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution.js
registerLanguage({
  id: "kotlin",
  extensions: [".kt", ".kts"],
  aliases: ["Kotlin", "kotlin"],
  mimetypes: ["text/x-kotlin-source", "text/x-kotlin"],
  loader: () => import("./kotlin-UXTJVFUO.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/less/less.contribution.js
registerLanguage({
  id: "less",
  extensions: [".less"],
  aliases: ["Less", "less"],
  mimetypes: ["text/x-less", "text/less"],
  loader: () => import("./less-SYSDXGLS.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/lexon/lexon.contribution.js
registerLanguage({
  id: "lexon",
  extensions: [".lex"],
  aliases: ["Lexon"],
  loader: () => import("./lexon-PBSLHEJ7.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js
registerLanguage({
  id: "lua",
  extensions: [".lua"],
  aliases: ["Lua", "lua"],
  loader: () => import("./lua-WGVBML25.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/liquid/liquid.contribution.js
registerLanguage({
  id: "liquid",
  extensions: [".liquid", ".html.liquid"],
  aliases: ["Liquid", "liquid"],
  mimetypes: ["application/liquid"],
  loader: () => import("./liquid-2WQMKZZ2.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/m3/m3.contribution.js
registerLanguage({
  id: "m3",
  extensions: [".m3", ".i3", ".mg", ".ig"],
  aliases: ["Modula-3", "Modula3", "modula3", "m3"],
  loader: () => import("./m3-AOXYUYCO.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js
registerLanguage({
  id: "markdown",
  extensions: [".md", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdwn", ".mdtxt", ".mdtext"],
  aliases: ["Markdown", "markdown"],
  loader: () => import("./markdown-66FWUMSJ.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/mdx/mdx.contribution.js
registerLanguage({
  id: "mdx",
  extensions: [".mdx"],
  aliases: ["MDX", "mdx"],
  loader: () => import("./mdx-NS5YTDME.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/mips/mips.contribution.js
registerLanguage({
  id: "mips",
  extensions: [".s"],
  aliases: ["MIPS", "MIPS-V"],
  mimetypes: ["text/x-mips", "text/mips", "text/plaintext"],
  loader: () => import("./mips-EIMQTBC7.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js
registerLanguage({
  id: "msdax",
  extensions: [".dax", ".msdax"],
  aliases: ["DAX", "MSDAX"],
  loader: () => import("./msdax-WWV4DPDS.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js
registerLanguage({
  id: "mysql",
  extensions: [],
  aliases: ["MySQL", "mysql"],
  loader: () => import("./mysql-Y4O7SOEW.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js
registerLanguage({
  id: "objective-c",
  extensions: [".m"],
  aliases: ["Objective-C"],
  loader: () => import("./objective-c-4V4BEZVF.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/pascal/pascal.contribution.js
registerLanguage({
  id: "pascal",
  extensions: [".pas", ".p", ".pp"],
  aliases: ["Pascal", "pas"],
  mimetypes: ["text/x-pascal-source", "text/x-pascal"],
  loader: () => import("./pascal-IDUA54BF.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/pascaligo/pascaligo.contribution.js
registerLanguage({
  id: "pascaligo",
  extensions: [".ligo"],
  aliases: ["Pascaligo", "ligo"],
  loader: () => import("./pascaligo-BGWCF6WY.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/perl/perl.contribution.js
registerLanguage({
  id: "perl",
  extensions: [".pl", ".pm"],
  aliases: ["Perl", "pl"],
  loader: () => import("./perl-EKRM25NK.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js
registerLanguage({
  id: "pgsql",
  extensions: [],
  aliases: ["PostgreSQL", "postgres", "pg", "postgre"],
  loader: () => import("./pgsql-5BNS4GGD.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/php/php.contribution.js
registerLanguage({
  id: "php",
  extensions: [".php", ".php4", ".php5", ".phtml", ".ctp"],
  aliases: ["PHP", "php"],
  mimetypes: ["application/x-php"],
  loader: () => import("./php-HV6FSCWD.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/pla/pla.contribution.js
registerLanguage({
  id: "pla",
  extensions: [".pla"],
  loader: () => import("./pla-NGGIG24T.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js
registerLanguage({
  id: "postiats",
  extensions: [".dats", ".sats", ".hats"],
  aliases: ["ATS", "ATS/Postiats"],
  loader: () => import("./postiats-TRQPXIW3.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/powerquery/powerquery.contribution.js
registerLanguage({
  id: "powerquery",
  extensions: [".pq", ".pqm"],
  aliases: ["PQ", "M", "Power Query", "Power Query M"],
  loader: () => import("./powerquery-G6BW2TOY.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js
registerLanguage({
  id: "powershell",
  extensions: [".ps1", ".psm1", ".psd1"],
  aliases: ["PowerShell", "powershell", "ps", "ps1"],
  loader: () => import("./powershell-TMKW7PSJ.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/protobuf/protobuf.contribution.js
registerLanguage({
  id: "proto",
  extensions: [".proto"],
  aliases: ["protobuf", "Protocol Buffers"],
  loader: () => import("./protobuf-XKOX2XBY.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js
registerLanguage({
  id: "pug",
  extensions: [".jade", ".pug"],
  aliases: ["Pug", "Jade", "jade"],
  loader: () => import("./pug-65S4WA2V.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/python/python.contribution.js
registerLanguage({
  id: "python",
  extensions: [".py", ".rpy", ".pyw", ".cpy", ".gyp", ".gypi"],
  aliases: ["Python", "py"],
  firstLine: "^#!/.*\\bpython[0-9.-]*\\b",
  loader: () => import("./python-RN2G6ZV4.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/qsharp/qsharp.contribution.js
registerLanguage({
  id: "qsharp",
  extensions: [".qs"],
  aliases: ["Q#", "qsharp"],
  loader: () => import("./qsharp-4U56TAZO.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/r/r.contribution.js
registerLanguage({
  id: "r",
  extensions: [".r", ".rhistory", ".rmd", ".rprofile", ".rt"],
  aliases: ["R", "r"],
  loader: () => import("./r-4LBE2W5Z.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js
registerLanguage({
  id: "razor",
  extensions: [".cshtml"],
  aliases: ["Razor", "razor"],
  mimetypes: ["text/x-cshtml"],
  loader: () => import("./razor-UXAYJEPA.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js
registerLanguage({
  id: "redis",
  extensions: [".redis"],
  aliases: ["redis"],
  loader: () => import("./redis-UAY3IXAP.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js
registerLanguage({
  id: "redshift",
  extensions: [],
  aliases: ["Redshift", "redshift"],
  loader: () => import("./redshift-UBQ5EG5T.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/restructuredtext/restructuredtext.contribution.js
registerLanguage({
  id: "restructuredtext",
  extensions: [".rst"],
  aliases: ["reStructuredText", "restructuredtext"],
  loader: () => import("./restructuredtext-QPY2GAZU.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js
registerLanguage({
  id: "ruby",
  extensions: [".rb", ".rbx", ".rjs", ".gemspec", ".pp"],
  filenames: ["rakefile", "Gemfile"],
  aliases: ["Ruby", "rb"],
  loader: () => import("./ruby-D47KD534.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/rust/rust.contribution.js
registerLanguage({
  id: "rust",
  extensions: [".rs", ".rlib"],
  aliases: ["Rust", "rust"],
  loader: () => import("./rust-MUNQSWQH.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js
registerLanguage({
  id: "sb",
  extensions: [".sb"],
  aliases: ["Small Basic", "sb"],
  loader: () => import("./sb-LHVCYLCE.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/scala/scala.contribution.js
registerLanguage({
  id: "scala",
  extensions: [".scala", ".sc", ".sbt"],
  aliases: ["Scala", "scala", "SBT", "Sbt", "sbt", "Dotty", "dotty"],
  mimetypes: ["text/x-scala-source", "text/x-scala", "text/x-sbt", "text/x-dotty"],
  loader: () => import("./scala-VXU3O74Z.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/scheme/scheme.contribution.js
registerLanguage({
  id: "scheme",
  extensions: [".scm", ".ss", ".sch", ".rkt"],
  aliases: ["scheme", "Scheme"],
  loader: () => import("./scheme-TDCP2VXH.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js
registerLanguage({
  id: "scss",
  extensions: [".scss"],
  aliases: ["Sass", "sass", "scss"],
  mimetypes: ["text/x-scss", "text/scss"],
  loader: () => import("./scss-JAUVTMOB.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js
registerLanguage({
  id: "shell",
  extensions: [".sh", ".bash"],
  aliases: ["Shell", "sh"],
  loader: () => import("./shell-TGY5T7SD.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js
registerLanguage({
  id: "sol",
  extensions: [".sol"],
  aliases: ["sol", "solidity", "Solidity"],
  loader: () => import("./solidity-GKDCF5ID.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/sophia/sophia.contribution.js
registerLanguage({
  id: "aes",
  extensions: [".aes"],
  aliases: ["aes", "sophia", "Sophia"],
  loader: () => import("./sophia-YRL45XM7.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/sparql/sparql.contribution.js
registerLanguage({
  id: "sparql",
  extensions: [".rq"],
  aliases: ["sparql", "SPARQL"],
  loader: () => import("./sparql-C6VGWHUY.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js
registerLanguage({
  id: "sql",
  extensions: [".sql"],
  aliases: ["SQL"],
  loader: () => import("./sql-NRSIW74P.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/st/st.contribution.js
registerLanguage({
  id: "st",
  extensions: [".st", ".iecst", ".iecplc", ".lc3lib", ".TcPOU", ".TcDUT", ".TcGVL", ".TcIO"],
  aliases: ["StructuredText", "scl", "stl"],
  loader: () => import("./st-HFSTVNBL.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js
registerLanguage({
  id: "swift",
  aliases: ["Swift", "swift"],
  extensions: [".swift"],
  mimetypes: ["text/swift"],
  loader: () => import("./swift-R3APQPXV.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/systemverilog/systemverilog.contribution.js
registerLanguage({
  id: "systemverilog",
  extensions: [".sv", ".svh"],
  aliases: ["SV", "sv", "SystemVerilog", "systemverilog"],
  loader: () => import("./systemverilog-EEKLJRUE.js")
});
registerLanguage({
  id: "verilog",
  extensions: [".v", ".vh"],
  aliases: ["V", "v", "Verilog", "verilog"],
  loader: () => import("./systemverilog-EEKLJRUE.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/tcl/tcl.contribution.js
registerLanguage({
  id: "tcl",
  extensions: [".tcl"],
  aliases: ["tcl", "Tcl", "tcltk", "TclTk", "tcl/tk", "Tcl/Tk"],
  loader: () => import("./tcl-5EVXXQFV.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/twig/twig.contribution.js
registerLanguage({
  id: "twig",
  extensions: [".twig"],
  aliases: ["Twig", "twig"],
  mimetypes: ["text/x-twig"],
  loader: () => import("./twig-YVXOUQEO.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js
registerLanguage({
  id: "typescript",
  extensions: [".ts", ".tsx", ".cts", ".mts"],
  aliases: ["TypeScript", "ts", "typescript"],
  mimetypes: ["text/typescript"],
  loader: () => {
    return import("./typescript-DCRT7NXS.js");
  }
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/typespec/typespec.contribution.js
registerLanguage({
  id: "typespec",
  extensions: [".tsp"],
  aliases: ["TypeSpec"],
  loader: () => import("./typespec-VOAW5MDZ.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js
registerLanguage({
  id: "vb",
  extensions: [".vb"],
  aliases: ["Visual Basic", "vb"],
  loader: () => import("./vb-PPRKK373.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/wgsl/wgsl.contribution.js
registerLanguage({
  id: "wgsl",
  extensions: [".wgsl"],
  aliases: ["WebGPU Shading Language", "WGSL", "wgsl"],
  loader: () => import("./wgsl-4LFYKWYT.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js
registerLanguage({
  id: "xml",
  extensions: [
    ".xml",
    ".xsd",
    ".dtd",
    ".ascx",
    ".csproj",
    ".config",
    ".props",
    ".targets",
    ".wxi",
    ".wxl",
    ".wxs",
    ".xaml",
    ".svg",
    ".svgz",
    ".opf",
    ".xslt",
    ".xsl"
  ],
  firstLine: "(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)",
  aliases: ["XML", "xml"],
  mimetypes: ["text/xml", "application/xml", "application/xaml+xml", "application/xml-dtd"],
  loader: () => import("./xml-6K5CNWOB.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js
registerLanguage({
  id: "yaml",
  extensions: [".yaml", ".yml"],
  aliases: ["YAML", "yaml", "YML", "yml"],
  mimetypes: ["application/x-yaml", "text/x-yaml"],
  loader: () => import("./yaml-Q3F6EZAP.js")
});

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/external/monaco-lsp-client/out/index.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var _b;
var _c;
var _d;
var _e;
function isRequestOrNotification(msg) {
  return msg.method !== void 0;
}
var ErrorObject;
(function(ErrorObject$1) {
  function create(obj) {
    return obj;
  }
  ErrorObject$1.create = create;
})(ErrorObject || (ErrorObject = {}));
var ErrorCode;
(function(ErrorCode$1) {
  ErrorCode$1.parseError = -32700;
  ErrorCode$1.invalidRequest = -32600;
  ErrorCode$1.methodNotFound = -32601;
  ErrorCode$1.invalidParams = -32602;
  ErrorCode$1.internalError = -32603;
  function isServerError(code) {
    return -32099 <= code && code <= -32e3;
  }
  ErrorCode$1.isServerError = isServerError;
  function serverError(code) {
    if (!isServerError(code)) throw new Error("Invalid range for a server error.");
    return code;
  }
  ErrorCode$1.serverError = serverError;
  ErrorCode$1.unexpectedServerError = -32e3;
  function isApplicationError(code) {
    return true;
  }
  ErrorCode$1.isApplicationError = isApplicationError;
  function applicationError(code) {
    return code;
  }
  ErrorCode$1.applicationError = applicationError;
  ErrorCode$1.genericApplicationError = -320100;
})(ErrorCode || (ErrorCode = {}));
var EventEmitter = class {
  constructor() {
    __publicField2(this, "listeners", /* @__PURE__ */ new Set());
    __publicField2(this, "event", (listener) => {
      this.listeners.add(listener);
      return { dispose: () => {
        this.listeners.delete(listener);
      } };
    });
  }
  fire(args) {
    this.listeners.forEach((listener) => listener(args));
  }
};
var ValueWithChangeEvent = class {
  constructor(initialValue) {
    __publicField2(this, "_value");
    __publicField2(this, "eventEmitter");
    this._value = initialValue;
    this.eventEmitter = new EventEmitter();
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.eventEmitter.fire(newValue);
    }
  }
  get onChange() {
    return this.eventEmitter.event;
  }
};
function createTimeout(delay, callback) {
  const handle = setTimeout(callback, delay);
  return { dispose: () => clearTimeout(handle) };
}
function setAndDeleteOnDispose(set, keyOrItem, item) {
  if (set instanceof Set) {
    set.add(keyOrItem);
    return { dispose: () => set.delete(keyOrItem) };
  } else {
    set.set(keyOrItem, item);
    return { dispose: () => set.delete(keyOrItem) };
  }
}
var Deferred = class {
  constructor() {
    __publicField2(this, "_state", "none");
    __publicField2(this, "promise");
    __publicField2(this, "resolve", () => {
    });
    __publicField2(this, "reject", () => {
    });
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  get state() {
    return this._state;
  }
};
var BaseMessageTransport = (_a = class {
  constructor() {
    __publicField2(this, "_unprocessedMessages", []);
    __publicField2(this, "_messageListener");
    __publicField2(this, "id", _a.id++);
    __publicField2(this, "_state", new ValueWithChangeEvent({ state: "open" }));
    __publicField2(this, "state", this._state);
  }
  /**
  * Sets a callback for incoming messages.
  */
  setListener(listener) {
    this._messageListener = listener;
    if (!listener) return;
    while (this._unprocessedMessages.length > 0 && this._messageListener !== void 0) {
      const msg = this._unprocessedMessages.shift();
      this._messageListener(msg);
    }
  }
  /**
  * Writes a message to the stream.
  */
  send(message) {
    return this._sendImpl(message);
  }
  /**
  * Call this in derived classes to signal a new message.
  */
  _dispatchReceivedMessage(message) {
    if (this._unprocessedMessages.length === 0 && this._messageListener) this._messageListener(message);
    else this._unprocessedMessages.push(message);
  }
  /**
  * Call this in derived classes to signal that the connection closed.
  */
  _onConnectionClosed() {
    this._state.value = {
      state: "closed",
      error: void 0
    };
  }
  log(logger) {
    return new StreamLogger(this, logger != null ? logger : new ConsoleMessageLogger());
  }
}, __publicField2(_a, "id", 0), _a);
var StreamLogger = class {
  constructor(baseStream, logger) {
    __publicField2(this, "baseStream");
    __publicField2(this, "logger");
    this.baseStream = baseStream;
    this.logger = logger;
  }
  get state() {
    return this.baseStream.state;
  }
  setListener(listener) {
    if (listener === void 0) {
      this.baseStream.setListener(void 0);
      return;
    }
    this.baseStream.setListener((readMessage) => {
      this.logger.log(this.baseStream, "incoming", readMessage);
      listener(readMessage);
    });
  }
  send(message) {
    this.logger.log(this.baseStream, "outgoing", message);
    return this.baseStream.send(message);
  }
  toString() {
    return `StreamLogger/${this.baseStream.toString()}`;
  }
};
var ConsoleMessageLogger = class {
  log(stream, type, message) {
    const char = type === "incoming" ? "<-" : "->";
    console.log(`${char} [${stream.toString()}] ${JSON.stringify(message)}`);
  }
};
var Channel = class Channel2 {
  constructor(connect) {
    __publicField2(this, "connect");
    this.connect = connect;
  }
  mapContext(map) {
    return new Channel2((listener) => this.connect(listener ? mapRequestHandlerContext(listener, map) : void 0));
  }
};
function mapRequestHandlerContext(messageHandler, map) {
  return {
    handleNotification: (request, context) => messageHandler.handleNotification(request, map(context)),
    handleRequest: (request, requestId, context) => messageHandler.handleRequest(request, requestId, map(context))
  };
}
var StreamBasedChannel = class StreamBasedChannel2 {
  constructor(_stream, _listener, _logger) {
    __publicField2(this, "_stream");
    __publicField2(this, "_listener");
    __publicField2(this, "_logger");
    __publicField2(this, "_unprocessedResponses", /* @__PURE__ */ new Map());
    __publicField2(this, "_lastUsedRequestId", 0);
    this._stream = _stream;
    this._listener = _listener;
    this._logger = _logger;
    this._stream.setListener((message) => {
      if (isRequestOrNotification(message)) if (message.id === void 0) this._processNotification(message);
      else this._processRequest(message);
      else this._processResponse(message);
    });
  }
  /**
  * Creates a channel factory from a given stream and logger.
  * This allows to delay specifying a `RequestHandler`.
  * Once the channel is created, it processes incoming messages.
  */
  static createChannel(stream, logger) {
    let constructed = false;
    return new Channel((listener) => {
      if (constructed) throw new Error(`A channel to the stream ${stream} was already constructed!`);
      else constructed = true;
      return new StreamBasedChannel2(stream, listener, logger);
    });
  }
  get state() {
    return this._stream.state;
  }
  async _processNotification(message) {
    if (message.id !== void 0) throw new Error();
    if (!this._listener) {
      if (this._logger) this._logger.debug({
        text: "Notification ignored",
        message
      });
      return;
    }
    try {
      await this._listener.handleNotification({
        method: message.method,
        params: message.params || null
      });
    } catch (exception) {
      if (this._logger) this._logger.warn({
        text: `Exception was thrown while handling notification: ${exception}`,
        exception,
        message
      });
    }
  }
  async _processRequest(message) {
    if (message.id === void 0) throw new Error();
    let result;
    if (this._listener) try {
      result = await this._listener.handleRequest({
        method: message.method,
        params: message.params || null
      }, message.id);
    } catch (exception) {
      if (this._logger) this._logger.warn({
        text: `Exception was thrown while handling request: ${exception}`,
        message,
        exception
      });
      result = { error: {
        code: ErrorCode.internalError,
        message: "An unexpected exception was thrown.",
        data: void 0
      } };
    }
    else {
      if (this._logger) this._logger.debug({
        text: "Received request even though not listening for requests",
        message
      });
      result = { error: {
        code: ErrorCode.methodNotFound,
        message: "This endpoint does not listen for requests or notifications.",
        data: void 0
      } };
    }
    let responseMsg;
    if ("result" in result) responseMsg = {
      jsonrpc: "2.0",
      id: message.id,
      result: result.result
    };
    else responseMsg = {
      jsonrpc: "2.0",
      id: message.id,
      error: result.error
    };
    await this._stream.send(responseMsg);
  }
  _processResponse(message) {
    const strId = "" + message.id;
    const callback = this._unprocessedResponses.get(strId);
    if (!callback) {
      if (this._logger) this._logger.debug({
        text: "Got an unexpected response message",
        message
      });
      return;
    }
    this._unprocessedResponses.delete(strId);
    callback(message);
  }
  _newRequestId() {
    return this._lastUsedRequestId++;
  }
  sendRequest(request, _context, messageIdCallback) {
    const message = {
      jsonrpc: "2.0",
      id: this._newRequestId(),
      method: request.method,
      params: request.params || void 0
    };
    if (messageIdCallback) messageIdCallback(message.id);
    return new Promise((resolve, reject) => {
      const strId = "" + message.id;
      this._unprocessedResponses.set(strId, (response) => {
        if ("result" in response) resolve({ result: response.result });
        else {
          if (!response.error) reject(/* @__PURE__ */ new Error("Response had neither 'result' nor 'error' field set."));
          resolve({ error: response.error });
        }
      });
      this._stream.send(message).then(void 0, (reason) => {
        this._unprocessedResponses.delete(strId);
        reject(reason);
      });
    });
  }
  sendNotification(notification, context) {
    const msg = {
      jsonrpc: "2.0",
      id: void 0,
      method: notification.method,
      params: notification.params || void 0
    };
    return this._stream.send(msg);
  }
  toString() {
    return "StreamChannel/" + this._stream.toString();
  }
};
var Serializers;
(function(Serializers$1) {
  function sAny() {
    return {
      deserializeFromJson: (input) => ({
        hasErrors: false,
        value: input
      }),
      serializeToJson: (input) => input
    };
  }
  Serializers$1.sAny = sAny;
  function sEmptyObject() {
    return {
      deserializeFromJson: (input) => ({
        hasErrors: false,
        value: {}
      }),
      serializeToJson: (input) => ({})
    };
  }
  Serializers$1.sEmptyObject = sEmptyObject;
  function sVoidFromNull() {
    return {
      deserializeFromJson: (input) => ({
        hasErrors: false,
        value: void 0
      }),
      serializeToJson: (input) => null
    };
  }
  Serializers$1.sVoidFromNull = sVoidFromNull;
})(Serializers || (Serializers = {}));
var OptionalMethodNotFound = /* @__PURE__ */ Symbol("OptionalMethodNotFound");
var TypedChannelBase = class {
  contextualize(args) {
    return new ContextualizedTypedChannel(this, args);
  }
};
var ContextualizedTypedChannel = class extends TypedChannelBase {
  constructor(underylingTypedChannel, converters) {
    super();
    __publicField2(this, "underylingTypedChannel");
    __publicField2(this, "converters");
    this.underylingTypedChannel = underylingTypedChannel;
    this.converters = converters;
  }
  async request(requestType, args, newContext) {
    const context = await this.converters.getSendContext(newContext);
    return this.underylingTypedChannel.request(requestType, args, context);
  }
  async notify(notificationType, params, newContext) {
    const context = await this.converters.getSendContext(newContext);
    return this.underylingTypedChannel.notify(notificationType, params, context);
  }
  registerNotificationHandler(type, handler) {
    return this.underylingTypedChannel.registerNotificationHandler(type, async (arg, context) => {
      return await handler(arg, await this.converters.getNewContext(context));
    });
  }
  registerRequestHandler(requestType, handler) {
    return this.underylingTypedChannel.registerRequestHandler(requestType, async (arg, requestId, context) => {
      return await handler(arg, requestId, await this.converters.getNewContext(context));
    });
  }
};
var TypedChannel = class TypedChannel2 extends TypedChannelBase {
  constructor(channelCtor, options = {}) {
    super();
    __publicField2(this, "channelCtor");
    __publicField2(this, "_requestSender");
    __publicField2(this, "_handler", /* @__PURE__ */ new Map());
    __publicField2(this, "_unknownNotificationHandler", /* @__PURE__ */ new Set());
    __publicField2(this, "_timeout");
    __publicField2(this, "sendExceptionDetails", false);
    __publicField2(this, "_logger");
    __publicField2(this, "listeningDeferred", new Deferred());
    __publicField2(this, "onListening", this.listeningDeferred.promise);
    __publicField2(this, "_requestDidErrorEventEmitter", new EventEmitter());
    __publicField2(this, "onRequestDidError", this._requestDidErrorEventEmitter.event);
    this.channelCtor = channelCtor;
    this._logger = options.logger;
    this.sendExceptionDetails = !!options.sendExceptionDetails;
    this._timeout = createTimeout(1e3, () => {
      if (!this._requestSender) console.warn(`"${this.startListen.name}" has not been called within 1 second after construction of this channel. Did you forget to call it?`, this);
    });
  }
  static fromTransport(stream, options = {}) {
    return new TypedChannel2(StreamBasedChannel.createChannel(stream, options.logger), options);
  }
  /**
  * This method must be called to forward messages from the stream to this channel.
  * This is not done automatically on construction so that this instance
  * can be setup properly before handling messages.
  */
  startListen() {
    if (this._requestSender) throw new Error(`"${this.startListen.name}" can be called only once, but it already has been called.`);
    if (this._timeout) {
      this._timeout.dispose();
      this._timeout = void 0;
    }
    this._requestSender = this.channelCtor.connect({
      handleRequest: (req, id, context) => this.handleRequest(req, id, context),
      handleNotification: (req, context) => this.handleNotification(req, context)
    });
    this.listeningDeferred.resolve();
  }
  checkChannel(channel) {
    if (!channel) throw new Error(`"${this.startListen.name}" must be called before any messages can be sent or received.`);
    return true;
  }
  async handleRequest(request, requestId, context) {
    const handler = this._handler.get(request.method);
    if (!handler) {
      if (this._logger) this._logger.debug({
        text: `No request handler for "${request.method}".`,
        data: { requestObject: request }
      });
      return { error: {
        code: ErrorCode.methodNotFound,
        message: `No request handler for "${request.method}".`,
        data: { method: request.method }
      } };
    }
    if (handler.kind != "request") {
      const message = `"${request.method}" is registered as notification, but was sent as request.`;
      if (this._logger) this._logger.debug({
        text: message,
        data: { requestObject: request }
      });
      return { error: {
        code: ErrorCode.invalidRequest,
        message,
        data: { method: request.method }
      } };
    }
    const decodeResult = handler.requestType.paramsSerializer.deserializeFromJson(request.params);
    if (decodeResult.hasErrors) {
      const message = `Got invalid params: ${decodeResult.errorMessage}`;
      if (this._logger) this._logger.debug({
        text: message,
        data: {
          requestObject: request,
          errorMessage: decodeResult.errorMessage
        }
      });
      return { error: {
        code: ErrorCode.invalidParams,
        message,
        data: { errors: decodeResult.errorMessage }
      } };
    } else {
      const args = decodeResult.value;
      let response;
      try {
        const result = await handler.handler(args, requestId, context);
        if ("error" in result || "errorMessage" in result) {
          const errorData = result.error ? handler.requestType.errorSerializer.serializeToJson(result.error) : void 0;
          response = { error: {
            code: result.errorCode || ErrorCode.genericApplicationError,
            message: result.errorMessage || "An error was returned",
            data: errorData
          } };
        } else response = { result: handler.requestType.resultSerializer.serializeToJson(result.ok) };
      } catch (exception) {
        if (exception instanceof RequestHandlingError) response = { error: {
          code: exception.code,
          message: exception.message
        } };
        else {
          if (this._logger) this._logger.warn({
            text: `An exception was thrown while handling a request: ${exception}.`,
            exception,
            data: { requestObject: request }
          });
          response = { error: {
            code: ErrorCode.unexpectedServerError,
            message: this.sendExceptionDetails ? `An exception was thrown while handling a request: ${exception}.` : "Server has thrown an unexpected exception"
          } };
        }
      }
      return response;
    }
  }
  async handleNotification(request, context) {
    const handler = this._handler.get(request.method);
    if (!handler) {
      for (const h of this._unknownNotificationHandler) h(request);
      if (this._unknownNotificationHandler.size === 0) {
        if (this._logger) this._logger.debug({
          text: `Unhandled notification "${request.method}"`,
          data: { requestObject: request }
        });
      }
      return;
    }
    if (handler.kind != "notification") {
      if (this._logger) this._logger.debug({
        text: `"${request.method}" is registered as request, but was sent as notification.`,
        data: { requestObject: request }
      });
      return;
    }
    const decodeResult = handler.notificationType.paramsSerializer.deserializeFromJson(request.params);
    if (decodeResult.hasErrors) {
      if (this._logger) this._logger.debug({
        text: `Got invalid params: ${decodeResult}`,
        data: {
          requestObject: request,
          errorMessage: decodeResult.errorMessage
        }
      });
      return;
    }
    const val = decodeResult.value;
    for (const handlerFunc of handler.handlers) try {
      handlerFunc(val, context);
    } catch (exception) {
      if (this._logger) this._logger.warn({
        text: `An exception was thrown while handling a notification: ${exception}.`,
        exception,
        data: { requestObject: request }
      });
    }
  }
  registerUnknownNotificationHandler(handler) {
    return setAndDeleteOnDispose(this._unknownNotificationHandler, handler);
  }
  registerRequestHandler(requestType, handler) {
    if (this._handler.get(requestType.method)) throw new Error(`Handler with method "${requestType.method}" already registered.`);
    return setAndDeleteOnDispose(this._handler, requestType.method, {
      kind: "request",
      requestType,
      handler
    });
  }
  registerNotificationHandler(type, handler) {
    let registeredHandler = this._handler.get(type.method);
    if (!registeredHandler) {
      registeredHandler = {
        kind: "notification",
        notificationType: type,
        handlers: /* @__PURE__ */ new Set()
      };
      this._handler.set(type.method, registeredHandler);
    } else {
      if (registeredHandler.kind !== "notification") throw new Error(`Method "${type.method}" was already registered as request handler.`);
      if (registeredHandler.notificationType !== type) throw new Error(`Method "${type.method}" was registered for a different type.`);
    }
    return setAndDeleteOnDispose(registeredHandler.handlers, handler);
  }
  getRegisteredTypes() {
    const result = [];
    for (const h of this._handler.values()) if (h.kind === "notification") result.push(h.notificationType);
    else if (h.kind === "request") result.push(h.requestType);
    return result;
  }
  async request(requestType, args, context) {
    if (!this.checkChannel(this._requestSender)) throw new Error("Impossible");
    const params = requestType.paramsSerializer.serializeToJson(args);
    assertObjectArrayOrNull(params);
    const response = await this._requestSender.sendRequest({
      method: requestType.method,
      params
    }, context);
    if ("error" in response) {
      if (requestType.isOptional && response.error.code === ErrorCode.methodNotFound) return OptionalMethodNotFound;
      let errorData;
      if (response.error.data !== void 0) {
        const deserializationResult = requestType.errorSerializer.deserializeFromJson(response.error.data);
        if (deserializationResult.hasErrors) throw new Error(deserializationResult.errorMessage);
        errorData = deserializationResult.value;
      } else errorData = void 0;
      const error = new RequestHandlingError(response.error.message, errorData, response.error.code);
      this._requestDidErrorEventEmitter.fire({ error });
      throw error;
    } else {
      const result = requestType.resultSerializer.deserializeFromJson(response.result);
      if (result.hasErrors) throw new Error("Could not deserialize response: " + result.errorMessage + `

${JSON.stringify(response, null, 2)}`);
      else return result.value;
    }
  }
  async notify(notificationType, params, context) {
    if (!this.checkChannel(this._requestSender)) throw new Error();
    const encodedParams = notificationType.paramsSerializer.serializeToJson(params);
    assertObjectArrayOrNull(encodedParams);
    this._requestSender.sendNotification({
      method: notificationType.method,
      params: encodedParams
    }, context);
  }
};
function assertObjectArrayOrNull(val) {
  if (val !== null && Array.isArray(val) && typeof val !== "object") throw new Error("Invalid value! Only null, array and object is allowed.");
}
var RequestHandlingError = class RequestHandlingError2 extends Error {
  constructor(message, data, code = ErrorCode.genericApplicationError) {
    super(message);
    __publicField2(this, "data");
    __publicField2(this, "code");
    this.data = data;
    this.code = code;
    Object.setPrototypeOf(this, RequestHandlingError2.prototype);
  }
};
var RequestType = class RequestType2 {
  constructor(method, paramsSerializer, resultSerializer, errorSerializer, isOptional = false) {
    __publicField2(this, "method");
    __publicField2(this, "paramsSerializer");
    __publicField2(this, "resultSerializer");
    __publicField2(this, "errorSerializer");
    __publicField2(this, "isOptional");
    __publicField2(this, "kind", "request");
    this.method = method;
    this.paramsSerializer = paramsSerializer;
    this.resultSerializer = resultSerializer;
    this.errorSerializer = errorSerializer;
    this.isOptional = isOptional;
  }
  withMethod(method) {
    return new RequestType2(method, this.paramsSerializer, this.resultSerializer, this.errorSerializer);
  }
  optional() {
    return new RequestType2(this.method, this.paramsSerializer, this.resultSerializer, this.errorSerializer, true);
  }
};
var NotificationType = class NotificationType2 {
  constructor(method, paramsSerializer) {
    __publicField2(this, "method");
    __publicField2(this, "paramsSerializer");
    __publicField2(this, "kind", "notification");
    this.method = method;
    this.paramsSerializer = paramsSerializer;
  }
  withMethod(method) {
    return new NotificationType2(method, this.paramsSerializer);
  }
};
function unverifiedRequest(request) {
  return new RequestType((request || {}).method, Serializers.sAny(), Serializers.sAny(), Serializers.sAny());
}
function unverifiedNotification(request) {
  return new NotificationType((request || {}).method, Serializers.sAny());
}
var IsErrorWrapper = /* @__PURE__ */ Symbol();
var ErrorWrapper = (_b = IsErrorWrapper, _c = class {
  constructor(error) {
    __publicField2(this, "error");
    __publicField2(this, _b);
    this.error = error;
  }
}, __publicField2(_c, "factory", (error) => {
  return new _c(error);
}), _c);
function contract(contractObj) {
  const server = transform(contractObj["server"]);
  const client = transform(contractObj["client"]);
  return new Contract(contractObj.tags || [], server, client);
}
function transform(requestMap) {
  const result = {};
  for (const [key, req] of Object.entries(requestMap)) {
    const method = req.method ? req.method : key;
    result[key] = req.withMethod(method);
  }
  return result;
}
var Contract = class Contract2 {
  constructor(tags = [], server, client) {
    __publicField2(this, "tags");
    __publicField2(this, "server");
    __publicField2(this, "client");
    this.tags = tags;
    this.server = server;
    this.client = client;
  }
  _onlyDesignTime() {
    return /* @__PURE__ */ new Error("This property is not meant to be accessed at runtime");
  }
  get TContractObject() {
    throw this._onlyDesignTime();
  }
  get TClientInterface() {
    throw this._onlyDesignTime();
  }
  get TServerInterface() {
    throw this._onlyDesignTime();
  }
  get TClientHandler() {
    throw this._onlyDesignTime();
  }
  get TServerHandler() {
    throw this._onlyDesignTime();
  }
  get TTags() {
    throw this._onlyDesignTime();
  }
  getInterface(typedChannel, myContract, otherContract, myInterface) {
    const counterpart = this.buildCounterpart(typedChannel, otherContract);
    const disposable = this.registerHandlers(typedChannel, myContract, myInterface, counterpart);
    return {
      counterpart,
      dispose: () => disposable.dispose()
    };
  }
  buildCounterpart(typedChannel, otherContract) {
    const counterpart = {};
    for (const [key, req] of Object.entries(otherContract)) {
      let method;
      if (req.kind === "request") if (req.isOptional) method = async (args, context) => {
        if (args === void 0) args = {};
        try {
          return await typedChannel.request(req, args, context);
        } catch (error) {
          if (error && error.code === ErrorCode.methodNotFound) return OptionalMethodNotFound;
          throw error;
        }
      };
      else method = (args, context) => {
        if (args === void 0) args = {};
        return typedChannel.request(req, args, context);
      };
      else method = (args, context) => {
        if (args === void 0) args = {};
        return typedChannel.notify(req, args, context);
      };
      counterpart[key] = method;
    }
    return counterpart;
  }
  registerHandlers(typedChannel, myContract, myInterface, counterpart) {
    const disposables = [];
    for (const [key, req] of Object.entries(myContract)) if (req.kind === "request") {
      let method = myInterface[key];
      if (!method) continue;
      const handler = this.createRequestHandler(counterpart, method);
      disposables.push(typedChannel.registerRequestHandler(req, handler));
    } else {
      const method = myInterface[key];
      if (method) disposables.push(typedChannel.registerNotificationHandler(req, (args, context) => {
        method(args, {
          context,
          counterpart
        });
      }));
    }
    return { dispose: () => disposables.forEach((d) => d.dispose()) };
  }
  createRequestHandler(counterpart, method) {
    return async (args, requestId, listenerContext) => {
      const result = await method(args, {
        context: listenerContext,
        counterpart,
        newErr: ErrorWrapper.factory,
        requestId
      });
      if (result instanceof ErrorWrapper) return result.error;
      return { ok: result };
    };
  }
  /**
  * Gets a server object directly from a stream by constructing a new `TypedChannel`.
  * It also registers the client implementation to the stream.
  * The channel starts listening immediately.
  */
  static getServerFromStream(contract$1, stream, options, clientImplementation) {
    const channel = TypedChannel.fromTransport(stream, options);
    const { server } = contract$1.getServer(channel, clientImplementation);
    channel.startListen();
    return {
      channel,
      server
    };
  }
  /**
  * Gets a client object directly from a stream by constructing a new `TypedChannel`.
  * It also registers the server implementation to the stream.
  * The channel starts listening immediately.
  */
  static registerServerToStream(contract$1, stream, options, serverImplementation) {
    const channel = TypedChannel.fromTransport(stream, options);
    const { client } = contract$1.registerServer(channel, serverImplementation);
    channel.startListen();
    return {
      channel,
      client
    };
  }
  getServer(typedChannel, clientImplementation) {
    const { counterpart, dispose } = this.getInterface(typedChannel, this.client, this.server, clientImplementation);
    return {
      server: counterpart,
      dispose
    };
  }
  registerServer(typedChannel, serverImplementation) {
    const { counterpart, dispose } = this.getInterface(typedChannel, this.server, this.client, serverImplementation);
    return {
      client: counterpart,
      dispose
    };
  }
  withContext() {
    return new Contract2(this.tags, this.server, this.client);
  }
};
var FoldingRangeKind = /* @__PURE__ */ (function(FoldingRangeKind$1) {
  FoldingRangeKind$1["Comment"] = "comment";
  FoldingRangeKind$1["Imports"] = "imports";
  FoldingRangeKind$1["Region"] = "region";
  return FoldingRangeKind$1;
})({});
var SymbolKind = /* @__PURE__ */ (function(SymbolKind$1) {
  SymbolKind$1[SymbolKind$1["File"] = 1] = "File";
  SymbolKind$1[SymbolKind$1["Module"] = 2] = "Module";
  SymbolKind$1[SymbolKind$1["Namespace"] = 3] = "Namespace";
  SymbolKind$1[SymbolKind$1["Package"] = 4] = "Package";
  SymbolKind$1[SymbolKind$1["Class"] = 5] = "Class";
  SymbolKind$1[SymbolKind$1["Method"] = 6] = "Method";
  SymbolKind$1[SymbolKind$1["Property"] = 7] = "Property";
  SymbolKind$1[SymbolKind$1["Field"] = 8] = "Field";
  SymbolKind$1[SymbolKind$1["Constructor"] = 9] = "Constructor";
  SymbolKind$1[SymbolKind$1["Enum"] = 10] = "Enum";
  SymbolKind$1[SymbolKind$1["Interface"] = 11] = "Interface";
  SymbolKind$1[SymbolKind$1["Function"] = 12] = "Function";
  SymbolKind$1[SymbolKind$1["Variable"] = 13] = "Variable";
  SymbolKind$1[SymbolKind$1["Constant"] = 14] = "Constant";
  SymbolKind$1[SymbolKind$1["String"] = 15] = "String";
  SymbolKind$1[SymbolKind$1["Number"] = 16] = "Number";
  SymbolKind$1[SymbolKind$1["Boolean"] = 17] = "Boolean";
  SymbolKind$1[SymbolKind$1["Array"] = 18] = "Array";
  SymbolKind$1[SymbolKind$1["Object"] = 19] = "Object";
  SymbolKind$1[SymbolKind$1["Key"] = 20] = "Key";
  SymbolKind$1[SymbolKind$1["Null"] = 21] = "Null";
  SymbolKind$1[SymbolKind$1["EnumMember"] = 22] = "EnumMember";
  SymbolKind$1[SymbolKind$1["Struct"] = 23] = "Struct";
  SymbolKind$1[SymbolKind$1["Event"] = 24] = "Event";
  SymbolKind$1[SymbolKind$1["Operator"] = 25] = "Operator";
  SymbolKind$1[SymbolKind$1["TypeParameter"] = 26] = "TypeParameter";
  return SymbolKind$1;
})({});
var SymbolTag = /* @__PURE__ */ (function(SymbolTag$1) {
  SymbolTag$1[SymbolTag$1["Deprecated"] = 1] = "Deprecated";
  return SymbolTag$1;
})({});
var InlayHintKind = /* @__PURE__ */ (function(InlayHintKind$1) {
  InlayHintKind$1[InlayHintKind$1["Type"] = 1] = "Type";
  InlayHintKind$1[InlayHintKind$1["Parameter"] = 2] = "Parameter";
  return InlayHintKind$1;
})({});
var CompletionItemKind = /* @__PURE__ */ (function(CompletionItemKind$1) {
  CompletionItemKind$1[CompletionItemKind$1["Text"] = 1] = "Text";
  CompletionItemKind$1[CompletionItemKind$1["Method"] = 2] = "Method";
  CompletionItemKind$1[CompletionItemKind$1["Function"] = 3] = "Function";
  CompletionItemKind$1[CompletionItemKind$1["Constructor"] = 4] = "Constructor";
  CompletionItemKind$1[CompletionItemKind$1["Field"] = 5] = "Field";
  CompletionItemKind$1[CompletionItemKind$1["Variable"] = 6] = "Variable";
  CompletionItemKind$1[CompletionItemKind$1["Class"] = 7] = "Class";
  CompletionItemKind$1[CompletionItemKind$1["Interface"] = 8] = "Interface";
  CompletionItemKind$1[CompletionItemKind$1["Module"] = 9] = "Module";
  CompletionItemKind$1[CompletionItemKind$1["Property"] = 10] = "Property";
  CompletionItemKind$1[CompletionItemKind$1["Unit"] = 11] = "Unit";
  CompletionItemKind$1[CompletionItemKind$1["Value"] = 12] = "Value";
  CompletionItemKind$1[CompletionItemKind$1["Enum"] = 13] = "Enum";
  CompletionItemKind$1[CompletionItemKind$1["Keyword"] = 14] = "Keyword";
  CompletionItemKind$1[CompletionItemKind$1["Snippet"] = 15] = "Snippet";
  CompletionItemKind$1[CompletionItemKind$1["Color"] = 16] = "Color";
  CompletionItemKind$1[CompletionItemKind$1["File"] = 17] = "File";
  CompletionItemKind$1[CompletionItemKind$1["Reference"] = 18] = "Reference";
  CompletionItemKind$1[CompletionItemKind$1["Folder"] = 19] = "Folder";
  CompletionItemKind$1[CompletionItemKind$1["EnumMember"] = 20] = "EnumMember";
  CompletionItemKind$1[CompletionItemKind$1["Constant"] = 21] = "Constant";
  CompletionItemKind$1[CompletionItemKind$1["Struct"] = 22] = "Struct";
  CompletionItemKind$1[CompletionItemKind$1["Event"] = 23] = "Event";
  CompletionItemKind$1[CompletionItemKind$1["Operator"] = 24] = "Operator";
  CompletionItemKind$1[CompletionItemKind$1["TypeParameter"] = 25] = "TypeParameter";
  return CompletionItemKind$1;
})({});
var CompletionItemTag = /* @__PURE__ */ (function(CompletionItemTag$1) {
  CompletionItemTag$1[CompletionItemTag$1["Deprecated"] = 1] = "Deprecated";
  return CompletionItemTag$1;
})({});
var InsertTextFormat = /* @__PURE__ */ (function(InsertTextFormat$1) {
  InsertTextFormat$1[InsertTextFormat$1["PlainText"] = 1] = "PlainText";
  InsertTextFormat$1[InsertTextFormat$1["Snippet"] = 2] = "Snippet";
  return InsertTextFormat$1;
})({});
var DocumentHighlightKind = /* @__PURE__ */ (function(DocumentHighlightKind$1) {
  DocumentHighlightKind$1[DocumentHighlightKind$1["Text"] = 1] = "Text";
  DocumentHighlightKind$1[DocumentHighlightKind$1["Read"] = 2] = "Read";
  DocumentHighlightKind$1[DocumentHighlightKind$1["Write"] = 3] = "Write";
  return DocumentHighlightKind$1;
})({});
var CodeActionKind = /* @__PURE__ */ (function(CodeActionKind$1) {
  CodeActionKind$1["Empty"] = "";
  CodeActionKind$1["QuickFix"] = "quickfix";
  CodeActionKind$1["Refactor"] = "refactor";
  CodeActionKind$1["RefactorExtract"] = "refactor.extract";
  CodeActionKind$1["RefactorInline"] = "refactor.inline";
  CodeActionKind$1["RefactorRewrite"] = "refactor.rewrite";
  CodeActionKind$1["Source"] = "source";
  CodeActionKind$1["SourceOrganizeImports"] = "source.organizeImports";
  CodeActionKind$1["SourceFixAll"] = "source.fixAll";
  return CodeActionKind$1;
})({});
var DiagnosticSeverity = /* @__PURE__ */ (function(DiagnosticSeverity$1) {
  DiagnosticSeverity$1[DiagnosticSeverity$1["Error"] = 1] = "Error";
  DiagnosticSeverity$1[DiagnosticSeverity$1["Warning"] = 2] = "Warning";
  DiagnosticSeverity$1[DiagnosticSeverity$1["Information"] = 3] = "Information";
  DiagnosticSeverity$1[DiagnosticSeverity$1["Hint"] = 4] = "Hint";
  return DiagnosticSeverity$1;
})({});
var DiagnosticTag = /* @__PURE__ */ (function(DiagnosticTag$1) {
  DiagnosticTag$1[DiagnosticTag$1["Unnecessary"] = 1] = "Unnecessary";
  DiagnosticTag$1[DiagnosticTag$1["Deprecated"] = 2] = "Deprecated";
  return DiagnosticTag$1;
})({});
var CompletionTriggerKind = /* @__PURE__ */ (function(CompletionTriggerKind$1) {
  CompletionTriggerKind$1[CompletionTriggerKind$1["Invoked"] = 1] = "Invoked";
  CompletionTriggerKind$1[CompletionTriggerKind$1["TriggerCharacter"] = 2] = "TriggerCharacter";
  CompletionTriggerKind$1[CompletionTriggerKind$1["TriggerForIncompleteCompletions"] = 3] = "TriggerForIncompleteCompletions";
  return CompletionTriggerKind$1;
})({});
var SignatureHelpTriggerKind = /* @__PURE__ */ (function(SignatureHelpTriggerKind$1) {
  SignatureHelpTriggerKind$1[SignatureHelpTriggerKind$1["Invoked"] = 1] = "Invoked";
  SignatureHelpTriggerKind$1[SignatureHelpTriggerKind$1["TriggerCharacter"] = 2] = "TriggerCharacter";
  SignatureHelpTriggerKind$1[SignatureHelpTriggerKind$1["ContentChange"] = 3] = "ContentChange";
  return SignatureHelpTriggerKind$1;
})({});
var CodeActionTriggerKind = /* @__PURE__ */ (function(CodeActionTriggerKind$1) {
  CodeActionTriggerKind$1[CodeActionTriggerKind$1["Invoked"] = 1] = "Invoked";
  CodeActionTriggerKind$1[CodeActionTriggerKind$1["Automatic"] = 2] = "Automatic";
  return CodeActionTriggerKind$1;
})({});
var Capability = class {
  constructor(method) {
    this.method = method;
  }
};
var capabilities = {
  textDocumentImplementation: new Capability("textDocument/implementation"),
  textDocumentTypeDefinition: new Capability("textDocument/typeDefinition"),
  textDocumentDocumentColor: new Capability("textDocument/documentColor"),
  textDocumentColorPresentation: new Capability("textDocument/colorPresentation"),
  textDocumentFoldingRange: new Capability("textDocument/foldingRange"),
  textDocumentDeclaration: new Capability("textDocument/declaration"),
  textDocumentSelectionRange: new Capability("textDocument/selectionRange"),
  textDocumentPrepareCallHierarchy: new Capability("textDocument/prepareCallHierarchy"),
  textDocumentSemanticTokensFull: new Capability("textDocument/semanticTokens/full"),
  textDocumentSemanticTokensFullDelta: new Capability("textDocument/semanticTokens/full/delta"),
  textDocumentLinkedEditingRange: new Capability("textDocument/linkedEditingRange"),
  workspaceWillCreateFiles: new Capability("workspace/willCreateFiles"),
  workspaceWillRenameFiles: new Capability("workspace/willRenameFiles"),
  workspaceWillDeleteFiles: new Capability("workspace/willDeleteFiles"),
  textDocumentMoniker: new Capability("textDocument/moniker"),
  textDocumentPrepareTypeHierarchy: new Capability("textDocument/prepareTypeHierarchy"),
  textDocumentInlineValue: new Capability("textDocument/inlineValue"),
  textDocumentInlayHint: new Capability("textDocument/inlayHint"),
  textDocumentDiagnostic: new Capability("textDocument/diagnostic"),
  textDocumentInlineCompletion: new Capability("textDocument/inlineCompletion"),
  textDocumentWillSaveWaitUntil: new Capability("textDocument/willSaveWaitUntil"),
  textDocumentCompletion: new Capability("textDocument/completion"),
  textDocumentHover: new Capability("textDocument/hover"),
  textDocumentSignatureHelp: new Capability("textDocument/signatureHelp"),
  textDocumentDefinition: new Capability("textDocument/definition"),
  textDocumentReferences: new Capability("textDocument/references"),
  textDocumentDocumentHighlight: new Capability("textDocument/documentHighlight"),
  textDocumentDocumentSymbol: new Capability("textDocument/documentSymbol"),
  textDocumentCodeAction: new Capability("textDocument/codeAction"),
  workspaceSymbol: new Capability("workspace/symbol"),
  textDocumentCodeLens: new Capability("textDocument/codeLens"),
  textDocumentDocumentLink: new Capability("textDocument/documentLink"),
  textDocumentFormatting: new Capability("textDocument/formatting"),
  textDocumentRangeFormatting: new Capability("textDocument/rangeFormatting"),
  textDocumentRangesFormatting: new Capability("textDocument/rangesFormatting"),
  textDocumentOnTypeFormatting: new Capability("textDocument/onTypeFormatting"),
  textDocumentRename: new Capability("textDocument/rename"),
  workspaceExecuteCommand: new Capability("workspace/executeCommand"),
  workspaceDidCreateFiles: new Capability("workspace/didCreateFiles"),
  workspaceDidRenameFiles: new Capability("workspace/didRenameFiles"),
  workspaceDidDeleteFiles: new Capability("workspace/didDeleteFiles"),
  workspaceDidChangeConfiguration: new Capability("workspace/didChangeConfiguration"),
  textDocumentDidOpen: new Capability("textDocument/didOpen"),
  textDocumentDidChange: new Capability("textDocument/didChange"),
  textDocumentDidClose: new Capability("textDocument/didClose"),
  textDocumentDidSave: new Capability("textDocument/didSave"),
  textDocumentWillSave: new Capability("textDocument/willSave"),
  workspaceDidChangeWatchedFiles: new Capability("workspace/didChangeWatchedFiles")
};
var api = contract({
  server: {
    textDocumentImplementation: unverifiedRequest({ method: "textDocument/implementation" }),
    textDocumentTypeDefinition: unverifiedRequest({ method: "textDocument/typeDefinition" }),
    textDocumentDocumentColor: unverifiedRequest({ method: "textDocument/documentColor" }),
    textDocumentColorPresentation: unverifiedRequest({ method: "textDocument/colorPresentation" }),
    textDocumentFoldingRange: unverifiedRequest({ method: "textDocument/foldingRange" }),
    textDocumentDeclaration: unverifiedRequest({ method: "textDocument/declaration" }),
    textDocumentSelectionRange: unverifiedRequest({ method: "textDocument/selectionRange" }),
    textDocumentPrepareCallHierarchy: unverifiedRequest({ method: "textDocument/prepareCallHierarchy" }),
    callHierarchyIncomingCalls: unverifiedRequest({ method: "callHierarchy/incomingCalls" }),
    callHierarchyOutgoingCalls: unverifiedRequest({ method: "callHierarchy/outgoingCalls" }),
    textDocumentSemanticTokensFull: unverifiedRequest({ method: "textDocument/semanticTokens/full" }),
    textDocumentSemanticTokensFullDelta: unverifiedRequest({ method: "textDocument/semanticTokens/full/delta" }),
    textDocumentSemanticTokensRange: unverifiedRequest({ method: "textDocument/semanticTokens/range" }),
    textDocumentLinkedEditingRange: unverifiedRequest({ method: "textDocument/linkedEditingRange" }),
    workspaceWillCreateFiles: unverifiedRequest({ method: "workspace/willCreateFiles" }),
    workspaceWillRenameFiles: unverifiedRequest({ method: "workspace/willRenameFiles" }),
    workspaceWillDeleteFiles: unverifiedRequest({ method: "workspace/willDeleteFiles" }),
    textDocumentMoniker: unverifiedRequest({ method: "textDocument/moniker" }),
    textDocumentPrepareTypeHierarchy: unverifiedRequest({ method: "textDocument/prepareTypeHierarchy" }),
    typeHierarchySupertypes: unverifiedRequest({ method: "typeHierarchy/supertypes" }),
    typeHierarchySubtypes: unverifiedRequest({ method: "typeHierarchy/subtypes" }),
    textDocumentInlineValue: unverifiedRequest({ method: "textDocument/inlineValue" }),
    textDocumentInlayHint: unverifiedRequest({ method: "textDocument/inlayHint" }),
    inlayHintResolve: unverifiedRequest({ method: "inlayHint/resolve" }),
    textDocumentDiagnostic: unverifiedRequest({ method: "textDocument/diagnostic" }),
    workspaceDiagnostic: unverifiedRequest({ method: "workspace/diagnostic" }),
    textDocumentInlineCompletion: unverifiedRequest({ method: "textDocument/inlineCompletion" }),
    initialize: unverifiedRequest({ method: "initialize" }),
    shutdown: unverifiedRequest({ method: "shutdown" }),
    textDocumentWillSaveWaitUntil: unverifiedRequest({ method: "textDocument/willSaveWaitUntil" }),
    textDocumentCompletion: unverifiedRequest({ method: "textDocument/completion" }),
    completionItemResolve: unverifiedRequest({ method: "completionItem/resolve" }),
    textDocumentHover: unverifiedRequest({ method: "textDocument/hover" }),
    textDocumentSignatureHelp: unverifiedRequest({ method: "textDocument/signatureHelp" }),
    textDocumentDefinition: unverifiedRequest({ method: "textDocument/definition" }),
    textDocumentReferences: unverifiedRequest({ method: "textDocument/references" }),
    textDocumentDocumentHighlight: unverifiedRequest({ method: "textDocument/documentHighlight" }),
    textDocumentDocumentSymbol: unverifiedRequest({ method: "textDocument/documentSymbol" }),
    textDocumentCodeAction: unverifiedRequest({ method: "textDocument/codeAction" }),
    codeActionResolve: unverifiedRequest({ method: "codeAction/resolve" }),
    workspaceSymbol: unverifiedRequest({ method: "workspace/symbol" }),
    workspaceSymbolResolve: unverifiedRequest({ method: "workspaceSymbol/resolve" }),
    textDocumentCodeLens: unverifiedRequest({ method: "textDocument/codeLens" }),
    codeLensResolve: unverifiedRequest({ method: "codeLens/resolve" }),
    textDocumentDocumentLink: unverifiedRequest({ method: "textDocument/documentLink" }),
    documentLinkResolve: unverifiedRequest({ method: "documentLink/resolve" }),
    textDocumentFormatting: unverifiedRequest({ method: "textDocument/formatting" }),
    textDocumentRangeFormatting: unverifiedRequest({ method: "textDocument/rangeFormatting" }),
    textDocumentRangesFormatting: unverifiedRequest({ method: "textDocument/rangesFormatting" }),
    textDocumentOnTypeFormatting: unverifiedRequest({ method: "textDocument/onTypeFormatting" }),
    textDocumentRename: unverifiedRequest({ method: "textDocument/rename" }),
    textDocumentPrepareRename: unverifiedRequest({ method: "textDocument/prepareRename" }),
    workspaceExecuteCommand: unverifiedRequest({ method: "workspace/executeCommand" }),
    workspaceDidChangeWorkspaceFolders: unverifiedNotification({ method: "workspace/didChangeWorkspaceFolders" }),
    windowWorkDoneProgressCancel: unverifiedNotification({ method: "window/workDoneProgress/cancel" }),
    workspaceDidCreateFiles: unverifiedNotification({ method: "workspace/didCreateFiles" }),
    workspaceDidRenameFiles: unverifiedNotification({ method: "workspace/didRenameFiles" }),
    workspaceDidDeleteFiles: unverifiedNotification({ method: "workspace/didDeleteFiles" }),
    notebookDocumentDidOpen: unverifiedNotification({ method: "notebookDocument/didOpen" }),
    notebookDocumentDidChange: unverifiedNotification({ method: "notebookDocument/didChange" }),
    notebookDocumentDidSave: unverifiedNotification({ method: "notebookDocument/didSave" }),
    notebookDocumentDidClose: unverifiedNotification({ method: "notebookDocument/didClose" }),
    initialized: unverifiedNotification({ method: "initialized" }),
    exit: unverifiedNotification({ method: "exit" }),
    workspaceDidChangeConfiguration: unverifiedNotification({ method: "workspace/didChangeConfiguration" }),
    textDocumentDidOpen: unverifiedNotification({ method: "textDocument/didOpen" }),
    textDocumentDidChange: unverifiedNotification({ method: "textDocument/didChange" }),
    textDocumentDidClose: unverifiedNotification({ method: "textDocument/didClose" }),
    textDocumentDidSave: unverifiedNotification({ method: "textDocument/didSave" }),
    textDocumentWillSave: unverifiedNotification({ method: "textDocument/willSave" }),
    workspaceDidChangeWatchedFiles: unverifiedNotification({ method: "workspace/didChangeWatchedFiles" }),
    setTrace: unverifiedNotification({ method: "$/setTrace" }),
    cancelRequest: unverifiedNotification({ method: "$/cancelRequest" }),
    progress: unverifiedNotification({ method: "$/progress" })
  },
  client: {
    workspaceWorkspaceFolders: unverifiedRequest({ method: "workspace/workspaceFolders" }).optional(),
    workspaceConfiguration: unverifiedRequest({ method: "workspace/configuration" }).optional(),
    workspaceFoldingRangeRefresh: unverifiedRequest({ method: "workspace/foldingRange/refresh" }).optional(),
    windowWorkDoneProgressCreate: unverifiedRequest({ method: "window/workDoneProgress/create" }).optional(),
    workspaceSemanticTokensRefresh: unverifiedRequest({ method: "workspace/semanticTokens/refresh" }).optional(),
    windowShowDocument: unverifiedRequest({ method: "window/showDocument" }).optional(),
    workspaceInlineValueRefresh: unverifiedRequest({ method: "workspace/inlineValue/refresh" }).optional(),
    workspaceInlayHintRefresh: unverifiedRequest({ method: "workspace/inlayHint/refresh" }).optional(),
    workspaceDiagnosticRefresh: unverifiedRequest({ method: "workspace/diagnostic/refresh" }).optional(),
    clientRegisterCapability: unverifiedRequest({ method: "client/registerCapability" }).optional(),
    clientUnregisterCapability: unverifiedRequest({ method: "client/unregisterCapability" }).optional(),
    windowShowMessageRequest: unverifiedRequest({ method: "window/showMessageRequest" }).optional(),
    workspaceCodeLensRefresh: unverifiedRequest({ method: "workspace/codeLens/refresh" }).optional(),
    workspaceApplyEdit: unverifiedRequest({ method: "workspace/applyEdit" }).optional(),
    windowShowMessage: unverifiedNotification({ method: "window/showMessage" }),
    windowLogMessage: unverifiedNotification({ method: "window/logMessage" }),
    telemetryEvent: unverifiedNotification({ method: "telemetry/event" }),
    textDocumentPublishDiagnostics: unverifiedNotification({ method: "textDocument/publishDiagnostics" }),
    logTrace: unverifiedNotification({ method: "$/logTrace" }),
    cancelRequest: unverifiedNotification({ method: "$/cancelRequest" }),
    progress: unverifiedNotification({ method: "$/progress" })
  }
});
var Disposable2 = (_d = class {
  constructor() {
    __publicField2(this, "_store", new DisposableStore());
  }
  dispose() {
    this._store.dispose();
  }
  _register(t) {
    if (t === this) throw new Error("Cannot register a disposable on itself!");
    return this._store.add(t);
  }
}, __publicField2(_d, "None", Object.freeze({ dispose() {
} })), _d);
var DisposableStore = (_e = class {
  constructor() {
    __publicField2(this, "_toDispose", /* @__PURE__ */ new Set());
    __publicField2(this, "_isDisposed", false);
  }
  dispose() {
    if (this._isDisposed) return;
    this._isDisposed = true;
    this.clear();
  }
  clear() {
    if (this._toDispose.size === 0) return;
    try {
      for (const item of this._toDispose) item.dispose();
    } finally {
      this._toDispose.clear();
    }
  }
  add(t) {
    if (!t) return t;
    if (t === this) throw new Error("Cannot register a disposable on itself!");
    if (this._isDisposed) {
      if (!_e.DISABLE_DISPOSED_WARNING) console.warn((/* @__PURE__ */ new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!")).stack);
    } else this._toDispose.add(t);
    return t;
  }
}, __publicField2(_e, "DISABLE_DISPOSED_WARNING", false), _e);
var lspCodeActionKindToMonacoCodeActionKind = /* @__PURE__ */ new Map([
  [CodeActionKind.Empty, ""],
  [CodeActionKind.QuickFix, "quickfix"],
  [CodeActionKind.Refactor, "refactor"],
  [CodeActionKind.RefactorExtract, "refactor.extract"],
  [CodeActionKind.RefactorInline, "refactor.inline"],
  [CodeActionKind.RefactorRewrite, "refactor.rewrite"],
  [CodeActionKind.Source, "source"],
  [CodeActionKind.SourceOrganizeImports, "source.organizeImports"],
  [CodeActionKind.SourceFixAll, "source.fixAll"]
]);
var monacoCodeActionTriggerTypeToLspCodeActionTriggerKind = /* @__PURE__ */ new Map([[languages.CodeActionTriggerType.Invoke, CodeActionTriggerKind.Invoked], [languages.CodeActionTriggerType.Auto, CodeActionTriggerKind.Automatic]]);
var lspCompletionItemKindToMonacoCompletionItemKind = /* @__PURE__ */ new Map([
  [CompletionItemKind.Text, languages.CompletionItemKind.Text],
  [CompletionItemKind.Method, languages.CompletionItemKind.Method],
  [CompletionItemKind.Function, languages.CompletionItemKind.Function],
  [CompletionItemKind.Constructor, languages.CompletionItemKind.Constructor],
  [CompletionItemKind.Field, languages.CompletionItemKind.Field],
  [CompletionItemKind.Variable, languages.CompletionItemKind.Variable],
  [CompletionItemKind.Class, languages.CompletionItemKind.Class],
  [CompletionItemKind.Interface, languages.CompletionItemKind.Interface],
  [CompletionItemKind.Module, languages.CompletionItemKind.Module],
  [CompletionItemKind.Property, languages.CompletionItemKind.Property],
  [CompletionItemKind.Unit, languages.CompletionItemKind.Unit],
  [CompletionItemKind.Value, languages.CompletionItemKind.Value],
  [CompletionItemKind.Enum, languages.CompletionItemKind.Enum],
  [CompletionItemKind.Keyword, languages.CompletionItemKind.Keyword],
  [CompletionItemKind.Snippet, languages.CompletionItemKind.Snippet],
  [CompletionItemKind.Color, languages.CompletionItemKind.Color],
  [CompletionItemKind.File, languages.CompletionItemKind.File],
  [CompletionItemKind.Reference, languages.CompletionItemKind.Reference],
  [CompletionItemKind.Folder, languages.CompletionItemKind.Folder],
  [CompletionItemKind.EnumMember, languages.CompletionItemKind.EnumMember],
  [CompletionItemKind.Constant, languages.CompletionItemKind.Constant],
  [CompletionItemKind.Struct, languages.CompletionItemKind.Struct],
  [CompletionItemKind.Event, languages.CompletionItemKind.Event],
  [CompletionItemKind.Operator, languages.CompletionItemKind.Operator],
  [CompletionItemKind.TypeParameter, languages.CompletionItemKind.TypeParameter]
]);
var lspCompletionItemTagToMonacoCompletionItemTag = /* @__PURE__ */ new Map([[CompletionItemTag.Deprecated, languages.CompletionItemTag.Deprecated]]);
var monacoCompletionTriggerKindToLspCompletionTriggerKind = /* @__PURE__ */ new Map([
  [languages.CompletionTriggerKind.Invoke, CompletionTriggerKind.Invoked],
  [languages.CompletionTriggerKind.TriggerCharacter, CompletionTriggerKind.TriggerCharacter],
  [languages.CompletionTriggerKind.TriggerForIncompleteCompletions, CompletionTriggerKind.TriggerForIncompleteCompletions]
]);
var lspInsertTextFormatToMonacoInsertTextRules = /* @__PURE__ */ new Map([[InsertTextFormat.Snippet, languages.CompletionItemInsertTextRule.InsertAsSnippet]]);
var lspSymbolKindToMonacoSymbolKind = /* @__PURE__ */ new Map([
  [SymbolKind.File, languages.SymbolKind.File],
  [SymbolKind.Module, languages.SymbolKind.Module],
  [SymbolKind.Namespace, languages.SymbolKind.Namespace],
  [SymbolKind.Package, languages.SymbolKind.Package],
  [SymbolKind.Class, languages.SymbolKind.Class],
  [SymbolKind.Method, languages.SymbolKind.Method],
  [SymbolKind.Property, languages.SymbolKind.Property],
  [SymbolKind.Field, languages.SymbolKind.Field],
  [SymbolKind.Constructor, languages.SymbolKind.Constructor],
  [SymbolKind.Enum, languages.SymbolKind.Enum],
  [SymbolKind.Interface, languages.SymbolKind.Interface],
  [SymbolKind.Function, languages.SymbolKind.Function],
  [SymbolKind.Variable, languages.SymbolKind.Variable],
  [SymbolKind.Constant, languages.SymbolKind.Constant],
  [SymbolKind.String, languages.SymbolKind.String],
  [SymbolKind.Number, languages.SymbolKind.Number],
  [SymbolKind.Boolean, languages.SymbolKind.Boolean],
  [SymbolKind.Array, languages.SymbolKind.Array],
  [SymbolKind.Object, languages.SymbolKind.Object],
  [SymbolKind.Key, languages.SymbolKind.Key],
  [SymbolKind.Null, languages.SymbolKind.Null],
  [SymbolKind.EnumMember, languages.SymbolKind.EnumMember],
  [SymbolKind.Struct, languages.SymbolKind.Struct],
  [SymbolKind.Event, languages.SymbolKind.Event],
  [SymbolKind.Operator, languages.SymbolKind.Operator],
  [SymbolKind.TypeParameter, languages.SymbolKind.TypeParameter]
]);
var lspSymbolTagToMonacoSymbolTag = /* @__PURE__ */ new Map([[SymbolTag.Deprecated, languages.SymbolTag.Deprecated]]);
var lspDocumentHighlightKindToMonacoDocumentHighlightKind = /* @__PURE__ */ new Map([
  [DocumentHighlightKind.Text, languages.DocumentHighlightKind.Text],
  [DocumentHighlightKind.Read, languages.DocumentHighlightKind.Read],
  [DocumentHighlightKind.Write, languages.DocumentHighlightKind.Write]
]);
var lspFoldingRangeKindToMonacoFoldingRangeKind = /* @__PURE__ */ new Map([
  [FoldingRangeKind.Comment, languages.FoldingRangeKind.Comment],
  [FoldingRangeKind.Imports, languages.FoldingRangeKind.Imports],
  [FoldingRangeKind.Region, languages.FoldingRangeKind.Region]
]);
var monacoMarkerSeverityToLspDiagnosticSeverity = /* @__PURE__ */ new Map([
  [MarkerSeverity.Error, DiagnosticSeverity.Error],
  [MarkerSeverity.Warning, DiagnosticSeverity.Warning],
  [MarkerSeverity.Info, DiagnosticSeverity.Information],
  [MarkerSeverity.Hint, DiagnosticSeverity.Hint]
]);
var lspDiagnosticSeverityToMonacoMarkerSeverity = /* @__PURE__ */ new Map([
  [DiagnosticSeverity.Error, MarkerSeverity.Error],
  [DiagnosticSeverity.Warning, MarkerSeverity.Warning],
  [DiagnosticSeverity.Information, MarkerSeverity.Info],
  [DiagnosticSeverity.Hint, MarkerSeverity.Hint]
]);
var lspDiagnosticTagToMonacoMarkerTag = /* @__PURE__ */ new Map([[DiagnosticTag.Unnecessary, MarkerTag.Unnecessary], [DiagnosticTag.Deprecated, MarkerTag.Deprecated]]);
var monacoSignatureHelpTriggerKindToLspSignatureHelpTriggerKind = /* @__PURE__ */ new Map([
  [languages.SignatureHelpTriggerKind.Invoke, SignatureHelpTriggerKind.Invoked],
  [languages.SignatureHelpTriggerKind.TriggerCharacter, SignatureHelpTriggerKind.TriggerCharacter],
  [languages.SignatureHelpTriggerKind.ContentChange, SignatureHelpTriggerKind.ContentChange]
]);
var lspInlayHintKindToMonacoInlayHintKind = /* @__PURE__ */ new Map([[InlayHintKind.Type, languages.InlayHintKind.Type], [InlayHintKind.Parameter, languages.InlayHintKind.Parameter]]);
var capabilitiesByMethod = new Map([...Object.values(capabilities)].map((c) => [c.method, c]));
var ws = null;
if (typeof WebSocket !== "undefined") ws = WebSocket;
else if (typeof MozWebSocket !== "undefined") ws = MozWebSocket;
else if (typeof global !== "undefined") ws = global.WebSocket || global.MozWebSocket;
else if (typeof window !== "undefined") ws = window.WebSocket || window.MozWebSocket;
else if (typeof self !== "undefined") ws = self.WebSocket || self.MozWebSocket;

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/editor/internal/initialize.js
function getGlobalMonaco() {
  return editor_api2_exports;
}
var monacoEnvironment = globalThis.MonacoEnvironment;
if (monacoEnvironment == null ? void 0 : monacoEnvironment.globalAPI) {
  globalThis.monaco = getGlobalMonaco();
}

// ../node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor/esm/vs/editor/editor.main.js
var monacoApi = getGlobalMonaco();
monacoApi.languages.css = monaco_contribution_exports2;
monacoApi.languages.html = monaco_contribution_exports3;
monacoApi.languages.typescript = monaco_contribution_exports;
monacoApi.languages.json = monaco_contribution_exports4;

// ../packages/uniscript/src/views/components/ScriptEditorPanel.tsx
var import_react = __toESM(require_react());

// ../packages/uniscript/src/services/script-editor.service.ts
var ScriptEditorService = class extends Disposable {
  constructor(_configService) {
    super();
    __publicField(this, "_configService", _configService);
    __publicField(this, "_editorInstance", null);
  }
  dispose() {
    super.dispose();
    if (this._editorInstance) {
      this._editorInstance.dispose();
    }
  }
  setEditorInstance(editor2) {
    this._editorInstance = editor2;
    return toDisposable(() => this._editorInstance = null);
  }
  getEditorInstance() {
    return this._editorInstance;
  }
  requireVscodeEditor() {
    if (!window.MonacoEnvironment) {
      const config = this._configService.getConfig(UNISCRIPT_PLUGIN_CONFIG_KEY);
      window.MonacoEnvironment = { getWorkerUrl: config == null ? void 0 : config.getWorkerUrl };
    }
  }
};
ScriptEditorService = __decorateClass([
  __decorateParam(0, IConfigService)
], ScriptEditorService);

// ../packages/uniscript/src/services/script-execution.service.ts
var IUniscriptExecutionService = createIdentifier("univer.uniscript.execution-service");
var UniscriptExecutionService = class extends Disposable {
  constructor(_logService, _injector) {
    super();
    __publicField(this, "_logService", _logService);
    __publicField(this, "_injector", _injector);
  }
  async execute(code) {
    this._logService.log("[UniscriptExecutionService]", "executing Uniscript...");
    const apiInstance = FUniver.newAPI(this._injector);
    const scriptFunction = new Function("univerAPI", `(() => {${code}})()`);
    try {
      scriptFunction(apiInstance);
      return true;
    } catch (e) {
      this._logService.error(e);
      return false;
    }
  }
};
UniscriptExecutionService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, Inject(Injector))
], UniscriptExecutionService);

// ../packages/uniscript/src/views/components/ScriptEditorPanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
function ScriptEditorPanel() {
  const editorContentRef = (0, import_react.useRef)(null);
  const editorContainerRef = (0, import_react.useRef)(null);
  const monacoEditorRef = (0, import_react.useRef)(null);
  const localeService = useDependency(LocaleService);
  const shortcutService = useDependency(IShortcutService);
  const editorService = useDependency(ScriptEditorService);
  const themeService = useDependency(ThemeService);
  (0, import_react.useEffect)(() => {
    const containerElement = editorContainerRef.current;
    const contentElement = editorContentRef.current;
    let disposableCollection = null;
    let resizeObserver = null;
    if (containerElement && contentElement) {
      editorService.requireVscodeEditor();
      const monacoEditor = monacoEditorRef.current = editor.create(containerElement, {
        value: "",
        language: "javascript",
        theme: themeService.darkMode ? "vs-dark" : "vs-light"
      });
      resizeObserver = new ResizeObserver(() => {
        let timer = requestIdleCallback(() => {
          if (!timer) return;
          const { height, width } = contentElement.getBoundingClientRect();
          monacoEditor.layout({ width, height });
          timer = void 0;
        });
      });
      resizeObserver.observe(contentElement);
      let terminateEscaping;
      disposableCollection = new DisposableCollection();
      disposableCollection.add(editorService.setEditorInstance(monacoEditor));
      disposableCollection.add(
        monacoEditor.onDidFocusEditorWidget(() => {
          terminateEscaping = shortcutService.forceEscape();
        })
      );
      disposableCollection.add(
        monacoEditor.onDidBlurEditorWidget(() => {
          terminateEscaping == null ? void 0 : terminateEscaping.dispose();
          terminateEscaping = void 0;
        })
      );
      disposableCollection.add(toDisposable(() => terminateEscaping == null ? void 0 : terminateEscaping.dispose()));
    }
    return () => {
      if (resizeObserver && contentElement) {
        resizeObserver.unobserve(contentElement);
      }
      disposableCollection == null ? void 0 : disposableCollection.dispose();
    };
  }, [editorService, shortcutService]);
  const startExecution = useExecution(monacoEditorRef);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-h-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: editorContentRef, className: "univer-h-[calc(100%-60px)] univer-w-full univer-overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: editorContainerRef }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mt-2.5", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { variant: "primary", onClick: startExecution, children: localeService.t("uniscript.panel.execute") }) })
  ] });
}
function useExecution(monacoEditorRef) {
  const scriptService = useDependency(IUniscriptExecutionService);
  const messageService = useDependency(IMessageService);
  const localeService = useDependency(LocaleService);
  return (0, import_react.useCallback)(() => {
    var _a2;
    const model = (_a2 = monacoEditorRef.current) == null ? void 0 : _a2.getModel();
    if (model) {
      scriptService.execute(model.getValue()).then(() => {
        messageService.show({
          content: localeService.t("uniscript.message.success"),
          type: "success" /* Success */
        });
      }).catch(() => {
        messageService.show({
          content: localeService.t("uniscript.message.failed"),
          type: "error" /* Error */
        });
      });
    }
  }, [localeService, messageService, monacoEditorRef, scriptService]);
}

// ../packages/uniscript/src/controllers/uniscript.controller.ts
var UniscriptController = class extends Disposable {
  constructor(_menuManagerService, commandService, componentManager) {
    super();
    __publicField(this, "_menuManagerService", _menuManagerService);
    this._menuManagerService.mergeMenu(menuSchema);
    this.disposeWithMe(componentManager.register(ScriptPanelComponentName, ScriptEditorPanel));
    this.disposeWithMe(commandService.registerCommand(ToggleScriptPanelOperation));
  }
};
UniscriptController = __decorateClass([
  __decorateParam(0, IMenuManagerService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, Inject(ComponentManager))
], UniscriptController);

// ../packages/uniscript/src/plugin.ts
var UniverUniscriptPlugin = class extends Plugin {
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
    this._configService.setConfig(UNISCRIPT_PLUGIN_CONFIG_KEY, rest);
  }
  onStarting() {
    const injector = this._injector;
    const dependencies = [
      [UniscriptController],
      [ScriptEditorService],
      [ScriptPanelService]
    ];
    dependencies.forEach((d) => injector.add(d));
    this.registerExecution();
  }
  onSteady() {
    this._injector.get(UniscriptController);
  }
  /**
   * Allows being overridden, replacing with a new UniscriptExecutionService.
   */
  registerExecution() {
    this._injector.add([IUniscriptExecutionService, { useClass: UniscriptExecutionService }]);
  }
};
__publicField(UniverUniscriptPlugin, "pluginName", "UNIVER_UNISCRIPT_PLUGIN");
__publicField(UniverUniscriptPlugin, "packageName", package_default.name);
__publicField(UniverUniscriptPlugin, "version", package_default.version);
UniverUniscriptPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService)
], UniverUniscriptPlugin);

export {
  UniverUniscriptPlugin
};
