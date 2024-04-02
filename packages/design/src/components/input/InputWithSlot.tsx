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

import React, { useEffect, useRef } from 'react';

import styles from './index.module.less';
import { type IInputProps, Input } from './Input';

export interface IInputWithSlotProps extends IInputProps {
    /**
     * A React node that would be rendered in the slot of the input component.
     */
    slot: React.ReactNode;
}

function getPaddingRightBySize(size?: 'small' | 'middle' | 'large'): number {
    switch (size) {
        case 'small':
            return 6;
        case 'middle':
            return 6;
        case 'large':
            return 8;
        default:
            return 6;
    }
}

export function InputWithSlot(props: IInputWithSlotProps) {
    const { slot, ...rest } = props;
    const elementRef = useRef<HTMLDivElement>(null);
    const [paddingRight, setPaddingRight] = React.useState(getPaddingRightBySize(props.size));

    useEffect(() => {
        let observer: ResizeObserver | null;
        if (elementRef.current) {
            observer = new ResizeObserver(() => {
                // detectWidth
                const rightPadding = getPaddingRightBySize(props.size) * 2 + elementRef.current!.offsetWidth;
                setPaddingRight(rightPadding);
            });

            observer.observe(elementRef.current);
        }

        return () => {
            observer?.disconnect();
        };
    }, [slot, elementRef.current, props.size]);

    return (
        <div className={styles.inputSlotContainer}>
            <Input {...rest} affixWrapperStyle={{ paddingRight }} />
            {/* Pointer down should not causing focus change. */}
            <div ref={elementRef} className={styles.inputSlot} tabIndex={-1} onPointerDown={(e) => e.preventDefault()}>
                {slot}
            </div>
        </div>
    );
}
