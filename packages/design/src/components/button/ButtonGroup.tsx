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

/* eslint-disable react/no-children-to-array */
/* eslint-disable react/no-clone-element */

import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement, useContext } from 'react';
import type { IButtonProps } from './Button';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

export interface IButtonGroupProps {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    children: ReactNode;
}

export const ButtonGroup = ({
    className,
    orientation = 'horizontal',
    children,
}: IButtonGroupProps) => {
    const { direction } = useContext(ConfigContext);
    const validChildren = Children.toArray(children).filter(
        (child): child is ReactElement<IButtonProps> => isValidElement(child)
    );
    const totalButtons = validChildren.length;
    const isHorizontal = orientation === 'horizontal';
    const isVertical = orientation === 'vertical';
    const isRtl = direction === 'rtl';

    return (
        <div
            role="group"
            data-u-comp="button-group"
            dir={direction}
            className={clsx('univer-grid', {
                'univer-grid-flow-col': isHorizontal,
                'univer-w-fit univer-grid-flow-row': isVertical,
            }, className)}
        >
            {validChildren.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === totalButtons - 1;

                return cloneElement(child, {
                    className: clsx(
                        `
                          univer-relative
                          focus-visible:univer-z-10
                        `,
                        {
                            '!univer-rounded-l-none': isHorizontal && (isRtl ? !isLast : !isFirst),
                            '!univer-rounded-r-none': isHorizontal && (isRtl ? !isFirst : !isLast),
                            '!univer-border-l-0': isHorizontal && !isRtl && !isFirst,
                            '!univer-border-r-0': isHorizontal && isRtl && !isFirst,

                            '!univer-rounded-t-none': isVertical && !isFirst,
                            '!univer-rounded-b-none': isVertical && !isLast,
                            '!univer-border-t-0': isVertical && !isFirst,
                        },
                        child.props.className
                    ),
                });
            })}
        </div>
    );
};
