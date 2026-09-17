import "./chunk-LI6UXASZ.js";
import {
  ThemeSwitcherService,
  clsx,
  render,
  require_jsx_runtime,
  require_react
} from "./chunk-VNXQUZSG.js";
import "./chunk-XOCU2XR6.js";
import {
  default_default
} from "./chunk-EJSPXROI.js";
import "./chunk-EQ2B2W73.js";
import {
  __toESM
} from "./chunk-24OICD5T.js";

// src/main.tsx
var import_react = __toESM(require_react());

// ../package.json
var package_default = {
  name: "univer",
  type: "module",
  version: "0.25.2",
  private: true,
  packageManager: "pnpm@10.33.4",
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
  devEngines: {
    runtime: [
      {
        name: "node",
        version: ">=22.18"
      },
      {
        name: "pnpm",
        version: ">=10"
      }
    ]
  },
  scripts: {
    prepare: "husky",
    "pre-commit": "lint-staged",
    dev: "pnpm --filter univer-examples dev:demo -- --host 0.0.0.0",
    "dev:umd": "serve .",
    "dev:e2e": "pnpm --filter univer-examples dev:e2e",
    "use:react16": "tsx ./scripts/react-version-manager.ts --react=16",
    "use:react19": "tsx ./scripts/react-version-manager.ts --react=19",
    typecheck: "turbo typecheck",
    "serve:umd": "serve .",
    test: "turbo test -- --passWithNoTests",
    coverage: "turbo coverage -- --passWithNoTests",
    "analyze:build": "tsx ./scripts/build-analysis.ts",
    build: "turbo build --filter=!./common/*",
    "build:ci": "turbo build --filter=!./common/*",
    "build:demo": "pnpm --filter univer-examples build:demo",
    "build:e2e": "pnpm --filter univer-examples build:e2e",
    "serve:e2e": "serve ./examples/local",
    "test:e2e": "playwright test",
    lint: "eslint .",
    "storybook:dev": "pnpm --filter @univerjs/storybook dev:storybook",
    "storybook:build": "pnpm --filter @univerjs/storybook build:storybook",
    release: "release-it"
  },
  devDependencies: {
    "@antfu/eslint-config": "^7.7.3",
    "@commitlint/cli": "^20.5.3",
    "@commitlint/config-conventional": "^20.5.3",
    "@eslint-react/eslint-plugin": "^2.13.0",
    "@eslint/compat": "^2.0.5",
    "@playwright/test": "^1.57.0",
    "@release-it-plugins/workspaces": "^5.0.3",
    "@release-it/conventional-changelog": "^10.0.6",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^25.9.1",
    "@types/react": "19.2.15",
    "@types/react-dom": "19.2.3",
    "@univerjs-infra/shared": "workspace:*",
    "@univerjs/design": "workspace:*",
    eslint: "10.4.1",
    "eslint-plugin-format": "^2.0.1",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "fs-extra": "^11.3.5",
    husky: "^9.1.7",
    "lint-staged": "^17.0.5",
    "posthog-node": "^5.35.6",
    react: "19.2.6",
    "react-dom": "19.2.6",
    "release-it": "^19.2.4",
    serve: "^14.2.6",
    tailwindcss: "3.4.18",
    tsx: "^4.22.3",
    turbo: "^2.9.16",
    typescript: "^6.0.3",
    vitest: "^4.1.7"
  },
  pnpm: {
    overrides: {
      "@types/react": "19.2.15",
      "@types/react-dom": "19.2.3",
      "basic-ftp": "5.2.0",
      react: "19.2.6",
      "react-dom": "19.2.6"
    }
  },
  "lint-staged": {
    "*": "eslint --fix"
  },
  resolutions: {
    "@types/react": "16",
    "@types/react-dom": "16",
    react: "16",
    "react-dom": "16"
  }
};

// src/demos.ts
var demos = [
  {
    "dir": "docs",
    "href": "./docs/",
    "title": "Docs"
  },
  {
    "dir": "docs-uniscript",
    "href": "./docs-uniscript/",
    "title": "Docs Uniscript"
  },
  {
    "dir": "sheets",
    "href": "./sheets/",
    "title": "Sheets"
  },
  {
    "dir": "sheets-mobile",
    "href": "./sheets-mobile/",
    "title": "Sheets Mobile"
  },
  {
    "dir": "sheets-multi",
    "href": "./sheets-multi/",
    "title": "Sheets Multi"
  },
  {
    "dir": "sheets-multi-units",
    "href": "./sheets-multi-units/",
    "title": "Sheets Multi Units"
  },
  {
    "dir": "sheets-no-worker",
    "href": "./sheets-no-worker/",
    "title": "Sheets No Worker"
  },
  {
    "dir": "sheets-uniscript",
    "href": "./sheets-uniscript/",
    "title": "Sheets Uniscript"
  },
  {
    "dir": "sheets-webcomponent",
    "href": "./sheets-webcomponent/",
    "title": "Sheets Web Component"
  },
  {
    "dir": "slides",
    "href": "./slides/",
    "title": "Slides"
  },
  {
    "dir": "theme-customizer",
    "href": "./theme-customizer/",
    "title": "Theme Customizer"
  }
];

