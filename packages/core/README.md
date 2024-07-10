# @univerjs/core

## Package Overview

| Package Name | UMD Namespace | Version | License | Downloads | Contains CSS | Contains i18n locales |
| --- | --- | --- | --- | --- | :---: | :---: |
| `@univerjs/core` | `UniverCore` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] | ❌ | ❌ |

## Introduction

`@univerjs/core` as its name shows, is the core package of Univer, and provides foundational capabilities including:

* Provision of the Univer type, which serves as the entry point for applications and a mounting point for other plugins, as well as the UniverDoc and UniverSheet types for managing different document types
* Basic models for each document type
* Definition or implementation of several fundamental services, such as:
  * Permission control
  * Command system
  * Undo/Redo
  * Configuration system
  * Logging system
  * Context system
  * Lifecycle
  * Local storage
  * Internationalization
  * Resource management

For more information about `@univerjs/core`'s API, please refer to the [API documentation](https://univer.ai/typedoc/@univerjs/core/README).

## Usage

### Installation

```shell
# Using npm
npm install @univerjs/core

# Using pnpm
pnpm add @univerjs/core
```

### Configuration

```typescript
import { Univer } from '@univerjs/core';

new Univer({
    theme: defaultTheme,
    locale: LocaleType.EN_US,
    locales,
    logLevel: LogLevel.VERBOSE,
});
```

#### Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| theme | [Theme](https://univer.ai/guides/sheet/advanced/custom-theme) | - | The theme of the application, which is used to control the appearance of the application. |
| locale | [LocaleType](https://univer.ai/typedoc/@univerjs/core/enumerations/LocaleType) | `LocaleType.ZH_CN` | The locale of the application. The default value is `LocaleType.ZH_CN`.
| locales | [ILocales](https://univer.ai/typedoc/@univerjs/core/interfaces/ILocales) | - | The supported locales of the application. By default, the application supports Chinese.
| logLevel | [LogLevel](https://univer.ai/typedoc/@univerjs/core/enumerations/LogLevel) | `LogLevel.SILENT` | The log level of the application. |

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/core?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/core
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/core?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/core?style=flat-square
