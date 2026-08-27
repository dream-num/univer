import type { WorkbenchLocale } from '../workbench-settings';
import { loadDevLocale } from '../dev-locale-loader';

export function loadSheetLocale(locale: WorkbenchLocale) {
    return loadDevLocale('sheets', locale);
}
