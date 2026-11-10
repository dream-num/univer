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

import type { KeyboardEvent } from 'react';
import { ConfigContext } from '@univerjs/design';
import { useContext } from 'react';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';

export function useRibbonTabs(ribbon: IMenuSchema[], onSelectTab: (tab: IMenuSchema) => void) {
    const { direction } = useContext(ConfigContext);

    return (event: KeyboardEvent<HTMLDivElement>) => {
        const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const index = tabs.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;

        let next: number;
        switch (event.key) {
            case 'Home': next = 0;
                break;
            case 'End': next = tabs.length - 1;
                break;
            case 'ArrowLeft': next = (index + (direction === 'rtl' ? 1 : -1) + tabs.length) % tabs.length;
                break;
            case 'ArrowRight': next = (index + (direction === 'rtl' ? -1 : 1) + tabs.length) % tabs.length;
                break;
            default: return;
        }
        event.preventDefault();
        event.stopPropagation();
        tabs[next].focus();
        onSelectTab(ribbon[next]);
    };
}
