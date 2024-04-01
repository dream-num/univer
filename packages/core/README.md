# @univerjs/core

[![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)
[![license](https://img.shields.io/npm/l/@univerjs/core)](https://img.shields.io/npm/l/@univerjs/core)

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

For more information about `@univerjs/core`'s API, please refer to the API documentation.

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
    locale: LocaleType.ZH_CN,
    locales,
    logLevel: LogLevel.VERBOSE,
});
```

#### Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| theme | [Theme](https://univer.ai/api/design/#built-in-themes) | - | The theme of the application, which is used to control the appearance of the application. |
| locale | [LocaleType](https://univer.ai/api/core/enums/LocaleType.html) | `LocaleType.ZH_CN` | The locale of the application. The default value is `LocaleType.ZH_CN`.
| locales | [ILocales](https://univer.ai/api/core/interfaces/ILocales.html) | - | The supported locales of the application. By default, the application supports Chinese.
| logLevel | [LogLevel](https://univer.ai/api/core/enums/LogLevel.html) | `LogLevel.SILENT` | The log level of the application. |
