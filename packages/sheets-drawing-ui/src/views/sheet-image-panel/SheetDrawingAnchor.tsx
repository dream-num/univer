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

import type { IDrawingParam, Nullable } from '@univerjs/core';
import type { BaseObject } from '@univerjs/engine-render';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { ICommandService, LocaleService } from '@univerjs/core';
import { borderTopClassName, clsx, Radio, RadioGroup } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { SetSheetDrawingCommand } from '../../commands/commands/set-sheet-drawing.command';

export interface ISheetDrawingAnchorProps {
    drawings: IDrawingParam[];
}

export const SheetDrawingAnchor = (props: ISheetDrawingAnchorProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings } = props;

    const drawingParam = drawings[0] as ISheetDrawing;

    if (drawingParam == null) {
        return;
    }

    const { unitId } = drawingParam;

    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject?.scene;
    if (scene == null) {
        return;
    }
    const transformer = scene.getTransformerByCreate();

    const [anchorShow, setAnchorShow] = useState(true);

    const type = drawingParam.anchorType ?? SheetDrawingAnchorType.Position;
    const [value, setValue] = useState(type);

    function getUpdateParams(objects: Map<string, BaseObject>, drawingManagerService: IDrawingManagerService): Nullable<ISheetDrawing>[] {
        const params: Nullable<ISheetDrawing>[] = [];
        objects.forEach((object) => {
            const { oKey } = object;

            const searchParam = drawingManagerService.getDrawingOKey(oKey);

            if (searchParam == null) {
                params.push(null);
                return true;
            }

            const { unitId, subUnitId, drawingId, drawingType, anchorType, sheetTransform } = searchParam as ISheetDrawing;

            params.push({
                unitId,
                subUnitId,
                drawingId,
                anchorType,
                sheetTransform,
                drawingType,
            });
        });

        return params;
    }

    useEffect(() => {
        const onClearControlObserver = transformer.clearControl$.subscribe((changeSelf) => {
            if (changeSelf === true) {
                setAnchorShow(false);
            }
        });

        const onChangeStartObserver = transformer.changeStart$.subscribe((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects, drawingManagerService);

            if (params.length === 0) {
                setAnchorShow(false);
            } else if (params.length >= 1) {
                setAnchorShow(true);
                const anchorType = params[0]?.anchorType || SheetDrawingAnchorType.Position;
                setValue(anchorType);
            }
        });

        return () => {
            onChangeStartObserver.unsubscribe();
            onClearControlObserver.unsubscribe();
        };
    }, []);

    function handleChange(value: string | number | boolean) {
        setValue((value as SheetDrawingAnchorType));

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

        commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: focusDrawings[0].unitId,
            drawings: updateParams,
        });
    }

    return (
        <div
            className={clsx('univer-relative univer-mt-5 univer-w-full', borderTopClassName, {
                'univer-hidden': !anchorShow,
            })}
        >
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-w-full univer-text-left univer-text-gray-400">
                    <div>{localeService.t('drawing-anchor.title')}</div>
                </div>
            </div>
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1">
                    <RadioGroup value={value} onChange={handleChange} direction="vertical">
                        <Radio value={SheetDrawingAnchorType.Both}>{localeService.t('drawing-anchor.both')}</Radio>
                        <Radio value={SheetDrawingAnchorType.Position}>{localeService.t('drawing-anchor.position')}</Radio>
                        <Radio value={SheetDrawingAnchorType.None}>{localeService.t('drawing-anchor.none')}</Radio>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
};
