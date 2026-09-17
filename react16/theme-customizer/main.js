import {
  UniverSheetsNoteUIPlugin,
  UniverSheetsTableUIPlugin
} from "../chunk-IMLGZZ4M.js";
import {
  UniverSheetsSortUIPlugin
} from "../chunk-HI54EUIE.js";
import {
  en_US_default
} from "../chunk-PO7E4ZUY.js";
import "../chunk-REZ6O7M2.js";
import "../chunk-EXS3H27I.js";
import "../chunk-62FTG3QU.js";
import {
  UniverSheetsNotePlugin,
  UniverSheetsTablePlugin
} from "../chunk-SPJ3J4VO.js";
import {
  UniverSheetsZenEditorPlugin
} from "../chunk-WVHVGHAD.js";
import {
  UniverSheetsHyperLinkPlugin,
  UniverSheetsHyperLinkUIPlugin
} from "../chunk-BBGQPEWJ.js";
import {
  UniverSheetsSortPlugin
} from "../chunk-7OGYBNIL.js";
import {
  UniverSheetsConditionalFormattingUIPlugin,
  UniverSheetsDataValidationUIPlugin,
  UniverSheetsFilterUIPlugin
} from "../chunk-QZPOCNAB.js";
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
  DEFAULT_WORKBOOK_DATA_DEMO
} from "../chunk-VEBN3ADF.js";
import {
  UniverDocsPlugin,
  UniverDocsUIPlugin,
  UniverSheetsDataValidationPlugin
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  Button,
  ColorPicker,
  ConfigProvider,
  Dropdown,
  FormLayout,
  Input,
  Select,
  Textarea,
  UniverUIPlugin,
  clsx,
  render,
  require_jsx_runtime,
  require_react
} from "../chunk-VNXQUZSG.js";
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
  ThemeService,
  Univer,
  default_default,
  green_default
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import {
  __toESM
} from "../chunk-24OICD5T.js";

// src/theme-customizer/components/toolbar-controls.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
function ToolbarField(props) {
  const { label, children } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "univer-inline-flex univer-items-center univer-gap-2", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "\n                  univer-shrink-0 univer-text-[11px] univer-font-medium univer-uppercase univer-tracking-[0.06em]\n                  univer-text-slate-500\n                  dark:!univer-text-gray-400\n                ",
        children: label
      }
    ),
    children
  ] });
}
function ToolbarToggleGroup(props) {
  const { items, value, onChange } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-inline-flex univer-items-center univer-gap-1", children: items.map((item) => {
    const active = item.value === value;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: clsx(`univer-cursor-pointer univer-rounded-md univer-border-none univer-bg-transparent univer-px-2.5 univer-py-1 univer-text-sm univer-font-medium univer-transition-colors`, active ? "" : `univer-text-slate-600 hover:univer-bg-slate-100 hover:univer-text-slate-900 dark:!univer-text-gray-300 dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-white`),
        style: active ? {
          backgroundColor: "var(--univer-primary-600)",
          color: "#FFFFFF"
        } : void 0,
        onClick: () => onChange(item.value),
        children: item.label
      },
      item.value
    );
  }) });
}

// src/theme-customizer/components/sidebar-header.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
function SidebarHeader(props) {
  const {
    darkMode,
    editorMode,
    tokenDensity,
    onDarkModeChange,
    onEditorModeChange,
    onPresetApply,
    onTokenDensityChange
  } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-p-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-items-center univer-justify-between univer-gap-2.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "h2",
        {
          className: "\n                      univer-m-0 univer-text-lg univer-font-semibold univer-text-slate-950\n                      dark:!univer-text-white\n                    ",
          children: "Theme Customizer"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { size: "small", onClick: () => onPresetApply("default"), children: "Reset Default" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { size: "small", onClick: () => onPresetApply("green"), children: "Apply Green" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "univer-mt-2.5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-items-center univer-gap-x-4 univer-gap-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ToolbarField, { label: "Appearance", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        ToolbarToggleGroup,
        {
          items: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" }
          ],
          value: darkMode ? "dark" : "light",
          onChange: (value) => onDarkModeChange(value === "dark")
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ToolbarField, { label: "Mode", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        ToolbarToggleGroup,
        {
          items: [
            { label: "Token", value: "tokens" },
            { label: "JSON", value: "json" }
          ],
          value: editorMode,
          onChange: (value) => onEditorModeChange(value)
        }
      ) }),
      editorMode === "tokens" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ToolbarField, { label: "Scope", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        ToolbarToggleGroup,
        {
          items: [
            { label: "Core Palette", value: "core" },
            { label: "Full Schema", value: "full" }
          ],
          value: tokenDensity,
          onChange: (value) => onTokenDensityChange(value)
        }
      ) })
    ] }) })
  ] });
}

