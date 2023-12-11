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

import type { ICellData, ICellDataForSheetInterceptor, IRange } from '@univerjs/core';
import {
    CellValueType,
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    ObjectMatrix,
    OnLifecycle,
    Range,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import {
    ClearSelectionAllCommand,
    ClearSelectionFormatCommand,
    factoryRemoveNumfmtUndoMutation,
    INTERCEPTOR_POINT,
    INumfmtService,
    rangeMerge,
    RemoveNumfmtMutation,
    SelectionManagerService,
    SetNumfmtMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { combineLatest, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { SHEET_NUMFMT_PLUGIN } from '../base/const/PLUGIN_NAME';
import { AddDecimalCommand } from '../commands/commands/add.decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set.currency.command';
import type { ISetNumfmtCommandParams } from '../commands/commands/set.numfmt.command';
import { SetNumfmtCommand } from '../commands/commands/set.numfmt.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract.decimal.command';
import { CloseNumfmtPanelOperator } from '../commands/operators/close.numfmt.panel.operator';
import { OpenNumfmtPanelOperator } from '../commands/operators/open.numfmt.panel.operator';
import type { ISheetNumfmtPanelProps } from '../components/index';
import { SheetNumfmtPanel } from '../components/index';
import { zhCN } from '../locale';
import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, SubtractDecimalMenuItem } from '../menu/menu';
import { getPatternPreview, getPatternType } from '../utils/pattern';
import type { INumfmtController } from './type';

@OnLifecycle(LifecycleStages.Rendered, NumfmtController)
export class NumfmtController extends Disposable implements INumfmtController {
    /**
     * If _previewPattern is null ,the realTimeRenderingInterceptor will skip and if it is '',realTimeRenderingInterceptor will clear numfmt.
     * @private
     * @type {(string | null)}
     * @memberof NumfmtController
     */
    private _previewPattern: string | null = '';
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ICommandService) private _commandService: ICommandService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService,
        @Inject(ISidebarService) private _sidebarService: ISidebarService,
        @Inject(LocaleService) private _localeService: LocaleService
    ) {
        super();
        this._initInterceptorCommands();
        this._initRealTimeRenderingInterceptor();
        this._initPanel();
        this._initCommands();
        this._commandExecutedListener();
        this._initMenu();
        this._initInterceptorCellContent();
        this._initLocal();
    }

    openPanel = () => {
        const sidebarService = this._sidebarService;
        const selectionManagerService = this._selectionManagerService;
        const commandService = this._commandService;
        const univerInstanceService = this._univerInstanceService;
        const numfmtService = this._numfmtService;
        const localeService = this._localeService;

        const selections = selectionManagerService.getSelectionRanges() || [];
        const range = selections[0];

        if (!range) {
            return false;
        }
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();

        const cellValue = sheet.getCellRaw(range.startRow, range.startColumn);
        const numfmtValue = numfmtService.getValue(
            workbook.getUnitId(),
            sheet.getSheetId(),
            range.startRow,
            range.startColumn
        );
        let pattern = '';
        if (numfmtValue) {
            pattern = numfmtValue.pattern;
        }
        // eslint-disable-next-line no-magic-numbers
        const defaultValue = (cellValue?.t === CellValueType.NUMBER ? cellValue.v : 12345678) as number;

        const props: ISheetNumfmtPanelProps = {
            onChange: (config) => {
                if (config.type === 'change') {
                    this._previewPattern = config.value;
                    this._sheetSkeletonManagerService.reCalculate();
                    this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
                } else if (config.type === 'confirm') {
                    const selections = selectionManagerService.getSelectionRanges() || [];
                    const params: ISetNumfmtCommandParams = { values: [] };
                    const patternType = getPatternType(config.value);
                    selections.forEach((rangeInfo) => {
                        Range.foreach(rangeInfo, (row, col) => {
                            params.values.push({
                                row,
                                col,
                                pattern: config.value,
                                type: patternType,
                            });
                        });
                    });
                    commandService.executeCommand(SetNumfmtCommand.id, params);
                    sidebarService.close();
                } else if (config.type === 'cancel') {
                    sidebarService.close();
                }
            },
            value: { defaultPattern: pattern, defaultValue, row: range.startRow, col: range.startColumn },
        };

        sidebarService.open({
            header: { title: localeService.t('sheet.numfmt.title') },
            children: {
                label: SHEET_NUMFMT_PLUGIN,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(props as any), // need passthrough to react props.
            },
            onClose: () => {
                this._sheetSkeletonManagerService.reCalculate();
                this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
                commandService.executeCommand(CloseNumfmtPanelOperator.id);
            },
        });
    };

    private _initCommands() {
        [
            AddDecimalCommand,
            SubtractDecimalCommand,
            SetCurrencyCommand,
            OpenNumfmtPanelOperator,
            CloseNumfmtPanelOperator,
            SetNumfmtCommand,
        ].forEach((config) => {
            this.disposeWithMe(this._commandService.registerCommand(config));
        });
    }

    private _initPanel() {
        this._componentManager.register(SHEET_NUMFMT_PLUGIN, SheetNumfmtPanel);
    }
    private _initLocal = () => {
        this._localeService.load({ zhCN });
    };

    private _initMenu() {
        [AddDecimalMenuItem, SubtractDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem]
            .map((factory) => factory(this._componentManager))
            .forEach((configFactory) => {
                this.disposeWithMe(this._menuService.addMenuItem(configFactory(this._injector)));
            });
    }

    private _initInterceptorCommands() {
        const self = this;
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations(command) {
                    switch (command.id) {
                        case ClearSelectionAllCommand.id:
                        case ClearSelectionFormatCommand.id: {
                            const workbookId = self._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                            const worksheetId = self._univerInstanceService
                                .getCurrentUniverSheetInstance()
                                .getActiveSheet()
                                .getSheetId();
                            const selections = self._selectionManagerService.getSelectionRanges();
                            if (!selections?.length) {
                                break;
                            }
                            const redos: IRemoveNumfmtMutationParams = {
                                workbookId,
                                worksheetId,
                                ranges: [],
                            };
                            const numfmtModel = self._numfmtService.getModel(workbookId, worksheetId);
                            selections.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    if (numfmtModel?.getValue(row, col)) {
                                        redos.ranges.push({
                                            startColumn: col,
                                            endColumn: col,
                                            startRow: row,
                                            endRow: row,
                                        });
                                    }
                                });
                            });
                            redos.ranges = rangeMerge(redos.ranges);
                            const undos = factoryRemoveNumfmtUndoMutation(self._injector, redos);
                            return {
                                redos: [{ id: RemoveNumfmtMutation.id, params: redos }],
                                undos,
                            };
                        }
                    }
                    return {
                        redos: [],
                        undos: [],
                    };
                },
            })
        );
    }

    private _initInterceptorCellContent() {
        const renderCache = new ObjectMatrix<{ result: ICellData; parameters: string | number }>();
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                handler: (cell, location, next) => {
                    const workbookId = location.workbookId;
                    const sheetId = location.worksheetId;
                    const numfmtValue = this._numfmtService.getValue(workbookId, sheetId, location.row, location.col);
                    if (!numfmtValue) {
                        return next(cell);
                    }
                    const originCellValue = cell;
                    if (!originCellValue) {
                        return next(cell);
                    }
                    // just handle number
                    if (originCellValue.t !== CellValueType.NUMBER) {
                        return next(cell);
                    }

                    let numfmtRes: string = '';
                    const cache = renderCache.getValue(location.row, location.col);
                    if (cache && cache.parameters === originCellValue.v) {
                        return { ...cell, ...cache.result };
                    }

                    const info = getPatternPreview(numfmtValue.pattern, Number(originCellValue.v));

                    numfmtRes = info.result;

                    if (!numfmtRes) {
                        return next(cell);
                    }

                    const res: ICellDataForSheetInterceptor = { v: numfmtRes };

                    if (info.color) {
                        const color = this._themeService.getCurrentTheme()[`${info.color}500`];

                        if (color) {
                            res.interceptorStyle = { cl: { rgb: color } };
                        }
                    }

                    renderCache.setValue(location.row, location.col, {
                        result: res,
                        parameters: originCellValue.v as number,
                    });

                    return { ...cell, ...res };
                },
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetNumfmtMutation.id) {
                    const params = commandInfo.params as ISetNumfmtMutationParams;
                    Object.keys(params.values).forEach((key) => {
                        const v = params.values[key];
                        v.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                renderCache.realDeleteValue(row, col);
                            });
                        });
                    });
                }
            })
        );
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$
                    .pipe(
                        map((skeleton) => skeleton?.sheetId),
                        distinctUntilChanged()
                    )
                    .subscribe(() => {
                        renderCache.reset();
                    })
            )
        );
    }

    private _initRealTimeRenderingInterceptor() {
        const isPanelOpenObserver = new Observable<boolean>((subscribe) => {
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === OpenNumfmtPanelOperator.id) {
                    subscribe.next(true);
                }
                if (commandInfo.id === CloseNumfmtPanelOperator.id) {
                    subscribe.next(false);
                }
            });
        });
        const combineOpenAndSelection$ = combineLatest([
            isPanelOpenObserver,
            this._selectionManagerService.selectionMoveEnd$.pipe(
                map((selectionInfos) => {
                    if (!selectionInfos) {
                        return [];
                    }
                    return selectionInfos.map((selectionInfo) => selectionInfo.range);
                })
            ),
        ]);
        this.disposeWithMe(
            toDisposable(
                combineOpenAndSelection$
                    .pipe(
                        switchMap(
                            ([isOpen, selectionRanges]) =>
                                new Observable<{
                                    disposableCollection: DisposableCollection;
                                    selectionRanges: IRange[];
                                }>((subscribe) => {
                                    const disposableCollection = new DisposableCollection();
                                    isOpen &&
                                        selectionRanges.length &&
                                        subscribe.next({ selectionRanges, disposableCollection });
                                    return () => {
                                        disposableCollection.dispose();
                                    };
                                })
                        ),
                        tap(() => {
                            this._previewPattern = null;
                        })
                    )
                    .subscribe(({ disposableCollection, selectionRanges }) => {
                        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                        this.openPanel();
                        disposableCollection.add(
                            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                                priority: 99,
                                handler: (cell, location, next) => {
                                    const { row, col } = location;
                                    if (
                                        selectionRanges.find(
                                            (range) =>
                                                range.startColumn <= col &&
                                                range.endColumn >= col &&
                                                range.startRow <= row &&
                                                range.endRow >= row
                                        )
                                    ) {
                                        const rawValue = location.worksheet.getCellRaw(row, col);
                                        const value = rawValue?.v;
                                        const type = rawValue?.t;
                                        if (
                                            value === undefined ||
                                            value === null ||
                                            type !== CellValueType.NUMBER ||
                                            this._previewPattern === null
                                        ) {
                                            return next(cell);
                                        }
                                        const info = getPatternPreview(this._previewPattern, value as number);
                                        if (info.color) {
                                            const colorMap = this._themeService.getCurrentTheme();
                                            const color = colorMap[`${info.color}500`];
                                            return {
                                                ...cell,
                                                v: info.result,
                                                t: CellValueType.STRING,
                                                s: { cl: { rgb: color } },
                                            };
                                        }
                                        return {
                                            ...cell,
                                            v: info.result,
                                            t: CellValueType.STRING,
                                        };
                                    }
                                    return next(cell);
                                },
                            })
                        );
                        this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
                    })
            )
        );
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            toDisposable(
                merge(
                    new Observable<string>((subscribe) => {
                        const disposable = this._commandService.onCommandExecuted((command) => {
                            if (SetNumfmtMutation.id === command.id) {
                                const params = command.params as ISetNumfmtMutationParams;
                                subscribe.next(params.workbookId);
                            }
                        });
                        return () => {
                            disposable.dispose();
                        };
                    }),
                    this._numfmtService.modelReplace$
                )
                    .pipe(debounceTime(16))
                    .subscribe((workbookId) => {
                        this._sheetSkeletonManagerService.reCalculate();
                        this._renderManagerService.getRenderById(workbookId)?.mainComponent?.makeDirty();
                    })
            )
        );
    }
}
