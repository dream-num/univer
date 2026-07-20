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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { ILayoutService } from '../../services/layout/layout.service';

export const ToggleFullscreenOperation: IOperation = {
    id: 'base-ui.operation.toggle-fullscreen',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const root = accessor.get(ILayoutService).rootContainerElement;
        if (!root) return false;

        const document = root.ownerDocument;

        try {
            if (document.fullscreenElement) {
                if (!document.exitFullscreen) return false;
                void document.exitFullscreen().catch(() => {});
            } else {
                if (!root.requestFullscreen) return false;
                void root.requestFullscreen().catch(() => {});
            }

            return true;
        } catch {
            return false;
        }
    },
};
