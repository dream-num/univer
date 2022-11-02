/**
 * Use createContext to provide global language and skin settings
 */
import { SheetContext, Locale } from '@univer/core';
import { createContext } from 'preact';

export type AppContextValues = {
    locale: Locale; // Locale string
    currentLocale: string;
    // skin: string; // skin string
    message: object; // detail Locale message
    coreContext: SheetContext;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
