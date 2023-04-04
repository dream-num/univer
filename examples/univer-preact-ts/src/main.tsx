import { DEFAULT_WORKBOOK_DATA, DEFAULT_WORKBOOK_DATA_DEMO, DEFAULT_WORKBOOK_DATA_DEMO3, DEFAULT_WORKBOOK_DATA_DEMO5, DEFAULT_WORKBOOK_DATA_DEMO7, DEFAULT_WORKBOOK_DATA_DOWN } from '@univerjs/common-plugin-data';
import { IWorkbookConfig, IWorksheetConfig, SheetTypes, Tools } from '@univerjs/core';
import { univerSheetCustom } from '.';

const baseSheetsConfig = {
    selections: {
        'sheet-01': [
            {
                selection: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 3,
                    endColumn: 3,
                },
                cell: {
                    row: 0,
                    column: 3,
                },
            },
        ],
    },
};
let uiSheetsConfig = {
    container: 'universheet-demo',
    layout: {
        sheetContainerConfig: {
            infoBar: false,
            formulaBar: false,
            toolbar: true,
            sheetBar: true,
            countBar: false,
            rightMenu: false,
        },
    },
}

let columnCount = 8;
if (window.innerWidth < 1366) {
    columnCount = 5;
}
const defaultWorkbookData = Tools.deepClone(DEFAULT_WORKBOOK_DATA_DEMO7);
// defaultWorkbookData.id = 'workbook-01';
// defaultWorkbookData.styles = null;
// defaultWorkbookData.namedRanges = null;
// defaultWorkbookData.sheets = {
//     'sheet-01': {
//         type: 0,
//         id: 'sheet-01',
//         name: 'sheet1',
//         columnCount,
//         status: 1,
//         cellData: {
//             '0': {
//                 '0': {
//                     m: '',
//                     v: '',
//                 },
//             },
//         },
//     },
// };




const ipAddress = '47.100.177.253:8500'
const config = {"type":"sheet","template":"DEMO1"}

insertButton()
insertUpdateButton()

function insertInputBox(id) {
    // 创建一个输入框元素
    const box = document.createElement('input');
    box.type = 'text';

    document.body.appendChild(box);

    box.style.position = 'fixed';
    box.style.right = '0';
    box.style.top = '70px';
    box.addEventListener('blur',(e)=>{
        const txt = e.target.value;
        const message = {
            "type": "data",
            "data": txt
        }
        sendMessage(message)
    })

    const url = `${'ws://'+ipAddress+'/ws/'}${id}`;
    const socket = new WebSocket(url);

    // 连接建立时触发的事件
    socket.onopen = function(event) {
    console.log("WebSocket connected");
    };

    // 接收到消息时触发的事件
    socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log("Received message:", message);
    };

    // 连接关闭时触发的事件
    socket.onclose = function(event) {
    console.log("WebSocket closed:", event);
    };

    // 发送消息
    function sendMessage(message) {
    socket.send(JSON.stringify(message));
    }
}
// openDocs()
function insertUpdateButton() {
    // 创建一个输入框元素
    const input = document.createElement('input');
    input.type = 'text';

    document.body.appendChild(input);

    input.style.position = 'fixed';
    input.style.right = '0';
    input.style.top = '30px';

    // 创建一个按钮元素
    const button = document.createElement('button');
    button.textContent = '确定';

    document.body.appendChild(button);

    button.style.position = 'fixed';
    button.style.right = '0';
    button.style.top = '50px';


    // 添加按钮点击事件处理程序
    button.addEventListener('click', function() {
        // 获取输入框的值
        const inputValue = input.value;
        openDocs(inputValue,(json)=>{
            const universheetconfig = json.config;
            const id = json.id;

            const downUISheetsConfig = {
                container: 'universheet-demo',
            }
            const univerSheet = univerSheetCustom({
                univerConfig:{
                    id
                },
                coreConfig:JSON.parse(universheetconfig),
                uiSheetsConfig:downUISheetsConfig,
                collaborationConfig:{
                    url: `${'ws://'+ipAddress+'/ws/'}${id}`
                }
            });

            // const ids = univerSheet.getWorkBook().getContext().getUniver().getGlobalContext().getUniverId();
            // console.info('ids===',ids)


            // insertInputBox(id)
        })

        // insertInputBox(inputValue)
    });
}