// src/theme-customizer/components/theme-sections.tsx
var import_react = __toESM(require_react());

// src/theme-customizer/constants.ts
var PREVIEW_CONTAINER_ID = "theme-customizer-preview";
var COLOR_SHADE_KEYS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
var COLOR_SCALE_KEYS = ["primary", "gray", "blue", "red", "orange", "yellow", "green", "jiqing", "indigo", "purple", "pink"];
var CORE_SCALE_KEYS = ["primary", "gray", "blue", "green", "red"];
var LOOP_COLOR_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
var LOOP_COLOR_OPTIONS = COLOR_SCALE_KEYS.flatMap(
  (scale) => COLOR_SHADE_KEYS.map((shade) => ({
    label: `${scale}.${shade}`,
    value: `${scale}.${shade}`
  }))
);
var THEME_PRESETS = [
  { key: "default", label: "defaultTheme", theme: default_default },
  { key: "green", label: "greenTheme", theme: green_default }
];

// src/theme-customizer/theme-utils.ts
function cloneTheme(theme) {
  return JSON.parse(JSON.stringify(theme));
}
function normalizeHexColor(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }
  const prefixedValue = trimmedValue.startsWith("#") ? trimmedValue : `#${trimmedValue}`;
  const shortHexMatch = prefixedValue.match(/^#([0-9a-fA-F]{3})$/);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  if (/^#([0-9a-fA-F]{6})$/.test(prefixedValue)) {
    return prefixedValue.toUpperCase();
  }
  return null;
}
function formatTheme(theme) {
  return JSON.stringify(theme, null, 4);
}
function mergeThemePatch(baseTheme, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return null;
  }
  const nextTheme = cloneTheme(baseTheme);
  const record = patch;
  if (typeof record.white === "string") {
    nextTheme.white = record.white;
  }
  if (typeof record.black === "string") {
    nextTheme.black = record.black;
  }
  for (const scale of COLOR_SCALE_KEYS) {
    const scalePatch = record[scale];
    if (!scalePatch || typeof scalePatch !== "object" || Array.isArray(scalePatch)) {
      continue;
    }
    const scaleRecord = scalePatch;
    const mergedScale = { ...nextTheme[scale] };
    for (const shade of COLOR_SHADE_KEYS) {
      if (typeof scaleRecord[shade] === "string") {
        mergedScale[shade] = scaleRecord[shade];
      }
    }
    nextTheme[scale] = mergedScale;
  }
  const loopColorPatch = record["loop-color"];
  if (loopColorPatch && typeof loopColorPatch === "object" && !Array.isArray(loopColorPatch)) {
    const loopRecord = loopColorPatch;
    const mergedLoopColor = { ...nextTheme["loop-color"] };
    for (const key of LOOP_COLOR_KEYS) {
      if (typeof loopRecord[key] === "string") {
        mergedLoopColor[key] = loopRecord[key];
      }
    }
    nextTheme["loop-color"] = mergedLoopColor;
  }
  return nextTheme;
}
function updateScaleColor(theme, scale, shade, value) {
  return {
    ...theme,
    [scale]: {
      ...theme[scale],
      [shade]: value
    }
  };
}
function updateThemeRootColor(theme, key, value) {
  return {
    ...theme,
    [key]: value
  };
}
function updateLoopColor(theme, key, value) {
  return {
    ...theme,
    "loop-color": {
      ...theme["loop-color"],
      [key]: value
    }
  };
}

