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

import type { CellValue, DateKit, IDisposable, IExcelDateTimeParts, Nullable, Workbook } from '@univerjs/core';
import type { ISetRangeValuesCommandParams, ISheetLocation } from '@univerjs/sheets';
import type { ListValidator } from '@univerjs/sheets-data-validation';
import type { IDropdownParam, IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IUniverSheetsDataValidationUIConfig } from '../config/config';
import { CellValueType, DataValidationErrorStyle, DataValidationRenderMode, dateKit, DateSystem, Disposable, DisposableCollection, excelDateTimePartsToSerial, excelSerialToDateTimeParts, ICommandService, IConfigService, Inject, Injector, IUniverInstanceService, numfmt, UniverInstanceType } from '@univerjs/core';
import { DataValidatorDropdownType, DataValidatorRegistryService } from '@univerjs/data-validation';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { serializeListOptions, SetRangeValuesCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { getCellValueOrigin, getDataValidationCellValue, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { getPatternType } from '@univerjs/sheets-numfmt';
import { IEditorBridgeService, ISheetCellDropdownManagerService, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';
import { SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import { DROP_DOWN_DEFAULT_COLOR } from '../const';
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

type DatePatternType = 'datetime' | 'date' | 'time' | 'duration';
type DateChangeType = 'date' | 'time';

function getExceptionalDateLabel(parts: IExcelDateTimeParts | null, patternType: DatePatternType): string | undefined {
    if (!parts || (parts.day !== 0 && !(parts.year === 1900 && parts.month === 2 && parts.day === 29))) {
        return undefined;
    }
    const date = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
    if (patternType === 'date') return date;
    const time = `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}:${String(parts.seconds).padStart(2, '0')}`;
    return `${date} ${time}`;
}

const transformDate = (value: Nullable<CellValue>, dateSystem: DateSystem, patternType: Exclude<DatePatternType, 'duration'>) => {
    // A pure-time picker needs a native Date anchor that is valid in the workbook's date system.
    const timeAnchorYear = dateSystem === DateSystem.Date1904 ? 1904 : 1900;
    if (value === undefined || value === null) {
        return patternType === 'time' ? dateKit(new Date(timeAnchorYear, 0, 1)) : undefined;
    }
    if (typeof value === 'boolean') {
        return undefined;
    }

    if (value === '') return patternType === 'time' ? dateKit(new Date(timeAnchorYear, 0, 1)) : dateKit();

    if (typeof value === 'number' || !Number.isNaN(+value)) {
        const parts = excelSerialToDateTimeParts(Number(value), { dateSystem });
        if (!parts) return undefined;
        const year = patternType === 'time' ? timeAnchorYear : parts.year;
        const month = patternType === 'time' ? 1 : parts.month;
        // The picker needs a real Date anchor; the original pseudo-date is restored during save unless the date was changed.
        const day = patternType === 'time'
            ? 1
            : parts.day === 0
                ? 1
                : parts.year === 1900 && parts.month === 2 && parts.day === 29 ? 28 : parts.day;
        return dateKit(new Date(year, month - 1, day, parts.hours, parts.minutes, parts.seconds, Math.round(parts.fractionalSecond * 1000)));
    }

    const date = dateKit(value);
    if (date.isValid()) {
        return date;
    }
    return undefined;
};

function getDefaultFormat(patternType: DatePatternType, format: string) {
    // Numfmt categorizes elapsed-time formats as time, so detect duration before comparing the general type.
    if (patternType === 'duration' && numfmt.getFormatDateInfo(format).isDuration) {
        return format;
    }
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
        case 'duration':
            return '[h]:mm:ss';
    }
}

export class DataValidationDropdownManagerService extends Disposable {
    private _activeDropdown: Nullable<IDataValidationDropdownParam>;
    private _activeDropdown$ = new Subject<Nullable<IDataValidationDropdownParam>>();
    private _currentPopup: Nullable<IDisposable> = null;

    activeDropdown$ = this._activeDropdown$.asObservable();

    get activeDropdown() {
        return this._activeDropdown;
    }

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService,
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
        this._initSelectionChange();
        this.disposeWithMe(() => {
            this._activeDropdown$.complete();
        });
    }

    private _getDropdownByCell(unitId: string | undefined, subUnitId: string | undefined, row: number, col: number) {
        const workbook = unitId ?
            this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
            : this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
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

        const dateSystem = workbook.getDateSystem();
        const originalValue = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const originalSerial = typeof originalValue === 'number'
            ? originalValue
            : typeof originalValue === 'string' && originalValue !== '' && !Number.isNaN(+originalValue) ? Number(originalValue) : null;
        const originalParts = originalSerial == null ? null : excelSerialToDateTimeParts(originalSerial, { dateSystem });
        const cellData = worksheet.getCell(row, col);
        const cellStyle = workbook.getStyles().getStyleByCell(cellData);
        const format = cellStyle?.n?.pattern ?? '';

        const finishCellEditing = async () => {
            await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                unitId,
                keycode: KeyCode.ESC,
            } as IEditorBridgeServiceVisibleParam);
            return true;
        };

        const handleSerialSave = async (serial: number, targetPatternType: DatePatternType, interceptValue: string) => {
            if (
                rule.errorStyle !== DataValidationErrorStyle.STOP ||
                (await validator.validator({
                    value: serial,
                    unitId,
                    subUnitId,
                    row,
                    column: col,
                    worksheet,
                    workbook,
                    interceptValue,
                    t: CellValueType.NUMBER,
                }, rule))
            ) {
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
                        v: serial,
                        t: CellValueType.NUMBER,
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
                return finishCellEditing();
            }

            if (this._injector.has(DataValidationRejectInputController)) {
                const rejectInputController = this._injector.get(DataValidationRejectInputController);
                rejectInputController.showReject(validator.getRuleFinalError(rule, { row, col, unitId, subUnitId }));
            }
            return false;
        };

        const handleSave = async (date: DateKit | undefined, targetPatternType: Exclude<DatePatternType, 'duration'>, changeType?: DateChangeType) => {
            if (!date) {
                return finishCellEditing();
            }
            const nativeDate = date.toDate();
            const selectedParts = {
                year: nativeDate.getFullYear(),
                month: nativeDate.getMonth() + 1,
                day: nativeDate.getDate(),
                hours: nativeDate.getHours(),
                minutes: nativeDate.getMinutes(),
                seconds: nativeDate.getSeconds(),
                fractionalSecond: nativeDate.getMilliseconds() / 1000,
            };
            // Native Date uses the nearest real date for Excel's serial 0/60; a time-only change must restore the pseudo-day.
            const isExceptionalDateAnchor = originalParts != null && (
                (originalParts.day === 0 && selectedParts.year === 1900 && selectedParts.month === 1 && selectedParts.day === 1) ||
                (originalParts.year === 1900 && originalParts.month === 2 && originalParts.day === 29 && selectedParts.year === 1900 && selectedParts.month === 2 && selectedParts.day === 28)
            );
            // An empty pure-date cell starts at midnight; only an existing serial can supply hidden time fields.
            const timeParts = targetPatternType === 'date'
                ? (originalParts ?? { hours: 0, minutes: 0, seconds: 0, fractionalSecond: 0 })
                : selectedParts;
            const dateParts = {
                year: targetPatternType === 'time' && originalParts && (originalSerial ?? 0) >= 1 ? originalParts.year : selectedParts.year,
                month: targetPatternType === 'time' && originalParts && (originalSerial ?? 0) >= 1 ? originalParts.month : selectedParts.month,
                day: targetPatternType === 'time' && originalParts && (originalSerial ?? 0) >= 1
                    ? originalParts.day
                    : targetPatternType === 'datetime' && changeType === 'time' && isExceptionalDateAnchor ? originalParts!.day : selectedParts.day,
                hours: timeParts.hours,
                minutes: timeParts.minutes,
                seconds: timeParts.seconds,
                fractionalSecond: timeParts.fractionalSecond,
            };
            const serialNum = excelDateTimePartsToSerial(dateParts, { dateSystem });
            if (serialNum == null) return false;
            const serialTime = targetPatternType === 'time' && (originalSerial == null || originalSerial < 1)
                ? serialNum - Math.floor(serialNum)
                : serialNum;
            const dateStr = date.format(targetPatternType === 'date' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD HH:mm:ss');
            return handleSerialSave(serialTime, targetPatternType, dateStr.replace('Z', '').replace('T', ' '));
        };

        let dropdownParam: IDropdownParam;
        // Keep an out-of-range serial editable as a number instead of coercing it through an invalid native Date.
        const unsupportedValue = originalSerial != null && !originalParts ? originalSerial : undefined;
        const serialProps = unsupportedValue == null
            ? {}
            : {
                unsupportedValue,
                onSerialChange: (newValue: number | undefined) => {
                    if (newValue == null || !excelSerialToDateTimeParts(newValue, { dateSystem })) {
                        return Promise.resolve(false);
                    }
                    return handleSerialSave(newValue, validator.dropdownType === DataValidatorDropdownType.DATE ? 'date' : validator.dropdownType === DataValidatorDropdownType.TIME ? 'time' : 'datetime', String(newValue));
                },
            };
        switch (validator.dropdownType) {
            case DataValidatorDropdownType.DATE: {
                const originDate = transformDate(originalValue, dateSystem, 'date');
                const showTime = Boolean(rule.bizInfo?.showTime);

                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        showTime,
                        onChange: (newValue, changeType) => handleSave(newValue, showTime ? 'datetime' : 'date', changeType),
                        ...(originDate ? { defaultValue: originDate } : {}),
                        exceptionalDateLabel: getExceptionalDateLabel(originalParts, showTime ? 'datetime' : 'date'),
                        patternType: 'date',
                        preserveDefaultValue: true,
                        ...serialProps,
                    },
                };
                break;
            }

            case DataValidatorDropdownType.TIME: {
                if (numfmt.getFormatDateInfo(format).isDuration) {
                    dropdownParam = {
                        location,
                        type: 'datepicker',
                        props: {
                            durationValue: originalSerial ?? undefined,
                            onDurationChange: (newValue) => newValue == null
                                ? finishCellEditing()
                                : handleSerialSave(newValue, 'duration', String(newValue)),
                            patternType: 'duration',
                            preserveDefaultValue: true,
                        },
                    };
                    break;
                }
                const originDate = transformDate(originalValue, dateSystem, 'time');

                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        onChange: (newValue, changeType) => handleSave(newValue, 'time', changeType),
                        ...(originDate ? { defaultValue: originDate } : {}),
                        patternType: 'time',
                        preserveDefaultValue: true,
                        ...serialProps,
                    },
                };
                break;
            }
            case DataValidatorDropdownType.DATETIME: {
                const originDate = transformDate(originalValue, dateSystem, 'datetime');
                dropdownParam = {
                    location,
                    type: 'datepicker',
                    props: {
                        onChange: (newValue, changeType) => handleSave(newValue, 'datetime', changeType),
                        ...(originDate ? { defaultValue: originDate } : {}),
                        exceptionalDateLabel: getExceptionalDateLabel(originalParts, 'datetime'),
                        patternType: 'datetime',
                        preserveDefaultValue: true,
                        ...serialProps,
                    },
                };
                break;
            }

            case DataValidatorDropdownType.LIST:
            case DataValidatorDropdownType.MULTIPLE_LIST: {
                const multiple = validator.dropdownType === DataValidatorDropdownType.MULTIPLE_LIST;
                const handleSave = async (newValue: string[]) => {
                    const str = multiple ? serializeListOptions(newValue) : (newValue[0] ?? '');
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

                    this._commandService.executeCommand(SetRangeValuesCommand.id, params);
                    if (this._editorBridgeService.isVisible().visible) {
                        await this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }

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
                    color: (showColor || item.color) ? (item.color || DROP_DOWN_DEFAULT_COLOR) : 'transparent',
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
                        showSearch: this._configService.getConfig<IUniverSheetsDataValidationUIConfig>(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY)?.showSearchOnDropdown ?? true,
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

                    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
                    if (this._editorBridgeService.isVisible().visible) {
                        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }

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

                    this._commandService.syncExecuteCommand(SetRangeValuesCommand.id, params);
                    if (this._editorBridgeService.isVisible().visible) {
                        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            unitId,
                            keycode: KeyCode.ESC,
                        } as IEditorBridgeServiceVisibleParam);
                    }

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

        popupDisposable = this._cellDropdownManagerService.showDropdown({
            ...dropdownParam,
            onHide: () => {
                this._activeDropdown = null;
                this._activeDropdown$.next(null);
            },
        });
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
