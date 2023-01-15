# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Spreadsheet 插件

### 安装

```bash
npm i @univer/base-render
```

### 使用

```js
import {Spreadsheet} from '@univer/base-render'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Spreadsheet());
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
# 当前目录 ./packages/base-render/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/base-render dev
```

### 打包

```
# 当前目录 ./packages/base-render/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/base-render build
```