// src/theme-customizer/components/theme-sections.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
function ThemeCodeBlock({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "pre",
    {
      className: clsx(`univer-m-0 univer-overflow-x-auto univer-rounded-xl univer-bg-slate-950 univer-p-4 univer-font-mono univer-text-xs univer-leading-6 univer-text-slate-100`),
      children
    }
  );
}
function ThemeColorField(props) {
  const { label, value, onChange } = props;
  const [draftValue, setDraftValue] = (0, import_react.useState)(value);
  (0, import_react.useEffect)(() => {
    setDraftValue(value);
  }, [value]);
  const error = draftValue.trim().length > 0 && !normalizeHexColor(draftValue) ? "Enter a valid HEX value, for example #466AF7." : void 0;
  function handleInputChange(nextValue) {
    setDraftValue(nextValue);
    const normalizedValue = normalizeHexColor(nextValue);
    if (normalizedValue) {
      onChange(normalizedValue);
    }
  }
  function handleBlur() {
    const normalizedValue = normalizeHexColor(draftValue);
    setDraftValue(normalizedValue != null ? normalizedValue : value);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label, error, className: "univer-mb-0", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    Input,
    {
      value: draftValue,
      onBlur: handleBlur,
      onChange: handleInputChange,
      placeholder: "#000000",
      slot: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        Dropdown,
        {
          align: "end",
          side: "bottom",
          overlay: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "univer-p-2", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            ColorPicker,
            {
              value,
              onChange: (nextValue) => {
                const normalizedValue = normalizeHexColor(nextValue);
                if (normalizedValue) {
                  setDraftValue(normalizedValue);
                  onChange(normalizedValue);
                }
              }
            }
          ) }),
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              "aria-label": `Choose ${label} color`,
              className: clsx(`univer-size-5 univer-cursor-pointer univer-rounded-full univer-border univer-border-solid univer-border-slate-300 univer-bg-transparent univer-p-0 focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-50`),
              style: { backgroundColor: value }
            }
          )
        }
      )
    }
  ) });
}
function ThemeScaleSection(props) {
  const { title, scale, theme, defaultExpanded = false, onChange } = props;
  const [expanded, setExpanded] = (0, import_react.useState)(defaultExpanded);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "section",
    {
      className: clsx(`univer-rounded-2xl univer-bg-white dark:!univer-bg-gray-800`),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            className: clsx(`univer-flex univer-w-full univer-items-center univer-justify-between univer-border-none univer-bg-transparent univer-px-4 univer-py-3 univer-text-left`),
            onClick: () => setExpanded((value) => !value),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "div",
                  {
                    className: "\n                          univer-text-sm univer-font-semibold univer-text-slate-900\n                          dark:!univer-text-white\n                        ",
                    children: title
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                  "div",
                  {
                    className: "\n                          univer-mt-1 univer-text-xs univer-text-slate-500\n                          dark:!univer-text-gray-300\n                        ",
                    children: [
                      scale,
                      ".500",
                      " = ",
                      theme[scale][500]
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-items-center univer-gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    className: "\n                          univer-inline-flex univer-size-6 univer-rounded-full univer-border univer-border-solid\n                          univer-border-slate-200\n                        ",
                    style: { backgroundColor: theme[scale][500] }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    className: "\n                          univer-text-xs univer-text-slate-500\n                          dark:!univer-text-gray-300\n                        ",
                    children: expanded ? "Collapse" : "Expand"
                  }
                )
              ] })
            ]
          }
        ),
        expanded && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "\n                      univer-grid univer-gap-3 univer-p-4\n                      sm:univer-grid-cols-2\n                    ",
            children: COLOR_SHADE_KEYS.map((shade) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              ThemeColorField,
              {
                label: shade,
                value: theme[scale][shade],
                onChange: (value) => onChange(scale, shade, value)
              },
              shade
            ))
          }
        )
      ]
    }
  );
}
function ThemeRootColorsSection(props) {
  const { theme, onChange } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "section",
    {
      className: clsx(`univer-rounded-2xl univer-bg-white univer-p-4 dark:!univer-bg-gray-800`),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "\n                  univer-mb-3 univer-text-sm univer-font-semibold univer-text-slate-900\n                  dark:!univer-text-white\n                ",
            children: "Base Tokens"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: "\n                  univer-grid univer-gap-3\n                  sm:univer-grid-cols-2\n                ",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ThemeColorField, { label: "white", value: theme.white, onChange: (value) => onChange("white", value) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ThemeColorField, { label: "black", value: theme.black, onChange: (value) => onChange("black", value) })
            ]
          }
        )
      ]
    }
  );
}
function ThemeLoopColorSection(props) {
  const { theme, onChange } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "section",
    {
      className: clsx(`univer-rounded-2xl univer-bg-white univer-p-4 dark:!univer-bg-gray-800`),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "\n                  univer-mb-3 univer-text-sm univer-font-semibold univer-text-slate-900\n                  dark:!univer-text-white\n                ",
            children: "loop-color"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "\n                  univer-grid univer-gap-3\n                  sm:univer-grid-cols-2\n                ",
            children: LOOP_COLOR_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FormLayout, { label: key, className: "univer-mb-0", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              Select,
              {
                value: theme["loop-color"][key],
                options: LOOP_COLOR_OPTIONS,
                onChange: (value) => onChange(key, value)
              }
            ) }, key))
          }
        )
      ]
    }
  );
}
function IntegrationExampleSection(props) {
  const { copyLabel, onCopy } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "section",
    {
      className: clsx(`univer-rounded-2xl univer-bg-slate-50 univer-p-4 dark:!univer-bg-gray-800`),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mb-3 univer-flex univer-items-center univer-justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "div",
            {
              className: "\n                      univer-text-sm univer-font-semibold univer-text-slate-900\n                      dark:!univer-text-white\n                    ",
              children: "Integration Example"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "middle", onClick: onCopy, children: copyLabel })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ThemeCodeBlock, { children: `import { Univer } from '@univerjs/core';
import { customTheme } from './custom-theme';

const univer = new Univer({
    theme: customTheme,
    locale: LocaleType.EN_US,
});` })
      ]
    }
  );
}
function JsonEditorPanel(props) {
  const { copyLabel, jsonDraft, jsonError, onCopy, onFormatCurrent, onJsonChange, onSyncCurrent, onViewDefault } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "section",
    {
      className: clsx(`univer-rounded-2xl univer-bg-slate-50 univer-p-4 dark:!univer-bg-gray-800`),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-items-center univer-justify-between univer-gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "div",
              {
                className: "\n                          univer-text-sm univer-font-semibold univer-text-slate-900\n                          dark:!univer-text-white\n                        ",
                children: "Theme JSON"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "p",
              {
                className: "\n                          univer-m-0 univer-mt-1 univer-text-xs univer-leading-5 univer-text-slate-500\n                          dark:!univer-text-gray-300\n                        ",
                children: "A valid JSON patch is merged and applied to the running `ThemeService` immediately."
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-flex univer-flex-wrap univer-gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "middle", onClick: onSyncCurrent, children: "Sync Current Theme" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "middle", onClick: onViewDefault, children: "View Default" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "middle", onClick: onCopy, children: copyLabel })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "univer-mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            Textarea,
            {
              value: jsonDraft,
              spellCheck: false,
              className: clsx(`univer-h-[640px] univer-rounded-2xl univer-bg-slate-950 univer-p-4 univer-font-mono univer-text-sm univer-leading-6 univer-text-slate-100`, jsonError ? "univer-border-red-500" : "univer-border-slate-700"),
              style: {
                color: "#E2E8F0",
                backgroundColor: "#020617",
                caretColor: "#F8FAFC"
              },
              onValueChange: onJsonChange
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              className: "\n                      univer-mt-3 univer-flex univer-flex-wrap univer-items-center univer-justify-between univer-gap-3\n                    ",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "div",
                  {
                    className: clsx("univer-text-xs univer-leading-5", jsonError ? "univer-text-red-500" : `univer-text-slate-500 dark:!univer-text-gray-300`),
                    children: jsonError
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "middle", variant: "primary", onClick: onFormatCurrent, children: "Format Current Result" })
              ]
            }
          )
        ] })
      ]
    }
  );
}

