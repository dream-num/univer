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

import { useDependency } from '@wendellhu/redi/react-bindings';
import type { ComponentType } from 'react';
import React, { useMemo, useRef } from 'react';
import { filter, map, startWith } from 'rxjs';
import type { Injector } from '@wendellhu/redi';
import { useObservable } from '../../components/hooks/observable';
import { IUIPartsService } from '../../services/parts/parts.service';

export interface IComponentContainerProps {
    components?: Set<ComponentType>;
    fallback?: React.ReactNode;
    sharedProps?: Record<string, unknown>;
}

export function ComponentContainer(props: IComponentContainerProps) {
    const { components, fallback, sharedProps } = props;
    if (!components || components.size === 0) return fallback ?? null;

    return Array.from(components.values()).map((component, index) => {
        return React.createElement(component, { key: `${component.displayName ?? index}`, ...sharedProps });
    });
}

/**
 * Get a set of render functions to render components of a part.
 *
 * @param part The part name.
 * @param injector The injector to get the service. It is optional. However, you should not change this prop in a given
 * component.
 */
export function useComponentsOfPart(part: string, injector?: Injector) {
    const uiPartsService = injector?.get(IUIPartsService) ?? useDependency(IUIPartsService);
    const updateCounterRef = useRef<number>(0);
    const componentPartUpdateCount = useObservable(
        () => uiPartsService.componentRegistered$.pipe(
            filter((key) => key === part),
            map(() => updateCounterRef.current += 1),
            startWith(updateCounterRef.current += 1) // trigger update when subscribe
        ),
        undefined,
        undefined,
        [uiPartsService, part]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => uiPartsService.getComponents(part), [componentPartUpdateCount]);
}
