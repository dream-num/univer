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

import type { IUnitRangeName, Nullable } from '@univerjs/core';
import type { Editor, IRichTextEditorProps } from '@univerjs/docs-ui';
import type { ISelectionWithStyle, ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { MobileDrawerSnap } from '@univerjs/ui';
import type { RefObject } from 'react';
import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService, RichTextBuilder } from '@univerjs/core';
import { Button, clsx, ConfigContext, Dialog, Input, scrollbarClassName, Tooltip } from '@univerjs/design';
import { IEditorService, RichTextEditor } from '@univerjs/docs-ui';
import {
    deserializeRangeWithSheet,
    LexerTreeBuilder,
    matchToken,
    sequenceNodeType,
    serializeRange,
    serializeRangeWithSheet,
} from '@univerjs/engine-formula';
import { DeleteIcon, IncreaseIcon, SelectRangeIcon } from '@univerjs/icons';
import { SetSelectionsOperation } from '@univerjs/sheets';
import { useDependency, useEvent } from '@univerjs/ui';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStateRef } from '../formula-editor/hooks/use-state-ref';
import { useRangesHighlight } from './hooks/use-ranges-highlight';
import { useRangeSelectorSelectionChange } from './hooks/use-selection-change';
import { MobileRangeSelectorDialog } from './MobileRangeSelectorDialog';
import { rangePreProcess } from './utils/range-pre-process';
import { verifyRange } from './utils/verify-range';

export interface IRangeSelectorInstance {
    editor: Nullable<Editor>;
    blur: () => void;
    focus: () => void;
    showDialog: (ranges: IUnitRangeName[]) => void;
    hideDialog: () => void;
    verify: () => boolean;
    getValue: () => string;
}

export interface IRangeSelectorProps extends IRichTextEditorProps {
    unitId: string;
    subUnitId: string;
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
    /**
     * always return range ref with sheet name, default: false
     */
    keepSheetReference?: boolean;
    selectorRef?: RefObject<IRangeSelectorInstance | null>;
    onVerify?: (res: boolean, rangeText: string) => void;
    onRangeSelectorDialogVisibleChange?: (visible: boolean) => void;
    hideEditor?: boolean;
    forceShowDialogWhenSelectionChanged?: boolean;
    resetRange?: ISelectionWithStyle[];
    onClose?: () => void;
};

export interface IRangeSelectorDialogProps {
    visible: boolean;
    initialValue: IUnitRangeName[];
    unitId: string;
    subUnitId: string;
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
    keepSheetReference?: boolean;
    onConfirm: (ranges: IUnitRangeName[]) => void;
    onClose: () => void;
    onShowBySelection?: (ranges: IUnitRangeName[]) => boolean;
    mobile?: boolean;
}

