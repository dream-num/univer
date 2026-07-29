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

import { Spreadsheet } from '../components/sheets';

import {
    createIdentifier,
    Disposable,
    type ICellData,
    Inject,
    Injector,
    InterceptorEffectEnum,
    type IObjectMatrixPrimitiveType,
    type IWorkbookData,
    ObjectMatrix,
    Workbook,
} from '@univerjs/core';
import {
    Engine,
    type IRender,
    IRenderManagerService,
    RenderUnit,
    Scene,
} from '@univerjs/engine-render';
import {
    BehaviorSubject,
    filter,
    firstValueFrom,
    from,
    map,
    Observable,
    of,
    type Subscription,
    switchMap,
    take,
    timeout,
} from 'rxjs';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { ILayoutService } from '@univerjs/ui';
import { SheetRenderController } from '../controllers/render-controllers/sheet.render-controller';
import { SheetSkeletonRenderController } from '../controllers/render-controllers/skeleton.render-controller';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

const PREVIEW_UNIT_SUFFIX = '__snapshot_loading_preview__';
const PREVIEW_SCENE_PREFIX = '_UNIVER_SCENE_';
const PREVIEW_CANVAS_Z_INDEX = '9';

export interface ISheetLoadingRenderService {
    readonly workbook$: Observable<Workbook | null>;
    readonly loading$: Observable<boolean>;
    readonly previewReady$: Observable<boolean>;

    showSkeleton(workbookData: IWorkbookData, activeSheetId: string): void;
    show(workbookData: IWorkbookData, activeSheetId: string, cellData?: IObjectMatrixPrimitiveType<ICellData>): void;
    handoff(sourceUnitId: string, timeoutMs: number): Promise<boolean>;
    hide(sourceUnitId: string): void;
}

export const ISheetLoadingRenderService = createIdentifier<ISheetLoadingRenderService>('sheets-ui.sheet-loading-render.service');

interface ILoadingRender {
    sourceUnitId: string;
    workbook: Workbook;
    render: RenderUnit | null;
    lastCellData?: IObjectMatrixPrimitiveType<ICellData>;
}

/**
 * Renders a read-only workbook shell without registering it in IUniverInstanceService.
 * The temporary workbook is therefore invisible to formulas, RPC and collaboration.
 */
export class SheetLoadingRenderService extends Disposable implements ISheetLoadingRenderService {
    readonly workbook$ = new BehaviorSubject<Workbook | null>(null);
    readonly loading$ = new BehaviorSubject(false);
    readonly previewReady$ = new BehaviorSubject(false);

    private _loadingRender: ILoadingRender | null = null;
    private _finalCanvasGuard: Subscription | null = null;
    private _hiddenFinalCanvas: HTMLCanvasElement | null = null;
    private _finalCanvasVisibility = '';

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    showSkeleton(workbookData: IWorkbookData, activeSheetId: string): void {
        const sourceUnitId = workbookData.id;
        if (this._loadingRender?.sourceUnitId !== sourceUnitId) {
            this._disposeLoadingRender();
            this.previewReady$.next(false);
            this._loadingRender = {
                sourceUnitId,
                workbook: this._createLoadingWorkbook(workbookData, activeSheetId),
                render: null,
            };
            this.workbook$.next(this._loadingRender.workbook);
            this.loading$.next(true);
            this._guardFinalCanvas(sourceUnitId);
        }

        const worksheet = this._loadingRender.workbook.getSheetBySheetId(activeSheetId);
        if (worksheet && this._loadingRender.workbook.getActiveSheet().getSheetId() !== activeSheetId) {
            this._loadingRender.workbook.setActiveSheet(worksheet);
        }
    }

