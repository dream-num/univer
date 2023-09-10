/**
 * Use createContext to provide global language and skin settings
 */
import { LocaleService, ObserverManager } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { createContext } from 'react';

import { LocaleType } from '../Enum';
import { ComponentManager } from './ComponentManager';
import { ZIndexManager } from './ZIndexManager';

export type AppContextValues = {
    injector: Injector;
    locale: LocaleType;
    localeService: LocaleService;
    componentManager: ComponentManager;
    zIndexManager: ZIndexManager;
    observerManager: ObserverManager;
};

export const AppContext = createContext<Partial<AppContextValues>>({});