// src/theme-customizer/components/token-editor-panel.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
function TokenEditorPanel(props) {
  const { copyLabel, theme, visibleScaleKeys, onCopy, onLoopColorChange, onRootColorChange, onScaleColorChange } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "univer-flex univer-flex-col univer-gap-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ThemeRootColorsSection, { theme, onChange: onRootColorChange }),
    visibleScaleKeys.map((scale, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ThemeScaleSection,
      {
        title: scale,
        scale,
        theme,
        defaultExpanded: index < 2,
        onChange: onScaleColorChange
      },
      scale
    )),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ThemeLoopColorSection, { theme, onChange: onLoopColorChange }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(IntegrationExampleSection, { copyLabel, onCopy })
  ] });
}

// src/theme-customizer/components/univer-preview.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
function UniverPreview(props) {
  const { theme, darkMode } = props;
  const univerRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const univer = new Univer({
      theme,
      darkMode,
      locale: "enUS" /* EN_US */,
      locales: {
        ["enUS" /* EN_US */]: en_US_default
      },
      logLevel: 1 /* ERROR */
    });
    univer.registerPlugins([
      [UniverDocsPlugin],
      [UniverRenderEnginePlugin],
      [UniverUIPlugin, {
        container: PREVIEW_CONTAINER_ID,
        ribbonType: "classic"
      }],
      [UniverDocsUIPlugin],
      [UniverSheetsPlugin, {
        autoHeightForMergedCells: true
      }],
      [UniverSheetsUIPlugin],
      [UniverSheetsNumfmtPlugin],
      [UniverSheetsZenEditorPlugin],
      [UniverFormulaEnginePlugin],
      [UniverSheetsFormulaPlugin],
      [UniverSheetsFormulaUIPlugin],
      [UniverSheetsDataValidationPlugin],
      [UniverSheetsDataValidationUIPlugin],
      [UniverSheetsConditionalFormattingPlugin],
      [UniverSheetsConditionalFormattingUIPlugin],
      [UniverSheetsFilterPlugin],
      [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
      [UniverSheetsSortPlugin],
      [UniverSheetsSortUIPlugin],
      [UniverSheetsHyperLinkPlugin],
      [UniverSheetsHyperLinkUIPlugin],
      [UniverSheetsTablePlugin],
      [UniverSheetsTableUIPlugin],
      [UniverSheetsNotePlugin],
      [UniverSheetsNoteUIPlugin],
      [UniverSheetsNumfmtUIPlugin]
    ]);
    univer.createUnit(2 /* UNIVER_SHEET */, DEFAULT_WORKBOOK_DATA_DEMO);
    univerRef.current = univer;
    return () => {
      univer.dispose();
      univerRef.current = null;
    };
  }, []);
  (0, import_react2.useEffect)(() => {
    if (univerRef.current) {
      univerRef.current.__getInjector().get(ThemeService).setTheme(theme);
    }
  }, [theme]);
  (0, import_react2.useEffect)(() => {
    if (univerRef.current) {
      univerRef.current.__getInjector().get(ThemeService).setDarkMode(darkMode);
    }
  }, [darkMode]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      id: PREVIEW_CONTAINER_ID,
      className: clsx(`univer-h-full univer-min-h-[520px] univer-w-full univer-overflow-hidden univer-rounded-[20px] univer-bg-white`)
    }
  );
}

