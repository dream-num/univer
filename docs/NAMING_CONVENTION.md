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