function insertButton() {
    // 创建一个按钮元素
    const button = document.createElement('button');
    // 设置按钮文本
    button.textContent = 'New Docs';
    // 将按钮添加到body元素中
    document.body.appendChild(button);

    button.style.position = 'fixed';
    button.style.right = '0';
    button.style.top = '0';


    // 添加按钮点击事件处理程序
    button.addEventListener('click', function() {
        newDocs('http://'+ipAddress+'/new',config,(json)=>{
            const id = json.id;
            const config = json.config;

            
            if(config === 'default'){
                const universheet = univerSheetCustom({
                    uiSheetsConfig,
                    coreConfig:defaultWorkbookData
                });

                const universheetconfig = universheet.getWorkBook().getConfig()

            updateDocs(id,universheetconfig)
            }
            
        })
    });


    
}
function newDocs(url:string, params:object, cb?:(json:object)=>void) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then(document => {
        // 处理获取到的文档信息
        console.log(document);
        cb && cb(document)
      })
      .catch(error => {
        console.error(error);
      }); 

  }


  function openDocs(id,cb?) {
    // 定义请求参数
        const data = new FormData();
        data.append('id', id);

        // 创建 XMLHttpRequest 对象
        const xhr = new XMLHttpRequest();

        // 监听请求完成事件
        xhr.onload = function() {
        if (xhr.status === 200) {
            const document = JSON.parse(xhr.responseText);
            // 处理获取到的文档信息
            console.log(document);
            cb && cb(document)
        } else {
            console.error(xhr.statusText);
        }
        };

        // 发送 POST 请求
        xhr.open('POST', 'http://'+ipAddress+'/open', true);
        xhr.send(data);

  }
  function updateDocs(id,config,cb?) {
    // 定义请求参数
        const data = new FormData();
        data.append('id', id);
        data.append('config', JSON.stringify(config));

        // 创建 XMLHttpRequest 对象
        const xhr = new XMLHttpRequest();

        // 监听请求完成事件
        xhr.onload = function() {
        if (xhr.status === 200) {
            const document = JSON.parse(xhr.responseText);
            // 处理获取到的文档信息
            console.log(document);
            cb && cb(document)
        } else {
            console.error(xhr.statusText);
        }
        };

        // 发送 POST 请求
        xhr.open('POST', 'http://'+ipAddress+'/update', true);
        xhr.send(data);

  }

// const sheetConfigDown = {
//     container: 'universheet-demo-down',
//     layout: {
//         sheetContainerConfig: {
//             infoBar: false,
//             formulaBar: false,
//             toolbar: false,
//             sheetBar: true,
//             countBar: false,
//             rightMenu: false,
//         },
//     },
//     selections: {
//         'sheet-001': [
//             {
//                 selection: {
//                     startRow: 0,
//                     endRow: 0,
//                     startColumn: 0,
//                     endColumn: 0,
//                 },
//                 cell: {
//                     row: 0,
//                     column: 0,
//                 },
//             },
//         ],
//     },
// };

// const defaultWorkbookDataDown = Tools.deepClone(DEFAULT_WORKBOOK_DATA_DOWN);
// defaultWorkbookDataDown.id = 'workbook-02';
// defaultWorkbookDataDown.styles = null;
// defaultWorkbookDataDown.namedRanges = null;
// defaultWorkbookDataDown.sheets = {
//     'sheet-001': {
//         type: 0,
//         id: 'sheet-001',
//         name: 'sheet001',
//         columnCount,
//         status: 1,
//     },
//     'sheet-002': {
//         type: 0,
//         id: 'sheet-002',
//         name: 'sheet002',
//         columnCount: columnCount + 10,
//     },
// };

// univerSheetCustom({
//     coreConfig: defaultWorkbookDataDown,
//     baseSheetsConfig: sheetConfigDown,
// });

// run('universheet-demo')
// run('universheet-demo-down')
// function run(container:string) {
//     const sheetConfig = {
//         container,
//         layout: {
//             innerRight: false,
//             outerLeft: false,
//             toolbarConfig: {
//                 paintFormat: false,
//                 currencyFormat: false,
//                 percentageFormat: false,
//                 numberDecrease: false,
//                 numberIncrease: false,
//                 moreFormats: false,
//             },
//         },
//         selections: {
//             'sheet-01': [
//                 {
//                     selection: {
//                         startRow: 0,
//                         endRow: 0,
//                         startColumn: 3,
//                         endColumn: 3,
//                     },
//                     cell: {
//                         row: 0,
//                         column: 3,
//                     },
//                 },
//             ],
//         },
//     };

//     let columnCount = 8
//     if(window.innerWidth < 1366){
//         columnCount = 5;
//     }
//     const defaultWorkbookData = Tools.deepClone(DEFAULT_WORKBOOK_DATA);
//     defaultWorkbookData.id = Tools.generateRandomId(6);
//     defaultWorkbookData.styles = null;
//     defaultWorkbookData.namedRanges = null;
//     defaultWorkbookData.sheets = {
//         'sheet-01':{
//             type: 0,
//             id: 'sheet-01',
//             name: 'sheet1',
//             columnCount,
//             status:1
//         }
//     };

//     univerSheetCustom({
//         coreConfig:defaultWorkbookData,
//         baseSheetsConfig: sheetConfig,
//     });
// }
