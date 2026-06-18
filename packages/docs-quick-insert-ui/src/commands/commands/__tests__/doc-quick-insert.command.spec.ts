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

import { ICommandService, Injector, RANGE_DIRECTION } from '@univerjs/core';
import { CutContentCommand } from '@univerjs/docs-ui';
import { describe, expect, it, vi } from 'vitest';
import { DeleteSearchKeyCommand } from '../doc-quick-insert.command';

class RecordingCommandService {
    readonly syncExecuteCommand = vi.fn(() => true);
}

function createAccessor(bindings: Array<[unknown, unknown]>) {
    const injector = new Injector();

    bindings.forEach(([token, useClass]) => {
        injector.add([token as never, { useClass: useClass as never }]);
    });

    return injector;
}

describe('DeleteSearchKeyCommand', () => {
    it('cuts the slash-triggered keyword range from the document', () => {
        const accessor = createAccessor([
            [ICommandService, RecordingCommandService],
        ]);
        const commandService = accessor.get(ICommandService) as unknown as RecordingCommandService;

        const result = DeleteSearchKeyCommand.handler(accessor, { start: 4, end: 9 });

        expect(result).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(CutContentCommand.id, {
            segmentId: '',
            textRanges: [{
                startOffset: 4,
                endOffset: 4,
                collapsed: true,
            }],
            selections: [{
                startOffset: 4,
                endOffset: 9,
                collapsed: false,
                direction: RANGE_DIRECTION.FORWARD,
            }],
        });
    });
});
