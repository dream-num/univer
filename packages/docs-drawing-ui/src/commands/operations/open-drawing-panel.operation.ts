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

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType, LocaleService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { ISidebarService } from '@univerjs/ui';
import { COMPONENT_DOC_DRAWING_PANEL } from '../../views/doc-image-panel/component-name';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarDocDrawingOperation: ICommand = {
    id: 'sidebar.operation.doc-image',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);
        const localeService = accessor.get(LocaleService);
        const drawingManagerService = accessor.get(IDrawingManagerService);

        switch (params.value) {
            case 'open':
                sidebarService.open({
                    header: { title: localeService.t('docImage.panel.title') },
                    children: { label: COMPONENT_DOC_DRAWING_PANEL },
                    onClose: () => {
                        drawingManagerService.focusDrawing(null);
                    },
                    width: 360,
                });
                break;
            case 'close':
            default:
                sidebarService.close();
                break;
        }
        return true;
    },
};
