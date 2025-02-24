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

import type { ILocale } from '../../locale/interface';
import React, { createContext, useMemo } from 'react';
import { isBrowser } from '../../helper/is-browser';

export interface IConfigProviderProps {
    children: React.ReactNode;
    locale?: ILocale['design'];
    mountContainer: HTMLElement | null;
}

export const ConfigContext = createContext<Omit<IConfigProviderProps, 'children'>>({
    mountContainer: isBrowser() ? document.body : null,
});

export function ConfigProvider(props: IConfigProviderProps) {
    const { children, locale, mountContainer } = props;

    const value = useMemo(() => {
        return {
            locale,
            mountContainer,
        };
    }, [locale, mountContainer]);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}
