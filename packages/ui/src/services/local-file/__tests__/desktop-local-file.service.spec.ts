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

import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopLocalFileService } from '../desktop-local-file.service';
import { ILocalFileService } from '../local-file.service';

function createService(): ILocalFileService {
    const injector = new Injector();
    injector.add([ILocalFileService, { useClass: DesktopLocalFileService }]);
    return injector.get(ILocalFileService);
}

describe('DesktopLocalFileService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('creates a file input with the requested picker options', async () => {
        const files = [new File(['a'], 'a.csv')];
        interface IInputStub {
            accept: string;
            click: ReturnType<typeof vi.fn>;
            multiple: boolean;
            onchange: (event: { target: { files: File[] } }) => void;
            type: string;
        }
        let input: IInputStub = {
            accept: '',
            click: vi.fn(),
            multiple: false,
            onchange: () => {},
            type: '',
        };
        vi.stubGlobal('document', {
            createElement: () => {
                input = {
                    click: vi.fn(() => input.onchange({ target: { files } })),
                    accept: '',
                    multiple: false,
                    onchange: () => {},
                    type: '',
                };
                return input;
            },
        });
        const service = createService();

        await expect(service.openFile({ accept: '.csv', multiple: true })).resolves.toEqual(files);
        expect(input.type).toBe('file');
        expect(input.accept).toBe('.csv');
        expect(input.multiple).toBe(true);
        expect(input.click).toHaveBeenCalledTimes(1);
    });

    it('creates a download link for exported file data', () => {
        const link = { click: vi.fn(), download: '', href: '' };
        vi.stubGlobal('document', { createElement: () => link });
        vi.stubGlobal('window', { URL: { createObjectURL: () => 'blob:export' } });
        const service = createService();

        service.downloadFile(new Blob(['data']), 'report.csv');

        expect(link.download).toBe('report.csv');
        expect(link.href).toBe('blob:export');
        expect(link.click).toHaveBeenCalledTimes(1);
    });
});
