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

import { IContextService, Injector } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it } from 'vitest';
import { ISlideEditorBridgeService, SlideEditorBridgeService } from '../slide-editor-bridge.service';

describe('SlideEditorBridgeService', () => {
    let service: ISlideEditorBridgeService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IEditorService, { useValue: { getFocusEditor: () => ({}) } as unknown as IEditorService }]);
        injector.add([IContextService, { useValue: { setContextValue: () => {} } as unknown as IContextService }]);
        injector.add([IRenderManagerService, { useValue: { getRenderById: () => null } as unknown as IRenderManagerService }]);
        injector.add([ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }]);
        service = injector.get(ISlideEditorBridgeService);
    });

    it('publishes editor visibility changes and resets dirty state when editing starts', () => {
        const states: unknown[] = [];
        service.visible$.subscribe((state) => states.push(state));
        service.changeEditorDirty(true);

        service.changeVisible({ visible: true, eventType: DeviceInputEventType.Dblclick, unitId: 'slide-1' });

        expect(service.isVisible()).toBe(true);
        expect(service.getEditorDirty()).toBe(false);
        expect(states.at(-1)).toEqual({ visible: true, eventType: DeviceInputEventType.Dblclick, unitId: 'slide-1' });
    });
});
