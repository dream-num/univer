import { IShortcutService } from '@univerjs/base-ui';
import { DisposableCollection, LocaleService, Nullable, toDisposable } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IDisposable } from '@wendellhu/redi';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';

import { UniscriptService } from '../../services/script.service';
import styles from './index.module.less';

// TODO@wzhudev: load monaco editor's resources for web worker

// TODO: @wzhudev: this should be moved to a MonacoEditorLoadService
window.MonacoEnvironment = {
    getWorkerUrl(moduleID, label) {
        if (label === 'typescript' || label === 'javascript') {
            return './vs/language/typescript/ts.worker.js';
        }

        return './vs/editor/editor.worker.js';
    },
};

export function ScriptEditorPanel() {
    // HTML element ref
    const editorContentRef = useRef<HTMLDivElement | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const localeService = useDependency(LocaleService);
    const scriptService = useDependency(UniscriptService);
    const shortcutService = useDependency(IShortcutService);

    useEffect(() => {
        const containerElement = editorContainerRef.current;
        const contentElement = editorContentRef.current;

        let disposableCollection: Nullable<DisposableCollection> = null;
        let resizeObserver: Nullable<ResizeObserver> = null;

        if (containerElement && contentElement) {
            const monacoEditor = (monacoEditorRef.current = editor.create(containerElement, {
                value: '',
                language: 'javascript',
                automaticLayout: true,
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
        const monacoEditor = monacoEditorRef.current;
        if (monacoEditor) {
            scriptService.execute('').then(() => {
                console.log('execution completed');
            });
        }
    }, [scriptService]);

    return (
        <div className={styles.scriptEditorPanel}>
            <div className={styles.scriptEditorContent} ref={editorContentRef}>
                <div className={styles.scriptEditorContainer} ref={editorContainerRef}></div>
            </div>
            <div className={styles.scriptEditorActions}>
                <Button type="primary" size="small">
                    {localeService.t('script-panel.panel.execute')}
                </Button>
            </div>
        </div>
    );
}
