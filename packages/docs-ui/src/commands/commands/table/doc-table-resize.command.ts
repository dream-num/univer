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

import type { DocumentDataModel, ICommand, INumberUnit, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface IDocTableResizeColumnCommandParams {
    tableId: string;
    resizeInfo: { columnIndex: number; width: INumberUnit }[];
    unitId?: string;
}

export const DocTableResizeColumnCommand: ICommand<IDocTableResizeColumnCommandParams> = {
    id: 'doc.command.table.resize-column',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) return false;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { tableId, resizeInfo, unitId } = params;
        const documentDataModel = unitId ? univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC) : univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) return false;
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        resizeInfo.forEach((info) => {
            const actions = jsonX.replaceOp(['tableSource', tableId, 'tableColumns', info.columnIndex, 'size', 'width'], documentDataModel.getSnapshot().tableSource?.[tableId]?.tableColumns?.[info.columnIndex]?.size?.width, info.width);
            actions && rawActions.push(actions);
        });

        return commandService.syncExecuteCommand(
            RichTextEditingMutation.id,
            {
                unitId: documentDataModel.getUnitId(),
                actions: rawActions.reduce((acc, cur) => JSONX.compose(acc, cur as JSONXActions), null as JSONXActions),
            } as IRichTextEditingMutationParams
        );
    },
};

export interface IDocTableResizeRowCommandParams {
    tableId: string;
    resizeInfo: { rowIndex: number; height: INumberUnit }[];
    unitId?: string;
}

export const DocTableResizeRowCommand: ICommand<IDocTableResizeRowCommandParams> = {
    id: 'doc.command.table.resize-row',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) return false;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { tableId, resizeInfo, unitId } = params;
        const documentDataModel = unitId ? univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC) : univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) return false;
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        resizeInfo.forEach((info) => {
            const actions = jsonX.replaceOp(['tableSource', tableId, 'tableRows', info.rowIndex, 'trHeight', 'val'], documentDataModel.getSnapshot().tableSource?.[tableId]?.tableRows?.[info.rowIndex]?.trHeight?.val, info.height);
            actions && rawActions.push(...actions);
        });

        return commandService.syncExecuteCommand(
            RichTextEditingMutation.id,
            {
                unitId: documentDataModel.getUnitId(),
                actions: rawActions.reduce((acc, cur) => JSONX.compose(acc, cur as JSONXActions), null as JSONXActions),
                textRanges: null,
            } as IRichTextEditingMutationParams
        );
    },
};
