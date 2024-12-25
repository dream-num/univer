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

import type { Editor } from '../../services/editor/editor';
import type { IKeyboardEventConfig } from './hooks';
import { createInternalEditorID, generateRandomId, type IDisposable, type IDocumentData, useDependency, useObservable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEvent } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { useKeyboardEvent } from './hooks';
import { useLeftAndRightArrow } from './hooks/useLeftAndRightArrow';
import styles from './index.module.less';

export interface IRichTextEditorProps {
    className?: string;
    autoFocus?: boolean;
    onFocusChange?: (isFocus: boolean) => void;
    initialValue?: IDocumentData;
    onClickOutside?: () => void;
    keyboradEventConfig?: IKeyboardEventConfig;
    moveCursor?: boolean;
}

export const RichTextEditor = (props: IRichTextEditorProps) => {
    const {
        className,
        autoFocus: _autoFocus,
        onFocusChange: _onFocusChange,
        initialValue,
        onClickOutside: _onClickOutside,
        keyboradEventConfig,
        moveCursor = true,
    } = props;
    const autoFocus = useMemo(() => _autoFocus ?? false, []);
    const onFocusChange = useEvent(_onFocusChange);
    const onClickOutside = useEvent(_onClickOutside);
    const editorService = useDependency(IEditorService);
    const formulaEditorContainerRef = React.useRef<HTMLDivElement>(null);
    const editorId = useMemo(() => createInternalEditorID(`RICH_TEXT_EDITOR-${generateRandomId(4)}`), []);
    const [editor, setEditor] = useState<Editor>();
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const isFocusing = docSelectionRenderService?.isFocusing ?? false;
    const sheetEmbeddingRef = React.useRef<HTMLDivElement>(null);
    useObservable(editor?.blur$);
    useObservable(editor?.focus$);

    useEffect(() => {
        onFocusChange?.(isFocusing);
    }, [isFocusing, onFocusChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetEmbeddingRef.current && !sheetEmbeddingRef.current.contains(event.target as any)) {
                onClickOutside?.();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [onClickOutside]);

    useLayoutEffect(() => {
        let dispose: IDisposable;
        if (formulaEditorContainerRef.current) {
            dispose = editorService.register({
                autofocus: true,
                editorUnitId: editorId,
                isSingle: true,
                initialSnapshot: {
                    body: {
                        dataStream: '\r\n',
                        textRuns: [],
                        customBlocks: [],
                        customDecorations: [],
                        customRanges: [],
                    },
                    documentStyle: {},
                    ...initialValue,
                    id: editorId,
                },
            }, formulaEditorContainerRef.current);
            const editor = editorService.getEditor(editorId)! as Editor;
            setEditor(editor);

            if (autoFocus) {
                editor.focus();
            }
        }

        return () => {
            dispose?.dispose();
        };
    }, []);

    useLeftAndRightArrow(isFocusing && moveCursor, false, editor);
    useKeyboardEvent(isFocusing, keyboradEventConfig, editor);

    <div className={clsx(styles.richTextEditor, className)}>
        <div
            className={clsx(styles.richTextEditorWrap, {
                [styles.richTextEditorActive]: isFocusing,
            })}
            ref={sheetEmbeddingRef}
        >
            <div
                className={styles.richTextEditorText}
                ref={formulaEditorContainerRef}
                onMouseUp={() => {
                    editor?.focus();
                }}
            >
            </div>
        </div>
    </div>;
};
