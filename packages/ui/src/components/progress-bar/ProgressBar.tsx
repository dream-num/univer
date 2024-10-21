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

import { ThemeService, useDependency } from '@univerjs/core';
import { CloseSingle } from '@univerjs/icons';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

export interface IProgressBarProps {
    progress: { done: number; count: number };
    barColor?: string;
    onTerminate?: () => void;
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor, progress, onTerminate } = props;
    const { count, done } = progress;

    const themeService = useDependency(ThemeService);
    const color = barColor ?? themeService.getCurrentTheme().primaryColor; ;

    const progressBarInnerRef = useRef<HTMLDivElement>(null);
    // Introduce a state variable for visibility
    const [visible, setVisible] = useState(count > 0);

    useEffect(() => {
        if (!progressBarInnerRef.current) return;

        const progressBarInner = progressBarInnerRef.current;

        // Update the width of the progress bar
        if (count > 0) {
            setVisible(true);
            progressBarInner.style.width = `${Math.floor((done / count) * 100)}%`;
        } else if (count === 0 && done === 0) {
            // Hide immediately if both count and done are zero
            setVisible(false);
        }
        // Else, wait for the transition to end before hiding

        // Listen for the transitionend event
        const handleTransitionEnd = () => {
            if ((count === 0 && done === 0) || done === count) {
                // Hide the progress bar after the animation finishes
                setVisible(false);
                // Reset the width for future progress bars
                progressBarInner.style.width = '0%';
            }
        };

        progressBarInner.addEventListener('transitionend', handleTransitionEnd);

        // Clean up the event listener on unmount or when dependencies change
        return () => {
            progressBarInner.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [count, done]);

    return (
        <div className={styles.progressBarContainer} style={{ display: visible ? 'flex' : 'none' }}>
            <div className={styles.progressBar}>
                <div
                    ref={progressBarInnerRef}
                    className={styles.progressBarInner}
                    style={{
                        backgroundColor: color,
                    }}
                />
            </div>
            <div className={styles.progressBarCloseButton} onClick={onTerminate}>
                {' '}
                <CloseSingle />
            </div>
        </div>
    );
};
