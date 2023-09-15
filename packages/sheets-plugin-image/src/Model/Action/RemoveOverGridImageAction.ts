import { ActionObservers, CommandUnit, CommonParameter, ISheetActionData, SheetActionBase } from '@univerjs/core';

import { OverGridImageBorderType } from '../../Basics';
import { IAddOverGridImageActionData } from './AddOverGridImageAction';

export interface IRemoveOverGridImageActionData extends ISheetActionData {
    id: string;
}

export class RemoveOverGridImageAction extends SheetActionBase<IRemoveOverGridImageActionData, IAddOverGridImageActionData> {
    static NAME = 'RemoveOverGridImageAction';

    constructor(actionData: IRemoveOverGridImageActionData, commandUnit: CommandUnit, observers: ActionObservers) {
        super(actionData, commandUnit, observers);
        this._oldActionData = {
            id: '',
            actionName: '',
            sheetId: '',
            radius: 0,
            url: '',
            borderType: OverGridImageBorderType.SOLID,
            width: 0,
            height: 0,
            row: 0,
            column: 0,
            borderColor: '',
            borderWidth: 0,
        };
    }

    override redo(commonParameter?: CommonParameter | undefined): void {
        throw new Error('Method not implemented.');
    }

    override undo(commonParameter?: CommonParameter | undefined): void {
        throw new Error('Method not implemented.');
    }

    override do(commonParameter?: CommonParameter | undefined): void {
        throw new Error('Method not implemented.');
    }

    override validate(): boolean {
        throw new Error('Method not implemented.');
    }
}
