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

/* eslint-disable import/consistent-type-specifier-style -- Keep type and value imports from one package in one declaration. */
import type { LocaleKey } from '../../locale/types';
import { ICommandService, type IDrawingParam, LocaleService, type Nullable } from '@univerjs/core';
import { clsx, Radio, RadioGroup } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { type BaseObject, IRenderManagerService, type SpreadsheetSkeleton } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import {
    getSheetDrawingPlacement,
    type ISheetDrawing,
    type ISheetDrawingPlacement,
    SetSheetDrawingPlacementCommand,
    SheetDrawingAnchorKind,
    transformToDrawingPosition,
} from '@univerjs/sheets-drawing';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export interface ISheetDrawingAnchorProps {
    drawings: IDrawingParam[];
}

export const SheetDrawingAnchor = (props: ISheetDrawingAnchorProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const sheetSkeletonService = useDependency(SheetSkeletonService);

    const { drawings } = props;

    const drawingParam = isSheetDrawing(drawings[0]) ? drawings[0] : undefined;
    const renderObject = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId) : undefined;
    const scene = renderObject?.scene;
    const transformer = scene?.getTransformerByCreate();

    const [anchorShow, setAnchorShow] = useState(true);

    const type = drawingParam
        ? getSheetDrawingPlacement(drawingParam).kind
        : SheetDrawingAnchorKind.OneCell;
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

            if (!isSheetDrawing(searchParam)) {
                params.push(null);
                return true;
            }

            const { unitId, subUnitId, drawingId, drawingType, anchorType, sheetTransform, axisAlignSheetTransform } = searchParam;

            params.push({
                unitId,
                subUnitId,
                drawingId,
                anchorType,
                sheetTransform,
                drawingType,
                axisAlignSheetTransform,
            });
        });

        return params;
    }

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
            const params = getUpdateParams(objects, drawingManagerService);

            if (params.length === 0) {
                setAnchorShow(false);
            } else if (params.length >= 1) {
                setAnchorShow(true);
                const drawing = params[0];
                setValue(drawing
                    ? getSheetDrawingPlacement(drawing).kind
                    : SheetDrawingAnchorKind.OneCell);
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
        const skeleton = kind === SheetDrawingAnchorKind.Absolute
            ? undefined
            : sheetSkeletonService.ensureSkeleton(unitId, subUnitId);
        if (kind !== SheetDrawingAnchorKind.Absolute && !skeleton) {
            return;
        }

        const placementUpdates: Array<{ drawingId: string; placement: ISheetDrawingPlacement }> = [];
        for (const drawing of focusDrawings) {
            const placement = createPlacement(drawing, kind, skeleton);
            if (!placement) {
                return;
            }
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
                    <Radio value={SheetDrawingAnchorKind.TwoCell}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.both')}</Radio>
                    <Radio value={SheetDrawingAnchorKind.OneCell}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.position')}</Radio>
                    <Radio value={SheetDrawingAnchorKind.Absolute}>{localeService.t<LocaleKey>('sheets-drawing-ui.drawing-anchor.none')}</Radio>
                </RadioGroup>
            </div>
        </div>
    );
};

function isSheetDrawing(drawing: IDrawingParam | undefined): drawing is ISheetDrawing {
    return Boolean(drawing && 'sheetTransform' in drawing && 'axisAlignSheetTransform' in drawing);
}

function getAnchorKind(value: string | number | boolean): SheetDrawingAnchorKind | null {
    if (
        value === SheetDrawingAnchorKind.OneCell ||
        value === SheetDrawingAnchorKind.TwoCell ||
        value === SheetDrawingAnchorKind.Absolute
    ) {
        return value;
    }
    return null;
}

function createPlacement(
    drawing: ISheetDrawing,
    kind: SheetDrawingAnchorKind,
    skeleton?: SpreadsheetSkeleton
): ISheetDrawingPlacement | null {
    const transform = drawing.transform;
    if (!transform) {
        return null;
    }

    const { left = 0, top = 0, width = 0, height = 0 } = transform;
    if (kind === SheetDrawingAnchorKind.Absolute) {
        return { kind, left, top, width, height };
    }
    if (!skeleton) {
        return null;
    }

    const { from, to } = transformToDrawingPosition(transform, skeleton);
    return kind === SheetDrawingAnchorKind.OneCell
        ? { kind, from, width, height }
        : { kind, from, to };
}
