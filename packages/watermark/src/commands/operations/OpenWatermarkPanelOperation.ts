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

import type { ICommand } from '@univerjs/core';
import { CommandType, LocaleService } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { WATERMARK_PANEL } from '../../common/const';

export const OpenWatermarkPanelOperation: ICommand = {
    type: CommandType.OPERATION,
    id: 'watermark.operation.open-watermark-panel',
    handler(accessor) {
        const sidebarService = accessor.get(ISidebarService);
        const localeService = accessor.get(LocaleService);

        sidebarService.open({
            header: { title: localeService.t('watermark') },
            children: { label: WATERMARK_PANEL },
            onClose: () => { },
            width: 300,
        });

        return true;
    },
};
