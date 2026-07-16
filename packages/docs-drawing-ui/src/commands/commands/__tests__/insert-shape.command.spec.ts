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

import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { InsertDocDrawingCommand } from '@univerjs/docs-drawing';
import { describe, expect, it, vi } from 'vitest';
import { InsertDocEllipseShapeCommand, InsertDocRectangleShapeCommand } from '../insert-shape.command';

function createAccessor() {
    const executeCommand = vi.fn(async () => true);
    const getCurrentUnitOfType = vi.fn((type: UniverInstanceType) => {
        if (type !== UniverInstanceType.UNIVER_DOC) {
            return null;
        }

        return {
            getUnitId: () => 'test-doc',
        };
    });

    return {
        executeCommand,
        accessor: {
            get: (token: unknown) => {
                if (token === ICommandService) {
                    return {
                        executeCommand,
                    };
                }

                if (token === IUniverInstanceService) {
                    return {
                        getCurrentUnitOfType,
                    };
                }

                throw new Error(`Unexpected token: ${String(token)}`);
            },
        },
    };
}

describe('insert shape commands', () => {
    it('inserts a rectangle shape through the drawing insertion command', async () => {
        const { accessor, executeCommand } = createAccessor();

        await InsertDocRectangleShapeCommand.handler(accessor as never);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
            InsertDocDrawingCommand.id,
            expect.objectContaining({
                unitId: 'test-doc',
                drawings: [
                    expect.objectContaining({
                        source: expect.stringContaining('data:image/svg+xml'),
                    }),
                ],
            })
        );
    });

    it('inserts an ellipse shape through the drawing insertion command', async () => {
        const { accessor, executeCommand } = createAccessor();

        await InsertDocEllipseShapeCommand.handler(accessor as never);

        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledWith(
            InsertDocDrawingCommand.id,
            expect.objectContaining({
                unitId: 'test-doc',
                drawings: [
                    expect.objectContaining({
                        source: expect.stringContaining('data:image/svg+xml'),
                    }),
                ],
            })
        );
    });
});
