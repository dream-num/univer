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

import type { ILogService, LocaleService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserClipboardService } from '../clipboard-interface.service';
import { supportClipboardAPI } from '../clipboard-utils';

vi.mock('../clipboard-utils', () => ({
    supportClipboardAPI: vi.fn(),
}));

class MockClipboardItem {
    constructor(public readonly items: Record<string, Blob>) {}
}

function createService() {
    const localeService = {
        t: vi.fn((key: string) => key),
    } as unknown as LocaleService;
    const logService = {
        error: vi.fn(),
    } as unknown as ILogService;
    const notificationService = {
        show: vi.fn(),
    };

    const service = new BrowserClipboardService(localeService, logService, notificationService as any);

    return { service, localeService, logService, notificationService };
}

describe('BrowserClipboardService', () => {
    beforeEach(() => {
        vi.mocked(supportClipboardAPI).mockReturnValue(true);
        (globalThis as any).ClipboardItem = MockClipboardItem;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                write: vi.fn().mockResolvedValue(undefined),
                writeText: vi.fn().mockResolvedValue(undefined),
                read: vi.fn().mockResolvedValue([]),
                readText: vi.fn().mockResolvedValue('clipboard-text'),
            },
        });
        (document as any).execCommand = vi.fn(() => true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should expose clipboard support from utility', () => {
        vi.mocked(supportClipboardAPI).mockReturnValue(true);
        const { service } = createService();
        expect(service.supportClipboard).toBe(true);
    });

    it('should write plain text and html with modern clipboard api', async () => {
        const { service } = createService();

        await service.write('plain', '<b>plain</b>');

        expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);
    });

    it('should write text with modern clipboard api', async () => {
        const { service } = createService();

        await service.writeText('hello');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    });

    it('should fallback to legacy copy when clipboard api is unsupported', async () => {
        vi.mocked(supportClipboardAPI).mockReturnValue(false);
        const { service } = createService();

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        await service.writeText('legacy-text');
        await service.write('legacy', '<i>legacy</i>');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('should show notification when write/writeText fails', async () => {
        const { service, logService, notificationService } = createService();
        vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('writeText failed'));
        vi.mocked(navigator.clipboard.write).mockRejectedValueOnce(new Error('write failed'));

        await service.writeText('failed');
        await service.write('failed', '<b>failed</b>');

        expect(logService.error).toHaveBeenCalledTimes(2);
        expect(notificationService.show).toHaveBeenCalledWith({
            type: 'warning',
            title: 'clipboard.authentication.title',
            content: 'clipboard.authentication.content',
        });
    });

    it('should throw for read/readText when clipboard api is unsupported', async () => {
        vi.mocked(supportClipboardAPI).mockReturnValue(false);
        const { service } = createService();

        await expect(service.read()).rejects.toThrow('[BrowserClipboardService] read() is not supported on this platform.');
        await expect(service.readText()).rejects.toThrow('[BrowserClipboardService] read() is not supported on this platform.');
    });

    it('should read clipboard data when supported', async () => {
        const { service } = createService();

        await expect(service.read()).resolves.toEqual([]);
        await expect(service.readText()).resolves.toBe('clipboard-text');
    });

    it('should return fallback values and notify when read/readText fails', async () => {
        const { service, logService, notificationService } = createService();
        vi.mocked(navigator.clipboard.read).mockImplementationOnce(() => {
            throw new Error('read failed');
        });
        vi.mocked(navigator.clipboard.readText).mockRejectedValueOnce(new Error('readText failed'));

        await expect(service.read()).resolves.toEqual([]);
        await expect(service.readText()).resolves.toBe('');
        expect(logService.error).toHaveBeenCalledTimes(2);
        expect(notificationService.show).toHaveBeenCalled();
    });
});
