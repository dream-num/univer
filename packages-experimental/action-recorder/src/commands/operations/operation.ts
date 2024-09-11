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

import { CommandType } from '@univerjs/core';
import type { IOperation } from '@univerjs/core';
import { ActionRecorderService } from '../../services/action-recorder.service';

export const OpenRecordPanelOperation: IOperation = {
    id: 'action-recorder.operation.open-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const s = accessor.get(ActionRecorderService);
        s.togglePanel(true);
        return true;
    },
};

export const CloseRecordPanelOperation: IOperation = {
    id: 'action-recorder.operation.close-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const s = accessor.get(ActionRecorderService);
        s.togglePanel(false);
        return true;
    },
};
