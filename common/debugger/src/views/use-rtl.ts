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

import { useEffect } from 'react';

function applyDirection(value: 'ltr' | 'rtl') {
    document.documentElement.setAttribute('dir', value);
}

export function useRTL() {
    useEffect(() => {
        const dir = localStorage.getItem('local.direction');

        if (dir === 'rtl' || dir === 'ltr') {
            applyDirection(dir);
        }
    }, []);

    const onSelect = () => {
        const current = document.documentElement.getAttribute('dir');
        const nextDirection = current === 'rtl' ? 'ltr' : 'rtl';

        applyDirection(nextDirection);
        localStorage.setItem('local.direction', nextDirection);
    };

    return {
        type: 'item' as const,
        children: '↔️ Toggle RTL',
        onSelect,
    };
}
