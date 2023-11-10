# Univer

[![codecov](https://codecov.io/gh/dream-num/univer/graph/badge.svg?token=aPfyW2pIMN)](https://codecov.io/gh/dream-num/univer)

English | [简体中文](./README-zh.md)

## Introduction

Univer is an open source collaborative solution that aims to empower the collaboration capability into all systems. With Univer, users can synchronously edit the file content, making files flowing smoothly within different types of systems and avoid downloading and uploading Microsoft Office files anymore.

We provide JavaScript part of code in the repository, including a canvas-based framework for building documents, spreadsheets, slides.

> ⚠️ This project is still in development, only for testing and learning, not for production.

## Demo

-   [Univer Demo](https://dream-num.github.io/univer-demo/)

## Contribution

Please refer to [Contribution Guide](./CONTRIBUTING.md).

## Community

Welcome to join our [Discord community](https://discord.gg/z3NKNT6D2f).

## Issues

Please file an issue at [Issues](http://github.com/dream-num/univer/issues).

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## Architecture

Univer is written in typescript and designed according to the plug-in architecture. The functions outside the core are developed in the form of plug-ins. In the future, a plug-in market will be built to meet more personalized needs
![image](./docs/source/overall.png)

## Rendering engine

Univer sheet, document, and slide adopt the same rendering engine architecture, which abstracts the application into text flow, table, canvas, and core part triggers rendering, and object is the renderer.
![image](./docs/source/Render%20Engine.png)

1. Achieve the nesting and operation between applications.
2. Sheet cells support embedding doc text
3. Support inserting sheet, doc, slide in slide

|     slide 10-layer embedding      |         Sheet in slide and doc in cell         |   wrap text around a picture    |
| :-------------------------------: | :--------------------------------------------: | :-----------------------------: |
| ![image](./docs/source/Slide.png) | ![image](./docs/source/Sheet%20in%20slide.png) | ![image](./docs/source/doc.png) |

## Formula engine

Univer formula engine, supports asynchronous calculation, lambda function and range naming

![image](./docs/source/Formula%20Engine.png)

---

Copyright DreamNum Inc. 2023-present

<!--
## Development Plan

### Sheets

> The goal of the first phase, [consistent with the function of luckysheet2.0 version](https://dream-num.github.io/LuckysheetDocs/guide/#features)

##### 🛠️Formatting

-   **Styling** `done`
-   **Conditional formatting** `2023Q1`
-   **Align or rotate text** `done`
-   **Support text truncation, overflow, automatic line wrapping** `done`
-   **Data types** `done`
    -   **currency, percentages, decimals, dates**
    -   **Custom**
-   **Cell segmentation style** `done`

##### 🧬Cells

-   **Move cells by drag and dropping** `done`
-   **Fill handle** `2023Q1`
-   **Auto Fill Options** `2023Q1`
-   **Multiple selection** `2023Q1`
-   **Find and replace** `2023Q2`
-   **Location** `2023Q4`
-   **Merge cells** `done`
-   **Data validation** `2023Q2`

##### 🖱️Row & columns

-   **Hide, Insert, Delete rows and columns** `2023Q1`
-   **Frozen rows and columns** `2023Q1`
-   **Split text** `2023Q4`

##### 🔨Operation

-   **Undo/Redo** `2023Q1`
-   **Copy/Paste/Cut** `2023Q1`
-   **Hot key** `2023Q2`
-   **Format Painter** `2023Q4`
-   **Selection by drag and dropping** `2023Q1`

##### ⚙️Formulas & functions

-   **formula engine (array formula, named, lambda)** `done`
-   **Built-in formulas** `2023Q1 - 2023Q4 finished according to the frequency of use`
-   **Remote formulas** `2023Q4`
-   **Custom** `2023Q4`

##### 📐Tables

-   **Filters** `2023Q2`
-   **Sort** `2023Q2`

##### 📈Pivot table

-   **Arrange fields** `2023Q3`
-   **Aggregation** `2023Q3`
-   **Filter data** `2023Q4`
-   **Drill down** `2023Q4`
-   **Create a PivotChart** `2023Q4`

##### 📊Chart

-   **Basic 6 Chart** `2023Q4 - 2024Q2`
-   **Advanced Chart** `2024Q4`
-   **SparkLines** `2024Q2`

##### ✍️Share

-   **Comments** `2023Q3`
-   **Collaborate** `2023Q3`

##### 📚Insert object

-   **Insert picture** (JPG,PNG,SVG and so on) `2023Q3`

##### ⚡Other

-   **Matrix operation** `2023Q4`
-   **Screenshot** `2023Q4`
-   **Copy to** `2023Q3`
-   **EXCEL import/export** `2023Q1 - 2023Q4 Gradually enhance compatibility`

> New feature

-   **Print** (Like excel print option, save to PDF) `2024Q2`
-   **Tree menu** (Just like the outline (group) function of excel) `2024Q1`
-   **Table new Features** (filter, slicer) `2024Q1`
-   **CSV,TXT import/export** (Specially adapted to Luckysheet) `2024Q1`
-   **Insert Shapes** ([Pen tool](https://github.com/mengshukeji/Pentool) Shapes) `2023Q2`

### Docs

#### 💌 Write & edit

-   **Add and edit text** `2023Q1`
-   **Find and replace text** `2023Q4`
-   **Check grammar, spelling, and more** `2024Q2`
-   **Show word count** `2023Q1`
-   **Insert and remove hyperlinks** `2023Q2`

#### 🛀 Format text

-   **Add and format text** `2023Q1`
-   **Create a bulleted or numbered list** `2023Q1`
-   **Change the line spacing** `2023Q1`
-   **Apply styles** `2023Q1`
-   **Apply themes** `2024Q1`

#### 🗺️ Lay out pages

-   **Change margins** `2023Q1`
-   **Create newsletter columns** `2023Q1`
-   **Change page orientation to landscape or portrait** `2023Q2`
-   **Add a border to a page** `2023Q4`
-   **Insert a header or footer** `2023Q2`
-   **Insert page numbers** `2023Q2`
-   **Insert a page break** `2023Q2`
-   **Insert a table of contents** `2024Q2`

#### 🧭 Lay out pages

-   **Insert a table** `2023Q2`
-   **Insert pictures** `2023Q1`
-   **Insert icons** `2023Q3`
-   **Insert WordArt** `2024Q3`
-   **Insert a watermark** `2023Q2`
-   **Show the ruler** `2023Q3`
-   **Rotate a picture or shape** `2023Q1`
-   **Wrap text around a picture in Word** `2023Q1`

#### 🛎️ For school

-   **Write an equation or formula** `2024Q2`
-   **Indent the first line of a paragraph** `2023Q1`
-   **Double-space the lines in a document** `2023Q1`

#### 🧳 Edit & print &

-   **Convert or save to PDF** `2024Q4`
-   **Edit a PDF** `2024Q4`
-   **Print your document** `2024Q4`
-   **Collaborate** `2023Q4`
-   **Comment** `2023Q4`
-   **mobile device** `2024Q4`

#### 🕰️ Other

-   **Insert a Sheet** `2023Q2`
-   **Insert a Slide** `2023Q2`
-   **Word import/export** `2023Q4 - 2024Q4 Gradually enhance compatibility`

### Slides

#### 📻 Slides & layouts

-   **Slide master** `2023Q3`
-   **Apply a slide layout** `2023Q3`
-   **Add color and design with Themes** `2023Q4`
-   **landscape and portrait** `2023Q4`
-   **Organize slides into sections** `2023Q4`
-   **Create, merge, and group objects on a slide** `2023Q2`
-   **Rotate or flip an object** `2023Q2`
-   **Change the order** `2023Q2`

#### 📱 Text & tables

-   **WordArt** `2024Q3`
-   **Hyperlink** `2023Q3`
-   **Check spelling** `2024Q4`
-   **Table** `2023Q2`
-   **Add slide numbers, page numbers, or the date and time** `2023Q4`
-   **Set text direction and position in a shape or text box** `2023Q3`

#### 📀 Pictures & graphics

-   **Insert a picture** `2023Q1`
-   **Edit pictures** `2024Q2`
-   **SmartArt** `2024Q2`
-   **Put a background picture** `2023Q2`
-   **Chart** `2023Q4 - 2024Q2`
-   **Shape** `2023Q2`
-   **Insert icons** `2023Q2`

#### 🧮 Present slideshows

-   **Presenter view** `2023Q2`
-   **Speaker notes** `2023Q4`
-   **Rehearse and time the delivery of a presentation** `2024Q4`
-   **Record a slide show** `2024Q4`
-   **Print your PowerPoint slides, handouts, or notes** `2024Q4`
-   **Self-running presentation** `2024Q4`

#### 📒 Animation, video & audio

-   **Transitions between slides** `2024Q2`
-   **Animate text or objects** `2024Q1`
-   **Morph transition** `2024Q4`
-   **Video** `2023Q4`
-   **Audio** `2023Q4`
-   **Record screen** `2024Q4`

#### 📫 Other

-   **Collaborate** `2023Q4`
-   **Convert a presentation as a video** `2024Q4`
-   **Save as PDF** `2024Q4`
-   **PowerPoint import/export** `2023Q4`
-   **Mobile** `2023Q4`
-   **insert Sheets** `2023Q2`
-   **insert documents** `2023Q2` -->
