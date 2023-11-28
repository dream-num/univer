import { IMessageService, IShortcutService } from '@univerjs/base-ui';
import { DisposableCollection, LocaleService, Nullable, toDisposable } from '@univerjs/core';
import { Button, MessageType } from '@univerjs/design';
import { IDisposable } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';

import { ScriptEditorService } from '../../services/script-editor.service';
import { UniscriptExecutionService } from '../../services/script-execution.service';
import styles from './index.module.less';

export function ScriptEditorPanel() {
    const editorContentRef = useRef<HTMLDivElement | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const localeService = useDependency(LocaleService);
    const scriptService = useDependency(UniscriptExecutionService);
    const shortcutService = useDependency(IShortcutService);
    const editorService = useDependency(ScriptEditorService);
    const messageService = useDependency(IMessageService);

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
    }, []);

    const startExecution = useCallback(() => {
        const model = monacoEditorRef.current?.getModel();
        if (model) {
            scriptService
                .execute(model.getValue())
                .then(() => {
                    messageService.show({
                        content: 'Execution completed',
                        type: MessageType.Success,
                    });
                })
                .catch(() => {
                    messageService.show({
                        content: 'Execution failed',
                        type: MessageType.Error,
                    });
                });
        }
    }, [scriptService]);

    return (
        <div className={styles.scriptEditorPanel}>
            <div className={styles.scriptEditorContent} ref={editorContentRef}>
                <div className={styles.scriptEditorContainer} ref={editorContainerRef}></div>
            </div>
            <div className={styles.scriptEditorActions}>
                <Button type="primary" size="small" onClick={startExecution}>
                    {localeService.t('script-panel.panel.execute')}
                </Button>
            </div>
        </div>
    );
}
