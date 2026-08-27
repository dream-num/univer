import { describe, expect, it } from 'vitest';

import { loadDevLocale } from '../dev-locale-loader';

describe('loadDevLocale', () => {
    it('merges every locale pack returned by the development server', async () => {
        const fetchLocale: typeof fetch = async () => new Response(JSON.stringify({
            packs: [
                { sheets: { copy: 'Copy' } },
                { ui: { paste: 'Paste' } },
            ],
        }));

        await expect(loadDevLocale('sheets', 'enUS', fetchLocale)).resolves.toEqual({
            sheets: {
                copy: 'Copy',
            },
            ui: {
                paste: 'Paste',
            },
        });
    });

    it('reports a failed locale endpoint without applying partial data', async () => {
        const fetchLocale: typeof fetch = async () => new Response(
            JSON.stringify({ error: 'Locale module failed to load.' }),
            { status: 500 }
        );

        await expect(loadDevLocale('docs', 'arSA', fetchLocale)).rejects.toThrow(
            'Could not load docs locale ar-SA. Locale module failed to load.'
        );
    });
});
