/**
 * Copyright 2023-present DreamNum Inc.
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
            <div className={`
              ${styles.formulaFunctionParamsTitle}
              ${className}
            `}
            >
                {title}
            </div>
            <div className={styles.formulaFunctionParamsDetail}>{value}</div>
        </div>
    );
}
