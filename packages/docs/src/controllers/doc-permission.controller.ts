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

import type { DocumentDataModel, ICommandInfo, IExecutionOptions } from '@univerjs/core';
import type {
    IDeleteTextCommandParams,
    IInsertTextCommandParams,
    IUpdateTextCommandParams,
} from '../commands/commands/core-editing.command';
import type { ICreateHeaderFooterCommandParams } from '../commands/commands/create-header-footer.command';
import type { ISetSectionHeaderFooterLinkCommandParams } from '../commands/commands/set-section-header-footer-link.command';
import type { IUpdateDocumentParagraphStyleCommandParams } from '../commands/commands/update-document-paragraph-style.command';
import type {
    IDeleteDocumentSectionBreakCommandParams,
    IInsertDocumentColumnBreakCommandParams,
    IInsertDocumentSectionBreakCommandParams,
    IUpdateDocumentSectionCommandParams,
} from '../commands/commands/update-document-section.command';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import {
    CustomCommandExecutionError,
    DeleteDirection,
    Disposable,
    ICommandService,
    Inject,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    ObjectPermissionService,
    UniverInstanceType,
} from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { DeleteTextCommand, InsertTextCommand, UpdateTextCommand } from '../commands/commands/core-editing.command';
import { CreateHeaderFooterCommand } from '../commands/commands/create-header-footer.command';
import { SetDocumentPermissionCommand } from '../commands/commands/set-document-permission.command';
import { SetSectionHeaderFooterLinkCommand } from '../commands/commands/set-section-header-footer-link.command';
import { UpdateDocumentParagraphStyleCommand } from '../commands/commands/update-document-paragraph-style.command';
import {
    DeleteDocumentSectionBreakCommand,
    InsertDocumentColumnBreakCommand,
    InsertDocumentSectionBreakCommand,
    UpdateDocumentSectionCommand,
} from '../commands/commands/update-document-section.command';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { DocsRenameMutation } from '../commands/mutations/docs-rename.mutation';
import {
    canEditDocumentTargets,
    clearDocumentPermissionValuesForUnit,
    createDocumentPermissionPoint,
    DOCUMENT_UNIT_PERMISSION_ACTIONS,
    getDocumentEntityPermissionObjectId,
    getDocumentPermissionValue,
    getDocumentSectionPermissionObjectId,
} from '../services/permission/document-permission';
import {
    getDocumentDrawingSegmentId,
    getDocumentEditTargetObjectIds,
    getDocumentEditTargetObjectIdsFromActions,
    getDocumentEntityParentPermissionObjectIds,
    getDocumentSectionIdsAtOffset,
    getDocumentSectionPermissionObjectIdsByIds,
} from '../services/permission/document-permission-resolver';
import { getTopLevelSectionBreaks } from '../utils/sections';

const NON_EDIT_DOCUMENT_COMMAND_IDS = new Set([
    SetDocumentPermissionCommand.id,
    'doc.command.open-header-footer-panel',
    'doc.command.close-header-footer',
    'doc.command.select-all',
    'doc.command.set-zoom-ratio',
]);

const DERIVED_DOCUMENT_MUTATION_IDS = new Set([
    'docs-formula.mutation.set-last-values',
]);