// src/main.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var CATEGORY_ORDER = ["sheets", "docs", "slides", "others"];
var PRIMARY_CATEGORY_ORDER = ["sheets", "docs", "slides"];
var CATEGORY_TITLES = {
  sheets: "Sheets",
  docs: "Docs",
  slides: "Slides",
  others: "Others"
};
function getDemoCategory(dir) {
  if (dir.startsWith("sheets") || dir.includes("sheets")) {
    return "sheets";
  }
  if (dir.startsWith("docs") || dir.includes("docs")) {
    return "docs";
  }
  if (dir.startsWith("slides") || dir.includes("slides")) {
    return "slides";
  }
  return "others";
}
var groupedDemos = CATEGORY_ORDER.map((category) => ({
  category,
  title: CATEGORY_TITLES[category],
  items: demos.filter((demo) => getDemoCategory(demo.dir) === category)
})).filter((group) => group.items.length > 0);
var primaryGroups = PRIMARY_CATEGORY_ORDER.map((category) => groupedDemos.find((group) => group.category === category)).filter(
  (group) => Boolean(group)
);
var _a, _b, _c, _d;
var defaultCategory = (_d = (_c = (_a = primaryGroups[0]) == null ? void 0 : _a.category) != null ? _c : (_b = groupedDemos[0]) == null ? void 0 : _b.category) != null ? _d : "sheets";
if (true) {
  console.table({
    // eslint-disable-next-line node/prefer-global/process
    NODE_ENV: "production",
    // eslint-disable-next-line node/prefer-global/process
    GIT_COMMIT_HASH: "e07f2a0",
    // eslint-disable-next-line node/prefer-global/process
    GIT_REF_NAME: "v0.25.2",
    // eslint-disable-next-line node/prefer-global/process
    BUILD_TIME: "2026-09-17T04:37:55.168Z"
  });
}
function DemoList({ items }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: items.map((demo) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "li",
    {
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "a",
        {
          className: "\n                          univer-flex univer-items-center univer-rounded-lg univer-px-4 univer-py-3 univer-no-underline\n                          hover:univer-bg-slate-50\n                        ",
          href: demo.href,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              {
                className: "\n                              univer-min-w-0 univer-shrink univer-truncate univer-font-medium univer-text-slate-900\n                            ",
                children: demo.title
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "span",
              {
                "aria-hidden": "true",
                className: "\n                              univer-mx-3 univer-min-w-4 univer-flex-1 univer-border-b univer-border-dotted\n                              univer-border-slate-300\n                            "
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "univer-shrink-0 univer-text-sm univer-text-slate-500", children: demo.dir })
          ]
        }
      )
    },
    demo.dir
  )) });
}
function Examples() {
  var _a2;
  new ThemeSwitcherService().injectThemeToHead(default_default);
  const [activeCategory, setActiveCategory] = (0, import_react.useState)(defaultCategory);
  const activeGroup = (_a2 = primaryGroups.find((group) => group.category === activeCategory)) != null ? _a2 : primaryGroups[0];
  const otherGroup = groupedDemos.find((group) => group.category === "others");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "main",
    {
      className: "\n              univer-h-screen univer-overflow-y-auto univer-bg-white univer-px-6 univer-py-10 univer-text-slate-800\n            ",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "univer-mx-auto univer-max-w-3xl", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "univer-mb-8 univer-flex univer-items-center univer-gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "univer-w-12", src: "/favicon.svg", alt: "Univer", draggable: false }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { className: "univer-text-3xl univer-font-semibold univer-text-slate-900", children: [
            "Univer",
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("sup", { className: "univer-ml-2 univer-text-sm univer-font-normal univer-text-slate-500", children: [
              "v",
              package_default.version
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "univer-mb-8", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "univer-mb-4 univer-flex univer-gap-2", children: primaryGroups.map((group) => {
            const isActive = group.category === activeCategory;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                className: clsx(`univer-cursor-pointer univer-rounded-full univer-border-none univer-px-4 univer-py-2 univer-text-sm univer-font-medium`, isActive ? "univer-bg-slate-900 univer-text-white" : `univer-bg-white univer-font-medium univer-text-slate-700 hover:univer-bg-slate-50`),
                type: "button",
                onClick: () => setActiveCategory(group.category),
                children: [
                  group.title,
                  "(",
                  group.items.length,
                  ")"
                ]
              },
              group.category
            );
          }) }),
          activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "univer-mb-3 univer-text-lg univer-font-semibold univer-text-slate-900", children: activeGroup.title }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoList, { items: activeGroup.items })
          ] })
        ] }),
        otherGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "univer-mb-3 univer-text-lg univer-font-semibold univer-text-slate-900", children: otherGroup.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoList, { items: otherGroup.items })
        ] })
      ] })
    }
  );
}
render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Examples, {}), document.getElementById("app"));
