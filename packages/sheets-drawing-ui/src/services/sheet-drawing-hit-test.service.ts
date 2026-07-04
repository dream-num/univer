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

import type { IDisposable, IDrawingParam, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRender, Scene } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import { Disposable, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { Subject } from 'rxjs';

export interface ISheetDrawingHitTestResult {
    drawing: IDrawingParam;
    oKey: string;
    offsetX: number;
    offsetY: number;
}

export interface ISheetDrawingDoubleClickEvent extends ISheetDrawingHitTestResult {
    nativeEvent: IPointerEvent | IMouseEvent;
}

/**
 * Resolves sheet canvas pointer coordinates to drawing objects.
 *
 * Callers consume drawing-level events and should not depend on renderer object
 * keys, scene picking, or active sheet filtering.
 */
export class SheetDrawingHitTestService extends Disposable {
    private readonly _onDoubleClick$ = new Subject<ISheetDrawingDoubleClickEvent>();
    readonly onDoubleClick$: Observable<ISheetDrawingDoubleClickEvent> = this._onDoubleClick$.asObservable();

    private _doubleClickDisposable: IDisposable | null = null;
    private _boundRender: IRender | null = null;
    private _boundScene: Scene | null = null;

    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        this._disposeDoubleClickListener();
        this._onDoubleClick$.complete();
        super.dispose();
    }

    hitTestCurrentSheet(offsetX: number, offsetY: number): ISheetDrawingHitTestResult | null {
        const context = this._getActiveSheetContext();
        if (!context) {
            return null;
        }

        return this.hitTest(context.unitId, context.subUnitId, offsetX, offsetY);
    }

    hitTest(unitId: string, subUnitId: string, offsetX: number, offsetY: number): ISheetDrawingHitTestResult | null {
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;
        if (!scene) {
            return null;
        }

        return this._hitTestScene(scene, unitId, subUnitId, offsetX, offsetY);
    }

    private _init(): void {
        this.disposeWithMe(toDisposable(
            this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
                this._bindDoubleClickListener();
            })
        ));

        this.disposeWithMe(toDisposable(
            this._renderManagerService.created$.subscribe((render) => {
                const context = this._getActiveSheetContext();
                if (render.unitId === context?.unitId) {
                    this._bindDoubleClickListener();
                }
            })
        ));

        this.disposeWithMe(toDisposable(
            this._renderManagerService.disposed$.subscribe((unitId) => {
                if (unitId === this._boundRender?.unitId) {
                    this._disposeDoubleClickListener();
                }
            })
        ));

        this._bindDoubleClickListener();
    }

    private _bindDoubleClickListener(): void {
        const context = this._getActiveSheetContext();
        if (!context) {
            this._disposeDoubleClickListener();
            return;
        }

        const render = this._renderManagerService.getRenderById(context.unitId);
        const scene = render?.scene;
        if (!render || !scene) {
            this._disposeDoubleClickListener();
            return;
        }

        if (this._boundRender === render && this._boundScene === scene && this._doubleClickDisposable) {
            return;
        }

        this._disposeDoubleClickListener();

        const subscription = scene.onDblclick$.subscribeEvent((event: IPointerEvent | IMouseEvent) => {
            const activeContext = this._getActiveSheetContext();
            if (!activeContext || activeContext.unitId !== context.unitId) {
                return;
            }

            const hit = this._hitTestScene(scene, activeContext.unitId, activeContext.subUnitId, event.offsetX, event.offsetY);
            if (!hit) {
                return;
            }

            this._onDoubleClick$.next({
                ...hit,
                nativeEvent: event,
            });
        });

        this._doubleClickDisposable = { dispose: () => subscription.unsubscribe() };
        this._boundRender = render;
        this._boundScene = scene;
    }

    private _disposeDoubleClickListener(): void {
        this._doubleClickDisposable?.dispose();
        this._doubleClickDisposable = null;
        this._boundRender = null;
        this._boundScene = null;
    }

    private _hitTestScene(scene: Scene, unitId: string, subUnitId: string, offsetX: number, offsetY: number): ISheetDrawingHitTestResult | null {
        const pickedObject = scene.pick(Vector2.FromArray([offsetX, offsetY])) as {
            oKey?: string;
        } | null | undefined;
        const oKey = typeof pickedObject?.oKey === 'string' ? pickedObject.oKey : null;
        if (!oKey) {
            return null;
        }

        const drawing = this._drawingManagerService.getDrawingOKey(oKey);
        if (!drawing || drawing.unitId !== unitId || drawing.subUnitId !== subUnitId) {
            return null;
        }

        return {
            drawing,
            oKey,
            offsetX,
            offsetY,
        };
    }

    private _getActiveSheetContext(): { unitId: string; subUnitId: string } | null {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const unitId = workbook?.getUnitId();
        const subUnitId = workbook?.getActiveSheet()?.getSheetId();
        if (!unitId || !subUnitId) {
            return null;
        }

        return { unitId, subUnitId };
    }
}
