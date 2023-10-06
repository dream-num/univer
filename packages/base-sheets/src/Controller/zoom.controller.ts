import { IRenderManagerService, ISelectionTransformerShapeManager, IWheelEvent } from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { SetZoomRatioMutation } from '../commands/mutations/set-zoom-ratio.mutation';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

interface ISetWorksheetMutationParams {
    workbookId: string;
    worksheetId: string;
}

@OnLifecycle(LifecycleStages.Rendered, ZoomController)
export class ZoomController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionTransformerShapeManager
        private readonly _selectionTransformerShapeManager: ISelectionTransformerShapeManager,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._skeletonListener();
        this._commandExecutedListener();
        this._zoomEventBinding();
    }

    private _zoomEventBinding() {
        const scene = this._renderManagerService.getCurrent()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        scene.onMouseWheelObserver.add((e: IWheelEvent, state) => {
            if (!e.ctrlKey) {
                return;
            }

            const deltaFactor = Math.abs(e.deltaX);
            let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
            ratioDelta *= e.deltaY > 0 ? -1 : 1;
            if (scene.scaleX < 1) {
                ratioDelta /= 2;
            }

            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const sheet = workbook.getActiveSheet();
            const currentRatio = sheet.getZoomRatio();
            let nextRatio = +parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
            nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

            this._commandService.executeCommand(SetZoomRatioMutation.id, {
                zoomRatio: nextRatio,
                workbookId: workbook.getUnitId(),
                worksheetId: sheet.getSheetId(),
            });

            e.preventDefault();
        });
    }

    private _skeletonListener() {
        this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();

            const worksheet = workbook.getActiveSheet();

            const zoomRatio = worksheet.getZoomRatio() || 1;

            this._updateViewZoom(zoomRatio);
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetZoomRatioMutation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();

                    const params = command.params;
                    const { workbookId, worksheetId } = params as ISetWorksheetMutationParams;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    const zoomRatio = worksheet.getConfig().zoomRatio || 1;

                    this._updateViewZoom(zoomRatio);
                }
            })
        );
    }

    private _updateViewZoom(zoomRatio: number) {
        const sheetObject = this._getSheetObject();
        sheetObject?.scene.scale(zoomRatio, zoomRatio);
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
