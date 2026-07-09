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
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import {
    DocCanvasPopManagerService,
    transformBound2OffsetBound,
    transformOffset2Bound,
    transformPosition2Offset,
} from '../doc-popup-manager.service';
import { NodePositionConvertToCursor } from '../selection/convert-text-range';

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
    hasViewport = true;
    viewportScrollX = 0;
    viewportScrollY = 0;
    canvasElement: { getBoundingClientRect: () => { left: number; top: number; width: number }; style: { width: string } } | null = {
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 1000 }),
        style: { width: '1000px' },
    };

    popupInjector = new Injector();
    getInjector = vi.fn(() => this.popupInjector);
    readonly onTransformChange$ = new EventSubject();
    readonly onScrollAfter$ = new EventSubject();

    getRenderById(unitId: string) {
        if (unitId === 'missing-doc') {
            return undefined;
        }
        const skeleton = {
            findNodePositionByCharIndex: (index: number) => ({ glyph: index }),
        };

        return {
            unitId,
            engine: {
                getCanvasElement: () => this.canvasElement,
            },
            getInjector: this.getInjector,
            mainComponent: {
                getOffsetConfig: () => ({
                    docsLeft: 0,
                    docsTop: 0,
                }),
            },
            scene: this.getScene(),
            with: (token: unknown) => {
                if (token === DocSkeletonManagerService) {
                    return {
                        getSkeleton: () => skeleton,
                    };
                }

                throw new Error(`Unexpected render dependency: ${String(token)}`);
            },
        };
    }

    getScene() {
        return {
            getAncestorScale: () => ({ scaleX: this.scale, scaleY: this.scale }),
            getViewport: () => this.hasViewport
                ? ({
                    onScrollAfter$: this.onScrollAfter$,
                    viewportScrollX: this.viewportScrollX,
                    viewportScrollY: this.viewportScrollY,
                })
                : undefined,
            onTransformChange$: this.onTransformChange$,
        };
    }
}

class TestUniverInstanceService {
    embeddedUnitIds = new Set<string>();

    getUnit(unitId: string) {
        return unitId === 'missing-doc-data' ? undefined : {};
    }

    getUnitCreateOptions(unitId: string) {
        return this.embeddedUnitIds.has(unitId) ? { embeddedRender: true } : undefined;
    }
}

class TestCommandService {
    private readonly _listeners: Array<(commandInfo: { id: string; params?: unknown }) => void> = [];