export class DocPermissionController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .forEach((unit) => this._registerUnitPermissionPoints(unit.getUnitId()));
        this.disposeWithMe(this._univerInstanceService
            .getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .subscribe(({ unit }) => this._registerUnitPermissionPoints(unit.getUnitId())));
        this.disposeWithMe(this._commandService.beforeCommandExecuted((commandInfo, options) => {
            this._check(commandInfo, options);
        }));
        this.disposeWithMe(this._univerInstanceService
            .getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .subscribe((unit) => {
                this._injector.get(ObjectPermissionService).clearUnit(unit.getUnitId());
                clearDocumentPermissionValuesForUnit(
                    this._permissionService,
                    unit.getUnitId()
                );
            }));
    }

    private _registerUnitPermissionPoints(unitId: string): void {
        DOCUMENT_UNIT_PERMISSION_ACTIONS.forEach((action) => {
            const point = createDocumentPermissionPoint(unitId, unitId, action);
            if (!this._permissionService.getPermissionPoint(point.id)) {
                this._permissionService.addPermissionPoint(point);
            }
        });
        this._injector.get(ObjectPermissionService).initializeUnit({ unitId, objectId: unitId, objectType: UnitObject.Document });
    }

    private _check(commandInfo: Readonly<ICommandInfo>, options?: IExecutionOptions): void {
        if (options?.fromCollab || options?.fromChangeset) {
            return;
        }
        const unitAction = getDocumentUnitAction(commandInfo.id);
        const unitId = getUnitId(commandInfo, options) ?? (unitAction
            ? this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)?.getUnitId()
            : undefined);
        if (!unitId || this._univerInstanceService.getUnitType(unitId) !== UniverInstanceType.UNIVER_DOC) {
            return;
        }
        if (unitAction) {
            if (!getDocumentPermissionValue(this._permissionService, unitId, unitId, unitAction)) {
                throw new CustomCommandExecutionError(`Document ${UnitAction[unitAction]} permission denied.`);
            }
            return;
        }
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        if (!documentDataModel) {
            return;
        }
        const targetObjectIds = this._resolveTargetObjectIds(documentDataModel, commandInfo);
        if (targetObjectIds === null) {
            return;
        }
        if (!canEditDocumentTargets(this._permissionService, unitId, targetObjectIds)) {
            throw new CustomCommandExecutionError('Document edit permission denied.');
        }
    }

    private _resolveTargetObjectIds(
        documentDataModel: DocumentDataModel,
        commandInfo: Readonly<ICommandInfo>
    ): string[] | null {
        if (commandInfo.id === RichTextEditingMutation.id) {
            const params = commandInfo.params as IRichTextEditingMutationParams;
            return getDocumentEditTargetObjectIdsFromActions(
                documentDataModel,
                params.segmentId ?? '',
                params.actions
            );
        }
        if (commandInfo.id === DocsRenameMutation.id) {
            return [];
        }
        if (isDerivedDocumentMutation(commandInfo)) {
            return null;
        }
        const knownTargets = resolveTextTargets(documentDataModel, commandInfo) ??
            resolveSectionTargets(documentDataModel, commandInfo);
        if (knownTargets) {
            return knownTargets;
        }
        const entityTargets = resolveEntityTargets(documentDataModel, commandInfo);
        if (entityTargets.length) {
            return entityTargets;
        }
        return isDocumentEditCommand(commandInfo.id) || isDocumentDataMutation(commandInfo)
            ? []
            : null;
    }
}

function isDocumentEditCommand(id: string): boolean {
    if (NON_EDIT_DOCUMENT_COMMAND_IDS.has(id)) {
        return false;
    }
    return id.startsWith('doc.command.') ||
        id.startsWith('docs.command.') ||
        id.startsWith('doc.command-') ||
        id.startsWith('doc.table.');
}

function isDocumentDataMutation(commandInfo: Readonly<ICommandInfo>): boolean {
    const { id } = commandInfo;
    if (isDerivedDocumentMutation(commandInfo)) {
        return false;
    }
    return id.startsWith('doc.mutation.') ||
        id.startsWith('docs.mutation.') ||
        /^docs-[^.]+\.mutation\./.test(id);
}

function isDerivedDocumentMutation(commandInfo: Readonly<ICommandInfo>): boolean {
    const params = isRecord(commandInfo.params) ? commandInfo.params : undefined;
    return DERIVED_DOCUMENT_MUTATION_IDS.has(commandInfo.id) ||
        (commandInfo.id === 'doc.mutation.update-shape-data' &&
            !!params?.formulaLastValueGuard);
}

function resolveEntityTargets(
    documentDataModel: DocumentDataModel,
    commandInfo: Readonly<ICommandInfo>
): string[] {
    const params = commandInfo.params;
    if (!isRecord(params)) {
        return [];
    }
    const result = new Set<string>();
    const add = (segmentId: string, entityType: string, entityId: string): void => {
        result.add(getDocumentEntityPermissionObjectId(segmentId, entityType, entityId));
        getDocumentEntityParentPermissionObjectIds(documentDataModel, segmentId, entityType, entityId)
            .forEach((objectId) => result.add(objectId));
    };
    collectEntityReferences(params).forEach(({ entityType, entityId }) => {
        const explicitSegmentId = params.segmentId;
        const segmentId = typeof explicitSegmentId === 'string'
            ? explicitSegmentId
            : entityType === 'drawing' || entityType === 'custom-block'
                ? getDocumentDrawingSegmentId(documentDataModel, entityId)
                : '';
        add(segmentId, entityType, entityId);
    });
    return [...result];
}

function collectEntityReferences(value: unknown): Array<{ entityType: string; entityId: string }> {
    const result = new Map<string, { entityType: string; entityId: string }>();
    const typeByKey: Record<string, string[]> = {
        blockId: ['custom-block'],
        drawingId: ['drawing'],
        shapeId: ['drawing', 'custom-block'],
        tableId: ['table'],
        rangeId: ['custom-range'],
        columnGroupId: ['column-group'],
    };
    const visit = (candidate: unknown, key = ''): void => {
        if (typeof candidate === 'string') {
            typeByKey[key]?.forEach((entityType) => {
                result.set(`${entityType}\u001F${candidate}`, { entityType, entityId: candidate });
            });
            return;
        }
        if (Array.isArray(candidate)) {
            const singularKey = key.endsWith('Ids') ? `${key.slice(0, -3)}Id` : key;
            candidate.forEach((item) => visit(item, singularKey));
            return;
        }
        if (!isRecord(candidate)) {
            return;
        }
        Object.entries(candidate).forEach(([childKey, child]) => visit(child, childKey));
    };
    visit(value);
    return [...result.values()];
}

