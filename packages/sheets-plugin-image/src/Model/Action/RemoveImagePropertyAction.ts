import { CommonParameter, ISheetActionData, SheetActionBase } from '@univerjs/core';
import { IAddImagePropertyData } from './AddImagePropertyAction';

export interface IRemoveImagePropertyData extends ISheetActionData {
    id: string;
}

export class RemoveImagePropertyAction extends SheetActionBase<IRemoveImagePropertyData, IAddImagePropertyData> {
    static NAME = 'RemoveImagePropertyAction';

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
