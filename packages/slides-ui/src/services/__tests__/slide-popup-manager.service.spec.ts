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

import { ICommandService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    SlideCanvasPopMangerService,
    transformBound2OffsetBound,
    transformPosition2Offset,
} from '../slide-popup-manager.service';

class TestCanvasPopupService {
    readonly addedPopups: unknown[] = [];
    readonly removedPopupIds: string[] = [];

    addPopup(popup: unknown) {
        this.addedPopups.push(popup);
        return 'popup-1';
    }

    removePopup(id: string) {
        this.removedPopupIds.push(id);
    }
}

class TestRenderManagerService {
    static hasRender = false;

    static reset() {
        this.hasRender = false;
    }

    getRenderById(unitId: string) {
        if (!TestRenderManagerService.hasRender || unitId !== 'slide-1') {
            return null;
        }

        const canvasElement = document.createElement('canvas');
        canvasElement.style.width = '200px';
        canvasElement.getBoundingClientRect = () => ({
            left: 10,
            top: 20,
            width: 400,
            height: 300,
            right: 410,
            bottom: 320,
            x: 10,
            y: 20,
            toJSON: () => ({}),
        });

        return {
            mainComponent: { width: 300, height: 200 },
            engine: {
                getCanvasElement: () => canvasElement,
            },
            scene: {
                width: 500,
                height: 400,
                getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
                getViewport: () => ({ viewportScrollX: 5, viewportScrollY: 10 }),
            },
        };
    }
}

class TestUniverInstanceService {
    getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SLIDE ? { getUnitId: () => 'slide-1' } : null;
    }
}

class TestCommandService {}

describe('SlideCanvasPopMangerService', () => {
    let service: SlideCanvasPopMangerService;
    let popupService: TestCanvasPopupService;

    beforeEach(() => {
        TestRenderManagerService.reset();
        const injector = new Injector();
        injector.add([ICanvasPopupService, { useClass: TestCanvasPopupService as never }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([SlideCanvasPopMangerService]);
        popupService = injector.get(ICanvasPopupService) as unknown as TestCanvasPopupService;
        service = injector.get(SlideCanvasPopMangerService);
    });

    it('does not create a canvas popup when the current slide has no renderer', () => {
        const disposable = service.attachPopupToObject({ left: 0, top: 0, width: 10, height: 10 } as never, { componentKey: 'slide-comment' });

        disposable.dispose();

        expect(popupService.addedPopups).toEqual([]);
        expect(popupService.removedPopupIds).toEqual([]);
    });

    it('attaches a popup to the rendered slide object and removes it on dispose', () => {
        TestRenderManagerService.hasRender = true;

        const disposable = service.attachPopupToObject({ left: 15, top: 20, width: 30, height: 10 } as never, {
            componentKey: 'slide-comment',
            direction: 'horizontal',
        });

        expect(popupService.addedPopups).toHaveLength(1);
        expect(popupService.addedPopups[0]).toMatchObject({
            unitId: 'slide-1',
            subUnitId: 'default',
            componentKey: 'slide-comment',
            direction: 'horizontal',
            anchorRect: {
                left: 190,
                right: 430,
                top: 300,
                bottom: 480,
            },
            canvasElement: expect.any(HTMLCanvasElement),
        });

        disposable.dispose();

        expect(popupService.removedPopupIds).toEqual(['popup-1']);
    });

    it('converts slide coordinates to viewport offsets with scroll and scale applied', () => {
        const scene = {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
            getViewport: () => ({ viewportScrollX: 5, viewportScrollY: 10 }),
        };

        expect(transformPosition2Offset(15, 20, scene as never)).toEqual({ x: 20, y: 30 });
        expect(transformBound2OffsetBound({ left: 15, top: 20, right: 45, bottom: 30 }, scene as never)).toEqual({
            left: 20,
            top: 30,
            right: 80,
            bottom: 60,
        });
    });
});
