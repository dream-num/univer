# How to Fix Memory Leak

## How to Investigate Memory Leak

First you need to run the demo in E2E mode:

```shell
pnpm dev:e2e
```

Then, you can use the Chrome DevTools to investigate the memory leak.

You can create a `Workbook` and then dispose it from Console by running:

```javascript
E2EControllerAPI.loadAndRelease()
```

And you can take profiles of the application and see if `Workbook` instances are being retained.

You can also see if the `Univer` instance is being retained after we dispose it by running in Console:

```javascript
E2EControllerAPI.disposeUniver()
```

## Frequent Reasons for Memory Leak

### Forget to call dispose subscriptions

For example: dream-num/univer@6423ff8/packages/sheets-drawing-ui/src/controllers/sheet-drawing-update.controller.ts#L244

**HOW TO FIX**: Please remember to dispose subscriptions.

### Get current unit in singleton modules

It is very common to cause memory leak if you get the current unit in singleton modules and subscribe to it. Singleton modules are defined as modules that are registered in the Univer root injector instead of injectors held by render units.

For example: https://github.com/dream-num/univer/blob/dev/packages/sheets-drawing-ui/src/services/canvas-float-dom-manager.service.ts#L433.

**HOW TO FIX**: Please consider extracting the related logic to an `IRenderModule` instead.

### Has big objects in dep arrays of `useEffect` or `useMemo`

React would keep the dep arrays into memory, so if you put a big object into an array, it would cause memory leak.

For example: https://github.com/dream-num/univer/blob/6423ff8ede75ae7b2e003fff99fd9866aa18f1dd/packages/sheets-ui/src/views/sheet-container/SheetContainer.tsx#L88

**HOW TO FIX**: Please consider using `unitId` in dep arrays instead.

## How to Investigate Memory Leak for Node.js

TODO @wzhudev
