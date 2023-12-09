---
sidebar_position: 6
---

# @univerjs/rpc

[![npm version](https://badge.fury.io/js/@univerjs%2Frpc.svg)](https://badge.fury.io/js/@univerjs%2Frpc)

在处理一些比较耗时的任务——例如公式计算——时，Univer 可以将它们转移到主线程之外的地方进行，例如 Web Worker 线程中。@univerjs/rpc 提供了一套 RPC 机制，使得在主线程和其他线程之间进行通信变得简单。

详情请参考 [Web Worker 架构](/docs/tutorial/architecture/web-worker)。