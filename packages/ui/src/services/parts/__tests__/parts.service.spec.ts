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

import type { ComponentType } from '../../../common/component-manager';
import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../parts.service';

describe('UIPartsService', () => {
    let service: IUIPartsService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        service = injector.get(IUIPartsService);
    });

    it('registers UI components by screen region and removes them with the disposable', () => {
        const events: string[] = [];
        service.componentRegistered$.subscribe((part) => events.push(part));
        const Toolbar = (() => null) as ComponentType;

        const disposable = service.registerComponent(BuiltInUIPart.TOOLBAR, () => Toolbar);

        expect([...service.getComponents(BuiltInUIPart.TOOLBAR)]).toEqual([Toolbar]);
        disposable.dispose();
        expect([...service.getComponents(BuiltInUIPart.TOOLBAR)]).toEqual([]);
        expect(events).toEqual([BuiltInUIPart.TOOLBAR, BuiltInUIPart.TOOLBAR]);
    });

    it('publishes UI visibility changes for embedders that hide built-in chrome', () => {
        const changes: Array<{ ui: string; visible: boolean }> = [];
        service.uiVisibleChange$.subscribe((change) => changes.push(change));

        service.setUIVisible(BuiltInUIPart.HEADER, false);

        expect(service.isUIVisible(BuiltInUIPart.HEADER)).toBe(false);
        expect(service.isUIVisible(BuiltInUIPart.FOOTER)).toBe(true);
        expect(changes).toEqual([{ ui: BuiltInUIPart.HEADER, visible: false }]);
    });
});
