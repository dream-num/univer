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

import { clsx, Tooltip } from '@univerjs/design';
import { CloseSingle } from '@univerjs/icons';
import { useEffect, useRef, useState } from 'react';

export interface IProgressBarProps {
    progress: { done: number; count: number; label?: string };
    barColor?: string;
    onTerminate?: () => void;
    onClearProgress?: () => void; // Notify the parent component of the reset progress
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor, progress, onTerminate, onClearProgress } = props;
    const { count, done, label = '' } = progress;

    const progressBarInnerRef = useRef<HTMLDivElement>(null!);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const progressBarInner = progressBarInnerRef.current;

        // Hide immediately if both count and done are zero
        if (count === 0 && done === 0) {
            setVisible(false);
            progressBarInner.style.width = '0%';
            return;
        }
        // Update the width of the progress bar
        else if (count > 0) {
            setVisible(true);
            const width = Math.floor((done / count) * 100);

            // Trigger the animation to prevent the progress bar from not being closed due to reaching 100% too quickly without animation
            if (done === count) {
                requestAnimationFrame(() => {
                    progressBarInner.style.width = `${width - 1}%`; // Set a width slightly smaller than the target
                    requestAnimationFrame(() => {
                        progressBarInner.style.width = `${width}%`; // Then set the target width
                    });
                });
            } else {
                progressBarInner.style.width = `${width}%`;
            }
        }
        // Else, wait for the transition to end before hiding

        // Listen for the transitionend event
        const handleTransitionEnd = () => {
            if (done === count) {
                // Hide the progress bar after the animation finishes
                setVisible(false);

                // Notify the parent component to reset the progress after the animation ends
                // After the progress bar is completed 100%, the upper props data source may not be reset, resulting in count and done still being the previous values (displaying 100%) when the progress bar is triggered next time, so a message is reported here to trigger clearing.
                onClearProgress && onClearProgress();
            }
        };

        progressBarInner.addEventListener('transitionend', handleTransitionEnd);

        // Clean up the event listener on unmount or when dependencies change
        return () => {
            progressBarInner.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [count, done]);

    return (
        <div
            className={clsx('univer-mx-2 univer-flex univer-items-center univer-gap-2', {
                'univer-flex': visible,
                'univer-hidden univer-w-0': !visible,
            })}
        >
            <Tooltip showIfEllipsis title={label}>
                <span className="univer-w-24 univer-truncate univer-text-right univer-text-xs">{label}</span>
            </Tooltip>

            <div className="univer-h-1 univer-w-40 univer-overflow-hidden univer-rounded-lg univer-bg-gray-200">
                <div
                    ref={progressBarInnerRef}
                    className="univer-h-full univer-bg-primary-600 univer-transition-[width]"
                    style={{
                        backgroundColor: barColor,
                    }}
                />
            </div>
            <button
                className={`
                  univer-flex univer-size-4 univer-cursor-pointer univer-items-center univer-justify-center
                  univer-border-none univer-bg-transparent univer-p-0
                  hover:univer-opacity-50
                `}
                type="button"
                onClick={onTerminate}
            >
                <CloseSingle
                    className={`
                      univer-size-3.5
                      dark:univer-text-white
                    `}
                />
            </button>
        </div>
    );
};
