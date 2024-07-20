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

import type { IDocumentData, Nullable } from '@univerjs/core';
import { debounce, isInternalEditorID, LocaleService, useDependency } from '@univerjs/core';
import React, { useEffect, useRef, useState } from 'react';
import type { Editor, IEditorCanvasStyle } from '../../services/editor/editor.service';
import { IEditorService } from '../../services/editor/editor.service';
import { isElementVisible } from '../../utils/util';
import styles from './index.module.less';

type MyComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const excludeProps = new Set([
    'snapshot',
    'resizeCallBack',
    'cancelDefaultResizeListener',
    'isSheetEditor',
    'canvasStyle',
    'isFormulaEditor',
    'isSingle',
    'isReadonly',
    'onlyInputFormula',
    'onlyInputRange',
    'value',
    'onlyInputContent',
    'isSingleChoice',
    'openForSheetUnitId',
    'openForSheetSubUnitId',
    'onChange',
    'onActive',
    'onValid',
    'placeholder',
]);

export interface ITextEditorProps {
    id: string; // unitId
    className?: string; // Parent class name.

    snapshot?: IDocumentData; // The default initialization snapshot for the editor can be simply replaced with the value attribute, for cellEditor and formulaBar
    value?: string; // default values.

    // WTF: snapshot and value both exists?

    resizeCallBack?: (editor: Nullable<HTMLDivElement>) => void; // Container scale callback.

    cancelDefaultResizeListener?: boolean; // Disable the default container scaling listener, for cellEditor and formulaBar

    canvasStyle?: IEditorCanvasStyle; // Setting the style of the editor is similar to setting the drawing style of a canvas, and therefore, it should be distinguished from the CSS 'style'. At present, it only supports the 'fontsize' attribute.

    isSheetEditor?: boolean; // Specify whether the editor is bound to a sheet. Currently, there are cellEditor and formulaBar.
    isFormulaEditor?: boolean;
    isSingle?: boolean; // Set whether the editor allows multiline input, default is true, equivalent to input; false is equivalent to textarea.
    isReadonly?: boolean; // Set the editor to read-only state.

    onlyInputFormula?: boolean; // Only input formula string
    onlyInputRange?: boolean; // Only input ref range
    onlyInputContent?: boolean; // Only plain content can be entered, turning off formula and range input highlighting.

    isSingleChoice?: boolean; // Whether to restrict to only selecting a single region/area/district.

    openForSheetUnitId?: Nullable<string>; //  Configuring which workbook the selector defaults to opening in determines whether the ref includes a [unitId] prefix.
    openForSheetSubUnitId?: Nullable<string>; // Configuring the default worksheet where the selector opens determines whether the ref includes a [unitId]sheet1 prefix.

    onChange?: (value: Nullable<string>) => void; // Callback for changes in the selector value.
    onActive?: (state: boolean) => void; // Callback for editor active.
    onValid?: (state: boolean) => void; // Editor input value validation, currently effective only under onlyRange and onlyFormula conditions.

