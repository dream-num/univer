import type { WorkbenchLocale } from '../workbench-settings';

interface ILocaleModule {
    default: Record<string, unknown>;
}

type LocaleLoader = () => Promise<ILocaleModule>;

const DOCUMENT_LOCALE_LOADERS = {
    enUS: () => import('./locales/en-US'),
    frFR: () => import('./locales/fr-FR'),
    zhCN: () => import('./locales/zh-CN'),
    ruRU: () => import('./locales/ru-RU'),
    zhTW: () => import('./locales/zh-TW'),
    zhHK: () => import('./locales/zh-HK'),
    viVN: () => import('./locales/vi-VN'),
    faIR: () => import('./locales/fa-IR'),
    jaJP: () => import('./locales/ja-JP'),
    koKR: () => import('./locales/ko-KR'),
    esES: () => import('./locales/es-ES'),
    caES: () => import('./locales/ca-ES'),
    skSK: () => import('./locales/sk-SK'),
    ptBR: () => import('./locales/pt-BR'),
    deDE: () => import('./locales/de-DE'),
    itIT: () => import('./locales/it-IT'),
    idID: () => import('./locales/id-ID'),
    plPL: () => import('./locales/pl-PL'),
    arSA: () => import('./locales/ar-SA'),
} satisfies Record<WorkbenchLocale, LocaleLoader>;

export async function loadDocumentLocale(locale: WorkbenchLocale) {
    return (await DOCUMENT_LOCALE_LOADERS[locale]()).default;
}
