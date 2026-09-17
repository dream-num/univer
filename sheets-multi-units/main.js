import {
  UniverSheetsThreadCommentUIPlugin
} from "../chunk-RS7WUHOJ.js";
import {
  UniverDocsMentionUIPlugin
} from "../chunk-YCGC2XFC.js";
import {
  UniverThreadCommentUIPlugin
} from "../chunk-3WOCRIC2.js";
import "../chunk-G336XYRO.js";
import "../chunk-POBEMVCS.js";
import {
  UniverSheetsThreadCommentPlugin
} from "../chunk-NJGSTZSU.js";
import "../chunk-PRZ2MIYX.js";
import {
  UniverSheetsZenEditorPlugin
} from "../chunk-WVHVGHAD.js";
import {
  UniverSheetsHyperLinkPlugin
} from "../chunk-BBGQPEWJ.js";
import {
  UniverSheetsSortPlugin
} from "../chunk-7OGYBNIL.js";
import "../chunk-WHQBYF3J.js";
import "../chunk-CER5CEC6.js";
import "../chunk-FXH7NPJ2.js";
import {
  FUniver
} from "../chunk-2WA7JL2E.js";
import {
  UniverSheetsConditionalFormattingPlugin
} from "../chunk-VEA4DFFB.js";
import {
  UniverSheetsFilterPlugin
} from "../chunk-ESCGSVMK.js";
import {
  UniverSheetsNumfmtUIPlugin
} from "../chunk-UFFVGXSC.js";
import {
  UniverSheetsFormulaUIPlugin
} from "../chunk-DMIB6PSO.js";
import {
  UniverSheetsNumfmtPlugin
} from "../chunk-LZWJIT7W.js";
import {
  UniverSheetsUIPlugin
} from "../chunk-BHQGV2VJ.js";
import {
  UniverDocsPlugin,
  UniverDocsUIPlugin,
  UniverSheetsDataValidationPlugin
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  UniverUIPlugin,
  clsx,
  require_jsx_runtime,
  require_react,
  useDependency,
  useObservable
} from "../chunk-VNXQUZSG.js";
import {
  zh_CN_default
} from "../chunk-QRLMZA6Y.js";
import {
  UniverSheetsFormulaPlugin
} from "../chunk-YVPSS3XX.js";
import {
  UniverFormulaEnginePlugin,
  UniverSheetsPlugin
} from "../chunk-Q6Y4PHRI.js";
import {
  UniverRenderEnginePlugin
} from "../chunk-XOCU2XR6.js";
import {
  IUniverInstanceService,
  Univer,
  UserManagerService
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __toESM
} from "../chunk-24OICD5T.js";

// src/sheets-multi-units/switch-units.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var SwitchUnits = () => {
  const univerInstanceService = useDependency(IUniverInstanceService);
  const activeSheet = useObservable((0, import_react.useMemo)(() => univerInstanceService.getCurrentTypeOfUnit$(2 /* UNIVER_SHEET */), [univerInstanceService]));
  if (!activeSheet) {
    return null;
  }
  const switchSheet = (sheet) => {
    univerInstanceService.focusUnit(sheet.getUnitId());
  };
  const allSheets = univerInstanceService.getAllUnitsForType(2 /* UNIVER_SHEET */);
  const activeSheetId = activeSheet == null ? void 0 : activeSheet.getUnitId();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-w-full univer-border-b univer-border-gray-200 univer-bg-white univer-shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-px-4 univer-py-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: `univer-scrollbar-hide univer-flex univer-items-center univer-gap-1 univer-overflow-x-auto univer-overflow-y-hidden`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "span",
          {
            className: `univer-mr-3 univer-whitespace-nowrap univer-text-sm univer-font-medium univer-text-gray-600`,
            children: "\u5DE5\u4F5C\u8868:"
          }
        ),
        allSheets.map((sheet) => {
          const isActive = sheet.getUnitId() === activeSheetId;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              onClick: () => switchSheet(sheet),
              className: clsx(`univer-relative univer-min-w-0 univer-flex-shrink-0 univer-transform univer-cursor-pointer univer-whitespace-nowrap univer-rounded-lg univer-px-4 univer-py-2 univer-text-sm univer-font-medium univer-transition-all univer-duration-200 focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-blue-500 focus:univer-ring-offset-2 active:univer-scale-95`, {
                [`univer-border-2 univer-border-blue-300 univer-bg-blue-100 univer-text-blue-700 univer-shadow-sm`]: isActive,
                [`univer-border-2 univer-border-transparent univer-bg-gray-50 univer-text-gray-700 hover:univer-border-gray-300 hover:univer-bg-gray-100 hover:univer-text-gray-900`]: !isActive
              }),
              title: sheet.getUnitId(),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "univer-max-w-32 univer-truncate", children: sheet.getUnitId() }),
                isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    className: `univer-absolute -univer-bottom-1 univer-left-1/2 univer-size-1 -univer-translate-x-1/2 univer-transform univer-rounded-full univer-bg-blue-500`
                  }
                )
              ]
            },
            sheet.getUnitId()
          );
        })
      ]
    }
  ) }) });
};

