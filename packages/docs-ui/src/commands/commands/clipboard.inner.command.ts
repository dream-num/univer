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

import type { DocumentDataModel, IAccessor, ICommand, ICustomTable, IDisposable, IDocumentBody, IDocumentData, IDrawingParam, IMutationInfo, ITextRange, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { DocumentViewModel, IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocClipboardPasteBlockRangeMapping, IDocClipboardPasteCustomBlockMapping, IDocClipboardPasteCustomRangeMapping } from '../../services/clipboard/doc-paste-mutation-adapter.service';
import {
    BuildTextUtils,
    CommandType,
    createParagraphId,
    DataStreamTreeTokenType,
    generateRandomId,
    getCustomBlockIdsInSelections,
    getRichTextEditPath,
    getTableRangeInterval,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    SHEET_EDITOR_UNITS,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCustomDecorationAtPosition, getCustomRangeAtPosition } from '../../basics/paragraph';
import {
    IDocClipboardPasteAdapterService,
} from '../../services/clipboard/doc-paste-mutation-adapter.service';
import { getCommandSkeleton } from '../util';
import { getDeleteRowContentActionParams, getDeleteRowsActionsParams, getDeleteTableActionParams } from './table/table';

function hasRangeInTable(ranges: readonly ITextRangeWithStyle[]): boolean {
    return ranges.some((range) => {
        const { startNodePosition } = range;

        return startNodePosition ? startNodePosition?.path.indexOf('cells') > -1 : false;
    });
}

export interface IInnerPasteCommandParams {
    segmentId: string;
    doc: Partial<IDocumentData>;
    textRanges: ITextRangeWithStyle[];
    customRangeMappings?: IDocClipboardPasteCustomRangeMapping[];
}

const UNITS = SHEET_EDITOR_UNITS;
// Actually, the command is to handle paste event.
export const InnerPasteCommand: ICommand<IInnerPasteCommandParams> = {
    id: 'doc.command.inner-paste',
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: async (accessor, params: IInnerPasteCommandParams) => {
        const {
            customRangeMappings = [],
            segmentId,
            textRanges,
            doc,
        } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const pasteAdapterService = getPasteAdapterService(accessor);
        const selections = docSelectionManagerService.getTextRanges() ?? [];
        const rectRanges = docSelectionManagerService.getRectRanges() ?? [];
        const selectionInfo = docSelectionManagerService.getSelectionInfo();
        const { body, tableSource, drawings } = doc;
        if ((selections.length === 0 && rectRanges.length === 0) || body == null) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (docDataModel == null || originBody == null) {
            return false;
        }
        const unitId = docDataModel.getUnitId();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                segmentId,
                trigger: InnerPasteCommand.id,
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];
        const resourceRedoMutations: IMutationInfo[] = [];
        const resourceUndoMutations: IMutationInfo[] = [];
        const resourceMutationGroups: Array<{ redoMutations: IMutationInfo[]; undoMutations: IMutationInfo[] }> = [];

        const hasTable = !!body.tables?.length;
        const hasCustomBlock = !!body.customBlocks?.length;
        const hasBlockRange = !!body.blockRanges?.length;

        // TODO: @JOCS A feature that has not yet been implemented,
        // and it is currently not possible to paste tables in the header and footer.
        if (hasTable && segmentId) {
            return false;
        }

        // TODO: @JOCS A feature that has not yet been implemented.
        // Can not paste tables into table cell now.
        if (hasTable && (hasRangeInTable(selections) || rectRanges.some((range) => !range.spanEntireTable))) {
            return false;
        }

        const replacesComplexSelection = rectRanges.length > 0 || selectionInfo?.options?.wholeDocument === true;
        let selectionCutActions: JSONXActions = [];
        let pasteSelections = selections;
        if (replacesComplexSelection) {
            const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
            if (!docSkeletonManagerService) {
                return false;
            }

            const wholeBodySelected = selectionInfo?.options?.wholeDocument === true || isWholeBodySelected(selections, rectRanges, originBody);
            const insertOffset = wholeBodySelected ? 0 : getDocRangeInsertOffset(selections, rectRanges);
            if (insertOffset == null) {
                return false;
            }

            selectionCutActions = getCutActionsFromDocRanges(
                selections,
                rectRanges,
                docDataModel,
                docSkeletonManagerService.getViewModel(),
                segmentId,
                wholeBodySelected
            );
            pasteSelections = [{
                startOffset: insertOffset,
                endOffset: insertOffset,
                collapsed: true,
                segmentId,
            }];
            doMutation.params.textRanges = [{
                startOffset: insertOffset + body.dataStream.length,
                endOffset: insertOffset + body.dataStream.length,
                collapsed: true,
                segmentId,
                style: selections.find((range) => range.isActive)?.style,
            }];
        }

        for (let i = 0; i < pasteSelections.length; i++) {
            const selection = pasteSelections[i];
            const { startOffset, endOffset, collapsed } = selection;

            const len = startOffset - memoryCursor.cursor;

            const cloneBody = Tools.deepClone(body);
            const blockRangeMappings: IDocClipboardPasteBlockRangeMapping[] = [];
            const customBlockMappings: IDocClipboardPasteCustomBlockMapping[] = [];
            const selectionCustomRangeMappings = customRangeMappings.map(({ sourceRange }) => ({
                sourceRange,
                targetRange: BuildTextUtils.customRange.copyCustomRange(sourceRange),
            }));
            if (selectionCustomRangeMappings.length > 0) {
                cloneBody.customRanges = selectionCustomRangeMappings.map(
                    ({ targetRange }) => targetRange
                );
            }

            if (hasBlockRange) {
                cloneBody.blockRanges!.forEach((targetBlockRange, index) => {
                    const sourceBlockRange = body.blockRanges![index];
                    targetBlockRange.blockId = generateRandomId(6);
                    blockRangeMappings.push({ sourceBlockRange, targetBlockRange });
                });
            }

            if (hasTable) {
                for (const t of cloneBody.tables!) {
                    const { tableId: oldTableId } = t;
                    const tableId = generateRandomId(6);

                    t.tableId = tableId;

                    const table = Tools.deepClone(tableSource![oldTableId]);

                    table.tableId = tableId;

                    const action = jsonX.insertOp(['tableSource', tableId], table);
                    rawActions.push(action!);
                }
            }

            if (hasCustomBlock && drawings) {
                const drawingLen = docDataModel.getSnapshot().drawingsOrder?.length ?? 0;

                for (const block of cloneBody.customBlocks!) {
                    const { blockId } = block;

                    const drawingId = generateRandomId(6);

                    block.blockId = drawingId;

                    const sourceDrawing = drawings[blockId] as IDrawingParam;
                    const drawing = Tools.deepClone(sourceDrawing) as IDrawingParam;
                    drawing.drawingId = drawingId;

                    customBlockMappings.push({
                        sourceBlockId: blockId,
                        targetBlockId: drawingId,
                        sourceDrawing,
                        targetDrawing: drawing,
                    });
                }

                customBlockMappings.forEach(({ targetBlockId, targetDrawing }) => {
                    const action = jsonX.insertOp(['drawings', targetBlockId], targetDrawing);
                    const orderAction = jsonX.insertOp(['drawingsOrder', drawingLen], targetBlockId);

                    rawActions.push(action!);
                    rawActions.push(orderAction!);
                });
            }

            if (
                (
                    blockRangeMappings.length > 0 ||
                    customBlockMappings.length > 0 ||
                    selectionCustomRangeMappings.length > 0
                ) &&
                pasteAdapterService
            ) {
                const mutationInfos = pasteAdapterService.getPasteMutationInfos({
                    unitId,
                    segmentId,
                    doc,
                    sourceBody: body,
                    targetBody: cloneBody,
                    blockRangeMappings,
                    customRangeMappings: selectionCustomRangeMappings,
                    customBlockMappings,
                });

                if (mutationInfos.redoMutations.length > 0 || mutationInfos.undoMutations.length > 0) {
                    resourceRedoMutations.push(...mutationInfos.redoMutations);
                    resourceUndoMutations.push(...mutationInfos.undoMutations);
                    resourceMutationGroups.push(mutationInfos);
                }
            }

            const customRange = getCustomRangeAtPosition(originBody.customRanges ?? [], endOffset, UNITS.includes(unitId));
            const customDecorations = getCustomDecorationAtPosition(originBody.customDecorations ?? [], endOffset);
            if (customRange) {
                cloneBody.customRanges = [{
                    ...customRange,
                    startIndex: 0,
                    endIndex: body.dataStream.length - 1,
                }];
            }
            if (customDecorations.length) {
                cloneBody.customDecorations = customDecorations.map((customDecoration) => ({
                    ...customDecoration,
                    startIndex: 0,
                    endIndex: body.dataStream.length - 1,
                }));
            }
            if (collapsed) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len,
                });
                textX.push({
                    t: TextXActionType.INSERT,
                    body: cloneBody,
                    len: body.dataStream.length,
                });
            } else {
                const dos = BuildTextUtils.selection.delete([selection], body, memoryCursor.cursor, cloneBody, pasteSelections.length === 1);
                textX.push(...dos);
            }

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

        const path = getRichTextEditPath(docDataModel, segmentId);

        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        const pasteActions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);
        doMutation.params.actions = selectionCutActions && selectionCutActions.length > 0
            ? JSONX.compose(selectionCutActions, pasteActions)
            : pasteActions;

        if (!executeResourceMutationGroups(resourceMutationGroups, commandService)) {
            return false;
        }

        const historyId = `doc-paste-resource:${unitId}:${Date.now()}`;
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

