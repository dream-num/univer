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

import { awaitTime } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkRenderController } from '../render-controllers/render.controller';

describe('SheetsHyperLinkRenderController', () => {
    it('should mark skeleton dirty when link updates', async () => {
        const makeForceDirty = vi.fn();
        const linkUpdate$ = new Subject<void>();

        const controller = new SheetsHyperLinkRenderController({
            mainComponent: { makeForceDirty },
        } as any, { linkUpdate$ } as any);

        linkUpdate$.next();

        // debounced by 16ms
        await awaitTime(30);
        expect(makeForceDirty).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});
