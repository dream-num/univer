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

import type { IAccessor, ICommand, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { ISidebarService } from '@univerjs/ui';
import { TEST_EDITOR_CONTAINER_COMPONENT } from '../../views/test-editor/component-name';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarOperation: ICommand = {
    id: 'debugger.operation.sidebar',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);
        const editorService = accessor.get(IEditorService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const unit = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        switch (params.value) {
            case 'open':
                sidebarService.open({
                    header: { title: 'Sidebar title' },
                    children: { label: TEST_EDITOR_CONTAINER_COMPONENT },
                    footer: { title: 'Sidebar Footer' },
                    onClose: () => {
                    },
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
