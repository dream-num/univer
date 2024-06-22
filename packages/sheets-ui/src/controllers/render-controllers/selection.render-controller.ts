/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommandInfo, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    RANGE_TYPE,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import type { ISelectionWithCoordAndStyle, ISelectionWithStyle } from '@univerjs/sheets';
import {
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    getPrimaryForRange,
    NORMAL_SELECTION_PLUGIN_NAME,
    ScrollToCellOperation,
    SelectionManagerService,
    SelectionMoveType,
    SetSelectionsOperation,
    SetWorksheetActivateCommand,
    transformCellDataToSelectionData,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { deserializeRangeWithSheet, IDefinedNamesService, isReferenceStrings, operatorToken } from '@univerjs/engine-formula';
import type { ISetZoomRatioOperationParams } from '../../commands/operations/set-zoom-ratio.operation';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import type { ISheetObjectParam } from '../utils/component-tools';
import { getSheetObject } from '../utils/component-tools';

export class SelectionRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        // TODO@wzhudev: it is really necessary to split the selection services?
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._selectionRenderService.changeRuntime(null, null);
        this._selectionRenderService.reset();
        this._selectionManagerService.reset();
    }

    private _init() {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet');
        }
        const sheetObject = this._getSheetObject();

        this._initViewMainListener(sheetObject);
        this._initRowHeader(sheetObject);
        this._initColumnHeader(sheetObject);
        this._initLeftTop(sheetObject);
        this._initSelectionChangeListener();
        this._initThemeChangeListener();
        this._initSkeletonChangeListener();
        this._initCommandListener();
        this._initUserActionSyncListener();
        this._initDefinedNameListener();

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        this._selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId,
            sheetId,
        });
    }

    private _initDefinedNameListener() {
        this.disposeWithMe(
            this._definedNamesService.focusRange$.subscribe(async (item) => {
                if (item == null) {
                    return;
                }

                const { unitId } = item;
                let { formulaOrRefString } = item;

                const workbook = this._context.unit;

                if (unitId !== workbook.getUnitId()) {
                    return;
                }

                if (formulaOrRefString.substring(0, 1) === operatorToken.EQUALS) {
                    formulaOrRefString = formulaOrRefString.substring(1);
                }

                const result = isReferenceStrings(formulaOrRefString);

                if (!result) {
                    return;
                }

                const selections = await this._getSelections(workbook, unitId, formulaOrRefString);

                this._selectionManagerService.replace(selections);

                this._commandService.executeCommand(ScrollToCellOperation.id, selections[0].range);
            })
        );
    }

    private async _getSelections(workbook: Workbook, unitId: string, formulaOrRefString: string) {
        const valueArray = formulaOrRefString.split(',');

        let worksheet = workbook.getActiveSheet();

        if (!worksheet) {
            return [];
        }

        const selections = [];

        for (let i = 0; i < valueArray.length; i++) {
            const refString = valueArray[i].trim();

            const unitRange = deserializeRangeWithSheet(refString.trim());

            if (i === 0) {
                const worksheetCache = workbook.getSheetBySheetName(unitRange.sheetName);
                if (worksheetCache && worksheet.getSheetId() !== worksheetCache.getSheetId()) {
                    worksheet = worksheetCache;
                    await this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        subUnitId: worksheet.getSheetId(),
                        unitId,
                    });
                }
            }

            if (worksheet.getName() !== unitRange.sheetName) {
                continue;
            }

            let primary = null;
            if (i === valueArray.length - 1) {
                const range = unitRange.range;
                const { startRow, startColumn, endRow, endColumn } = range;
                primary = getPrimaryForRange({
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,

                }, worksheet);
            }

            selections.push({
                range: unitRange.range,
                style: getNormalSelectionStyle(this._themeService),
                primary,
            });
        }

        return selections;
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();

        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    private _initViewMainListener(sheetObject: ISheetObjectParam) {
        const { spreadsheet } = sheetObject;

        this.disposeWithMe(
            toDisposable(
                spreadsheet?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                    this._selectionRenderService.enableDetectMergedCell();

                    this._selectionRenderService.eventTrigger(
                        evt,
                        spreadsheet.zIndex + 1,
                        RANGE_TYPE.NORMAL,
                        this._getActiveViewport(evt)
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

                    this._refreshSelection(param);
                })
            )
        );
    }

    private _refreshSelection(params: readonly ISelectionWithStyle[]) {
        const selections = params.map((selectionWithStyle) => {
            const selectionData = this._selectionRenderService.attachSelectionWithCoord(selectionWithStyle);
            selectionData.style = getNormalSelectionStyle(this._themeService);
            return selectionData;
        });

        this._selectionRenderService.updateControlForCurrentByRangeData(selections);
    }

    private _initRowHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetRowHeader, spreadsheet } = sheetObject;

        this.disposeWithMe(
            spreadsheetRowHeader?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                this._selectionRenderService.disableDetectMergedCell();
                this._selectionRenderService.eventTrigger(
                    evt,
                    (spreadsheet?.zIndex || 1) + 1,
                    RANGE_TYPE.ROW,
                    this._getActiveViewport(evt),
                    ScrollTimerType.Y
                );

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );

        // spreadsheetRowHeader?.onPointerMoveObserver.add((evt: IPointerEvent | IMouseEvent, state) => {});
    }

    private _initColumnHeader(sheetObject: ISheetObjectParam) {
        const { spreadsheetColumnHeader, spreadsheet } = sheetObject;

        this.disposeWithMe(
            spreadsheetColumnHeader?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                this._selectionRenderService.disableDetectMergedCell();

                this._selectionRenderService.eventTrigger(
                    evt,
                    (spreadsheet?.zIndex || 1) + 1,
                    RANGE_TYPE.COLUMN,
                    this._getActiveViewport(evt),
                    ScrollTimerType.X
                );

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );
    }

    private _initLeftTop(sheetObject: ISheetObjectParam) {
        const { spreadsheetLeftTopPlaceholder } = sheetObject;
        this.disposeWithMe(
            spreadsheetLeftTopPlaceholder?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                this._selectionRenderService.reset();

                const selectionWithStyle = this._getAllRange(skeleton);

                const selectionData = this._selectionRenderService.attachSelectionWithCoord(selectionWithStyle);
                this._selectionRenderService.addControlToCurrentByRangeData(selectionData);

                this._selectionRenderService.refreshSelectionMoveStart();

                    // this._selectionManagerService.replace([selectionWithStyle]);

                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );
    }

    private _initSelectionChangeListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEndBefore$.subscribe((params) => {
                    this._selectionRenderService.reset();
                    if (params == null) {
                        return;
                    }

                    for (const selectionWithStyle of params) {
                        if (selectionWithStyle == null) {
                            continue;
                        }
                        const selectionData =
                            this._selectionRenderService.attachSelectionWithCoord(selectionWithStyle);
                        this._selectionRenderService.addControlToCurrentByRangeData(selectionData);
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoving$.subscribe((params) => {
                    if (params == null) {
                        return;
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveStart$.subscribe((params) => {
                    if (params == null) {
                        return;
                    }

                    this._syncDefinedNameRange(params);
                })
            )
        );
    }

    private _syncDefinedNameRange(params: ISelectionWithStyle[]) {
        if (params.length === 0) {
            return;
        }
        const lastSelection = params[params.length - 1];

        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        this._definedNamesService.setCurrentRange({
            range: lastSelection.range,
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });
    }

    private _initUserActionSyncListener() {
        this.disposeWithMe(this._selectionRenderService.selectionMoveStart$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVE_START);
        }));

        this.disposeWithMe(this._selectionRenderService.selectionMoving$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVING);
        }));

        this.disposeWithMe(this._selectionRenderService.selectionMoveEnd$.subscribe((params) => {
            this._move(params, SelectionMoveType.MOVE_END);
        }));
    }

    private _move(selectionDataWithStyleList: ISelectionWithCoordAndStyle[], type: SelectionMoveType) {
        const workbook = this._context.unit;
        if (!workbook) return;

        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet()?.getSheetId();
        if (!sheetId) return;

        const current = this._selectionManagerService.getCurrent();

        if (selectionDataWithStyleList == null || selectionDataWithStyleList.length === 0) {
            return;
        }

        this._commandService.executeCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: sheetId,
            type,
            pluginName: current?.pluginName || NORMAL_SELECTION_PLUGIN_NAME,
            selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                convertSelectionDataToRange(selectionDataWithStyle)
            ),
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    private _initCommandListener() {
        const updateCommandList = [SetZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id)) {
                const workbook = this._context.unit;
                const worksheet = workbook.getActiveSheet();

                const params = command.params as ISetZoomRatioOperationParams;
                const { unitId, subUnitId } = params;
                if (!(unitId === workbook.getUnitId() && subUnitId === worksheet?.getSheetId())) {
                    return;
                }

                this._selectionManagerService.refreshSelection();
            }
        }));
    }

    private _initSkeletonChangeListener() {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                this._selectionRenderService.changeRuntime(null, null);
                return;
            }

            const unitId = this._context.unitId;
            const { sheetId, skeleton } = param;
            const { scene } = this._context;

            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

            this._selectionRenderService.changeRuntime(skeleton, scene, viewportMain);

            /**
             * Features like formulas can select ranges across sub-tables.
             *  If the current pluginName is not in a normal state,
             * the current selection will not be refreshed.
             */
            const current = this._selectionManagerService.getCurrent();
            const pluginName = current?.pluginName || NORMAL_SELECTION_PLUGIN_NAME;

            if (current?.unitId === unitId && current.sheetId === sheetId) {
                const currentSelections = this._selectionManagerService.getSelections();
                if (currentSelections != null) {
                    this._refreshSelection(currentSelections);
                }
            } else {
                this._selectionManagerService.setCurrentSelection({
                    pluginName,
                    unitId,
                    sheetId,
                });
            }

            if (pluginName === NORMAL_SELECTION_PLUGIN_NAME) {
                // If there is no initial selection, add one by default in the top left corner.
                const last = this._selectionManagerService.getLast();
                if (last == null) {
                    this._selectionManagerService.add([this._getZeroRange(skeleton)]);
                }
            }
        }));
    }

    private _getAllRange(skeleton: SpreadsheetSkeleton): ISelectionWithStyle {
        return {
            range: {
                startRow: 0,
                startColumn: 0,
                endRow: skeleton.getRowCount() - 1,
                endColumn: skeleton.getColumnCount() - 1,
                rangeType: RANGE_TYPE.ALL,
            },
            primary: this._getZeroRange(skeleton).primary,
            style: null,
        };
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
