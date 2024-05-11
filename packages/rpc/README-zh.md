# @univerjs/rpc

[![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)
[![license](https://img.shields.io/npm/l/@univerjs/rpc)](https://img.shields.io/npm/l/@univerjs/rpc)

## 简介

在处理一些比较耗时的任务——例如公式计算——时，Univer 可以将它们转移到主线程之外的地方进行，例如 Web Worker 线程中。@univerjs/rpc 提供了一套 RPC 机制，使得在主线程和其他线程之间进行通信变得简单。

详情请参考 [Web Worker 架构](https://univer.ai/zh-CN/guides/sheet/architecture/web-worker)。

## 使用指南

### 安装

```shell
# 使用 npm
npm install @univerjs/rpc

# 使用 pnpm
pnpm add @univerjs/rpc
```
