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

import type { DocumentDataModel, Nullable, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle, ISetSelectionsOperationParams } from '@univerjs/sheets';
import {
    BuildTextUtils,
    ColorKit,
    CustomRangeType,
    DataStreamTreeTokenType,
    DisposableCollection,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    FOCUSING_SHEET,
    generateRandomId,
    ICommandService,
    IContextService,
    isValidRange,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { borderClassName, Button, clsx, FormLayout, Input, Select } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocBackScrollRenderController, DocSelectionRenderService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, IDefinedNamesService, serializeRange, serializeRangeToRefString, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetSelectionsOperation, SetWorksheetActiveOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { RangeSelector } from '@univerjs/sheets-formula-ui';
import { AddHyperLinkCommand, AddRichHyperLinkCommand, SheetHyperLinkType, SheetsHyperLinkParserService, UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService, IMarkSelectionService, ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { IZenZoneService, KeyCode, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloseHyperLinkPopupOperation } from '../../commands/operations/popup.operations';
import { isLegalLink, serializeUrl } from '../../common/util';
import { SheetsHyperLinkPopupService } from '../../services/popup.service';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { SheetsHyperLinkSidePanelService } from '../../services/side-panel.service';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';

export const CellLinkEdit = () => {
    const [id, setId] = useState('');
    const [hide, setHide] = useState(false);
    const [display, _setDisplay] = useState('');
    const [showLabel, setShowLabel] = useState(true);
    const [type, setType] = useState<SheetHyperLinkType | string>(SheetHyperLinkType.URL);
    const [payload, setPayload] = useState('');

    const localeService = useDependency(LocaleService);
    const definedNameService = useDependency(IDefinedNamesService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const popupService = useDependency(SheetsHyperLinkPopupService);
    const editing = useObservable(popupService.currentEditing$);
    const parserService = useDependency(SheetsHyperLinkParserService);
    const resolverService = useDependency(SheetsHyperLinkResolverService);
    const commandService = useDependency(ICommandService);
    const sidePanelService = useDependency(SheetsHyperLinkSidePanelService);
    const sidePanelOptions = useMemo(() => sidePanelService.getOptions(), [sidePanelService]);
    const zenZoneService = useDependency(IZenZoneService);
    const renderManagerService = useDependency(IRenderManagerService);
    const markSelectionService = useDependency(IMarkSelectionService);
    const textSelectionService = useDependency(DocSelectionManagerService);
    const contextService = useDependency(IContextService);
    const themeService = useDependency(ThemeService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const [selectorDialogVisible, setSelectorDialogVisible] = useState(false);
    const sheetsSelectionService = useDependency(SheetsSelectionsService);
    const selections = useMemo(() => sheetsSelectionService.getCurrentSelections(), []);

    const customHyperLinkSidePanel = useMemo(() => {
        if (sidePanelService.isBuiltInLinkType(type)) {
            return;
        }
        return sidePanelService.getCustomHyperLink(type);
    }, [sidePanelService, type]);

    const [showError, setShowError] = useState(false);

    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(false);

    const setByPayload = useRef(false);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

    const subUnitId = workbook?.getActiveSheet().getSheetId() || '';
    // to polyfill the display value on old version data
    // case split tag is no longer needed
    const setDisplay = useCallback((value: string) => {
        _setDisplay(value.replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '').replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, ''));
    }, [_setDisplay]);

    useEffect(() => {
        if (editing?.row !== undefined && editing.col !== undefined) {
            const { customRange, row, col } = editing;
            let { label } = editing;
            if (typeof label === 'number') {
                label = `${label}`;
            }

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
                    const cellValue = cell?.v;
                    if (cell && (!BuildTextUtils.transform.isEmptyDocument(cell.p?.body?.dataStream) || Tools.isDefine(cellValue))) {
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
                    const currentSelection = textSelectionService.getActiveTextRange();
                    const body = doc?.getBody();
                    const selection = currentSelection && body ? currentSelection : null;
                    const customRange = selection && BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, body?.customRanges ?? [])?.[0];

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
            const linkInfo = parserService.parseHyperLink(link.payload);
            setType(linkInfo.type === SheetHyperLinkType.INVALID ? SheetHyperLinkType.RANGE : linkInfo.type);
            switch (linkInfo.type) {
                case SheetHyperLinkType.URL: {
                    setPayload(linkInfo.url);
                    if (linkInfo.url === link.display) {
                        setByPayload.current = true;
                    }
                    break;
                }
                case SheetHyperLinkType.RANGE: {
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
                case SheetHyperLinkType.SHEET: {
                    const params = linkInfo.searchObj!;
                    setPayload(params.gid!);
                    break;
                }
                case SheetHyperLinkType.DEFINE_NAME: {
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
        if (editing && !editing.customRangeId && editing.type === HyperLinkEditSourceType.VIEWING && Tools.isDefine(editing.row) && Tools.isDefine(editing.col)) {
            const workbook = univerInstanceService.getUnit<Workbook>(editing.unitId, UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getSheetBySheetId(editing.subUnitId);
            const mergeInfo = worksheet?.getMergedCell(editing.row, editing.col);
            const color = new ColorKit(themeService.getColorFromTheme('primary.600')).toRgb();
            id = markSelectionService.addShape(
                {
                    range: mergeInfo ?? {
                        startColumn: editing.col,
                        endColumn: editing.col,
                        startRow: editing.row,
                        endRow: editing.row,
                    },
                    style: {
                        // hasAutoFill: false,
                        fill: `rgb(${color.r}, ${color.g}, ${color.b}, 0.12)`,
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
    }, [editing, markSelectionService, themeService, univerInstanceService]);

    useEffect(() => {
        isFocusRangeSelectorSet(type === SheetHyperLinkType.RANGE);
    }, [type]);

    useEffect(() => {
        const render = editing?.type === HyperLinkEditSourceType.ZEN_EDITOR ?
            renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY) :
            renderManagerService.getRenderById(editorBridgeService.getCurrentEditorId());
        const disposeCollection = new DisposableCollection();

        if (render) {
            const selectionRenderService = render.with(DocSelectionRenderService);
            selectionRenderService.setReserveRangesStatus(true);
            disposeCollection.add(() => {
                selectionRenderService.setReserveRangesStatus(false);
            });
        }

        return () => {
            editorBridgeService.disableForceKeepVisible();
            disposeCollection.dispose();
        };
    }, [editing?.type, editorBridgeService, renderManagerService]);

    useEffect(() => {
        if (isFocusRangeSelector) {
            popupService.setIsKeepVisible(isFocusRangeSelector);
        }
        popupService.setIsKeepVisible(selectorDialogVisible);

        return () => {
            popupService.setIsKeepVisible(false);
        };
    }, [isFocusRangeSelector, selectorDialogVisible, popupService]);

    useEffect(() => {
        return () => {
            if (zenZoneService.temporaryHidden) {
                zenZoneService.show();
                contextService.setContextValue(FOCUSING_SHEET, false);
            }
        };
    }, [contextService, zenZoneService]);

    useEffect(() => {
        if (isFocusRangeSelector) {
            editorBridgeService.enableForceKeepVisible();

            return () => {
                editorBridgeService.disableForceKeepVisible();
            };
        }
    }, [isFocusRangeSelector, editorBridgeService]);

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

    const handleRangeChange = useEvent((rangeText: string) => {
        const newValue = rangeText.split(',').map(deserializeRangeWithSheet);
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
        if ((showLabel && !display) || !payload || (type === SheetHyperLinkType.URL && !isLegalLink(payload))) {
            setShowError(true);
            return;
        }

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
        <div
            className={clsx(`
              univer-box-border univer-w-[296px] univer-rounded-xl univer-bg-white univer-p-4 univer-shadow-md
              dark:univer-bg-gray-900
            `, borderClassName)}
        >
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
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.keyCode === KeyCode.ENTER) {
                                    handleSubmit();
                                }
                            }}
                        />
                    </FormLayout>
                )
                : null}
            <FormLayout label={localeService.t('hyperLink.form.type')}>
                <Select
                    className="univer-w-full"
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
                            if (newLink && (setByPayload.current || !display || display === newLink)) {
                                setDisplay(newLink);
                                setByPayload.current = true;
                            }
                        }}
                        placeholder={localeService.t('hyperLink.form.linkPlaceholder')}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.keyCode === KeyCode.ENTER) {
                                handleSubmit();
                            }
                        }}
                    />
                </FormLayout>
            )}
            {type === SheetHyperLinkType.RANGE && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.inputError') : ''}>
                    <RangeSelector
                        unitId={workbook.getUnitId()}
                        subUnitId={subUnitId}
                        maxRangeCount={1}
                        supportAcrossSheet
                        initialValue={payload}
                        resetRange={selections as ISelectionWithStyle[]}
                        onChange={(_, text) => handleRangeChange(text)}
                        onRangeSelectorDialogVisibleChange={async (visible) => {
                            setSelectorDialogVisible(visible);
                            if (visible) {
                                if (editing.type === HyperLinkEditSourceType.ZEN_EDITOR) {
                                    zenZoneService.hide();
                                    contextService.setContextValue(FOCUSING_SHEET, true);
                                }
                                if (editing.type !== HyperLinkEditSourceType.VIEWING) {
                                    editorBridgeService.enableForceKeepVisible();
                                }
                                setHide(true);
                            } else {
                                await resolverService.navigateToRange(editing.unitId, editing.subUnitId, { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col }, true);
                                if (editing.type === HyperLinkEditSourceType.ZEN_EDITOR) {
                                    await commandService.executeCommand(SetSelectionsOperation.id, {
                                        unitId: editing.unitId,
                                        subUnitId: editing.subUnitId,
                                        selections: [{ range: { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col } }],
                                    } as ISetSelectionsOperationParams);

                                    zenZoneService.show();
                                    contextService.setContextValue(FOCUSING_SHEET, false);
                                    const docBackScrollRenderController = renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)?.with(DocBackScrollRenderController);
                                    const range = docSelectionManagerService.getTextRanges({ unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY })?.[0];

                                    if (docBackScrollRenderController && range) {
                                        docBackScrollRenderController.scrollToRange(range);
                                        docSelectionManagerService.refreshSelection({ unitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY });
                                    }
                                }
                                editorBridgeService.disableForceKeepVisible();
                                setHide(false);
                            }
                        }}
                        onFocusChange={(focus) => isFocusRangeSelectorSet(focus)}
                    />
                </FormLayout>
            )}
            {type === SheetHyperLinkType.SHEET && (
                <FormLayout error={showError && !payload ? localeService.t('hyperLink.form.selectError') : ''}>
                    <Select
                        className="univer-w-full"
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
                        className="univer-w-full"
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
            <div className="univer-flex univer-flex-row univer-justify-end">
                <Button
                    onClick={() => {
                        if (editing) {
                            resolverService.navigateToRange(editing.unitId, editing.subUnitId, { startRow: editing.row, endRow: editing.row, startColumn: editing.col, endColumn: editing.col }, true);
                        }
                        commandService.executeCommand(CloseHyperLinkPopupOperation.id);
                    }}
                >
                    {localeService.t('hyperLink.form.cancel')}
                </Button>
                <Button
                    variant="primary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
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
