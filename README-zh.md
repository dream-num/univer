# Univer

简体中文 | [English](./README.md)

## 介绍

🚀Univer，原 [Luckysheet 2.0](https://github.com/dream-num/Luckysheet) 升级。

> ⚠️ 该项目仍在开发中，仅用于测试和学习，不得用于生产

## Demo

-   [Univer Demo](dream-num.github.io/univer-demo/)

## 开发

### 环境

[Node.js](https://nodejs.org/en/) Version >= 14.19

### 安装

```
git clone http://github.com/dream-num/univer
cd univer
npm i -g pnpm # MacOS : sudo npm i -g pnpm
npx playwright install
pnpm i
```

### 开发

启动 sheets

```
npm run dev
```

启动 docs

```
npm run dev:doc
```

启动 slides

```
npm run dev:slide
```

更多开发教程请参考 [贡献指南](./.github/contributing-zh.md)。

## 问题反馈

请到 [Issues](http://github.com/dream-num/univer/issues) 提交问题。

## 关注者

[![Stargazers repo roster for @dream-num/univer](https://reporoster.com/stars/dream-num/univer)](https://github.com/dream-num/univer/stargazers)

## 开发计划

### Sheets

-   基础能力

    -   [x] 核心数据结构
    -   [x] 渲染
    -   [x] 界面
    -   [x] 单元格编辑

-   sheet 操作

    -   [x] sheet 删除
    -   [x] sheet 复制
    -   [x] sheet 排序
    -   [x] sheet 重命名
    -   [x] sheet 更改颜色
    -   [x] sheet 隐藏
    -   [x] sheet 取消隐藏
    -   [x] sheet 向左移
    -   [x] sheet 向右移

-   右击菜单

    -   [x] 复制
    -   [x] 粘贴
    -   [x] 插入行
    -   [x] 插入列
    -   [x] 删除选中行
    -   [x] 删除选中列
    -   [x] 删除单元格
    -   [x] 清除内容

-   工具栏

    -   [x] 撤销
    -   [x] 重做
    -   [ ] 格式刷
    -   [ ] 货币格式
    -   [ ] 百分比格式
    -   [ ] 减少小数位数
    -   [ ] 增加小数位数
    -   [ ] 更多格式
    -   [x] 字体
    -   [x] 字体大小
    -   [x] 加粗
    -   [x] 斜体
    -   [x] 删除线
    -   [x] 下划线
    -   [x] 文本颜色
    -   [x] 单元格颜色
    -   [x] 边框
    -   [x] 合并单元格
    -   [x] 水平对齐
    -   [x] 垂直对齐
    -   [x] 文本换行
    -   [x] 文本旋转

-   计数栏

    -   [x] 计数
    -   [x] 缩放

-   插件
    -   [x] 剪切板
    -   [ ] 单元格格式
    -   [ ] 公式
    -   [ ] 图片
    -   [ ] 冻结
    -   [ ] 链接
    -   [ ] 批注
    -   [ ] 数据透视表
    -   [ ] 图表
    -   [ ] 排序
    -   [ ] 筛选
    -   [ ] 条件格式
    -   [ ] 交替颜色
    -   [ ] 数据验证
    -   [ ] 分列
    -   [ ] 截图
    -   [ ] 查找
    -   [ ] 替换
    -   [ ] 工作表保护
    -   [ ] 打印
    -   [ ] 导入导出
    -   [ ] 协同

### Docs

-   [x] 渲染
-   [ ] 界面
-   [ ] 待定

### Slides

-   [ ] 渲染
-   [ ] 界面
-   [ ] 待定