function getPasteAdapterService(accessor: IAccessor) {
    try {
        return accessor.get(IDocClipboardPasteAdapterService);
    } catch {
        return null;
    }
}

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

// TODO: WORKAROUND to fix https://github.com/dream-num/univer-pro/issues/2560.
function adjustSelectionByTable(selection: ITextRange, tables: ICustomTable[]): ITextRange {
    const { startOffset, endOffset } = selection;
    const endsWithTable = tables.some((t) => t.startIndex === endOffset);
    const newEndOffset = Math.max(startOffset, endsWithTable ? endOffset - 1 : endOffset);

    return {
        ...selection,
        endOffset: newEndOffset,
        collapsed: startOffset === newEndOffset,
    };
}

function getCutActionsFromTextRanges(
    selections: ITextRange[],
    docDataModel: DocumentDataModel,
    segmentId: string
) {
    const originBody = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions: JSONXActions = [];

    if (originBody == null) {
        return rawActions;
    }

    const { tables = [] } = originBody;
    const adjustedSelections = selections.map((selection) => adjustSelectionByTable(selection, tables));
    textX.push(...BuildTextUtils.selection.delete(adjustedSelections, originBody, 0, null, false));

    const path = getRichTextEditPath(docDataModel, segmentId);
    rawActions.push(jsonX.editOp(textX.serialize(), path)!);

    const removedCustomBlockIds = getCustomBlockIdsInSelections(originBody, selections);
    const drawings = docDataModel.getDrawings() ?? {};
    const drawingOrder = docDataModel.getDrawingsOrder() ?? [];
    const sortedRemovedCustomBlockIds = removedCustomBlockIds.sort((a, b) => {
        if (drawingOrder.indexOf(a) > drawingOrder.indexOf(b)) {
            return -1;
        } else if (drawingOrder.indexOf(a) < drawingOrder.indexOf(b)) {
            return 1;
        }

        return 0;
    });

    if (sortedRemovedCustomBlockIds.length > 0) {
        for (const blockId of sortedRemovedCustomBlockIds) {
            const drawing = drawings[blockId];
            const drawingIndex = drawingOrder.indexOf(blockId);
            if (drawing == null || drawingIndex < 0) {
                continue;
            }

            const removeDrawingAction = jsonX.removeOp(['drawings', blockId], drawing);
            const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], blockId);

            rawActions.push(removeDrawingAction!);
            rawActions.push(removeDrawingOrderAction!);
        }
    }

    return rawActions.reduce((acc, cur) => {
        return JSONX.compose(acc, cur as JSONXActions);
    }, null as JSONXActions);
}

