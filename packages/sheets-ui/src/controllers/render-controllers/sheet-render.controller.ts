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

import type { EventState, ICommandInfo, IRange, Workbook, Worksheet } from '@univerjs/core';
import { CommandType, ICommandService, Rectangle, RxDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IViewportInfos, IWheelEvent, Scene } from '@univerjs/engine-render';
import {
    Layer,
    PointerInput,
    Rect,
    RENDER_CLASS_TYPE,
    ScrollBar,
    SHEET_VIEWPORT_KEY,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Viewport,
} from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { COMMAND_LISTENER_SKELETON_CHANGE, COMMAND_LISTENER_VALUE_CHANGE, MoveRangeMutation, SetRangeValuesMutation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { SetScrollRelativeCommand } from '../../commands/commands/set-scroll.command';

import {
    SHEET_COMPONENT_HEADER_LAYER_INDEX,
    SHEET_COMPONENT_MAIN_LAYER_INDEX,
    SHEET_VIEW_KEY,
} from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { SheetsRenderService } from '../../services/sheets-render.service';

interface ISetWorksheetMutationParams {
    unitId: string;
    subUnitId: string;
}

export class SheetRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsRenderService) private readonly _sheetRenderService: SheetsRenderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._addNewRender(this._context.unit);
    }

    private _addNewRender(workbook: Workbook) {
        const { scene, engine } = this._context;

        scene.addLayer(new Layer(scene, [], 0), new Layer(scene, [], 2));

        this._addComponent(workbook);
        this._initRerenderScheduler();
        this._initCommandListener();

        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        const sheetId = worksheet.getSheetId();
        this._sheetSkeletonManagerService.setCurrent({ sheetId });
        const should = workbook.getShouldRenderLoopImmediately();
        if (should) {
            engine.runRenderLoop(() => scene.render());
        }
    }

    private _addComponent(workbook: Workbook) {
        const { scene, components } = this._context;

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN);

        this._addViewport(worksheet);

        const spreadsheetRowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW);
        const spreadsheetColumnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            fill: 'rgb(248, 249, 250)',
            stroke: 'rgb(217, 217, 217)',
            strokeWidth: 1,
        });

        this._context.mainComponent = spreadsheet;
        components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        components.set(SHEET_VIEW_KEY.ROW, spreadsheetRowHeader);
        components.set(SHEET_VIEW_KEY.COLUMN, spreadsheetColumnHeader);
        components.set(SHEET_VIEW_KEY.LEFT_TOP, SpreadsheetLeftTopPlaceholder);

        scene.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects(
            [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );

        scene.enableLayerCache(SHEET_COMPONENT_MAIN_LAYER_INDEX, SHEET_COMPONENT_HEADER_LAYER_INDEX);
    }

    // eslint-disable-next-line max-lines-per-function
    private _initViewports(scene: Scene, rowHeader: { width: number }, columnHeader: { height: number }) {
        const bufferEdgeX = 100;
        const bufferEdgeY = 100;
        // window.sc = scene;
        const viewMain = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: rowHeader.width,
            top: columnHeader.height,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
            isRelativeX: true,
            isRelativeY: true,
            allowCache: true,
            bufferEdgeX,
            bufferEdgeY,
        });
        const viewMainLeftTop = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: false,
            isRelativeY: false,
            allowCache: true,
            bufferEdgeX: 0,
            bufferEdgeY: 0,
        });

        const viewMainLeft = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: false,
            isRelativeY: true,
            allowCache: true,
            bufferEdgeX: 0,
            bufferEdgeY,
        });

        const viewMainTop = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, scene, {
            isWheelPreventDefaultX: true,
            active: false,
            isRelativeX: true,
            isRelativeY: false,
            allowCache: true,
            bufferEdgeX,
            bufferEdgeY: 0,
        });

        const viewRowTop = new Viewport(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP, scene, {
            active: false,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        const viewRowBottom = new Viewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, scene, {
            left: 0,
            top: columnHeader.height,
            bottom: 0,
            width: rowHeader.width,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: true,
        });

        const viewColumnLeft = new Viewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT, scene, {
            active: false,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        const viewColumnRight = new Viewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, scene, {
            left: rowHeader.width,
            top: 0,
            height: columnHeader.height,
            right: 0,
            isWheelPreventDefaultX: true,
            isRelativeX: true,
            isRelativeY: false,
        });

        const viewLeftTop = new Viewport(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP, scene, {
            left: 0,
            top: 0,
            width: rowHeader.width,
            height: columnHeader.height,
            isWheelPreventDefaultX: true,
            isRelativeX: false,
            isRelativeY: false,
        });

        return {
            viewMain,
            viewLeftTop,
            viewMainLeftTop,
            viewMainLeft,
            viewMainTop,
            viewColumnLeft,
            viewRowTop,
            viewRowBottom,
            viewColumnRight,
        };
    }

    /**
     *
     * initViewport & wheel event
     * +-----------------+--------------------+-------------------+
     * |  VIEW_LEFT_TOP  |  VIEW_COLUMN_LEFT  | VIEW_COLUMN_RIGHT |
     * +-----------------+--------------------+-------------------+
     * |  VIEW_ROW_TOP   | VIEW_MAIN_LEFT_TOP |   VIEW_MAIN_TOP   |
     * +-----------------+--------------------+-------------------+
     * | VIEW_ROW_BOTTOM |   VIEW_MAIN_LEFT   |     VIEW_MAIN     |
     * +-----------------+--------------------+-------------------+
     */

    private _addViewport(worksheet: Worksheet) {
        const scene = this._context.scene;
        if (scene == null) {
            return;
        }
        const { rowHeader, columnHeader } = worksheet.getConfig();
        const { viewMain } = this._initViewports(scene, rowHeader, columnHeader);

        this._initMouseWheel(scene, viewMain);
        const _scrollBar = new ScrollBar(viewMain);

        scene.attachControl();

        return viewMain;
    }

    private _initRerenderScheduler(): void {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (!param) return null;

            const { skeleton: spreadsheetSkeleton, sheetId } = param;
            const workbook = this._context.unit;
            const worksheet = workbook?.getSheetBySheetId(sheetId);
            if (workbook == null || worksheet == null) return;

            const { mainComponent, components } = this._context;
            const spreadsheet = mainComponent as Spreadsheet;
            const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
            const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
            const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP) as Rect;
            const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

            spreadsheet?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
            spreadsheetLeftTopPlaceholder?.transformByState({
                width: rowHeaderWidth,
                height: columnHeaderHeight,
            });
        }));
    }

    private _initCommandListener(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            const workbook = this._context.unit;
            const unitId = workbook.getUnitId();
            if (COMMAND_LISTENER_SKELETON_CHANGE.includes(command.id) || this._sheetRenderService.checkMutationShouldTriggerRerender(command.id)) {
                const worksheet = workbook.getActiveSheet();
                if (!worksheet) return;

                const sheetId = worksheet.getSheetId();
                const params = command.params;
                const { unitId, subUnitId } = params as ISetWorksheetMutationParams;

                if ((unitId !== workbook.getUnitId() && subUnitId !== worksheet.getSheetId())) {
                    return;
                }

                if (command.id !== SetWorksheetActiveOperation.id) {
                    this._sheetSkeletonManagerService.makeDirty({
                        sheetId,
                        commandId: command.id,
                    }, true);
                }

                // Change the skeleton to render when the sheet is changed.
                // Should also check the init sheet.
                // setCurrent ---> currentSkeletonBefore$ ---> zoom.controller.subscribe ---> scene._setTransForm --->  viewports markDirty
                // setCurrent ---> currentSkeleton$ ---> scroll.controller.subscribe ---> scene?.transformByState ---> scene._setTransFor
                this._sheetSkeletonManagerService.setCurrent({
                    sheetId,
                    commandId: command.id,
                });
            } else if (COMMAND_LISTENER_VALUE_CHANGE.includes(command.id)) {
                this._sheetSkeletonManagerService.reCalculate();
            }

            if (command.type === CommandType.MUTATION) {
                this._markUnitDirty(unitId, command);
            }
        }));
    }

    private _markUnitDirty(unitId: string, command: ICommandInfo) {
        const { mainComponent: spreadsheet, scene } = this._context;
        // 现在 spreadsheet.markDirty 会调用 vport.markDirty
        // 因为其他 controller 中存在 mainComponent?.makeDirty() 的调用, 不止是 sheet-render.controller 在标脏
        if (spreadsheet) {
            spreadsheet.makeDirty(); // refresh spreadsheet
        }

        scene.makeDirty();
        if (!command.params) return;

        const cmdParams = command.params as Record<string, any>;
        const viewports = this._spreadsheetViewports(scene);
        if (command.id === SetRangeValuesMutation.id && cmdParams.cellValue) {
            const dirtyRange: IRange = this._cellValueToRange(cmdParams.cellValue);
            const dirtyBounds = this._rangeToBounds([dirtyRange]);
            this._markViewportDirty(viewports, dirtyBounds);
            (spreadsheet as unknown as Spreadsheet).setDirtyArea(dirtyBounds);
        }

        if (command.id === MoveRangeMutation.id && cmdParams.from && cmdParams.to) {
            const fromRange = this._cellValueToRange(cmdParams.from.value);
            const toRange = this._cellValueToRange(cmdParams.to.value);
            const dirtyBounds = this._rangeToBounds([fromRange, toRange]);
            this._markViewportDirty(viewports, dirtyBounds);
            (spreadsheet as unknown as Spreadsheet).setDirtyArea(dirtyBounds);
        }
    }

    /**
     * cellValue data structure:
     * {[row]: { [col]: value}}
     * @param cellValue
     * @returns
     */
    private _cellValueToRange(cellValue: Record<number, Record<number, object>>) {
        const rows = Object.keys(cellValue).map(Number);
        const columns = [];

        for (const [_row, columnObj] of Object.entries(cellValue)) {
            for (const column in columnObj) {
                columns.push(Number(column));
            }
        }

        const startRow = Math.min(...rows);
        const endRow = Math.max(...rows);
        const startColumn = Math.min(...columns);
        const endColumn = Math.max(...columns);

        return {
            startRow,
            endRow,
            startColumn,
            endColumn,
        } as IRange;
    }

    private _rangeToBounds(ranges: IRange[]) {
        const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
        const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } = skeleton;

        // rowHeightAccumulation 已经表示的是行底部的高度
        const dirtyBounds: IViewportInfos[] = [];
        for (const r of ranges) {
            const { startRow, endRow, startColumn, endColumn } = r;
            const top = startRow === 0 ? 0 : rowHeightAccumulation[startRow - 1] + columnHeaderHeight;
            const bottom = rowHeightAccumulation[endRow] + columnHeaderHeight;
            const left = startColumn === 0 ? 0 : columnWidthAccumulation[startColumn - 1] + rowHeaderWidth;
            const right = columnWidthAccumulation[endColumn] + rowHeaderWidth;
            dirtyBounds.push({ top, left, bottom, right, width: right - left, height: bottom - top });
        }
        return dirtyBounds;
    }

    private _markViewportDirty(viewports: Viewport[], dirtyBounds: IViewportInfos[]) {
        const activeViewports = viewports.filter((vp) => vp.isActive && vp.cacheBound);
        for (const vp of activeViewports) {
            for (const b of dirtyBounds) {
                if (Rectangle.hasIntersectionBetweenTwoRect(vp.cacheBound!, b)) {
                    vp.markDirty(true);
                }
            }
        }
    }

    private _spreadsheetViewports(scene: Scene) {
        return scene.getViewports().filter((v) => ['viewMain', 'viewMainLeftTop', 'viewMainTop', 'viewMainLeft'].includes(v.viewportKey));
    }

    // eslint-disable-next-line max-lines-per-function
    private _initMouseWheel(scene: Scene, viewMain: Viewport) {
        this.disposeWithMe(
            scene.onMouseWheel$.subscribeEvent((evt: IWheelEvent, state: EventState) => {
                if (evt.ctrlKey) {
                    return;
                }

                let offsetX = 0;
                let offsetY = 0;

                const isLimitedStore = viewMain.limitedScroll();
                if (evt.inputIndex === PointerInput.MouseWheelX) {
                    const deltaFactor = Math.abs(evt.deltaX);
                        // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
                    const scrollNum = deltaFactor;
                        // 展示更多右侧内容，evt.deltaX > 0
                        // 展示更多左侧内容, evt.deltaX < 0
                    if (evt.deltaX > 0) {
                        offsetX = scrollNum;
                    } else {
                        offsetX = -scrollNum;
                    }
                    this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetX });

                        // 临界点时执行浏览器行为
                    if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                        if (!isLimitedStore?.isLimitedX) {
                            state.stopPropagation();
                        }
                    } else if (viewMain.isWheelPreventDefaultX) {
                        evt.preventDefault();
                    } else if (!isLimitedStore?.isLimitedX) {
                        evt.preventDefault();
                    }
                }
                if (evt.inputIndex === PointerInput.MouseWheelY) {
                    const deltaFactor = Math.abs(evt.deltaY);
                        // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
                    let scrollNum = deltaFactor;
                    if (evt.shiftKey) {
                        scrollNum *= 3;
                        if (evt.deltaY > 0) {
                            offsetX = scrollNum;
                        } else {
                            offsetX = -scrollNum;
                        }
                        this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetX });

                            // 临界点时执行浏览器行为
                        if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                            if (!isLimitedStore?.isLimitedX) {
                                state.stopPropagation();
                            }
                        } else if (viewMain.isWheelPreventDefaultX) {
                            evt.preventDefault();
                        } else if (!isLimitedStore?.isLimitedX) {
                            evt.preventDefault();
                        }
                    } else {
                        if (evt.deltaY > 0) {
                            offsetY = scrollNum;
                        } else {
                            offsetY = -scrollNum;
                        }
                        this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY });

                            // 临界点时执行浏览器行为
                        if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                            if (!isLimitedStore?.isLimitedY) {
                                state.stopPropagation();
                            }
                        } else if (viewMain.isWheelPreventDefaultY) {
                            evt.preventDefault();
                        } else if (!isLimitedStore?.isLimitedY) {
                            evt.preventDefault();
                        }
                    }
                }

                this._context.scene.makeDirty(true);
            })
        );
    }
}
