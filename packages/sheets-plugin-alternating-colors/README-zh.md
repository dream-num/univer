# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet AlternatingColors 插件

### 安装

```bash
npm i @univer/sheets-plugin-alternating-colors
```

### 使用

```js
impport {AlternatingColors} from '@univer/sheets-plugin-alternating-colors'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new AlternatingColors());
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
# 当前目录 ./packages/sheets-plugin-alternating-colors/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-alternating-colors dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-alternating-colors/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-alternating-colors build
```
