# Univer

English | [简体中文](./README-zh.md)

## Introduction

🚀Univer, [Luckysheet 2.0](https://github.com/dream-num/luckysheet) upgrade version.

> ⚠️ This project is still in development, only for testing and learning, not for production

## Demo

-   [Univer Demo](dream-num.github.io/univer-demo/)

## Development

### Requirements

[Node.js](https://nodejs.org/en/) Version >= 14.19

### Installation

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
npx playwright install
pnpm i
```

### Development

Start sheets

```
npm run dev
```

Start docs

```
npm run dev:doc
```

Start slides

```
npm run dev:slide
```

For more development tutorials, please refer to [Contribution Guide](./.github/contributing.md).

## Issues

Please file an issue at [Issues](http://github.com/dream-num/univer/issues).

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## Development Plan

### Sheets

-   Basic ability

    -   [x] core data structures
    -   [x] render
    -   [x] UI
    -   [x] cell editing

-   Sheet operation

    -   [x] sheet delete
    -   [x] sheet copy
    -   [x] sheet sort
    -   [x] sheet rename
    -   [x] sheet change color
    -   [x] sheet hide
    -   [x] sheet unhide
    -   [x] sheet move left
    -   [x] sheet moves right

-   Right click menu

    -   [x] copy
    -   [x] paste
    -   [x] insert row
    -   [x] insert column
    -   [x] delete selected rows
    -   [x] delete selected columns
    -   [x] delete cell
    -   [x] clear content

-   Toolbar

    -   [x] undo
    -   [x] redo
    -   [ ] formatter
    -   [ ] currency format
    -   [ ] percent format
    -   [ ] decrease decimal places
    -   [ ] increase the number of decimal places
    -   [ ] more formats
    -   [x] font family
    -   [x] font size
    -   [x] bold
    -   [x] italic
    -   [x] strikethrough
    -   [x] underscore
    -   [x] text color
    -   [x] fill color
    -   [x] border
    -   [x] merge cells
    -   [x] horizontal alignment
    -   [x] vertical alignment
    -   [x] text wrap
    -   [x] text rotation

-   Count bar

    -   [x] count
    -   [x] zoom

-   Plugins
    -   [x] clipboard
    -   [ ] format
    -   [ ] formula
    -   [ ] image
    -   [ ] freeze
    -   [ ] link
    -   [ ] comment
    -   [ ] pivot table
    -   [ ] chart
    -   [ ] sort
    -   [ ] filter
    -   [ ] conditional format
    -   [ ] alternating colors
    -   [ ] data validation
    -   [ ] split column
    -   [ ] screenshot
    -   [ ] find
    -   [ ] replace
    -   [ ] protection
    -   [ ] print
    -   [ ] import and export
    -   [ ] collaboration

### Docs

-   [x] render
-   [ ] UI
-   [ ] pending

### Slides

-   [ ] render
-   [ ] UI
-   [ ] pending
