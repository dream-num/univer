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
import { ISlideEditorManagerService, SlideEditorManagerService } from '../slide-editor-manager.service';

describe('SlideEditorManagerService', () => {
    let service: ISlideEditorManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ISlideEditorManagerService, { useClass: SlideEditorManagerService }]);
        service = injector.get(ISlideEditorManagerService);
    });

    it('publishes slide text editor state, bounds and focus changes', () => {
        const states: unknown[] = [];
        const rects: unknown[] = [];
        const focus: boolean[] = [];
        service.state$.subscribe((state) => states.push(state));
        service.rect$.subscribe((rect) => rects.push(rect));
        service.focus$.subscribe((value) => focus.push(value));

        service.setState({ show: true, startX: 12, startY: 24 });
        service.setRect({ left: 12, top: 24, width: 120, height: 32 });
        service.setFocus(true);

        expect(states.at(-1)).toEqual({ show: true, startX: 12, startY: 24 });
        expect(service.getState()).toEqual({ show: true, startX: 12, startY: 24 });
        expect(rects.at(-1)).toEqual({ left: 12, top: 24, width: 120, height: 32 });
        expect(service.getRect()).toEqual({ left: 12, top: 24, width: 120, height: 32 });
        expect(focus).toEqual([false, true]);
    });

    it('clears editor state and rect when disposed', () => {
        const states: unknown[] = [];
        const rects: unknown[] = [];
        let statesCompleted = false;
        let rectsCompleted = false;
        service.state$.subscribe({ next: (state) => states.push(state), complete: () => {
            statesCompleted = true;
        } });
        service.rect$.subscribe({ next: (rect) => rects.push(rect), complete: () => {
            rectsCompleted = true;
        } });

        service.setState({ show: true, startX: 1 });
        service.setRect({ left: 1, top: 2, width: 3, height: 4 });
        service.dispose();

        expect(service.getState()).toBeNull();
        expect(service.getRect()).toBeNull();
        expect(states).toEqual([null, { show: true, startX: 1 }]);
        expect(rects).toEqual([null, { left: 1, top: 2, width: 3, height: 4 }]);
        expect(statesCompleted).toBe(true);
        expect(rectsCompleted).toBe(true);
    });
});
