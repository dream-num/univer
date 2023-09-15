import { IKeyValue } from '@univerjs/core';
import React, { useEffect, useRef } from 'react';

import styles from './index.module.less';

export interface BaseDragProps {
    children: React.ReactNode;

    /**
     * Semantic DOM class
     * @default ''
     * */
    className?: string;

    /**
     * Whether to enable drag
     * @default true
     */
    isDrag?: boolean;
}

/**
 * Drag Component
 */
export function Drag({ isDrag = true, className = '', children }: BaseDragProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const getPosition = () => {
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const rootW = rootRef.current?.offsetWidth || 0;
        const rootH = rootRef.current?.offsetHeight || 0;
        const top = (h - rootH) / 2;
        const left = (w - rootW) / 2;

        return {
            top,
            left,
        };
    };

    const initDragDialog = () => {
        const drag = rootRef.current;

        if (!drag) return;

        const divMask = drag.querySelector(`.${styles.dragMask}`) as HTMLElement;

        const dragBarTop = drag.querySelector(`.${styles.dragBarTop}`) as HTMLElement;
        const dragBarBottom = drag.querySelector(`.${styles.dragBarBottom}`) as HTMLElement;
        const dragBarLeft = drag.querySelector(`.${styles.dragBarLeft}`) as HTMLElement;
        const dragBarRight = drag.querySelector(`.${styles.dragBarRight}`) as HTMLElement;

        const pointerDownListener = (e: PointerEvent) => {
            e = e || window.event;
            const diffX = e.clientX - drag.offsetLeft;
            const diffY = e.clientY - drag.offsetTop;
            console.info('diffX', e, drag.offsetLeft, diffX);

            if (typeof (drag as IKeyValue).setCapture !== 'undefined') {
                (drag as IKeyValue).setCapture();
            }

            divMask.style.width = '100%';
            divMask.style.height = '100%';

            document.body.style.userSelect = 'none';

            const pointerMoveListener = (e: PointerEvent) => {
                e = e || window.event;
                let left = e.clientX - diffX;
                let top = e.clientY - diffY;

                if (left < -drag.offsetWidth + 100) {
                    left = -drag.offsetWidth + 100;
                } else if (left > window.innerWidth - 100) {
                    left = window.innerWidth - 100;
                }
                if (top < -drag.offsetHeight + 100) {
                    top = -drag.offsetHeight + 100;
                } else if (top > window.innerHeight - 100) {
                    top = window.innerHeight - 100;
                }

                drag.style.left = `${left}px`;
                drag.style.top = `${top}px`;
                drag.style.transform = '';
            };

            const pointerUpListener = (e: PointerEvent) => {
                document.removeEventListener('pointermove', pointerMoveListener);
                document.removeEventListener('pointerup', pointerUpListener);

                if (typeof (drag as IKeyValue).releaseCapture !== 'undefined') {
                    (drag as IKeyValue).releaseCapture();
                }

                divMask.style.width = '0';
                divMask.style.height = '0';
                document.body.style.userSelect = '';
            };

            document.addEventListener('pointermove', pointerMoveListener);
            document.addEventListener('pointerup', pointerUpListener);
        };

        dragBarTop?.addEventListener('pointerdown', pointerDownListener);
        dragBarBottom?.addEventListener('pointerdown', pointerDownListener);
        dragBarLeft?.addEventListener('pointerdown', pointerDownListener);
        dragBarRight?.addEventListener('pointerdown', pointerDownListener);
    };

    useEffect(() => {
        if (isDrag) {
            initDragDialog();
        }
    }, [isDrag]);

    return (
        <>
            {isDrag ? (
                <div className={styles.dragContainer} ref={rootRef}>
                    <div className={`${styles.dragDialog} ${className}`}>
                        {children}

                        <div className={styles.dragBarLeft}></div>
                        <div className={styles.dragBarRight}></div>
                        <div className={styles.dragBarTop}></div>
                        <div className={styles.dragBarBottom}></div>

                        <div className={styles.dragMask}></div>
                    </div>
                </div>
            ) : (
                children
            )}
        </>
    );
}
