import type { WorkbenchLocale } from '../workbench-settings';
import { loadDevLocale } from '../dev-locale-loader';

export function loadDocumentLocale(locale: WorkbenchLocale) {
    return loadDevLocale('docs', locale);
}
