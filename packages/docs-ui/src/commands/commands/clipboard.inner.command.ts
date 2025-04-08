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

import type {
    DocumentDataModel,
    ICommand,
    ICustomTable,
    IDocumentBody,
    IDocumentData,
    IMutationInfo,
    ITextRange,
    JSONXActions,
    Nullable,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { DocumentViewModel, IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    BuildTextUtils,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    SHEET_EDITOR_UNITS,
    TextX,
    TextXActionType,
    Tools,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCustomDecorationAtPosition, getCustomRangeAtPosition } from '../../basics/paragraph';
import { getCommandSkeleton, getRichTextEditPath } from '../util';
import { getDeleteRowContentActionParams, getDeleteRowsActionsParams, getDeleteTableActionParams } from './table/table';

export function getCustomBlockIdsInSelections(body: IDocumentBody, selections: ITextRange[]): string[] {
    const customBlockIds: string[] = [];
    const { customBlocks = [] } = body;

    for (const selection of selections) {
        const { startOffset, endOffset } = selection;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        for (const customBlock of customBlocks) {
            const { startIndex } = customBlock;

            if (startIndex >= startOffset && startIndex < endOffset) {
                customBlockIds.push(customBlock.blockId);
            }
        }
    }

    return customBlockIds;
}

function hasRangeInTable(ranges: ITextRangeWithStyle[]): boolean {
    return ranges.some((range) => {
        const { startNodePosition } = range;

        return startNodePosition ? startNodePosition?.path.indexOf('cells') > -1 : false;
    });
}

export interface IInnerPasteCommandParams {
    segmentId: string;
    doc: Partial<IDocumentData>;
    textRanges: ITextRangeWithStyle[];
}

const UNITS = SHEET_EDITOR_UNITS;
// Actually, the command is to handle paste event.
export const InnerPasteCommand: ICommand<IInnerPasteCommandParams> = {
    id: 'doc.command.inner-paste',
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: async (accessor, params: IInnerPasteCommandParams) => {
        const { segmentId, textRanges, doc } = params;
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selections = docSelectionManagerService.getTextRanges();
        const rectRanges = docSelectionManagerService.getRectRanges();
        const { body, tableSource, drawings } = doc;
        if (!Array.isArray(selections) || selections.length === 0 || body == null) {
            return false;
        }

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const originBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
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
            },
        };

        const memoryCursor = new MemoryCursor();
        memoryCursor.reset();

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const hasTable = !!body.tables?.length;
        const hasCustomBlock = !!body.customBlocks?.length;

        // TODO: @JOCS A feature that has not yet been implemented,
        // and it is currently not possible to paste tables in the header and footer.
        if (hasTable && segmentId) {
            return false;
        }

        // TODO: @JOCS A feature that has not yet been implemented.
        // Can not paste tables into table cell now.
        if (hasTable && hasRangeInTable(selections)) {
            return false;
        }

        // Can not paste content when doc selection has both text ranges and rect ranges.
        if (selections.length && rectRanges?.length) {
            return false;
        }

        for (let i = 0; i < selections.length; i++) {
            const selection = selections[i];
            const { startOffset, endOffset, collapsed } = selection;

            const len = startOffset - memoryCursor.cursor;

            const cloneBody = Tools.deepClone(body);

            if (hasTable) {
                for (const t of cloneBody.tables!) {
                    const { tableId: oldTableId } = t;
                    const tableId = Tools.generateRandomId(6);

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

                    const drawingId = Tools.generateRandomId(6);

                    block.blockId = drawingId;

                    const drawing = Tools.deepClone(drawings[blockId]);
                    drawing.drawingId = drawingId;

                    const action = jsonX.insertOp(['drawings', drawingId], drawing);
                    const orderAction = jsonX.insertOp(['drawingsOrder', drawingLen], drawingId);

                    rawActions.push(action!);
                    rawActions.push(orderAction!);
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
                const dos = BuildTextUtils.selection.delete([selection], body, memoryCursor.cursor, cloneBody, selections.length === 1);
                textX.push(...dos);
            }

            memoryCursor.reset();
            memoryCursor.moveCursor(endOffset);
        }

        const path = getRichTextEditPath(docDataModel, segmentId);

        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

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
    const originBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions: JSONXActions = [];

    if (originBody == null) {
        return rawActions;
    }

    const { tables = [] } = originBody;

    const memoryCursor = new MemoryCursor();
    memoryCursor.reset();

    for (let i = 0; i < selections.length; i++) {
        const selection = adjustSelectionByTable(selections[i], tables);
        const { startOffset, endOffset, collapsed } = selection;
        const len = startOffset - memoryCursor.cursor;

        if (collapsed) {
            textX.push({
                t: TextXActionType.RETAIN,
                len,
            });
        } else {
            textX.push(...BuildTextUtils.selection.delete([selection], originBody, memoryCursor.cursor, null, false));
        }

        memoryCursor.reset();
        memoryCursor.moveCursor(endOffset);
    }

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

// eslint-disable-next-line max-lines-per-function
function getCutActionsFromRectRanges(
    ranges: IRectRangeWithStyle[],
    docDataModel: DocumentDataModel,
    viewModel: DocumentViewModel,
    segmentId: string
): JSONXActions {
    const rawActions: JSONXActions = [];
    const segmentBody = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

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
    segmentId: string
): JSONXActions {
    let rawActions: JSONXActions = [];

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

export interface IInnerCutCommandParams {
    segmentId: string;
    textRanges: ITextRangeWithStyle[];
    selections?: ITextRange[];
    rectRanges?: IRectRangeWithStyle[];
}

export const CutContentCommand: ICommand<IInnerCutCommandParams> = {
    id: 'doc.command.inner-cut',

    type: CommandType.COMMAND,

    handler: (accessor, params: IInnerCutCommandParams) => {
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { segmentId, textRanges, selections = docSelectionManagerService.getTextRanges(), rectRanges = docSelectionManagerService.getRectRanges() } = params;

        if (
            (!Array.isArray(selections) || selections.length === 0)
            && (!Array.isArray(rectRanges) || rectRanges.length === 0)
        ) {
            return false;
        }

        const unitId = univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
        if (!unitId) {
            return false;
        }

        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        if (docDataModel == null) {
            return false;
        }

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
            },
        };

        doMutation.params.actions = getCutActionsFromDocRanges(selections, rectRanges, docDataModel, viewModel, segmentId);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
