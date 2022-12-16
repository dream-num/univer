# style-universheet

简体中文 | [English](./README.md)

## 介绍

UniverSheet Collaboration插件

### 安装

```bash
npm i @univer/common-plugin-collaboration
```

### 使用

```js
impport {Collaboration} from '@univer/common-plugin-collaboration'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Collaboration());
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
# 当前目录 ./packages/common-plugin-collaboration/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/common-plugin-collaboration dev
```

### 打包

```
# 当前目录 ./packages/common-plugin-collaboration/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/common-plugin-collaboration build
```
