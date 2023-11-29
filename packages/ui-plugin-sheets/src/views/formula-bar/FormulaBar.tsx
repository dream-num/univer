import { IRenderManagerService } from '@univerjs/base-render';
import { ComponentManager } from '@univerjs/base-ui';
import type { Nullable } from '@univerjs/core';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { CheckMarkSingle, CloseSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

interface IFormulaState {
    namedRanges: any[];
    spanClass: string;
    formulaContent: string;
    fx: Nullable<IFx>;
}

export interface IFx {
    icon: string;
    onClick: () => void;
}

export function FormulaBar() {
    const [state, setState] = useState<IFormulaState>({
        namedRanges: [
            {
                value: '1',
                label: '1',
            },
        ],
        spanClass: styles.formulaGrey,
        formulaContent: '',
        fx: null,
    });

    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const componentManager = useDependency(ComponentManager);
    const Icon = componentManager.get(state.fx?.icon ?? '');

    // function printChange(e: React.KeyboardEvent<HTMLDivElement>) {
    //     e.stopPropagation();
    //     console.log(e);
    // }

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

        // Clean up on unmount
        return () => {
            renderSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    return (
        <div className={styles.formulaBox}>
            {/* <Select children={namedRanges} type={0}></Select> */}
            <div className={styles.formulaBar}>
                <div className={styles.formulaIcon}>
                    <span className={state.spanClass}>
                        <CloseSingle />
                    </span>
                    <span className={state.spanClass}>
                        <CheckMarkSingle />
                    </span>
                    {state.fx ? (
                        <span className={styles.formulaBlack} onClick={state.fx.onClick}>
                            {Icon && <Icon />}
                        </span>
                    ) : null}
                </div>
                <div className={styles.formulaInput}>
                    <div className={styles.formulaContent} ref={editorRef} />
                </div>
            </div>
        </div>
    );
}
