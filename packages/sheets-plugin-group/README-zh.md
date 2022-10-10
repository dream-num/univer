# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Group插件

### 安装

```bash
npm i @univer/sheets-plugin-group
```

### 使用

```js
impport {Group} from '@univer/sheets-plugin-group'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Group());
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
# 当前目录 ./packages/sheets-plugin-group/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-group dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-group/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-group build
```
