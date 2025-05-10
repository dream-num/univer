/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { MoreUpSingle } from '@univerjs/icons';
import { createContext, useState } from 'react';
import { clsx } from '../../helper/clsx';

export interface IFormLayoutProps {
    label?: ReactNode;
    desc?: ReactNode;
    children?: ReactNode;

    style?: CSSProperties;
    className?: string;
    contentStyle?: CSSProperties;
    error?: string;
    collapsable?: boolean;
    defaultCollapsed?: boolean;
}

const FormLayoutContext = createContext(false);

export const FormLayout = (props: IFormLayoutProps) => {
    const { label, desc, children, style, className, error, contentStyle, collapsable = false, defaultCollapsed = false } = props;
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    return (
        <FormLayoutContext.Provider value>
            <div data-u-comp="form-layout" className={clsx('univer-mb-3 univer-flex univer-flex-col', className)} style={style}>
                {label && (
                    <div
                        className={clsx(`
                          univer-mb-2 univer-flex univer-min-h-3.5 univer-items-center univer-text-sm
                          univer-text-gray-900
                          dark:univer-text-white
                        `, {
                            'univer-cursor-pointer': collapsable,
                        })}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {label}
                        {collapsable
                            ? (
                                <MoreUpSingle
                                    className={clsx('univer-ml-1 univer-transition-transform', {
                                        'univer-rotate-180': collapsed,
                                    })}
                                />
                            )
                            : null}
                    </div>
                )}
                {collapsed && collapsable
                    ? null
                    : (
                        <>
                            {desc && (
                                <div
                                    className={`
                                      univer-mt-1 univer-text-sm univer-text-gray-600
                                      dark:univer-text-gray-200
                                    `}
                                >
                                    {desc}
                                </div>
                            )}
                            {children
                                ? (
                                    <div
                                        className={clsx(`
                                          [&_[data-u-comp=input]]:univer-w-full
                                          [&_[data-u-comp=select]]:univer-w-full
                                          last:univer-mb-0
                                        `, {
                                            '[&_[data-u-comp=input]]:univer-border-red-500': error,
                                            '[&_[data-u-comp=select]]:univer-border-red-500': error,
                                        })}
                                        style={contentStyle}
                                    >
                                        {children}
                                        {error
                                            ? (
                                                <div className="univer-mt-1 univer-text-xs univer-text-red-500">
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
        <div
            className={`
              univer-flex univer-justify-between
              [&_[data-u-comp=form-layout]]:univer-max-w-[calc(50%-8px)] [&_[data-u-comp=form-layout]]:univer-shrink
              [&_[data-u-comp=form-layout]]:univer-grow
            `}
        >
            {props.children}
        </div>
    );
};
