import { mergeLocales } from '@univerjs/core';
import type { WorkbenchLocale } from './workbench-settings';

type DevLocaleProduct = 'docs' | 'sheets';
type LocalePack = Record<string, unknown>;

interface IDevLocaleResponse {
    error?: unknown;
    packs?: unknown;
}

function isLocalePack(value: unknown): value is LocalePack {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function loadDevLocale(
    product: DevLocaleProduct,
    locale: WorkbenchLocale,
    fetchLocale: typeof fetch = fetch
) {
    const search = new URLSearchParams({ locale, product });
    const response = await fetchLocale(`/__univer_examples_locale?${search}`, {
        headers: { accept: 'application/json' },
    });
    const payload = await response.json() as IDevLocaleResponse;

    if (!response.ok) {
        const detail = typeof payload.error === 'string' ? ` ${payload.error}` : '';
        throw new Error(`Could not load ${product} locale ${locale}.${detail}`);
    }

    if (!Array.isArray(payload.packs) || !payload.packs.every(isLocalePack)) {
        throw new Error(`Received invalid ${product} locale data for ${locale}.`);
    }

    return mergeLocales(...payload.packs);
}
