import { describe, expect, it } from 'vitest';

import { resolveLocaleModuleUrl } from '../locale-module-url.mts';

describe('resolveLocaleModuleUrl', () => {
    it('resolves a specifier to an importable file:// URL', async () => {
        const url = resolveLocaleModuleUrl('./__fixtures__/sample-locale.mts');

        // A raw absolute path (e.g. `C:\...` on Windows) is rejected by Node's
        // ESM loader with ERR_UNSUPPORTED_ESM_URL_SCHEME, which surfaced as
        // "Could not load <product> locale <tag>" on every workbench tab.
        // The resolved value must always be a file:// URL so the dynamic
        // import in the dev locale exporter works on every platform.
        expect(() => new URL(url)).not.toThrow();
        expect(url.startsWith('file://')).toBe(true);

        const module = await import(url) as { greeting: string };
        expect(module.greeting).toBe('hello');
    });
});
