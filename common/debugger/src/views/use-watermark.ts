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

import { ISidebarService, useDependency } from '@univerjs/ui';
import { WATERMARK_PANEL, WATERMARK_PANEL_FOOTER } from '../controllers/watermark.menu.controller';

export function useWatermark() {
    const sidebarService = useDependency(ISidebarService);

    const onSelect = () => {
        sidebarService.open({
            header: { title: 'Watermark' },
            children: { label: WATERMARK_PANEL },
            footer: { label: WATERMARK_PANEL_FOOTER },
            onClose: () => { },
            width: 330,
        });
    };

    return {
        type: 'item' as const,
        children: '🌊 Watermark Settings',
        onSelect,
    };
}
