import { IRenderManagerService, IWheelEvent } from '@univerjs/engine-render';
import { SelectionManagerService } from '@univerjs/sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetZoomRatioCommand } from '../commands/commands/set-zoom-ratio.command';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { VIEWPORT_KEY } from '../common/keys';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject } from './utils/component-tools';

interface ISetWorksheetMutationParams {
    workbookId: string;
    worksheetId: string;
}

@OnLifecycle(LifecycleStages.Rendered, ZoomController)
export class ZoomController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService
        private readonly _selectionRenderService: ISelectionRenderService,

        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._skeletonListener();
        this._commandExecutedListener();
        this._zoomEventBinding();
    }

    private _zoomEventBinding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
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

                    this._commandService.executeCommand(SetZoomRatioCommand.id, {
                        zoomRatio: nextRatio,
                        workbookId: workbook.getUnitId(),
                        worksheetId: sheet.getSheetId(),
                    });

                    e.preventDefault();
                })
            )
        );
    }

    private _skeletonListener() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
                    if (param == null) {
                        return;
                    }

                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();

                    const worksheet = workbook.getActiveSheet();

                    const zoomRatio = worksheet.getZoomRatio() || 1;

                    this._updateViewZoom(zoomRatio);
                })
            )
        );
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetZoomRatioOperation.id];

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
