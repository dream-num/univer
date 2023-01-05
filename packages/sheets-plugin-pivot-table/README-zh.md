# style-univer

简体中文 | [English](./README.md)

## 介绍

UniverSheet PivotTable 插件

### 安装

```bash
npm i @univer/sheets-plugin-pivot-table
```

### 使用

```js
impport {PivotTable} from '@univer/sheets-plugin-pivot-table'

const univerSheet = new UniverSheet();
univerSheet.installPlugin(new PivotTable());
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
# 当前目录 ./packages/sheets-plugin-pivot-table/
npm run dev

# 或者项目根目录 ./
pnpm run --filter  @univer/sheets-plugin-pivot-table dev
```

### 打包

```
# 当前目录 ./packages/sheets-plugin-pivot-table/
npm run build

# 或者根目录 ./
pnpm run --filter  @univer/sheets-plugin-pivot-table build
```
