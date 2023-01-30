# Univer Contributing Guide

## Tool

-   vite
-   Typescript/tsx
-   Typescript references
-   pnpm workspace

## Project Introduction

For multi-package projects managed by lerna, there are plugins and cores in the packages directory, and examples are in the examples directory

## Develop

### Install dependencies

Node.js >= 14.19

```shell
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
npx playwright install
pnmp install
npm run dev
```

### Command

Execute a command in a subpackage

```shell
pnpm run --filter  [package name] [command]
```

For example, start the `dev` development mode of the `packages/sheets-plugin-sort` project

```shell
pnpm run --filter @univerjs/sheets-plugin-sort dev

```

### Clean

If you encounter any npm installation problems, please try one-click reinstallation of dependencies first

```shell
npm run clean
```

### Plug-in development

1. Quickly generate plug-in template directory

```shell
npm run cli
```

2. For example, select the `plugin-temp` template and enter the plugin name `filter` to generate the `packages/sheets-plugin-filter` plugin.

3. Execute the following command to start the plug-in development mode

```shell
pnpm run --filter  @univerjs/sheets-plugin-filter dev
```

4. There will be an additional `filter` plugin button in the toolbar on the interface

## Code comment

English is preferred, if the comment is longer, you can add bilingual

```js
/*
  en: get result

  zh: 得出结果
*/
function(){

}
```

## Update a dependency package

```shell
pnpm update
```
