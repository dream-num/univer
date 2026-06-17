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
import { EventSubject, ICommandService, Injector, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { DocCanvasPopManagerService, transformOffset2Bound, transformPosition2Offset } from '../doc-popup-manager.service';

class TestCanvasPopupService {
    activePopupId = '';
    readonly popups = new Map<string, IPopup>();
    readonly removedIds: string[] = [];
    private _nextId = 1;

    addPopup(param: IPopup) {
        const id = `popup-${this._nextId}`;
        this._nextId++;
        this.activePopupId = id;
        this.popups.set(id, param);
        return id;
    }

    removePopup(id: string) {
        this.removedIds.push(id);
        this.popups.delete(id);
        if (this.activePopupId === id) {
            this.activePopupId = '';
        }
    }
}

class TestRenderManagerService {
    scale = 1;
    viewportScrollX = 0;
    viewportScrollY = 0;
    readonly onTransformChange$ = new EventSubject();
    readonly onScrollAfter$ = new EventSubject();

    getRenderById(unitId: string) {
        if (unitId === 'missing-doc') {
            return undefined;
        }

        return {
            engine: {
                getCanvasElement: () => ({
                    getBoundingClientRect: () => ({ left: 10, top: 20, width: 1000 }),
                    style: { width: '1000px' },
                }),
            },
            scene: this.getScene(),
        };
    }

    getScene() {
        return {
            getAncestorScale: () => ({ scaleX: this.scale, scaleY: this.scale }),
            getViewport: () => ({
                onScrollAfter$: this.onScrollAfter$,
                viewportScrollX: this.viewportScrollX,
                viewportScrollY: this.viewportScrollY,
            }),
            onTransformChange$: this.onTransformChange$,
        };
    }
}

class TestUniverInstanceService {}

class TestCommandService {
    private readonly _listeners: Array<(commandInfo: { id: string }) => void> = [];

    onCommandExecuted(listener: (commandInfo: { id: string }) => void) {
        this._listeners.push(listener);
        return {
            dispose: () => {
                const index = this._listeners.indexOf(listener);
                if (index > -1) {
                    this._listeners.splice(index, 1);
                }
            },
        };
    }

    emit(commandId: string) {
        for (const listener of this._listeners) {
            listener({ id: commandId });
        }
    }
}

function createService() {
    const injector = new Injector();
    injector.add([ICanvasPopupService, { useClass: TestCanvasPopupService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([DocCanvasPopManagerService]);

    return {
        service: injector.get(DocCanvasPopManagerService),
        popupService: injector.get(ICanvasPopupService) as unknown as TestCanvasPopupService,
        renderManagerService: injector.get(IRenderManagerService) as unknown as TestRenderManagerService,
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
    };
}

describe('DocCanvasPopManagerService', () => {
    it('converts between document bounds and viewport offsets with scroll and scale', () => {
        const renderManagerService = new TestRenderManagerService();
        renderManagerService.scale = 2;
        renderManagerService.viewportScrollX = 25;
        renderManagerService.viewportScrollY = 40;
        const scene = renderManagerService.getScene();

        expect(transformPosition2Offset(125, 90, scene as never)).toEqual({ x: 200, y: 100 });
        expect(transformOffset2Bound(200, 100, scene as never)).toEqual({ x: 125, y: 90 });
    });

    it('refreshes rect popup positions after scene scale changes', () => {
        const { service, popupService, renderManagerService } = createService();

        service.attachPopupToRect({ left: 10, right: 110, top: 20, bottom: 40 }, { componentKey: 'test' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');

        expect(popup?.anchorRect).toEqual({ left: 20, right: 120, top: 40, bottom: 60 });

        renderManagerService.scale = 1.5;
        renderManagerService.onTransformChange$.emitEvent({} as never);

        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;
        expect(anchorRect$?.value).toEqual({ left: 25, right: 175, top: 50, bottom: 80 });
    });

    it('updates object anchored popups after zoom commands and removes popup on dispose', () => {
        const { service, popupService, commandService } = createService();
        const targetObject = { left: 30, top: 40, width: 50, height: 60 };

        const disposable = service.attachPopupToObject(targetObject as never, { componentKey: 'object-menu' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');
        expect(popup?.anchorRect).toEqual({ left: 40, right: 90, top: 60, bottom: 120 });
        expect(disposable.canDispose()).toBe(false);

        targetObject.left = 60;
        targetObject.top = 80;
        commandService.emit(SetDocZoomRatioOperation.id);
        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;
        expect(anchorRect$?.value).toEqual({ left: 70, right: 120, top: 100, bottom: 160 });

        popupService.activePopupId = 'another-popup';
        expect(disposable.canDispose()).toBe(true);
        disposable.dispose();
        expect(popupService.removedIds).toEqual(['popup-1']);
        expect(popupService.popups.has('popup-1')).toBe(false);
    });

    it('reports missing renders when a popup cannot be anchored', () => {
        const { service } = createService();

        expect(() => service.attachPopupToRect({ left: 0, right: 1, top: 0, bottom: 1 }, { componentKey: 'missing' }, 'missing-doc'))
            .toThrow('Current render not found, unitId: missing-doc');
    });
});
