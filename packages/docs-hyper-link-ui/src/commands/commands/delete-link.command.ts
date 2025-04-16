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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import { deleteCustomRangeFactory } from '@univerjs/docs';

export interface IDeleteDocHyperLinkMutationParams {
    unitId: string;
    linkId: string;
    segmentId?: string;
}

export const DeleteDocHyperLinkCommand: ICommand<IDeleteDocHyperLinkMutationParams> = {
    type: CommandType.COMMAND,
    id: 'docs.command.delete-hyper-link',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, linkId, segmentId } = params;
        const commandService = accessor.get(ICommandService);

        const doMutation = deleteCustomRangeFactory(accessor, { unitId, rangeId: linkId, segmentId });
        if (!doMutation) {
            return false;
        }

        return await commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};
