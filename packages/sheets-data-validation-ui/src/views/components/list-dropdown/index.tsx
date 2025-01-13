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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ISetRangeValuesCommandParams, ISheetLocation } from '@univerjs/sheets';
import type { ListMultipleValidator } from '@univerjs/sheets-data-validation';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IUniverSheetsDataValidationUIConfig } from '../../../controllers/config.schema';
import type { IDropdownComponentProps } from '../../../services/dropdown-manager.service';
import { BuildTextUtils, DataValidationRenderMode, DataValidationType, ICommandService, IConfigService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { Scrollbar } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, SetRangeValuesCommand, SheetPermissionCheckController, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { deserializeListOptions, getDataValidationCellValue, serializeListOptions, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { IEditorBridgeService, SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import { KeyCode, RectPopup, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { debounceTime } from 'rxjs';
import { OpenValidationPanelOperation } from '../../../commands/operations/data-validation.operation';
import { DROP_DOWN_DEFAULT_COLOR } from '../../../const';
import { SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY } from '../../../controllers/config.schema';
import styles from './index.module.less';

interface ISelectListProps {
    value: string[];
    onChange: (val: string[]) => void;
    multiple?: boolean;
    options: { label: string;value: string; color?: string }[];
    title?: string;
    onEdit?: () => void;
    style?: React.CSSProperties;
    filter?: string;
    location: ISheetLocation;
}

const SelectList = (props: ISelectListProps) => {
    const { value, onChange, multiple, options, title, onEdit, style, filter, location } = props;
    const localeService = useDependency(LocaleService);
    const configService = useDependency(IConfigService);
    const lowerFilter = filter?.toLowerCase();
    const { row, col, unitId, subUnitId } = location;
    const filteredOptions = options.filter((item) => lowerFilter ? item.label.toLowerCase().includes(lowerFilter) : true);
    const showEditOnDropdown = configService.getConfig<IUniverSheetsDataValidationUIConfig>(SHEETS_DATA_VALIDATION_UI_PLUGIN_CONFIG_KEY)?.showEditOnDropdown ?? true;
    const sheetPermissionCheckController = useDependency(SheetPermissionCheckController);
    const hasPermission = useMemo(() => sheetPermissionCheckController.permissionCheckWithRanges(
        {
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission],
        },
        [{ startColumn: col, startRow: row, endColumn: col, endRow: row }],
        unitId,
        subUnitId
    ), [sheetPermissionCheckController, col, row, unitId, subUnitId]);

    return (
        <div className={styles.dvListDropdown} style={style}>
            <div className={styles.dvListDropdownTitle}>
                {title}
            </div>
            <div className={styles.dvListDropdownList}>
                <Scrollbar key={filter}>
                    <div className={styles.dvListDropdownListContainer}>
                        {filteredOptions.map((item, i) => {
                            const selected = value.indexOf(item.value) > -1;
                            const handleClick = () => {
                                let set: Set<string>;
                                if (selected) {
                                    set = new Set(value.filter((sub) => sub !== item.value));
                                } else {
                                    set = new Set(multiple ? [...value, item.value] : [item.value]);
                                }
                                const newValue: string[] = [];
                                options.forEach((opt) => {
                                    if (set.has(opt.value)) {
                                        newValue.push(opt.value);
                                    }
                                });

                                onChange(newValue);
                            };

                            const index = item.label.toLocaleLowerCase().indexOf(lowerFilter!);
                            return (
                                <div key={i} className={styles.dvListDropdownItemContainer} onClick={handleClick}>
                                    <div className={styles.dvListDropdownItem} style={{ background: item.color || DROP_DOWN_DEFAULT_COLOR }}>
                                        {lowerFilter && item.label.toLowerCase().includes(lowerFilter)
                                            ? (
                                                <>
                                                    <span>{item.label.substring(0, index)}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{item.label.substring(index, index + lowerFilter.length)}</span>
                                                    <span>{item.label.substring(index + lowerFilter.length)}</span>
                                                </>
                                            )
                                            : item.label}
                                    </div>
                                    <div className={styles.dvListDropdownSelectedIcon}>
                                        {selected ? <CheckMarkSingle /> : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Scrollbar>
            </div>
            {showEditOnDropdown && hasPermission
                ? (
                    <>
                        <div className={styles.dvListDropdownSplit} />
                        <div className={styles.dvListDropdownEdit}>
                            <a onClick={onEdit}>{localeService.t('dataValidation.list.edit')}</a>
                        </div>
                    </>
                )
                : null}
        </div>
    );
};

export function ListDropDown(props: IDropdownComponentProps) {
    const { location, hideFn } = props;
    const { worksheet, row, col, unitId, subUnitId } = location;
    const dataValidationModel = useDependency(DataValidationModel);
    const [editingText, setEditingText] = useState('');
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localValue, setLocalValue] = useState('');
    const editorBridgeService = useDependency(IEditorBridgeService);
    const instanceService = useDependency(IUniverInstanceService);
    const ruleChange$ = useMemo(() => dataValidationModel.ruleChange$.pipe(debounceTime(16)), []);
    const sheetsDataValidationModel = useDependency(SheetDataValidationModel);
    useObservable(ruleChange$);
    const anchorRect = RectPopup.useContext();
    const cellWidth = (anchorRect.current?.right ?? 0) - (anchorRect.current?.left ?? 0);

    useEffect(() => {
        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;
                const unit = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
                if (!unit || !editorBridgeService.isVisible().visible) return;
                const text = BuildTextUtils.transform.getPlainText(unit.getSnapshot().body?.dataStream ?? '');
                setEditingText(text);
            }
        });

        return () => {
            dispose.dispose();
        };
    }, [commandService, editorBridgeService, instanceService]);

    if (!worksheet) {
        return null;
    }

    const rule = sheetsDataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
    if (!rule) {
        return null;
    }
    const validator = sheetsDataValidationModel.getValidator(rule.type) as ListMultipleValidator | undefined;
    if (!validator) {
        return null;
    }

    const cellData = worksheet.getCell(row, col);

    const showColor = rule?.renderMode === DataValidationRenderMode.CUSTOM || rule?.renderMode === undefined;

    if (!cellData || !rule || !validator || validator.id.indexOf(DataValidationType.LIST) !== 0) {
        return;
    }

    const multiple = rule.type === DataValidationType.LIST_MULTIPLE;
    const list = validator.getListWithColor(rule, unitId, subUnitId);
    const cellStr = localValue || getDataValidationCellValue(worksheet.getCellRaw(row, col));
    const value = deserializeListOptions(cellStr);

    const handleEdit = () => {
        commandService.executeCommand(OpenValidationPanelOperation.id, {
            ruleId: rule.uid,
        });
        hideFn();
    };

    const options = list.map((item) => ({
        label: item.label,
        value: item.label,
        color: (showColor || item.color) ? item.color : 'transparent',
    }));

    return (
        <SelectList
            style={{ minWidth: cellWidth, maxWidth: Math.max(cellWidth, 200) }}
            title={multiple ? localeService.t('dataValidation.listMultiple.dropdown') : localeService.t('dataValidation.list.dropdown')}
            value={value}
            multiple={multiple}
            onChange={async (newValue) => {
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

                if (editorBridgeService.isVisible()) {
                    editorBridgeService.changeVisible({
                        visible: false,
                        keycode: KeyCode.ESC,
                        eventType: DeviceInputEventType.Keyboard,
                        unitId,
                    });
                }
                setLocalValue(str);
                if (!multiple) {
                    hideFn();
                }

                if (editorBridgeService.isVisible().visible) {
                    await commandService.executeCommand(SetCellEditVisibleOperation.id, {
                        visible: false,
                        eventType: DeviceInputEventType.Keyboard,
                        unitId,
                        keycode: KeyCode.ESC,
                    } as IEditorBridgeServiceVisibleParam);
                }
                commandService.executeCommand(SetRangeValuesCommand.id, params);
            }}
            options={options}
            onEdit={handleEdit}
            filter={editingText}
            location={location}
        />
    );
}
