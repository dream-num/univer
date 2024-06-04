import { Disposable, LifecycleStages, OnLifecycle, Tools } from "@univerjs/core";
import { IDrawingManagerService } from "@univerjs/drawing";
import { DrawingRenderService } from "@univerjs/drawing-ui";
import { IRenderManagerService } from "@univerjs/engine-render";
import { SheetPrintInterceptorService, SheetSkeletonManagerService } from "@univerjs/sheets-ui";
import { Inject } from "@wendellhu/redi";

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingPrintingController)
export class SheetDrawingPrintingController extends Disposable {
    constructor(
        @Inject(SheetPrintInterceptorService) private readonly _sheetPrintInterceptorService: SheetPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initPrinting();
    }

    private _initPrinting() {
        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
                {
                    handler: (_param, pos, next) => {
                        const { unitId, scene, subUnitId } = pos
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData[subUnitId];
                        if (subUnitData) {
                            subUnitData.order.forEach(id => {
                                this._drawingRenderService.renderDrawing(subUnitData.data[id], scene);
                            })
                        }

                        return next();
                    }
                }
            )
        );

        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_RANGE,
                {
                    handler: (range, pos, next) => {
                        if (!range) {
                            return next(range);
                        }

                        const { unitId, subUnitId } = pos;
                        const skeleton = this._sheetSkeletonManagerService.getUnitSkeleton(unitId, subUnitId)
                        if (!skeleton) {
                            return next(range);
                        }
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData[pos.subUnitId];
                        if (!subUnitData) {
                            return next(range);
                        }

                        const renderer = this._renderManagerService.getRenderById(unitId);
                        if (!renderer) {
                            return next(range);
                        }
                        const { scaleX, scaleY } = renderer.scene;
                        const newRange = { ...range };
                        subUnitData.order.forEach(id => {
                            const param = subUnitData.data[id];
                            if (!param.groupId && param.transform && Tools.isDefine(param.transform.left) && Tools.isDefine(param.transform.top) && Tools.isDefine(param.transform.width) && Tools.isDefine(param.transform.height)) {
                                const start = skeleton.skeleton.getCellPositionByOffset(param.transform.left, param.transform.top, scaleX, scaleY, { x: 0, y: 0 });
                                const end = skeleton.skeleton.getCellPositionByOffset(param.transform.left + param.transform.width, param.transform.top + param.transform.height, scaleX, scaleY, { x: 0, y: 0 });
                                if (start.column < newRange.startColumn) {
                                    newRange.startColumn = start.column;
                                }

                                if (start.row < newRange.startRow) {
                                    newRange.startRow = start.row;
                                }

                                if (newRange.endRow < end.row) {
                                    newRange.endRow = end.row;
                                }

                                if (newRange.endColumn < end.column) {
                                    newRange.endColumn = end.column
                                }
                            }
                        })
                        return next(newRange);
                    }
                }
            )
        );
    }
}
