# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet ImportDoc插件

### 安装

```bash
npm i @univer/docs-plugin-import-doc
```

### 使用

```js
impport {ImportDoc} from '@univer/docs-plugin-import-doc'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new ImportDoc());
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
# 当前目录 ./packages/docs-plugin-import-doc/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/docs-plugin-import-doc dev
```

### 打包

```
# 当前目录 ./packages/docs-plugin-import-doc/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/docs-plugin-import-doc build
```
