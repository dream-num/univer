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

import type { DocumentDataModel, ICommand, ICommandInfo, ISize, JSONXActions, PageOrientType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface IDocPageSetupCommandParams {
    pageSize: ISize;
    pageOrient: PageOrientType;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}

export const DocPageSetupCommand: ICommand<IDocPageSetupCommandParams> = {
    id: 'docs.command.page-setup',
    type: CommandType.COMMAND,
    // eslint-disable-next-line complexity, max-lines-per-function
    handler: (accessor, params) => {
        if (!params) return false;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!docDataModel) return false;
        const { marginLeft, marginRight, marginBottom, marginTop, pageOrient, pageSize } = params;
        const jsonX = JSONX.getInstance();
        const documentStyle = docDataModel.getDocumentStyle();
        const {
            marginBottom: oldMarginBottom,
            marginLeft: oldMarginLeft,
            marginRight: oldMarginRight,
            marginTop: oldMarginTop,
            pageOrient: oldPageOrient,
            pageSize: oldPageSize,
        } = documentStyle;
        const rawActions: JSONXActions = [];

        if (oldMarginBottom === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginBottom'], marginBottom);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginBottom'], oldMarginBottom, marginBottom);
            action && rawActions.push(action);
        }

        if (oldMarginLeft === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginLeft'], marginLeft);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginLeft'], oldMarginLeft, marginLeft);
            action && rawActions.push(action);
        }

        if (oldMarginRight === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginRight'], marginRight);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginRight'], oldMarginRight, marginRight);
            action && rawActions.push(action);
        }

        if (oldMarginTop === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'marginTop'], marginTop);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'marginTop'], oldMarginTop, marginTop);
            action && rawActions.push(action);
        }

        if (oldPageSize === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'pageSize'], pageSize);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'pageSize'], oldPageSize, pageSize);
            action && rawActions.push(action);
        }

        if (oldPageOrient === undefined) {
            const action = jsonX.insertOp(['documentStyle', 'pageOrient'], pageOrient);
            action && rawActions.push(action);
        } else {
            const action = jsonX.replaceOp(['documentStyle', 'pageOrient'], oldPageOrient, pageOrient);
            action && rawActions.push(action);
        }

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId: docDataModel.getUnitId(),
                actions: [],
                textRanges: undefined,
            },
        };

        doMutation.params!.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
