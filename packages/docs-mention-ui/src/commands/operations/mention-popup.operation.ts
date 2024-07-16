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

import { CommandType, type ICommand } from '@univerjs/core';

export interface IShowMentionInfoPopupOperationParams {
    unitId: string;
    mentionId: string;
}

export const ShowMentionInfoPopupOperation: ICommand<IShowMentionInfoPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'docs.operation.show-mention-info-popup',
    handler(accessor, params) {
        return false;
    },
};

export const CloseMentionInfoPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'docs.operation.close-mention-info-popup',
    handler(accessor) {
        return false;
    },
};

export const ShowMentionEditPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'docs.operation.show-mention-edit-popup',
    handler(accessor, params) {
        return false;
    },
};

export const CloseMentionEditPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'docs.operation.close-mention-edit-popup',
    handler(accessor) {
        return false;
    },
};
