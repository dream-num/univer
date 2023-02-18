/**
 * Use createContext to provide global language and skin settings
 */
import { ContextBase } from '@univerjs/core';
import { createContext } from 'preact';
import { LocaleType } from '../Enum';

export type AppContextValues = {
    context: ContextBase;
    locale: LocaleType;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
