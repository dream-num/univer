import { IMouseEvent, IPointerEvent, IRenderManagerService } from '@univerjs/base-render';
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

import { getSheetObject, ISheetObjectParam } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/Const/DEFAULT_SPREADSHEET_VIEW';
import { convertSelectionDataToRange, getNormalSelectionStyle } from '../Basics/selection';
import { SetSelectionsOperation } from '../commands/operations/selection.operation';
import { ISetZoomRatioOperationParams, SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../services/selection/selection-manager.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

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

        const { spreadsheetLeftTopPlaceholder } = sheetObject;

        this._onChangeListener();

        this._initialMain(sheetObject);

        this._themeChangeListener();

        this._initialRowHeader(sheetObject);

        this._initialColumnHeader(sheetObject);

        this._skeletonListener();

        this._commandExecutedListener();

        this.disposeWithMe(toDisposable(spreadsheetLeftTopPlaceholder?.onPointerDownObserver.add(() => {})));

        this._userActionSyncListener();

        const unitId = workbook.getUnitId();

        const sheetId = worksheet.getSheetId();

        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _initialMain(sheetObject: ISheetObjectParam) {
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

    private _themeChangeListener() {
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

    private _initialRowHeader(sheetObject: ISheetObjectParam) {
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

    private _initialColumnHeader(sheetObject: ISheetObjectParam) {
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

    private _onChangeListener() {
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

    private _userActionSyncListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionRangeWithStyle$.subscribe((selectionDataWithStyleList) => {
                    const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
                    const unitId = workbook.getUnitId();
                    const sheetId = workbook.getActiveSheet().getSheetId();

                    this._commandService.executeCommand(SetSelectionsOperation.id, {
                        unitId,
                        sheetId,
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                            convertSelectionDataToRange(selectionDataWithStyle)
                        ),
                    });
                })
            )
        );
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {
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

    private _skeletonListener() {
        this.disposeWithMe(
            toDisposable(
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
                })
            )
        );
    }
}
