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

import { debounce, type IDocumentData, LocaleService, type Nullable } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';
import { Popup } from '@univerjs/design';
import type { IEditorCanvasStyle } from '../../services/editor/editor.service';
import { IEditorService } from '../../services/editor/editor.service';
import styles from './index.module.less';

type MyComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const excludeProps = new Set([
    'snapshot',
    'resizeCallBack',
    'cancelDefaultResizeListener',
    'isSheetEditor',
    'canvasStyle',
    'isSingle',
    'isReadonly',
    'onlyInputFormula',
    'onlyInputRange',
    'value',
    'onlyInputContent',
]);

export interface ITextEditorProps {
    id: string;
    className?: string;

    snapshot?: IDocumentData;
    resizeCallBack?: (editor: Nullable<HTMLDivElement>) => void;
    cancelDefaultResizeListener?: boolean;
    isSheetEditor?: boolean;
    canvasStyle?: IEditorCanvasStyle;

    value?: string;

    isSingle?: boolean;
    isReadonly?: boolean;
    onlyInputFormula?: boolean;
    onlyInputRange?: boolean;
    onlyInputContent?: boolean;
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 */
export function TextEditor(props: ITextEditorProps & MyComponentProps): JSX.Element | null {
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
        onlyInputFormula = false,
        onlyInputRange = false,
        onlyInputContent = false,
    } = props;

    const editorService = useDependency(IEditorService);

    const localeService = useDependency(LocaleService);

    const [validationContent, setValidationContent] = useState<string>('');

    const [validationVisible, setValidationVisible] = useState(false);

    const [validationOffset, setValidationOffset] = useState<[number, number]>([0, 0]);

    const editorRef = useRef<HTMLDivElement>(null);

    const [active, setActive] = useState(false);

    useEffect(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            if (cancelDefaultResizeListener !== true) {
                editorService.resize(id);
            }
            resizeCallBack && resizeCallBack(editor);
        });

        resizeObserver.observe(editor);

        editorService.register({
            editorUnitId: id,
            initialSnapshot: snapshot,
            cancelDefaultResizeListener,
            isSheetEditor,
            canvasStyle,
            isSingle,
            isReadonly,
            onlyInputFormula,
            onlyInputRange,
            onlyInputContent,
        },
        editor);

        const focusStyleSubscription = editorService.focusStyle$.subscribe((unitId: string) => {
            if (unitId === id) {
                setActive(true);
            } else {
                setActive(false);
            }
        });

        const valueChangeSubscription = editorService.valueChange$.subscribe((editor) => {
            if (!editor.onlyInputFormula() && !editor.onlyInputRange()) {
                return;
            }

            if (editor.editorUnitId !== id) {
                return;
            }

            debounce(() => {
                const unitId = editor.editorUnitId;
                const isLegality = editorService.checkValueLegality(unitId);
                setValidationVisible(!isLegality);
                const rect = editor.getBoundingClientRect();

                setValidationOffset([rect.left, rect.top - 16]);

                if (editor.onlyInputFormula()) {
                    setValidationContent(localeService.t('textEditor.formulaError'));
                } else {
                    setValidationContent(localeService.t('textEditor.rangeError'));
                }
            }, 100)();
        });

        // Clean up on unmount
        return () => {
            resizeObserver.unobserve(editor);

            editorService.unRegister(id);

            focusStyleSubscription?.unsubscribe();

            valueChangeSubscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (value == null) {
            return;
        }
        editorService.setValue(value, id);
    }, [value]);

    const propsNew = Object.fromEntries(
        Object.entries(props).filter(([key]) => !excludeProps.has(key))
    );

    let className = styles.textEditorContainer;
    if (props.className != null) {
        className = props.className;
    }

    let borderStyle = '';

    if (active && props.className == null) {
        if (validationVisible) {
            borderStyle = ` ${styles.textEditorContainerError}`;
        } else {
            borderStyle = ` ${styles.textEditorContainerActive}`;
        }
    }

    return (
        <>
            <div {...propsNew} className={className + borderStyle} ref={editorRef}></div>
            <Popup visible={validationVisible} offset={validationOffset}>
                <div className={styles.textEditorValidationError}>{validationContent}</div>
            </Popup>
        </>
    );
}