const IMPLICIT_WHOLE_BODY_SELECTION_TOKENS = new Set<string>([
    DataStreamTreeTokenType.PARAGRAPH,
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
]);

function isWholeBodySelected(
    textRanges: Readonly<Nullable<ITextRangeWithStyle[]>>,
    rectRanges: Readonly<Nullable<IRectRangeWithStyle[]>>,
    body: IDocumentBody
): boolean {
    const intervals = (Array.isArray(textRanges) ? textRanges : [])
        .filter((range) => !range.collapsed)
        .map(({ startOffset, endOffset }) => ({ startOffset, endOffset }));

    for (const rectRange of Array.isArray(rectRanges) ? rectRanges : []) {
        if (!rectRange.spanEntireTable) {
            continue;
        }
        const table = (body.tables ?? []).find((item) =>
            (rectRange.tableId && item.tableId === rectRange.tableId) || item.startIndex === rectRange.startOffset
        );
        if (table) {
            intervals.push(getTableRangeInterval(table));
        }
    }

    intervals.sort((left, right) => left.startOffset - right.startOffset || left.endOffset - right.endOffset);
    const editableEnd = Math.max(0, body.dataStream.length - 2);
    let intervalIndex = 0;
    for (let offset = 0; offset < editableEnd; offset++) {
        while (intervals[intervalIndex]?.endOffset <= offset) {
            intervalIndex++;
        }
        const interval = intervals[intervalIndex];
        if (interval && interval.startOffset <= offset && offset < interval.endOffset) {
            continue;
        }
        if (!IMPLICIT_WHOLE_BODY_SELECTION_TOKENS.has(body.dataStream[offset])) {
            return false;
        }
    }

    return editableEnd > 0;
}

