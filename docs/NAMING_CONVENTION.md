# Univer Naming Convention

To ensure code quality and consistency, please adhere to the following guidelines.

## Files & Folders

Use kebab-case for both file names and folder names. If the file contains a React component, it should be in PascalCase. For example:

```txt
// ✅
src/
  components/
    my-component/
      my-util.ts
      MyComponent.tsx

// 🚫
src/
  components/
    myComponent/
      myUtil.ts
      my-component.tsx
```

Folder names should be in plural format. Files names should be in singular format. For example:

```txt
// ✅
src/
  services/
    util.ts

// 🚫
src/
  service/
    utils.ts
```

Do use conventional type names including .service, .controller, .menu, .command, .mutation, and .operation. Invent additional type names if you must but take care not to create too many. For example:

```txt
// ✅
src/
  services/
    log.service.ts
    user.service.ts
  controllers/
    log.controller.ts
    user.controller.ts
```

## Interfaces

Interfaces should be named starting with a capital "I". For example:

```typescript
// ✅
export interface IMyInterface {}

// 🚫
export interface MyInterface {}
```

## Dependency Injection Token

Sometimes you need to defined a dependency injection token. Please adhere to the following naming convention:

```typescript
export const IYourServiceOrControllerName = createIdentifier<IYourServiceOrControllerName>('<package-name>.<your-service-or-controller-name>.(service|controller)');
```

For example:

```typescript
// ✅
export const ILogService = createIdentifier<ILogService>('core.log.service');

// 🚫
export const ILogService = createIdentifier<ILogService>('log-service');
```

## Plugins' Names

Plugin names should be all in format of `<BUSINESS_TYPE>_<PLUGIN_NAME>_PLUGIN`. Words should be separated by underscores and suffixed. For example:

```typescript
// ✅
export const SHEET_CONDITIONAL_FORMATTING_PLUGIN = 'SHEET_CONDITIONAL_FORMATTING_PLUGIN';

// 🚫
export const SHEET_CONDITIONAL_FORMATTING_PLUGIN = 'SHEET_CONDITIONAL_FORMATTING';

// 🚫
export const SHEET_CONDITIONAL_FORMATTING_PLUGIN = 'sheet-conditional-formatting-plugin';
```

### Plugins' classes

Plugin classes should be named in PascalCase and prefixed by `Univer`. For example:

```typescript
// ✅
export class UniverFilterPlugin extends Plugin {}

// 🚫
export class FilterPlugin extends Plugin {}
```

### Resource key

Resource key should be identical to the corresponding plugin's name.

## Commands

Commands' names should follow the convention below:

```typescript
export interface ISomeCommandParams {
    // Define the parameters here
}

export const SomeCommand = ICommand<ISomeCommandParams> = {
    id: '<business-type>.<command-type>.<command-name>',
};
```

For example:

```typescript
// ✅
export const SetSelectionFrozenCommand: ICommand<ISetSelectionFrozenCommandParams> = {
    id: 'sheet.command.set-selection-frozen', // note this should be in single format
}

// 🚫
export const SetSelectionFrozenCommand: ICommand<ISetSelectionFrozenCommandParams> = {
    id: 'sheets.command.set-selection-frozen',
}

// 🚫
export const SetSelectionFrozenCommand: ICommand<ISetSelectionFrozenCommandParams> = {
    id: 'SetSelectionFrozenCommand',
}
```

If this command is for general purpose, the `business-type` should be the plugin's name. For example:

```typescript
export const ResolveCommentCommand: ICommand<IResolveCommentCommandParams> = {
    id: 'thread-comment.command.resolve-comment',
}
```

## Id

All IDs should be in pascal case: `id` or `Id`.

## Locale Keys

### Syntax

A locale key is a dot-separated path. The first segment is the **package namespace** and MUST match the package name.

```typescript
// ✅
'find-replace.button.confirm'
'sheets-filter-ui.permission.filterErr'

// 🚫
'button.confirm'                         // missing package namespace
'hyperLink.message.refError'             // namespace does not match package name
```

### Package namespace

Each package owns exactly one namespace and it MUST be identical to the package name.

| Package | Namespace |
|---|---|
| `@univerjs/find-replace` | `find-replace` |
| `@univerjs/sheets-filter` | `sheets-filter` |
| `@univerjs/sheets-filter-ui` | `sheets-filter-ui` |
| `@univerjs/sheets-hyper-link` | `sheets-hyper-link` |
| `@univerjs/sheets-hyper-link-ui` | `sheets-hyper-link-ui` |

Core and UI layers of the same feature MUST use **different** namespaces. For example, `sheets-filter` and `sheets-filter-ui` MUST NOT share `sheets-filter`.

### No cross-package references

A package MUST NOT reference a key whose first segment is another package's namespace.

```typescript
// In @univerjs/sheets-filter
// 🚫 references a key from the UI package
localeService.t('sheets-filter-ui.panel.empty')

// In @univerjs/sheets-filter-ui
// 🚫 references a key from a common/utility package
localeService.t('sheets-ui.permission.dialog.filterErr')

// ✅ sink the key into your own locale file
localeService.t('sheets-filter-ui.permission.filterErr')
```

### Namespace must be the single root key

The exported locale object MUST contain exactly one root key: the package namespace. All translations MUST be nested under it.

```typescript
// 🚫
const locale = {
    button: { confirm: 'OK' },            // unrelated top-level key
    'find-replace': { toolbar: '...' },
};

// ✅
const locale = {
    'find-replace': {
        toolbar: '...',
        button: { confirm: 'OK' },        // nested under the package namespace
    },
};
```

### No shared/common locale buckets

Do NOT create a "common" or "shared" namespace (e.g. `button.*`, `permission.dialog.*`) in a utility package for other packages to consume. Every package that needs a key defines it under its own namespace.

```typescript
// 🚫 defined in @univerjs/sheets-ui for others to reuse
'permission.dialog.filterErr'

// ✅ defined locally in @univerjs/sheets-filter-ui
'sheets-filter-ui.permission.filterErr'

// ✅ defined locally in @univerjs/sheets-hyper-link-ui
'sheets-hyper-link-ui.permission.hyperLinkErr'
```

Duplication across namespaces is acceptable.
