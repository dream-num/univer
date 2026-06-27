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
    ICommandService,
    Inject,
    Injector,
    IResourceLoaderService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { FDocumentBody } from './f-document-body';

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

    /**
     * Get the document body facade.
     *
     * The returned body facade provides synchronous Google Docs-like element APIs
     * for reading and editing top-level document body elements. Paragraph elements
     * use their persisted `paragraphId` values. Persisted elements, such as tables
     * and custom blocks, use their existing ids.
     *
     * @returns {FDocumentBody} The document body API instance.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * console.log(fDocumentBody.getBody());
     *
     * const element = fDocumentBody.getElement(0);
     * if (element.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   paragraph.appendText(' updated');
     *   console.log(paragraph.getText());
     * }
     * ```
     */
    getBody(): FDocumentBody {
        return this._injector.createInstance(FDocumentBody, this._documentDataModel, this._injector);
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
        return this._resourceLoaderService.saveUnit<IDocumentData>(this._documentDataModel.getUnitId())!;
    }

    /**
     * Undo the last operation in the document.
     * @returns {boolean} `true` if the undo operation was successful, or `false` if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const success = fDocument.undo();
     * console.log(success);
     * ```
     */
    undo(): boolean {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.syncExecuteCommand(UndoCommand.id);
    }

    /**
     * Redo the last undone operation in the document.
     * @returns {boolean} `true` if the redo operation was successful, or `false` if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const success = fDocument.redo();
     * console.log(success);
     * ```
     */
    redo(): boolean {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.syncExecuteCommand(RedoCommand.id);
    }
}
