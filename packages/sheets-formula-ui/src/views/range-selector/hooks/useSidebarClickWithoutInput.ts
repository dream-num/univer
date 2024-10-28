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

import { useDependency } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import { useEffect } from 'react';
/**
 * 点击面板其他区域的时候失去焦点.
 *
 */
export const useSidebarClickWithoutInput = (cb: (event: MouseEvent) => void) => {
    const sidebarService = useDependency(ISidebarService);
    const container = sidebarService.getContainer();

    useEffect(() => {
        if (container) {
            container.addEventListener('mousedown', cb);
            return () => {
                container.removeEventListener('mousedown', cb);
            };
        }
    }, [cb, container]);
};
