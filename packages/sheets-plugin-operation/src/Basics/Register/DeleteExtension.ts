// import {
//     BaseDeleteExtension,
//     BaseDeleteExtensionFactory,
//     handelExcelToJson,
//     handelTableToJson,
//     handlePlainToJson,
//     handleTableColgroup,
//     handleTableRowGroup,
//     IDeleteData,
// } from '@univerjs/base-ui';
// import { OperationPlugin } from '../../OperationPlugin';

// export class DeleteExtension extends BaseDeleteExtension<OperationPlugin> {
//     execute() {
//         let content = this._data.html || this._data.plain;

//         let data;
//         let colInfo;
//         let rowInfo;
//         if (content) {
//             // TODO move to DeleteOfficeExtension
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

//         const actionDataList = this._plugin.getUniverDelete().DeleteTo({
//             data,
//             colInfo,
//             rowInfo,
//         });

//         return actionDataList;
//     }
// }

// export class DeleteExtensionFactory extends BaseDeleteExtensionFactory<OperationPlugin> {
//     get zIndex(): number {
//         return 1;
//     }

//     create(data: IDeleteData): BaseDeleteExtension {
//         return new DeleteExtension(data, this._plugin);
//     }

//     check(data: IDeleteData): false | BaseDeleteExtension {
//         const content = data.html || data.plain;
//         if (content && content.indexOf('<table') > -1 && content.indexOf('<td') > -1) {
//             return this.create(data);
//         }

//         return false;
//     }
// }
