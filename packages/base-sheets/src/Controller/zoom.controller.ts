import { IRenderManagerService, ISelectionTransformerShapeManager, IWheelEvent } from '@univerjs/base-render';
import { Disposable, ICommandService, ICurrentUniverService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { SelectionManagerService } from '../services/selection-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

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

            const sheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
            const currentRatio = sheet.getZoomRatio();
            let nextRatio = +parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
            nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

            // sheet.setZoomRatio(nextRatio);

            e.preventDefault();
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
