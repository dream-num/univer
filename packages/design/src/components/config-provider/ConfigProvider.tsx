import React, { createContext } from 'react';

import { enUS, ILocale } from '../../locale';

export interface IConfigProviderProps {
    children: React.ReactNode;
    locale: ILocale;
    mountContainer: HTMLElement;
}

export const ConfigContext = createContext<Omit<IConfigProviderProps, 'children'>>({
    locale: enUS,
    mountContainer: document.body,
});

export function ConfigProvider(props: IConfigProviderProps) {
    const { children, locale = {}, mountContainer } = props;

    // set default locale to enUS
    let _locale: ILocale;
    if (Object.prototype.hasOwnProperty.call(locale, 'design')) {
        _locale = locale as ILocale;
    } else {
        _locale = enUS;
    }

    return <ConfigContext.Provider value={{ locale: _locale, mountContainer }}>{children}</ConfigContext.Provider>;
}