// src/theme-customizer/hooks/use-theme-customizer-state.ts
var import_react3 = __toESM(require_react());
function useThemeCustomizerState() {
  const [theme, setTheme] = (0, import_react3.useState)(() => cloneTheme(default_default));
  const [editorMode, setEditorMode] = (0, import_react3.useState)("tokens");
  const [tokenDensity, setTokenDensity] = (0, import_react3.useState)("core");
  const [darkMode, setDarkMode] = (0, import_react3.useState)(false);
  const [jsonDraft, setJsonDraft] = (0, import_react3.useState)(() => formatTheme(default_default));
  const [jsonError, setJsonError] = (0, import_react3.useState)(null);
  const [copyLabel, setCopyLabel] = (0, import_react3.useState)("Copy JSON");
  (0, import_react3.useEffect)(() => {
    document.documentElement.classList.toggle("univer-dark", darkMode);
    document.body.classList.toggle("univer-dark", darkMode);
    return () => {
      document.documentElement.classList.remove("univer-dark");
      document.body.classList.remove("univer-dark");
    };
  }, [darkMode]);
  const visibleScaleKeys = (0, import_react3.useMemo)(() => tokenDensity === "core" ? CORE_SCALE_KEYS : COLOR_SCALE_KEYS, [tokenDensity]);
  function applyTheme(nextTheme) {
    setTheme(nextTheme);
    setJsonDraft(formatTheme(nextTheme));
    setJsonError(null);
  }
  function handleScaleColorChange(scale, shade, value) {
    applyTheme(updateScaleColor(theme, scale, shade, value));
  }
  function handleRootColorChange(key, value) {
    applyTheme(updateThemeRootColor(theme, key, value));
  }
  function handleLoopColorChange(key, value) {
    applyTheme(updateLoopColor(theme, key, value));
  }
  function handlePresetApply(presetKey) {
    const preset = THEME_PRESETS.find((item) => item.key === presetKey);
    if (!preset) {
      return;
    }
    applyTheme(cloneTheme(preset.theme));
  }
  function handleJsonChange(value) {
    setJsonDraft(value);
    try {
      const parsedValue = JSON.parse(value);
      const mergedTheme = mergeThemePatch(theme, parsedValue);
      if (!mergedTheme) {
        setJsonError("JSON must be an object.");
        return;
      }
      setTheme(mergedTheme);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Failed to parse JSON.");
    }
  }
  async function handleCopyTheme() {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(formatTheme(theme));
    setCopyLabel("Copied");
    window.setTimeout(() => {
      setCopyLabel("Copy JSON");
    }, 1600);
  }
  return {
    copyLabel,
    darkMode,
    editorMode,
    jsonDraft,
    jsonError,
    theme,
    tokenDensity,
    visibleScaleKeys,
    setDarkMode,
    setEditorMode,
    setJsonDraft,
    setTokenDensity,
    handleCopyTheme,
    handleJsonChange,
    handleLoopColorChange,
    handlePresetApply,
    handleRootColorChange,
    handleScaleColorChange
  };
}

