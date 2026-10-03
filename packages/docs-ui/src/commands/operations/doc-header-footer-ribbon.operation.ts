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

import type { ICommand } from '@univerjs/core';
import { IRibbonService } from '@univerjs/ui';
import { DOC_HEADER_FOOTER_RIBBON_TAB } from '../../views/header-footer/panel/component-name';
import { SidebarDocHeaderFooterPanelOperation } from './doc-header-footer-panel.operation';

// Preserve the existing command contract while desktop uses the contextual ribbon.
export const DocHeaderFooterRibbonOperation: ICommand<{ value: string }> = {
    id: SidebarDocHeaderFooterPanelOperation.id,
    type: SidebarDocHeaderFooterPanelOperation.type,
    handler(accessor, params) {
        const ribbon = accessor.get(IRibbonService);
        if (params?.value === 'open') {
            ribbon.showContextualTab(DOC_HEADER_FOOTER_RIBBON_TAB, { activate: true });
        } else {
            ribbon.hideContextualTab(DOC_HEADER_FOOTER_RIBBON_TAB);
        }
        return true;
    },
};
