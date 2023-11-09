import { IMouseEvent, IPointerEvent, IRenderManagerService, SpreadsheetSkeleton } from '@univerjs/base-render';
import {
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetSelectionsOperation,
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    transformCellDataToSelectionData,
} from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ISetZoomRatioOperationParams, SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { VIEWPORT_KEY } from '../common/keys';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject, ISheetObjectParam } from './utils/component-tools';

@OnLifecycle(LifecycleStages.Rendered, SelectionController)
export class SelectionController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService
        private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        // TODO@wzhudev: listen clicking event on the top-left corner to select all cells.

        this._initViewMainListener(sheetObject);
        this._initRowHeader(sheetObject);
        this._initColumnHeader(sheetObject);
        this._initSelectionChangeListener();
        this._initThemeChangeListener();
        this._initSkeletonChangeListener();
        this._initCommandListener();
        this._initUserActionSyncListener();

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _initViewMainListener(sheetObject: ISheetObjectParam) {
        const { spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
                spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                    this._selectionRenderService.enableDetectMergedCell();

                    this._selectionRenderService.eventTrigger(
                        evt,
                        spreadsheet.zIndex + 1,
                        RANGE_TYPE.NORMAL,
                        viewportMain
                    );

                    if (evt.button !== 2) {
                        state.stopPropagation();
                    }
                })
            )
        );
    }

    private _initThemeChangeListener() {
        this.disposeWithMe(
            toDisposable(
                this._themeService.currentTheme$.subscribe(() => {
                    this._selectionRenderService.resetStyle();
                    const param = this._selectionManagerService.getSelections();
                    const current = this._selectionManagerService.getCurrent();
                    if (param == null || current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }
                    this._selectionRenderService.reset();
                    for (const selectionWithStyle of param) {
                        if (selectionWithStyle == null) {
                            continue;
                        }
                        const selectionData =
                            this._selectionRenderService.convertSelectionRangeToData(selectionWithStyle);
                        selectionData.style = getNormalSelectionStyle(this._themeService);
                        this._selectionRenderService.addControlToCurrentByRangeData(selectionData);
                    }
                })
            )
        );
    }

    private _initRowHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
                spreadsheetRowHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                    this._selectionRenderService.disableDetectMergedCell();
                    this._selectionRenderService.eventTrigger(
                        evt,
                        (spreadsheet?.zIndex || 1) + 1,
                        RANGE_TYPE.ROW,
                        viewportMain
                    );
                    if (evt.button !== 2) {
                        state.stopPropagation();
                    }
                })
            )
        );

        // spreadsheetRowHeader?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {});
    }

    private _initColumnHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetColumnHeader, spreadsheet, scene } = sheetObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        this.disposeWithMe(
            toDisposable(
                spreadsheetColumnHeader?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                    this._selectionRenderService.disableDetectMergedCell();
                    this._selectionRenderService.eventTrigger(
                        evt,
                        (spreadsheet?.zIndex || 1) + 1,
                        RANGE_TYPE.COLUMN,
                        viewportMain
                    );
                    if (evt.button !== 2) {
                        state.stopPropagation();
                    }
                })
            )
        );
    }

    private _initSelectionChangeListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe((param) => {
                    this._selectionRenderService.reset();
                    if (param == null) {
                        return;
                    }

                    for (const selectionWithStyle of param) {
                        if (selectionWithStyle == null) {
                            continue;
                        }
                        const selectionData =
                            this._selectionRenderService.convertSelectionRangeToData(selectionWithStyle);
                        this._selectionRenderService.addControlToCurrentByRangeData(selectionData);
                    }
                })
            )
        );
    }

    private _initUserActionSyncListener() {
        this._selectionRenderService.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const unitId = workbook.getUnitId();
            const sheetId = workbook.getActiveSheet().getSheetId();
            const current = this._selectionManagerService.getCurrent();

            if (selectionDataWithStyleList == null || selectionDataWithStyleList.length === 0) {
                return;
            }

            this._commandService.executeCommand(SetSelectionsOperation.id, {
                unitId,
                sheetId,
                pluginName: current?.pluginName || NORMAL_SELECTION_PLUGIN_NAME,
                selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                    convertSelectionDataToRange(selectionDataWithStyle)
                ),
            });
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _initCommandListener() {
        const updateCommandList = [SetZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const worksheet = workbook.getActiveSheet();

                    const params = command.params as ISetZoomRatioOperationParams;
                    const { workbookId, worksheetId } = params;
                    if (!(workbookId === workbook.getUnitId() && worksheetId === worksheet.getSheetId())) {
                        return;
                    }

                    this._selectionManagerService.refreshSelection();
                }
            })
        );
    }

    private _initSkeletonChangeListener() {
        this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId, sheetId, skeleton } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { scene } = currentRender;

            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

            this._selectionRenderService.changeRuntime(skeleton, scene, viewportMain);

            this._selectionManagerService.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId,
                sheetId,
            });

            // If there is no initial selection, add one by default in the top left corner.
            const last = this._selectionManagerService.getLast();
            if (last == null) {
                this._selectionManagerService.add([this._getZeroRange(skeleton)]);
            }
        });
    }

    private _getZeroRange(skeleton: SpreadsheetSkeleton) {
        const mergeData = skeleton.mergeData;
        return (
            transformCellDataToSelectionData(0, 0, mergeData) || {
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                },
                primary: {
                    actualRow: 0,
                    actualColumn: 0,
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            }
        );
    }
}
