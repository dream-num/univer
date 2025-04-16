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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import {
    DOC_RANGE_TYPE,
    ICommandService,
    Inject,
    Injector,
    IResourceManagerService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionRenderService, InsertCommand } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';

/**
 * @hideconstructor
 */
export class FDocument {
    readonly id: string;

    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
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
        const resources = this._resourceManagerService.getResourcesByType(this.id, UniverInstanceType.UNIVER_DOC);
        const snapshot = this._documentDataModel.getSnapshot() as IDocumentData;
        snapshot.resources = resources;
        return snapshot;
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
     * @param text - The text to be added to the end of this text region.
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

        const { segmentId } = activeRange;

        return this._commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: {
                dataStream: text,
            },
            range: activeRange,
            segmentId,
        });
    }

    /**
     * Sets the selection to a specified text range in the document.
     * @param startOffset - The starting offset of the selection in the document.
     * @param endOffset - The ending offset of the selection in the document.
     * @example
     * ```typescript
     * document.setSelection(10, 20);
     * ```
     */
    setSelection(startOffset: number, endOffset: number): void {
        // TODO: @jocs...
        const docSelectionRenderService = this._renderManagerService.getRenderById(this.getId())?.with(DocSelectionRenderService);
        docSelectionRenderService?.removeAllRanges();
        docSelectionRenderService?.addDocRanges(
            [
                {
                    startOffset,
                    endOffset,
                    rangeType: DOC_RANGE_TYPE.TEXT,
                },
            ],
            true
        );
    }
}
