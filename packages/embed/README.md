# @univerjs/embed

[![npm version](https://img.shields.io/npm/v/@univerjs/embed?style=flat-square)](https://npmjs.com/package/@univerjs/embed)
[![license](https://img.shields.io/npm/l/@univerjs/embed?style=flat-square)](https://npmjs.com/package/@univerjs/embed)
[![downloads](https://img.shields.io/npm/dm/@univerjs/embed?style=flat-square)](https://npmjs.com/package/@univerjs/embed)

`@univerjs/embed` provides the cross-unit embed model and runtime foundation for Univer, including embed descriptors, resource references, capabilities, lifecycle commands, and Facade APIs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/embed` | `UniverEmbed` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/embed
# or
npm install @univerjs/embed
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverEmbedPlugin } from '@univerjs/embed';

univer.registerPlugin(UniverEmbedPlugin);
```

## Integration Notes

Register this package before UI or product-specific embed integrations. Use `@univerjs/embed-ui` when the host needs render containers, floating menus, toolbar controls, fullscreen behavior, or embedded child-unit mounting.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/embed)
- [GitHub repository](https://github.com/dream-num/univer)
