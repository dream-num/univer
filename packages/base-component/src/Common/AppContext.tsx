/**
 * Use createContext to provide global language and skin settings
 */
import { ContextBase, Locale } from '@univerjs/core';
import { createContext } from 'preact';

export type AppContextValues = {
    locale: Locale; // Locale string
    currentLocale: string;
    // skin: string; // skin string
    message: object; // detail Locale message
    coreContext: ContextBase;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
