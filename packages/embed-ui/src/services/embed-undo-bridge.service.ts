import type { IUndoRedoItem, IUndoRedoService } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { IUndoRedoService as IUndoRedoServiceToken, Inject } from '@univerjs/core';

export interface EmbedUndoBridgeResult {
    stackUnitId: string;
    routedToHost: boolean;
}

export class EmbedUndoBridgeService {
    constructor(
        @Inject(EmbedFocusOwnerService)
        private readonly _focusOwnerService: EmbedFocusOwnerService,
        @IUndoRedoServiceToken
        private readonly _undoRedoService: IUndoRedoService
    ) {
        // noop
    }

    pushUndoRedoForChild(item: IUndoRedoItem): EmbedUndoBridgeResult {
        const stackUnitId = this.resolveStackUnitId(item.unitID);
        this._undoRedoService.pushUndoRedo({
            ...item,
            unitID: stackUnitId,
        });

        return {
            stackUnitId,
            routedToHost: stackUnitId !== item.unitID,
        };
    }

    resolveStackUnitId(childUnitId: string): string {
        const focusOwner = this._focusOwnerService.getFocusOwner();
        if (!focusOwner || focusOwner.childUnitId !== childUnitId) {
            return childUnitId;
        }

        return focusOwner.hostUnitId;
    }
}
