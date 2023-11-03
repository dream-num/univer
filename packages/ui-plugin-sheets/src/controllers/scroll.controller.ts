import { IRenderManagerService } from '@univerjs/base-render';
import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    Direction,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ScrollCommand } from '../commands/commands/set-scroll.command';
import { VIEWPORT_KEY } from '../common/keys';
import { ScrollManagerService } from '../services/scroll-manager.service';
import { ISheetSkeletonManagerParam, SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject } from './utils/component-tools';

@OnLifecycle(LifecycleStages.Rendered, ScrollController)
export class ScrollController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
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
        this._scrollEventBinding();
        this._scrollSubscribeBinding();
        this._skeletonListener();
    }

    private _scrollEventBinding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
                viewportMain?.onScrollAfterObserver.add((param) => {
                    const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                    if (skeleton == null || param.isTrigger === false) {
                        return;
                    }

                    const sheetObject = this._getSheetObject();
                    if (skeleton == null || sheetObject == null) {
                        return;
                    }

                    const { actualScrollX = 0, actualScrollY = 0 } = param;

                    // according to the actual scroll position, the most suitable row, column and offset combination is recalculated.
                    const { row, column, rowOffset, columnOffset } = skeleton.getDecomposedOffset(
                        actualScrollX,
                        actualScrollY
                    );

                    // update scroll infos in scroll manager service
                    this._scrollManagerService.addOrReplaceNoRefresh({
                        sheetViewStartRow: row,
                        sheetViewStartColumn: column,
                        offsetX: columnOffset,
                        offsetY: rowOffset,
                    });
                })
            )
        );
    }

    scrollToVisible(direction: Direction) {
        let startSheetViewRow;
        let startSheetViewColumn;
        const selection = this._selectionManagerService.getLast();
        if (selection == null) {
            return;
        }
        const { actualRow: selectionStartRow, actualColumn: selectionStartColumn } = selection.primary;
        const { rowHeightAccumulation, columnWidthAccumulation } =
            this._sheetSkeletonManagerService.getCurrent()?.skeleton ?? {};
        if (rowHeightAccumulation == null || columnWidthAccumulation == null) {
            return;
        }
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) {
            return;
        }
        const { tl } = viewport.getBounding();

        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getActiveSheet();
        const {
            startColumn: freezeStartColumn,
            startRow: freezeStartRow,
            ySplit: freezeYSplit,
            xSplit: freezeXSplit,
        } = worksheet.getFreeze();

        const bounds = viewport.getBounding();
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }
        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = skeleton.getRowColumnSegment(bounds);

        // vertical overflow only happens when the selection's row is in not the freeze area
        if (selectionStartRow >= freezeStartRow && selectionStartColumn >= freezeStartColumn - freezeXSplit) {
            // top overflow
            if (selectionStartRow <= viewportStartRow) {
                startSheetViewRow = selectionStartRow;
            }

            // bottom overflow
            if (selectionStartRow >= viewportEndRow) {
                const minRowAccumulation = rowHeightAccumulation[selectionStartRow] - viewport.height!;
                for (let r = viewportStartRow; r <= selectionStartRow; r++) {
                    if (rowHeightAccumulation[r] >= minRowAccumulation) {
                        startSheetViewRow = r + 1;
                        break;
                    }
                }
            }
        }
        // horizontal overflow only happens when the selection's column is in not the freeze area
        if (selectionStartColumn >= freezeStartColumn && selectionStartRow >= freezeStartRow - freezeYSplit) {
            // left overflow
            if (selectionStartColumn <= viewportStartColumn) {
                startSheetViewColumn = selectionStartColumn;
            }

            // right overflow
            if (selectionStartColumn >= viewportEndColumn) {
                const minColumnAccumulation = columnWidthAccumulation[selectionStartColumn] - viewport.width!;
                for (let c = viewportStartColumn; c <= selectionStartColumn; c++) {
                    if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                        startSheetViewColumn = c + 1;
                        break;
                    }
                }
            }
        }

        if (startSheetViewRow === undefined && startSheetViewColumn === undefined) {
            return;
        }
        const { sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } =
            this._scrollManagerService.getCurrentScroll() || {};
        this._commandService.executeCommand(ScrollCommand.id, {
            sheetViewStartRow: startSheetViewRow ?? sheetViewStartRow,
            sheetViewStartColumn: startSheetViewColumn ?? sheetViewStartColumn,
            offsetX: startSheetViewColumn === undefined ? offsetX : 0,
            offsetY: startSheetViewRow === undefined ? offsetY : 0,
        });
    }

    // scroll command -> scroll manager service -> scrollInfo$ -> viewport scroll API
    private _scrollSubscribeBinding() {
        this.disposeWithMe(
            toDisposable(
                this._scrollManagerService.scrollInfo$.subscribe((param) => {
                    const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                    const sheetObject = this._getSheetObject();
                    if (skeleton == null || sheetObject == null) {
                        return;
                    }

                    const scene = sheetObject.scene;

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

                    const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = param;

                    const { startX, startY } = skeleton.getCellByIndexWithNoHeader(
                        sheetViewStartRow,
                        sheetViewStartColumn,
                        scaleX,
                        scaleY
                    );
                    const x = startX + offsetX;
                    const y = startY + offsetY;

                    const config = viewportMain.getBarScroll(x, y);
                    viewportMain.scrollTo(config);
                })
            )
        );
    }

    private _skeletonListener() {
        this.disposeWithMe(
            toDisposable(
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
                })
            )
        );
    }

    private _updateSceneSize(param: ISheetSkeletonManagerParam) {
        if (param == null) {
            return;
        }
        const { skeleton, unitId } = param;

        const scene = this._renderManagerService.getRenderById(unitId)?.scene;

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
