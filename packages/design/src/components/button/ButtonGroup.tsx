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

/* eslint-disable react/no-children-map */
/* eslint-disable react/no-children-count */
/* eslint-disable react/no-clone-element */

import type { ReactElement } from 'react';
import type { IButtonProps } from './Button';
import { Children, cloneElement } from 'react';
import { clsx } from '../../helper/clsx';

export interface IButtonGroupProps {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    children: ReactElement<IButtonProps>[];
}

export const ButtonGroup = ({
    className,
    orientation = 'horizontal',
    children,
}: IButtonGroupProps) => {
    const totalButtons = Children.count(children);
    const isHorizontal = orientation === 'horizontal';
    const isVertical = orientation === 'vertical';

    return (
        <div
            className={clsx(
                'univer-flex',
                {
                    'univer-flex-col': isVertical,
                    'univer-w-fit': isVertical,
                },
                className
            )}
        >
            {Children.map(children, (child, index) => {
                const isFirst = index === 0;
                const isLast = index === totalButtons - 1;

                return cloneElement(child, {
                    className: clsx(
                        {
                            'univer-rounded-l-none': isHorizontal && !isFirst,
                            'univer-rounded-r-none': isHorizontal && !isLast,
                            'univer-border-l-0': isHorizontal && !isFirst,

                            'univer-rounded-t-none': isVertical && !isFirst,
                            'univer-rounded-b-none': isVertical && !isLast,
                            'univer-border-t-0': isVertical && !isFirst,
                        },
                        child.props.className
                    ),
                });
            })}
        </div>
    );
};
