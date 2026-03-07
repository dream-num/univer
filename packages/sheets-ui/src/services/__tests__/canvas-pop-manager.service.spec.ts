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

import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as commonUtils from '../../common/utils';
import { SheetCanvasPopManagerService } from '../canvas-pop-manager.service';

function createEventSubject<T>() {
    const listeners = new Set<(event: T) => void>();
    return {
        subscribeEvent(cb: (event: T) => void) {
            listeners.add(cb);
            return {
                dispose() {
                    listeners.delete(cb);
                },
                unsubscribe() {
                    listeners.delete(cb);
                },
            };
        },
        emit(event: T) {
            listeners.forEach((cb) => cb(event));
        },
    };
}

function createService() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100px';
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        top: 20,
        left: 10,
        width: 200,
        height: 120,
        right: 210,
        bottom: 140,
        x: 10,
        y: 20,
        toJSON: () => ({}),
    } as DOMRect);

    const commandListeners: Array<(info: { id: string; params?: any }) => void> = [];
    const onTransformChange$ = createEventSubject<unknown>();
    const worksheet = {
        getSheetId: () => 'sheet-1',
        getFreeze: () => ({ startRow: 1, startColumn: 1, xSplit: 0, ySplit: 0 }),
    };
    const workbook = {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
        getSheetBySheetId: () => worksheet,
    };
    const skeleton = {
        rowHeightAccumulation: [20, 40, 60],
        columnWidthAccumulation: [30, 60, 90],
        rowHeaderWidth: 20,
        columnHeaderHeight: 20,
        getCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * 30,
            endX: col * 30 + 30,
            startY: row * 20,
            endY: row * 20 + 20,
            isMergedMainCell: false,
            mergeInfo: {
                startX: col * 30,
                endX: col * 30 + 30,
                startY: row * 20,
                endY: row * 20 + 20,
            },
        }),
    };
    const viewport = { viewportScrollX: 0, viewportScrollY: 0 };
    const currentRender = {
        scene: {
            getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
        },
        engine: {
            clientRect$: new BehaviorSubject({}),
            onTransformChange$,
            getCanvasElement: () => canvas,
        },
        with(_token: unknown) {
            return {
                ensureSkeleton: () => skeleton,
                getOrCreateSkeleton: () => skeleton,
                getSkeletonParam: () => ({ skeleton }),
                selectionMoving: false,
            };
        },
    };

    const popupService = {
        activePopupId: 'active',
        addPopup: vi.fn(() => 'popup-1'),
        removePopup: vi.fn(),
    };

    const service = new SheetCanvasPopManagerService(
        popupService as any,
        { getRenderById: () => currentRender } as any,
        {
            getCurrentUnitForType: () => workbook,
            getCurrentUnitOfType: () => workbook,
            getUnit: () => workbook,
        } as any,
        {
            watchRange: vi.fn((_unitId: string, _subUnitId: string, _range: any, _cb: any) => ({
                dispose: vi.fn(),
            })),
        } as any,
        {
            onCommandExecuted: (cb: (info: { id: string; params?: any }) => void) => {
                commandListeners.push(cb);
                return { dispose: vi.fn() };
            },
            emit(id: string, params?: any) {
                commandListeners.forEach((cb) => cb({ id, params }));
            },
        } as any,
        {
            selectionMoving$: new Subject<void>(),
            selectionMoveEnd$: new Subject<void>(),
        } as any,
        {
            selectionMoving$: new Subject<void>(),
            selectionMoveEnd$: new Subject<void>(),
        } as any
    );

    return {
        service,
        popupService,
        currentRender,
        workbook,
        worksheet,
        skeleton,
        viewport,
    };
}

describe('SheetCanvasPopManagerService', () => {
    beforeEach(() => {
        vi.spyOn(commonUtils, 'getViewportByCell').mockReturnValue({ viewportScrollX: 0, viewportScrollY: 0 } as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('registers and resolves feature menus', () => {
        const { service } = createService();
        const callback = vi.fn(() => [{ label: 'menu', index: 0, commandId: 'cmd', commandParams: {}, disable: false }]);

        service.registerFeatureMenu('image' as any, callback);
        service.registerFeatureMenuOffset('image' as any, 12, 8);

        expect(service.getFeatureMenu('u', 's', 'd', 'image' as any)).toEqual([
            { label: 'menu', index: 0, commandId: 'cmd', commandParams: {}, disable: false },
        ]);
        expect(service.getFeatureMenu('u', 's', 'd', 'chart' as any)).toBeUndefined();
    });

    it('attaches popup to absolute position and disposes correctly', () => {
        const { service, popupService } = createService();

        const bound = { top: 10, left: 20, right: 30, bottom: 40 };
        const disposable = service.attachPopupToAbsolutePosition(bound, { componentKey: 'comp' } as any, 'unit-1', 'sheet-1');
        expect(disposable).not.toBeNull();
        expect(popupService.addPopup).toHaveBeenCalled();
        expect(disposable?.canDispose()).toBe(true);

        disposable?.dispose();
        expect(popupService.removePopup).toHaveBeenCalledWith('popup-1');

        expect(service.attachPopupToAbsolutePosition(bound, { componentKey: 'comp' } as any, 'other', 'sheet-1')).toBeNull();
    });

    it('attaches popup to cell and range with watchers', () => {
        const { service, popupService } = createService();

        const cellPopup = service.attachPopupToCell(1, 1, { componentKey: 'comp' } as any);
        expect(cellPopup).not.toBeNull();
        expect(popupService.addPopup).toHaveBeenCalled();
        expect(cellPopup?.canDispose()).toBe(true);
        cellPopup?.dispose();

        const rangePopup = service.attachRangePopup(
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } as any,
            { componentKey: 'comp' } as any
        );
        expect(rangePopup).not.toBeNull();
        rangePopup?.dispose();
        expect(popupService.removePopup).toHaveBeenCalled();
    });

    it('calculates cell position and handles disposed skeleton/scene', () => {
        const { service, currentRender, skeleton, viewport } = createService();

        const calc = (service as any)._calcCellPositionByCell.bind(service);
        const normal = calc(1, 1, currentRender, skeleton, viewport);
        expect(normal.left).toBeGreaterThan(0);
        expect(normal.bottom).toBeGreaterThan(normal.top);

        const disposedSkeleton = { ...skeleton, _disposed: true };
        const disposedSceneRender = {
            ...currentRender,
            scene: {
                ...currentRender.scene,
                _disposed: true,
            },
        };
        expect(calc(1, 1, disposedSceneRender, disposedSkeleton, viewport)).toEqual({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });
    });

    it('returns null for missing workbook/sheet in attachPopupToCell', () => {
        const { service } = createService();
        const mock = service as any;
        mock._univerInstanceService.getUnit = () => null;
        expect(service.attachPopupToCell(0, 0, { componentKey: 'comp' } as any, 'unit-x', 'sheet-1')).toBeNull();

        mock._univerInstanceService.getUnit = () => ({ getSheetBySheetId: () => null });
        expect(service.attachPopupToCell(0, 0, { componentKey: 'comp' } as any, 'unit-x', 'sheet-1')).toBeNull();
    });
});
