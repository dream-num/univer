# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet ImportXlsx 插件

### 安装

```shell
npm i @univerjs/sheets-plugin-import-xlsx
```

### 使用

```js
import { ImportXlsx } from '@univerjs/sheets-plugin-import-xlsx';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ImportXlsx());
```

## 本地开发

### 环境

-   [Node.js](https://nodejs.org/en/) Version >= 10
-   [npm](https://www.npmjs.com/) Version >= 6

### 安装

```
pnpm install
```

### 开发

```
# 当前目录 ./packages/sheets-plugin-import-xlsx/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univerjs/sheets-plugin-import-xlsx dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-import-xlsx/
npm run build

# 或者根目录 ./
pnpm run --filter  @univerjs/sheets-plugin-import-xlsx build
```
