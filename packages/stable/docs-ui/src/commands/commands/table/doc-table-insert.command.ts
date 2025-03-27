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

import type { DocumentDataModel, ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCommandSkeleton, getRichTextEditPath } from '../../util';
import { getColumnWidths, getEmptyTableCell, getEmptyTableRow, getInsertColumnActionsParams, getInsertColumnBody, getInsertRowActionsParams, getInsertRowBody, getRangeInfoFromRanges, getTableColumn, INSERT_COLUMN_POSITION, INSERT_ROW_POSITION } from './table';

// Insert rows and columns are in this file.

export const DocTableInsertRowCommandId = 'doc.command.table-insert-row';

export const DocTableInsertColumnCommandId = 'doc.command.table-insert-column';

export const DocTableInsertRowAboveCommandId = 'doc.command.table-insert-row-above';

export const DocTableInsertRowBellowCommandId = 'doc.command.table-insert-row-bellow';

export const DocTableInsertColumnLeftCommandId = 'doc.command.table-insert-column-left';

export const DocTableInsertColumnRightCommandId = 'doc.command.table-insert-column-right';

export interface IDocTableInsertRowAboveCommandParams {}

export const DocTableInsertRowAboveCommand: ICommand<IDocTableInsertRowAboveCommandParams> = {
    id: DocTableInsertRowAboveCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(DocTableInsertRowCommandId, { position: INSERT_ROW_POSITION.ABOVE });
    },
};

export interface IDocTableInsertRowBellowCommandParams {}

export const DocTableInsertRowBellowCommand: ICommand<IDocTableInsertRowBellowCommandParams> = {
    id: DocTableInsertRowBellowCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(DocTableInsertRowCommandId, { position: INSERT_ROW_POSITION.BELLOW });
    },
};

export interface IDocTableInsertColumnLeftCommandParams {}

export const DocTableInsertColumnLeftCommand: ICommand<IDocTableInsertColumnLeftCommandParams> = {
    id: DocTableInsertColumnLeftCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(DocTableInsertColumnCommandId, { position: INSERT_COLUMN_POSITION.LEFT });
    },
};

export interface IDocTableInsertColumnRightCommandParams {}

export const DocTableInsertColumnRightCommand: ICommand<IDocTableInsertColumnRightCommandParams> = {
    id: DocTableInsertColumnRightCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(DocTableInsertColumnCommandId, { position: INSERT_COLUMN_POSITION.RIGHT });
    },
};

export interface IDocTableInsertRowCommandParams {
    position: INSERT_ROW_POSITION;
}
/**
 * The command to insert table row.
 */
export const DocTableInsertRowCommand: ICommand<IDocTableInsertRowCommandParams> = {
    id: DocTableInsertRowCommandId,
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: IDocTableInsertRowCommandParams) => {
        const { position } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRectRanges = docSelectionManagerService.getRectRanges();
        const activeTextRange = docSelectionManagerService.getActiveTextRange();

        const rangeInfo = getRangeInfoFromRanges(activeTextRange, activeRectRanges);

        if (rangeInfo == null) {
            return false;
        }

        const { segmentId } = rangeInfo;

        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();

        if (docDataModel == null || body == null) {
            return false;
        }
        const docSkeletonManagerService = getCommandSkeleton(accessor, docDataModel.getUnitId());

        if (docSkeletonManagerService == null) {
            return false;
        }

        const viewModel = docSkeletonManagerService.getViewModel();
        const unitId = docDataModel?.getUnitId();
        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const actionParams = getInsertRowActionsParams(rangeInfo, position, viewModel);

        if (actionParams == null) {
            return false;
        }

        const { offset, colCount, tableId, insertRowIndex } = actionParams;

        const rawActions: JSONXActions = [];

        const cursor = offset + 2;

        const textRanges: ITextRangeWithStyle[] = [{
            startOffset: cursor,
            endOffset: cursor,
            collapsed: true,
        }];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        if (offset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: offset,
            });
        }

        const insertBody = getInsertRowBody(colCount);

        textX.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: Insert table row;
        const insertRow = getEmptyTableRow(colCount);
        const insertTableSource = jsonX.insertOp(['tableSource', tableId, 'tableRows', insertRowIndex], insertRow);
        rawActions.push(insertTableSource!);

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

export interface IDocTableInsertColumnCommandParams {
    position: INSERT_COLUMN_POSITION;
}
/**
 * The command to insert table column.
 */
export const DocTableInsertColumnCommand: ICommand<IDocTableInsertColumnCommandParams> = {
    id: DocTableInsertColumnCommandId,
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: IDocTableInsertColumnCommandParams) => {
        const { position } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRectRanges = docSelectionManagerService.getRectRanges();
        const activeTextRange = docSelectionManagerService.getActiveTextRange();

        const rangeInfo = getRangeInfoFromRanges(activeTextRange, activeRectRanges);

        if (rangeInfo == null) {
            return false;
        }

        const { segmentId } = rangeInfo;

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();

        if (docDataModel == null || body == null) {
            return false;
        }
        const docSkeletonManagerService = getCommandSkeleton(accessor, docDataModel.getUnitId());

        if (docSkeletonManagerService == null) {
            return false;
        }

        const viewModel = docSkeletonManagerService.getViewModel();
        const unitId = docDataModel?.getUnitId();
        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const actionParams = getInsertColumnActionsParams(rangeInfo, position, viewModel);

        if (actionParams == null) {
            return false;
        }

        const { offsets, columnIndex, tableId, rowCount } = actionParams;

        const rawActions: JSONXActions = [];

        const cursor = offsets[0] + 1;

        const textRanges: ITextRangeWithStyle[] = [{
            startOffset: cursor,
            endOffset: cursor,
            collapsed: true,
        }];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        for (const offset of offsets) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: offset,
            });

            const insertBody = getInsertColumnBody();

            textX.push({
                t: TextXActionType.INSERT,
                body: insertBody,
                len: insertBody.dataStream.length,
            });
        }

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: Insert table cell;
        for (let i = 0; i < rowCount; i++) {
            const insertCell = getEmptyTableCell();
            const insertTableSource = jsonX.insertOp(['tableSource', tableId, 'tableRows', i, 'tableCells', columnIndex], insertCell);
            rawActions.push(insertTableSource!);
        }

        const snapshot = docDataModel.getSnapshot();

        const documentStyle = snapshot.documentStyle;

        const { marginLeft = 0, marginRight = 0 } = documentStyle;

        const pageWidth = (documentStyle.pageSize?.width ?? 800) - marginLeft - marginRight;

        // eslint-disable-next-line ts/no-non-null-asserted-optional-chain
        const tableColumns = snapshot?.tableSource?.[tableId].tableColumns!;

        const { newColWidth, widths } = getColumnWidths(pageWidth, tableColumns, columnIndex);

        // Update pre columns width.
        for (let i = 0; i < widths.length; i++) {
            const action = jsonX.replaceOp(['tableSource', tableId, 'tableColumns', i, 'size', 'width', 'v'], tableColumns[i].size.width.v, widths[i]);
            rawActions.push(action!);
        }

        const insertCol = getTableColumn(newColWidth);
        const insertTableColumn = jsonX.insertOp(['tableSource', tableId, 'tableColumns', columnIndex], insertCol);
        rawActions.push(insertTableColumn!);

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
