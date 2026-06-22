import type { IUniverDebuggerConfig } from '../config/config';
import { IConfigService, LocaleService, LocaleType } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect } from 'react';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from '../config/config';

const localeLabels: Record<LocaleType, string> = {
    [LocaleType.AR_SA]: 'العربية',
    [LocaleType.CA_ES]: 'Català',
    [LocaleType.DE_DE]: 'Deutsch',
    [LocaleType.EN_US]: 'English',
    [LocaleType.ES_ES]: 'Español',
    [LocaleType.FA_IR]: 'فارسی',
    [LocaleType.FR_FR]: 'Français',
    [LocaleType.ID_ID]: 'Bahasa Indonesia',
    [LocaleType.IT_IT]: 'Italiano',
    [LocaleType.JA_JP]: '日本語',
    [LocaleType.KO_KR]: '한국어',
    [LocaleType.PL_PL]: 'Polski',
    [LocaleType.PT_BR]: 'Português (Brasil)',
    [LocaleType.RU_RU]: 'Русский',
    [LocaleType.SK_SK]: 'Slovenčina',
    [LocaleType.VI_VN]: 'Tiếng Việt',
    [LocaleType.ZH_CN]: '简体中文',
    [LocaleType.ZH_HK]: '繁體中文（香港）',
    [LocaleType.ZH_TW]: '繁體中文（台灣）',
};

export function useLocale() {
    const configService = useDependency(IConfigService);
    const localeService = useDependency(LocaleService);
    const configs = configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);
    const localeLoader = configs?.localeLoader;

    const loadLocales = useCallback(async (value: string) => {
        const locale = value as LocaleType;
        if (!localeLoader) {
            throw new Error('[UniverDebuggerPlugin]: localeLoader is required.');
        }
        const localePack = await localeLoader(locale);

        localeService.load({
            [locale]: localePack,
        });
    }, [localeLoader, localeService]);

    useEffect(() => {
        const locale = localStorage.getItem('local.locale');

        if (locale) {
            loadLocales(locale).then(() => {
                localeService.setLocale(locale as LocaleType);
            });
        }
    }, [loadLocales, localeService]);

    const onSelect = async (value: string) => {
        await loadLocales(value);

        localeService.setLocale(value as LocaleType);

        localStorage.setItem('local.locale', value);
    };

    return {
        type: 'subItem' as const,
        children: '🌐 Languages',
        options: Object.values(LocaleType).map((locale) => ({
            type: 'radio' as const,
            value: localeService.getCurrentLocale(),
            options: [{
                label: localeLabels[locale],
                value: locale,
            }],
            onSelect,
        })),
    };
}
