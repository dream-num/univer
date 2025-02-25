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
import { CommandType, ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../../views/sheet-image-panel/component-name';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarSheetDrawingOperation: ICommand = {
    id: 'sidebar.operation.sheet-image',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);
        const localeService = accessor.get(LocaleService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const drawingManagerService = accessor.get(IDrawingManagerService);
        const commandService = accessor.get(ICommandService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        switch (params.value) {
            case 'open':
                sidebarService.open({
                    header: { title: localeService.t('sheetImage.panel.title') },
                    children: { label: COMPONENT_SHEET_DRAWING_PANEL },
                    onClose: () => {
                        commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
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
