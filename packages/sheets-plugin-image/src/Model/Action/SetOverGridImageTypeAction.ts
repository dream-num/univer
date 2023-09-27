// import { ActionObservers, CommandUnit, ISheetActionData, SheetActionBase } from '@univerjs/core';

// import { ACTION_NAMES, OVER_GRID_IMAGE_PLUGIN_NAME } from '../../Basics';
// import { SetOverGridImageTypeApply } from '../Apply';

// export interface ISetImageTypeData extends ISheetActionData {
//     id: string;
//     type: string;
// }

// export class SetImageTypeAction extends SheetActionBase<ISetImageTypeData, ISetImageTypeData> {
//     static NAME = 'SetImageTypeAction';

//     constructor(actionData: ISetImageTypeData, commandUnit: CommandUnit, observers: ActionObservers) {
//         super(actionData, commandUnit, observers);
//         this._oldActionData = {
//             actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
//             id: actionData.id,
//             sheetId: actionData.sheetId,
//             type: this.do(),
//         };
//     }

//     redo(): void {
//         this.do();
//     }

//     do(): string {
//         const worksheet = this.getWorkSheet();
//         const context = worksheet.getContext();
//         const manager = context.getPluginManager();
//         const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
//         return SetOverGridImageTypeApply(
//             plugin,
//             this._doActionData.sheetId,
//             this._doActionData.id,
//             this._doActionData.type
//         );
//     }

//     undo(): void {
//         const worksheet = this.getWorkSheet();
//         const context = worksheet.getContext();
//         const manager = context.getPluginManager();
//         const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
//         SetOverGridImageTypeApply(
//             plugin,
//             this._oldActionData.sheetId,
//             this._oldActionData.id,
//             this._oldActionData.type
//         );
//     }

//     validate(): boolean {
//         return false;
//     }
// }