function getWholeBodyCutActions(
    selections: readonly ITextRangeWithStyle[],
    docDataModel: DocumentDataModel,
    segmentId: string
): JSONXActions {
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) {
        return [];
    }

    const emptyBody: IDocumentBody = {
        dataStream: DataStreamTreeTokenType.PARAGRAPH,
        paragraphs: [{
            paragraphId: createParagraphId(new Set((body.paragraphs ?? []).map((paragraph) => paragraph.paragraphId))),
            startIndex: 0,
        }],
    };
    const deleteLength = Math.max(0, body.dataStream.length - 1);
    const textX = new TextX();
    textX.push({ t: TextXActionType.INSERT, len: emptyBody.dataStream.length, body: emptyBody });
    textX.push({ t: TextXActionType.DELETE, len: deleteLength });
    const jsonX = JSONX.getInstance();
    const path = getRichTextEditPath(docDataModel, segmentId);
    const rawActions: JSONXActions[] = [];
    const editAction = jsonX.editOp(textX.serialize(), path);
    if (editAction) {
        rawActions.push(editAction);
    }

    const drawings = docDataModel.getDrawings() ?? {};
    const drawingOrder = docDataModel.getDrawingsOrder() ?? [];
    const removedCustomBlockIds = getCustomBlockIdsInSelections(body, [{
        ...(selections[0] ?? { collapsed: false }),
        startOffset: 0,
        endOffset: deleteLength,
        collapsed: false,
    }]).sort((left, right) => drawingOrder.indexOf(right) - drawingOrder.indexOf(left));

    for (const blockId of removedCustomBlockIds) {
        const drawing = drawings[blockId];
        const drawingIndex = drawingOrder.indexOf(blockId);
        if (drawing == null || drawingIndex < 0) {
            continue;
        }
        const removeDrawingAction = jsonX.removeOp(['drawings', blockId], drawing);
        const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], blockId);
        if (removeDrawingAction) {
            rawActions.push(removeDrawingAction);
        }
        if (removeDrawingOrderAction) {
            rawActions.push(removeDrawingOrderAction);
        }
    }

    for (const table of body.tables ?? []) {
        const removeTableSourceAction = jsonX.removeOp(['tableSource', table.tableId]);
        if (removeTableSourceAction) {
            rawActions.push(removeTableSourceAction);
        }
    }

    let actions: JSONXActions | null = null;
    for (const action of rawActions) {
        actions = actions == null ? action : JSONX.compose(actions, action);
    }
    return actions ?? [];
}

