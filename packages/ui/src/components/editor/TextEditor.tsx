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
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef } from 'react';
import type { IEditorCanvasStyle } from '../../services/editor/editor.service';
import { IEditorService } from '../../services/editor/editor.service';

type MyComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const excludeProps = ['snapshot', 'resizeCallBack', 'cancelDefaultResizeListener', 'isSheetEditor', 'canvasStyle'];

export interface ITextEditorProps {
    id: string;
    snapshot?: IDocumentData;
    resizeCallBack?: (editor: Nullable<HTMLDivElement>) => void;
    cancelDefaultResizeListener?: boolean;
    isSheetEditor?: boolean;
    canvasStyle?: IEditorCanvasStyle;
    value?: string;
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function TextEditor(props: ITextEditorProps & MyComponentProps): JSX.Element | null {
    const { id, snapshot, resizeCallBack, cancelDefaultResizeListener, isSheetEditor = false, canvasStyle = {}, value } = props;

    const editorService = useDependency(IEditorService);

    const editorRef = useRef<HTMLDivElement>(null);

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

        editorService.register({ editorUnitId: id, initialSnapshot: snapshot, cancelDefaultResizeListener, isSheetEditor, canvasStyle, isSingle: true }, editor);

        // Clean up on unmount
        return () => {
            resizeObserver.unobserve(editor);
        };
    }, []);

    useEffect(() => {
        if (value == null) {
            return;
        }
        editorService.setValue(value, id);
    }, [value]);

    const propsNew = Object.fromEntries(
        Object.entries(props).filter(([key]) => !excludeProps.includes(key))
    );

    return <div {...propsNew} ref={editorRef}></div>;
}
