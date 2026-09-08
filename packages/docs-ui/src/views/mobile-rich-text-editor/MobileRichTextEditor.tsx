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

import type { IRichTextEditorProps } from '../RichTextEditor';
import { Button, clsx } from '@univerjs/design';
import { CheckMarkIcon, CloseIcon, DownIcon } from '@univerjs/icons';
import { useEvent, useMobileCanvasPanel } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { MobileRichTextToolbar } from '../mobile-rich-text-toolbar/MobileRichTextToolbar';
import { RichTextEditor } from '../RichTextEditor';

interface IMobileRichTextEditorProps extends Pick<IRichTextEditorProps, 'initialValue' | 'editorId' | 'autoFocus' | 'canvasStyle' | 'keyboardEventConfig' | 'onChange'> {
    editorId: string;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
    labels: { title: string; cancel: string; confirm: string; expand: string; collapse: string };
}

/** Compact object text input; expanding keeps the same document editor mounted. */
export function MobileRichTextEditor(props: IMobileRichTextEditorProps) {
    const { expanded, onExpandedChange, onCancel, onConfirm, labels } = props;
    const containerRef = useRef<HTMLElement>(null);
    const pointerStartedInsideRef = useRef(false);
    const [keyboardInset, setKeyboardInset] = useState(0);
    const confirmOnDismiss = useEvent(onConfirm);
    useMobileCanvasPanel(containerRef, expanded ? 'modal' : 'canvas');

    useEffect(() => {
        const viewport = window.visualViewport;
        let frame = 0;
        let wasVisible = false;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const inset = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
                const visible = inset > 80;
                setKeyboardInset(inset);
                if (wasVisible && !visible) {
                    confirmOnDismiss();
                }
                wasVisible = visible;
            });
        };
        update();
        window.addEventListener('resize', update);
        viewport?.addEventListener('resize', update);
        viewport?.addEventListener('scroll', update);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', update);
            viewport?.removeEventListener('resize', update);
            viewport?.removeEventListener('scroll', update);
        };
    }, [confirmOnDismiss]);

    const buttonClassName = clsx('univer-h-12 univer-shrink-0 univer-text-lg', expanded
        ? 'univer-flex-1'
        : 'univer-w-10');
    const expandButton = (
        <Button
            variant="ghost"
            className={buttonClassName}
            aria-label={expanded ? labels.collapse : labels.expand}
            aria-expanded={expanded}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onExpandedChange(!expanded)}
        >
            <DownIcon className={clsx('univer-size-5', !expanded && 'univer-rotate-180')} />
        </Button>
    );

    return (
        <section
            ref={containerRef}
            role="region"
            aria-label={labels.title}
            className={clsx(`
              univer-pointer-events-auto univer-absolute univer-inset-x-0 univer-z-40 univer-flex univer-items-stretch
              univer-bg-gray-0 univer-shadow-lg
              dark:!univer-bg-gray-800
            `, expanded ? 'univer-inset-0 univer-z-50 univer-size-full' : 'univer-min-h-12')}
            style={{
                backgroundColor: props.canvasStyle?.backgroundColor,
                bottom: expanded ? undefined : keyboardInset,
                paddingBottom: expanded ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                paddingTop: expanded ? 'env(safe-area-inset-top, 0px)' : undefined,
            }}
            onPointerDownCapture={() => { pointerStartedInsideRef.current = true; }}
            onPointerCancelCapture={() => { pointerStartedInsideRef.current = false; }}
            onClickCapture={(event) => {
                // Opening on canvas pointer-up must not activate controls inserted under that touch.
                if (event.detail > 0 && !pointerStartedInsideRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                pointerStartedInsideRef.current = false;
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
        >
            <div
                className={clsx('univer-flex', expanded && `
                  univer-absolute univer-inset-x-0 univer-top-0 univer-z-20 univer-h-12 univer-bg-gray-0
                  dark:!univer-bg-gray-800
                `)}
            >
                <Button variant="ghost" className={buttonClassName} aria-label={labels.cancel} onPointerDown={(event) => event.preventDefault()} onClick={onCancel}>
                    <CloseIcon />
                </Button>
                <Button variant="ghost" className={clsx(buttonClassName, 'univer-text-primary-600')} aria-label={labels.confirm} onPointerDown={(event) => event.preventDefault()} onClick={onConfirm}>
                    <CheckMarkIcon />
                </Button>
                {expanded && expandButton}
            </div>
            {expanded && (
                <MobileRichTextToolbar
                    editorId={props.editorId}
                    className="univer-absolute univer-inset-x-0 univer-top-12 univer-z-10"
                />
            )}
            <div
                className={clsx('univer-min-w-0 univer-flex-1 univer-py-1', expanded && `
                  univer-h-full univer-overflow-hidden univer-pt-24
                `)}
            >
                <RichTextEditor
                    className={clsx('univer-size-full univer-text-base', expanded && '[&>div]:!univer-h-full')}
                    editorId={props.editorId}
                    initialValue={props.initialValue}
                    autoFocus={props.autoFocus}
                    preserveHostFocus
                    moveCursor
                    noStyle
                    isSingle={!expanded}
                    canvasStyle={props.canvasStyle}
                    keyboardEventConfig={props.keyboardEventConfig}
                    defaultHeight={40}
                    maxHeight={expanded ? 10_000 : 120}
                    onChange={props.onChange}
                />
            </div>
            {!expanded && expandButton}
        </section>
    );
}
