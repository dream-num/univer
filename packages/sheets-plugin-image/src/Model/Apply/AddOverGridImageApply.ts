// import { IImagePluginData } from '../../Symbol';
// import { IAddOverGridImageActionData } from '../Action';

// export function AddOverGridImageApply(property: IAddOverGridImageActionData): string {
//     const injector = property.injector;
//     if (injector == null) {
//         throw new Error('Error injector is null');
//     }
//     const imagePluginData = injector.get(IImagePluginData);
//     imagePluginData.set(property.id, {
//         id: property.id,
//         sheetId: property.sheetId,
//         radius: property.radius,
//         url: property.url,
//         borderType: property.borderType,
//         width: property.width,
//         height: property.height,
//         row: property.row,
//         column: property.column,
//         borderColor: property.borderColor,
//         borderWidth: property.borderWidth,
//     });
//     return property.id;
// }
