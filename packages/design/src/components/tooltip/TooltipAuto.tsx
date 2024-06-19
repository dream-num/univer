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

import React, { useEffect, useRef, useState } from 'react';
import cs from 'clsx';
import type { ITooltipProps } from './Tooltip';
import { Tooltip } from './Tooltip';
import styles from './index.module.less';

export interface ITooltipAutoProps extends Omit<ITooltipProps, 'children'> {
    lines?: number;
    wrapperClass?: string;
    wrapperStyle?: React.CSSProperties;
    children: React.ReactNode;
}

export function TooltipAuto(props: ITooltipAutoProps) {
    const { lines, wrapperClass, wrapperStyle, children, title, ...tooltipProps } = props;
    const [overflow, setOverflow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleChange = () => {
            if (ref.current) {
                setOverflow(
                    ref.current.scrollHeight > ref.current.offsetHeight
                );
            }
        };

        if (ref.current) {
            handleChange();
            const observer = new ResizeObserver(handleChange);
            observer.observe(ref.current);
            return () => observer.disconnect();
        }
    }, [overflow]);

    const child = (
        <div ref={ref} className={cs(wrapperClass, styles.tooltipAuto)} style={{ ...wrapperStyle, WebkitLineClamp: lines }}>
            {children}
        </div>
    );

    return overflow
        ? (
            <Tooltip {...tooltipProps} title={overflow ? title : undefined}>
                {child}
            </Tooltip>
        )
        : child;
}
