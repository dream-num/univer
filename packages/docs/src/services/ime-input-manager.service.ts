import { ITextRangeWithStyle } from '@univerjs/engine-render';
import { Nullable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { getRetainAndDeleteFromReplace } from '../basics/retain-delete-params';
import { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';

// Used to record all intermediate states when typing with IME,
// and then output the entire undo and redo operations.
export class IMEInputManagerService implements IDisposable {
    private _previousActiveRange: Nullable<ITextRangeWithStyle> = null;
    private _undoMutationParamsCache: IRichTextEditingMutationParams[] = [];
    private _redoMutationParamsCache: IRichTextEditingMutationParams[] = [];

    clearUndoRedoMutationParamsCache() {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
    }

    setActiveRange(range: Nullable<ITextRangeWithStyle>) {
        this._previousActiveRange = range;
    }

    pushUndoRedoMutationParams(undoParams: IRichTextEditingMutationParams, redoParams: IRichTextEditingMutationParams) {
        this._undoMutationParamsCache.push(undoParams);
        this._redoMutationParamsCache.push(redoParams);
    }

    fetchComposedUndoRedoMutationParams(newText: string) {
        if (this._undoMutationParamsCache.length === 0 || this._previousActiveRange == null) {
            return null;
        }

        const { unitId } = this._undoMutationParamsCache[0];
        const { segmentId, startOffset, collapsed } = this._previousActiveRange;

        const undoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: [],
        };

        const redoMutationParams: IRichTextEditingMutationParams = {
            unitId,
            mutations: [],
        };

        if (collapsed) {
            undoMutationParams.mutations.push({
                t: 'r',
                len: startOffset,
                segmentId,
            });
            redoMutationParams.mutations.push({
                t: 'r',
                len: startOffset,
                segmentId,
            });
        } else {
            if (startOffset > 0) {
                undoMutationParams.mutations.push({
                    t: 'r',
                    len: startOffset,
                    segmentId,
                });
            }

            undoMutationParams.mutations.push(this._undoMutationParamsCache[0].mutations.find((m) => m.t === 'i')!);

            redoMutationParams.mutations.push(...getRetainAndDeleteFromReplace(this._previousActiveRange, segmentId));
        }

        if (newText.length) {
            undoMutationParams.mutations.push({
                t: 'd',
                len: newText.length,
                line: 0,
                segmentId,
            });

            redoMutationParams.mutations.push({
                t: 'i',
                body: {
                    dataStream: newText,
                },
                len: newText.length,
                line: 0,
                segmentId,
            });
        }

        return { redoMutationParams, undoMutationParams, previousActiveRange: this._previousActiveRange };
    }

    dispose(): void {
        this._undoMutationParamsCache = [];
        this._redoMutationParamsCache = [];
        this._previousActiveRange = null;
    }
}
