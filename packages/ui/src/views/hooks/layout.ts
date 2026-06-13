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

import type { Nullable } from '@univerjs/core';
import { IConfigService } from '@univerjs/core';
import { isBrowser, resizeObserverCtor } from '@univerjs/design';
import { useEffect, useMemo } from 'react';
import { useDependency, useObservable } from '../../utils/di';
import { useEvent } from './event';

/**
 * These hooks are used for browser layout
 * Prefer to client-side
 */

/**
 * Allow the element to scroll when its height over the container height
 * @param element
 * Container means the window view that the element displays in.
 * Recommend pass the sheet mountContainer as container
 * @param container
 */
export function useScrollYOverContainer(element: Nullable<HTMLElement>, container: Nullable<HTMLElement>) {
    const updater = useEvent(() => {
        if (!element || !container) {
            return;
        }

        const elStyle = element.style;
        const elRect = element.getBoundingClientRect();
        const { y, height } = elRect;
        const containerRect = container.getBoundingClientRect();

        const scrolled = element.scrollHeight > height;

        const isOverViewport = y < 0 || (y + height > containerRect.height);

        if (!isOverViewport && !scrolled) {
            elStyle.overflowY = '';
            elStyle.maxHeight = '';
            return;
        }

        if (isOverViewport) {
            elStyle.overflowY = 'auto';
            elStyle.maxHeight = y < 0 ? `${element.scrollHeight + y}px` : `${containerRect.height - y}px`;
        }
    });

    useEffect(() => {
        if (!isBrowser() || !element || !container) return;

        updater();

        const resizeObserver = resizeObserverCtor(updater);
        resizeObserver.observe(element);
        return () => {
            resizeObserver.unobserve(element);
        };
    }, [element, container]);
}

export function useConfigValue<T>(configKey: string) {
    const configService = useDependency(IConfigService);
    return useObservable(
        useMemo(() => configService.subscribeConfigValue$<T>(configKey), [configService]),
        configService.getConfig<T>(configKey)
    );
}
