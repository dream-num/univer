/**
 * Use createContext to provide global language and skin settings
 */
import { ContextBase } from '@univerjs/core';
import { createContext } from 'preact';
import { LocaleType } from '../Enum';
import { ComponentManager } from './ComponentManager';
import { ZIndexManager } from './ZIndexManager';

export type AppContextValues = {
    context: ContextBase;
    locale: LocaleType;
    componentManager: ComponentManager;
    zIndexManager: ZIndexManager;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
