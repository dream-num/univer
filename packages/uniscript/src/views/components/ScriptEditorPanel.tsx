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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { MutableRefObject } from 'react';
import { DisposableCollection, LocaleService, toDisposable } from '@univerjs/core';
import { Button, MessageType } from '@univerjs/design';
import { IMessageService, IShortcutService, useDependency } from '@univerjs/ui';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef } from 'react';
import { ScriptEditorService } from '../../services/script-editor.service';
import { IUniscriptExecutionService } from '../../services/script-execution.service';

export function ScriptEditorPanel() {
    const editorContentRef = useRef<HTMLDivElement | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const localeService = useDependency(LocaleService);
    const shortcutService = useDependency(IShortcutService);
    const editorService = useDependency(ScriptEditorService);

    useEffect(() => {
        const containerElement = editorContainerRef.current;
        const contentElement = editorContentRef.current;

        let disposableCollection: Nullable<DisposableCollection> = null;
        let resizeObserver: Nullable<ResizeObserver> = null;

        if (containerElement && contentElement) {
            editorService.requireVscodeEditor();
            const monacoEditor = (monacoEditorRef.current = editor.create(containerElement, {
                value: '',
                language: 'javascript',
            }));

            resizeObserver = new ResizeObserver(() => {
                let timer: number | undefined = requestIdleCallback(() => {
                    if (!timer) return;

                    const { height, width } = contentElement.getBoundingClientRect();
                    monacoEditor.layout({ width, height });

                    timer = undefined;
                });
            });
            resizeObserver.observe(contentElement);

            let terminateEscaping: IDisposable | undefined;
            disposableCollection = new DisposableCollection();
            disposableCollection.add(editorService.setEditorInstance(monacoEditor));
            disposableCollection.add(
                monacoEditor.onDidFocusEditorWidget(() => {
                    terminateEscaping = shortcutService.forceEscape();
                })
            );
            disposableCollection.add(
                monacoEditor.onDidBlurEditorWidget(() => {
                    terminateEscaping?.dispose();
                    terminateEscaping = undefined;
                })
            );
            disposableCollection.add(toDisposable(() => terminateEscaping?.dispose()));
        }

        return () => {
            if (resizeObserver && contentElement) {
                resizeObserver.unobserve(contentElement);
            }

            disposableCollection?.dispose();
        };
    }, [editorService, shortcutService]);

    const startExecution = useExecution(monacoEditorRef);

    return (
        <div className="univer-h-full">
            <div ref={editorContentRef} className="univer-h-[calc(100%-60px)] univer-w-full univer-overflow-hidden">
                <div ref={editorContainerRef} />
            </div>
            <div className="univer-mt-2.5">
                <Button variant="primary" onClick={startExecution}>
                    {localeService.t('script-panel.panel.execute')}
                </Button>
            </div>
        </div>
    );
}

function useExecution(monacoEditorRef: MutableRefObject<Nullable<editor.IStandaloneCodeEditor>>) {
    const scriptService = useDependency(IUniscriptExecutionService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);

    return useCallback(() => {
        const model = monacoEditorRef.current?.getModel();
        if (model) {
            scriptService
                .execute(model.getValue())
                .then(() => {
                    messageService.show({
                        content: localeService.t('uniscript.message.success'),
                        type: MessageType.Success,
                    });
                })
                .catch(() => {
                    messageService.show({
                        content: localeService.t('uniscript.message.failed'),
                        type: MessageType.Error,
                    });
                });
        }
    }, [localeService, messageService, monacoEditorRef, scriptService]);
}
