// import { IDocumentData, Tools } from '@univerjs/core';
// import { ptToPx, pxToPt } from './Tools';

const whiteListKeyForPt = new Set(['', '']);

function isNotEmpty(value: unknown) {
    if (value === null && value === undefined) {
        return false;
    }
    return true;
}

// export function convertPtToPxBatch(value: IDocumentData, key?: string, parent?: any) {
//     if (Tools.isObject(value) || Tools.isArray(value)) {
//         for (let subKey of Object.keys(value)) {
//             convertPtToPxBatch(value[subKey], subKey, value);
//         }
//     } else if (key && whiteListKeyForPt.has(key) && isNotEmpty(value)) {
//         parent[key] = ptToPx(value);
//     }
// }

// export function convertPxToPtBatch(value: IDocumentData, key?: string, parent?: any) {
//     if (Tools.isObject(value) || Tools.isArray(value)) {
//         for (let subKey of Object.keys(value)) {
//             convertPtToPxBatch(value[subKey], subKey, value);
//         }
//     } else if (key && whiteListKeyForPt.has(key) && isNotEmpty(value)) {
//         parent[key] = pxToPt(value);
//     }
// }
