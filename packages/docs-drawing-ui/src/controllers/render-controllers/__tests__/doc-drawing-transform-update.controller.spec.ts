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

import { BooleanNumber, DOCS_ZEN_EDITOR_UNIT_ID_KEY, LifecycleStages, PositionedObjectLayoutType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { SetDocZoomRatioOperation } from '@univerjs/docs-ui';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocDrawingTransformUpdateController } from '../doc-drawing-transform-update.controller';

function createEventSubject<T>() {
    const listeners: Array<(value: T) => void> = [];
    return {
        emit(value: T) {
            listeners.forEach((listener) => listener(value));
        },
        subscribeEvent(listener: (value: T) => void) {
            listeners.push(listener);
            return {
                unsubscribe: vi.fn(() => {
                    const index = listeners.indexOf(listener);
                    if (index >= 0) {
                        listeners.splice(index, 1);
                    }
                }),
            };
        },
    };
}

function createSkeleton() {
    return {
        getSkeletonData: () => ({
            pages: [{
                skeDrawings: [
                    {
                        aLeft: 10,
                        aTop: 15,
                        width: 30,
                        height: 40,
                        angle: 0,
                        drawingId: 'drawing-1',
                        drawingOrigin: {
                            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                            behindDoc: BooleanNumber.FALSE,
                            isMultiTransform: BooleanNumber.FALSE,
                        },
                    },
                    {
                        aLeft: 50,
                        aTop: 60,
                        width: 70,
                        height: 80,
                        angle: 10,
                        drawingId: 'drawing-2',
                        drawingOrigin: {
                            layoutType: PositionedObjectLayoutType.WRAP_NONE,
                            behindDoc: BooleanNumber.TRUE,
                            isMultiTransform: BooleanNumber.TRUE,
                        },
                    },
                    {
                        aLeft: 90,
                        aTop: 100,
                        width: 20,
                        height: 25,
                        angle: 15,
                        drawingId: 'drawing-2',
                        drawingOrigin: {
                            layoutType: PositionedObjectLayoutType.WRAP_NONE,
                            behindDoc: BooleanNumber.TRUE,
                            isMultiTransform: BooleanNumber.TRUE,
                        },
                    },
                ],
                headerId: null,
                footerId: null,
                marginTop: 12,
                marginLeft: 8,
                pageWidth: 300,
                pageHeight: 500,
                marginBottom: 16,
            }],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        }),
    };
}

function createController(options?: {
    stage?: LifecycleStages;
    skeleton?: any;
    isEditor?: boolean;
    unitId?: string;
}) {
    const currentSkeleton$ = new BehaviorSubject<any>(options?.skeleton ?? null);
    const refreshDrawings$ = new BehaviorSubject<any>(null);
    const lifecycle$ = new BehaviorSubject(options?.stage ?? LifecycleStages.Rendered);
    const commandExecuted$ = new Subject<any>();
    const transformChange$ = createEventSubject<{ type: string }>();
    const refreshControls = vi.fn();
    const setSelectedControl = vi.fn();
    const initializeNotification = vi.fn();
    const refreshTransform = vi.fn();
    const addNotification = vi.fn();
    const removeNotification = vi.fn();
    const makeDirty = vi.fn();

    const drawingData: Record<string, any> = {
        'drawing-2': {
            drawingId: 'drawing-2',
            isMultiTransform: BooleanNumber.TRUE,
        },
    };

    const docSkeletonManagerService = {
        currentSkeleton$: currentSkeleton$.asObservable(),
        getSkeleton: vi.fn(() => currentSkeleton$.value),
    };
    const commandService = {
        onCommandExecuted: vi.fn((listener) => {
            const sub = commandExecuted$.subscribe(listener);
            return {
                dispose: () => sub.unsubscribe(),
            };
        }),
    };
    const editorService = {
        isEditor: vi.fn(() => options?.isEditor ?? false),
    };
    const drawingManagerService = {
        refreshTransform,
        initializeNotification,
        getDrawingData: vi.fn(() => drawingData),
        getDrawingByParam: vi.fn((search: { drawingId: string }) => drawingData[search.drawingId]),
        removeNotification,
        addNotification,
    };
    const docRefreshDrawingsService = {
        refreshDrawings$: refreshDrawings$.asObservable(),
    };
    const contextUnitId = options?.unitId ?? 'doc-1';
    const transformer = {
        getSelectedObjectMap: () => new Map([['drawing-2', { oKey: 'shape-2' }]]),
        setSelectedControl,
        refreshControls,
    };
    const scene = {
        getTransformerByCreate: () => transformer,
        getTransformer: () => transformer,
        getObject: vi.fn((key: string) => key === 'drawing-2' ? { oKey: 'drawing-2' } : null),
    };

    const controller = new DocDrawingTransformUpdateController(
        {
            unitId: contextUnitId,
            unit: {} as never,
            scene,
            mainComponent: {
                left: 4,
                top: 6,
                pageLayoutType: 0,
                pageMarginLeft: 2,
                pageMarginTop: 3,
                makeDirty,
            },
            engine: {
                onTransformChange$: transformChange$,
            },
        } as never,
        docSkeletonManagerService as never,
        commandService as never,
        editorService as never,
        drawingManagerService as never,
        docRefreshDrawingsService as never,
        {} as never,
        {
            stage: options?.stage ?? LifecycleStages.Rendered,
            lifecycle$: lifecycle$.asObservable(),
        } as never
    );

    return {
        controller,
        currentSkeleton$,
        refreshDrawings$,
        commandExecuted$,
        transformChange$,
        lifecycle$,
        refreshControls,
        initializeNotification,
        refreshTransform,
        addNotification,
        removeNotification,
        makeDirty,
        scene,
    };
}

