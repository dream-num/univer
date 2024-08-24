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

import { useDependency, useObservable } from '@univerjs/core';
import React, { useCallback } from 'react';
import clsx from 'clsx';
import { CROSSHAIR_HIGHLIGHT_COLORS, SheetsCrosshairHighlightService } from '../../services/crosshair.service';

import styles from './index.module.less';

export interface ICrosshairOverlayProps {
    onChange?: (value: string) => void;
}

export function CrosshairOverlay(props: ICrosshairOverlayProps): React.JSX.Element {
    const { onChange } = props;

    const crosshairSrv = useDependency(SheetsCrosshairHighlightService);

    const currentColor = useObservable(crosshairSrv.color$);

    const handleColorPicked = useCallback((color: string) => {
        onChange?.(color);
    }, [onChange]);

    return (
        <div className={styles.crosshairHighlightOverlay}>
            {CROSSHAIR_HIGHLIGHT_COLORS.map((color: string) => {
                return (
                    <div
                        key={color}
                        className={clsx(styles.crosshairHighlightItem, {
                            [styles.crosshairHighlightItemSelected]: color === currentColor,
                        })}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorPicked(color)}
                    >
                    </div>
                );
            })}
        </div>
    );
}
