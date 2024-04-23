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
import type { IAccessor } from '@wendellhu/redi';

export const ToggleAddSheetCommentModalOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheets.operation.toggle-comment-modal',
    handler(accessor, params) {
        return true;
    },
};

export const OpenSheetCommentPanelOperation: ICommand = {
    id: 'sheets.operation.open-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor: IAccessor) {
        return true;
    },
};

export const CloseSheetCommentPanelOperation: ICommand = {
    id: 'sheets.operation.close-comment-panel',
    type: CommandType.OPERATION,
    handler(accessor: IAccessor) {
        return true;
    },
};
