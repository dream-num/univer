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
import React, { useEffect, useState } from 'react';
import type { IProgressStep } from '../../services/progress/progress.service';
import { IProgressService } from '../../services/progress/progress.service';
import styles from './index.module.less';

export interface IProgressBarProps {
    barColor: string;
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor } = props;
    const progressService = useDependency(IProgressService);

    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const progressVisible = progressService.progressVisible$.subscribe((isVisible) => {
            if (!isVisible) {
                // Wait for the progress animation to complete before hiding the progress bar
                setTimeout(() => {
                    setVisible(isVisible);
                    setProgress(0);
                }, 500);
            } else {
                setVisible(isVisible);
            }
        });

        const progressChange = progressService.progressChange$.subscribe((task: IProgressStep) => {
            const { step } = task;
            setProgress((currentProgress) => {
                const newProgress = currentProgress + (1 - currentProgress) * step;
                return newProgress;
            });
        });

        return () => {
            progressVisible.unsubscribe();
            progressChange.unsubscribe();
        };
    }, []);

    return (
        <div className={styles.progressBar} style={{ display: visible ? 'block' : 'none' }}>
            <div
                className={styles.progressBarInner}
                style={{
                    width: `${Math.floor(progress * 100)}%`,
                    backgroundColor: barColor,
                }}
            />
        </div>
    );
};
