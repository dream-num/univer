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

import type { IUniverSheetsUIConfig } from '../../../config/config';
import type { LocaleKey } from '../../../locale/types';
import type { IEditorBridgeServiceVisibleParam } from '../../../services/editor-bridge.service';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    IPermissionService,
    LocaleService,
} from '@univerjs/core';
import { borderBottomClassName, clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { DownIcon } from '@univerjs/icons';
import { UnitAction } from '@univerjs/protocol';
import {
    isCellImage,
    RangeProtectionCache,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetProtectionRuleModel,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import {
    ComponentContainer,
    ComponentManager,
    KeyCode,
    MobileKeyboardInsetContext,
    useComponentsOfPart,
    useConfigValue,
    useDependency,
    useObservable,
} from '@univerjs/ui';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, map, merge, of, switchMap } from 'rxjs';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../../common/keys';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import {
    MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID,
    MOBILE_FORMULA_OPERATORS_VISIBLE,
    MOBILE_FX_EDITOR_EXPANDED,
} from '../../../consts/mobile-context';
import { SheetsUIPart } from '../../../consts/ui-name';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../../services/editor/formula-editor-manager.service';
import { useKeyEventConfig } from '../../editor-container/hooks';
import { useActiveWorkbook } from '../../hook';
import { MobileFormulaBarActions, MobileFormulaBarOverlays } from './MobileFormulaBarControls';

export function MobileFormulaBar() {
    const editorBridgeService = useDependency(IEditorBridgeService);
    const contextService = useDependency(IContextService);
    const editorService = useDependency(IEditorService);
    const visible = useObservable(
        () => editorBridgeService.visible$.pipe(map((state) => state.visible)),
        false,
        false,
        [editorBridgeService]
    );

    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
        let cursorFrame: number | undefined;
        const contentFrame = requestAnimationFrame(() => {
            editorBridgeService.refreshEditCellState();
            editorService.focus(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            cursorFrame = requestAnimationFrame(() => {
                const editor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
                const end = Math.max(0, (editor?.getDocumentData().body?.dataStream.length ?? 2) - 2);
                editor?.setSelectionRanges([{ startOffset: end, endOffset: end }], false);
            });
        });
        return () => {
            cancelAnimationFrame(contentFrame);
            if (cursorFrame !== undefined) {
                cancelAnimationFrame(cursorFrame);
            }
        };
    }, [contextService, editorBridgeService, editorService, visible]);

    if (!visible) {
        return null;
    }

    return <MobileFormulaBarEditor />;
}

