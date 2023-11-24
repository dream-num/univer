import React from 'react';

import styles from './index.module.less';

interface IParamsProps {
    className?: string;
    title?: string | React.ReactElement;
    value?: string | React.ReactElement;
}

export function FunctionParams(props: IParamsProps) {
    const { className, value, title } = props;
    return (
        <div className={styles.formulaFunctionParams}>
            <div className={`${styles.formulaFunctionParamsTitle} ${className}`}>{title}</div>
            <div className={styles.formulaFunctionParamsDetail}>{value}</div>
        </div>
    );
}
