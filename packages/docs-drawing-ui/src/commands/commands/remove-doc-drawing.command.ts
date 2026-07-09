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

import type { DocumentDataModel, IAccessor, ICommand, IDisposable, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDeleteDrawingCommandParams } from './interfaces';
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
import { RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingAdapterService } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';

/**
 * The command to remove new sheet image
 */
export const RemoveDocDrawingCommand: ICommand = {
    id: 'doc.command.remove-doc-image',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params?: IDeleteDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const drawingAdapterService = accessor.get(IDocDrawingAdapterService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const documentDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

        if (params == null || documentDataModel == null) {
            return false;
        }

        const docSelectionRenderService = renderManagerService.getRenderById(params.unitId)!.with(DocSelectionRenderService)!;

        const { drawings: removeDrawings } = params;

        const segmentId = docSelectionRenderService.getSegment() ?? '';

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const customBlocks = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customBlocks ?? [];
        const removeCustomBlocks = removeDrawings
            .map((drawing) => customBlocks.find((customBlock) => customBlock.blockId === drawing.drawingId))
            .filter((block) => !!block)
            .sort((a, b) => a!.startIndex > b!.startIndex ? 1 : -1);

        const unitId = removeDrawings[0]?.unitId;
        if (unitId == null || removeCustomBlocks.length === 0) {
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

        memoryCursor.reset();

        const cursorIndex = removeCustomBlocks[0]!.startIndex;
        const textRanges = [
            {
                startOffset: cursorIndex,
                endOffset: cursorIndex,
            },
        ] as ITextRangeWithStyle[];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const rawActions: JSONXActions = [];

        for (const block of removeCustomBlocks) {
            const { startIndex } = block!;

            if (startIndex > memoryCursor.cursor) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startIndex - memoryCursor.cursor,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len: 1,
            });

            memoryCursor.moveCursorTo(startIndex + 1);
        }

        const path = getRichTextEditPath(documentDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        for (const block of removeCustomBlocks) {
            const { blockId } = block!;

            const drawingOrder = documentDataModel.getDrawingsOrder();
            const drawingIndex = drawingOrder!.indexOf(blockId);

            const removeDrawingAction = jsonX.removeOp(['drawings', blockId], drawings[blockId]);
            const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], blockId);

            rawActions.push(removeDrawingAction!);
            rawActions.push(removeDrawingOrderAction!);
        }

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

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
        const result = executeMutations(mutationGroup.redoMutations, commandService);
        if (!result) {
            executeMutationGroups([...executedUndoGroups].reverse(), commandService);
            return false;
        }

        executedUndoGroups.push(mutationGroup.undoMutations);
    }

    return true;
}

function executeMutationGroups(mutationGroups: IMutationInfo[][], commandService: ICommandService): void {
    mutationGroups.forEach((mutations) => {
        executeMutations(mutations, commandService);
    });
}

function executeMutations(mutations: IMutationInfo[], commandService: ICommandService): boolean {
    for (const mutation of mutations) {
        if (!commandService.syncExecuteCommand(mutation.id, mutation.params)) {
            return false;
        }
    }

    return true;
}
