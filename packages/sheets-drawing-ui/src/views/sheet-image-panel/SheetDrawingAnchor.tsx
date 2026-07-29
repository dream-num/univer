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

import type { LocaleKey } from '../../locale/types';
import { ICommandService, type IDrawingParam, LocaleService } from '@univerjs/core';
import { clsx, Radio, RadioGroup } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { type BaseObject, IRenderManagerService } from '@univerjs/engine-render';
import {
    getSheetDrawingPlacement,
    type ISheetDrawingPlacementInput,
    type ISheetDrawingPlacementTarget,
    ISheetDrawingService,
    isSheetDrawingPlacementTarget,
    SetSheetDrawingPlacementCommand,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export interface ISheetDrawingAnchorProps {
    drawings: IDrawingParam[];
}

const SheetDrawingAnchorContent = (props: ISheetDrawingAnchorProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const sheetDrawingService = useDependency(ISheetDrawingService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings } = props;

    const drawingParam = isSheetDrawingPlacementTarget(drawings[0]) ? drawings[0] : undefined;
    const renderObject = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId) : undefined;
    const scene = renderObject?.scene;
    const transformer = scene?.getTransformerByCreate();

    const [anchorShow, setAnchorShow] = useState(Boolean(drawingParam));

    const type = drawingParam
        ? getSheetDrawingPlacement(drawingParam).kind
        : SheetDrawingAnchorType.Position;
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
            const params = getUpdateParams(objects, drawingManagerService, sheetDrawingService);

            if (params.length === 0) {
                setAnchorShow(false);
            } else {
                setAnchorShow(true);
                setValue(getSheetDrawingPlacement(params[0]).kind);
            }
        });

        return () => {
            onChangeStartObserver.unsubscribe();
            onClearControlObserver.unsubscribe();
        };
    }, [drawingManagerService, sheetDrawingService, transformer]);

    if (!drawingParam || !transformer) {
        return null;
    }

    function handleChange(value: string | number | boolean) {
        const kind = getAnchorKind(value);
        if (!kind) {
            return;
        }

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (!focusDrawings.length || !focusDrawings.every(isSheetDrawingPlacementTarget)) {
            return;
        }

        const { unitId, subUnitId } = focusDrawings[0];
        const placementUpdates: Array<{ drawingId: string; placement: ISheetDrawingPlacementInput }> = [];
        for (const drawing of focusDrawings) {
            const transform = drawing.transform;
            if (!transform) {
                return;
            }
            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const placement: ISheetDrawingPlacementInput = kind === SheetDrawingAnchorType.None
                ? { kind: SheetDrawingAnchorType.None, left, top, width, height }
                : { kind, left, top, width, height };
            placementUpdates.push({ drawingId: drawing.drawingId, placement });
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

export const SheetDrawingAnchor = (props: ISheetDrawingAnchorProps) => (
    <SheetDrawingAnchorContent key={props.drawings[0]?.drawingId} {...props} />
);

function getUpdateParams(
    objects: Map<string, BaseObject>,
    drawingManagerService: IDrawingManagerService,
    sheetDrawingService: ISheetDrawingService
): ISheetDrawingPlacementTarget[] {
    const params: ISheetDrawingPlacementTarget[] = [];
    objects.forEach((object) => {
        const searchParam = drawingManagerService.getDrawingOKey(object.oKey);
        if (!searchParam) {
            return;
        }

        const drawing = sheetDrawingService.getDrawingByParam(searchParam);
        if (isSheetDrawingPlacementTarget(drawing)) {
            params.push(drawing);
        }
    });

    return params;
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
