# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet ClipboardOffice插件

### 安装

```bash
npm i @univer/sheets-plugin-clipboard-office
```

### 使用

```js
impport {ClipboardOffice} from '@univer/sheets-plugin-clipboard-office'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ClipboardOffice());
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
# 当前目录 ./packages/sheets-plugin-clipboard-office/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-clipboard-office dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-clipboard-office/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-clipboard-office build
```
