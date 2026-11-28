import type { ILanguagePack } from '@univerjs/core';
import type { WorkbenchLocale } from '../workbench-settings';

export async function loadSheetLocale(locale: WorkbenchLocale): Promise<ILanguagePack> {
    return (await import(`./locales/${locale}.ts`)).default;
}
