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
import { Tooltip } from '@univerjs/design';
import { CloseSingle } from '@univerjs/icons';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

export interface IProgressBarProps {
    progress: { done: number; count: number; label?: string };
    barColor?: string;
    onTerminate?: () => void;
    onClearProgress?: () => void; // Notify the parent component of the reset progress
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor, progress, onTerminate, onClearProgress } = props;
    const { count, done, label = '' } = progress;

    const themeService = useDependency(ThemeService);
    const color = barColor ?? themeService.getCurrentTheme().primaryColor; ;

    const progressBarInnerRef = useRef<HTMLDivElement>(null);
    // Introduce a state variable for visibility
    const [visible, setVisible] = useState(count > 0);

    const [prevCount, setPrevCount] = useState(0);
    const [prevDone, setPrevDone] = useState(0);

    useEffect(() => {
        if (!progressBarInnerRef.current) return;

        const progressBarInner = progressBarInnerRef.current;

        // Hide immediately if both count and done are zero
        if (count === 0 && done === 0) {
            setVisible(false);
        }
        // Handle the special case if count and done are equal for the first time and not from a previous progress change
        else if (count === done && prevCount === 0 && prevDone === 0) {
            setVisible(true);
            progressBarInner.style.width = '0%';
            requestAnimationFrame(() => {
                progressBarInner.style.width = '100%';
            });
        }
        // Update the width of the progress bar
        else if (count > 0) {
            setVisible(true);

            // Trigger the animation to prevent the progress bar from not being closed due to reaching 100% too quickly without animation
            if (done === count) {
                requestAnimationFrame(() => {
                    progressBarInner.style.width = `${Math.floor((done / count) * 100)}%`;
                });
            } else {
                progressBarInner.style.width = `${Math.floor((done / count) * 100)}%`;
            }
        }
        // Else, wait for the transition to end before hiding

        // Listen for the transitionend event
        const handleTransitionEnd = () => {
            if ((count === 0 && done === 0) || done === count) {
                // Hide the progress bar after the animation finishes
                setVisible(false);
                // Reset the width for future progress bars
                progressBarInner.style.width = '0%';

                // Notify the parent component to reset the progress after the animation ends
                // After the progress bar is completed 100%, the upper props data source may not be reset, resulting in count and done still being the previous values (displaying 100%) when the progress bar is triggered next time, so a message is reported here to trigger clearing.
                if (done === count && onClearProgress) {
                    onClearProgress();
                }
            }
        };

        progressBarInner.addEventListener('transitionend', handleTransitionEnd);

        // Update prevCount and prevDone
        setPrevCount(count);
        setPrevDone(done);

        // Clean up the event listener on unmount or when dependencies change
        return () => {
            progressBarInner.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [count, done]);

    return (
        <div className={styles.progressBarContainer} style={{ display: visible ? 'flex' : 'none' }}>

            <Tooltip showIfEllipsis title={label}>
                <span className={styles.progressBarLabel}>{label}</span>
            </Tooltip>

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
