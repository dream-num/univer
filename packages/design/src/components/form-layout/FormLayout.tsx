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

import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import React from 'react';

import styles from './index.module.less';

export interface IFormLayoutProps {
    label?: React.ReactNode;
    desc?: React.ReactNode;
    children?: React.ReactNode;

    style?: React.CSSProperties;
    className?: string;

    error?: string;
}

export const FormLayout = (props: IFormLayoutProps) => {
    const { label, desc, children, style, className, error } = props;
    return (
        <div className={clsx(styles.formLayout, className)} style={style}>
            {label && <div className={styles.formLayoutLabel}>{label}</div>}
            {desc && <div className={styles.formLayoutDesc}>{desc}</div>}
            <div className={clsx(styles.formLayoutContent, error ? styles.formLayoutContentError : '')}>
                {children}
                {error
                    ? (
                        <div className={styles.formLayoutError}>
                            {error}
                        </div>
                    )
                    : null}
            </div>
        </div>
    );
};

export type IFormDualColumnLayoutProps = PropsWithChildren;

/**
 * A dual columns layout component for the form.
 * @param props props of the component
 */
export const FormDualColumnLayout = (props: IFormDualColumnLayoutProps) => {
    return (
        <div className={styles.formDualColumnLayout}>
            {props.children}
        </div>
    );
};