// eslint-disable-next-line max-lines-per-function
function getCutActionsFromRectRanges(
    ranges: IRectRangeWithStyle[],
    docDataModel: DocumentDataModel,
    viewModel: DocumentViewModel,
    segmentId: string
): JSONXActions {
    const rawActions: JSONXActions = [];
    const segmentBody = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

    if (segmentBody == null) {
        return rawActions;
    }

    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();

    for (const range of ranges) {
        const { startOffset, endOffset, spanEntireRow, spanEntireTable } = range;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        if (spanEntireTable) {
            // Remove entire table.
            const actionParams = getDeleteTableActionParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offset, len, tableId } = actionParams;
            if (offset - memoryCursor.cursor > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset - memoryCursor.cursor,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len,
            });

            const action = jsonX.removeOp(['tableSource', tableId]);
            rawActions.push(action!);

            memoryCursor.moveCursorTo(offset + len);
        } else if (spanEntireRow) {
            // Remove selected rows.
            const actionParams = getDeleteRowsActionsParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offset, rowIndexes, len, tableId } = actionParams;

            if (offset - memoryCursor.cursor > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset - memoryCursor.cursor,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len,
            });

            // Step 3: delete table rows;
            for (const index of rowIndexes.reverse()) {
                const action = jsonX.removeOp(['tableSource', tableId, 'tableRows', index]);
                rawActions.push(action!);
            }

            memoryCursor.moveCursorTo(offset + len);
        } else {
            // Only delete content in rect range.
            const actionParams = getDeleteRowContentActionParams({ startOffset, endOffset, segmentId }, viewModel);
            if (actionParams == null) {
                continue;
            }

            const { offsets } = actionParams;

            for (const offset of offsets) {
                const { retain, delete: delLen } = offset;
                if (retain - memoryCursor.cursor > 0) {
                    textX.push({
                        t: TextXActionType.RETAIN,
                        len: retain - memoryCursor.cursor,
                    });
                }

                textX.push({
                    t: TextXActionType.DELETE,
                    len: delLen,
                });

                memoryCursor.moveCursorTo(retain + delLen);
            }
        }
    }

    const path = getRichTextEditPath(docDataModel, segmentId);
    rawActions.push(jsonX.editOp(textX.serialize(), path)!);

    return rawActions.reduce((acc, cur) => {
        return JSONX.compose(acc, cur as JSONXActions);
    }, null as JSONXActions);
}

export function getCutActionsFromDocRanges(
    textRanges: Readonly<Nullable<ITextRangeWithStyle[]>>,
    rectRanges: Readonly<Nullable<IRectRangeWithStyle[]>>,
    docDataModel: DocumentDataModel,
    viewModel: DocumentViewModel,
    segmentId: string,
    wholeBodySelected = false
): JSONXActions {
    let rawActions: JSONXActions = [];
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

    if (
        body &&
        Array.isArray(textRanges) &&
        Array.isArray(rectRanges) &&
        (wholeBodySelected || isWholeBodySelected(textRanges, rectRanges, body))
    ) {
        return getWholeBodyCutActions(textRanges, docDataModel, segmentId);
    }

    if (Array.isArray(textRanges) && textRanges?.length !== 0) {
        rawActions = getCutActionsFromTextRanges(textRanges, docDataModel, segmentId);
    }
    if (Array.isArray(rectRanges) && rectRanges?.length !== 0) {
        const actions = getCutActionsFromRectRanges(rectRanges, docDataModel, viewModel, segmentId);
        if (rawActions == null || rawActions.length === 0) {
            rawActions = actions;
        } else {
            rawActions = JSONX.compose(
                rawActions,
                JSONX.transform(actions, rawActions, 'right')!
            ) as JSONXActions;
        }
    }

    return rawActions;
}

