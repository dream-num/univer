# @univerjs/umd

## Package Overview

| Package Name | Version | License | Downloads |
| --- | --- | --- | --- |
| `@univerjs/umd` | [![][npm-version-shield]][npm-version-link] | ![][npm-license-shield] | ![][npm-downloads-shield] |

## Introduction

`@univerjs/umd` is a UMD bundle for Univer. It is a standalone version of the library that can be used in any web project without the need for a module bundler.

## Usage

You can include the UMD bundle in your HTML file using the following script tag:

```html
<script src="https://unpkg.com/@univerjs/umd/lib/univer.full.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@univerjs/umd/lib/univer.css">
```

If you are already using React, ReactDOM, and RxJS in your project, you can opt for the slim version of the UMD bundle, which excludes these dependencies.

```diff
+ <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
+ <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
+ <script src="https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js"></script>

- <script src="https://unpkg.com/@univerjs/umd/lib/univer.full.umd.js"></script>
+ <script src="https://unpkg.com/@univerjs/umd/lib/univer.slim.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@univerjs/umd/lib/univer.css">
```

<!-- Links -->
[npm-version-shield]: https://img.shields.io/npm/v/@univerjs/core?style=flat-square
[npm-version-link]: https://npmjs.com/package/@univerjs/core
[npm-license-shield]: https://img.shields.io/npm/l/@univerjs/core?style=flat-square
[npm-downloads-shield]: https://img.shields.io/npm/dm/@univerjs/core?style=flat-square
