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

// @vitest-environment happy-dom

import { IConfigService, IImageIoService, LocaleService, ThemeService, Univer, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createOlePreviewViewer } from '../ole-preview-viewer';

describe('isolated OLE preview dependencies', () => {
    it('keeps standalone image IO when collaboration overrides disable it in the source instance', async () => {
        const host = new Univer();
        const injector = host.__getInjector();
        const config = injector.get(IConfigService);
        const override = [[IImageIoService, null]] as const;
        config.setConfig('drawing.config', { override });
        const stop = new Error('dependency check complete');
        let imageIO: IImageIoService | undefined;
        try {
            expect(() => createOlePreviewViewer({
                container: document.createElement('div'),
                data: {},
                type: UniverInstanceType.UNIVER_SLIDE,
                locale: injector.get(LocaleService),
                theme: injector.get(ThemeService),
                config,
                register: (viewer) => {
                    imageIO = viewer.__getInjector().get(IImageIoService);
                    throw stop;
                },
                setReadonly: () => {},
            })).toThrow(stop);
            expect(await imageIO!.getImage('data:image/png;base64,preview')).toBe('data:image/png;base64,preview');
            expect(config.getConfig('drawing.config')).toEqual({ override });
        } finally {
            host.dispose();
        }
    });
});
