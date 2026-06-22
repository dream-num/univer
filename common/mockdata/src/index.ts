import type { ILanguagePack, LocaleType } from '@univerjs/core';

export * from './docs';
export * from './sheets';
export * from './slides';

export async function loadDebuggerLocale(locale: LocaleType): Promise<ILanguagePack> {
    switch (locale) {
        case 'arSA':
            return (await import('./locales/ar-SA')).default;
        case 'caES':
            return (await import('./locales/ca-ES')).default;
        case 'deDE':
            return (await import('./locales/de-DE')).default;
        case 'enUS':
            return (await import('./locales/en-US')).default;
        case 'esES':
            return (await import('./locales/es-ES')).default;
        case 'faIR':
            return (await import('./locales/fa-IR')).default;
        case 'frFR':
            return (await import('./locales/fr-FR')).default;
        case 'idID':
            return (await import('./locales/id-ID')).default;
        case 'itIT':
            return (await import('./locales/it-IT')).default;
        case 'jaJP':
            return (await import('./locales/ja-JP')).default;
        case 'koKR':
            return (await import('./locales/ko-KR')).default;
        case 'plPL':
            return (await import('./locales/pl-PL')).default;
        case 'ptBR':
            return (await import('./locales/pt-BR')).default;
        case 'ruRU':
            return (await import('./locales/ru-RU')).default;
        case 'skSK':
            return (await import('./locales/sk-SK')).default;
        case 'viVN':
            return (await import('./locales/vi-VN')).default;
        case 'zhCN':
            return (await import('./locales/zh-CN')).default;
        case 'zhHK':
            return (await import('./locales/zh-HK')).default;
        case 'zhTW':
            return (await import('./locales/zh-TW')).default;
        default:
            return (await import('./locales/en-US')).default;
    }
}
