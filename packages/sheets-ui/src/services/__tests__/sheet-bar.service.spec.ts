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

import type { IScrollState } from '../../views/sheet-bar/sheet-bar-tabs/utils/slide-tab-bar';
import { describe, expect, it, vi } from 'vitest';
import { SheetBarService } from '../sheet-bar/sheet-bar.service';

describe('SheetBarService', () => {
    it('publishes sheet bar events and manages menu handler lifecycle', () => {
        const service = new SheetBarService();

        const renames: string[] = [];
        const removes: string[] = [];
        const scrolls: IScrollState[] = [];
        const scrollXs: number[] = [];
        const adds: number[] = [];

        service.renameId$.subscribe((v) => renames.push(v));
        service.removeId$.subscribe((v) => removes.push(v));
        service.scroll$.subscribe((v) => scrolls.push(v));
        service.scrollX$.subscribe((v) => scrollXs.push(v));
        service.addSheet$.subscribe((v) => adds.push(v));

        service.setRenameId('s1');
        service.setRemoveId('s2');
        service.setScroll({ leftEnd: false, rightEnd: true });
        service.setScrollX(42);
        service.setAddSheet(3);

        expect(renames).toEqual(['s1']);
        expect(removes).toEqual(['s2']);
        expect(scrolls).toEqual([{ leftEnd: false, rightEnd: true }]);
        expect(scrollXs).toEqual([42]);
        expect(adds).toEqual([3]);

        const handler = { handleSheetBarMenu: vi.fn() };
        const disposable = service.registerSheetBarMenuHandler(handler);
        service.triggerSheetBarMenu();
        expect(handler.handleSheetBarMenu).toHaveBeenCalledTimes(1);

        expect(() => service.registerSheetBarMenuHandler({ handleSheetBarMenu: vi.fn() })).toThrow(
            'There is already a context menu handler!'
        );

        disposable.dispose();
        service.triggerSheetBarMenu();
        expect(handler.handleSheetBarMenu).toHaveBeenCalledTimes(1);
    });
});
