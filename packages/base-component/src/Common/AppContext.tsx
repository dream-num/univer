/**
 * Use createContext to provide global language and skin settings
 */
import { ContextBase } from '@univerjs/core';
import { createContext } from 'preact';

export type AppContextValues = {
    context: ContextBase;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
