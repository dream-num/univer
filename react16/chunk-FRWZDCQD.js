import {
  IRenderManagerService,
  UNIVER_WATERMARK_LAYER_INDEX,
  UNIVER_WATERMARK_STORAGE_KEY,
  WatermarkLayer
} from "./chunk-XOCU2XR6.js";
import {
  Disposable,
  IConfigService,
  ILocalStorageService,
  Inject,
  Injector,
  Plugin,
  RxDisposable,
  Subject,
  UserManagerService,
  merge_default
} from "./chunk-EJSPXROI.js";
import {
  __decorateClass,
  __decorateParam,
  __publicField
} from "./chunk-24OICD5T.js";

// ../packages/watermark/package.json
var package_default = {
  name: "@univerjs/watermark",
  version: "0.25.2",
  private: false,
  description: "Watermark rendering plugin for Univer.",
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
    "watermark",
    "rendering",
    "documents",
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
  peerDependencies: {
    rxjs: ">=7.0.0"
  },
  dependencies: {
    "@univerjs/core": "workspace:*",
    "@univerjs/engine-render": "workspace:*"
  },
  devDependencies: {
    "@univerjs-infra/shared": "workspace:*",
    rxjs: "^7.8.2",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  }
};

// ../packages/watermark/src/common/const.ts
var WATERMARK_IMAGE_ALLOW_IMAGE_LIST = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];
var WatermarkTextBaseConfig = {
  content: "",
  fontSize: 16,
  color: "rgb(0,0,0)",
  bold: false,
  italic: false,
  direction: "ltr",
  x: 60,
  y: 36,
  repeat: true,
  spacingX: 200,
  spacingY: 100,
  rotate: 0,
  opacity: 0.15
};
var WatermarkImageBaseConfig = {
  url: "",
  width: 100,
  height: 100,
  maintainAspectRatio: true,
  originRatio: 1,
  x: 60,
  y: 36,
  repeat: true,
  spacingX: 200,
  spacingY: 100,
  rotate: 0,
  opacity: 0.15
};
var WatermarkUserInfoBaseConfig = {
  name: true,
  email: false,
  phone: false,
  uid: false,
  fontSize: 16,
  color: "rgb(0,0,0)",
  bold: false,
  italic: false,
  direction: "ltr",
  x: 60,
  y: 60,
  repeat: true,
  spacingX: 200,
  spacingY: 100,
  rotate: -30,
  opacity: 0.15
};

// ../packages/watermark/src/config/config.ts
var WATERMARK_PLUGIN_CONFIG_KEY = "watermark.config";
var configSymbol = Symbol(WATERMARK_PLUGIN_CONFIG_KEY);
var defaultPluginConfig = {};

// ../packages/watermark/src/services/watermark.service.ts
var WatermarkService = class extends Disposable {
  constructor(_localStorageService) {
    super();
    __publicField(this, "_localStorageService", _localStorageService);
    __publicField(this, "_updateConfig$", new Subject());
    __publicField(this, "updateConfig$", this._updateConfig$.asObservable());
    __publicField(this, "_refresh$", new Subject());
    __publicField(this, "refresh$", this._refresh$.asObservable());
  }
  async getWatermarkConfig() {
    const res = await this._localStorageService.getItem(UNIVER_WATERMARK_STORAGE_KEY);
    return res;
  }
  updateWatermarkConfig(config) {
    this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, config);
    this._updateConfig$.next(config);
  }
  deleteWatermarkConfig() {
    this._localStorageService.removeItem(UNIVER_WATERMARK_STORAGE_KEY);
    this._updateConfig$.next(null);
  }
  refresh() {
    this._refresh$.next(Math.random());
  }
  dispose() {
    this._refresh$.complete();
    this._updateConfig$.complete();
  }
};
WatermarkService = __decorateClass([
  __decorateParam(0, Inject(ILocalStorageService))
], WatermarkService);

