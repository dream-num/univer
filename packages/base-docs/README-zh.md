# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Docs插件

### 安装

```bash
npm i @univer/base-docs
```

### 使用

```js
impport {Docs} from '@univer/base-docs'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Docs());
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
# 当前目录 ./packages/base-docs/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/base-docs dev
```

### 打包

```
# 当前目录 ./packages/base-docs/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/base-docs build
```
