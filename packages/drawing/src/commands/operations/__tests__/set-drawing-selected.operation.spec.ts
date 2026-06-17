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

import type { IDrawingParam, IDrawingSearch } from '@univerjs/core';
import { DrawingTypeEnum, ICommandService, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DrawingManagerService } from '../../../services/drawing-manager-impl.service';
import { IDrawingManagerService } from '../../../services/drawing-manager.service';
import { SetDrawingSelectedOperation } from '../set-drawing-selected.operation';

const unitId = 'drawing-unit';
const subUnitId = 'drawing-subunit';

function createDrawing(drawingId: string): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
    };
}

function createSearch(drawingId: string): IDrawingSearch {
    return {
        unitId,
        subUnitId,
        drawingId,
    };
}

describe('SetDrawingSelectedOperation', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let drawingManagerService: IDrawingManagerService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetDrawingSelectedOperation);
        drawingManagerService = injector.get(IDrawingManagerService);
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    image1: createDrawing('image1'),
                    image2: createDrawing('image2'),
                },
                order: ['image1', 'image2'],
            },
        });
    });

    afterEach(() => {
        univer.dispose();
    });

    it('selects only drawings that exist in the drawing manager', async () => {
        const result = await commandService.executeCommand(SetDrawingSelectedOperation.id, [
            createSearch('image2'),
            createSearch('missing'),
        ]);

        expect(result).toBe(true);
        expect(drawingManagerService.getFocusDrawings()).toEqual([createDrawing('image2')]);
    });

    it('keeps the current drawing focus when selection params are missing', async () => {
        await commandService.executeCommand(SetDrawingSelectedOperation.id, [createSearch('image1')]);
        const result = await commandService.executeCommand(SetDrawingSelectedOperation.id);

        expect(result).toBe(false);
        expect(drawingManagerService.getFocusDrawings()).toEqual([createDrawing('image1')]);
    });
});
