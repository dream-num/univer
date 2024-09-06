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
import { BuildTextUtils, createInternalEditorID, CustomRangeType, DOCS_ZEN_EDITOR_UNIT_ID_KEY, generateRandomId, ICommandService, isValidRange, IUniverInstanceService, LocaleService, Tools, UniverInstanceType, useDependency } from '@univerjs/core';
import type { DocumentDataModel, IUnitRangeWithName, Nullable, Workbook } from '@univerjs/core';
import { IZenZoneService, RangeSelector, useEvent, useObservable } from '@univerjs/ui';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeToRefString, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { IEditorBridgeService, IMarkSelectionService, ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { TextSelectionManagerService } from '@univerjs/docs';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { CloseHyperLinkPopupOperation } from '../../commands/operations/popup.operations';
import { getCellValueOrigin, isLegalLink, serializeUrl } from '../../common/util';
import { SheetsHyperLinkSidePanelService } from '../../services/side-panel.service';
import { AddHyperLinkCommand, AddRichHyperLinkCommand } from '../../commands/commands/add-hyper-link.command';
import { UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from '../../commands/commands/update-hyper-link.command';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import styles from './index.module.less';

export const CellLinkEdit = () => {
    const [id, setId] = useState('');
    const [hide, setHide] = useState(false);
    const [display, setDisplay] = useState('');
    const [showLabel, setShowLabel] = useState(true);
    const [type, setType] = useState<SheetHyperLinkType | string>(SheetHyperLinkType.URL);
    const [payload, setPayload] = useState('');
    const localeService = useDependency(LocaleService);
    const definedNameService = useDependency(IDefinedNamesService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const editing = useObservable(popupService.currentEditing$);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const commandService = useDependency(ICommandService);
    const sidePanelService = useDependency(SheetsHyperLinkSidePanelService);
    const sidePanelOptions = useMemo(() => sidePanelService.getOptions(), [sidePanelService]);
    const zenZoneService = useDependency(IZenZoneService);
    const markSelectionService = useDependency(IMarkSelectionService);
    const textSelectionService = useDependency(TextSelectionManagerService);
    const customHyperLinkSidePanel = useMemo(() => {
        if (sidePanelService.isBuiltInLinkType(type)) {
            return;
        }
        return sidePanelService.getCustomHyperLink(type);
    }, [sidePanelService, type]);

    const [showError, setShowError] = useState(false);

    const setByPayload = useRef(false);

    useEffect(() => {
        if (editing?.row !== undefined && editing.col !== undefined) {
            const { label, customRange, row, col } = editing;
            let link;
            if (customRange) {
                link = {
                    id: customRange?.rangeId ?? '',
                    display: label ?? '',
                    payload: customRange?.properties?.url ?? '',
                    row,
                    column: col,
                };
            } else {
                if (editing.type === HyperLinkEditSourceType.VIEWING) {
                    const workbook = univerInstanceService.getUnit<Workbook>(editing.unitId);
                    const worksheet = workbook?.getSheetBySheetId(editing.subUnitId);
                    const cell = worksheet?.getCellRaw(editing.row, editing.col);
                    const range = cell?.p?.body?.customRanges?.find((range) => range.rangeType === CustomRangeType.HYPERLINK && range.properties?.url);
                    const cellValue = `${getCellValueOrigin(cell) ?? ''}`;
                    if (cell && (cell.p || cellValue)) {
                        setShowLabel(false);
                    }
                    link = {
                        id: '',
                        display: '',
                        payload: range?.properties?.url ?? '',
                        row,
                        column: col,
                    };
                } else {
                    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                    const selection = textSelectionService.getActiveTextRangeWithStyle();
                    const customRange = selection && BuildTextUtils.customRange.getCustomRangesInterestsWithRange(selection, doc?.getBody()?.customRanges ?? [])?.[0];

                    setShowLabel(false);
                    link = {
                        id: '',
                        display: label ?? '',
                        payload: customRange?.properties?.url ?? '',
                        row,
                        column: col,
                    };
                }
            }

            setId(link.id);
            const customLink = sidePanelService.findCustomHyperLink(link);
            if (customLink) {
                const customLinkInfo = customLink.convert(link);
                setType(customLinkInfo.type);
                setPayload(customLinkInfo.payload);
                setDisplay(customLinkInfo.display);
                return;
            }
            setDisplay(link.display);
            const linkInfo = resolverService.parseHyperLink(link.payload);
            setType(linkInfo.type === SheetHyperLinkType.INVALID ? SheetHyperLinkType.RANGE : linkInfo.type);
            switch (linkInfo.type) {
                case SheetHyperLinkType.URL:{
                    setPayload(linkInfo.url);
                    if (linkInfo.url === link.display) {
                        setByPayload.current = true;
                    }
                    break;
                }
                case SheetHyperLinkType.RANGE:{
                    const params = linkInfo.searchObj!;
                    const sheetName = params.gid ?
                        univerInstanceService
                            .getUnit<Workbook>(editing.unitId)
                            ?.getSheetBySheetId(params.gid)
                            ?.getName()
                            ?? ''
                        : '';
                    const payload = (serializeRangeWithSheet(sheetName, deserializeRangeWithSheet(params.range!).range));
                    setPayload(payload);
                    if (payload === link.display) {
                        setByPayload.current = true;
                    }
                    break;
                }
                case SheetHyperLinkType.SHEET:{
                    const params = linkInfo.searchObj!;
                    setPayload(params.gid!);
                    break;
                }
                case SheetHyperLinkType.DEFINE_NAME:{
                    const params = linkInfo.searchObj!;
                    setPayload(params.rangeid!);
                    break;
                }
                default:
                    setPayload('');
                    break;
            }
        }
    }, [editing, resolverService, sidePanelService, textSelectionService, univerInstanceService]);

    useEffect(() => {
        let id: Nullable<string> = null;
        if (editing && editing.type === HyperLinkEditSourceType.VIEWING && Tools.isDefine(editing.row) && Tools.isDefine(editing.col)) {
            id = markSelectionService.addShape(
                {
                    range: {
                        startColumn: editing.col,
                        endColumn: editing.col,
                        startRow: editing.row,
                        endRow: editing.row,
                    },
                    style: {
                        hasAutoFill: false,
                        fill: 'rgb(255, 189, 55, 0.35)',
                        strokeWidth: 1,
                        stroke: '#FFBD37',
                        widgets: {},
                    },
                    primary: null,
                },
                [],
                -1
            );
        }
        return () => {
            if (id) {
                markSelectionService.removeShape(id);
            }
        };
    }, [editing, markSelectionService]);

    const payloadInitial = useMemo(() => payload, [type]);

    const linkTypeOptions: Array<{
        label: string;
        value: SheetHyperLinkType | string;
    }> = [
        {
            label: localeService.t('hyperLink.form.link'),
            value: SheetHyperLinkType.URL,
        },
        {
            label: localeService.t('hyperLink.form.range'),
            value: SheetHyperLinkType.RANGE,
        },
        {
            label: localeService.t('hyperLink.form.worksheet'),
            value: SheetHyperLinkType.SHEET,
        },
        {
            label: localeService.t('hyperLink.form.definedName'),
            value: SheetHyperLinkType.DEFINE_NAME,
        },
        ...sidePanelOptions,
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

    const formatUrl = (type: SheetHyperLinkType | string, payload: string) => {
        if (type === SheetHyperLinkType.URL) {
            return serializeUrl(payload);
        }

        if (type === SheetHyperLinkType.RANGE) {
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
            range.sheetName = workbook.getActiveSheet()?.getName() || '';
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
                const commandId = (editing.type === HyperLinkEditSourceType.ZEN_EDITOR || editing.type === HyperLinkEditSourceType.EDITING) ? UpdateRichHyperLinkCommand.id : UpdateHyperLinkCommand.id;
                await commandService.executeCommand(commandId, {
                    id,
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    payload: {
                        display: showLabel ? display : '',
                        payload: formatUrl(type, payload),
                    },
                    row: editing.row,
                    column: editing.col,
                    documentId: editing.type === HyperLinkEditSourceType.ZEN_EDITOR ?
                        DOCS_ZEN_EDITOR_UNIT_ID_KEY
                        : editorBridgeService.getCurrentEditorId(),
                });
            } else {
                const commandId = (editing.type === HyperLinkEditSourceType.ZEN_EDITOR || editing.type === HyperLinkEditSourceType.EDITING) ? AddRichHyperLinkCommand.id : AddHyperLinkCommand.id;
                await commandService.executeCommand(commandId, {
                    unitId: editing.unitId,
                    subUnitId: editing.subUnitId,
                    link: {
                        id: generateRandomId(),
                        row: editing.row,
                        column: editing.col,
                        payload: formatUrl(type, payload),
                        display: showLabel ? display : '',
                    },
                    documentId: editing.type === HyperLinkEditSourceType.ZEN_EDITOR ?
                        DOCS_ZEN_EDITOR_UNIT_ID_KEY
                        : editorBridgeService.getCurrentEditorId(),
                });
            }
        }
        if (editing?.type === HyperLinkEditSourceType.VIEWING) {
            await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: editing.unitId,
                subUnitId: editing.subUnitId,
            });

            const GAP = 1;
            await commandService.executeCommand(ScrollToRangeOperation.id, {
                range: {
                    startRow: Math.max(editing.row - GAP, 0),
                    endRow: editing.row + GAP,
                    startColumn: Math.max(editing.col - GAP, 0),
                    endColumn: editing.col + GAP,
                },
            });
        }

        commandService.executeCommand(CloseHyperLinkPopupOperation.id);
    };

    if (!editing) {
        return null;
    }

    return (
        <div className={styles.cellLinkEdit} style={{ display: hide ? 'none' : 'block' }}>
            {showLabel
                ? (
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
                )
                : null}
            <FormLayout label={localeService.t('hyperLink.form.type')} contentStyle={{ marginBottom: 0 }}>
                <Select
                    options={linkTypeOptions}
                    value={type}
                    onChange={(newType) => {
                        setType(newType as SheetHyperLinkType);
                        setPayload('');
                    }}
                />
            </FormLayout>
            {type === SheetHyperLinkType.URL && (
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
            {type === SheetHyperLinkType.RANGE && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.inputError') : ''}>
                    <RangeSelector
                        openForSheetUnitId={workbook.getUnitId()}
                        id={createInternalEditorID('hyper-link-edit')}
                        isSingleChoice
                        value={payloadInitial}
                        onChange={handleRangeChange}
                        disableInput={editing.type === HyperLinkEditSourceType.ZEN_EDITOR}
                        onSelectorVisibleChange={async (visible) => {
                            if (visible) {
                                if (editing.type === HyperLinkEditSourceType.ZEN_EDITOR) {
                                    zenZoneService.hide();
                                }
                                setHide(true);
                            } else {
                                await resolverService.navigateToRange(editing.unitId, editing.subUnitId, { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col });
                                if (editing.type === HyperLinkEditSourceType.ZEN_EDITOR) {
                                    zenZoneService.show();
                                }
                                setHide(false);
                            }
                        }}
                    />
                </FormLayout>
            )}
            {type === SheetHyperLinkType.SHEET && (
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
            {type === SheetHyperLinkType.DEFINE_NAME && (
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
            {customHyperLinkSidePanel?.Form && (
                <customHyperLinkSidePanel.Form
                    linkId={id}
                    payload={payload}
                    display={display}
                    showError={showError}
                    setByPayload={setByPayload}
                    setDisplay={(newLink) => {
                        setDisplay(newLink);
                        setByPayload.current = true;
                    }}
                    setPayload={setPayload}
                />
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
                        commandService.executeCommand(CloseHyperLinkPopupOperation.id);
                    }}
                >
                    {localeService.t('hyperLink.form.cancel')}
                </Button>
                <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                        if ((showLabel && !display) || !payload || (type === SheetHyperLinkType.URL && !isLegalLink(payload))) {
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
