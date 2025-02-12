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
import { CommandType, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ISidebarService } from '@univerjs/ui';
import { DEFINED_NAME_CONTAINER } from '../../views/defined-name/component-name';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarDefinedNameOperation: ICommand = {
    id: 'sidebar.operation.defined-name',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);
        const editorService = accessor.get(IEditorService);
        const localeService = accessor.get(LocaleService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId } = target;
        switch (params.value) {
            case 'open':
                sidebarService.open({
                    id: DEFINED_NAME_CONTAINER,
                    header: { title: localeService.t('definedName.featureTitle') },
                    children: { label: DEFINED_NAME_CONTAINER },
                    onClose: () => {
                    },
                    width: 333,
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
