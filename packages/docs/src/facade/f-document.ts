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
import type { IInsertTextCommandParams } from '@univerjs/docs';
import {
    ICommandService,
    Inject,
    Injector,
    IResourceLoaderService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { InsertTextCommand } from '@univerjs/docs';

export interface IDocumentInsertTextFacadeOptions {
    startOffset?: number;
    endOffset?: number;
    segmentId?: string;
    cursorOffset?: number;
}

/**
 * Facade API object bounded to a document. It provides a set of methods to interact with the document.
 * @hideconstructor
 */
export class FDocument extends FBaseInitialable {
    readonly id: string;

    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceLoaderService) protected readonly _resourceLoaderService: IResourceLoaderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super(_injector);

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

    override dispose(): void {
        super.dispose();
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

    /**
     * Undo the last operation in the document.
     * @returns {Promise<boolean>} A promise that resolves to true if the undo operation was successful, or false if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * await fDocument.undo();
     * ```
     */
    undo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(UndoCommand.id);
    }

    /**
     * Redo the last undone operation in the document.
     * @returns {Promise<boolean>} A promise that resolves to true if the redo operation was successful, or false if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * await fDocument.redo();
     * ```
     */
    redo(): Promise<boolean> {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.executeCommand(RedoCommand.id);
    }

    /**
     * Adds the specified text to the end of this text region.
     * @param {string} text - The text to be added to the end of this text region.
     * @return {Promise<boolean>} A promise that resolves to true if the text was successfully appended, or false if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * await fDocument.appendText('Hello, world!');
     * ```
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
     * @param {string} text - The text to insert.
     * @param {IDocumentInsertTextFacadeOptions} options - Optional target range, segment id, and cursor offset.
     * @returns {Promise<boolean>} A promise that resolves to true if the text was successfully inserted, or false if it failed.
     * @example
     *
     * // Insert text at a specific range in the document body
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * await fDocument.insertText('Hello, world!', {
     *   startOffset: 5,
     *   endOffset: 5,
     *   segmentId: '',
     *   cursorOffset: 13,
     * });
     * ```
     *
     * // Insert text at the beginning of a header or footer segment
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const snapshot = fDocument.save();
     * const { headers, footers } = snapshot;
     *
     * if (headers) {
     *   for (const headerId in headers) {
     *     if (headerId === 'target-header-id') {
     *       await fDocument.insertText('Hello, header!', {
     *         startOffset: 0,
     *         endOffset: 0,
     *         segmentId: headerId,
     *       });
     *     }
     *   }
     * }
     *
     * if (footers) {
     *   for (const footerId in footers) {
     *     if (footerId === 'target-footer-id') {
     *       await fDocument.insertText('Hello, footer!', {
     *         startOffset: 0,
     *         endOffset: 0,
     *         segmentId: footerId,
     *       });
     *     }
     *   }
     * }
     * ```
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

        return this._commandService.executeCommand<IInsertTextCommandParams>(InsertTextCommand.id, {
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
     * @param {string} text - The paragraph text to insert. Newlines are normalized to document paragraph separators.
     * @param {IDocumentInsertTextFacadeOptions} options - Optional target range, segment id, and cursor offset.
     * @returns {Promise<boolean>} A promise that resolves to true if the paragraphs were successfully inserted, or false if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * await fDocument.insertParagraph('Hello, world! This is a new paragraph.', {
     *   startOffset: 5,
     *   endOffset: 5,
     * });
     * ```
     */
    insertParagraph(text = '', options: IDocumentInsertTextFacadeOptions = {}): Promise<boolean> {
        const dataStream = `${text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').join('\r\n')}\r\n`;

        return this.insertText(dataStream, {
            ...options,
            cursorOffset: options.cursorOffset ?? dataStream.length,
        });
    }
}
