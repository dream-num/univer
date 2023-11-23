import React from 'react';

import styles from './index.module.less';

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string | React.ReactElement;
}

export function FunctionParams(props: IParamsProps) {
    return (
        <div className={styles.formulaFunctionParams}>
            <div className={`${styles.formulaFunctionParamsTitle} ${props.className}`}>{props.title}</div>
            <div className={styles.formulaFunctionParamsDetail}>{props.value}</div>
        </div>
    );
}
