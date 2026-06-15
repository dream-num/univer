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
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { CanvasPopupService, ICanvasPopupService } from '../canvas-popup.service';

describe('CanvasPopupService', () => {
    let service: ICanvasPopupService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
        service = injector.get(ICanvasPopupService);
    });

    it('tracks canvas popups and active popup ownership', () => {
        const popupId = service.addPopup({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            componentKey: 'cell-comment',
            anchorRect$: new BehaviorSubject({ left: 0, top: 0, right: 10, bottom: 10 }),
            canvasElement: {} as HTMLCanvasElement,
        });

        service.popups[0][1].onActiveChange?.(true);
        expect(service.activePopupId).toBe(popupId);

        service.popups[0][1].onActiveChange?.(false);
        expect(service.activePopupId).toBeNull();
    });

    it('notifies renderers when popup entries are added or removed', () => {
        const sizes: number[] = [];
        service.popups$.subscribe((popups) => sizes.push(popups.length));
        const popupId = service.addPopup({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            componentKey: 'cell-comment',
            anchorRect$: new BehaviorSubject({ left: 0, top: 0, right: 10, bottom: 10 }),
            canvasElement: {} as HTMLCanvasElement,
        });

        service.removePopup(popupId);

        expect(sizes).toEqual([0, 1, 0]);
    });
});
