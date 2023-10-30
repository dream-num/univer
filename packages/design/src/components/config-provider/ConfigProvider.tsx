import React, { createContext } from 'react';

import { enUS, ILocale } from '../../locale';

export interface IConfigProviderProps {
    children: React.ReactNode;
    locale?: ILocale | unknown;
}

export const ConfigContext = createContext<{
    locale: ILocale;
}>({
    locale: enUS,
});

export function ConfigProvider(props: IConfigProviderProps) {
    const { children, locale = {} } = props;

    // set default locale to enUS
    let _locale: ILocale;
    if (Object.prototype.hasOwnProperty.call(locale, 'design')) {
        _locale = locale as ILocale;
    } else {
        _locale = enUS;
    }

    return <ConfigContext.Provider value={{ locale: _locale }}>{children}</ConfigContext.Provider>;
}
