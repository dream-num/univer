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
import { ScriptPanelService } from '../script-panel.service';

describe('ScriptPanelService', () => {
    let service: ScriptPanelService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ScriptPanelService]);
        service = injector.get(ScriptPanelService);
    });

    it('publishes panel open state changes for the Uniscript sidebar', () => {
        const states: boolean[] = [];
        service.open$.subscribe((state) => states.push(state));

        service.open();
        service.open();
        service.close();

        expect(service.isOpen).toBe(false);
        expect(states).toEqual([false, true, false]);
    });
});