// src/sheets-multi-units/main.ts
var LOAD_LAZY_PLUGINS_TIMEOUT = 100;
var LOAD_VERY_LAZY_PLUGINS_TIMEOUT = 1e3;
var mockUser = {
  userID: "Owner_qxVnhPbQ",
  name: "Owner",
  avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAInSURBVHgBtZU9TxtBEIbfWRzFSIdkikhBSqRQkJqkCKTCFkqVInSUSaT0wC8w/gXxD4gU2nRJkXQWhAZowDUUWKIwEgWWbEEB3mVmx3dn4DA2nB/ppNuPeWd29mMIPXDr+RxwtgRHeW6+guNPRxogqnL7Dwz9psJ27S4NShaeZTH3kwXy6I81dlRKcmRui88swdq9AcSFL7Buz1Vmlns64MiLsCjzwnIYHLH57tbfFbs7KRaXyEU8FVZofqccOfA5l7Q8LPIkGrwnb2RPNEXWFVMUF3L+kDCk0btDDAMzOm5YfAHDwp4tG74wnzAsiOYMnJ3GoDybA7IT98/jm5+JNnfiIzAS6LlqHQBN/i6b2t/cV1Hh6BfwYlHnHP4AXi5q/8kmMMpOs8+BixZw/Fd6xUEHEbnkgclvQP2fGp7uShRKnQ3G32rkjV1th8JhIGG7tR/JyjGteSOZELwGMmNqIIigRCLRh2OZIE6BjItdd7pCW6Uhm1zzkUtungSxwEUzNpQ+GQumtH1ej1MqgmNT6vwmhCq5yuwq56EYTbgeQUz3yvrpV1b4ok3nYJ+eYhgYmjRUqErx2EDq0Fr8FhG++iqVGqxlUJI/70Ar0UgJaWHj6hYVHJrfKssAHot1JfqwE9WVWzXZVd5z2Ws/4PnmtEjkXeKJDvxUecLbWOXH/DP6QQ4J72NS0adedp1aseBfXP8odlZFfPvBF7SN/8hky1TYuPOAXAEipMx15u5ToAAAAABJRU5ErkJggg==",
  anonymous: false,
  canBindAnonymous: false
};
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  },
  logLevel: 4 /* VERBOSE */
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
  ribbonType: "classic"
});
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverDocsMentionUIPlugin);
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsZenEditorPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);
univer.registerPlugin(UniverSheetsFormulaUIPlugin);
univer.registerPlugin(UniverSheetsDataValidationPlugin);
univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
univer.registerPlugin(UniverSheetsFilterPlugin);
univer.registerPlugin(UniverSheetsSortPlugin);
univer.registerPlugin(UniverSheetsHyperLinkPlugin);
univer.registerPlugin(UniverThreadCommentUIPlugin);
univer.registerPlugin(UniverSheetsThreadCommentPlugin);
univer.registerPlugin(UniverSheetsThreadCommentUIPlugin);
var injector = univer.__getInjector();
var userManagerService = injector.get(UserManagerService);
userManagerService.setCurrentUser(mockUser);
setTimeout(() => {
  import("../lazy-UOX73AA5.js").then((lazy) => {
    const plugins = lazy.default();
    plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
  });
}, LOAD_LAZY_PLUGINS_TIMEOUT);
setTimeout(() => {
  import("../very-lazy-7IBG45YL.js").then((lazy) => {
    const plugins = lazy.default();
    plugins.forEach((p) => univer.registerPlugin(p[0], p[1]));
  });
}, LOAD_VERY_LAZY_PLUGINS_TIMEOUT);
univer.onDispose(() => {
  window.univer = void 0;
  window.univerAPI = void 0;
});
window.univer = univer;
window.univerAPI = FUniver.newAPI(univer);
var univerAPI = window.univerAPI;
univerAPI.createWorkbook({
  id: "workbook1",
  sheetOrder: ["sheet-01"],
  resources: [],
  sheets: {
    "sheet-01": {
      id: "sheet-01",
      name: "Sheet 01",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          1: { t: 2 /* NUMBER */, v: 10 }
        },
        5: {
          0: {}
        }
      }
    },
    "sheet-02": {
      id: "sheet-02",
      name: "foobar",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        5: {
          0: {}
        }
      }
    }
  }
});
univerAPI.createWorkbook(
  {
    id: "workbook2",
    sheetOrder: ["sheet-01"],
    sheets: {
      "sheet-01": {
        id: "sheet-01",
        name: "Sheet 01",
        rowCount: 20,
        columnCount: 40,
        cellData: {
          0: {
            0: { v: 1 },
            1: { v: 2 }
          },
          1: {
            0: { v: 3 },
            1: { v: 4 }
          },
          5: {
            0: {}
          }
        }
      },
      "sheet-02": {
        id: "sheet-02",
        name: "foobar",
        rowCount: 20,
        columnCount: 40,
        cellData: {
          5: {
            0: {}
          }
        }
      }
    }
  },
  {
    makeCurrent: false
  }
);
univerAPI.createWorkbook({
  id: "workbook3",
  sheetOrder: ["sheet-01"],
  sheets: {
    "sheet-01": {
      id: "sheet-01",
      name: "Sheet 01",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { v: 1 },
          1: { v: 2 }
        },
        1: {
          0: { v: 3 },
          1: { v: 4 }
        },
        5: {
          0: {
            f: "='[workbook1]Sheet 01'!A5 * '[workbook2]Sheet 01'!A5 * '[workbook3]Sheet 01'!A5* '[workbook4]Sheet 01'!A5"
          }
        }
      }
    },
    "sheet-02": {
      id: "sheet-02",
      name: "foobar",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        5: {
          0: {}
        }
      }
    }
  }
});
univerAPI.createWorkbook({
  id: "workbook4",
  sheetOrder: ["sheet-01"],
  sheets: {
    "sheet-01": {
      id: "sheet-01",
      name: "Sheet 01",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { v: 1 },
          1: { v: 2 }
        },
        1: {
          0: { v: 3 },
          1: { v: 4 }
        },
        5: {
          0: {
            f: "='[workbook1]Sheet 01'!A5 * '[workbook2]Sheet 01'!A5 * '[workbook3]Sheet 01'!A5* '[workbook4]Sheet 01'!A5"
          }
        }
      }
    },
    "sheet-02": {
      id: "sheet-02",
      name: "foobar",
      rowCount: 20,
      columnCount: 40,
      cellData: {
        5: {
          0: {}
        }
      }
    }
  }
});
univerAPI.registerUIPart(
  univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER,
  SwitchUnits
);
export {
  mockUser
};
