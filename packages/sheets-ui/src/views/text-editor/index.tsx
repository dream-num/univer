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

import type { IDocumentData } from '@univerjs/core';
import { fromEventSubject, isInternalEditorID, useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import React, { useEffect, useRef } from 'react';
import { filter, mergeMap } from 'rxjs';

type MyComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export interface ITextEditorProps {
    id: string; // unitId
    className?: string; // Parent class name.
    fontSize?: number;
    snapshot: IDocumentData;
}

export function SheetsTextEditor(props: ITextEditorProps & Omit<MyComponentProps, 'onChange' | 'onActive'>): JSX.Element | null {
    const {
        id,
        fontSize,
        snapshot,
        className,
        ...extraProps
    } = props;

    const editorService = useDependency(IEditorService);
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(id);

    const editorRef = useRef<HTMLDivElement>(null);

    if (!isInternalEditorID(id)) {
        throw new Error('Invalid editor ID');
    }

    useEffect(() => {
        const editorDom = editorRef.current;

        if (!editorDom) {
            return;
        }
        const isSingle = false;
        const isReadonly = false;
        const isFormulaEditor = false;
        const onlyInputFormula = false;
        const onlyInputRange = false;
        const onlyInputContent = false;
        const isSingleChoice = false;
        const openForSheetUnitId = null;
        const openForSheetSubUnitId = null;
        const isSheetEditor = true;

        const registerSubscription = editorService.register({
            editorUnitId: id,
            initialSnapshot: snapshot,
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
    }, [editorService, id, renderer]);

    useEffect(() => {
        if (renderer) {
            fromEventSubject(renderer.scene.onTransformChange$)
                .pipe(filter((state) => state.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize))
                .pipe(mergeMap(() => fromEventSubject(renderer.engine.onTransformChange$).pipe(filter((state) => state.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize))))
                .subscribe(() => {
                    const width = renderer.engine.getCanvasElement().clientWidth;
                    const height = renderer.engine.getCanvasElement().clientHeight;
                    const sceneWidth = renderer.scene.width;
                    const sceneHeight = renderer.scene.height;
                });
        }
    }, [renderer]);

    return (
        <div {...extraProps} className={className} ref={editorRef} />
    );
}
