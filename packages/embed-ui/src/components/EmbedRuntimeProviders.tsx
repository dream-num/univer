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
import { LocaleService, ThemeService } from '@univerjs/core';
import { clsx, ConfigProvider } from '@univerjs/design';
import { RediProvider, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
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
            <EmbedDesignRuntimeProvider injector={injector} mountContainer={mountContainer} embedId={embedId}>
                {children}
            </EmbedDesignRuntimeProvider>
        </RediProvider>
    );
}

function EmbedDesignRuntimeProvider(props: Pick<IEmbedRuntimeProvidersProps, 'injector' | 'children' | 'mountContainer' | 'embedId'>) {
    const { injector, children, mountContainer, embedId } = props;
    const localeService = useDependency(LocaleService);
    const themeService = useMemo(() => injector.has(ThemeService) ? injector.get(ThemeService) : undefined, [injector]);
    const [locale, setLocale] = useState(localeService.getLocales());
    const [direction, setDirection] = useState(localeService.getDirection());
    const darkMode = useThemeDarkMode(themeService);
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
        const container = resolvedMountContainer;
        if (container) {
            container.setAttribute('dir', direction);
        }
    }, [direction, resolvedMountContainer]);

    useEffect(() => {
        const container = resolvedMountContainer;
        if (!container || !embedId) {
            return;
        }

        const previousOwner = container.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);

        return () => {
            if (previousOwner == null) {
                container.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                return;
            }

            container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousOwner);
        };
    }, [embedId, resolvedMountContainer]);

    return (
        <ConfigProvider locale={locale?.design} direction={direction} mountContainer={resolvedMountContainer}>
            <div
                className={clsx('univer-contents', {
                    'univer-dark': darkMode,
                })}
                data-embed-runtime-provider="true"
            >
                {children}
            </div>
        </ConfigProvider>
    );
}

function useThemeDarkMode(themeService: ThemeService | undefined): boolean {
    return useSyncExternalStore(
        (onStoreChange) => {
            if (!themeService) {
                return () => {};
            }

            const subscription = themeService.darkMode$.subscribe(() => onStoreChange());
            return () => subscription.unsubscribe();
        },
        () => themeService?.darkMode ?? false,
        () => false
    );
}
