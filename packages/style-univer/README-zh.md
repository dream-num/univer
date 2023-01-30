# style-univer

简体中文 | [English](./README.md)

## 介绍

Universheet 官方 UI 组件库

## 特性

-   纯 tsx 组件，可方便集成到 vue/react
-   按需引入，不用担心影响打包体积

## 用法

### 安装

```shell
npm i @univerjs/style-univer
```

### 使用

```js
impport baseUI from '@univerjs/style-univer'
universheet.install(baseUI)
universheet.create({
    plugins:['style-univer']
})
```

## 本地开发

### 环境

-   [Node.js](https://nodejs.org/en/) Version >= 10
-   [npm](https://www.npmjs.com/) Version >= 7

### 安装

```
npm i
```

### 开发

```
# 当前目录 ./packages/style-univer/
npm run dev

# 或者项目根目录 ./
npm run dev -w @univerjs/style-univer
```

### 打包

```
# 当前目录 ./packages/style-univer/
npm run build

# 或者根目录 ./
npm run build -w @univerjs/style-univer
```

## 组件库文档

使用[Docusaurus 2](https://docusaurus.io/)构建

### 安装

```console
# 根目录
npm i
```

### 开发

```console
# 当前目录
npm run start

# 或者根目录
npm run start -w @univerjs/style-univer
```

此命令启动本地开发服务器并打开浏览器窗口。 大多数更改都会实时刷新，而无需重新启动服务器。

### 打包

```console
# 当前目录
npm run build:doc

# 或者根目录
npm run build:doc -w @univerjs/style-univer
```

此命令将静态内容生成到 `build` 目录中，并且可以使用任何静态内容托管服务来提供。
