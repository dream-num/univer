# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Protection 插件

### 安装

```bash
npm i @univer/sheets-plugin-protection
```

### 使用

```js
impport {Protection} from '@univer/sheets-plugin-protection'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Protection());
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
# 当前目录 ./packages/sheets-plugin-protection/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-protection dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-protection/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-protection build
```
