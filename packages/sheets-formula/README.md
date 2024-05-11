# @univerjs/sheets-formula

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-formula)](https://img.shields.io/npm/l/@univerjs/sheets-formula)
![CSS Included](https://img.shields.io/badge/CSS_Included-blue?logo=CSS3)
![i18n](https://img.shields.io/badge/zh--CN%20%7C%20en--US-cornflowerblue?label=i18n)

## Introduction

`@univerjs/sheets-formula` provides the ability to edit formulas in spreadsheets, including features such as auto-completion, formula suggestions, drop-down filling for formulas, and copy-paste functionality.

:::note
Formula calculation is one of the core functionalities of spreadsheets, and formula calculation scheduling is done in `@univerjs/sheets`.
:::

## Usage

### Installation

```shell
# Using npm
npm install @univerjs/sheets-formula

# Using pnpm
pnpm add @univerjs/sheets-formula
```

### How To Customize Formulas

If the officially provided formula does not meet your needs, you can expand the formula yourself. Depending on different needs, we provide multiple ways to support registering one or more custom formulas.

- [Register formula using Facade API](https://univer.ai/guides/sheet/facade/general/#register-formula)
- [Custom Formula](https://univer.ai/guides/sheet/customization/formula/)
