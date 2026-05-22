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

import type { IPopup } from '@univerjs/ui';
import { EventSubject } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocCanvasPopManagerService } from '../doc-popup-manager.service';

describe('DocCanvasPopManagerService', () => {
    it('refreshes rect popup positions after scene scale changes', () => {
        let scale = 1;
        const onTransformChange$ = new EventSubject();
        const onScrollAfter$ = new EventSubject();
        let popup: IPopup | undefined;
        const removePopup = vi.fn();
        const service = new DocCanvasPopManagerService(
            {
                addPopup: vi.fn((param: IPopup) => {
                    popup = param;
                    return 'popup-1';
                }),
                removePopup,
                activePopupId: 'other-popup',
            } as never,
            {
                getRenderById: () => ({
                    engine: {
                        getCanvasElement: () => ({
                            getBoundingClientRect: () => ({ left: 10, top: 20, width: 1000 }),
                            style: { width: '1000px' },
                        }),
                    },
                    scene: {
                        getAncestorScale: () => ({ scaleX: scale, scaleY: scale }),
                        getViewport: () => ({
                            onScrollAfter$,
                            viewportScrollX: 0,
                            viewportScrollY: 0,
                        }),
                        onTransformChange$,
                    },
                }),
            } as never,
            {} as never,
            {
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            } as never
        );

        service.attachPopupToRect({ left: 10, right: 110, top: 20, bottom: 40 }, { componentKey: 'test' }, 'doc-1');

        expect(popup?.anchorRect).toEqual({ left: 20, right: 120, top: 40, bottom: 60 });

        scale = 1.5;
        onTransformChange$.emitEvent({} as never);

        expect(popup?.anchorRect$?.value).toEqual({ left: 25, right: 175, top: 50, bottom: 80 });
    });
});
