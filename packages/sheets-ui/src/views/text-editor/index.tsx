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

import { isInternalEditorID, useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import React, { useEffect, useRef } from 'react';

type MyComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export interface ITextEditorProps {
    id: string; // unitId
    className?: string; // Parent class name.
    fontSize?: number;
}

export function SheetsTextEditor(props: ITextEditorProps & Omit<MyComponentProps, 'onChange' | 'onActive'>): JSX.Element | null {
    const {
        id,
        fontSize,
        className,
        ...extraProps
    } = props;

    const editorService = useDependency(IEditorService);

    const editorRef = useRef<HTMLDivElement>(null);

    if (!isInternalEditorID(id)) {
        throw new Error('Invalid editor ID');
    }

    useEffect(() => {
        const editorDom = editorRef.current;

        if (!editorDom) {
            return;
        }
        const isSingle = true;
        const isReadonly = false;
        const isFormulaEditor = false;
        const onlyInputFormula = false;
        const onlyInputRange = false;
        const onlyInputContent = false;
        const isSingleChoice = false;
        const openForSheetUnitId = null;
        const openForSheetSubUnitId = null;
        const isSheetEditor = false;

        const registerSubscription = editorService.register({
            editorUnitId: id,
            initialSnapshot: undefined,
            cancelDefaultResizeListener: true,
            isSheetEditor,
            canvasStyle: { fontSize },
            isSingle,
            readonly: isReadonly,
            isSingleChoice,
            onlyInputFormula,
            onlyInputRange,
            onlyInputContent,
            openForSheetUnitId,
            openForSheetSubUnitId,
            isFormulaEditor,
        },
        editorDom);

        return () => {
            registerSubscription.dispose();
        };
    }, [editorService, id]);

    return (
        <div {...extraProps} className={className} ref={editorRef} />
    );
}
