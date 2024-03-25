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

export interface IPopupLayoutInfo {
    position: IAbsolutePosition;
    width: number;
    height: number;
    containerWidth: number;
    containerHeight: number;
    direction?: 'horizontal' | 'vertical';
}

const calcPopupPosition = (layout: IPopupLayoutInfo) => {
    const { position, width, height, containerHeight, containerWidth, direction = 'vertical' } = layout;
    if (direction === 'vertical') {
        const { left: startX, top: startY, right: endX, bottom: endY } = position;

        const verticalStyle = (endY + height) > containerHeight ? { top: startY - height } : { top: endY };
        const horizontalStyle = (startX + width) > containerWidth ? { left: endX - width } : { left: startX };

        return {
            ...verticalStyle,
            ...horizontalStyle,
        };
    } else {
        const { left: startX, top: startY, right: endX, bottom: endY } = position;

        const verticalStyle = ((startY + height) > containerHeight) ? { top: endY - height } : { top: startY };
        const horizontalStyle = ((endX + width) > containerWidth) ? { left: startX - width } : { left: endX };

        return {
            ...verticalStyle,
            ...horizontalStyle,
        };
    }
};

function RectPopup(props: IRectPopupProps) {
    const { children, anchorRect, direction = 'vertical', onClickOutside } = props;
    const mounted = useRef(false);
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
        setPosition(
            calcPopupPosition(
                {
                    position: anchorRect,
                    width: clientWidth,
                    height: clientHeight,
                    containerWidth: innerWidth,
                    containerHeight: innerHeight,
                    direction,
                }
            )
        );
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
        mounted.current = true;
        const handleClick = (e: MouseEvent) => {
            clickOtherFn.current?.(e);
        };
        setTimeout(() => {
            if (mounted.current) {
                window.addEventListener('click', handleClick);
            }
        }, 100);
        return () => {
            mounted.current = false;
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

RectPopup.calcPopupPosition = calcPopupPosition;

export { RectPopup };
