import { IRenderManagerService } from '@univerjs/base-render';
import type { ISetNumfmtMutationParams } from '@univerjs/base-sheets';
import {
    ClearSelectionAllCommand,
    ClearSelectionFormatCommand,
    factorySetNumfmtUndoMutation,
    INumfmtService,
    SelectionManagerService,
    SetNumfmtMutation,
} from '@univerjs/base-sheets';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/base-ui';
import type { ICellData, IMutationInfo, IRange } from '@univerjs/core';
import {
    CellValueType,
    Disposable,
    DisposableCollection,
    ICommandService,
    INTERCEPTOR_POINT,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    OnLifecycle,
    Range,
    Rectangle,
    SheetInterceptorService,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import type { IAutoFillHook } from '@univerjs/ui-plugin-sheets';
import { APPLY_TYPE, getRepeatRange, IAutoFillService, SheetSkeletonManagerService } from '@univerjs/ui-plugin-sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { combineLatest, Observable } from 'rxjs';
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
import { zhCn } from '../locale/zh-CN';
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
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(IAutoFillService) private _autoFillService: IAutoFillService
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
        this._initAutoFill();
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
                commandService.executeCommand(CloseNumfmtPanelOperator.id);
            },
        });
    };

    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });
        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange
        ) => {
            const workbookId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const worksheetId = this._univerInstanceService
                .getCurrentUniverSheetInstance()
                .getActiveSheet()
                .getSheetId();
            const sourceRange = {
                startRow: sourceStartCell.row,
                startColumn: sourceStartCell.col,
                endColumn: sourceStartCell.col,
                endRow: sourceStartCell.row,
            };
            const targetRange = {
                startRow: targetStartCell.row,
                startColumn: targetStartCell.col,
                endColumn: targetStartCell.col,
                endRow: targetStartCell.row,
            };

            const values: ISetNumfmtMutationParams['values'] = [];

            Range.foreach(relativeRange, (row, col) => {
                const sourcePositionRange = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        startColumn: col,
                        endColumn: col,
                        endRow: row,
                    },
                    sourceRange
                );
                const oldNumfmtValue = this._numfmtService.getValue(
                    workbookId,
                    worksheetId,
                    sourcePositionRange.startRow,
                    sourcePositionRange.startColumn
                );
                if (oldNumfmtValue) {
                    const targetPositionRange = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            startColumn: col,
                            endColumn: col,
                            endRow: row,
                        },
                        targetRange
                    );
                    values.push({
                        pattern: oldNumfmtValue.pattern,
                        type: oldNumfmtValue.type,
                        row: targetPositionRange.startRow,
                        col: targetPositionRange.startColumn,
                    });
                }
            });
            if (values.length) {
                const redo: IMutationInfo<ISetNumfmtMutationParams> = {
                    id: SetNumfmtMutation.id,
                    params: {
                        values,
                        workbookId,
                        worksheetId,
                    },
                };
                const undo = {
                    id: SetNumfmtMutation.id,
                    params: {
                        values: factorySetNumfmtUndoMutation(this._injector, redo.params),
                        workbookId,
                        worksheetId,
                    },
                };
                return {
                    redos: [redo],
                    undos: [undo],
                };
            }
            return { redos: [], undos: [] };
        };
        const generalApplyFunc = (sourceRange: IRange, targetRange: IRange) => {
            const totalUndos: IMutationInfo[] = [];
            const totalRedos: IMutationInfo[] = [];
            const sourceStartCell = {
                row: sourceRange.startRow,
                col: sourceRange.startColumn,
            };
            const repeats = getRepeatRange(sourceRange, targetRange);
            repeats.forEach((repeat) => {
                const { undos, redos } = loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange);
                totalUndos.push(...undos);
                totalRedos.push(...redos);
            });
            return {
                undos: totalUndos,
                redos: totalRedos,
            };
        };
        const hook: IAutoFillHook = {
            hookName: SHEET_NUMFMT_PLUGIN,
            hook: {
                [APPLY_TYPE.COPY]: generalApplyFunc,
                [APPLY_TYPE.NO_FORMAT]: noopReturnFunc,
                [APPLY_TYPE.ONLY_FORMAT]: generalApplyFunc,
                [APPLY_TYPE.SERIES]: generalApplyFunc,
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }

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
        this._localeService.load({ [LocaleType.ZH_CN]: zhCn, [LocaleType.EN_US]: zhCn });
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
                            const redos: ISetNumfmtMutationParams = {
                                workbookId,
                                worksheetId,
                                values: [],
                            };
                            selections.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    redos.values.push({
                                        row,
                                        col,
                                    });
                                });
                            });
                            const undos = factorySetNumfmtUndoMutation(self._injector, redos);
                            return {
                                redos: [{ id: SetNumfmtMutation.id, params: redos }],
                                undos: [{ id: SetNumfmtMutation.id, params: undos }],
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
                    const originCellValue = location.worksheet.getCellRaw(location.row, location.col);
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

                    const res: ICellData = { v: numfmtRes };

                    if (info.color) {
                        const color = this._themeService.getCurrentTheme()[`${info.color}500`];

                        if (color) {
                            res.s = { cl: { rgb: color } };
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
                    params.values
                        .map((value) => ({ row: value.row, col: value.col }))
                        .forEach(({ row, col }) => {
                            renderCache.realDeleteValue(row, col);
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
            this._selectionManagerService.selectionInfo$.pipe(
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
                                    return next();
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
                new Observable<ISetNumfmtMutationParams>((subscribe) => {
                    const disposable = this._commandService.onCommandExecuted((command) => {
                        if (SetNumfmtMutation.id === command.id) {
                            subscribe.next(command.params as ISetNumfmtMutationParams);
                        }
                    });
                    return () => {
                        disposable.dispose();
                    };
                })
                    .pipe(debounceTime(16))
                    .subscribe((params) => {
                        this._sheetSkeletonManagerService.reCalculate();
                        this._renderManagerService.getRenderById(params.workbookId)?.mainComponent?.makeDirty();
                    })
            )
        );
    }
}
