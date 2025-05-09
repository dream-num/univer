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

import type { Nullable, Workbook } from '@univerjs/core';

import type { IDefinedNamesServiceParam, ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import { ICommandService, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { Button, clsx, Confirm, Tooltip } from '@univerjs/design';
import { IDefinedNamesService, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { CheckMarkSingle, DeleteSingle, IncreaseSingle } from '@univerjs/icons';
import {
    InsertDefinedNameCommand,
    RemoveDefinedNameCommand,
    SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
    SetDefinedNameCommand,
    SetWorksheetShowCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { DefinedNameInput } from './DefinedNameInput';

export const DefinedNameContainer = () => {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const localeService = useDependency(LocaleService);
    const definedNamesService = useDependency(IDefinedNamesService);
    const selectionManagerService = useDependency(SheetsSelectionsService);

    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const getDefinedNameMap = () => {
        const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
        if (definedNameMap) {
            return Array.from(Object.values(definedNameMap));
        }
        return [];
    };

    const [editState, setEditState] = useState(false);
    const [definedNames, setDefinedNames] = useState<IDefinedNamesServiceParam[]>(getDefinedNameMap());
    const [editorKey, setEditorKey] = useState<Nullable<string>>(null);
    const [deleteConformKey, setDeleteConformKey] = useState<Nullable<string>>();

    useEffect(() => {
        const definedNamesSubscription = definedNamesService.update$.subscribe(() => {
            setDefinedNames(getDefinedNameMap());
        });

        return () => {
            definedNamesSubscription.unsubscribe();
        };
    }, []);

    const insertConfirm = (param: IDefinedNamesServiceParam) => {
        const { name, formulaOrRefString, comment, localSheetId, hidden } = param;

        let id = param.id;
        if (id == null || id.length === 0) {
            id = Tools.generateRandomId(10);
            commandService.executeCommand(InsertDefinedNameCommand.id, { id, unitId, name, formulaOrRefString, comment, localSheetId, hidden });
        } else {
            const newDefinedName: ISetDefinedNameMutationParam = { id, unitId, name, formulaOrRefString, comment, localSheetId, hidden };
            commandService.executeCommand(SetDefinedNameCommand.id, newDefinedName);
        }
        setEditState(false);
        setEditorKey(null);
    };

    const deleteDefinedName = (id: string) => {
        setDeleteConformKey(id);
    };

    function handleDeleteClose() {
        setDeleteConformKey(null);
    }

    function handleDeleteConfirm(id: string) {
        const item = definedNamesService.getValueById(unitId, id);
        commandService.executeCommand(RemoveDefinedNameCommand.id, { ...item, unitId });
        setDeleteConformKey(null);
    }

    const focusDefinedName = async (definedName: IDefinedNamesServiceParam) => {
        // The worksheet may be hidden, so we need to show it first
        const { formulaOrRefString, id } = definedName;
        const worksheet = definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);
        if (!worksheet) {
            return;
        }

        const isHidden = worksheet.isSheetHidden();
        if (isHidden) {
            await commandService.executeCommand(SetWorksheetShowCommand.id, { unitId, subUnitId: worksheet.getSheetId() });
        }

        definedNamesService.focusRange(unitId, id);
    };

    const getInsertDefinedName = () => {
        const count = definedNames.length + 1;
        const name = localeService.t('definedName.defaultName') + count;
        if (definedNamesService.getValueByName(unitId, name) == null) {
            return name;
        }

        let i = count + 1;
        while (true) {
            const newName = localeService.t('definedName.defaultName') + i;
            if (definedNamesService.getValueByName(unitId, newName) == null) {
                return newName;
            }
            i++;
        }
    };

    const getInertFormulaOrRefString = () => {
        const sheetName = workbook.getActiveSheet()?.getName();
        if (!sheetName) {
            return '';
        }

        const selections = selectionManagerService.getCurrentSelections();
        if (selections == null) {
            return '';
        }

        const formulaOrRefs = selections.map((selection) => {
            return serializeRangeWithSheet(sheetName, selection.range);
        });

        return formulaOrRefs.join(',');
    };

    const closeInput = () => {
        setEditState(false);
        setEditorKey(null);
    };

    const openInsertCloseKeyEditor = () => {
        setEditState(true);
        setEditorKey(null);
    };

    const closeInsertOpenKeyEditor = (id: string) => {
        setEditState(false);
        setEditorKey(id);
    };

    const getSheetNameBySheetId = (sheetId: string) => {
        const sheet = workbook.getSheetBySheetId(sheetId);
        if (sheet == null) {
            return '';
        }

        return sheet.getName();
    };

    return (
        <div
            data-u-comp="defined-name-container"
            className="univer-relative univer-box-border univer-w-full"
        >
            <div className="univer-w-full univer-overflow-hidden univer-overflow-y-auto">
                <div key="insertDefinedName" className="univer-mb-4">
                    <Button
                        className={clsx(
                            'univer-w-full',
                            {
                                'univer-hidden': editState,
                            }
                        )}
                        onClick={openInsertCloseKeyEditor}
                    >
                        <IncreaseSingle />
                        <span className="univer-ml-1">{localeService.t('definedName.addButton')}</span>
                    </Button>
                    {editState && (
                        <DefinedNameInput
                            confirm={insertConfirm}
                            cancel={closeInput}
                            state={editState}
                            inputId="insertDefinedName"
                            name={getInsertDefinedName()}
                            formulaOrRefString={getInertFormulaOrRefString()}
                        />
                    )}
                </div>

                {definedNames.map((definedName, index) => {
                    return (
                        <div
                            key={index}
                            className={`
                              univer-divide-x-0 univer-divide-y univer-divide-solid univer-divide-gray-200
                              dark:univer-divide-gray-600
                            `}
                        >
                            <div
                                onClick={() => { focusDefinedName(definedName); }}
                                className={clsx(
                                    `
                                      univer-relative univer-flex univer-cursor-default univer-select-none
                                      univer-items-center univer-justify-between univer-rounded-md univer-p-2
                                      dark:hover:univer-bg-gray-700
                                      hover:univer-bg-gray-50
                                    `,
                                    { 'univer-hidden': definedName.id === editorKey }
                                )}
                            >
                                <div title={definedName.comment}>
                                    <div
                                        className={`
                                          univer-my-1 univer-max-h-[100px] univer-max-w-[190px] univer-overflow-hidden
                                          univer-text-sm univer-font-medium univer-text-gray-900
                                          dark:univer-text-white
                                        `}
                                    >
                                        {definedName.name}
                                        <span
                                            className="univer-text-xxs univer-ml-1 univer-text-gray-400"
                                        >
                                            {(definedName.localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || definedName.localSheetId == null) ? '' : getSheetNameBySheetId(definedName.localSheetId)}
                                        </span>
                                    </div>
                                    <div
                                        className={`
                                          univer-my-1 univer-max-h-[100px] univer-overflow-hidden univer-text-ellipsis
                                          univer-text-xs univer-text-gray-500
                                        `}
                                    >
                                        {definedName.formulaOrRefString}
                                    </div>
                                </div>
                                <Tooltip title={localeService.t('definedName.updateButton')} placement="top">
                                    <div
                                        className={`
                                          univer-absolute univer-text-xs univer-text-primary univer-right-[60px]
                                          univer-top-5 univer-hidden -univer-translate-y-1/2 univer-cursor-pointer
                                          univer-rounded univer-p-1
                                          group-hover:univer-block
                                          hover:univer-bg-hyacinth-50
                                        `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeInsertOpenKeyEditor(definedName.id);
                                        }}
                                    >
                                        <CheckMarkSingle />
                                    </div>
                                </Tooltip>
                                <Tooltip title={localeService.t('definedName.deleteButton')} placement="top">
                                    <div
                                        className={`
                                          univer-absolute univer-text-xs univer-text-error univer-right-5 univer-top-5
                                          univer-hidden -univer-translate-y-1/2 univer-cursor-pointer univer-rounded
                                          univer-p-1
                                          group-hover:univer-block
                                          hover:univer-bg-hyacinth-50
                                        `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteDefinedName(definedName.id);
                                        }}
                                    >
                                        <DeleteSingle />
                                    </div>
                                </Tooltip>
                            </div>

                            <Confirm
                                visible={deleteConformKey === definedName.id}
                                onClose={handleDeleteClose}
                                onConfirm={() => { handleDeleteConfirm(definedName.id); }}
                            >
                                {localeService.t('definedName.deleteConfirmText')}
                            </Confirm>

                            {definedName.id === editorKey && (
                                <DefinedNameInput
                                    confirm={insertConfirm}
                                    cancel={closeInput}
                                    state={definedName.id === editorKey}
                                    id={definedName.id}
                                    inputId={definedName.id + index}
                                    name={definedName.name}
                                    formulaOrRefString={definedName.formulaOrRefString}
                                    comment={definedName.comment}
                                    localSheetId={definedName.localSheetId}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
