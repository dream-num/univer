// import {
//     BaseCutExtension,
//     BaseCutExtensionFactory,
//     handelExcelToJson,
//     handelTableToJson,
//     handlePlainToJson,
//     handleTableColgroup,
//     handleTableRowGroup,
//     ICutData,
// } from '@univerjs/base-ui';
// import { OperationPlugin } from '../../OperationPlugin';

// export class CutExtension extends BaseCutExtension<OperationPlugin> {
//     execute() {
//         let content = this._data.html || this._data.plain;

//         let data;
//         let colInfo;
//         let rowInfo;
//         if (content) {
//             // TODO move to CutOfficeExtension
//             if (content.indexOf('xmlns:x="urn:schemas-microsoft-com:office:excel"') > -1) {
//                 data = handelExcelToJson(content);
//                 colInfo = handleTableColgroup(content);
//                 rowInfo = handleTableRowGroup(content);
//             } else if (content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
//                 data = handelTableToJson(content);
//                 colInfo = handleTableColgroup(content);
//                 rowInfo = handleTableRowGroup(content);
//             } else {
//                 data = handlePlainToJson(content);
//             }
//         }

//         const actionDataList = this._plugin.getUniverCut().CutTo({
//             data,
//             colInfo,
//             rowInfo,
//         });

//         return actionDataList;
//     }
// }

// export class CutExtensionFactory extends BaseCutExtensionFactory<OperationPlugin> {
//     get zIndex(): number {
//         return 1;
//     }

//     create(data: ICutData): BaseCutExtension {
//         return new CutExtension(data, this._plugin);
//     }

//     check(data: ICutData): false | BaseCutExtension {
//         const content = data.html || data.plain;
//         if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
//             return this.create(data);
//         }

//         return false;
//     }
// }
