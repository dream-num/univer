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
import type { IAddDocCommentComment } from '../../commands/commands/add-doc-comment.command';
import type { IDeleteDocCommentComment } from '../../commands/commands/delete-doc-comment.command';
import { ICommandService, Injector, isInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { ThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { debounceTime, filter, Observable } from 'rxjs';
import { AddDocCommentComment } from '../../commands/commands/add-doc-comment.command';
import { DeleteDocCommentComment } from '../../commands/commands/delete-doc-comment.command';
import { StartAddCommentOperation } from '../../commands/operations/show-comment-panel.operation';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import { shouldDisableAddComment } from '../../controllers/menu';
import { DocThreadCommentService } from '../../services/doc-thread-comment.service';

export const DocThreadCommentPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const injector = useDependency(Injector);
    const doc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(filter((doc) => !!doc && !isInternalEditorID(doc.getUnitId()))), [univerInstanceService]);
    const doc = useObservable(doc$);
    const subUnitId$ = useMemo(() => new Observable<string>((sub) => sub.next(DEFAULT_DOC_SUBUNIT_ID)), []);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const selectionChange$ = useMemo(
        () => docSelectionManagerService.textSelection$.pipe(debounceTime(16)),
        [docSelectionManagerService.textSelection$]
    );
    useObservable(selectionChange$);
    const commandService = useDependency(ICommandService);
    const docCommentService = useDependency(DocThreadCommentService);
    const tempComment = useObservable(docCommentService.addingComment$);
    const [commentIds, setCommentIds] = useState<string[]>([]);

    useEffect(() => {
        const set = new Set<string>();
        const customRanges = doc?.getCustomDecorations();
        setCommentIds(customRanges?.map((r) => r.id).filter((i) => {
            const hasRepeat = set.has(i);
            set.add(i);
            return !hasRepeat;
        }) ?? []);

        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const set = new Set<string>();
                const customRanges = doc?.getCustomDecorations();
                setCommentIds(customRanges?.map((r) => r.id).filter((i) => {
                    const hasRepeat = set.has(i);
                    set.add(i);
                    return !hasRepeat;
                }) ?? []);
            }
        });
        return () => {
            dispose.dispose();
        };
    }, [commandService, doc]);

    if (!doc) {
        return null;
    }

    const isInValidSelection = shouldDisableAddComment(injector);

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
            disableAdd={isInValidSelection}
            tempComment={tempComment}
            onAddComment={(comment) => {
                // attach an comment to an custom-range
                if (!comment.parentId) {
                    const params: IAddDocCommentComment = {
                        unitId,
                        range: tempComment!,
                        comment,
                    };
                    commandService.executeCommand(AddDocCommentComment.id, params);
                    docCommentService.endAdd();
                    return false;
                }

                return true;
            }}
            onDeleteComment={(comment) => {
                if (!comment.parentId) {
                    const params: IDeleteDocCommentComment = {
                        unitId,
                        commentId: comment.id,
                    };
                    commandService.executeCommand(DeleteDocCommentComment.id, params);
                    return false;
                }
                return true;
            }}
            showComments={commentIds}
        />
    );
};

DocThreadCommentPanel.componentKey = 'univer.doc.thread-comment-panel';