function getUnitId(commandInfo: Readonly<ICommandInfo>, options?: IExecutionOptions): string | undefined {
    const params = isRecord(commandInfo.params) ? commandInfo.params : undefined;
    return typeof params?.unitId === 'string'
        ? params.unitId
        : typeof options?.unitId === 'string'
            ? options.unitId
            : undefined;
}

function getDocumentUnitAction(commandId: string): UnitAction | undefined {
    if (commandId === 'doc.command.copy-current-paragraph' || commandId === 'docs-table.command.copy-selection') {
        return UnitAction.Copy;
    }
    if (commandId === 'docs.operation.print') {
        return UnitAction.Print;
    }
    if (commandId === 'docs-exchange-client.operation.export-doc') {
        return UnitAction.Export;
    }
    if (commandId === 'docs.operation.start-add-comment' ||
        commandId === 'docs.operation.add-drawing-comment' ||
        (commandId.startsWith('docs.command.') && commandId.includes('comment')) ||
        commandId.startsWith('thread-comment.command.') ||
        commandId.startsWith('thread-comment.mutation.')) {
        return UnitAction.Comment;
    }
    return undefined;
}

function resolveTextTargets(
    documentDataModel: DocumentDataModel,
    commandInfo: Readonly<ICommandInfo>
): string[] | null {
    const { id } = commandInfo;
    if (id === InsertTextCommand.id || id === UpdateTextCommand.id) {
        const params = commandInfo.params as IInsertTextCommandParams | IUpdateTextCommandParams;
        return getDocumentEditTargetObjectIds(documentDataModel, params.segmentId ?? '', params.range);
    }
    if (id === DeleteTextCommand.id) {
        const params = commandInfo.params as IDeleteTextCommandParams;
        const isDeleteLeft = params.direction === DeleteDirection.LEFT;
        return getDocumentEditTargetObjectIds(documentDataModel, params.segmentId ?? '', {
            startOffset: isDeleteLeft ? params.range.startOffset - (params.len ?? 1) : params.range.startOffset,
            endOffset: isDeleteLeft ? params.range.startOffset : params.range.startOffset + (params.len ?? 1),
        });
    }
    if (id === UpdateDocumentParagraphStyleCommand.id) {
        const params = commandInfo.params as IUpdateDocumentParagraphStyleCommandParams;
        return getDocumentEditTargetObjectIds(documentDataModel, params.segmentId ?? '', params);
    }
    return null;
}

function resolveSectionTargets(
    documentDataModel: DocumentDataModel,
    commandInfo: Readonly<ICommandInfo>
): string[] | null {
    const { id } = commandInfo;
    if (id === UpdateDocumentSectionCommand.id) {
        const params = commandInfo.params as IUpdateDocumentSectionCommandParams;
        return getDocumentSectionPermissionObjectIdsByIds(params.updates.map((update) => update.sectionId));
    }
    if (id === InsertDocumentSectionBreakCommand.id || id === InsertDocumentColumnBreakCommand.id) {
        const params = commandInfo.params as IInsertDocumentSectionBreakCommandParams | IInsertDocumentColumnBreakCommandParams;
        const body = documentDataModel.getBody();
        return body ? getDocumentSectionPermissionObjectIdsByIds(getDocumentSectionIdsAtOffset(body, params.offset)) : [];
    }
    if (id === DeleteDocumentSectionBreakCommand.id) {
        const params = commandInfo.params as IDeleteDocumentSectionBreakCommandParams;
        const body = documentDataModel.getBody();
        const sections = body ? getTopLevelSectionBreaks(body) : [];
        const index = sections.findIndex((section) => section.sectionId === params.sectionId);
        return getDocumentSectionPermissionObjectIdsByIds([
            params.sectionId,
            ...(index >= 0 && index + 1 < sections.length ? [sections[index + 1].sectionId] : []),
        ]);
    }
    if (id === SetSectionHeaderFooterLinkCommand.id) {
        const params = commandInfo.params as ISetSectionHeaderFooterLinkCommandParams;
        return [getDocumentSectionPermissionObjectId('', params.sectionId)];
    }
    if (id === CreateHeaderFooterCommand.id) {
        const params = commandInfo.params as ICreateHeaderFooterCommandParams;
        return params.sectionId ? [getDocumentSectionPermissionObjectId('', params.sectionId)] : [];
    }
    return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
