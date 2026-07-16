/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DocumentDataModel, DrawingTypeEnum, IAccessor, ICommand, IDisposable, IMutationInfo, ITextRangeParam, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '../../services/doc-drawing.service';
import {
    CommandType,
    getRichTextEditPath,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    TextXActionType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, getContentInsertRange, normalizeTextRange, RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingAdapterService } from '../../services/doc-drawing-adapter.service';

export interface IRemoveDocDrawingCommandParam {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    drawingType: DrawingTypeEnum;
}

export interface IRemoveDocDrawingCommandParams {
    unitId: string;
    drawings: IRemoveDocDrawingCommandParam[];
    textRange?: ITextRangeParam;
}

export const RemoveDocDrawingCommand: ICommand = {
    id: 'doc.command.remove-doc-image',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params?: IRemoveDocDrawingCommandParams) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const drawingAdapterService = accessor.get(IDocDrawingAdapterService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const { unitId, drawings: removeDrawings, textRange } = params;
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel || removeDrawings.length === 0) {
            return false;
        }

        const activeTextRange = docSelectionManagerService.getActiveTextRange();
        const explicitTextRange = !textRange ? null : normalizeTextRange(textRange);
        const contentInsertRange = explicitTextRange ?? getContentInsertRange(accessor, unitId);
        const segmentId = contentInsertRange?.segmentId ?? activeTextRange?.segmentId ?? '';

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const customBlocks = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customBlocks ?? [];
        const removeCustomBlocks = removeDrawings
            .map((drawing) => customBlocks.find((customBlock) => customBlock.blockId === drawing.drawingId))
            .filter((block) => !!block)
            .sort((a, b) => a!.startIndex > b!.startIndex ? 1 : -1);

        if (removeCustomBlocks.length === 0) {
            return false;
        }

        const drawings = documentDataModel.getDrawings() ?? {};
        const removeDrawingParamById = new Map(removeDrawings.map((drawing) => [drawing.drawingId, drawing]));
        const removeDrawingSnapshots = removeCustomBlocks
            .map((block) => drawings[block!.blockId] as IDocDrawing | undefined)
            .filter((drawing): drawing is IDocDrawing => drawing != null);

        const resourceRedoMutations: IMutationInfo[] = [];
        const resourceUndoMutations: IMutationInfo[] = [];
        const resourceMutationGroups: Array<{ redoMutations: IMutationInfo[]; undoMutations: IMutationInfo[] }> = [];

        for (const block of removeCustomBlocks) {
            const { blockId } = block!;
            const drawing = drawings[blockId] as IDocDrawing | undefined;
            if (drawing == null) {
                continue;
            }

            const removeDrawingParam = removeDrawingParamById.get(blockId);
            const mutationInfos = drawingAdapterService.getRemoveDrawingMutationInfos({
                unitId,
                subUnitId: removeDrawingParam?.subUnitId ?? unitId,
                drawing,
                removeDrawings: removeDrawingSnapshots,
            });

            if (mutationInfos.redoMutations.length === 0 && mutationInfos.undoMutations.length === 0) {
                continue;
            }

            resourceRedoMutations.push(...mutationInfos.redoMutations);
            resourceUndoMutations.push(...mutationInfos.undoMutations);
            resourceMutationGroups.push(mutationInfos);
        }

        if (!executeResourceMutationGroups(resourceMutationGroups, commandService)) {
            return false;
        }

        const historyId = `doc-drawing-remove-resource:${unitId}:${removeCustomBlocks.map((block) => block!.blockId).join(',')}`;
        let batchingDisposable: IDisposable | null = null;
        if (resourceRedoMutations.length > 0 || resourceUndoMutations.length > 0) {
            batchingDisposable = undoRedoService.__tempBatchingUndoRedo(unitId);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: resourceRedoMutations,
                undoMutations: resourceUndoMutations,
                id: historyId,
            });
        }

        const memoryCursor = new MemoryCursor();
        const cursorIndex = removeCustomBlocks[0]!.startIndex;
        const textRanges = [{ startOffset: cursorIndex, endOffset: cursorIndex }] as IRichTextEditingMutationParams['textRanges'];
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: { unitId, actions: [], textRanges },
        };
        const rawActions: JSONXActions = [];

        for (const block of removeCustomBlocks) {
            const { startIndex } = block!;
            if (startIndex > memoryCursor.cursor) {
                textX.push({ t: TextXActionType.RETAIN, len: startIndex - memoryCursor.cursor });
            }
            textX.push({ t: TextXActionType.DELETE, len: 1 });
            memoryCursor.moveCursorTo(startIndex + 1);
        }

        rawActions.push(jsonX.editOp(textX.serialize(), getRichTextEditPath(documentDataModel, segmentId))!);

        for (const block of removeCustomBlocks) {
            const { blockId } = block!;
            const drawingIndex = documentDataModel.getDrawingsOrder()!.indexOf(blockId);
            rawActions.push(jsonX.removeOp(['drawings', blockId], drawings[blockId])!);
            rawActions.push(jsonX.removeOp(['drawingsOrder', drawingIndex], blockId)!);
        }

        doMutation.params.actions = rawActions.reduce((acc, cur) => JSONX.compose(acc, cur as JSONXActions), null as JSONXActions);
        const result = commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(doMutation.id, doMutation.params);

        if (!result && batchingDisposable != null) {
            batchingDisposable.dispose();
            undoRedoService.rollback(historyId, unitId);
            return false;
        }

        batchingDisposable?.dispose();
        return Boolean(result);
    },
};

function executeResourceMutationGroups(
    mutationGroups: Array<{ redoMutations: IMutationInfo[]; undoMutations: IMutationInfo[] }>,
    commandService: ICommandService
): boolean {
    const executedUndoGroups: IMutationInfo[][] = [];

    for (const mutationGroup of mutationGroups) {
        if (!executeMutations(mutationGroup.redoMutations, commandService)) {
            executeMutationGroups([...executedUndoGroups].reverse(), commandService);
            return false;
        }
        executedUndoGroups.push(mutationGroup.undoMutations);
    }

    return true;
}

function executeMutationGroups(mutationGroups: IMutationInfo[][], commandService: ICommandService): void {
    mutationGroups.forEach((mutations) => executeMutations(mutations, commandService));
}

function executeMutations(mutations: IMutationInfo[], commandService: ICommandService): boolean {
    for (const mutation of mutations) {
        if (!commandService.syncExecuteCommand(mutation.id, mutation.params)) {
            return false;
        }
    }

    return true;
}
