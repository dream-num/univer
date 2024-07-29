/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { getCommandSkeleton, getRichTextEditPath, RichTextEditingMutation, TextSelectionManagerService } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { getActionsParams, getEmptyTableRow, getInsertRowBody, getRangeInfoFromRanges, INSERT_COLUMN_POSITION, INSERT_ROW_POSITION } from './table';

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
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRectRanges = textSelectionManagerService.getCurrentRectRanges();
        const activeTextRange = textSelectionManagerService.getActiveTextRange();

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

        const actionParams = getActionsParams(rangeInfo, position, viewModel);

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
                segmentId,
            });
        }

        const insertBody = getInsertRowBody(colCount);

        textX.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
            line: 0,
            segmentId,
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
 * The command to insert table row.
 */
export const DocTableInsertColumnCommand: ICommand<IDocTableInsertColumnCommandParams> = {
    id: DocTableInsertColumnCommandId,
    type: CommandType.COMMAND,

    handler: async (accessor, params: IDocTableInsertColumnCommandParams) => {
        const { position } = params;
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const activeRectRange = textSelectionManagerService.getActiveRectRange();
        const activeTextRange = textSelectionManagerService.getActiveTextRangeWithStyle();

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        return false;
    },
};
