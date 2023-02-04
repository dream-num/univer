# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet Spreadsheet 插件

### 安装

```shell
npm i univer-preact-ts
```

### 使用

```js
import {Spreadsheet} from 'univer-preact-ts'

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
# 当前目录 ./packages/preact-ts/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  univer-preact-ts dev
```

### 打包

```
# 当前目录 ./packages/preact-ts/
npm run build

# 或者根目录 ./
pnpm run --filter  univer-preact-ts build
```
