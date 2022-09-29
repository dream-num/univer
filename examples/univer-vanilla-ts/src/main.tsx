// import { UniverSheet } from '@univer/core';
// import {
//     ForceCalculationTypes,
//     IDefaultFormat,
//     IWorkbookData,
//     IWorkbookProperties,
//     RecalculationInterval,
// } from '@univer/core';

// import { StyleUniver } from '@univer/style-universheet';
// import './assets/css/style.less'

// const defaultDefaultFormat: IDefaultFormat = {};
// const defaultWorkbookProperties: IWorkbookProperties = {
//     name: 'universheet', // File name
//     creator: '', // Create user
//     lastmodifiedby: '', // Edit user
//     createdTime: '',
//     modifiedTime: '',
//     company: '梦数科技',
//     appversion: '3.0.0', // Excel version, Is it necessary?
//     Locale: 'zh',
//     timeZone: 'UTC/GMT +8',
//     defaultFormat: defaultDefaultFormat,
//     forceCalculation: ForceCalculationTypes.ON,
//     autoRecalculation: RecalculationInterval.HOUR,
//     maxIterations: 1,
// };
// const defaultWorkbookData: IWorkbookData = {
//     properties: defaultWorkbookProperties,
//     data: [],
//     pluginMetaData: {},
//     userMetaData: {}, // 用户自定义数据
//     spreadsheetUrl: '',
//     spreadsheetKey: '',
// };



// const uiDefaultConfigUp = {
//     containerId: 'universheet-demo-up',
//     layout: 'auto'
// }
// const uiDefaultConfigDown = {
//     containerId: 'universheet-demo-down',
//     layout: {
//         outerLeft: false,

//         outerRight: true,

//         innerLeft: false,

//         innerRight: false,
//     }
// }
// // univerSheetUp.installPlugin(new StyleUniver(uiDefaultConfigUp))
// // univerSheetDown.installPlugin(new StyleUniver(uiDefaultConfigDown))

// const univerSheetUp = new UniverSheet(defaultWorkbookData, {
//     plugins: [
//         new StyleUniver(uiDefaultConfigUp)
//     ]
// });
// const univerSheetDown = new UniverSheet(defaultWorkbookData, {
//     plugins: [
//         new StyleUniver(uiDefaultConfigDown)
//     ]
// });


import { render } from 'preact'
import { App } from './app'

render(<App />, document.getElementById('app')!)