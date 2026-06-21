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

import type { Injector } from '@univerjs/core';
import type { ReactNode } from 'react';
import { LocaleService } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { RediProvider, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from '../services/embed-interaction-boundary.service';

export interface IEmbedRuntimeProvidersProps {
    injector: Injector;
    children?: ReactNode;
    mountContainer?: HTMLElement | null;
    embedId?: string;
}

export function EmbedRuntimeProviders(props: IEmbedRuntimeProvidersProps) {
    const { injector, children, mountContainer, embedId } = props;

    return (
        <RediProvider value={{ injector }}>
            <EmbedDesignRuntimeProvider mountContainer={mountContainer} embedId={embedId}>
                {children}
            </EmbedDesignRuntimeProvider>
        </RediProvider>
    );
}

function EmbedDesignRuntimeProvider(props: Pick<IEmbedRuntimeProvidersProps, 'children' | 'mountContainer' | 'embedId'>) {
    const { children, mountContainer, embedId } = props;
    const localeService = useDependency(LocaleService);
    const [locale, setLocale] = useState(localeService.getLocales());
    const [direction, setDirection] = useState(localeService.getDirection());
    const ownedPortalContainer = useMemo<HTMLElement | null>(() => {
        if (mountContainer !== undefined || typeof document === 'undefined') {
            return null;
        }

        return document.createElement('div');
    }, [mountContainer]);
    const resolvedMountContainer = mountContainer === undefined ? ownedPortalContainer : mountContainer;

    useEffect(() => {
        if (!ownedPortalContainer) {
            return;
        }

        document.body.appendChild(ownedPortalContainer);
        return () => {
            document.body.removeChild(ownedPortalContainer);
        };
    }, [ownedPortalContainer]);

    useEffect(() => {
        const subscriptions = [
            localeService.localeChanged$.subscribe(() => {
                setLocale(localeService.getLocales());
            }),
            localeService.direction$.subscribe(() => {
                setDirection(localeService.getDirection());
            }),
        ];

        return () => {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, [localeService]);

    useEffect(() => {
        if (resolvedMountContainer) {
            resolvedMountContainer.dir = direction;
        }
    }, [direction, resolvedMountContainer]);

    useEffect(() => {
        if (!resolvedMountContainer || !embedId) {
            return;
        }

        const previousOwner = resolvedMountContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        resolvedMountContainer.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);

        return () => {
            if (previousOwner == null) {
                resolvedMountContainer.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                return;
            }

            resolvedMountContainer.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousOwner);
        };
    }, [embedId, resolvedMountContainer]);

    return (
        <ConfigProvider locale={locale?.design} direction={direction} mountContainer={resolvedMountContainer}>
            {children}
        </ConfigProvider>
    );
}
