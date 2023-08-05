/**
 * Use createContext to provide global language and skin settings
 */
import { LocaleService } from '@univerjs/core';
import { createContext } from 'preact';
import { Injector } from '@wendellhu/redi';

import { LocaleType } from '../Enum';
import { ComponentManager } from './ComponentManager';
import { ZIndexManager } from './ZIndexManager';

export type AppContextValues = {
    injector: Injector;
    locale: LocaleType;
    localeService: LocaleService;
    componentManager: ComponentManager;
    zIndexManager: ZIndexManager;
};

const AppContext = createContext<Partial<AppContextValues>>({});
export { AppContext };
export default AppContext;
