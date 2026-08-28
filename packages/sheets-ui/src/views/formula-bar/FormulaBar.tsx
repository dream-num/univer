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

import type { IUniverSheetsUIConfig } from '../../config/config';
import type { LocaleKey } from '../../locale/types';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import {
    ColorKit,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    IPermissionService,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
import { borderBottomClassName, borderRightClassName, clsx, resetButtonClassName } from '@univerjs/design';
import { IEditorService, MobileRichTextToolbar } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkIcon, CloseIcon, DownIcon, FxIcon } from '@univerjs/icons';
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
    useComponentsOfPart,
    useConfigValue,
    useDependency,
    useObservable,
} from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, map, merge, of, switchMap } from 'rxjs';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import {
    MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID,
    MOBILE_FORMULA_OPERATOR_BAR_HEIGHT,
    MOBILE_FORMULA_OPERATORS_VISIBLE,
} from '../../consts/mobile-context';
import { SheetsUIPart } from '../../consts/ui-name';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { DefinedName } from '../defined-name/DefinedName';
import { useKeyEventConfig } from '../editor-container/hooks';
import { useActiveWorkbook } from '../hook';

enum ArrowDirection {
    Down,
    Up,
}

interface IProps {
    className?: string;
    disableDefinedName?: boolean;
    mobile?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
}

const MOBILE_FORMULA_OPERATORS = [
    { label: '+', value: '+' },
    { label: '−', value: '-' },
    { label: '×', value: '*' },
    { label: '÷', value: '/' },
    { label: '=', value: '=' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: ',', value: ',' },
    { label: ':', value: ':' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '&', value: '&' },
    { label: '!', value: '!' },
] as const;

const MIN_EDITOR_TEXT_CONTRAST = 4.5;

function resolveMobileEditorBackground(
    backgroundColor: string | null | undefined,
    textColor: string | null | undefined,
    lightBackground: string | null | undefined,
    darkBackground: string | null | undefined
): string | undefined {
    const background = backgroundColor ?? lightBackground ?? undefined;
    if (!background || !textColor || !lightBackground || !darkBackground
        || !new ColorKit(textColor).isValid || !new ColorKit(background).isValid) {
        return background;
    }

    if (ColorKit.getContrastRatio(textColor, background) >= MIN_EDITOR_TEXT_CONTRAST) {
        return background;
    }

    return ColorKit.getContrastRatio(textColor, darkBackground) >= ColorKit.getContrastRatio(textColor, lightBackground)
        ? darkBackground
        : lightBackground;
}

