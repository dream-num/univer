import { IRenderManagerService } from '@univerjs/base-render';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { CheckMarkSingle, CloseSingle, DownTriangleSingle, FxSingle, UpTriangleSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import styles from './index.module.less';

enum ArrowDirection {
    Down,
    Up,
}

interface IFormulaState {
    namedRanges: any[];
    iconStyle: string;
    arrowDirection: ArrowDirection;
}

export function FormulaBar() {
    const [state, setState] = useState<IFormulaState>({
        namedRanges: [
            {
                value: '1',
                label: '1',
            },
        ],
        iconStyle: styles.formulaGrey,
        arrowDirection: ArrowDirection.Down,
    });

    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);

    useEffect(() => {
        const editor = editorRef.current;

        if (editor == null) {
            return;
        }

        const renderSubscription = renderManagerService.currentRender$.subscribe((param) => {
            if (param !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return;
            }

            const engine = renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)?.engine;
            engine?.setContainer(editor);
        });

        const resizeObserver = new ResizeObserver(() => {
            const editorRect = editor.getBoundingClientRect();

            formulaEditorManagerService.setPosition(editorRect);
        });

        resizeObserver.observe(editor);

        // Clean up on unmount
        return () => {
            resizeObserver.unobserve(editor);
            renderSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    function handleArrowClick() {
        setState({
            ...state,
            arrowDirection: state.arrowDirection === ArrowDirection.Down ? ArrowDirection.Up : ArrowDirection.Down,
        });
    }

    return (
        <div
            className={styles.formulaBox}
            style={{ height: ArrowDirection.Down === state.arrowDirection ? '28px' : '82px' }}
        >
            <div className={styles.nameRanges}>
                <div className={styles.nameRangesInput} />
            </div>
            <div className={styles.formulaBar}>
                <div className={styles.formulaIcon}>
                    <span className={styles.iconContainer}>
                        <CloseSingle style={{ color: 'rgb(var(--error-color))' }} />
                    </span>
                    <span className={styles.iconContainer}>
                        <CheckMarkSingle style={{ color: 'rgb(var(--success-color))' }} />
                    </span>
                    <span className={styles.iconContainer}>
                        <FxSingle />
                    </span>
                </div>
                <div className={styles.formulaInput}>
                    <div className={styles.formulaContent} ref={editorRef} />
                    <div className={styles.arrowContainer} onClick={handleArrowClick}>
                        {state.arrowDirection === ArrowDirection.Down ? <DownTriangleSingle /> : <UpTriangleSingle />}
                    </div>
                </div>
            </div>
        </div>
    );
}
