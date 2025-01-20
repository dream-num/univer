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
import { BuildTextUtils, createInternalEditorID, generateRandomId, type IDocumentData, useDependency, useObservable } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEvent } from '@univerjs/ui';
import clsx from 'clsx';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { useKeyboardEvent, useResize } from './hooks';
import { useEditor } from './hooks/useEditor';
import { useLeftAndRightArrow } from './hooks/useLeftAndRightArrow';
import { useOnChange } from './hooks/useOnChange';
import styles from './index.module.less';

export interface IRichTextEditorProps {
    className?: string;
    autoFocus?: boolean;
    onFocusChange?: (isFocus: boolean) => void;
    initialValue?: IDocumentData;
    onClickOutside?: () => void;
    keyboardEventConfig?: IKeyboardEventConfig;
    moveCursor?: boolean;
    style?: React.CSSProperties;
    isSingle?: boolean;
    placeholder?: string;
    editorId?: string;
    onHeightChange?: (height: number) => void;
    onChange?: (data: IDocumentData) => void;
    maxHeight?: number;
    defaultHeight?: number;
}

export const RichTextEditor = forwardRef<Editor, IRichTextEditorProps>((props, ref) => {
    const {
        className,
        autoFocus,
        onFocusChange: _onFocusChange,
        initialValue,
        onClickOutside: _onClickOutside,
        keyboardEventConfig,
        moveCursor = true,
        style,
        isSingle,
        editorId: propsEditorId,
        onHeightChange,
        onChange: _onChange,
        defaultHeight = 32,
        maxHeight = 32,
    } = props;
    const editorService = useDependency(IEditorService);
    const onFocusChange = useEvent(_onFocusChange);
    const onClickOutside = useEvent(_onClickOutside);
    const [height, setHeight] = useState(defaultHeight);
    const formulaEditorContainerRef = React.useRef<HTMLDivElement>(null);
    const editorId = useMemo(() => propsEditorId ?? createInternalEditorID(`RICH_TEXT_EDITOR-${generateRandomId(4)}`), [propsEditorId]);
    const editor = useEditor({
        editorId,
        initialValue,
        container: formulaEditorContainerRef,
        autoFocus,
        isSingle,
    });
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const isFocusing = docSelectionRenderService?.isFocusing ?? false;
    const sheetEmbeddingRef = React.useRef<HTMLDivElement>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(() => !BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? ''));
    const { checkScrollBar } = useResize(editor, isSingle, true, true);
    const onChange = useEvent((data: IDocumentData) => {
        const docSkeleton = renderer?.with(DocSkeletonManagerService);
        const size = docSkeleton?.getSkeleton().getActualSize();
        if (size) {
            onHeightChange?.(size.actualHeight);
            setHeight(Math.max(defaultHeight, Math.min(size.actualHeight + 10, maxHeight)));
        }
        _onChange?.(data);
        checkScrollBar();
    });

    useEffect(() => {
        setShowPlaceholder(!BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? ''));

        const sub = editor?.selectionChange$.subscribe(() => {
            setShowPlaceholder(!BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? ''));
        });

        return () => sub?.unsubscribe();
    }, [editor]);

    useObservable(editor?.blur$);
    useObservable(editor?.focus$);

    useEffect(() => {
        onFocusChange?.(isFocusing);
    }, [isFocusing, onFocusChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editorService.getFocusId() !== editorId) return;

            const id = (event.target as HTMLDivElement)?.dataset?.editorid;
            if (id === editorId) return;
            if (sheetEmbeddingRef.current && !sheetEmbeddingRef.current.contains(event.target as any)) {
                onClickOutside?.();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editor, editorId, editorService, onClickOutside]);

    useLeftAndRightArrow(isFocusing && moveCursor, false, editor);
    useKeyboardEvent(isFocusing, keyboardEventConfig, editor);
    useImperativeHandle(ref, () => editor!, [editor]);
    useOnChange(editor, onChange);

    return (
        <div className={clsx(styles.richTextEditor, className)} style={style}>
            <div
                className={clsx(styles.richTextEditorWrap, {
                    [styles.richTextEditorActive]: isFocusing,
                })}
                style={{ height }}
                ref={sheetEmbeddingRef}
            >
                <div
                    className={styles.richTextEditorText}
                    ref={formulaEditorContainerRef}
                    onMouseUp={() => editor?.focus()}
                />
                {!showPlaceholder
                    ? null
                    : (
                        <div className={styles.richTextEditorPlaceholder}>
                            {props.placeholder}
                        </div>
                    )}
            </div>
        </div>
    );
});
