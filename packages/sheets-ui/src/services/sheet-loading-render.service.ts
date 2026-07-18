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

import type { ICellData, IObjectMatrixPrimitiveType, IWorkbookData } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, Inject, Injector, InterceptorEffectEnum, ObjectMatrix, Workbook } from '@univerjs/core';
import { Engine, RenderUnit, Scene, Spreadsheet } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { ILayoutService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { SheetRenderController } from '../controllers/render-controllers/sheet.render-controller';
import { SheetSkeletonRenderController } from '../controllers/render-controllers/skeleton.render-controller';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

const PREVIEW_UNIT_SUFFIX = '__snapshot_loading_preview__';
const PREVIEW_SCENE_PREFIX = '_UNIVER_SCENE_';

export interface ISheetLoadingRenderService {
    readonly workbook$: Observable<Workbook | null>;
    readonly loading$: Observable<boolean>;

    show(workbookData: IWorkbookData, activeSheetId: string, cellData?: IObjectMatrixPrimitiveType<ICellData>): void;
    hide(sourceUnitId: string): void;
}

export const ISheetLoadingRenderService = createIdentifier<ISheetLoadingRenderService>('sheets-ui.sheet-loading-render.service');

interface ILoadingRender {
    sourceUnitId: string;
    workbook: Workbook;
    render: RenderUnit;
    lastCellData?: IObjectMatrixPrimitiveType<ICellData>;
}

/**
 * Renders a read-only workbook shell without registering it in IUniverInstanceService.
 * The temporary workbook is therefore invisible to formulas, RPC and collaboration.
 */
export class SheetLoadingRenderService extends Disposable implements ISheetLoadingRenderService {
    readonly workbook$ = new BehaviorSubject<Workbook | null>(null);
    readonly loading$ = new BehaviorSubject(false);

    private _loadingRender: ILoadingRender | null = null;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
    }

    show(
        workbookData: IWorkbookData,
        activeSheetId: string,
        cellData?: IObjectMatrixPrimitiveType<ICellData>
    ): void {
        const sourceUnitId = workbookData.id;
        if (this._loadingRender?.sourceUnitId !== sourceUnitId) {
            this._disposeLoadingRender();
            this._loadingRender = this._createLoadingRender(workbookData, activeSheetId);
            this.workbook$.next(this._loadingRender.workbook);
            this.loading$.next(true);
        }

        const loadingRender = this._loadingRender;
        if (!loadingRender) {
            return;
        }

        const worksheet = loadingRender.workbook.getSheetBySheetId(activeSheetId);
        if (!worksheet) {
            return;
        }

        if (loadingRender.workbook.getActiveSheet().getSheetId() !== activeSheetId) {
            loadingRender.workbook.setActiveSheet(worksheet);
            loadingRender.render.with(SheetSkeletonManagerService).setCurrent({ sheetId: activeSheetId });
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
        super.dispose();
    }

    private _createLoadingRender(workbookData: IWorkbookData, activeSheetId: string): ILoadingRender {
        const previewUnitId = `${workbookData.id}${PREVIEW_UNIT_SUFFIX}`;
        const workbook = this._injector.createInstance(Workbook, {
            ...workbookData,
            id: previewUnitId,
        });
        const activeSheet = workbook.getSheetBySheetId(activeSheetId);
        if (activeSheet) {
            workbook.setActiveSheet(activeSheet);
        }

        const contentElement = this._layoutService.getContentElement();
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
            canvas.setId(`univer-sheet-loading-canvas_${workbookData.id}`);
            canvas.getCanvasEle().dataset.uUnitId = workbookData.id;
            canvas.getCanvasEle().style.pointerEvents = 'none';
            engine.mount(contentElement);
            return { sourceUnitId: workbookData.id, workbook, render };
        } catch (error) {
            this._disposeRender(render);
            workbook.dispose();
            throw error;
        }
    }

    private _disposeLoadingRender(): void {
        const loadingRender = this._loadingRender;
        this._loadingRender = null;
        this.workbook$.next(null);
        this.loading$.next(false);
        if (!loadingRender) {
            return;
        }

        this._disposeRender(loadingRender.render);
        loadingRender.workbook.dispose();
    }

    private _disposeRender(render: RenderUnit): void {
        render.components.forEach((component) => component.dispose());
        render.scene.dispose();
        render.dispose();
        render.engine.dispose();
    }
}
