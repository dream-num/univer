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

import type { DocumentDataModel } from '@univerjs/core';
import type { IAddDocCommentComment } from '../commands/commands/add-doc-comment.command';
import type { IDeleteDocCommentComment } from '../commands/commands/delete-doc-comment.command';
import { ICommandService, Injector, IPermissionService, isInternalEditorID, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DEFAULT_DOC_SUBUNIT_ID } from '@univerjs/docs-thread-comment';
import { deserializeThreadCommentAnchor, serializeThreadCommentAnchor, ThreadCommentAnchorKind, ThreadCommentModel } from '@univerjs/thread-comment';
import { ThreadCommentDraftService, ThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounceTime, filter, map, merge, Observable } from 'rxjs';
import { AddDocCommentComment } from '../commands/commands/add-doc-comment.command';
import { DeleteDocCommentComment } from '../commands/commands/delete-doc-comment.command';
import { StartAddCommentOperation } from '../commands/operations/show-comment-panel.operation';
import { shouldDisableAddComment } from '../menu/menu';
import { DocThreadCommentService } from '../services/doc-thread-comment.service';

export function getDocCommentPanelSubUnitId(draft: { unitId: string; subUnitId: string } | null, unitId: string | undefined): string {
    return draft && draft.unitId === unitId ? draft.subUnitId : DEFAULT_DOC_SUBUNIT_ID;
}

export const DocThreadCommentPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const injector = useDependency(Injector);
    const doc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(filter((doc) => !!doc && !isInternalEditorID(doc.getUnitId()))), [univerInstanceService]);
    const doc = useObservable(doc$);
    const draftService = useDependency(ThreadCommentDraftService);
    const drawingDraft = useObservable(draftService.draft$, draftService.draft);
    const subUnitId$ = useMemo(
        () => new Observable<string>((sub) => sub.next(getDocCommentPanelSubUnitId(drawingDraft, doc?.getUnitId()))),
        [doc, drawingDraft]
    );
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const selectionChange$ = useMemo(
        () => docSelectionManagerService.textSelection$.pipe(debounceTime(16)),
        [docSelectionManagerService.textSelection$]
    );
    const permissionService = useDependency(IPermissionService);
    const disableAddChange$ = useMemo(
        () => merge(selectionChange$, permissionService.permissionPointUpdate$),
        [permissionService.permissionPointUpdate$, selectionChange$]
    );
    const disableAdd = useObservable(
        () => disableAddChange$.pipe(map(() => shouldDisableAddComment(injector))),
        shouldDisableAddComment(injector),
        false,
        [disableAddChange$, injector]
    );
    const commandService = useDependency(ICommandService);
    const threadCommentModel = useDependency(ThreadCommentModel);
    useObservable(threadCommentModel.commentUpdate$);
    const docCommentService = useDependency(DocThreadCommentService);
    const textTempComment = useObservable(docCommentService.addingComment$);
    const userManagerService = useDependency(UserManagerService);
    const drawingTempComment = drawingDraft?.anchor.kind === ThreadCommentAnchorKind.DOC_DRAWING && drawingDraft.unitId === doc?.getUnitId()
        ? {
            id: '',
            threadId: '',
            unitId: drawingDraft.unitId,
            subUnitId: drawingDraft.subUnitId,
            ref: serializeThreadCommentAnchor(drawingDraft.anchor),
            dT: '',
            personId: userManagerService.getCurrentUser().userID,
            text: { dataStream: '\r\n' },
        }
        : null;
    const tempComment = drawingTempComment ?? textTempComment;
    const drawingIds = new Set(Object.keys(doc?.getSnapshot().drawings ?? {}));
    const isDrawingComment = (comment: { ref: string }) => {
        const anchor = deserializeThreadCommentAnchor(comment.ref);
        return anchor?.kind === ThreadCommentAnchorKind.DOC_DRAWING
            || (comment.ref.startsWith('#') && drawingIds.has(comment.ref.slice(1)));
    };
    const drawingCommentIds = doc
        ? threadCommentModel.getUnit(doc.getUnitId())
            .filter((thread) => isDrawingComment(thread.root))
            .map((thread) => thread.root.id)
        : [];
    const getCommentIds = useCallback(() => {
        const ids = new Set<string>();
        return doc?.getCustomDecorations()?.map((range) => range.id).filter((id) => {
            const hasRepeat = ids.has(id);
            ids.add(id);
            return !hasRepeat;
        }) ?? [];
    }, [doc]);
    const [commentIds, setCommentIds] = useState(getCommentIds);
    const [previousDoc, setPreviousDoc] = useState(doc);

    if (doc !== previousDoc) {
        setPreviousDoc(doc);
        setCommentIds(getCommentIds());
    }

    useEffect(() => {
        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                setCommentIds(getCommentIds());
            }
        });
        return () => {
            dispose.dispose();
        };
    }, [commandService, getCommentIds]);

    if (!doc) {
        return null;
    }

    const unitId = doc.getUnitId();

    return (
        <ThreadCommentPanel
            unitId={unitId}
            subUnitId$={subUnitId$}
            type={UniverInstanceType.UNIVER_DOC}
            onAdd={() => {
                commandService.executeCommand(StartAddCommentOperation.id);
            }}
            getSubUnitName={() => ''}
            disableAdd={disableAdd}
            tempComment={tempComment}
            onAddComment={async (comment) => {
                if (drawingTempComment && !comment.parentId) {
                    return true;
                }
                // attach an comment to an custom-range
                if (!comment.parentId) {
                    const params: IAddDocCommentComment = {
                        unitId,
                        range: textTempComment!,
                        comment,
                    };
                    const success = await commandService.executeCommand(AddDocCommentComment.id, params);
                    if (!success) {
                        throw new Error('Failed to add document comment.');
                    }
                    docCommentService.endAdd();
                    return false;
                }

                return true;
            }}
            onAfterDeleteComment={async (comment) => {
                if (!comment.parentId) {
                    if (isDrawingComment(comment)) {
                        return;
                    }
                    const params: IDeleteDocCommentComment = {
                        unitId,
                        commentId: comment.id,
                    };
                    await commandService.executeCommand(DeleteDocCommentComment.id, params);
                }
            }}
            showComments={[
                ...commentIds,
                ...drawingCommentIds,
            ]}
            onTempCommentClose={() => draftService.cancel()}
            formatRef={(comment) => {
                const anchor = deserializeThreadCommentAnchor(comment.ref);
                return anchor?.kind === ThreadCommentAnchorKind.DOC_DRAWING ? `#${anchor.elementId}` : comment.ref;
            }}
        />
    );
};
