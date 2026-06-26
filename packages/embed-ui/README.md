# @univerjs/embed-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/embed-ui?style=flat-square)](https://npmjs.com/package/@univerjs/embed-ui)
[![license](https://img.shields.io/npm/l/@univerjs/embed-ui?style=flat-square)](https://npmjs.com/package/@univerjs/embed-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/embed-ui?style=flat-square)](https://npmjs.com/package/@univerjs/embed-ui)

`@univerjs/embed-ui` provides the host-side UI integration layer for Univer embeds, including host adapters, render containers, floating menus, fullscreen controls, passive viewport handling, and embedded child-unit mounting.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/embed-ui` | `UniverEmbedUi` | Yes | Yes | No |

## Installation

```sh
pnpm add @univerjs/embed-ui
# or
npm install @univerjs/embed-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/embed-ui/lib/index.css';
import EnUS from '@univerjs/embed-ui/locale/en-US';
import { UniverEmbedUIPlugin } from '@univerjs/embed-ui';

univer.registerPlugin(UniverEmbedUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Integration Notes

This package depends on `@univerjs/embed`. Register `UniverEmbedUIPlugin` after the base embed plugin and after the UI packages that provide the host surface.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/embed-ui)
- [GitHub repository](https://github.com/dream-num/univer)
