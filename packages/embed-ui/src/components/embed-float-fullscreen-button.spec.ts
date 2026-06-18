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

import type { IEmbedDescriptor } from '@univerjs/embed';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { enterEmbedFullscreen } from './EmbedFloatFullscreenButton';

describe('enterEmbedFullscreen', () => {
    it('enters fullscreen when a resolved descriptor exists', () => {
        const descriptor = createDescriptor();
        const fullscreenService = { enter: vi.fn() };
        const entered = enterEmbedFullscreen({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            embedModelService: {
                getDescriptor: vi.fn(() => descriptor),
            },
            fullscreenService,
        });

        expect(entered).toBe(true);
        expect(fullscreenService.enter).toHaveBeenCalledWith(descriptor);
    });

    it('does not enter fullscreen before the child unit is resolved', () => {
        const fullscreenService = { enter: vi.fn() };
        const entered = enterEmbedFullscreen({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            embedModelService: {
                getDescriptor: vi.fn(() => ({ ...createDescriptor(), childUnitId: undefined })),
            },
            fullscreenService,
        });

        expect(entered).toBe(false);
        expect(fullscreenService.enter).not.toHaveBeenCalled();
    });
});

function createDescriptor(): IEmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        hostAnchorId: 'anchor-1',
        source: {
            kind: 'empty',
            unitType: UniverInstanceType.UNIVER_DOC,
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
    };
}
