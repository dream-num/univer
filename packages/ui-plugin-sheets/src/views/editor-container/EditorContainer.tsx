import { IRenderManagerService } from '@univerjs/base-render';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';
import { switchMap } from 'rxjs/operators';

import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import styles from './index.module.less';

interface ICellIEditorProps {}

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_DEFAULT_POSITION = {
    width: 0,
    height: 0,
    top: HIDDEN_EDITOR_POSITION,
    left: HIDDEN_EDITOR_POSITION,
};

export const EditorContainer: React.FC<ICellIEditorProps> = () => {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });

    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const cellEditorManagerService: ICellEditorManagerService = useDependency(ICellEditorManagerService);

    useEffect(() => {
        const editor = editorRef.current;

        if (editor == null) {
            return;
        }
        const renderSubscription = renderManagerService.currentRender$
            .pipe(
                switchMap(() => {
                    const engine = renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.engine;
                    engine?.setContainer(editor);
                    return cellEditorManagerService.state$;
                })
            )
            .subscribe((param) => {
                if (param == null) {
                    return;
                }

                const {
                    startX = HIDDEN_EDITOR_POSITION,
                    startY = HIDDEN_EDITOR_POSITION,
                    endX = 0,
                    endY = 0,
                    show = false,
                } = param;

                if (!show) {
                    setState({
                        ...EDITOR_DEFAULT_POSITION,
                    });
                } else {
                    setState({
                        width: endX - startX,
                        height: endY - startY,
                        left: startX - 1.5,
                        top: startY - 1.5,
                    });
                }
            });

        // Clean up on unmount
        return () => {
            renderSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    useEffect(() => {
        cellEditorManagerService.setFocus(true);
    }, [state]);

    return (
        <div
            className={styles.editorContainer}
            style={{
                left: state.left,
                top: state.top,
                width: state.width,
                height: state.height,
            }}
        >
            <div className={styles.editorInput} ref={editorRef} />
        </div>
    );
};