    show(
        workbookData: IWorkbookData,
        activeSheetId: string,
        cellData?: IObjectMatrixPrimitiveType<ICellData>
    ): void {
        this.showSkeleton(workbookData, activeSheetId);

        const loadingRender = this._loadingRender;
        if (!loadingRender) {
            return;
        }

        let shouldRender = false;
        if (!loadingRender.render) {
            const contentElement = this._layoutService.getContentElement();
            if (!contentElement) {
                return;
            }

            loadingRender.render = this._createLoadingRender(
                loadingRender.workbook,
                loadingRender.sourceUnitId,
                contentElement
            );
            shouldRender = true;
        }

        const worksheet = loadingRender.workbook.getSheetBySheetId(activeSheetId);
        if (!worksheet) {
            return;
        }

        if (loadingRender.workbook.getActiveSheet().getSheetId() !== activeSheetId) {
            loadingRender.workbook.setActiveSheet(worksheet);
            loadingRender.render.with(SheetSkeletonManagerService).setCurrent({ sheetId: activeSheetId });
            shouldRender = true;
        }

        if (cellData && cellData !== loadingRender.lastCellData) {
            loadingRender.lastCellData = cellData;
            const target = worksheet.getCellMatrix();
            const getDisplayCell = this._sheetInterceptorService.fetchThroughInterceptors(
                INTERCEPTOR_POINT.CELL_CONTENT,
                InterceptorEffectEnum.Value | InterceptorEffectEnum.Style
            );
            new ObjectMatrix(cellData).forValue((row, column, rawData) => {
                const displayCell = getDisplayCell(rawData, {
                    unitId: loadingRender.sourceUnitId,
                    subUnitId: activeSheetId,
                    row,
                    col: column,
                    workbook: loadingRender.workbook,
                    worksheet,
                    rawData,
                });
                target.setValue(row, column, displayCell);
            });

            const skeletonManager = loadingRender.render.with(SheetSkeletonManagerService);
            skeletonManager.makeDirty({ sheetId: activeSheetId });
            skeletonManager.reCalculate();
            if (loadingRender.render.mainComponent instanceof Spreadsheet) {
                loadingRender.render.mainComponent.makeForceDirty(true);
            }
            loadingRender.render.scene.makeDirty(true);
            shouldRender = true;
        }

        if (shouldRender) {
            loadingRender.render.scene.render();
        }
        if (!this.previewReady$.value) {
            this.previewReady$.next(true);
        }
    }

    async handoff(sourceUnitId: string, timeoutMs: number): Promise<boolean> {
        if (this._loadingRender?.sourceUnitId !== sourceUnitId) {
            return true;
        }

        if (!this._loadingRender.render) {
            this.hide(sourceUnitId);
            return true;
        }

        this._finalCanvasGuard?.unsubscribe();
        this._finalCanvasGuard = null;

        try {
            await firstValueFrom(this._getFinalRender$(sourceUnitId).pipe(
                take(1),
                switchMap((render) => this._waitForFinalCanvas(render).pipe(
                    switchMap(() => {
                        this._hideFinalCanvas(render);
                        return this._requestFinalRender(render);
                    })
                )),
                timeout(timeoutMs)
            ));
            this.hide(sourceUnitId);
            return true;
        } catch {
            return false;
        }
    }

    hide(sourceUnitId: string): void {
        if (this._loadingRender?.sourceUnitId !== sourceUnitId) {
            return;
        }

        this._disposeLoadingRender();
    }

    override dispose(): void {
        this._disposeLoadingRender();
        this.workbook$.complete();
        this.loading$.complete();
        this.previewReady$.complete();
        super.dispose();
    }

    private _createLoadingWorkbook(workbookData: IWorkbookData, activeSheetId: string): Workbook {
        const previewUnitId = `${workbookData.id}${PREVIEW_UNIT_SUFFIX}`;
        const workbook = this._injector.createInstance(Workbook, {
            ...workbookData,
            id: previewUnitId,
        });
        const activeSheet = workbook.getSheetBySheetId(activeSheetId);
        if (activeSheet) {
            workbook.setActiveSheet(activeSheet);
        }

        return workbook;
    }

    private _createLoadingRender(
        workbook: Workbook,
        sourceUnitId: string,
        contentElement: HTMLElement
    ): RenderUnit {
        const previewUnitId = workbook.getUnitId();
        const { width, height } = contentElement.getBoundingClientRect();
        const engine = this._injector.createInstance(Engine, previewUnitId, undefined);
        const scene = new Scene(`${PREVIEW_SCENE_PREFIX}${previewUnitId}`, engine, {
            width,
            height,
        });
        scene.disableObjectsEvent();

        const render = this._injector.createInstance(RenderUnit, {
            unit: workbook,
            engine,
            scene,
            isMainScene: true,
        });
        try {
            render.addRenderDependencies([
                [SheetSkeletonManagerService],
                [SheetSkeletonRenderController],
                [SheetRenderController],
            ]);

            const canvas = engine.getCanvas();
            canvas.setId(`univer-sheet-loading-canvas_${sourceUnitId}`);
            canvas.getCanvasEle().dataset.uUnitId = sourceUnitId;
            canvas.getCanvasEle().style.pointerEvents = 'none';
            canvas.getCanvasEle().style.zIndex = PREVIEW_CANVAS_Z_INDEX;
            engine.mount(contentElement);
            return render;
        } catch (error) {
            this._disposeRender(render);
            throw error;
        }
    }