export function FormulaBar(props: IProps) {
    const { className, disableDefinedName, expanded = false, mobile = false, onExpandedChange } = props;
    const editorBridgeService = useDependency(IEditorBridgeService);
    const localeService = useDependency(LocaleService);
    const iconActivated = useObservable(
        () => editorBridgeService.visible$.pipe(map((visibleInfo) => visibleInfo.visible)),
        false,
        false,
        [editorBridgeService]
    );
    const [arrowDirection, setArrowDirection] = useState<ArrowDirection>(ArrowDirection.Down);
    const [mobileFxRequest, setMobileFxRequest] = useState(0);
    const [mobileFunctionPanelRequest, setMobileFunctionPanelRequest] = useState(0);
    const [mobileFormulaActive, setMobileFormulaActive] = useState(false);
    const [mobileOperatorRequest, setMobileOperatorRequest] = useState({ id: 0, value: '' });
    const isExpanded = mobile ? expanded : arrowDirection === ArrowDirection.Up;
    const mobileFormulaOperatorsVisible = mobile && mobileFormulaActive && !isExpanded;
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const selectionManager = useDependency(SheetsSelectionsService);
    const permissionService = useDependency(IPermissionService);
    const rangeProtectionCache = useDependency(RangeProtectionCache);
    const commandService = useDependency(ICommandService);
    const imageDisable = useObservable(
        () => editorBridgeService.currentEditCellState$.pipe(map((state) => Boolean(
            state?.documentLayoutObject.documentModel?.getBody()?.customBlocks?.length
        ))),
        false,
        false,
        [editorBridgeService]
    );
    const componentManager = useDependency(ComponentManager);
    const workbook = useActiveWorkbook();
    const editState = useObservable(editorBridgeService.currentEditCellState$);
    const keyCodeConfig = useKeyEventConfig(editState?.unitId);
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const formulaAuxUIParts = useComponentsOfPart(SheetsUIPart.FORMULA_AUX);
    const contextService = useDependency(IContextService);
    const themeService = useDependency(ThemeService);
    useObservable(() => themeService.currentTheme$, undefined, false, [themeService]);
    const isFocusFxBar = useObservable(
        useMemo(() => contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR), [contextService]),
        contextService.getContextValue(FOCUSING_FX_BAR_EDITOR)
    );
    useEffect(() => {
        if (mobile) {
            contextService.setContextValue(MOBILE_FORMULA_OPERATORS_VISIBLE, mobileFormulaOperatorsVisible);
        }
    }, [contextService, mobile, mobileFormulaOperatorsVisible]);
    useEffect(() => () => {
        if (mobile) {
            contextService.setContextValue(MOBILE_FORMULA_OPERATORS_VISIBLE, false);
        }
    }, [contextService, mobile]);
    const workbookEditablePermission = useObservable(useMemo(() => {
        if (!workbook) {
            return undefined;
        }

        return permissionService.getPermissionPoint$(new WorkbookEditablePermission(workbook.getUnitId()).id);
    }, [permissionService, workbook]));
    const ref = useRef<HTMLDivElement>(null);
    const editorService = useDependency(IEditorService);
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const disableEdit = config?.disableEdit;

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
                            if (!range) return EMPTY;
                            const primary = selectionManager.getCurrentLastSelection()?.primary;
                            if (!primary) {
                                return of(null);
                            }

                            return of({
                                unitId,
                                subUnitId,
                                primary,
                            });
                        })
                    );
                }),
                map((cellInfo) => {
                    if (cellInfo) {
                        const { unitId, subUnitId, primary } = cellInfo;
                        if (worksheetProtectionRuleModel.getRule(unitId, subUnitId)) {
                            const editDisable = !(permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? true);
                            const viewDisable = !(permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? true);
                            return {
                                viewDisable,
                                editDisable,
                            };
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
        const handleResize = () => {
            if (!ref.current) return;

            const editorRect = ref.current.getBoundingClientRect();
            formulaEditorManagerService.setPosition(editorRect);
        };

        if (ref.current) {
            handleResize();
            const a = new ResizeObserver(handleResize);

            a.observe(ref.current);
            return () => a.disconnect();
        }
    }, [formulaEditorManagerService]);

    function handleArrowClick() {
        if (mobile) {
            onExpandedChange?.(!isExpanded);
            setTimeout(() => formulaEditorManagerService.handleFoldBtnClick(isExpanded), 150);
            return;
        }

        setArrowDirection(arrowDirection === ArrowDirection.Down ? ArrowDirection.Up : ArrowDirection.Down);

        const ANIMATION_DURATION = 150;
        setTimeout(() => {
            formulaEditorManagerService.handleFoldBtnClick(arrowDirection === ArrowDirection.Up);
        }, ANIMATION_DURATION);
    }

    // Handle click the "×" button.
    function handleCloseBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode: KeyCode.ESC,
                unitId: editState!.unitId,
            });
        }
        onExpandedChange?.(false);
    }

    // Handle click the "√" button.
    async function handleConfirmBtnClick() {
        if (mobile) {
            const submitted = await commandService.executeCommand(MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID);
            if (submitted) {
                onExpandedChange?.(false);
            }
            return;
        }

        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: editState!.unitId,
            });
        }
        onExpandedChange?.(false);
    }

    function handlerFxBtnClick() {
        if (mobile) {
            const formulaEditor = editorService.getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            const formulaText = formulaEditor?.getDocumentData().body?.dataStream?.replace(/\r?\n$/, '') ?? '';
            if (formulaText.startsWith('=')) {
                setMobileFxRequest((value) => value + 1);
                setMobileFunctionPanelRequest((value) => value + 1);
            }
        }
        formulaEditorManagerService.handleFxBtnClick(mobile);
    }

    // TODO Is there a need to disable an editor here?
    const { viewDisable, editDisable: permissionEditDisable } = disableInfo;
    const editDisable = permissionEditDisable || !!disableEdit;
    const workbookEditDisable = !(workbookEditablePermission?.value ?? true);
    const editorActivationDisable = editDisable || workbookEditDisable;
    const disabled = editDisable || imageDisable;
    const shouldSkipFocusRef = useRef(false);

    const handlePointerDown = () => {
        try {
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);

            // When clicking on the formula bar, the cell editor also needs to enter the edit state
            const visibleState = editorBridgeService.isVisible();
            if (visibleState.visible === false) {
                if (editorActivationDisable) {
                    editorService.focus(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
                    return;
                }

                const result = commandService.syncExecuteCommand(
                    SetCellEditVisibleOperation.id,
                    {
                        visible: true,
                        eventType: DeviceInputEventType.PointerDown,
                        unitId: editState!.unitId,
                    } as IEditorBridgeServiceVisibleParam
                );
                // cancel by event
                if (!result) {
                    contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
                    shouldSkipFocusRef.current = true;
                }
                // undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            }
        } catch (e) {
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
            shouldSkipFocusRef.current = true;
            throw e;
        }
    };

    const handlePointerUp = () => {
        if (shouldSkipFocusRef.current) {
            setTimeout(() => {
                editorService.blur(true);
            }, 30);
        }
        shouldSkipFocusRef.current = false;
    };

    const cellImage = isCellImage(editState?.documentLayoutObject.documentModel?.getSnapshot());
    const hideEditor = cellImage || viewDisable;
    const editorDocument = editState?.documentLayoutObject.documentModel?.getSnapshot();
    const cellStyle = editState
        ? workbook?.getSheetBySheetId(editState.sheetId)?.getCellStyle(editState.row, editState.column)
        : undefined;
    const lightEditorBackground = themeService.getColorFromTheme('gray.0') || undefined;
    const darkEditorBackground = themeService.getColorFromTheme('gray.900') || undefined;
    const editorTextColor = editorDocument?.body?.textRuns?.[0]?.ts?.cl?.rgb
        ?? editorDocument?.documentStyle?.textStyle?.cl?.rgb
        ?? cellStyle?.cl?.rgb
        ?? darkEditorBackground;
    const cellBackground = cellStyle?.bg?.rgb ?? undefined;
    const editorBackground = mobile
        ? resolveMobileEditorBackground(
            cellBackground,
            editorTextColor,
            lightEditorBackground,
            darkEditorBackground
        )
        : undefined;

    return (
        <div
            dir="ltr"
            data-u-comp="formula-bar"
            data-expanded={isExpanded}
            className={clsx(`
              univer-box-border univer-flex univer-bg-gray-0 univer-text-gray-900 univer-transition-[height]
              univer-ease-linear
              dark:!univer-bg-gray-800
            `, borderBottomClassName, className, {
                'univer-relative': mobile,
                '!univer-h-12': mobile && !isExpanded,
                '!univer-h-full': mobile && isExpanded,
                'univer-h-7': !mobile && !isExpanded,
                'univer-h-20': !mobile && isExpanded,
                'univer-pointer-events-none': editDisable,
            })}
        >
            <div className="univer-relative univer-box-border univer-h-full univer-w-[100px]">
                <DefinedName disable={disableDefinedName ?? editDisable} />
            </div>
            {mobileFormulaOperatorsVisible && (
                <div
                    data-u-comp="mobile-formula-operators"
                    className="
                      univer-absolute univer-inset-x-0 univer-bottom-full univer-z-20 univer-box-border univer-flex
                      univer-items-center univer-gap-0 univer-overflow-x-auto univer-bg-gray-0 univer-px-0
                      univer-shadow-[0_-4px_12px_rgba(0,0,0,0.08)]
                      dark:!univer-bg-gray-800
                    "
                    style={{ height: MOBILE_FORMULA_OPERATOR_BAR_HEIGHT, scrollbarWidth: 'none', touchAction: 'pan-x' }}
                >
                    {MOBILE_FORMULA_OPERATORS.map((operator) => (
                        <button
                            key={operator.label}
                            type="button"
                            className="
                              univer-flex univer-size-8 univer-shrink-0 univer-appearance-none univer-items-center
                              univer-justify-center univer-rounded-lg univer-border-0 univer-bg-transparent univer-p-0
                              univer-text-base univer-font-medium univer-text-gray-800 univer-outline-none
                              active:univer-scale-95 active:univer-bg-primary-100 active:univer-text-primary-700
                              dark:!univer-text-gray-100
                              dark:active:!univer-bg-primary-900
                            "
                            onPointerDown={(event) => {
                                event.stopPropagation();
                            }}
                            onClick={() => setMobileOperatorRequest(({ id }) => ({ id: id + 1, value: operator.value }))}
                        >
                            {operator.label}
                        </button>
                    ))}
                </div>
            )}
            {mobile && isExpanded && !mobileFormulaActive && (
                <MobileRichTextToolbar
                    editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                    className="univer-absolute univer-inset-x-0 univer-top-12 univer-z-20"
                />
            )}

            <div className="univer-flex univer-size-full">
                {mobile && isExpanded
                    ? (
                        <div
                            data-u-comp="formula-bar-actions"
                            className="
                              univer-absolute univer-inset-x-0 univer-top-0 univer-z-30 univer-grid univer-h-12
                              univer-grid-cols-4 univer-gap-1 univer-bg-gray-0 univer-px-1
                              dark:!univer-bg-gray-800
                            "
                        >
                            {[
                                { label: localeService.t<LocaleKey>('sheets-ui.button.cancel'), icon: <CloseIcon />, onClick: handleCloseBtnClick, color: 'univer-text-red-600 dark:!univer-text-red-400' },
                                { label: localeService.t<LocaleKey>('sheets-ui.button.confirm'), icon: <CheckMarkIcon />, onClick: handleConfirmBtnClick, color: 'univer-text-green-600 dark:!univer-text-green-400' },
                                { label: localeService.t<LocaleKey>('sheets-ui.mobile.formula'), icon: <FxIcon />, onClick: handlerFxBtnClick, color: 'univer-text-gray-700 dark:!univer-text-gray-100' },
                                { label: localeService.t<LocaleKey>('sheets-ui.mobile.collapseEditor'), icon: <DownIcon />, onClick: handleArrowClick, color: 'univer-text-gray-700 dark:!univer-text-gray-100' },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    aria-label={action.label}
                                    className={clsx(resetButtonClassName, `
                                      univer-flex univer-h-full univer-items-center univer-justify-center
                                      univer-rounded-lg univer-text-xl
                                      active:univer-scale-95 active:univer-bg-gray-100
                                      dark:active:!univer-bg-gray-700
                                    `, action.color)}
                                    onClick={action.onClick}
                                >
                                    {action.icon}
                                </button>
                            ))}
                        </div>
                    )
                    : (
                        <div
                            className={clsx({
                                'univer-py-1.5': !mobile,
                                'univer-py-1': mobile,
                                'univer-cursor-not-allowed univer-text-gray-200': disabled,
                            })}
                        >
                            <div
                                data-u-comp="formula-bar-actions"
                                className={clsx(`
                                  univer-relative univer-box-border univer-flex univer-h-full univer-w-20
                                  univer-items-center univer-justify-center univer-text-xs
                                `, borderRightClassName, { '!univer-w-32': mobile })}
                            >
                                {/* TODO: use buttons to replace these re-implementation of buttons. */}
                                <span
                                    className={clsx(`
                                      univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1
                                      univer-text-base
                                      dark:!univer-text-gray-0
                                    `, {
                                        'univer-cursor-pointer univer-text-red-600 hover:univer-bg-gray-100 dark:!univer-text-green-400 dark:hover:!univer-bg-gray-700': iconActivated,
                                    })}
                                    onClick={handleCloseBtnClick}
                                >
                                    <CloseIcon />
                                </span>
                                <span
                                    className={clsx(`
                                      univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1
                                      univer-text-base
                                      dark:!univer-text-gray-0
                                    `, {
                                        'univer-cursor-pointer univer-text-green-600 hover:univer-bg-gray-100 dark:!univer-text-red-400 dark:hover:!univer-bg-gray-700': iconActivated,
                                    })}
                                    onClick={handleConfirmBtnClick}
                                >
                                    <CheckMarkIcon />
                                </span>
                                <span
                                    className={`
                                      univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                                      univer-rounded univer-p-1 univer-text-base
                                      hover:univer-bg-gray-100
                                      dark:!univer-text-gray-0
                                      dark:hover:!univer-bg-gray-700
                                    `}
                                    onClick={handlerFxBtnClick}
                                >
                                    <FxIcon />
                                </span>
                            </div>
                        </div>
                    )}

                <div
                    className={clsx(
                        'univer-flex univer-w-full univer-flex-1 univer-overflow-hidden',
                        {
                            'univer-pl-3': !mobile,
                            'univer-pt-24': mobile && isExpanded,
                        }
                    )}
                >
                    <div
                        ref={ref}
                        className={clsx(`
                          univer-relative univer-flex-1 univer-bg-gray-0
                          dark:!univer-bg-gray-800
                        `, {
                            'univer-box-border univer-pl-2': mobile,
                            'univer-my-2': mobile && !isExpanded,
                        })}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        style={{ backgroundColor: editorBackground, pointerEvents: hideEditor ? 'none' : 'auto' }}
                    >
                        {FormulaEditor && (
                            <FormulaEditor
                                className="univer-relative univer-size-full univer-break-words univer-outline-none"
                                borderless
                                canvasStyle={{ backgroundColor: editorBackground }}
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
                                    if (!isFocusing) return;
                                    if (isSelecting) {
                                        editorBridgeService.enableForceKeepVisible();
                                    } else {
                                        editorBridgeService.disableForceKeepVisible();
                                    }
                                }}
                                autoScrollbar={false}
                                disableContextMenu={false}
                                mobile={mobile}
                                mobileFxRequest={mobileFxRequest}
                                mobileFunctionPanelRequest={mobileFunctionPanelRequest}
                                mobileOperatorRequest={mobileOperatorRequest}
                                onMobileFormulaActiveChange={setMobileFormulaActive}
                            />
                        )}
                        {/* Cover the hidden editor instead of re-instantiating the formula editor. */}
                        {hideEditor && (
                            <div
                                className={`
                                  univer-pointer-events-none univer-relative univer-left-0 univer-top-0 univer-z-[100]
                                  univer-size-full univer-cursor-not-allowed univer-bg-gray-0
                                  dark:!univer-bg-gray-800
                                `}
                            />
                        )}
                    </div>
                    {(!mobile || !isExpanded) && (
                        <div
                            data-u-comp="formula-bar-expand"
                            className={clsx(`
                              univer-flex univer-h-full univer-w-5 univer-cursor-pointer univer-items-center
                              univer-justify-center univer-text-xs univer-text-gray-700
                              dark:!univer-text-gray-200
                            `, {
                                'univer-w-10': mobile,
                                'univer-cursor-not-allowed univer-text-gray-200 dark:!univer-text-gray-700': editDisable,
                            })}
                            onClick={handleArrowClick}
                        >
                            <DownIcon
                                className={clsx({
                                    'univer-size-5 univer-rotate-180': mobile,
                                    'univer-rotate-180': !mobile && isExpanded,
                                })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ComponentContainer key="formula-aux" components={formulaAuxUIParts} />
        </div>
    );
}
