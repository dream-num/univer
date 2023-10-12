import { IRenderManagerService, ISelectionTransformerShapeManager } from '@univerjs/base-render';
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
import { ScrollCommand } from '../commands/commands/set-scroll.command';
import { MoveSelectionCommand } from '../commands/commands/set-selections.command';
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
        this._commandExecutedListener();
    }

    private _scrollEventBinding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        viewportMain?.onScrollAfterObserver.add((param) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            if (skeleton == null || param.isTrigger === false) {
                return;
            }

            const sheetObject = this._getSheetObject();
            if (skeleton == null || sheetObject == null) {
                return;
            }

            const scene = sheetObject.scene;

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

            // this._commandService.executeCommand(SetScrollOperation.id, {
            //     sheetViewStartRow: row,
            //     sheetViewStartColumn: column,
            // });
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [MoveSelectionCommand.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    this.scrollToVisible();
                }
            })
        );
    }

    private scrollToVisible() {
        let startSheetViewRow;
        let startSheetViewColumn;
        const selection = this._selectionManagerService.getLast();
        if (selection == null) {
            return;
        }
        const {
            startRow: selectionStartRow,
            startColumn: selectionStartColumn,
            endRow: selectionEndRow,
            endColumn: selectionEndColumn,
        } = selection.range;
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
        let isOverflow = false;
        // top overflow
        if (selectionStartRow <= viewportStartRow) {
            isOverflow = true;
            startSheetViewRow = selectionStartRow;
        }
        // left overflow
        if (selectionStartColumn <= viewportStartColumn) {
            isOverflow = true;
            startSheetViewColumn = selectionStartColumn;
        }
        // bottom overflow
        if (selectionEndRow >= viewportEndRow) {
            isOverflow = true;
            const minRowAccumulation = rowHeightAccumulation[selectionEndRow] - viewport.height!;
            for (let r = viewportStartRow; r <= selectionEndRow; r++) {
                if (rowHeightAccumulation[r] >= minRowAccumulation) {
                    startSheetViewRow = r + 1;
                    break;
                }
            }
        }
        // right overflow
        if (selectionEndColumn >= viewportEndColumn) {
            isOverflow = true;
            const minColumnAccumulation = columnWidthAccumulation[selectionEndColumn] - viewport.width!;
            for (let c = viewportStartColumn; c <= selectionEndColumn; c++) {
                if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                    startSheetViewColumn = c + 1;
                    break;
                }
            }
        }
        if (!isOverflow) {
            return;
        }
        // sheetViewStartRow and sheetViewStartColumn maybe undefined
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        this._commandService.executeCommand(ScrollCommand.id, {
            unitId: workbook.getUnitId(),
            sheetId: workbook.getActiveSheet().getSheetId(),
            sheetViewStartRow: startSheetViewRow,
            sheetViewStartColumn: startSheetViewColumn,
        });
    }

    private _scrollSubscribeBinding() {
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

            const { sheetViewStartRow, sheetViewStartColumn } = param;

            const { tl } = viewportMain.getBounding();

            // if both row and column are defined, we should scroll this cell to the top left corner
            // the scroll position is absolute position
            if (sheetViewStartRow !== undefined && sheetViewStartColumn !== undefined) {
                const { startX, startY } = skeleton.getCellByIndexWithNoHeader(
                    sheetViewStartRow,
                    sheetViewStartColumn,
                    scaleX,
                    scaleY
                );
                const config = viewportMain.getBarScroll(startX, startY);
                viewportMain.scrollTo(config);
            } else {
                const { startX, startY } = skeleton.getCellByIndex(
                    sheetViewStartRow || 0,
                    sheetViewStartColumn || 0,
                    scaleX,
                    scaleY
                );
                // if only column is undefined, we should scroll vertically to the cell
                // the scroll position is relative position
                if (sheetViewStartRow !== undefined) {
                    const offsetY = startY - tl.y;
                    const config = viewportMain.getBarScroll(0, offsetY);
                    viewportMain.scrollBy(config);
                    // if only row is undefined, we should scroll horizontally to the cell
                    // the scroll position is relative position
                } else if (sheetViewStartColumn !== undefined) {
                    const offsetX = startX - tl.x;
                    const config = viewportMain.getBarScroll(offsetX, 0);
                    viewportMain.scrollBy(config);
                }
            }
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