    private _waitForFinalCanvas(render: IRender): Observable<void> {
        return new Observable((subscriber) => {
            let frameId: number | undefined;
            const canvasElement = render.engine.getCanvasElement();

            const checkMounted = () => {
                const contentElement = this._layoutService.getContentElement();
                if (
                    contentElement &&
                    canvasElement.parentElement === contentElement &&
                    canvasElement.width > 0 &&
                    canvasElement.height > 0
                ) {
                    subscriber.next();
                    subscriber.complete();
                    return;
                }

                frameId = window.requestAnimationFrame(checkMounted);
            };

            checkMounted();

            return () => {
                if (frameId !== undefined) {
                    window.cancelAnimationFrame(frameId);
                }
            };
        });
    }

    private _getFinalRender$(sourceUnitId: string): Observable<IRender> {
        const existingRender = this._renderManagerService.getRenderUnitById(sourceUnitId);
        return existingRender
            ? of(existingRender)
            : this._renderManagerService.created$.pipe(
                filter((render) => render.unitId === sourceUnitId)
            );
    }

    private _guardFinalCanvas(sourceUnitId: string): void {
        this._finalCanvasGuard?.unsubscribe();
        this._finalCanvasGuard = this._getFinalRender$(sourceUnitId).pipe(
            take(1),
            switchMap((render) => this._waitForFinalCanvas(render).pipe(map(() => render)))
        ).subscribe((render) => this._hideFinalCanvas(render));
    }

    private _requestFinalRender(render: IRender): Observable<unknown> {
        render.scene.makeDirty(true);
        return from(render.scene.requestRender()).pipe(
            // Scene.requestRender resolves from a requestAnimationFrame callback, before that
            // frame is painted. Keep the preview above the final canvas for one more frame so
            // the browser paints the final canvas before the preview is disposed.
            switchMap(() => this._waitForNextAnimationFrame())
        );
    }

    private _hideFinalCanvas(render: IRender): void {
        const canvasElement = render.engine.getCanvasElement();
        if (this._hiddenFinalCanvas === canvasElement) {
            return;
        }

        this._restoreFinalCanvas();
        this._hiddenFinalCanvas = canvasElement;
        this._finalCanvasVisibility = canvasElement.style.visibility;
        canvasElement.style.visibility = 'hidden';
    }

    private _restoreFinalCanvas(): void {
        if (!this._hiddenFinalCanvas) {
            return;
        }

        this._hiddenFinalCanvas.style.visibility = this._finalCanvasVisibility;
        this._hiddenFinalCanvas = null;
        this._finalCanvasVisibility = '';
    }

    private _waitForNextAnimationFrame(): Observable<void> {
        return new Observable((subscriber) => {
            const frameId = window.requestAnimationFrame(() => {
                subscriber.next();
                subscriber.complete();
            });

            return () => window.cancelAnimationFrame(frameId);
        });
    }

    private _disposeLoadingRender(): void {
        this._finalCanvasGuard?.unsubscribe();
        this._finalCanvasGuard = null;
        this._restoreFinalCanvas();
        const loadingRender = this._loadingRender;
        this._loadingRender = null;
        this.workbook$.next(null);
        this.loading$.next(false);
        this.previewReady$.next(false);
        if (!loadingRender) {
            return;
        }

        if (loadingRender.render) {
            this._disposeRender(loadingRender.render);
        }
        loadingRender.workbook.dispose();
    }

    private _disposeRender(render: RenderUnit): void {
        render.components.forEach((component) => component.dispose());
        render.scene.dispose();
        render.dispose();
        render.engine.dispose();
    }
}
