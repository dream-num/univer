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
import { beforeEach, describe, expect, it } from 'vitest';
import { CellEditorManagerService, ICellEditorManagerService } from '../cell-editor-manager.service';

describe('CellEditorManagerService', () => {
    let service: ICellEditorManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ICellEditorManagerService, { useClass: CellEditorManagerService }]);
        service = injector.get(ICellEditorManagerService);
    });

    it('publishes editor visibility, bounds and focus state for the active sheet cell', () => {
        const states: unknown[] = [];
        const rects: unknown[] = [];
        const focus: boolean[] = [];
        service.state$.subscribe((state) => states.push(state));
        service.rect$.subscribe((rect) => rects.push(rect));
        service.focus$.subscribe((value) => focus.push(value));

        service.setState({ show: true, startX: 20, startY: 40, endX: 100, endY: 70 });
        service.setRect({ left: 10, top: 20, width: 100, height: 30 });
        service.setFocus(true);

        expect(states.at(-1)).toEqual({ show: true, startX: 20, startY: 40, endX: 100, endY: 70 });
        expect(rects.at(-1)).toEqual({ left: 10, top: 20, width: 100, height: 30 });
        expect(focus).toEqual([false, true]);
        expect(service.getState()).toEqual({ show: true, startX: 20, startY: 40, endX: 100, endY: 70 });
        expect(service.getRect()).toEqual({ left: 10, top: 20, width: 100, height: 30 });

        service.dispose();
        expect(service.getState()).toBeNull();
        expect(service.getRect()).toBeNull();
    });
});
