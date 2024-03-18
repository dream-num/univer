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
import { ComponentManager, useObservable } from '@univerjs/ui';
import React from 'react';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IPosition } from '@univerjs/core';
import { DropdownManagerService } from '../..';

const calcAnchorStyle = (position: IPosition, width: number, height: number, containerWidth: number, containerHeight: number): React.CSSProperties => {
    const { startX, startY, endX, endY } = position;

    const verticalStyle = (endY + height) > containerHeight ? { bottom: containerHeight - startY + 3 } : { top: endY + 3 };
    const horizontalStyle = (startX + width) > containerWidth ? { right: containerWidth - endX } : { left: startX };

    return {
        position: 'absolute',
        ...verticalStyle,
        ...horizontalStyle,
        zIndex: 100,
        background: '#fff',
    };
};

export function CellDropdown() {
    const dropdownManagerService = useDependency(DropdownManagerService);
    const activeDropdown = useObservable(dropdownManagerService.activeDropdown$);
    const componentManager = useDependency(ComponentManager);
    const renderManagerService = useDependency(IRenderManagerService);

    if (!activeDropdown) {
        return null;
    }
    const { componentKey, width, height, position, location } = activeDropdown;
    const Component = componentManager.get(componentKey);
    const currentRender = renderManagerService.getRenderById(location.unitId);

    if (!Component || !currentRender) {
        return null;
    }

    const canvasWidth = currentRender.engine.width;
    const canvasHeight = currentRender.engine.height;

    const style = calcAnchorStyle(position, width, height, canvasWidth, canvasHeight);
    const key = `${location.unitId}-${location.subUnitId}-${location.row}-${location.col}`;

    return (
        <div
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={() => {
                dropdownManagerService.hideDropdown();
            }}
        >
            <div style={style} onClick={(e) => e.stopPropagation()}>
                <Component key={key} width={width} height={height} location={location} position={position} />
            </div>
        </div>
    );
}
