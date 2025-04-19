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

import type { CellValue, IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { ISetRangeValuesCommandParams, ISheetLocation } from '@univerjs/sheets';
import type { ListValidator } from '@univerjs/sheets-data-validation';
import type { IDropdownParam, IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IUniverSheetsDataValidationUIConfig } from '../controllers/config.schema';
import { CellValueType, DataValidationErrorStyle, DataValidationRenderMode, dayjs, Disposable, DisposableCollection, ICommandService, IConfigService, Inject, Injector, IUniverInstanceService, numfmt, UniverInstanceType } from '@univerjs/core';
import { DataValidatorDropdownType, DataValidatorRegistryService } from '@univerjs/data-validation';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { getCellValueOrigin, getDataValidationCellValue, serializeListOptions, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { getPatternType } from '@univerjs/sheets-numfmt';
import { IEditorBridgeService, ISheetCellDropdownManagerService, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { IZenZoneService, KeyCode } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';
import { SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY } from '../controllers/config.schema';
import { DataValidationRejectInputController } from '../controllers/dv-reject-input.controller';

export interface IDataValidationDropdownParam {
    location: ISheetLocation;
    onHide?: () => void;
    trigger?: 'editor-bridge';
    closeOnOutSide?: boolean;
}

export interface IDropdownComponentProps {
    componentKey: string;
    location: ISheetLocation;
    hideFn: () => void;
}

const transformDate = (value: Nullable<CellValue>) => {
    if (value === undefined || value === null || typeof value === 'boolean') {
        return undefined;
    }

    if (typeof value === 'number' || !Number.isNaN(+value)) {
        return dayjs(numfmt.format('yyyy-MM-dd HH:mm:ss', Number(value)));
    }

    const date = dayjs(value);
    if (date.isValid()) {
        return date;
    }
    return undefined;
};

function getDefaultFormat(patternType: 'datetime' | 'date' | 'time', format: string) {
    const originPartternType = getPatternType(format);
    if (patternType === originPartternType) {
        return format;
    }

    switch (patternType) {
        case 'datetime':
            return 'yyyy-MM-dd hh:mm:ss';
        case 'date':
            return 'yyyy-MM-dd';
        case 'time':
            return 'HH:mm:ss';
    }
}

export class DataValidationDropdownManagerService extends Disposable {
    private _activeDropdown: Nullable<IDataValidationDropdownParam>;
    private _activeDropdown$ = new Subject<Nullable<IDataValidationDropdownParam>>();
    private _currentPopup: Nullable<IDisposable> = null;

    activeDropdown$ = this._activeDropdown$.asObservable();

    private _zenVisible = false;

    get activeDropdown() {
        return this._activeDropdown;
    }

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService,
        @Inject(ISheetCellDropdownManagerService) private readonly _cellDropdownManagerService: ISheetCellDropdownManagerService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(Injector) private readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        this._init();

        this._initSelectionChange();
        this.disposeWithMe(() => {
            this._activeDropdown$.complete();
        });
    }

    private _init() {
        this.disposeWithMe(this._zenZoneService.visible$.subscribe((visible) => {
            this._zenVisible = visible;
            if (visible) {
                this.hideDropdown();
            }
        }));
    }

    private _getDropdownByCell(unitId: string | undefined, subUnitId: string | undefined, row: number, col: number) {
        const workbook = unitId ?
            this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
            : this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = subUnitId ? workbook.getSheetBySheetId(subUnitId) : workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
        if (!rule) {
            return;
        }

        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);

        return validator?.dropdownType;
    }

    private _initSelectionChange() {
        this.disposeWithMe(this._sheetsSelectionsService.selectionMoveEnd$.subscribe((selections) => {
            if (selections && selections.every((selection) => !(selection.primary && this._getDropdownByCell(selection.primary.unitId, selection.primary.sheetId, selection.primary.actualRow, selection.primary.actualColumn)))) {
                this.hideDropdown();
            }
        }));
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    showDropdown(param: IDataValidationDropdownParam) {
        const { location } = param;
        const { row, col, unitId, subUnitId, workbook, worksheet } = location;
        if (this._currentPopup) {
            this._currentPopup.dispose();
        };

        if (this._zenVisible) {
            return;
        }

        this._activeDropdown = param;
        this._activeDropdown$.next(this._activeDropdown);

        const rule = this._sheetDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);

        if (!rule) {
            return;
        }
        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);

        if (!validator?.dropdownType) {
            return;
        }

        let popupDisposable: Nullable<IDisposable>;

        const handleSave = async (date: dayjs.Dayjs | undefined, targetPatternType: 'datetime' | 'date' | 'time') => {
            if (!date) {
                return true;
            }
            const newValue = date;
            const cellData = worksheet.getCell(row, col);
            const dateStr = newValue.format(targetPatternType === 'date' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD HH:mm:ss');
            const serialNum = numfmt.parseDate(dateStr)?.v as number;
            const serialTime = targetPatternType === 'time' ? (serialNum) % 1 : serialNum;
            const cellStyle = workbook.getStyles().getStyleByCell(cellData);
            const format = cellStyle?.n?.pattern ?? '';

            if (
                rule.errorStyle !== DataValidationErrorStyle.STOP ||
                (await validator.validator({
                    value: serialTime,
                    unitId,
                    subUnitId,
                    row,
                    column: col,
                    worksheet,
                    workbook,
                    interceptValue: dateStr.replace('Z', '').replace('T', ' '),
                    t: CellValueType.NUMBER,
                }, rule))
            ) {
                await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    unitId,
                    keycode: KeyCode.ESC,
                } as IEditorBridgeServiceVisibleParam);
                await this._commandService.executeCommand(SetRangeValuesCommand.id, {
                    unitId,
                    subUnitId,
                    range: {
                        startColumn: col,
                        endColumn: col,
                        startRow: row,
                        endRow: row,
                    },
                    value: {
                        v: serialTime,
                        t: 2,
                        p: null,
                        f: null,
                        si: null,
                        s: {
                            n: {
                                pattern: getDefaultFormat(targetPatternType, format),
                            },
                        },
                    },
                });
                return true;
            } else {
                if (this._injector.has(DataValidationRejectInputController)) {
                    const rejectInputController = this._injector.get(DataValidationRejectInputController);
                    rejectInputController.showReject(validator.getRuleFinalError(rule, { row, col, unitId, subUnitId }));
                }
                return false;
            }
        };

        let dropdownParam: IDropdownParam;
        switch (validator.dropdownType) {
            case DataValidatorDropdownType.DATE: {
                const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
                const originDate = transformDate(cellStr);
                const showTime = Boolean(rule.bizInfo?.showTime);

                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        showTime,
                        onChange: (newValue) => handleSave(newValue, showTime ? 'datetime' : 'date'),
                        defaultValue: originDate,
                        patternType: 'date',
                    },
                };
                break;
            }

            case DataValidatorDropdownType.TIME: {
                const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
                const originDate = transformDate(cellStr);

                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        onChange: (newValue) => handleSave(newValue, 'time'),
                        defaultValue: originDate,
                        patternType: 'time',
                    },
                };
                break;
            }
            case DataValidatorDropdownType.DATETIME: {
                const cellStr = getCellValueOrigin(worksheet.getCellRaw(row, col));
                const originDate = transformDate(cellStr);
                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        onChange: (newValue) => handleSave(newValue, 'datetime'),
                        defaultValue: originDate,
                        patternType: 'datetime',
                    },
                };
                break;
            }

            case DataValidatorDropdownType.LIST:
            case DataValidatorDropdownType.MULTIPLE_LIST: {
                const multiple = validator.dropdownType === DataValidatorDropdownType.MULTIPLE_LIST;
                const handleSave = async (newValue: string[]) => {
                    const str = serializeListOptions(newValue);
                    const params: ISetRangeValuesCommandParams = {
                        unitId,
                        subUnitId,
                        range: {
                            startColumn: col,
                            endColumn: col,
                            startRow: row,
                            endRow: row,
                        },
                        value: {
                            v: str,
                            p: null,
                            f: null,
                            si: null,
                        },
                    };

                    if (this._editorBridgeService.isVisible().visible) {
                        await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }
                    this._commandService.executeCommand(SetRangeValuesCommand.id, params);

                    if (multiple) {
                        return false;
                    }

                    return true;
                };
                const showColor = rule?.renderMode === DataValidationRenderMode.CUSTOM || rule?.renderMode === undefined;
                const list = (validator as ListValidator).getListWithColor(rule, unitId, subUnitId);
                const cellStr = getDataValidationCellValue(worksheet.getCellRaw(row, col));

                const handleEdit = () => {
                    this._commandService.executeCommand(OpenValidationPanelOperation.id, {
                        ruleId: rule.uid,
                    });
                    popupDisposable?.dispose();
                };

                const options = list.map((item) => ({
                    label: item.label,
                    value: item.label,
                    color: (showColor || item.color) ? item.color : 'transparent',
                }));

                dropdownParam = {
                    location,
                    type: 'list',
                    props: {
                        onChange: (newValue) => handleSave(newValue),
                        options,
                        onEdit: handleEdit,
                        defaultValue: cellStr,
                        multiple,
                        showEdit: this._configService.getConfig<IUniverSheetsDataValidationUIConfig>(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY)?.showEditOnDropdown ?? true,
                    },
                };
                break;
            }
            case DataValidatorDropdownType.CASCADE: {
                const handleSave = (newValue: string[]) => {
                    const params: ISetRangeValuesCommandParams = {
                        unitId,
                        subUnitId,
                        range: {
                            startColumn: col,
                            endColumn: col,
                            startRow: row,
                            endRow: row,
                        },
                        value: {
                            v: newValue.join('/'),
                            p: null,
                            f: null,
                            si: null,
                        },
                    };

                    if (this._editorBridgeService.isVisible().visible) {
                        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }
                    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);

                    return true;
                };

                dropdownParam = {
                    type: 'cascader',
                    props: {
                        onChange: handleSave,
                        defaultValue: getDataValidationCellValue(worksheet.getCellRaw(row, col)).split('/'),
                        options: JSON.parse(rule.formula1 ?? '[]'),
                    },
                    location,
                };
                break;
            }
            case DataValidatorDropdownType.COLOR: {
                const handleSave = (newValue: string) => {
                    const params: ISetRangeValuesCommandParams = {
                        unitId,
                        subUnitId,
                        range: {
                            startColumn: col,
                            endColumn: col,
                            startRow: row,
                            endRow: row,
                        },
                        value: {
                            v: newValue,
                            p: null,
                            f: null,
                            si: null,
                        },
                    };

                    if (this._editorBridgeService.isVisible().visible) {
                        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }
                    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);

                    return true;
                };

                dropdownParam = {
                    type: 'color',
                    props: {
                        onChange: handleSave,
                        defaultValue: getDataValidationCellValue(worksheet.getCellRaw(row, col)),
                    },
                    location,
                };
                break;
            }

            default:
                throw new Error('[DataValidationDropdownManagerService]: unknown type!');
        }

        popupDisposable = this._cellDropdownManagerService.showDropdown(dropdownParam);
        if (!popupDisposable) {
            throw new Error('[DataValidationDropdownManagerService]: cannot show dropdown!');
        }

        const disposableCollection = new DisposableCollection();
        disposableCollection.add(popupDisposable);
        disposableCollection.add({
            dispose: () => {
                this._activeDropdown?.onHide?.();
            },
        });

        this._currentPopup = disposableCollection;
    }

    hideDropdown() {
        if (!this._activeDropdown) {
            return;
        }
        this._currentPopup && this._currentPopup.dispose();
        this._currentPopup = null;

        this._activeDropdown = null;
        this._activeDropdown$.next(null);
    }

    showDataValidationDropdown(unitId: string, subUnitId: string, row: number, col: number, onHide?: () => void) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        const rule = this._dataValidationModel.getRuleByLocation(workbook.getUnitId(), worksheet.getSheetId(), row, col);
        if (!rule) {
            return;
        }

        const validator = this._dataValidatorRegistryService.getValidatorItem(rule.type);
        if (!validator || !validator.dropdownType) {
            this.hideDropdown();
            return;
        }

        this.showDropdown({
            location: {
                workbook,
                worksheet,
                row,
                col,
                unitId,
                subUnitId,
            },
            onHide,
        });
    }
}
