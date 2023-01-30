# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Sort 插件

### 安装

```bash
npm i @univer/sheets-plugin-sort
```

### 使用

```js
import {Sort} from '@univer/sheets-plugin-sort'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Sort());
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
# 当前目录 ./packages/sheets-plugin-sort/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-sort dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-sort/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-sort build
```
