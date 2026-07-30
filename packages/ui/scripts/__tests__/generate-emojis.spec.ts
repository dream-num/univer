/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadText } from '../generate-emojis';

describe('downloadText', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('retries a transient network failure', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new TypeError('fetch failed'))
            .mockResolvedValueOnce(new Response('ok'));
        vi.stubGlobal('fetch', fetchMock);

        const result = downloadText('https://example.com/data.json');
        await vi.runAllTimersAsync();

        await expect(result).resolves.toBe('ok');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('retries a retryable HTTP response', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(null, {
                status: 503,
                statusText: 'Service Unavailable',
            }))
            .mockResolvedValueOnce(new Response('ok'));
        vi.stubGlobal('fetch', fetchMock);

        const result = downloadText('https://example.com/data.json');
        await vi.runAllTimersAsync();

        await expect(result).resolves.toBe('ok');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not retry a non-retryable HTTP response', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
            status: 404,
            statusText: 'Not Found',
        }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(downloadText('https://example.com/data.json')).rejects.toThrow(
            'Failed to download https://example.com/data.json: 404 Not Found'
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
