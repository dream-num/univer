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

import type { IDocumentData } from '@univerjs/core';
import type { ReactNode } from 'react';
import type { Editor } from '../../services/editor/editor';
import type { IKeyboardEventConfig } from './hooks';
import { BuildTextUtils, createInternalEditorID, generateRandomId, getPlainText } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useEvent, useObservable } from '@univerjs/ui';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { useKeyboardEvent, useResize } from './hooks';
import { useEditor } from './hooks/use-editor';
import { useLeftAndRightArrow } from './hooks/use-left-and-right-arrow';
import { useOnChange } from './hooks/use-on-change';

export interface IRichTextEditorProps {
    className?: string;
    autoFocus?: boolean;
    onFocusChange?: (isFocus: boolean, newValue?: string) => void;
    initialValue?: IDocumentData | string;
    onClickOutside?: () => void;
    keyboardEventConfig?: IKeyboardEventConfig;
    moveCursor?: boolean;
    style?: React.CSSProperties;
    isSingle?: boolean;
    placeholder?: string;
    editorId?: string;
    onHeightChange?: (height: number) => void;
    onChange?: (data: IDocumentData, str: string) => void;
    maxHeight?: number;
    defaultHeight?: number;
    icon?: ReactNode;
    editorRef?: React.RefObject<Editor | null> | ((editor: Editor | null) => void);
}

export const RichTextEditor = (props: IRichTextEditorProps) => {
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
        icon,
        editorRef,
        placeholder,
    } = props;
    const editorService = useDependency(IEditorService);
    const onFocusChange = useEvent(_onFocusChange);
    const onClickOutside = useEvent(_onClickOutside);
    const [height, setHeight] = useState(defaultHeight);
    const formulaEditorContainerRef = React.useRef<HTMLDivElement>(null!);
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
    const selections = useObservable(docSelectionRenderService?.textSelectionInner$);
    const isFocusing = Boolean((docSelectionRenderService?.isFocusing ?? false) && selections?.textRanges.some((r) => r.collapsed));
    const sheetEmbeddingRef = React.useRef<HTMLDivElement>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(() => !BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? ''));
    const { checkScrollBar } = useResize(editor, isSingle, true, true);

    useLayoutEffect(() => {
        if (!editorRef || !editor) return;
        if (typeof editorRef === 'function') {
            editorRef(editor);
            return;
        }
        editorRef.current = editor;
    }, [editor]);

    const onChange = useEvent((data: IDocumentData) => {
        const docSkeleton = renderer?.with(DocSkeletonManagerService);
        const size = docSkeleton?.getSkeleton().getActualSize();
        if (size) {
            onHeightChange?.(size.actualHeight);
            setHeight(Math.max(defaultHeight, Math.min(size.actualHeight + 10, maxHeight)));
        }
        _onChange?.(data, getPlainText(data.body?.dataStream ?? ''));
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
        const data = editor?.getDocumentData();
        onFocusChange?.(isFocusing, getPlainText(data?.body?.dataStream ?? ''));
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

        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            clearTimeout(timer);
        };
    }, [editor, editorId, editorService, onClickOutside]);

    useLeftAndRightArrow(isFocusing && moveCursor, false, editor);
    useKeyboardEvent(isFocusing, keyboardEventConfig, editor);
    useOnChange(editor, onChange);

    return (
        <div className={className} style={style}>
            <div
                className={clsx(`
                  univer-relative univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center
                  univer-justify-around univer-gap-2 univer-rounded-md univer-pb-0.5 univer-pl-1.5 univer-pr-2
                  univer-pt-1.5
                `, borderClassName, {
                    'univer-border-primary-500': isFocusing,
                })}
                style={{ height }}
                ref={sheetEmbeddingRef}
            >
                <div
                    ref={formulaEditorContainerRef}
                    className="univer-relative univer-size-full"
                    onMouseUp={() => editor?.focus()}
                />
                {icon}
                {!showPlaceholder
                    ? null
                    : (
                        <div
                            className={`
                              univer-absolute univer-left-[5px] univer-top-[5px] univer-text-sm univer-text-gray-500
                            `}
                        >
                            {placeholder}
                        </div>
                    )}
            </div>
        </div>
    );
};
