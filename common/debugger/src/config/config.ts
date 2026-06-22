import type { ILanguagePack, LocaleType, UniverInstanceType } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';

export const DEBUGGER_PLUGIN_CONFIG_KEY = 'debugger.config';

export const configSymbol = Symbol(DEBUGGER_PLUGIN_CONFIG_KEY);

export type UniverDebuggerLocaleLoader = (locale: LocaleType) => ILanguagePack | Promise<ILanguagePack>;

export interface IUniverDebuggerConfig {
    menu?: MenuConfig;
    fab?: boolean;
    fabEntryUnitType: UniverInstanceType;
    localeLoader: UniverDebuggerLocaleLoader;
    performanceMonitor?: {
        enabled: boolean;
    };
}

export const defaultPluginConfig: Pick<IUniverDebuggerConfig, 'fab' | 'performanceMonitor'> = {
    fab: true,
    performanceMonitor: {
        enabled: true,
    },
};