export function RangeSelectorDialog(props: IRangeSelectorDialogProps) {
    const {
        visible,
        initialValue,
        unitId,
        subUnitId,
        maxRangeCount = Infinity,
        supportAcrossSheet,
        keepSheetReference,
        onConfirm,
        onClose,
        onShowBySelection,
        mobile = false,
    } = props;
    const localeService = useDependency(LocaleService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const [ranges, setRanges] = useState<string[]>([]);
    const [focusIndex, setFocusIndex] = useState(0);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const scrollbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible && initialValue.length) {
            const newRanges = initialValue.map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range));
            setRanges(newRanges);
            setFocusIndex(newRanges.length - 1);
        } else {
            setRanges(['']);
            setFocusIndex(0);
        }
    }, [visible]);

    const handleRangeInput = (index: number, value: string) => {
        const newRanges = [...ranges];
        newRanges[index] = value;
        setRanges(newRanges);
    };
    const handleRangeAdd = () => {
        setRanges([...ranges, '']);
        setFocusIndex(ranges.length);
    };

    const handleRangeRemove = (index: number) => {
        ranges.splice(index, 1);
        setRanges([...ranges]);
    };

    useRangeSelectorSelectionChange({
        unitId,
        subUnitId,
        supportAcrossSheet,
        keepSheetReference,
        onChange: (selections, isStart) => {
            if (!visible) {
                if (onShowBySelection?.(selections)) {
                    return;
                }
            }
            const current = new Set(ranges);
            const addedRangesOrigin = selections.map((range) => !range.sheetName ? serializeRange(range.range) : serializeRangeWithSheet(range.sheetName, range.range));
            const addedRanges = addedRangesOrigin.filter((item) => !current.has(item));
            if (!addedRanges.length) return;
            const newRanges = [...ranges];

            if (addedRangesOrigin.length > 1) {
                if (!isStart) {
                    newRanges.splice(focusIndex, 1);
                }

                newRanges.push(...addedRanges);
                const finalRanges = newRanges.slice(0, maxRangeCount);
                setRanges(finalRanges);
                setFocusIndex(finalRanges.length - 1);
                requestAnimationFrame(() => {
                    scrollbarRef.current?.scrollTo({ top: scrollbarRef.current.scrollHeight });
                });
            } else {
                // modify
                newRanges.splice(focusIndex, 1, ...addedRanges);
                const finalRanges = newRanges.slice(0, maxRangeCount);
                setRanges(finalRanges);
                setFocusIndex(focusIndex + addedRanges.length - 1);
            }
        },
    });

    const confirmRanges = () => {
        onConfirm(
            ranges
                .filter((text) => {
                    const nodes = lexerTreeBuilder.sequenceNodesBuilder(text);
                    return nodes && nodes.length === 1 && typeof nodes[0] !== 'string' && nodes[0].nodeType === sequenceNodeType.REFERENCE;
                })
                .map((text) => deserializeRangeWithSheet(text))
                .map((unitRange) => ({ ...unitRange, range: rangePreProcess(unitRange.range) }))
        );
    };

    const rangeInputs = (mobileLayout = false) => (
        <div
            ref={scrollbarRef}
            className={clsx(
                'univer-overflow-y-auto',
                scrollbarClassName,
                mobileLayout ? 'univer-max-h-[22dvh]' : '-univer-mx-6 univer-max-h-60 univer-px-6'
            )}
        >
            {ranges.map((text, index) => (
                <div
                    key={index}
                    className={clsx('univer-mb-2 univer-flex univer-items-center', mobileLayout
                        ? 'univer-gap-2'
                        : 'univer-gap-4')}
                >
                    <Input
                        className={clsx('univer-box-border univer-h-10 univer-w-full', {
                            'univer-border-primary-600': focusIndex === index,
                        })}
                        placeholder={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.placeHolder')}
                        onFocus={() => setFocusIndex(index)}
                        value={text}
                        onChange={(value) => handleRangeInput(index, value)}
                    />
                    {ranges.length > 1 && (
                        <button
                            type="button"
                            className="
                              univer-flex univer-size-10 univer-shrink-0 univer-items-center univer-justify-center
                              univer-rounded-lg univer-border-0 univer-bg-transparent univer-text-gray-600
                              active:univer-bg-gray-100
                              dark:!univer-text-gray-300
                              dark:active:!univer-bg-gray-700
                            "
                            onClick={() => handleRangeRemove(index)}
                        >
                            <DeleteIcon className="univer-cursor-pointer" />
                        </button>
                    )}
                </div>
            ))}
            {ranges.length < maxRangeCount && (
                <Button className={mobileLayout ? 'univer-h-10 univer-w-full' : undefined} variant="link" onClick={handleRangeAdd}>
                    <IncreaseIcon />
                    <span>{localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.addAnotherRange')}</span>
                </Button>
            )}
        </div>
    );

    if (mobile) {
        return (
            <MobileRangeSelectorDialog
                visible={visible}
                snap={drawerSnap}
                title={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.title')}
                cancelText={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.cancel')}
                confirmText={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.confirm')}
                onSnapChange={setDrawerSnap}
                onClose={onClose}
                onConfirm={confirmRanges}
            >
                {rangeInputs(true)}
            </MobileRangeSelectorDialog>
        );
    }

    return (
        <Dialog
            width="328px"
            open={visible}
            title={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.title')}
            draggable
            mask={false}
            maskClosable={false}
            footer={(
                <footer className="univer-flex univer-gap-2">
                    <Button onClick={onClose}>{localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.cancel')}</Button>
                    <Button
                        variant="primary"
                        onClick={confirmRanges}
                    >
                        {localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.confirm')}
                    </Button>
                </footer>
            )}
            onClose={onClose}
        >
            {rangeInputs()}
        </Dialog>
    );
}

export function parseRanges(rangeString: string) {
    return rangeString.split(matchToken.COMMA).filter((e) => !!e).map((text) => deserializeRangeWithSheet(text));
}

export function stringifyRanges(ranges: IUnitRangeName[]) {
    return ranges
        .map((range) => range.sheetName ? serializeRangeWithSheet(range.sheetName, range.range) : serializeRange(range.range))
        .join(matchToken.COMMA);
}

export function RangeSelector(props: IRangeSelectorProps) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const { mobile = false } = useContext(ConfigContext);
    const {
        onVerify,
        selectorRef,
        unitId,
        subUnitId,
        maxRangeCount,
        supportAcrossSheet,
        keepSheetReference,
        autoFocus,
        onChange,
        onRangeSelectorDialogVisibleChange,
        onClickOutside,
        onFocusChange,
        forceShowDialogWhenSelectionChanged,
        hideEditor,
        resetRange,
        onClose,
    } = props;
    const [focusing, setFocusing] = useState(autoFocus ?? false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [rangeSelectorRanges, setRangeSelectorRanges] = useState<IUnitRangeName[]>([]);
    const localeService = useDependency(LocaleService);
    const editorService = useDependency(IEditorService);
    const { sequenceNodes } = useRangesHighlight(editor, focusing, unitId, subUnitId);
    const sequenceNodesRef = useStateRef(sequenceNodes);
    const commandService = useDependency(ICommandService);

    const blurEditor = useEvent(() => {
        editor?.setSelectionRanges([]);
        editor?.blur();
        editorService.blur();
    });

    const handleOpenModal = useEvent(() => {
        blurEditor();
        setRangeSelectorRanges(parseRanges(editor?.getDocumentDataModel()?.getPlainText() ?? ''));
        setPopupVisible(true);
    });

    useEffect(() => {
        if (!selectorRef) return;
        selectorRef.current = {
            get editor() {
                return editor;
            },
            focus() {
                editorService.focus(editor!.getEditorId());
            },
            blur: blurEditor,
            verify: () => verifyRange(sequenceNodesRef.current),
            showDialog: (ranges) => {
                blurEditor();
                setRangeSelectorRanges(ranges);
                setPopupVisible(true);
            },
            hideDialog: () => {
                setRangeSelectorRanges([]);
                setPopupVisible(false);
            },
            getValue: () => editor?.getDocumentDataModel()?.getPlainText() ?? '',
        };
    }, [blurEditor, editor, editorService, selectorRef, sequenceNodesRef]);

    useEffect(() => {
        onVerify?.(verifyRange(sequenceNodes), editor?.getDocumentDataModel()?.getPlainText() ?? '');
    }, [sequenceNodes]);

    useEffect(() => {
        onRangeSelectorDialogVisibleChange?.(popupVisible);
    }, [popupVisible]);

    useEffect(() => {
        if (popupVisible && resetRange) {
            return () => {
                const params: ISetSelectionsOperationParams = {
                    unitId,
                    subUnitId,
                    selections: resetRange,
                };
                commandService.executeCommand(SetSelectionsOperation.id, params);
            };
        }
    }, [popupVisible]);

    return (
        <>
            {!hideEditor
                ? (
                    <RichTextEditor
                        isSingle
                        {...props}
                        className={clsx(props.className, 'rtl:[&>div]:univer-flex-row-reverse')}
                        preserveHostFocus
                        onFocusChange={(focusing, newValue) => {
                            setFocusing(focusing);
                            onFocusChange?.(focusing, newValue);
                        }}
                        editorRef={setEditor}
                        onClickOutside={() => {
                            setFocusing(false);
                            blurEditor();
                            onClickOutside?.();
                        }}
                        icon={(
                            <Tooltip title={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.buttonTooltip')} placement="bottom">
                                <SelectRangeIcon
                                    className={`
                                      -univer-translate-y-0.5 univer-cursor-pointer
                                      dark:!univer-text-gray-300
                                    `}
                                    onClick={handleOpenModal}
                                />
                            </Tooltip>
                        )}
                    />
                )
                : null}
            <RangeSelectorDialog
                initialValue={rangeSelectorRanges}
                unitId={unitId}
                subUnitId={subUnitId}
                visible={popupVisible}
                mobile={mobile}
                maxRangeCount={maxRangeCount}
                onConfirm={(ranges) => {
                    const resultStr = stringifyRanges(ranges);
                    const documentData = RichTextBuilder.create().insertText(resultStr).getData();
                    editor?.replaceText(resultStr, false);
                    onChange?.(documentData, resultStr);
                    setPopupVisible(false);
                    setRangeSelectorRanges([]);
                    requestAnimationFrame(() => {
                        blurEditor();
                    });
                }}
                onClose={() => {
                    setPopupVisible(false);
                    setRangeSelectorRanges([]);
                    onClose?.();
                }}
                supportAcrossSheet={supportAcrossSheet}
                keepSheetReference={keepSheetReference}
                onShowBySelection={(ranges: IUnitRangeName[]) => {
                    if (focusing || forceShowDialogWhenSelectionChanged) {
                        setRangeSelectorRanges(ranges);
                        setPopupVisible(true);
                        return false;
                    } else {
                        return true;
                    }
                }}
            />
        </>
    );
}
