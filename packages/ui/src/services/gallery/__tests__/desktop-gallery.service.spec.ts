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

import type { IGalleryProps } from '@univerjs/design';
import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopGalleryService } from '../desktop-gallery.service';
import { IGalleryService } from '../gallery.service';

function createService(): IGalleryService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
    return injector.get(IGalleryService);
}

describe('DesktopGalleryService', () => {
    it('publishes gallery open and close state for image preview workflows', () => {
        const service = createService();
        const snapshots: IGalleryProps[] = [];
        const sub = service.gallery$.subscribe((value) => snapshots.push(value));

        service.open({ images: ['a.png', 'b.png'] });
        service.close();

        expect(snapshots).toEqual([
            { open: true, images: ['a.png', 'b.png'] },
            { open: false, images: [] },
        ]);
        sub.unsubscribe();
    });

    it('completes gallery state when the open handle is disposed', () => {
        const service = createService();
        let completed = false;
        service.gallery$.subscribe({ complete: () => completed = true });

        const disposable = service.open({ images: ['a.png'] });
        disposable.dispose();

        expect(completed).toBe(true);
    });

    it('registers the global gallery UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IGalleryService, { useClass: DesktopGalleryService }]);

        injector.get(IGalleryService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