describe('DocDrawingTransformUpdateController', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('refreshes drawing transforms from the current skeleton and rehydrates multi-transform drawings', () => {
        const skeleton = createSkeleton();
        const testBed = createController({ skeleton });

        expect(testBed.refreshTransform).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'drawing-1',
                transform: expect.objectContaining({
                    left: 22,
                    top: 33,
                    width: 30,
                    height: 40,
                }),
                behindText: false,
            }),
        ]);
        expect(testBed.removeNotification).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'drawing-2',
            }),
        ]);
        expect(testBed.addNotification).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'drawing-2',
                transforms: [
                    expect.objectContaining({ left: 62, top: 78 }),
                    expect.objectContaining({ left: 102, top: 118 }),
                ],
                isMultiTransform: BooleanNumber.TRUE,
            }),
        ]);
        expect(testBed.scene.getObject).toHaveBeenCalledWith('drawing-2');
        expect(testBed.initializeNotification).toHaveBeenCalledWith('doc-1');

        testBed.controller.dispose();
    });

    it('refreshes drawings after explicit refresh events, matching commands, and resize notifications', async () => {
        vi.useFakeTimers();
        const skeleton = createSkeleton();
        const testBed = createController({ skeleton });
        testBed.refreshTransform.mockClear();

        testBed.refreshDrawings$.next(skeleton);
        expect(testBed.refreshTransform).toHaveBeenCalledTimes(1);

        testBed.commandExecuted$.next({
            id: RichTextEditingMutation.id,
            params: { unitId: 'doc-1' },
        });
        expect(testBed.refreshTransform).toHaveBeenCalledTimes(2);

        testBed.commandExecuted$.next({
            id: SetDocZoomRatioOperation.id,
            params: { unitId: 'doc-1' },
        });
        expect(testBed.refreshTransform).toHaveBeenCalledTimes(3);

        testBed.transformChange$.emit({ type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize as unknown as string });
        await vi.advanceTimersByTimeAsync(16);
        expect(testBed.refreshControls).toHaveBeenCalled();
        expect(testBed.refreshTransform).toHaveBeenCalledTimes(4);

        testBed.controller.dispose();
    });

    it('marks the main component dirty instead of refreshing drawings inside the regular editor surface', () => {
        const skeleton = createSkeleton();
        const testBed = createController({ skeleton, isEditor: true });
        testBed.refreshTransform.mockClear();

        testBed.commandExecuted$.next({
            id: RichTextEditingMutation.id,
            params: { unitId: 'doc-1' },
        });

        expect(testBed.makeDirty).toHaveBeenCalled();
        expect(testBed.refreshTransform).not.toHaveBeenCalled();

        testBed.controller.dispose();
    });

    it('still refreshes drawings for zen editor ids even when the editor service reports editor mode', () => {
        const skeleton = createSkeleton();
        const testBed = createController({
            skeleton,
            isEditor: true,
            unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY,
        });
        testBed.refreshTransform.mockClear();

        testBed.commandExecuted$.next({
            id: RichTextEditingMutation.id,
            params: { unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY },
        });

        expect(testBed.refreshTransform).toHaveBeenCalledTimes(1);
        expect(testBed.makeDirty).not.toHaveBeenCalled();

        testBed.controller.dispose();
    });

    it('waits for the rendered lifecycle stage before initializing when the controller starts earlier', () => {
        const skeleton = createSkeleton();
        const testBed = createController({
            skeleton,
            stage: LifecycleStages.Starting,
        });
        testBed.refreshTransform.mockClear();
        testBed.initializeNotification.mockClear();

        testBed.lifecycle$.next(LifecycleStages.Rendered);

        expect(testBed.refreshTransform).toHaveBeenCalledTimes(1);
        expect(testBed.initializeNotification).toHaveBeenCalledWith('doc-1');

        testBed.controller.dispose();
    });
});
