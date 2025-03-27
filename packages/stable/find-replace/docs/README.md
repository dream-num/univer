# Design Spec of Find & Replace

## Introduction

Find & Replace (F&D) is a common feature in text editors. It is used to search for a string in the text and replace it with another string.

F&D is usually used in conjunction with the editor's regular expression feature.

## Architecture

Overall, F&D is divided into many packages and works as plugins. This package (@univerjs/find-replace) provides the find and replace scheduling service, interface and UI, and the business packages (e.g. @univerjs/sheets-find-replace) provide specific search and replace logics.

What does this package do?

- UI
    - TODO: Some UI should be determined by business plugins?

What do business packages (e.g @univerjs/sheets-find-replace) do?

由 find-replace 包提供查找替换的调度服务、接口以及 UI，业务包提供具体的查找替换方法

- 输入查找内容
- 确定搜索范围，当前 focused 的业务，或者全部的业务
- 切换查找模式
- 接收各个业务提供的查找结果（可能需要支持动态查找）
- 定位查找项的位置
- 结束查找
- 执行替换或者全部替换

各个包要做的事情

- 根据查找字符串的变化来搜索并把结果塞给 find-replace
- 查找高亮，定位到查找位置
- 执行替换 & re-update 查找结果

## Supported features in Jan 2024

## Features to be supported in the future
