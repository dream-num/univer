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

import type { ReactNode } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';
import { createContext, useContext, useMemo } from 'react';
import { isBrowser } from '../../helper/is-browser';

export interface IConfigProviderProps {
    children: ReactNode;
    locale?: any;
    direction?: 'ltr' | 'rtl';
    mountContainer: HTMLElement | null;
    /** Disable tooltip popovers for this provider subtree. */
    disableTooltips?: boolean;
    /** Use touch-first presentation for overlays in this provider subtree. */
    mobile?: boolean;
    /** The workbench can coordinate mobile overlays without coupling design to its renderer. */
    mobileOverlay?: {
        modal: boolean;
        onMount: (element: HTMLElement) => void | (() => void);
    };
}

export const ConfigContext = createContext<Omit<IConfigProviderProps, 'children'>>({
    mountContainer: isBrowser() ? document.body : null,
});

export function ConfigProvider(props: IConfigProviderProps) {
    const { children, locale, mountContainer, direction, disableTooltips, mobile, mobileOverlay } = props;
    const parentConfig = useContext(ConfigContext);
    const resolvedDisableTooltips = disableTooltips ?? parentConfig.disableTooltips;
    const resolvedMobile = mobile ?? parentConfig.mobile;
    const resolvedMobileOverlay = mobileOverlay ?? parentConfig.mobileOverlay;

    const value = useMemo(() => {
        return {
            locale,
            direction,
            mountContainer,
            disableTooltips: resolvedDisableTooltips,
            mobile: resolvedMobile,
            mobileOverlay: resolvedMobileOverlay,
        };
    }, [locale, direction, mountContainer, resolvedDisableTooltips, resolvedMobile, resolvedMobileOverlay]);

    return (
        <ConfigContext.Provider value={value}>
            <DirectionProvider dir={direction ?? 'ltr'}>
                {children}
            </DirectionProvider>
        </ConfigContext.Provider>
    );
}
