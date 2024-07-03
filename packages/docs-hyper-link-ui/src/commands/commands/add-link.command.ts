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

import { CommandType, CustomRangeType, type ICommand, ICommandService, sequenceExecuteAsync, Tools } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs';
import type { DocHyperLinkType } from '@univerjs/docs-hyper-link';
import { AddDocHyperLinkMutation } from '@univerjs/docs-hyper-link';

export interface IAddDocHyperLinkCommandParams {
    payload: string;
    unitId: string;
}

export const AddDocHyperLinkCommand: ICommand<IAddDocHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.add-hyper-link',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { payload, unitId } = params;
        const commandService = accessor.get(ICommandService);
        const id = Tools.generateRandomId();
        const doMutation = addCustomRangeBySelectionFactory(
            accessor,
            {
                rangeId: id,
                rangeType: CustomRangeType.HYPERLINK,
            }
        );
        if (doMutation) {
            const commentMutation = {
                id: AddDocHyperLinkMutation.id,
                params: {
                    unitId,
                    link: {
                        payload,
                        id,
                    },
                },
            };

            return (await sequenceExecuteAsync([commentMutation, doMutation], commandService)).result;
        }

        return false;
    },
};
