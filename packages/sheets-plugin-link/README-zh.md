# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet InsertLink 插件

### 安装

```bash
npm i @univer/sheets-plugin-insert-link
```

### 使用

```js
impport {InsertLink} from '@univer/sheets-plugin-insert-link'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new InsertLink());
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
# 当前目录 ./packages/plugin-insert-link/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-insert-link dev
```

### 打包

```
# 当前目录 ./packages/plugin-insert-link/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-insert-link build
```
