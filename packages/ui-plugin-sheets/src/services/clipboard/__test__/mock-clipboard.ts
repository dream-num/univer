interface IClipboardItem {
    readonly types: readonly string[];
    getType(type: string): Promise<Blob>;
}

export class MockClipboardItem implements IClipboardItem {
    constructor(private readonly itemTypes: readonly string[]) {}

    get types(): readonly string[] {
        return this.itemTypes;
    }

    getType(type: string): Promise<Blob> {
        // 在这里根据类型返回相应的模拟 Blob 对象
        if (type === 'text/html') {
            // 模拟返回一个假的 HTML 内容
            const htmlContent =
                '<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="73"></colgroup>\n<tbody><tr style="height: 25px;"><td style="text-align: center; vertical-align: middle; border-bottom: 0.5pt solid #000; border-right: 0.5pt solid #000; ">B1</td></tr></tbody></table></google-sheets-html-origin>';
            const blob = new Blob([htmlContent], { type: 'text/html' });
            return Promise.resolve(blob);
        }
        if (type === 'text/plain') {
            // 模拟返回一个假的 text 内容
            const htmlContent = 'Hello, Text!';
            const blob = new Blob([htmlContent], { type: 'text/plain' });
            return Promise.resolve(blob);
        }

        // 如果类型不匹配，可以返回一个错误的 Promise
        return Promise.reject(new Error('Unsupported type'));
    }
}

export class MockClipboard {
    read(): Promise<IClipboardItem[]> {
        // 在这里可以返回模拟的 IClipboardItem 数组
        const clipboardItems: IClipboardItem[] = [
            new MockClipboardItem(['text/plain', 'text/html']),
            new MockClipboardItem(['image/png', 'image/jpeg']),
        ];
        return Promise.resolve(clipboardItems);
    }
}

//   // 使用示例
//   const mockClipboard = new MockClipboard();
//   mockClipboard.read().then((clipboardItems) => {
//     for (const clipboardItem of clipboardItems) {
//       for (const type of clipboardItem.types) {
//         clipboardItem.getType(type).then((blob) => {
//           // 在这里可以处理获得的模拟 Blob 对象
//           if (type === "text/html") {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//               const htmlContent = reader.result as string;
//               console.log(htmlContent);
//             };
//             reader.readAsText(blob);
//           }
//         });
//       }
//     }
//   });
