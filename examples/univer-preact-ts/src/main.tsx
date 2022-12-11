import { DEFAULT_WORKBOOK_DATA, DEFAULT_WORKBOOK_DATA_DOWN } from '@univer/common-plugin-data';
import { IWorkbookConfig, IWorksheetConfig, SheetTypes, Tools } from '@univer/core';
import { univerSheetCustom } from '.';

    const sheetConfig = {
        container:'universheet-demo',
        layout: {
            sheetContainerConfig:{
                infoBar:false,
                formulaBar:false,
                toolBar:false,
                sheetBar:false,
                countBar:false,
                rightMenu:false,
            },
        },
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
    
    let columnCount = 8
    if(window.innerWidth < 1366){
        columnCount = 5;
    }
    const defaultWorkbookData = Tools.deepClone(DEFAULT_WORKBOOK_DATA);
    defaultWorkbookData.id = 'workbook-01';
    defaultWorkbookData.styles = null;
    defaultWorkbookData.namedRanges = null;
    defaultWorkbookData.sheets = {
        'sheet-01':{
            type: 0,
            id: 'sheet-01',
            name: 'sheet1',
            columnCount,
            status:1,
            cellData:{
                '0':{
                    '0':{
                        m:'',
                        v:''
                    }
                }
            }
        }
    };
    
    // univerSheetCustom({
    //     coreConfig:defaultWorkbookData,
    //     baseSheetsConfig: sheetConfig,
    // });

    const sheetConfigDown = {
        container:'universheet-demo-down',
        layout: {
            sheetContainerConfig:{
                infoBar:false,
                formulaBar:false,
                toolBar:false,
                sheetBar:true,
                countBar:false,
                rightMenu:false,
            },
        },
        selections: {
            'sheet-001': [
                {
                    selection: {
                        startRow: 0,
                        endRow: 0,
                        startColumn: 0,
                        endColumn: 0,
                    },
                    cell: {
                        row: 0,
                        column: 0,
                    },
                },
            ],
        },
    };
    
    const defaultWorkbookDataDown = Tools.deepClone(DEFAULT_WORKBOOK_DATA_DOWN);
    defaultWorkbookDataDown.id = 'workbook-02';
    defaultWorkbookDataDown.styles = null;
    defaultWorkbookDataDown.namedRanges = null;
    defaultWorkbookDataDown.sheets = {
        'sheet-001':{
            type: 0,
            id: 'sheet-001',
            name: 'sheet001',
            columnCount,
            status:1
        },
        'sheet-002':{
            type: 0,
            id: 'sheet-002',
            name: 'sheet002',
            columnCount:columnCount+10,
        }
    };
    
    univerSheetCustom({
        coreConfig:defaultWorkbookDataDown,
        baseSheetsConfig: sheetConfigDown,
    });

// run('universheet-demo')
// run('universheet-demo-down')
// function run(container:string) {
//     const sheetConfig = {
//         container,
//         layout: {
//             innerRight: false,
//             outerLeft: false,
//             toolBarConfig: {
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
//     defaultWorkbookData.id = Tools.generateRandomId();
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