export function getReplaceDocRangesActions(
    textRanges: Readonly<Nullable<ITextRangeWithStyle[]>>,
    rectRanges: Readonly<Nullable<IRectRangeWithStyle[]>>,
    docDataModel: DocumentDataModel,
    viewModel: DocumentViewModel,
    segmentId: string,
    insertBody: IDocumentBody,
    wholeBodySelected = false
) {
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    const insertOffset = wholeBodySelected || (body && isWholeBodySelected(textRanges, rectRanges, body))
        ? 0
        : getDocRangeInsertOffset(textRanges, rectRanges);
    if (insertOffset == null) {
        return null;
    }

    const cutActions = getCutActionsFromDocRanges(
        textRanges,
        rectRanges,
        docDataModel,
        viewModel,
        segmentId,
        wholeBodySelected
    );
    const textX = new TextX();
    if (insertOffset > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: insertOffset,
        });
    }
    if (insertBody.dataStream.length > 0) {
        textX.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
        });
    }

    const insertAction = JSONX.getInstance().editOp(
        textX.serialize(),
        getRichTextEditPath(docDataModel, segmentId)
    );
    const actions = insertAction == null
        ? cutActions
        : cutActions == null || cutActions.length === 0
            ? insertAction
            : JSONX.compose(cutActions, insertAction);

    return {
        actions,
        insertOffset,
    };
}

export function getDocRangeInsertOffset(
    textRanges: Readonly<Nullable<ITextRangeWithStyle[]>>,
    rectRanges: Readonly<Nullable<IRectRangeWithStyle[]>>
): Nullable<number> {
    const ranges = [
        ...(Array.isArray(textRanges) ? textRanges : []),
        ...(Array.isArray(rectRanges) ? rectRanges : []),
    ].filter((range) => range.startOffset != null && range.endOffset != null);
    const insertOffset = ranges.reduce(
        (offset, range) => Math.min(offset, range.startOffset),
        Number.POSITIVE_INFINITY
    );

    return Number.isFinite(insertOffset) ? insertOffset : null;
}

export interface IInnerCutCommandParams {
    segmentId: string;
    textRanges: ITextRangeWithStyle[];
    selections?: ITextRange[];
    rectRanges?: IRectRangeWithStyle[];
    wholeBodySelected?: boolean;
}

export const CutContentCommand: ICommand<IInnerCutCommandParams> = {
    id: 'doc.command.inner-cut',

    type: CommandType.COMMAND,

    handler: (accessor, params: IInnerCutCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selectionInfo = docSelectionManagerService.getSelectionInfo();
        const {
            segmentId,
            textRanges,
            selections = docSelectionManagerService.getTextRanges(),
            rectRanges = docSelectionManagerService.getRectRanges(),
            wholeBodySelected = selectionInfo?.options?.wholeDocument === true,
        } = params;

        if (
            (!Array.isArray(selections) || selections.length === 0)
            && (!Array.isArray(rectRanges) || rectRanges.length === 0)
        ) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);

        if (docSkeletonManagerService == null) {
            return false;
        }

        const viewModel = docSkeletonManagerService.getViewModel();

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                trigger: CutContentCommand.id,
            },
        };

        doMutation.params.actions = getCutActionsFromDocRanges(
            selections,
            rectRanges,
            docDataModel,
            viewModel,
            segmentId,
            wholeBodySelected
        );

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
