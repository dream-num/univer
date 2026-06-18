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
import { FormulaEditorManagerService, IFormulaEditorManagerService } from '../formula-editor-manager.service';

describe('FormulaEditorManagerService', () => {
    let service: FormulaEditorManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IFormulaEditorManagerService, { useClass: FormulaEditorManagerService }]);
        service = injector.get(IFormulaEditorManagerService) as FormulaEditorManagerService;
    });

    it('publishes formula editor position and toolbar button interactions', () => {
        const rect = { left: 1, top: 2, width: 300, height: 24 } as DOMRect;
        const positions: unknown[] = [];
        const focus: boolean[] = [];
        const fxClicks: boolean[] = [];
        const foldClicks: boolean[] = [];
        service.position$.subscribe((position) => positions.push(position));
        service.focus$.subscribe((value) => focus.push(value));
        service.fxBtnClick$.subscribe((value) => fxClicks.push(value));
        service.foldBtnStatus$.subscribe((value) => foldClicks.push(value));

        service.setPosition(rect);
        service.setFocus(true);
        service.handleFxBtnClick(true);
        service.handleFoldBtnClick(false);

        expect(positions.at(-1)).toBe(rect);
        expect(focus).toEqual([false, true]);
        expect(fxClicks).toEqual([true]);
        expect(foldClicks).toEqual([false]);
        expect(service.getPosition()).toBe(rect);

        service.dispose();
        expect(service.getPosition()).toBeNull();
    });
});
