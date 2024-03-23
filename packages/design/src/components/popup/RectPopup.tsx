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
import styles from './index.module.less';

interface IAbsolutePosition {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface IRectPopupProps {
    children?: React.ReactNode;

    /**
     * the anchor element bounding rect
     */
    anchorRect: IAbsolutePosition;

    direction?: 'horizontal' | 'vertical';

    onClickOutside?: (e: MouseEvent) => void;
}

const calcHorizontalPopupPosition = (position: IAbsolutePosition, width: number, height: number, containerWidth: number, containerHeight: number): Partial<IAbsolutePosition> => {
    const { left: startX, top: startY, right: endX, bottom: endY } = position;

    const verticalStyle = ((startY + height) > containerHeight) ? { top: endY - height } : { top: startY };
    const horizontalStyle = ((endX + width) > containerWidth) ? { left: startX - width } : { left: endX };

    return {
        ...verticalStyle,
        ...horizontalStyle,
    };
};

const calcVerticalPopupPosition = (position: IAbsolutePosition, width: number, height: number, containerWidth: number, containerHeight: number): Partial<IAbsolutePosition> => {
    const { left: startX, top: startY, right: endX, bottom: endY } = position;

    const verticalStyle = (endY + height) > containerHeight ? { top: startY - height } : { top: endY };
    const horizontalStyle = (startX + width) > containerWidth ? { left: endX - width } : { left: startX };

    return {
        ...verticalStyle,
        ...horizontalStyle,
    };
};

export function RectPopup(props: IRectPopupProps) {
    const { children, anchorRect, direction = 'vertical', onClickOutside } = props;

    const nodeRef = useRef(null);
    const clickOtherFn = useRef(onClickOutside);

    clickOtherFn.current = onClickOutside;
    const [position, setPosition] = useState<Partial<IAbsolutePosition>>({
        top: -9999,
        left: -9999,
    });

    useEffect(() => {
        const { clientWidth, clientHeight } = nodeRef.current!;
        const { innerWidth, innerHeight } = window;
        if (direction === 'horizontal') {
            setPosition(
                calcHorizontalPopupPosition(
                    anchorRect,
                    clientWidth,
                    clientHeight,
                    innerWidth,
                    innerHeight
                )
            );
        } else {
            setPosition(
                calcVerticalPopupPosition(
                    anchorRect,
                    clientWidth,
                    clientHeight,
                    innerWidth,
                    innerHeight
                )
            );
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        anchorRect.left,
        anchorRect.top,
        anchorRect.bottom,
        anchorRect.right,
        direction,
    ]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            clickOtherFn.current?.(e);
        };
        setTimeout(() => {
            window.addEventListener('click', handleClick);
        }, 100);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [clickOtherFn]);

    return (
        <section
            ref={nodeRef}
            className={styles.popup}
            style={position}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {children}
        </section>
    );
}
