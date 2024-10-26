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

import type { PropsWithChildren } from 'react';
import { MoreUpSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { createContext, useContext, useState } from 'react';

import styles from './index.module.less';

export interface IFormLayoutProps {
    label?: React.ReactNode;
    desc?: React.ReactNode;
    children?: React.ReactNode;

    style?: React.CSSProperties;
    className?: string;
    contentStyle?: React.CSSProperties;
    error?: string;
    collapsable?: boolean;
    defaultCollapsed?: boolean;
}

const FormLayoutContext = createContext(false);

export const FormLayout = (props: IFormLayoutProps) => {
    const { label, desc, children, style, className, error, contentStyle, collapsable = false, defaultCollapsed = false } = props;
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const isInner = useContext(FormLayoutContext);

    return (
        <FormLayoutContext.Provider value={true}>
            <div className={clsx(styles.formLayout, isInner ? styles.formLayoutInner : '', className)} style={style}>
                {label && (
                    <div style={{ cursor: collapsable ? 'pointer' : 'default' }} className={styles.formLayoutLabel} onClick={() => setCollapsed(!collapsed)}>
                        {label}
                        {collapsable
                            ? (
                                <MoreUpSingle
                                    style={{
                                        marginLeft: 4,
                                        transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s',
                                    }}
                                />
                            )
                            : null}
                    </div>
                )}
                {collapsed && collapsable
                    ? null
                    : (
                        <>
                            {desc && <div className={styles.formLayoutDesc}>{desc}</div>}
                            {children
                                ? (
                                    <div style={contentStyle} className={clsx(styles.formLayoutContent, error ? styles.formLayoutContentError : '')}>
                                        {children}
                                        {error
                                            ? (
                                                <div className={styles.formLayoutError}>
                                                    {error}
                                                </div>
                                            )
                                            : null}
                                    </div>
                                )
                                : null}
                        </>
                    )}
            </div>
        </FormLayoutContext.Provider>
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
