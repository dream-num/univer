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
import { ISidebarService } from '@univerjs/ui';
import { COMPONENT_DOC_HEADER_FOOTER_PANEL } from '../../views/header-footer/panel/component-name';

export interface IUIComponentCommandParams {
    value: string;
}

export const SidebarDocHeaderFooterPanelOperation: ICommand = {
    id: 'sidebar.operation.doc-header-footer-panel',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const sidebarService = accessor.get(ISidebarService);
        const localeService = accessor.get(LocaleService);

        switch (params.value) {
            case 'open':
                sidebarService.open({
                    header: { title: localeService.t('headerFooter.panel') },
                    children: { label: COMPONENT_DOC_HEADER_FOOTER_PANEL },
                    onClose: () => {},
                    width: 400,
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
