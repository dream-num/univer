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

import type { IUnitRangeName } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import type { IRangeSelectorProps } from './index';
import { HorizontalAlign, ICommandService, LocaleService, RichTextBuilder, Tools } from '@univerjs/core';
import { IEditorService, RichTextEditor } from '@univerjs/docs-ui';
import { SelectRangeIcon } from '@univerjs/icons';
import { SetSelectionsOperation } from '@univerjs/sheets';
import { useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { useStateRef } from '../formula-editor/hooks/use-state-ref';
import { useRangesHighlight } from './hooks/use-ranges-highlight';
import { parseRanges, stringifyRanges } from './index';
import { MobileRangeSelectorDialog } from './MobileRangeSelectorDialog';
import { verifyRange } from './utils/verify-range';

export function MobileRangeSelector(props: IRangeSelectorProps) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const {
        className,
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
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const editorService = useDependency(IEditorService);
    const commandService = useDependency(ICommandService);
    const { sequenceNodes } = useRangesHighlight(editor, focusing, unitId, subUnitId);
    const sequenceNodesRef = useStateRef(sequenceNodes);
    useEffect(() => {
        if (!editor) {
            return;
        }

        const documentData = RichTextBuilder.create(Tools.deepClone(editor.getDocumentData()))
            .align({ horizontal: direction === 'rtl' ? HorizontalAlign.RIGHT : HorizontalAlign.LEFT })
            .getData();
        editor.setDocumentData(documentData, editor.getSelectionRanges());
    }, [direction, editor]);
    const blurEditor = useEvent(() => {
        editor?.setSelectionRanges([]);
        editor?.blur();
        editorService.blur();
    });
    const openDialog = useEvent(() => {
        blurEditor();
        setRangeSelectorRanges(parseRanges(editor?.getDocumentDataModel()?.getPlainText() ?? ''));
        setPopupVisible(true);
    });

    useEffect(() => {
        if (!selectorRef) {
            return;
        }

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
    }, [editor, onVerify, sequenceNodes]);

    useEffect(() => {
        onRangeSelectorDialogVisibleChange?.(popupVisible);
    }, [onRangeSelectorDialogVisibleChange, popupVisible]);

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
    }, [commandService, popupVisible, resetRange, subUnitId, unitId]);

    return (
        <>
            {!hideEditor && (
                <RichTextEditor
                    isSingle
                    {...props}
                    className={className}
                    preserveHostFocus
                    onFocusChange={(isFocusing, newValue) => {
                        setFocusing(isFocusing);
                        onFocusChange?.(isFocusing, newValue);
                    }}
                    editorRef={setEditor}
                    onClickOutside={() => {
                        setFocusing(false);
                        blurEditor();
                        onClickOutside?.();
                    }}
                    icon={(
                        <SelectRangeIcon
                            aria-label={localeService.t<LocaleKey>('sheets-formula-ui.rangeSelector.buttonTooltip')}
                            className="
                              -univer-translate-y-0.5 univer-cursor-pointer
                              dark:!univer-text-gray-300
                            "
                            onClick={openDialog}
                        />
                    )}
                />
            )}
            <MobileRangeSelectorDialog
                initialValue={rangeSelectorRanges}
                unitId={unitId}
                subUnitId={subUnitId}
                visible={popupVisible}
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
                onShowBySelection={(ranges) => {
                    if (focusing || forceShowDialogWhenSelectionChanged) {
                        setRangeSelectorRanges(ranges);
                        setPopupVisible(true);
                        return false;
                    }

                    return true;
                }}
            />
        </>
    );
}
