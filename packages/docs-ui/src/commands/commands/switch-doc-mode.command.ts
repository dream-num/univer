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

import type { ICommand, ICommandInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CommandType, DocumentFlavor, ICommandService, IUniverInstanceService, JSONX } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';

export interface ISwitchDocModeCommandParams {
}

export const SwitchDocModeCommand: ICommand<ISwitchDocModeCommandParams> = {
    id: 'doc.command.switch-mode',

    type: CommandType.COMMAND,

    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (docDataModel == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const documentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

        const docRanges = docSelectionManagerService.getDocRanges();

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: docRanges,
            },
        };

        const jsonX = JSONX.getInstance();

        const rawActions: JSONXActions = [];
        let action;

        if (documentFlavor === undefined) {
            action = jsonX.insertOp(['documentStyle', 'documentFlavor'], DocumentFlavor.MODERN);
        } else {
            if (documentFlavor === DocumentFlavor.MODERN) {
                action = jsonX.replaceOp(['documentStyle', 'documentFlavor'], documentFlavor, DocumentFlavor.TRADITIONAL);
            } else {
                action = jsonX.replaceOp(['documentStyle', 'documentFlavor'], documentFlavor, DocumentFlavor.MODERN);
            }
        }

        if (action) {
            rawActions.push(action);
            doMutation.params!.actions = rawActions.reduce((acc, cur) => {
                return JSONX.compose(acc, cur as JSONXActions);
            }, null as JSONXActions);
        } else {
            return false;
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