    onCommandExecuted(listener: (commandInfo: { id: string; params?: unknown }) => void) {
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

    emit(commandId: string, params?: unknown) {
        for (const listener of this._listeners) {
            listener({ id: commandId, params });
        }
    }
}

function createService() {
    const injector = new Injector();
    injector.add([ICanvasPopupService, { useClass: TestCanvasPopupService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([DocCanvasPopManagerService]);

    return {
        service: injector.get(DocCanvasPopManagerService),
        popupService: injector.get(ICanvasPopupService) as unknown as TestCanvasPopupService,
        renderManagerService: injector.get(IRenderManagerService) as unknown as TestRenderManagerService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
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
        expect(transformBound2OffsetBound({ left: 125, right: 225, top: 90, bottom: 140 }, scene as never)).toEqual({
            left: 200,
            right: 400,
            top: 100,
            bottom: 200,
        });
    });

    it('keeps document coordinates unchanged when the render scene has no viewport', () => {
        const renderManagerService = new TestRenderManagerService();
        renderManagerService.hasViewport = false;
        const scene = renderManagerService.getScene();

        expect(transformPosition2Offset(125, 90, scene as never)).toEqual({ x: 125, y: 90 });
        expect(transformOffset2Bound(200, 100, scene as never)).toEqual({ x: 200, y: 100 });
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

    it('uses a scoped popup injector only for embedded document render units', () => {
        const { service, popupService, renderManagerService, univerInstanceService } = createService();

        service.attachPopupToRect({ left: 10, right: 110, top: 20, bottom: 40 }, { componentKey: 'normal-popup' }, 'doc-1');
        expect(popupService.popups.get('popup-1')?.connectorInjector).toBeUndefined();
        expect(renderManagerService.getInjector).not.toHaveBeenCalled();

        univerInstanceService.embeddedUnitIds.add('doc-1');
        service.attachPopupToRect({ left: 10, right: 110, top: 20, bottom: 40 }, { componentKey: 'embed-popup' }, 'doc-1');
        expect(popupService.popups.get('popup-2')?.connectorInjector).toBe(renderManagerService.popupInjector);
        expect(renderManagerService.getInjector).toHaveBeenCalledTimes(1);
    });

    it('refreshes function-based rect popup anchors after scroll and rich text changes', () => {
        const { service, popupService, renderManagerService, commandService } = createService();
        const rect = { left: 10, right: 110, top: 20, bottom: 40 };

        service.attachPopupToRect(() => rect, { componentKey: 'dynamic-rect' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');
        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;

        renderManagerService.viewportScrollX = 20;
        renderManagerService.viewportScrollY = 30;
        renderManagerService.onScrollAfter$.emitEvent({} as never);
        expect(anchorRect$?.value).toEqual({ left: 0, right: 100, top: 10, bottom: 30 });

        rect.left = 30;
        rect.right = 130;
        commandService.emit(RichTextEditingMutation.id);
        expect(anchorRect$?.value).toEqual({ left: 20, right: 120, top: 10, bottom: 30 });
    });

    it('does not refresh rect popup anchors for rich text changes from another document', () => {
        const { service, popupService, commandService } = createService();
        const rect = { left: 10, right: 110, top: 20, bottom: 40 };
        const getRect = vi.fn(() => rect);

        service.attachPopupToRect(getRect, { componentKey: 'dynamic-rect' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');
        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;

        rect.left = 30;
        rect.right = 130;
        commandService.emit(RichTextEditingMutation.id, { unitId: 'slide-shape-editor' });

        expect(getRect).toHaveBeenCalledTimes(1);
        expect(anchorRect$?.value).toEqual({ left: 20, right: 120, top: 40, bottom: 60 });
    });

    it('keeps the last rect popup anchor when a stale dynamic rect throws during refresh', () => {
        const { service, popupService, commandService } = createService();
        let stale = false;
        const getRect = vi.fn(() => {
            if (stale) {
                throw new TypeError('Cannot read properties of null (reading clone)');
            }

            return { left: 10, right: 110, top: 20, bottom: 40 };
        });

        service.attachPopupToRect(getRect, { componentKey: 'stale-dynamic-rect' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');
        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;

        stale = true;

        expect(() => commandService.emit(RichTextEditingMutation.id, { unitId: 'doc-1' })).not.toThrow();
        expect(anchorRect$?.value).toEqual({ left: 20, right: 120, top: 40, bottom: 60 });
    });

    it('ignores stale rect popup updates after the render canvas is released', () => {
        const { service, popupService, renderManagerService, commandService } = createService();

        service.attachPopupToRect({ left: 10, right: 110, top: 20, bottom: 40 }, { componentKey: 'stale-rect' }, 'doc-1');
        const popup = popupService.popups.get('popup-1');
        const anchorRect$ = popup?.anchorRect$ as { value?: unknown } | undefined;

        renderManagerService.canvasElement = null;

        expect(() => commandService.emit(RichTextEditingMutation.id)).not.toThrow();
        expect(anchorRect$?.value).toEqual({ left: 20, right: 120, top: 40, bottom: 60 });
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

    it('reports missing documents and renders before attaching range popups', () => {
        const { service } = createService();
        const range = { startOffset: 0, endOffset: 1, collapsed: false };

        expect(() => service.attachPopupToRange(range, { componentKey: 'missing-doc-data' }, 'missing-doc-data'))
            .toThrow('Document not found, unitId: missing-doc-data');
        expect(() => service.attachPopupToRange(range, { componentKey: 'missing-render' }, 'missing-doc'))
            .toThrow('Current render not found, unitId: missing-doc');
    });

    it('anchors range popups to text bounds and updates them after rich text changes', () => {
        const { service, popupService, commandService } = createService();
        let borderBoxPointGroup = [
            [{ x: 10, y: 10 }, { x: 40, y: 10 }, { x: 40, y: 20 }, { x: 10, y: 20 }],
            [{ x: 12, y: 30 }, { x: 70, y: 30 }, { x: 70, y: 40 }, { x: 12, y: 40 }],
        ];
        const rangeSpy = vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockImplementation(() => ({
            borderBoxPointGroup,
        }) as never);
        const emittedAnchors: unknown[] = [];

        const disposable = service.attachPopupToRange(
            { startOffset: 0, endOffset: 4, collapsed: false },
            { componentKey: 'range-menu', direction: 'top', multipleDirection: 'bottom' },
            'doc-1'
        );
        const popup = popupService.popups.get('popup-1');
        const anchorSubscription = popup?.anchorRect$?.subscribe((anchor) => {
            emittedAnchors.push(anchor);
        });

        expect(popup?.anchorRect).toEqual({ left: 20, right: 50, top: 30, bottom: 40 });
        expect(popup?.excludeRects).toEqual([
            { left: 20, right: 50, top: 30, bottom: 40 },
            { left: 22, right: 80, top: 50, bottom: 60 },
        ]);
        expect(popup?.direction).toBe('bottom');
        expect(emittedAnchors.at(-1)).toEqual({ left: 20, right: 50, top: 30, bottom: 40 });

        borderBoxPointGroup = [
            [{ x: 20, y: 60 }, { x: 90, y: 60 }, { x: 90, y: 80 }, { x: 20, y: 80 }],
        ];
        commandService.emit(RichTextEditingMutation.id, { unitId: 'doc-1' });

        expect(emittedAnchors.at(-1)).toEqual({ left: 30, right: 100, top: 80, bottom: 100 });

        anchorSubscription?.unsubscribe();
        disposable.dispose();
        rangeSpy.mockRestore();
        expect(popupService.removedIds).toContain('popup-1');
    });
});
