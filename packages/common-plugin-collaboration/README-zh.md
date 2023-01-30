# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet Collaboration 插件

### 安装

```shell
npm i @univerjs/common-plugin-collaboration
```

### 使用

```js
impport {Collaboration} from '@univerjs/common-plugin-collaboration'

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
pnpm run --filter  @univerjs/common-plugin-collaboration dev
```

### 打包

```
# 当前目录 ./packages/common-plugin-collaboration/
npm run build

# 或者根目录 ./
pnpm run --filter  @univerjs/common-plugin-collaboration build
```
