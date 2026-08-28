import type { WorkbenchLocale } from '../workbench-settings';
import { loadDevLocale } from '../dev-locale-loader';

export function loadSlideLocale(locale: WorkbenchLocale) {
    return loadDevLocale('slides', locale);
}
