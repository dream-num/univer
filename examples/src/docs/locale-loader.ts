import type { WorkbenchLocale } from '../workbench-settings';

interface ILocaleModule {
    default: Record<string, unknown>;
}

type LocaleLoader = () => Promise<ILocaleModule>;

const DOCUMENT_LOCALE_LOADERS = {
    'en-US': () => import('./locales/en-US'),
    'fr-FR': () => import('./locales/fr-FR'),
    'zh-CN': () => import('./locales/zh-CN'),
    'ru-RU': () => import('./locales/ru-RU'),
    'zh-TW': () => import('./locales/zh-TW'),
    'zh-HK': () => import('./locales/zh-HK'),
    'vi-VN': () => import('./locales/vi-VN'),
    'fa-IR': () => import('./locales/fa-IR'),
    'ja-JP': () => import('./locales/ja-JP'),
    'ko-KR': () => import('./locales/ko-KR'),
    'es-ES': () => import('./locales/es-ES'),
    'ca-ES': () => import('./locales/ca-ES'),
    'sk-SK': () => import('./locales/sk-SK'),
    'pt-BR': () => import('./locales/pt-BR'),
    'de-DE': () => import('./locales/de-DE'),
    'it-IT': () => import('./locales/it-IT'),
    'id-ID': () => import('./locales/id-ID'),
    'pl-PL': () => import('./locales/pl-PL'),
    'ar-SA': () => import('./locales/ar-SA'),
} satisfies Record<WorkbenchLocale, LocaleLoader>;

export async function loadDocumentLocale(locale: WorkbenchLocale) {
    return (await DOCUMENT_LOCALE_LOADERS[locale]()).default;
}
