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

import { ContextService, IContextService, Injector } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it } from 'vitest';
import { SLIDE_EDITOR_ID } from '../../const';
import { ISlideEditorBridgeService, SlideEditorBridgeService } from '../slide-editor-bridge.service';

class TestEditorService {
    readonly focusedEditors: string[] = [];
    focusedEditor: unknown = {};

    getFocusEditor() {
        return this.focusedEditor;
    }

    focus(editorId: string) {
        this.focusedEditors.push(editorId);
    }
}

class TestRenderManagerService {
    getRenderById(unitId: string) {
        if (unitId !== 'slide-1') {
            return null;
        }

        return {
            scene: {
                getViewport: () => ({ viewportScrollX: 5, viewportScrollY: 10 }),
                getObject: () => ({ left: 30, top: 45 }),
            },
        };
    }
}

describe('SlideEditorBridgeService', () => {
    let service: ISlideEditorBridgeService;
    let editorService: TestEditorService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IEditorService, { useClass: TestEditorService as never }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }]);
        editorService = injector.get(IEditorService) as unknown as TestEditorService;
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

    it('calculates editor geometry from the selected rich text object and focuses the slide editor when needed', () => {
        const states: unknown[] = [];
        service.currentEditRectState$.subscribe((state) => states.push(state));
        editorService.focusedEditor = null;

        const editorInfo = {
            unitId: 'slide-1',
            pageId: 'page-1',
            scene: {} as never,
            engine: {} as never,
            richTextObj: {
                left: 100,
                top: 80,
                width: 240,
                height: 60,
                documentData: {
                    id: 'old-editor-id',
                    body: {
                        dataStream: 'Text\r\n',
                    },
                    documentStyle: {
                        pageSize: { width: 10, height: 10 },
                    },
                },
            },
        };

        service.setEditorRect(editorInfo as never);

        expect(service.getEditorRect()).toBe(editorInfo);
        expect(service.getCurrentEditorId()).toBe(SLIDE_EDITOR_ID);
        expect(editorService.focusedEditors).toEqual([SLIDE_EDITOR_ID]);
        expect(service.getEditRectState()).toMatchObject({
            unitId: 'slide-1',
            editorUnitId: SLIDE_EDITOR_ID,
            position: {
                startX: 100,
                startY: 80,
                endX: 340,
                endY: 140,
            },
            slideCardOffset: {
                left: 25,
                top: 35,
            },
            documentLayoutObject: {
                documentModel: expect.any(Object),
            },
        });
        expect(states.at(-1)).toMatchObject({
            unitId: 'slide-1',
            editorUnitId: SLIDE_EDITOR_ID,
        });
    });
});
