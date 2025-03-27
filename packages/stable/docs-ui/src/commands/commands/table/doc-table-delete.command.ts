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

import type { ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getCommandSkeleton, getRichTextEditPath } from '../../util';
import { getDeleteColumnsActionParams, getDeleteRowsActionsParams, getDeleteTableActionParams, getRangeInfoFromRanges } from './table';

export interface IDocTableDeleteRowsCommandParams {}

export const DocTableDeleteRowsCommand: ICommand<IDocTableDeleteRowsCommandParams> = {
    id: 'doc.table.delete-rows',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor) => {
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

        const actionParams = getDeleteRowsActionsParams(rangeInfo, viewModel);

        if (actionParams == null) {
            return false;
        }

        const { offset, rowIndexes, len, tableId, cursor, selectWholeTable } = actionParams;

        if (selectWholeTable) {
            // eslint-disable-next-line ts/no-use-before-define
            return commandService.executeCommand(DocTableDeleteTableCommand.id);
        }

        const rawActions: JSONXActions = [];

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

        textX.push({
            t: TextXActionType.DELETE,
            len,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: delete table rows;
        for (const index of rowIndexes.reverse()) {
            const action = jsonX.removeOp(['tableSource', tableId, 'tableRows', index]);
            rawActions.push(action!);
        }

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

export interface IDocTableDeleteColumnsCommandParams {}

export const DocTableDeleteColumnsCommand: ICommand<IDocTableDeleteColumnsCommandParams> = {
    id: 'doc.table.delete-columns',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor) => {
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

        const actionParams = getDeleteColumnsActionParams(rangeInfo, viewModel);

        if (actionParams == null) {
            return false;
        }

        const { offsets, columnIndexes, tableId, cursor, rowCount, selectWholeTable } = actionParams;

        if (selectWholeTable) {
            // eslint-disable-next-line ts/no-use-before-define
            return commandService.executeCommand(DocTableDeleteTableCommand.id);
        }

        const rawActions: JSONXActions = [];

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
            const { retain, delete: deleteLen } = offset;
            if (retain > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: retain,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len: deleteLen,
            });
        }

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: delete table columns;
        columnIndexes.reverse();
        for (let i = 0; i < rowCount; i++) {
            for (const index of columnIndexes) {
                const action = jsonX.removeOp(['tableSource', tableId, 'tableRows', i, 'tableCells', index]);
                rawActions.push(action!);
            }
        }

        for (const index of columnIndexes) {
            const action = jsonX.removeOp(['tableSource', tableId, 'tableColumns', index]);
            rawActions.push(action!);
        }

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

export interface IDocTableDeleteTableCommandParams {}

export const DocTableDeleteTableCommand: ICommand<IDocTableDeleteTableCommandParams> = {
    id: 'doc.table.delete-table',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor) => {
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

        const actionParams = getDeleteTableActionParams(rangeInfo, viewModel);

        if (actionParams == null) {
            return false;
        }

        const { offset, len, tableId, cursor } = actionParams;

        const rawActions: JSONXActions = [];

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

        textX.push({
            t: TextXActionType.DELETE,
            len,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: delete table;

        const action = jsonX.removeOp(['tableSource', tableId]);
        rawActions.push(action!);

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
