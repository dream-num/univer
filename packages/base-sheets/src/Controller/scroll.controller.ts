import { IRenderManagerService, ISelectionTransformerShapeManager } from '@univerjs/base-render';
import { Disposable, ICommandService, ICurrentUniverService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getSheetObject } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { SelectionManagerService } from '../services/selection-manager.service';
import { ISheetSkeletonManagerParam, SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, ScrollController)
export class ScrollController extends Disposable {
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
        this._scrollEventBinding();

        this._scrollSubscribeBinding();

        this._skeletonListener();
    }

    private _scrollEventBinding() {
        const scene = this._renderManagerService.getCurrent()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        viewportMain?.onScrollAfterObserver.add((param) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            if (skeleton == null) {
                return;
            }
            const scene = this._renderManagerService.getCurrent()?.scene;
            if (scene == null) {
                return;
            }

            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

            const { scaleX, scaleY } = scene.getAncestorScale();

            const { actualScrollX = 0, actualScrollY = 0 } = param;

            const { row, column } = skeleton.getCellPositionByOffset(
                actualScrollX + rowHeaderWidthAndMarginLeft,
                actualScrollY + columnHeaderHeightAndMarginTop,
                scaleX,
                scaleY,
                {
                    x: 0,
                    y: 0,
                }
            );

            this._scrollManagerService.addOrReplaceNoRefresh({
                sheetViewStartRow: row,
                sheetViewStartColumn: column,
            });
        });
    }

    private _scrollSubscribeBinding() {
        this._scrollManagerService.scrollInfo$.subscribe((param) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            const scene = this._renderManagerService.getCurrent()?.scene;
            if (skeleton == null || scene == null) {
                return;
            }

            const sheetObject = this._getSheetObject();
            if (sheetObject == null) {
                return;
            }

            const { scaleX, scaleY } = sheetObject.scene.getAncestorScale();

            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

            if (viewportMain == null) {
                return;
            }

            if (param == null) {
                viewportMain.scrollTo({
                    x: 0,
                    y: 0,
                });
                return;
            }

            const { sheetViewStartRow, sheetViewStartColumn } = param;

            const { mergeInfo } = skeleton.getCellByIndexWithNoHeader(
                sheetViewStartRow,
                sheetViewStartColumn,
                scaleX,
                scaleY
            );

            const { startX, endX, startY, endY } = mergeInfo;

            const config = viewportMain.getBarScroll(startX, startY);
            viewportMain.scrollTo(config);
        });
    }

    private _skeletonListener() {
        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId, sheetId } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            this._updateSceneSize(param);

            this._scrollManagerService.setCurrentScroll({
                unitId,
                sheetId,
            });
        });
    }

    private _updateSceneSize(param: ISheetSkeletonManagerParam) {
        if (param == null) {
            return;
        }
        const { skeleton } = param;

        const scene = this._renderManagerService.getCurrent()?.scene;

        if (skeleton == null || scene == null) {
            return;
        }

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;

        scene?.transformByState({
            width: rowHeaderWidthAndMarginLeft + columnTotalWidth,
            height: columnHeaderHeightAndMarginTop + rowTotalHeight,
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