// src/theme-customizer/theme-customizer-app.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
function ThemeCustomizerApp() {
  const {
    copyLabel,
    darkMode,
    editorMode,
    jsonDraft,
    jsonError,
    theme,
    tokenDensity,
    visibleScaleKeys,
    setDarkMode,
    setEditorMode,
    setJsonDraft,
    setTokenDensity,
    handleCopyTheme,
    handleJsonChange,
    handleLoopColorChange,
    handlePresetApply,
    handleRootColorChange,
    handleScaleColorChange
  } = useThemeCustomizerState();
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "main",
    {
      className: clsx(`univer-box-border univer-h-screen univer-overflow-hidden univer-p-2.5 univer-text-slate-900 lg:univer-p-3`, darkMode ? "univer-bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] univer-text-slate-100" : "univer-bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]"),
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-mx-auto univer-h-full univer-max-w-[1680px]", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
        "section",
        {
          className: "\n                      univer-grid univer-h-full univer-gap-3\n                      xl:univer-grid-cols-[400px_minmax(0,1fr)]\n                    ",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "aside",
              {
                className: clsx(`univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-overflow-hidden univer-rounded-[28px] univer-bg-white univer-shadow-[0_16px_48px_rgba(15,23,42,0.08)] dark:!univer-bg-gray-900`),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    SidebarHeader,
                    {
                      darkMode,
                      editorMode,
                      tokenDensity,
                      onDarkModeChange: setDarkMode,
                      onEditorModeChange: setEditorMode,
                      onPresetApply: handlePresetApply,
                      onTokenDensityChange: setTokenDensity
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-flex-1 univer-overflow-y-auto univer-p-4", children: editorMode === "tokens" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    TokenEditorPanel,
                    {
                      copyLabel,
                      theme,
                      visibleScaleKeys,
                      onCopy: handleCopyTheme,
                      onLoopColorChange: handleLoopColorChange,
                      onRootColorChange: handleRootColorChange,
                      onScaleColorChange: handleScaleColorChange
                    }
                  ) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-flex univer-h-full univer-flex-col univer-gap-4", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    JsonEditorPanel,
                    {
                      copyLabel,
                      jsonDraft,
                      jsonError,
                      onCopy: handleCopyTheme,
                      onFormatCurrent: () => setJsonDraft(formatTheme(theme)),
                      onJsonChange: handleJsonChange,
                      onSyncCurrent: () => setJsonDraft(formatTheme(theme)),
                      onViewDefault: () => setJsonDraft(formatTheme(cloneTheme(default_default)))
                    }
                  ) }) })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "section",
              {
                className: clsx(`univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-overflow-hidden univer-rounded-[28px] univer-bg-white univer-shadow-[0_18px_56px_rgba(15,23,42,0.16)] dark:!univer-bg-gray-900`),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "div",
                    {
                      className: "\n                              univer-bg-white univer-p-4\n                              dark:!univer-bg-gray-900\n                            ",
                      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                        "h2",
                        {
                          className: "\n                                  univer-m-0 univer-text-base univer-font-semibold univer-text-slate-950\n                                  dark:!univer-text-white\n                                ",
                          children: "Live Preview"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "univer-min-h-[640px] univer-flex-1 univer-overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(UniverPreview, { theme, darkMode }) })
                ]
              }
            )
          ]
        }
      ) })
    }
  );
}

// src/theme-customizer/main.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime());
render(
  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ConfigProvider, { locale: en_US_default.design, mountContainer: document.body, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ThemeCustomizerApp, {}) }),
  document.getElementById("app")
);
