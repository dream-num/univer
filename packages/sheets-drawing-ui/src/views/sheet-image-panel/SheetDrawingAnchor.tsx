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
import type {
    ISheetDrawing,
    ISheetDrawingPlacementInput,
} from '@univerjs/sheets-drawing';
import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx, Radio, RadioGroup } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    SetSheetDrawingPlacementCommand,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { useDependency } from '@univerjs/ui';

import { useEffect, useState } from 'react';

export interface ISheetDrawingAnchorProps {
    drawings: IDrawingParam[];
}

export const SheetDrawingAnchor = (props: ISheetDrawingAnchorProps) => {
    function isSheetDrawing(drawing: Nullable<IDrawingParam>): drawing is ISheetDrawing {
        return Boolean(drawing && 'sheetTransform' in drawing && 'axisAlignSheetTransform' in drawing);
    }

    function getAnchorKind(value: string | number | boolean): SheetDrawingAnchorType | null {
        if (
            value === SheetDrawingAnchorType.Position ||
            value === SheetDrawingAnchorType.Both ||
            value === SheetDrawingAnchorType.None
        ) {
            return value;
        }
        return null;
    }

    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings } = props;

    const drawingParam = isSheetDrawing(drawings[0]) ? drawings[0] : undefined;
    const renderObject = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId) : undefined;
    const scene = renderObject?.scene;
    const transformer = scene?.getTransformerByCreate();

    const [anchorShow, setAnchorShow] = useState(true);

    const type = drawingParam?.anchorType ?? SheetDrawingAnchorType.None;
    const [value, setValue] = useState(type);

    useEffect(() => {
        if (!transformer) {
            return;
        }

        const onClearControlObserver = transformer.clearControl$.subscribe((changeSelf) => {
            if (changeSelf === true) {
                setAnchorShow(false);
            }
        });

        const onChangeStartObserver = transformer.changeStart$.subscribe((state) => {
            const { objects } = state;
            const params = Array.from(objects.values(), ({ oKey }) => drawingManagerService.getDrawingOKey(oKey));

            if (params.length === 0) {
                setAnchorShow(false);
            } else if (params.length >= 1) {
                setAnchorShow(true);
                const drawing = params[0] as Nullable<ISheetDrawing>;
                setValue(drawing?.anchorType ?? SheetDrawingAnchorType.None);
            }
        });

        return () => {
            onChangeStartObserver.unsubscribe();
            onClearControlObserver.unsubscribe();
        };
    }, [drawingManagerService, transformer]);

    if (!drawingParam || !transformer) {
        return null;
    }

    function handleChange(value: string | number | boolean) {
        const kind = getAnchorKind(value);
        if (!kind) {
            return;
        }

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (!focusDrawings.length || !focusDrawings.every(isSheetDrawing)) {
            return;
        }

        const { unitId, subUnitId } = focusDrawings[0];
        const placementUpdates: Array<{ drawingId: string; placement: ISheetDrawingPlacementInput }> = [];
        for (const drawing of focusDrawings) {
            const { transform } = drawing;
            const { left, top, width, height } = transform ?? {};
            if (
                typeof left !== 'number' ||
                typeof top !== 'number' ||
                typeof width !== 'number' ||
                typeof height !== 'number' ||
                !Number.isFinite(left) ||
                !Number.isFinite(top) ||
                !Number.isFinite(width) ||
                !Number.isFinite(height)
            ) {
                return;
            }
            placementUpdates.push({
                drawingId: drawing.drawingId,
                placement: {
                    kind,
                    bounds: {
                        left,
                        top,
                        width,
                        height,
                    },
                },
            });
        }

        const changed = commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId,
            subUnitId,
            drawings: placementUpdates,
        });
        if (changed) {
            setValue(kind);
        }
    }

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': !anchorShow,
            })}
        >
            <header
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.title')}</div>
            </header>

            <div>
                <RadioGroup value={value} onChange={handleChange} direction="vertical">
                    <Radio value={SheetDrawingAnchorType.Both}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.both')}</Radio>
                    <Radio value={SheetDrawingAnchorType.Position}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.position')}</Radio>
                    <Radio value={SheetDrawingAnchorType.None}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.none')}</Radio>
                </RadioGroup>
            </div>
        </div>
    );
};
