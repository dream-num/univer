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

import type { IDrawingParam } from '@univerjs/core';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { LocaleKey } from '../../locale/types';
import { DrawingTypeEnum, ICommandService, LocaleService } from '@univerjs/core';
import { normalizeImageOpacity } from '@univerjs/drawing';
import { ISheetDrawingService, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { PreviewSheetImageOpacityOperation } from '../../commands/operations/preview-sheet-image-opacity.operation';
import { isSheetDrawing } from './sheet-drawing-panel.util';
import { SheetImageTransparencySlider } from './SheetImageTransparencySlider';

const IMAGE_TRANSPARENCY_PRESETS = [0, 15, 30, 50, 65, 80];

export interface ISheetImageTransparencyProps {
    drawings: IDrawingParam[];
}

export const SheetImageTransparency = ({ drawings }: ISheetImageTransparencyProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const sheetDrawingService = useDependency(ISheetDrawingService);
    const drawingParam = isSheetDrawing(drawings[0]) ? drawings[0] : undefined;
    const currentDrawing = drawingParam
        ? sheetDrawingService.getDrawingByParam(drawingParam) ?? drawingParam
        : undefined;
    const image = currentDrawing?.drawingType === DrawingTypeEnum.DRAWING_IMAGE
        ? currentDrawing as ISheetImage
        : undefined;
    const modelOpacity = normalizeImageOpacity(image?.opacity);
    const modelTransparency = Math.round((1 - modelOpacity) * 100);
    const [previewState, setPreviewState] = useState<{
        unitId: string;
        subUnitId: string;
        drawingId: string;
        transparency: number;
    } | null>(null);
    const previewPendingRef = useRef(false);
    const [, setModelRevision] = useState(0);
    const transparency = image &&
        previewState?.unitId === image.unitId &&
        previewState.subUnitId === image.subUnitId &&
        previewState.drawingId === image.drawingId
        ? previewState.transparency
        : modelTransparency;

    useEffect(() => {
        if (!drawingParam) {
            return;
        }

        const subscription = sheetDrawingService.update$.subscribe((updatedDrawings) => {
            const drawingUpdated = updatedDrawings.some((updatedDrawing) =>
                updatedDrawing.unitId === drawingParam.unitId &&
                updatedDrawing.subUnitId === drawingParam.subUnitId &&
                updatedDrawing.drawingId === drawingParam.drawingId
            );
            if (drawingUpdated) {
                setModelRevision((revision) => revision + 1);
            }
        });

        return () => subscription.unsubscribe();
    }, [drawingParam, sheetDrawingService]);

    useEffect(() => {
        previewPendingRef.current = false;
        return () => {
            if (!previewPendingRef.current || !image) {
                return;
            }

            commandService.syncExecuteCommand(PreviewSheetImageOpacityOperation.id, {
                unitId: image.unitId,
                subUnitId: image.subUnitId,
                drawingId: image.drawingId,
                opacity: modelOpacity,
            });
        };
    }, [commandService, image, modelOpacity, modelTransparency]);

    if (!image) {
        return null;
    }

    const title = localeService.t<LocaleKey>('sheets-drawing-ui.image-transparency.title');
    const { unitId, subUnitId, drawingId } = image;

    function previewTransparency(nextTransparency: number) {
        const normalizedTransparency = normalizeTransparency(nextTransparency);
        const opacity = transparencyToOpacity(normalizedTransparency);
        previewPendingRef.current = true;
        setPreviewState({ unitId, subUnitId, drawingId, transparency: normalizedTransparency });
        commandService.syncExecuteCommand(PreviewSheetImageOpacityOperation.id, {
            unitId,
            subUnitId,
            drawingId,
            opacity,
        });
    }

    function commitTransparency(nextTransparency: number) {
        const normalizedTransparency = normalizeTransparency(nextTransparency);
        const opacity = transparencyToOpacity(normalizedTransparency);
        previewPendingRef.current = false;
        setPreviewState(null);
        if (opacity === modelOpacity) {
            return;
        }

        const changed = commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
            unitId,
            drawings: [{
                unitId,
                subUnitId,
                drawingId,
                opacity,
            }],
        });
        if (!changed) {
            commandService.syncExecuteCommand(PreviewSheetImageOpacityOperation.id, {
                unitId,
                subUnitId,
                drawingId,
                opacity: modelOpacity,
            });
        }
    }

    return (
        <section className="univer-grid univer-gap-2 univer-py-2 univer-text-gray-400">
            <header
                className="
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                "
            >
                {title}
            </header>
            <SheetImageTransparencySlider
                value={transparency}
                shortcuts={IMAGE_TRANSPARENCY_PRESETS}
                ariaLabel={title}
                onChange={previewTransparency}
                onChangeComplete={commitTransparency}
            />
        </section>
    );
};

function normalizeTransparency(transparency: number): number {
    if (!Number.isFinite(transparency)) {
        return 0;
    }

    return Math.min(Math.max(Math.round(transparency), 0), 100);
}

function transparencyToOpacity(transparency: number): number {
    return (100 - transparency) / 100;
}
