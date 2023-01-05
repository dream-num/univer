# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet Comment 插件

### 安装

```bash
npm i @univer/sheets-plugin-comment
```

### 使用

```js
impport {Comment} from '@univer/sheets-plugin-comment'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Comment());
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
# 当前目录 ./packages/sheets-plugin-comment/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-comment dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-comment/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-comment build
```
