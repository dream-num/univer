/**
 * Use createContext to provide global language and skin settings
 */
import { LocaleService, LocaleType, ThemeService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { createContext } from 'react';

import { ComponentManager } from './ComponentManager';
import { ZIndexManager } from './ZIndexManager';

export type AppContextValues = {
    injector: Injector;
    locale: LocaleType;
    localeService: LocaleService;
    themeService: ThemeService;
    componentManager: ComponentManager;
    zIndexManager: ZIndexManager;
};
/**
 * @deprecated
 */
export const AppContext = createContext<AppContextValues>({} as unknown as AppContextValues);
