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

import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';
import { CloseSingle } from '@univerjs/icons';
import type { IProgressStep } from '../../services/progress/progress.service';
import { IProgressService } from '../../services/progress/progress.service';
import styles from './index.module.less';

export interface IProgressBarProps {
    barColor: string;
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor } = props;
    const progressService = useDependency(IProgressService);
    const progressBarInnerRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const progressVisible = progressService.progressVisible$.subscribe((isVisible) => {
            if (!isVisible) {
                // Wait for the progress animation to complete before hiding the progress bar
                setTimeout(() => {
                    setVisible(isVisible);
                    if (progressBarInnerRef.current) {
                        progressBarInnerRef.current.style.width = '0%';
                    }
                }, 500);
            } else {
                setVisible(isVisible);
            }
        });

        const progressChange = progressService.progressChange$.subscribe((task: IProgressStep) => {
            const { step } = task;

            // UseState asynchronous updates will not be reflected in the UI in time, so we use direct DOM manipulation
            if (progressBarInnerRef.current) {
                const currentProgress = Number.parseFloat(progressBarInnerRef.current.style.width) || 0;
                const newProgress = currentProgress + (100 - currentProgress) * step;
                progressBarInnerRef.current.style.width = `${newProgress}%`;
            }
        });

        return () => {
            progressVisible.unsubscribe();
            progressChange.unsubscribe();
        };
    }, []);

    function handleClose() {
        progressService.stop();
    };

    return (
        <div className={styles.progressBarContainer} style={{ display: visible ? 'flex' : 'none' }}>
            <div className={styles.progressBar}>
                <div
                    ref={progressBarInnerRef}
                    className={styles.progressBarInner}
                    style={{
                        backgroundColor: barColor,
                    }}
                />
            </div>
            <div className={styles.closeButton} onClick={handleClose}><CloseSingle /></div>

        </div>
    );
};
