import { ComponentManager } from '@univerjs/base-ui';
import { Nullable } from '@univerjs/core';
import { CheckMarkSingle, CloseSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';

import styles from './index.module.less';

type FormulaState = {
    namedRanges: any[];
    spanClass: string;
    formulaContent: string;
    fx: Nullable<Fx>;
};

export type Fx = {
    icon: string;
    onClick: () => void;
};

export function FormulaBar() {
    const [state, setState] = useState<FormulaState>({
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

    const componentManager = useDependency(ComponentManager);
    const Icon = componentManager.get(state.fx?.icon ?? '');

    function printChange(e: React.KeyboardEvent<HTMLDivElement>) {
        e.stopPropagation();
        console.log(e);
    }

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
                    <div
                        autoFocus
                        contentEditable={true}
                        className={styles.formulaContent}
                        onKeyUp={(e) => printChange(e)}
                        dangerouslySetInnerHTML={{ __html: state.formulaContent }}
                    />
                </div>
            </div>
        </div>
    );
}
