# Facade

Facade 的意图是作为

1. 用户使用 Univer 的简单接口。如果用户没有自定义开发的需要而只是简单地使用一个表格组件，那么可以直接使用 Facade 提供的接口。
2. 用户使用 Apps Scripts 的接口。

Facade 和 Microsoft Excel 的 Office Scripts 以及 Google 的 Apps Scripts 有着相似的设计思路。它们都是为了简化用户的开发流程，让用户可以直接使用简单的接口来完成复杂的操作。中国国内的部分产品也提供了基于 API 的访问，例如钉钉文档的表格。

### Microsoft Excel 的 Office Scripts

[官方文档链接](https://learn.microsoft.com/en-us/office/dev/scripts/)

语法上使用了现代 TypeScript 语法，并且支持 async await 等语言特性。

```ts
function main(workbook: ExcelScript.Workbook) {
  // Add a new worksheet to store our email table
  let emailsSheet = workbook.addWorksheet("Emails");

  // Add data and create a table
  emailsSheet.getRange("A1:D1").setValues([
    ["Date", "Day of the week", "Email address", "Subject"]
  ]);
  let newTable = workbook.addTable(emailsSheet.getRange("A1:D2"), true);
  newTable.setName("EmailTable");

  // Add a new PivotTable to a new worksheet
  let pivotWorksheet = workbook.addWorksheet("Subjects");
  let newPivotTable = workbook.addPivotTable("Pivot", "EmailTable", pivotWorksheet.getRange("A3:C20"));

  // Setup the pivot hierarchies
  newPivotTable.addRowHierarchy(newPivotTable.getHierarchy("Day of the week"));
  newPivotTable.addRowHierarchy(newPivotTable.getHierarchy("Email address"));
  newPivotTable.addDataHierarchy(newPivotTable.getHierarchy("Subject"));
}
```

另外值得注意的是 Excel 还有另外一套 API 叫做 office-js，这套 API 的语法较为复杂，官方文档声明 office-js 面向开发者而 Office Scripts 面向一般用户。

据了解 office-js 是 Office Scripts 的底层，Office Scripts 对需要异步转同步的地方都做了一次类似于添加 await 语法的预编译。

### 钉钉表格的 API

[官方文档链接](https://open.dingtalk.com/document/orgapp/overview-of-dingtalk-scripts)

钉钉的语法设计和 Office Scripts 非常类似，除了它不用从一个 main 函数开始执行而是直接自顶向下执行脚本。

### Google 的 Apps Scripts

[官方文档](https://developers.google.com/apps-script/reference/spreadsheet?hl=zh-cn)

Apps Scripts 不仅可以操作表格，还可以操作 Google 的其他产品，例如 Google Docs，Google Drive 等等。它的语法和 JavaScript 非常类似，但是它的语法不支持 async await 等语言特性。实际上 Apps Scripts 的代码是同步阻塞执行的，并且 Apps Scripts 并非运行在浏览器中，而是运行在 Google 的服务器上，猜想应该是 hack 了解释器或者别的什么方式控制了脚本的执行过程。

```js
function createAndSendDocument() {
  try {
    // Create a new Google Doc named 'Hello, world!'
    const doc = DocumentApp.create('Hello, world!');

    // Access the body of the document, then add a paragraph.
    doc.getBody().appendParagraph('This document was created by Google Apps Script.');

    // Get the URL of the document.
    const url = doc.getUrl();

    // Get the email address of the active user - that's you.
    const email = Session.getActiveUser().getEmail();

    // Get the name of the document to use as an email subject line.
    const subject = doc.getName();

    // Append a new string to the "url" variable to use as an email body.
    const body = 'Link to your doc: ' + url;

    // Send yourself an email with a link to the document.
    GmailApp.sendEmail(email, subject, body);
  } catch (err) {
    // TODO (developer) - Handle exception
    console.log('Failed with error %s', err.message);
  }
}
```

## 可选的方案以及优缺点分析

我们设计 Facade 的 API 时受到以下条件的约束（或者不？）

1. 为了和 Apps Scripts 的语法保持一致（一定吗？），API 看起来要像是同步执行的
2. 必然有一些操作行为是异步的，例如读取文件，网络请求等等

所以我们需要设计一个机制，用户编写它时，看似是同步执行的，但是实际上是异步执行的。从这种思路出发有以下方案

1. 预编译。在用户编写代码之后，我们对代码进行预编译，将异步的操作转换为同步的操作（补充 async await 操作符）。
  1. 优点是：实现起来可能较为简单
  2. 缺点是：Facade 作为简单 API 和 Scripts 语法时语法不一致，并且可能无法给 Scripts 用户正确的类型信息
2. 同步阻塞式调用。在 Facade 内将所有需要用到异步语法 API 的地方全部改为一个同步的 XHRHttpRequest 调用，Facade 本身在 web worker 内运行并向主线程请求操作（通过 service worker 实现）。
  1. 优点是：可以实现真正的同步 API，而且可以给 Scripts 用户正确的类型信息
  2. 缺点是：只能跑在 web worker 里，无法作为简单 API 使用；复杂度很高
3. 自己控制脚本执行过程。暂时还没有明确的方案。
  1. 优点是：可以实现真正的同步 API，而且可以给 Scripts 用户正确的类型信息
  2. 缺点是：只能运行在服务器环境，无法作为简单 API 使用；复杂度极高

如果我们愿意放弃和 Apps Scripts 语法保持一致的前提，引入 async await 语法，那么我们可以使用以下方案

1. 引入 async await 语法。
  1. 优点是：Facade 作为简单 API 和 Scripts 语法效果完全一致；Scripts 用户可以得到完善的代码编辑提示；实现非常简单
  2. 需要引导用户使用 async await 语法；生成 Scripts 的 AI 模型需要额外的工作（现在有这样的模型吗？）
