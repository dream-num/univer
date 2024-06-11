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

import { ICommandService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import clsx from 'clsx';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { IDrawingManagerService, type IDrawingParam } from '@univerjs/drawing';
import { Radio, RadioGroup } from '@univerjs/design';
import { SetDocDrawingCommand } from '../../commands/commands/set-doc-drawing.command';
import styles from './index.module.less';

export interface IDocDrawingPositionProps {
    drawings: IDrawingParam[];
}

export const DocDrawingPosition = (props: IDocDrawingPositionProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings } = props;

    const drawingParam = drawings[0] as IDocDrawing;

    if (drawingParam == null) {
        return;
    }

    const { unitId } = drawingParam;

    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject?.scene;
    if (scene == null) {
        return;
    }

    const [value, setValue] = useState('');

    function handleChange(value: string | number | boolean) {
        setValue((value as string));

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        const updateParams = focusDrawings.map((drawing) => {
            return {
                unitId: drawing.unitId,
                subUnitId: drawing.subUnitId,
                drawingId: drawing.drawingId,
                anchorType: value,
            };
        });

        commandService.executeCommand(SetDocDrawingCommand.id, {
            unitId: focusDrawings[0].unitId,
            drawings: updateParams,
        });
    }

    return (
        <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-position.title')}</div>
                </div>
            </div>
            <div className={clsx(styles.imageCommonPanelRow)}>
                <div className={clsx(styles.imageCommonPanelColumn)}>
                    <RadioGroup value={value} onChange={handleChange} direction="vertical">
                        <Radio value="SheetDrawingAnchorType.Both">{localeService.t('drawing-anchor.both')}</Radio>
                        <Radio value="SheetDrawingAnchorType.Position">{localeService.t('drawing-anchor.position')}</Radio>
                        <Radio value="SheetDrawingAnchorType.None">{localeService.t('drawing-anchor.none')}</Radio>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};
