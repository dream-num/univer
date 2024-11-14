# How to Fix Memory Leak

## How to Investigate Memory Leak

First you need to run the demo in E2E mode:

```shell
pnpm dev:e2e
```

Then, you can use the Chrome DevTools to investigate the memory leak.

You can create a Workbook and then dispose it from the console by running:

```javascript
E2EControllerAPI.loadAndRelease()
```

## Frequent Reasons for Memory Leak

### Get current unit in singleton modules

It is very common to cause memory leak if you get the current unit in singleton modules. Singleton modules are defined as modules that are registered in the Univer root injector instead of injectors held by render units.

For example: https://github.com/dream-num/univer/blob/dev/packages/sheets-drawing-ui/src/services/canvas-float-dom-manager.service.ts#L433.

## How to Investigate Memory Leak for Node.js

TODO @wzhudev