function MobileFormulaBarEditor() {
    const keyboardInset = useContext(MobileKeyboardInsetContext);
    const commandService = useDependency(ICommandService);
    const contextService = useDependency(IContextService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const editorService = useDependency(IEditorService);
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const localeService = useDependency(LocaleService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const selectionManager = useDependency(SheetsSelectionsService);
    const permissionService = useDependency(IPermissionService);
    const rangeProtectionCache = useDependency(RangeProtectionCache);
    const componentManager = useDependency(ComponentManager);
    const workbook = useActiveWorkbook();
    const editState = useObservable(editorBridgeService.currentEditCellState$);
    const keyCodeConfig = useKeyEventConfig(editState?.unitId);
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const formulaAuxUIParts = useComponentsOfPart(SheetsUIPart.FORMULA_AUX);
    const isFocusFxBar = useObservable(
        useMemo(() => contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR), [contextService]),
        contextService.getContextValue(FOCUSING_FX_BAR_EDITOR)
    );
    const workbookEditablePermission = useObservable(useMemo(() => {
        if (!workbook) {
            return undefined;
        }

        return permissionService.getPermissionPoint$(new WorkbookEditablePermission(workbook.getUnitId()).id);
    }, [permissionService, workbook]));
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const disableEdit = config?.disableEdit;
    const editorRef = useRef<HTMLDivElement>(null);
    const shouldSkipFocusRef = useRef(false);
    const [expanded, setExpanded] = useState(false);
    const [mobileFxRequest, setMobileFxRequest] = useState(0);
    const [mobileFunctionPanelRequest, setMobileFunctionPanelRequest] = useState(0);
    const [mobileFormulaActive, setMobileFormulaActive] = useState(false);
    const [mobileOperatorRequest, setMobileOperatorRequest] = useState({ id: 0, value: '' });
    const mobileFormulaOperatorsVisible = mobileFormulaActive && !expanded;

    const disableInfo = useObservable(
        () => {
            if (!workbook) {
                return EMPTY;
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return EMPTY;
                    }

                    return merge(
                        worksheetProtectionRuleModel.ruleChange$,
                        rangeProtectionRuleModel.ruleChange$,
                        selectionManager.selectionMoveEnd$,
                        selectionManager.selectionSet$
                    ).pipe(
                        switchMap(() => {
                            const unitId = workbook.getUnitId();
                            const subUnitId = worksheet.getSheetId();
                            const range = selectionManager.getCurrentLastSelection()?.range;
                            if (!range) {
                                return EMPTY;
                            }
                            const primary = selectionManager.getCurrentLastSelection()?.primary;
                            if (!primary) {
                                return of(null);
                            }

                            return of({ unitId, subUnitId, primary });
                        })
                    );
                }),
                map((cellInfo) => {
                    if (cellInfo) {
                        const { unitId, subUnitId, primary } = cellInfo;
                        if (worksheetProtectionRuleModel.getRule(unitId, subUnitId)) {
                            const editDisable = !(permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? true);
                            const viewDisable = !(permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? true);
                            return { viewDisable, editDisable };
                        }

                        const { actualRow, actualColumn } = primary;
                        const cellInfoWithPermission = rangeProtectionCache.getCellInfo(unitId, subUnitId, actualRow, actualColumn);
                        return {
                            editDisable: !(cellInfoWithPermission?.[UnitAction.Edit] ?? true),
                            viewDisable: !(cellInfoWithPermission?.[UnitAction.View] ?? true),
                        };
                    }

                    return { viewDisable: false, editDisable: false };
                })
            );
        },
        { editDisable: false, viewDisable: false },
        false,
        [
            permissionService,
            rangeProtectionCache,
            rangeProtectionRuleModel,
            selectionManager,
            workbook,
            worksheetProtectionRuleModel,
        ]
    );

    useEffect(() => {
        contextService.setContextValue(MOBILE_FORMULA_OPERATORS_VISIBLE, mobileFormulaOperatorsVisible);
    }, [contextService, mobileFormulaOperatorsVisible]);

    useEffect(() => () => {
        contextService.setContextValue(MOBILE_FORMULA_OPERATORS_VISIBLE, false);
        contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, false);
    }, [contextService]);

    useEffect(() => {
        const handleResize = () => {
            if (!editorRef.current) {
                return;
            }

            formulaEditorManagerService.setPosition(editorRef.current.getBoundingClientRect());
        };

        if (editorRef.current) {
            handleResize();
            const resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(editorRef.current);
            return () => resizeObserver.disconnect();
        }
    }, [formulaEditorManagerService]);

    function handleArrowClick() {
        contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, !expanded);
        setExpanded(!expanded);
        setTimeout(() => formulaEditorManagerService.handleFoldBtnClick(expanded), 150);
    }

    function handleCloseBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible && editState) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode: KeyCode.ESC,
                unitId: editState.unitId,
            });
        }
        contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, false);
        setExpanded(false);
    }

    async function handleConfirmBtnClick() {
        const submitted = await commandService.executeCommand(MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID);
        if (submitted) {
            contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, false);
            setExpanded(false);
        }
    }

    function handleFxBtnClick() {
        const formulaEditor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const formulaText = formulaEditor?.getDocumentData().body?.dataStream?.replace(/\r?\n$/, '') ?? '';
        if (formulaText.startsWith('=')) {
            setMobileFxRequest((value) => value + 1);
            setMobileFunctionPanelRequest((value) => value + 1);
        }
        formulaEditorManagerService.handleFxBtnClick(true);
    }

    function handlePointerDown() {
        try {
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);

            const visibleState = editorBridgeService.isVisible();
            if (visibleState.visible === false) {
                const editDisable = disableInfo.editDisable || !!disableEdit;
                const workbookEditDisable = !(workbookEditablePermission?.value ?? true);
                if (editDisable || workbookEditDisable) {
                    editorService.focus(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
                    return;
                }

                if (!editState) {
                    return;
                }
                const result = commandService.syncExecuteCommand(
                    SetCellEditVisibleOperation.id,
                    {
                        visible: true,
                        eventType: DeviceInputEventType.PointerDown,
                        unitId: editState.unitId,
                    } as IEditorBridgeServiceVisibleParam
                );
                if (!result) {
                    contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
                    shouldSkipFocusRef.current = true;
                }
            }
        } catch (error) {
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
            shouldSkipFocusRef.current = true;
            throw error;
        }
    }

    function handlePointerUp() {
        if (shouldSkipFocusRef.current) {
            setTimeout(() => editorService.blur(true), 30);
        }
        shouldSkipFocusRef.current = false;
    }

    const { viewDisable, editDisable: permissionEditDisable } = disableInfo;
    const editDisable = permissionEditDisable || !!disableEdit;
    const hideEditor = isCellImage(editState?.documentLayoutObject.documentModel?.getSnapshot()) || viewDisable;
    const editorBackground = editState
        ? workbook?.getSheetBySheetId(editState.sheetId)?.getCellStyle(editState.row, editState.column)?.bg?.rgb ?? undefined
        : undefined;

    return (
        <div
            data-u-comp="mobile-formula-bar"
            data-expanded={expanded}
            className={clsx(`
              univer-inset-x-0 univer-z-30 univer-bg-gray-0 univer-shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
              dark:!univer-bg-gray-800
            `, expanded ? 'univer-fixed univer-top-0 univer-z-50' : 'univer-absolute')}
            style={{
                bottom: keyboardInset,
                paddingBottom: expanded ? undefined : 'env(safe-area-inset-bottom, 0px)',
                paddingTop: expanded ? 'env(safe-area-inset-top, 0px)' : undefined,
            }}
        >
            <div
                dir="ltr"
                data-u-comp="formula-bar"
                data-expanded={expanded}
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-bg-gray-0 univer-text-base univer-text-gray-900
                  univer-transition-[height] univer-ease-linear
                  dark:!univer-bg-gray-800
                  [&_span]:!univer-min-h-8 [&_span]:!univer-min-w-8
                `, borderBottomClassName, expanded ? '!univer-h-full' : '!univer-h-12', {
                    'univer-pointer-events-none': editDisable,
                })}
            >
                <MobileFormulaBarOverlays
                    expanded={expanded}
                    formulaActive={mobileFormulaActive}
                    operatorsVisible={mobileFormulaOperatorsVisible}
                    editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                    onOperator={(value) => setMobileOperatorRequest(({ id }) => ({ id: id + 1, value }))}
                />
                <div className="univer-flex univer-size-full">
                    <MobileFormulaBarActions
                        expanded={expanded}
                        cancelLabel={localeService.t<LocaleKey>('sheets-ui.button.cancel')}
                        confirmLabel={localeService.t<LocaleKey>('sheets-ui.button.confirm')}
                        formulaLabel={localeService.t<LocaleKey>('sheets-ui.mobile.formula')}
                        collapseLabel={localeService.t<LocaleKey>('sheets-ui.mobile.collapseEditor')}
                        onCancel={handleCloseBtnClick}
                        onConfirm={handleConfirmBtnClick}
                        onFormula={handleFxBtnClick}
                        onCollapse={handleArrowClick}
                    />
                    <div
                        className={clsx('univer-flex univer-w-full univer-flex-1 univer-overflow-hidden', {
                            'univer-pt-24': expanded,
                        })}
                    >
                        <div
                            ref={editorRef}
                            className={clsx(`
                              univer-relative univer-box-border univer-flex-1 univer-bg-gray-0 univer-pl-2
                              dark:!univer-bg-gray-800
                            `, { 'univer-my-2': !expanded })}
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp}
                            style={{ backgroundColor: editorBackground, pointerEvents: hideEditor ? 'none' : 'auto' }}
                        >
                            {FormulaEditor && (
                                <FormulaEditor
                                    className="univer-relative univer-size-full univer-break-words univer-outline-none"
                                    borderless
                                    disableSelectionOnClick
                                    editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                                    initValue=""
                                    onChange={() => { }}
                                    isFocus={isFocusFxBar}
                                    unitId={editState?.unitId}
                                    subUnitId={editState?.sheetId}
                                    isSupportAcrossSheet
                                    resetSelectionOnBlur={false}
                                    isSingle={false}
                                    keyboardEventConfig={keyCodeConfig}
                                    onFormulaSelectingChange={(isSelecting: 0 | 1 | 2, isFocusing: boolean) => {
                                        if (!isFocusing) {
                                            return;
                                        }
                                        if (isSelecting) {
                                            editorBridgeService.enableForceKeepVisible();
                                        } else {
                                            editorBridgeService.disableForceKeepVisible();
                                        }
                                    }}
                                    autoScrollbar={false}
                                    disableContextMenu={false}
                                    mobileFxRequest={mobileFxRequest}
                                    mobileFunctionPanelRequest={mobileFunctionPanelRequest}
                                    mobileOperatorRequest={mobileOperatorRequest}
                                    onMobileFormulaActiveChange={setMobileFormulaActive}
                                />
                            )}
                            {hideEditor && (
                                <div
                                    className="
                                      univer-pointer-events-none univer-relative univer-left-0 univer-top-0
                                      univer-z-[100] univer-size-full univer-cursor-not-allowed univer-bg-gray-0
                                      dark:!univer-bg-gray-800
                                    "
                                />
                            )}
                        </div>
                        {!expanded && (
                            <div
                                data-u-comp="formula-bar-expand"
                                className={clsx(`
                                  univer-flex univer-h-full univer-w-10 univer-cursor-pointer univer-items-center
                                  univer-justify-center univer-text-xs univer-text-gray-700
                                  dark:!univer-text-gray-200
                                `, {
                                    'univer-cursor-not-allowed univer-text-gray-200 dark:!univer-text-gray-700': editDisable,
                                })}
                                onClick={handleArrowClick}
                            >
                                <DownIcon className="univer-size-5 univer-rotate-180" />
                            </div>
                        )}
                    </div>
                </div>
                <ComponentContainer key="formula-aux" components={formulaAuxUIParts} />
            </div>
        </div>
    );
}
