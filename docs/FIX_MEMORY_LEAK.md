# How to Fix Memory Leak

## How to Investigate Memory Leak

Start the workbench and select the smallest route that reproduces the leak from the navigation bar:

```shell
pnpm dev
```

Take a baseline heap snapshot in Chrome DevTools, exercise the behavior, then dispose the mounted instance from the Console:

```javascript
window.univer?.dispose();
delete window.univer;
delete window.univerAPI;
document.querySelector('#app')?.replaceChildren();
```

Force garbage collection and take another snapshot. Reload the page between runs so each measurement starts from a fresh fixture.

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
