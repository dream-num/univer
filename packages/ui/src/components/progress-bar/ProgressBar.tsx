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
import React, { useEffect, useMemo, useRef } from 'react';
import styles from './index.module.less';

export interface IProgressBarProps {
    progress: { done: number; count: number };

    barColor?: string;
}

export function ProgressBar(props: IProgressBarProps) {
    const { barColor, progress } = props;
    const { count, done } = progress;

    const themeService = useDependency(ThemeService);
    const color = barColor ?? themeService.getCurrentTheme().primaryColor; ;

    const progressBarInnerRef = useRef<HTMLDivElement>(null);
    const visible = useMemo(() => count > 0, [count]);

    useEffect(() => {
        if (!progressBarInnerRef.current) return;

        if (count === 0) {
            progressBarInnerRef.current.style.width = '0%';
        } else {
            progressBarInnerRef.current.style.width = `${Math.floor((done / count) * 100)}%`;
        }
    }, [visible, count, done]);

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
            <div className={styles.progressBarCloseButton}></div>
        </div>
    );
};
