# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet Find 插件

### 安装

```bash
npm i @univer/sheets-plugin-find
```

### 使用

```js
impport {Find} from '@univer/sheets-plugin-find'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Find());
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
# 当前目录 ./packages/sheets-plugin-find/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-find dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-find/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-find build
```
