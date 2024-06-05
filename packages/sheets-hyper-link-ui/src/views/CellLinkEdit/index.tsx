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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, FormLayout, Input, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IUnitRangeWithName, Workbook } from '@univerjs/core';
import { createInternalEditorID, ICommandService, isValidRange, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { RangeSelector, useEvent, useObservable } from '@univerjs/ui';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeToRefString, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { AddHyperLinkCommand, ERROR_RANGE, HyperLinkModel, UpdateHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { CloseHyperLinkSidebarOperation } from '../../commands/operations/sidebar.operations';
import { getCellValueOrigin, isLegalLink, serializeUrl } from '../../common/util';
import styles from './index.module.less';

enum LinkType {
    link = 'link',
    range = 'range',
    sheet = 'gid',
    definedName = 'rangeid',
}

export const CellLinkEdit = () => {
    const [id, setId] = useState('');
    const [display, setDisplay] = useState('');
    const [type, setType] = useState(LinkType.link);
    const [payload, setPayload] = useState('');
    const localeService = useDependency(LocaleService);
    const definedNameService = useDependency(IDefinedNamesService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const editing = useObservable(popupService.currentEditing$);
    const hyperLinkModel = useDependency(HyperLinkModel);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const commandService = useDependency(ICommandService);
    const [showError, setShowError] = useState(false);

    const setByPayload = useRef(false);

    useEffect(() => {
        if (editing?.row !== undefined && editing.column !== undefined) {
            const link = hyperLinkModel.getHyperLinkByLocationSync(editing.unitId, editing.subUnitId, editing.row, editing.column);
            if (link) {
                const linkInfo = resolverService.parseHyperLink(link.payload);
                setId(link.id);
                setDisplay(link.display);
                if (linkInfo.type === 'outer') {
                    setType(LinkType.link);
                    setPayload(linkInfo.url);
                    if (linkInfo.url === link.display) {
                        setByPayload.current = true;
                    }
                    return;
                } else {
                    const params = linkInfo.searchObj;
                    if (params.rangeid) {
                        setType(LinkType.definedName);
                        setPayload(params.rangeid);

                        return;
                    }

                    if (params.range) {
                        const sheetName = params.gid ?
                            univerInstanceService
                                .getUnit<Workbook>(editing.unitId)
                                ?.getSheetBySheetId(params.gid)
                                ?.getName()
                            ?? ''
                            : '';
                        setType(LinkType.range);
                        if (params.range === ERROR_RANGE) {
                            setPayload('');
                        } else {
                            const payload = (serializeRangeWithSheet(sheetName, deserializeRangeWithSheet(params.range).range));
                            setPayload(payload);
                            if (payload === link.display) {
                                setByPayload.current = true;
                            }
                        }

                        return;
                    }

                    if (params.gid) {
                        setType(LinkType.sheet);
                        setPayload(params.gid);
                        return;
                    }
                }
            }
            const workbook = univerInstanceService.getUnit<Workbook>(editing.unitId);
            const worksheet = workbook?.getSheetBySheetId(editing.subUnitId);
            const cell = worksheet?.getCellRaw(editing.row, editing.column);

            const cellValue = getCellValueOrigin(cell);
            setType(LinkType.link);
            setPayload('');
            setDisplay((cellValue ?? '').toString());
            setId('');
            return;
        }

        setType(LinkType.link);
        setPayload('');
        setDisplay('');
        setId('');
    }, [editing, hyperLinkModel, resolverService, univerInstanceService]);

    const payloadInitial = useMemo(() => payload, [type]);

    const linkTypeOptions = [
        {
            label: localeService.t('hyperLink.form.link'),
            value: LinkType.link,
        },
        {
            label: localeService.t('hyperLink.form.range'),
            value: LinkType.range,
        },
        {
            label: localeService.t('hyperLink.form.worksheet'),
            value: LinkType.sheet,
        },
        {
            label: localeService.t('hyperLink.form.definedName'),
            value: LinkType.definedName,
        },
    ];
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return;
    }
    const hiddens = workbook.getHiddenWorksheets();
    const sheetsOption = workbook.getSheets().map((sheet) => ({ label: sheet.getName(), value: sheet.getSheetId() })).filter((opt) => hiddens.indexOf(opt.value) === -1);
    const definedNames = Object.values(definedNameService.getDefinedNameMap(workbook.getUnitId()) ?? {}).map((value) => ({
        label: value.name,
        value: value.id,
    }));

    const formatUrl = (type: LinkType, payload: string) => {
        if (type === LinkType.link) {
            return serializeUrl(payload);
        }

        if (type === LinkType.range) {
            const info = deserializeRangeWithSheet(payload);
            const worksheet = workbook.getSheetBySheetName(info.sheetName);
            if (worksheet) {
                return `#gid=${worksheet.getSheetId()}&range=${serializeRange(info.range)}`;
            }
        }

        return `#${type}=${payload}`;
    };

    const handleRangeChange = useEvent((newValue: IUnitRangeWithName[]) => {
        const range = newValue[0];
        if (!range || !isValidRange(range.range)) {
            return;
        }
        if (!range.sheetName) {
            range.sheetName = workbook.getActiveSheet().getName();
        }
        const newPayload = serializeRangeToRefString(range);
        setPayload(newPayload);

        if (newPayload && (setByPayload.current || !display)) {
            setDisplay(newPayload);
            setByPayload.current = true;
        }
    });

    const handleSubmit = async () => {
        if (editing) {
            if (id) {
                await commandService.executeCommand(UpdateHyperLinkCommand.id, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    id,
                    payload: {
                        display,
                        payload: formatUrl(type, payload),
                    },
                });
            } else {
                await commandService.executeCommand(AddHyperLinkCommand.id, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    link: {
                        id: Tools.generateRandomId(),
                        row: editing.row,
                        column: editing.column,
                        payload: formatUrl(type, payload),
                        display,
                    },
                });
            }
        }
        if (editing) {
            await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: editing.unitId,
                subUnitId: editing.subUnitId,
            });

            const GAP = 5;
            await commandService.executeCommand(ScrollToRangeOperation.id, {
                range: {
                    startRow: Math.max(editing.row - GAP, 0),
                    endRow: editing.row + GAP,
                    startColumn: Math.max(editing.column - GAP, 0),
                    endColumn: editing.column + GAP,
                },
            });
        }

        commandService.executeCommand(CloseHyperLinkSidebarOperation.id);
    };

    return (
        <div>
            <FormLayout
                label={localeService.t('hyperLink.form.label')}
                error={showError && !display ? localeService.t('hyperLink.form.inputError') : ''}
            >
                <Input
                    value={display}
                    onChange={(v) => {
                        setDisplay(v);
                        setByPayload.current = false;
                    }}
                    placeholder={localeService.t('hyperLink.form.labelPlaceholder')}
                />
            </FormLayout>
            <FormLayout label={localeService.t('hyperLink.form.type')}>
                <Select
                    options={linkTypeOptions}
                    value={type}
                    onChange={(newType) => {
                        setType(newType as LinkType);
                        setPayload('');
                    }}
                />
            </FormLayout>
            {type === LinkType.link && (
                <FormLayout
                    error={showError ? !payload ? localeService.t('hyperLink.form.inputError') : !isLegalLink(payload) ? localeService.t('hyperLink.form.linkError') : '' : ''}
                >
                    <Input
                        value={payload}
                        onChange={(newLink) => {
                            setPayload(newLink);
                            if (newLink && (setByPayload.current || !display || display === payload)) {
                                setDisplay(newLink);
                                setByPayload.current = true;
                            }
                        }}
                        placeholder={localeService.t('hyperLink.form.linkPlaceholder')}
                    />
                </FormLayout>
            )}
            {type === LinkType.range && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.inputError') : ''}>
                    <RangeSelector
                        openForSheetUnitId={workbook.getUnitId()}
                        id={createInternalEditorID('hyper-link-edit')}
                        isSingleChoice
                        value={payloadInitial}
                        onChange={handleRangeChange}
                    />
                </FormLayout>
            )}
            {type === LinkType.sheet && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.selectError') : ''}>
                    <Select
                        options={sheetsOption}
                        value={payload}
                        onChange={(newPayload) => {
                            setPayload(newPayload);
                            const label = sheetsOption.find((i) => i.value === newPayload)?.label;
                            const oldLabel = sheetsOption.find((i) => i.value === payload)?.label;
                            if (label && (setByPayload.current || !display || display === oldLabel)) {
                                setDisplay(label);
                                setByPayload.current = true;
                            }
                        }}
                    />
                </FormLayout>
            )}
            {type === LinkType.definedName && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.selectError') : ''}>
                    <Select
                        options={definedNames}
                        value={payload}
                        onChange={(newValue) => {
                            setPayload(newValue);
                            const label = definedNames.find((i) => i.value === newValue)?.label;
                            const oldLabel = definedNames.find((i) => i.value === payload)?.label;
                            if (label && (setByPayload.current || !display || display === oldLabel)) {
                                setDisplay(label);
                                setByPayload.current = true;
                            }
                        }}
                    />
                </FormLayout>
            )}
            <div className={styles.cellLinkEditButtons}>
                <Button
                    onClick={() => {
                        if (editing) {
                            commandService.executeCommand(SetWorksheetActiveOperation.id, {
                                unitId: editing.unitId,
                                subUnitId: editing.subUnitId,
                            });
                        }
                        commandService.executeCommand(CloseHyperLinkSidebarOperation.id);
                    }}
                >
                    {localeService.t('hyperLink.form.cancel')}
                </Button>
                <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                        if (!display || !payload || (type === LinkType.link && !isLegalLink(payload))) {
                            setShowError(true);
                            return;
                        }

                        handleSubmit();
                    }}
                >
                    {localeService.t('hyperLink.form.ok')}
                </Button>
            </div>
        </div>
    );
};

CellLinkEdit.componentKey = 'univer.sheet.cell-link-edit';
