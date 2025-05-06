/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable, IRange, Workbook } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import type { ISheetNumfmtPanelProps } from '../views/components';
import {
    CellValueType,
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleService,
    Range,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';

import { IRenderManagerService } from '@univerjs/engine-render';
import {
    INTERCEPTOR_POINT,
    INumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { getPatternPreviewIgnoreGeneral, getPatternType, SetNumfmtCommand, SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager, ISidebarService } from '@univerjs/ui';
import { combineLatest, merge, Observable } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { CloseNumfmtPanelOperator } from '../commands/operations/close.numfmt.panel.operation';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { SheetNumfmtPanel } from '../views/components';

const SHEET_NUMFMT_PANEL = 'SHEET_NUMFMT_PANEL';

export class SheetNumfmtUIController extends Disposable {
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
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ICommandService private _commandService: ICommandService,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService,
        @IRenderManagerService private _renderManagerService: IRenderManagerService,
        @INumfmtService private _numfmtService: INumfmtService,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @ISidebarService private _sidebarService: ISidebarService,
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(SheetsNumfmtCellContentController) private _sheetsNumfmtCellContentController: SheetsNumfmtCellContentController
    ) {
        super();

        this._initRealTimeRenderingInterceptor();
        this._initPanel();
        this._initCommands();
        this._initCloseListener();
        this._commandExecutedListener();
        this._initNumfmtLocalChange();
    }

    private _initNumfmtLocalChange() {
        this.disposeWithMe(merge(this._sheetsNumfmtCellContentController.local$, this._localeService.currentLocale$).subscribe(() => {
            this._forceUpdate();
        }));
    }

    openPanel(): boolean {
        const sidebarService = this._sidebarService;
        const selectionManagerService = this._selectionManagerService;
        const commandService = this._commandService;
        const univerInstanceService = this._univerInstanceService;
        const numfmtService = this._numfmtService;
        const localeService = this._localeService;

        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range) || [];
        const range = selections[0];

        if (!range) {
            return false;
        }

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const sheet = workbook.getActiveSheet();
        if (!sheet) {
            return false;
        }

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

        const defaultValue = (cellValue?.t === CellValueType.NUMBER ? cellValue.v : 12345678) as number;

        const props: ISheetNumfmtPanelProps = {
            onChange: (config) => {
                if (config.type === 'change') {
                    this._previewPattern = config.value;
                    this._forceUpdate();
                } else if (config.type === 'confirm') {
                    const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range) || [];
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

        this._sidebarDisposable = sidebarService.open({
            header: { title: localeService.t('sheet.numfmt.title') },
            children: {
                label: SHEET_NUMFMT_PANEL,
                ...(props as any), // need passthrough to react props.
            },
            onClose: () => {
                this._forceUpdate();
                commandService.executeCommand(CloseNumfmtPanelOperator.id);
            },
        });

        return true;
    };

    private _forceUpdate(unitId?: string): void {
        const renderUnit = this._renderManagerService.getRenderById(
            unitId ?? this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()
        );

        renderUnit?.with(SheetSkeletonManagerService).reCalculate();
        renderUnit?.mainComponent?.makeDirty();
    }

    private _initCommands() {
        [
            OpenNumfmtPanelOperator,
            CloseNumfmtPanelOperator,
        ].forEach((config) => {
            this.disposeWithMe(this._commandService.registerCommand(config));
        });
    }

    private _initPanel() {
        this._componentManager.register(SHEET_NUMFMT_PANEL, SheetNumfmtPanel);
    }

    // eslint-disable-next-line max-lines-per-function
    private _initRealTimeRenderingInterceptor() {
        const isPanelOpenObserver = new Observable<boolean>((subscriber) => {
            this._commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === OpenNumfmtPanelOperator.id) {
                    subscriber.next(true);
                }
                if (commandInfo.id === CloseNumfmtPanelOperator.id) {
                    subscriber.next(false);
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
                        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                        this.openPanel();
                        disposableCollection.add(
                            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                                priority: 99,
                                effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
                                handler: (cell, location, next) => {
                                    const { row, col } = location;
                                    const defaultValue = next(cell) || {};
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
                                            return defaultValue;
                                        }
                                        const info = getPatternPreviewIgnoreGeneral(this._previewPattern, value as number, this._sheetsNumfmtCellContentController.local);
                                        if (info.color) {
                                            const color = this._themeService.getColorFromTheme(`${info.color}.500`);
                                            return {
                                                ...defaultValue,
                                                v: info.result,
                                                t: CellValueType.STRING,
                                                s: { cl: { rgb: color } },
                                            };
                                        }
                                        return {
                                            ...defaultValue,
                                            v: info.result,
                                            t: CellValueType.STRING,
                                        };
                                    }
                                    return defaultValue;
                                },
                            })
                        );
                        this._renderManagerService.getRenderById(workbook.getUnitId())?.mainComponent?.makeDirty();
                    })
            )
        );
    }

    private _commandExecutedListener() {
        const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
        this.disposeWithMe(new Observable<string>((subscribe) => {
            const disposable = this._commandService.onCommandExecuted((command) => {
                if (commandList.includes(command.id)) {
                    const params = command.params as ISetNumfmtMutationParams;
                    subscribe.next(params.unitId);
                }
            });
            return () => disposable.dispose();
        }).pipe(debounceTime(16))
            .subscribe((unitId) => this._forceUpdate(unitId))
        );
    }

    private _sidebarDisposable: IDisposable | null = null;
    private _initCloseListener(): void {
        this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
            if (!unit) {
                this._sidebarDisposable?.dispose();
                this._sidebarDisposable = null;
            }
        });
    }
}