    placeholder?: string; // Placeholder text.
    isValueValid?: boolean; // Whether the value is valid.
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 */
export function TextEditor(props: ITextEditorProps & Omit<MyComponentProps, 'onChange' | 'onActive'>): JSX.Element | null {
    const {
        id,
        snapshot,
        resizeCallBack,
        cancelDefaultResizeListener,
        isSheetEditor = false,
        canvasStyle = {},
        value,
        isSingle = true,
        isReadonly = false,
        isFormulaEditor = false,
        onlyInputFormula = false,
        onlyInputRange = false,
        onlyInputContent = false,
        isSingleChoice = false,
        openForSheetUnitId,
        openForSheetSubUnitId,
        onChange,
        onActive,
        onValid,
        isValueValid = true,
        placeholder,
    } = props;

    const editorService = useDependency(IEditorService);

    const localeService = useDependency(LocaleService);

    const [placeholderValue, placeholderSet] = useState('');

    const [validationContent, setValidationContent] = useState<string>('');

    const [validationVisible, setValidationVisible] = useState(isValueValid);

    const [validationOffset, setValidationOffset] = useState<[number, number]>([0, 0]);

    const editorRef = useRef<HTMLDivElement>(null);

    const [active, setActive] = useState(false);

    if (!isInternalEditorID(id)) {
        throw new Error('Invalid editor ID');
    }

    useEffect(() => {
        const editorDom = editorRef.current;

        if (!editorDom) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            if (cancelDefaultResizeListener !== true) {
                editorService.resize(id);
            }
            resizeCallBack && resizeCallBack(editorDom);
        });

        resizeObserver.observe(editorDom);

        const registerSubscription = editorService.register({
            editorUnitId: id,
            initialSnapshot: snapshot,
            cancelDefaultResizeListener,
            isSheetEditor,
            canvasStyle,
            isSingle,
            isReadonly,
            isSingleChoice,
            onlyInputFormula,
            onlyInputRange,
            onlyInputContent,
            openForSheetUnitId,
            openForSheetSubUnitId,
            isFormulaEditor,
        },
        editorDom);

        editorService.setValueNoRefresh(value || '', id);
        placeholderSet(placeholder || '');

        const activeChange = debounce((state: boolean) => {
            setActive(state);
            onActive && onActive(state);
        }, 30);

        // !IMPORTANT: Set a delay of 160ms to ensure that the position is corrected after the sidebar animation ends @jikkai
        const ANIMATION_DELAY = 160;
        const valueChange = debounce((editor: Readonly<Editor>) => {
            const unitId = editor.editorUnitId;
            const isLegality = editorService.checkValueLegality(unitId);

            setTimeout(() => {
                const rect = editor.getBoundingClientRect();
                setValidationOffset([rect.left, rect.top - 16]);
                if (rect.left + rect.top > 0) {
                    setValidationVisible(isLegality);
                }

                if (editor.onlyInputFormula()) {
                    setValidationContent(localeService.t('textEditor.formulaError'));
                } else {
                    setValidationContent(localeService.t('textEditor.rangeError'));
                }
            }, ANIMATION_DELAY);

            const currentValue = editorService.getValue(unitId);

            if (currentValue !== value) {
                onValid && onValid(isLegality);
                // WTF: why emit value on focus?
                onChange && onChange(editorService.getValue(id));
            }
        }, 30);

        const focusStyleSubscription = editorService.focusStyle$.subscribe((unitId: Nullable<string>) => {
            let state = false;
            if (unitId === id) {
                state = true;
            }
            activeChange(state);

            setTimeout(() => {
                if (!isElementVisible(editorDom)) {
                    setValidationVisible(true);
                } else {
                    const editor = editorService.getEditor(id);
                    editor && valueChange(editor);
                }
            }, ANIMATION_DELAY);
        });

        const valueChangeSubscription = editorService.valueChange$.subscribe((editor) => {
            if (editor.isSheetEditor()) {
                return;
            }

            // WTF: should not use editorService to sync values. All editors instance would be notified!
            if (editor.editorUnitId !== id) {
                return;
            }

            valueChange(editor);
        });

        return () => {
            resizeObserver.unobserve(editorDom);
            resizeObserver.disconnect();
            registerSubscription.dispose();
            focusStyleSubscription?.unsubscribe();
            valueChangeSubscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const editor = editorService.getEditor(id);
        if (editor == null) {
            return;
        }

        editor.update({
            isReadonly, isSingle, isSingleChoice, onlyInputContent, onlyInputFormula, onlyInputRange, openForSheetSubUnitId, openForSheetUnitId,
        });
    }, [isReadonly, isSingle, isSingleChoice, onlyInputContent, onlyInputFormula, onlyInputRange, openForSheetSubUnitId, openForSheetUnitId]);

    useEffect(() => {
        if (value == null) {
            return;
        }
        editorService.setValueNoRefresh(value, id);
    }, [value]);

    useEffect(() => {
        setValidationVisible(isValueValid);
    }, [isValueValid]);

    function hasValue() {
        const value = editorService.getValue(id);
        if (value == null) {
            return false;
        }

        if (value === '') {
            return false;
        }

        return true;
    }

    const propsNew = Object.fromEntries(
        Object.entries(props).filter(([key]) => !excludeProps.has(key))
    );

    let className = styles.textEditorContainer;
    if (props.className != null) {
        className = props.className;
    }

    let borderStyle = '';

    if (props.className == null) {
        if (isReadonly) {
            borderStyle = ` ${styles.textEditorContainerDisabled}`;
        } else if (!validationVisible) {
            borderStyle = ` ${styles.textEditorContainerError}`;
        } else if (active) {
            borderStyle = ` ${styles.textEditorContainerActive}`;
        }
    }

    return (
        <>
            <div {...propsNew} className={className + borderStyle} ref={editorRef}>
                <div style={{ display: validationVisible ? 'none' : 'block' }} className={styles.textEditorValidationError}>{validationContent}</div>
                <div style={{ display: hasValue() ? 'none' : 'unset' }} className={styles.textEditorContainerPlaceholder}>{placeholderValue}</div>
            </div>
            {/* Don't delete it yet, test the stability without popup */}
            {/* <Popup visible={!validationVisible} offset={validationOffset}>
                <div className={styles.textEditorValidationError}>{validationContent}</div>
            </Popup> */}
        </>
    );
}
