# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Register插件

### 安装

```bash
npm i @univer/common-plugin-register
```

### 使用

```js
impport {Register} from '@univer/common-plugin-register'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Register());
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
# 当前目录 ./packages/common-plugin-register/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/common-plugin-register dev
```

### 打包

```
# 当前目录 ./packages/common-plugin-register/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/common-plugin-register build
```
