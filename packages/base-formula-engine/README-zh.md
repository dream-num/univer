# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet FormulaEngine 插件

### 安装

```shell
npm i @univerjs/base-formula-engine
```

### 使用

```js
import { FormulaEngine } from '@univerjs/base-formula-engine';

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new FormulaEngine());
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
# 当前目录 ./packages/base-formula-engine/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univerjs/base-formula-engine dev
```

### 打包

```
# 当前目录 ./packages/base-formula-engine/
npm run build

# 或者根目录 ./
pnpm run --filter  @univerjs/base-formula-engine build
```
