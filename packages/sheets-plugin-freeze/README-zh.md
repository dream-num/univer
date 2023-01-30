# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet Frozen 插件

### 安装

```bash
npm i @univerjs/sheets-plugin-freeze
```

### 使用

```js
impport {Frozen} from '@univerjs/sheets-plugin-freeze'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new Frozen());
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
# 当前目录 ./packages/sheets-plugin-freeze/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univerjs/sheets-plugin-freeze dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-freeze/
npm run build

# 或者根目录 ./
pnpm run --filter  @univerjs/sheets-plugin-freeze build
```
