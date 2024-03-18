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
import { useObservable } from '@univerjs/ui';
import React from 'react';
import type { IPosition } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ErrorSingle, WarningSingle } from '@univerjs/icons';
import cs from 'clsx';
import { CellAlertManagerService, CellAlertType } from '../../services/cell-alert-manager.service';
import styles from './index.module.less';

const iconMap = {
    [CellAlertType.ERROR]: <ErrorSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconError)} />,
    [CellAlertType.INFO]: <WarningSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconInfo)} />,
    [CellAlertType.WARNING]: <WarningSingle className={cs(styles.cellAlertIcon, styles.cellAlertIconWarning)} />,
};

const calcAnchorStyle = (position: IPosition, width: number, height: number, containerWidth: number, containerHeight: number): React.CSSProperties => {
    const { startX, startY, endX, endY } = position;

    const verticalStyle = ((startY + height) > containerHeight) ? { bottom: containerHeight - endY } : { top: startY };
    const horizontalStyle = ((endX + width) > containerWidth) ? { right: containerWidth - startX } : { left: endX };

    return {
        position: 'absolute',
        ...verticalStyle,
        ...horizontalStyle,
        width,
        height,
    };
};

export function CellAlert() {
    const cellAlertService = useDependency(CellAlertManagerService);
    const currentCell = useObservable(cellAlertService.currentAlert$);
    const renderManagerService = useDependency(IRenderManagerService);

    if (!currentCell) {
        return null;
    }

    const { position, location, width, height, type } = currentCell;

    const currentRender = renderManagerService.getRenderById(location.unitId);

    if (!currentRender) {
        return null;
    }

    const { width: canvasWidth, height: canvasHeight } = currentRender.engine;

    const style: React.CSSProperties = calcAnchorStyle(position, width, height, canvasWidth, canvasHeight);

    return (
        <div style={style} className={styles.cellAlert}>
            <div className={styles.cellAlertTitle}>
                {iconMap[type]}
                {currentCell.title}
            </div>
            <div className={styles.cellAlertContent}>{currentCell.message}</div>
        </div>
    );
}
