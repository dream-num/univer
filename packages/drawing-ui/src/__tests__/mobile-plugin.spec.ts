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

// @vitest-environment happy-dom

import { IImageIoService, IURLImageService, Univer } from '@univerjs/core';
import { IDrawingManagerService, OleService } from '@univerjs/drawing';
import { ComponentManager, IconManager, IDialogService, IGalleryService, IMessageService, INotificationService } from '@univerjs/ui';
import { EMPTY } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { UniverDrawingMobileUIPlugin } from '../mobile-plugin';
import { DrawingRenderService } from '../services/drawing-render.service';
import { OleUIService } from '../services/ole-ui.service';

describe('mobile drawing dependencies', () => {
    it('resolves the existing image renderer after mobile plugin startup', () => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IImageIoService, { useValue: {} as never }]);
            injector.add([IURLImageService, { useValue: {} as never }]);
            injector.add([IGalleryService, { useValue: {} as never }]);
            injector.add([IDialogService, { useValue: {} as never }]);
            injector.add([IMessageService, { useValue: {} as never }]);
            injector.add([INotificationService, { useValue: {} as never }]);
            injector.add([IDrawingManagerService, { useValue: { focus$: EMPTY, remove$: EMPTY } as never }]);
            injector.add([OleService, { useValue: { getResource: () => undefined } as never }]);
            const register = vi.fn(() => ({ dispose: vi.fn() }));
            injector.add([ComponentManager, { useValue: { register } as never }]);
            injector.add([IconManager, { useValue: { register } as never }]);
            const plugin = injector.createInstance(UniverDrawingMobileUIPlugin, {});
            plugin.onStarting();
            expect(injector.get(DrawingRenderService)).toBeInstanceOf(DrawingRenderService);
            expect(injector.get(OleUIService)).toBeInstanceOf(OleUIService);
        } finally {
            univer.dispose();
        }
    });
});
