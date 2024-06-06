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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { InsertCommand } from '@univerjs/docs';

export class FDocument {
    readonly id: string;

    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        this.id = this._documentDataModel.getUnitId();
    }

    getId(): string {
        return this._documentDataModel.getUnitId();
    }

    getName(): string {
        return this.getSnapshot().title || '';
    }

    getSnapshot(): IDocumentData {
        return this._documentDataModel.getSnapshot() as IDocumentData;
    }

    undo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(UndoCommand.id);
    }

    redo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(RedoCommand.id);
    }

    /**
     * Adds the specified text to the end of this text region.
     * @param text
     */
    appendText(text: string): Promise<boolean> {
        const unitId = this.id;

        const { body } = this.getSnapshot();

        if (!body) {
            throw new Error('The document body is empty');
        }

        const lastPosition = body.dataStream.length - 2;

        const activeRange = {
            startOffset: lastPosition,
            endOffset: lastPosition,
            collapsed: true,
            segmentId: '',
        };

        const { startOffset, segmentId } = activeRange;

        const len = text.length;

        const textRanges = [
            {
                startOffset: startOffset + len,
                endOffset: startOffset + len,
            },
        ];

        return this._commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: {
                dataStream: text,
            },
            range: activeRange,
            textRanges,
            segmentId,
        });
    }
}
