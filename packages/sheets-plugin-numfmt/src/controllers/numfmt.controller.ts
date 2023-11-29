import numfmt from '@univerjs/base-numfmt-engine';
import { IRenderManagerService } from '@univerjs/base-render';
import {
    ClearSelectionAllCommand,
    ClearSelectionFormatCommand,
    EffectRefRangeParams,
    EffectRefRangId,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveRange,
    RefRangeService,
    runRefRangeMutations,
    SelectionManagerService,
    SetRangeValuesCommand,
} from '@univerjs/base-sheets';
import { ComponentManager, IMenuService, ISidebarService } from '@univerjs/base-ui';
import {
    CellValueType,
    Disposable,
    DisposableCollection,
    ICellData,
    ICommandService,
    IMutationInfo,
    INTERCEPTOR_POINT,
    IRange,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Nullable,
    ObjectMatrix,
    Range,
    Rectangle,
    SheetInterceptorService,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import {
    APPLY_TYPE,
    getRepeatRange,
    IAutoFillHook,
    IAutoFillService,
    SheetSkeletonManagerService,
} from '@univerjs/ui-plugin-sheets';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';
import { combineLatest, Observable } from 'rxjs';
import { bufferTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

import { SHEET_NUMFMT_PLUGIN } from '../base/const/PLUGIN_NAME';
import { AddDecimalCommand } from '../commands/commands/add.decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set.currency.command';
import { SetNumfmtCommand, SetNumfmtCommandParams } from '../commands/commands/set.numfmt.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract.decimal.command';
import {
    factorySetNumfmtUndoMutation,
    SetNumfmtMutation,
    SetNumfmtMutationParams,
} from '../commands/mutations/set.numfmt.mutation';
import { CloseNumfmtPanelOperator } from '../commands/operators/close.numfmt.panel.operator';
import { OpenNumfmtPanelOperator } from '../commands/operators/open.numfmt.panel.operator';
import { SheetNumfmtPanel, SheetNumfmtPanelProps } from '../components/index';
import { zhCn } from '../locale/zh-CN';
import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, SubtractDecimalMenuItem } from '../menu/menu';
import { INumfmtService, NumfmtItemWithCache } from '../service/type';
import { getPatternPreview, getPatternType } from '../utils/pattern';
import type { INumfmtController } from './type';

const createCollectEffectMutation = () => {
    type Config = {
        workbookId: string;
        worksheetId: string;
        row: number;
        col: number;
        value: Nullable<NumfmtItemWithCache>;
    };
    let list: Config[] = [];
    const add = (
        workbookId: string,
        worksheetId: string,
        row: number,
        col: number,
        value: Nullable<NumfmtItemWithCache>
    ) => list.push({ workbookId, worksheetId, row, col, value });
    const getEffects = () => list;
    const clean = () => {
        list = [];
    };
    return {
        add,
        getEffects,
        clean,
    };
};
export class NumfmtController extends Disposable implements INumfmtController {
    // collect effect mutations when edit end and push this to  commands stack in next commands progress
    private _collectEffectMutation = createCollectEffectMutation();
    private _previewPattern = '';
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
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
        this._initInterceptorCellContent();
        this._initInterceptorEditorStart();
        this._initInterceptorEditorEnd();
        this._initInterceptorCommands();
        this._initRealTimeRenderingInterceptor();
        this._registerRefRange();
        this._initMenu();
        this._initLocal();
        this._initPanel();
        this._initCommands();
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

        const props: SheetNumfmtPanelProps = {
            onChange: (config) => {
                if (config.type === 'change') {
                    this._previewPattern = config.value;
                    this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
                } else if (config.type === 'confirm') {
                    const selections = selectionManagerService.getSelectionRanges() || [];
                    const params: SetNumfmtCommandParams = { values: [] };
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
            value: { defaultPattern: pattern, defaultValue },
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

            const values: SetNumfmtMutationParams['values'] = [];

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
                const redo: IMutationInfo<SetNumfmtMutationParams> = {
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
                        case SetRangeValuesCommand.id: {
                            const workbookId = self._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                            const worksheetId = self._univerInstanceService
                                .getCurrentUniverSheetInstance()
                                .getActiveSheet()
                                .getSheetId();
                            const list = self._collectEffectMutation.getEffects();
                            if (!list.length) {
                                return {
                                    redos: [],
                                    undos: [],
                                };
                            }
                            const redos: SetNumfmtMutationParams = {
                                workbookId,
                                worksheetId,
                                values: list.map((item) => ({
                                    pattern: item.value ? item.value.pattern : '',
                                    row: item.row,
                                    col: item.col,
                                    type: item.value?.type,
                                })),
                            };
                            const undos = factorySetNumfmtUndoMutation(self._injector, redos);
                            return {
                                redos: [{ id: SetNumfmtMutation.id, params: redos }],
                                undos: [{ id: SetNumfmtMutation.id, params: undos }],
                            };
                        }
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
                            const redos: SetNumfmtMutationParams = {
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
                        return cache.result;
                    }

                    const info = getPatternPreview(numfmtValue.pattern, Number(originCellValue.v));

                    numfmtRes = info.result;

                    if (!numfmtRes) {
                        return next(cell);
                    }

                    const res = { ...cell, v: numfmtRes };

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

                    return res;
                },
            })
        );
        this.disposeWithMe(
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetNumfmtMutation.id) {
                    const params = commandInfo.params as SetNumfmtMutationParams;
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
                                    isOpen && subscribe.next({ selectionRanges, disposableCollection });
                                    return () => {
                                        disposableCollection.dispose();
                                    };
                                })
                        ),
                        // _previewPattern will be correct by react effect,this is late and causes the render to flash.
                        // this to fix this problem by preset the correct rendering pattern in advance.
                        tap(({ selectionRanges }) => {
                            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                            const range = selectionRanges[0];
                            const row = range.startRow;
                            const col = range.startColumn;
                            const numfmtValue = this._numfmtService.getValue(
                                workbook.getUnitId(),
                                workbook.getActiveSheet().getSheetId(),
                                row,
                                col
                            );
                            if (numfmtValue) {
                                this._previewPattern = numfmtValue.pattern;
                            } else {
                                this._previewPattern = '';
                            }
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
                                        if (value === undefined || value === null || type !== CellValueType.NUMBER) {
                                            return next();
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

    /**
     * Process the initial values before entering the edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorStart() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.BEFORE_CELL_EDIT, {
                handler: (value, context, next) => {
                    const row = context.row;
                    const col = context.col;
                    const numfmtCell = this._numfmtService.getValue(context.workbookId, context.worksheetId, row, col);
                    if (numfmtCell) {
                        const type = getPatternType(numfmtCell.pattern);
                        switch (type) {
                            case 'scientific':
                            case 'percent':
                            case 'currency':
                            case 'grouped':
                            case 'number': {
                                // remove the style atr
                                const cell = context.worksheet.getCellRaw(row, col);
                                return cell ? filterAtr(cell, ['s']) : cell;
                            }
                            case 'date':
                            case 'time':
                            case 'datetime':
                            default: {
                                return next && next(value);
                            }
                        }
                    }
                    return next(value);
                },
            })
        );
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.AFTER_CELL_EDIT, {
                handler: (value, context, next) => {
                    // clear the effect
                    this._collectEffectMutation.clean();
                    const currentNumfmtValue = this._numfmtService.getValue(
                        context.workbookId,
                        context.worksheetId,
                        context.row,
                        context.col
                    );
                    const clean = () => {
                        currentNumfmtValue &&
                            this._collectEffectMutation.add(
                                context.workbookId,
                                context.worksheetId,
                                context.row,
                                context.col,
                                null
                            );
                    };
                    if (!value?.v) {
                        clean();
                        return next(value);
                    }

                    const content = String(value.v);

                    const dateInfo = numfmt.parseDate(content) || numfmt.parseTime(content);
                    const isTranslateDate = !!dateInfo;
                    if (isTranslateDate) {
                        if (dateInfo && dateInfo.z) {
                            const v = Number(dateInfo.v);
                            this._collectEffectMutation.add(
                                context.workbookId,
                                context.worksheetId,
                                context.row,
                                context.col,
                                {
                                    type: 'date',
                                    pattern: dateInfo.z,
                                }
                            );
                            return { ...value, v, t: CellValueType.NUMBER };
                        }
                    } else if (
                        ['date', 'time', 'datetime'].includes(currentNumfmtValue?.type || '') ||
                        !isNumeric(content)
                    ) {
                        clean();
                    }
                    return next(value);
                },
            })
        );
    }

    private _registerRefRange() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$
                    .pipe(
                        map((skeleton) => skeleton?.sheetId),
                        distinctUntilChanged(),
                        switchMap(
                            () =>
                                new Observable<DisposableCollection>((subscribe) => {
                                    const disposableCollection = new DisposableCollection();
                                    subscribe.next(disposableCollection);
                                    return () => {
                                        disposableCollection.dispose();
                                    };
                                })
                        )
                    )
                    .subscribe((disposableCollection) => {
                        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                        const workbookId = workbook.getUnitId();
                        const worksheetId = this._univerInstanceService
                            .getCurrentUniverSheetInstance()
                            .getActiveSheet()
                            .getSheetId();
                        const model = this._numfmtService.getModel(workbookId, worksheetId);
                        const disposableMap: Map<string, IDisposable> = new Map();
                        const register = (commandInfo: EffectRefRangeParams, row: number, col: number) => {
                            const targetRange = {
                                startRow: row,
                                startColumn: col,
                                endRow: row,
                                endColumn: col,
                            };
                            let operators = [];
                            switch (commandInfo.id) {
                                case EffectRefRangId.DeleteRangeMoveLeftCommandId: {
                                    operators = handleDeleteRangeMoveLeft(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.DeleteRangeMoveUpCommandId: {
                                    operators = handleDeleteRangeMoveUp(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertColCommandId: {
                                    operators = handleInsertCol(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRangeMoveDownCommandId: {
                                    operators = handleInsertRangeMoveDown(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRangeMoveRightCommandId: {
                                    operators = handleInsertRangeMoveRight(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRowCommandId: {
                                    operators = handleInsertRow(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.MoveRangeCommandId: {
                                    operators = handleMoveRange(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.RemoveColCommandId: {
                                    operators = handleIRemoveCol(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.RemoveRowCommandId: {
                                    operators = handleIRemoveRow(commandInfo, targetRange);
                                    break;
                                }
                            }
                            const result = runRefRangeMutations(operators, targetRange);
                            if (!result) {
                                // 删除
                                const redoParams: SetNumfmtMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    values: [{ row, col }],
                                };
                                const undoParams = factorySetNumfmtUndoMutation(this._injector, redoParams);
                                return {
                                    redos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: redoParams,
                                        },
                                    ],
                                    undos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: undoParams,
                                        },
                                    ],
                                };
                            }
                            const numfmtValue = this._numfmtService.getValue(workbookId, worksheetId, row, col);

                            if (numfmtValue) {
                                const redoParams: SetNumfmtMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    values: [
                                        { row, col },
                                        { ...numfmtValue, row: result.startRow, col: result.startColumn },
                                    ],
                                };
                                const undoParams = factorySetNumfmtUndoMutation(this._injector, redoParams);
                                return {
                                    redos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: redoParams,
                                        },
                                    ],
                                    undos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: undoParams,
                                        },
                                    ],
                                };
                            }
                            return { redos: [], undos: [] };
                        };
                        if (model) {
                            model.forValue((row, col) => {
                                const targetRange = {
                                    startRow: row,
                                    startColumn: col,
                                    endRow: row,
                                    endColumn: col,
                                };
                                const disposable = this._refRangeService.registerRefRange(targetRange, (commandInfo) =>
                                    register(commandInfo, row, col)
                                );
                                disposableMap.set(`${row}_${col}`, disposable);
                                disposableCollection.add(disposable);
                            });
                        }

                        // on change
                        disposableCollection.add(
                            toDisposable(
                                new Observable<SetNumfmtMutationParams>((subscribe) => {
                                    disposableCollection.add(
                                        this._commandService.onCommandExecuted((commandInfo) => {
                                            if (commandInfo.id === SetNumfmtMutation.id) {
                                                subscribe.next(commandInfo.params as SetNumfmtMutationParams);
                                            }
                                        })
                                    );
                                })
                                    .pipe(
                                        filter(
                                            (commandInfo) =>
                                                commandInfo.workbookId === workbookId &&
                                                commandInfo.worksheetId === worksheetId
                                        ),
                                        map((commandInfo) => commandInfo.values),
                                        bufferTime(300), // updating the listener moves to the next queue
                                        map((values) =>
                                            values.reduce((pre, cur) => {
                                                pre.push(...cur);
                                                return pre;
                                            }, [])
                                        ),
                                        filter((values) => !!values.length)
                                    )
                                    .subscribe((values) => {
                                        values.forEach((value) => {
                                            const { row, col } = value;
                                            const key = `${row}_${col}`;
                                            const disposable = disposableMap.get(key);
                                            disposableMap.delete(key);
                                            if (!value.pattern) {
                                                disposable && disposable.dispose();
                                            } else {
                                                const targetRange = {
                                                    startRow: row,
                                                    startColumn: col,
                                                    endRow: row,
                                                    endColumn: col,
                                                };
                                                const disposable = this._refRangeService.registerRefRange(
                                                    targetRange,
                                                    (commandInfo) => register(commandInfo, row, col)
                                                );
                                                disposableMap.set(key, disposable);
                                                disposableCollection.add(disposable);
                                            }
                                        });
                                    })
                            )
                        );
                    })
            )
        );
    }
}

const filterAtr = (obj: Record<string, any>, filterKey: string[]) => {
    const keys = Object.keys(obj).filter((key) => !filterKey.includes(key));
    return keys.reduce(
        (pre, cur) => {
            pre[cur] = obj[cur];
            return pre;
        },
        {} as Record<string, any>
    );
};

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}
