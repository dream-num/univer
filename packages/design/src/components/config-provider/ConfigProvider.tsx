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
    /** Default field density. Explicit component sizes take precedence. */
    density?: 'default' | 'touch';
    mountContainer: HTMLElement | null;
    mobileKeyboardViewport?: IMobileKeyboardViewport | null;
}

export interface IMobileKeyboardViewport {
    top: number;
    bottom: number;
    height: number;
    stableHeight: number;
}

export const ConfigContext = createContext<Omit<IConfigProviderProps, 'children'>>({
    mountContainer: isBrowser() ? document.body : null,
});

export function ConfigProvider(props: IConfigProviderProps) {
    const parentConfig = useContext(ConfigContext);
    const { children, locale, mountContainer, direction, mobileKeyboardViewport, density = parentConfig.density } = props;

    const value = useMemo(() => {
        return {
            locale,
            direction,
            mountContainer,
            mobileKeyboardViewport,
            density,
        };
    }, [locale, direction, mobileKeyboardViewport, mountContainer, density]);

    return (
        <ConfigContext.Provider value={value}>
            <DirectionProvider dir={direction ?? 'ltr'}>
                {children}
            </DirectionProvider>
        </ConfigContext.Provider>
    );
}
