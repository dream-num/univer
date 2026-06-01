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
    IResourceLoaderService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { DocSelectionRenderService, InsertCommand } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';

export interface IDocumentInsertTextFacadeOptions {
    startOffset?: number;
    endOffset?: number;
    segmentId?: string;
    cursorOffset?: number;
}

/**
 * @hideconstructor
 */
export class FDocument {
    readonly id: string;

    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceLoaderService) protected readonly _resourceLoaderService: IResourceLoaderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        this.id = this._documentDataModel.getUnitId();
    }

    /**
     * Get the document data model of the document.
     * @returns {DocumentDataModel} The document data model.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const documentDataModel = fDocument.getDocumentDataModel();
     * console.log(documentDataModel);
     * ```
     */
    getDocumentDataModel(): DocumentDataModel {
        return this._documentDataModel;
    }

    /**
     * Get the document id.
     * @returns {string} The document id.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const unitId = fDocument.getId();
     * console.log(unitId);
     * ```
     */
    getId(): string {
        return this.id;
    }

    /**
     * Get the document name.
     * @returns {string} The document name.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const name = fDocument.getName();
     * console.log(name);
     * ```
     */
    getName(): string {
        return this._documentDataModel.getTitle() || '';
    }

    /**
     * Save the document snapshot data, including the document content and resource data, etc.
     * @returns {IDocumentData} The document snapshot data.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const snapshot = fDocument.save();
     * console.log(snapshot);
     * ```
     */
    save(): IDocumentData {
        const snapshot = this._resourceLoaderService.saveUnit<IDocumentData>(this._documentDataModel.getUnitId())!;
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
        const { body } = this.save();

        if (!body) {
            throw new Error('The document body is empty');
        }

        const lastPosition = body.dataStream.length - 2;

        return this.insertText(text, {
            startOffset: lastPosition,
            endOffset: lastPosition,
            segmentId: '',
        });
    }

    /**
     * Inserts text at the provided document range. Defaults to appending before the final section break.
     * @param text - The text to insert.
     * @param options - Optional target range, segment id, and cursor offset.
     */
    insertText(text: string, options: IDocumentInsertTextFacadeOptions = {}): Promise<boolean> {
        const unitId = this.id;
        const { body } = this.save();

        if (!body) {
            throw new Error('The document body is empty');
        }

        const startOffset = options.startOffset ?? Math.max(0, body.dataStream.length - 2);
        const endOffset = options.endOffset ?? startOffset;
        const segmentId = options.segmentId ?? '';
        const activeRange = {
            startOffset,
            endOffset,
            collapsed: startOffset === endOffset,
            segmentId,
        };

        return this._commandService.executeCommand(InsertCommand.id, {
            unitId,
            body: {
                dataStream: text,
            },
            range: activeRange,
            segmentId,
            ...(options.cursorOffset == null ? {} : { cursorOffset: options.cursorOffset }),
        });
    }

    /**
     * Inserts one or more plain-text paragraphs at the provided document range.
     * @param text - Paragraph text. Newlines are normalized to document paragraph separators.
     * @param options - Optional target range, segment id, and cursor offset.
     */
    insertParagraph(text = '', options: IDocumentInsertTextFacadeOptions = {}): Promise<boolean> {
        const dataStream = `${text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').join('\r\n')}\r\n`;

        return this.insertText(dataStream, {
            ...options,
            cursorOffset: options.cursorOffset ?? dataStream.length,
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
