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

import { CommandType, type ICommand } from '@univerjs/core';
import { DocMentionService } from '../../services/doc-mention.service';

export interface IShowMentionInfoPopupOperationParams {
    unitId: string;
    mentionId: string;
}

// FIXME: anti-pattern: use command as an event
export const ShowMentionInfoPopupOperation: ICommand<IShowMentionInfoPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.show-mention-info-popup',
    handler(accessor, params) {
        return false;
    },
};

export const CloseMentionInfoPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'doc.operation.close-mention-info-popup',
    handler(accessor) {
        return false;
    },
};

export interface IShowMentionEditPopupOperationParams {
    startIndex: number;
    unitId: string;
}

export const ShowMentionEditPopupOperation: ICommand<IShowMentionEditPopupOperationParams> = {
    type: CommandType.OPERATION,
    id: 'doc.operation.show-mention-edit-popup',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const docMentionService = accessor.get(DocMentionService);
        docMentionService.startEditing({ unitId: params.unitId, index: params.startIndex });
        return true;
    },
};

export const CloseMentionEditPopupOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'doc.operation.close-mention-edit-popup',
    handler(accessor) {
        const docMentionService = accessor.get(DocMentionService);
        docMentionService.endEditing();
        return true;
    },
};
