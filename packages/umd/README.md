# @univerjs/umd

[![npm version](https://img.shields.io/npm/v/@univerjs/umd)](https://npmjs.org/package/@univerjs/umd)
[![license](https://img.shields.io/npm/l/@univerjs/umd)](https://img.shields.io/npm/l/@univerjs/umd)

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