// ../packages/watermark/src/controllers/watermark.render.controller.ts
var WatermarkRenderController = class extends RxDisposable {
  constructor(_context, _watermarkService, _localStorageService, _userManagerService) {
    super();
    __publicField(this, "_context", _context);
    __publicField(this, "_watermarkService", _watermarkService);
    __publicField(this, "_localStorageService", _localStorageService);
    __publicField(this, "_userManagerService", _userManagerService);
    __publicField(this, "_watermarkLayer");
    this._watermarkLayer = new WatermarkLayer(_context.scene, [], UNIVER_WATERMARK_LAYER_INDEX);
    this._initAddRender();
    this._initWatermarkUpdate();
    this._initWatermarkConfig();
  }
  _initAddRender() {
    const { scene } = this._context;
    scene.addLayer(this._watermarkLayer);
  }
  async _initWatermarkConfig() {
    var _a;
    const config = await this._localStorageService.getItem(UNIVER_WATERMARK_STORAGE_KEY);
    if (config) {
      this._watermarkService.updateWatermarkConfig(config);
      (_a = this._context.mainComponent) == null ? void 0 : _a.makeDirty();
    }
  }
  _initWatermarkUpdate() {
    this.disposeWithMe(
      this._watermarkService.updateConfig$.subscribe((_config) => {
        var _a, _b;
        if (!_config) {
          this._watermarkLayer.updateConfig();
          (_a = this._context.mainComponent) == null ? void 0 : _a.makeDirty();
          return;
        }
        if (_config.type === "userInfo" /* UserInfo */) {
          this._watermarkLayer.updateConfig(_config, this._userManagerService.getCurrentUser());
        } else {
          this._watermarkLayer.updateConfig(_config);
        }
        (_b = this._context.mainComponent) == null ? void 0 : _b.makeDirty();
      })
    );
  }
};
WatermarkRenderController = __decorateClass([
  __decorateParam(1, Inject(WatermarkService)),
  __decorateParam(2, Inject(ILocalStorageService)),
  __decorateParam(3, Inject(UserManagerService))
], WatermarkRenderController);

// ../packages/watermark/src/plugin.ts
var UniverWatermarkPlugin = class extends Plugin {
  constructor(_config = defaultPluginConfig, _injector, _configService, _renderManagerSrv, _localStorageService) {
    super();
    __publicField(this, "_config", _config);
    __publicField(this, "_injector", _injector);
    __publicField(this, "_configService", _configService);
    __publicField(this, "_renderManagerSrv", _renderManagerSrv);
    __publicField(this, "_localStorageService", _localStorageService);
    const { ...rest } = merge_default(
      {},
      defaultPluginConfig,
      this._config
    );
    this._configService.setConfig(WATERMARK_PLUGIN_CONFIG_KEY, rest);
    this._initWatermarkStorage();
    this._initDependencies();
  }
  async _initWatermarkStorage() {
    const config = this._configService.getConfig(WATERMARK_PLUGIN_CONFIG_KEY);
    if (!config) {
      return;
    }
    const { userWatermarkSettings, textWatermarkSettings, imageWatermarkSettings } = config;
    if (userWatermarkSettings) {
      this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
        type: "userInfo" /* UserInfo */,
        config: {
          userInfo: merge_default({}, WatermarkUserInfoBaseConfig, userWatermarkSettings)
        }
      });
    } else if (textWatermarkSettings) {
      this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
        type: "text" /* Text */,
        config: {
          text: merge_default({}, WatermarkTextBaseConfig, textWatermarkSettings)
        }
      });
    } else if (imageWatermarkSettings) {
      this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
        type: "image" /* Image */,
        config: {
          image: merge_default({}, WatermarkImageBaseConfig, imageWatermarkSettings)
        }
      });
    } else {
      const config2 = await this._localStorageService.getItem(UNIVER_WATERMARK_STORAGE_KEY);
      if ((config2 == null ? void 0 : config2.type) === "userInfo" /* UserInfo */) {
        this._localStorageService.removeItem(UNIVER_WATERMARK_STORAGE_KEY);
      }
    }
  }
  _initDependencies() {
    [[WatermarkService]].forEach((d) => {
      this._injector.add(d);
    });
  }
  onRendered() {
    const injector = this._injector;
    injector.get(WatermarkService);
    this._initRenderDependencies();
  }
  _initRenderDependencies() {
    [
      [WatermarkRenderController]
    ].forEach((d) => {
      this._renderManagerSrv.registerRenderModule(2 /* UNIVER_SHEET */, d);
      this._renderManagerSrv.registerRenderModule(1 /* UNIVER_DOC */, d);
    });
  }
};
__publicField(UniverWatermarkPlugin, "pluginName", "UNIVER_WATERMARK_PLUGIN");
__publicField(UniverWatermarkPlugin, "packageName", package_default.name);
__publicField(UniverWatermarkPlugin, "version", package_default.version);
UniverWatermarkPlugin = __decorateClass([
  __decorateParam(1, Inject(Injector)),
  __decorateParam(2, IConfigService),
  __decorateParam(3, IRenderManagerService),
  __decorateParam(4, Inject(ILocalStorageService))
], UniverWatermarkPlugin);

export {
  WATERMARK_IMAGE_ALLOW_IMAGE_LIST,
  WatermarkTextBaseConfig,
  WatermarkImageBaseConfig,
  WatermarkService,
  UniverWatermarkPlugin
};
