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

import type { IThreadComment } from '@univerjs/thread-comment';
import type { IThreadCommentPanelProps } from '@univerjs/thread-comment-ui';
import { Tools, UserManagerService } from '@univerjs/core';
import { MobileThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { MobileSheetCommentDraftService } from '../../services/mobile/mobile-sheet-comment-draft.service';
import { SheetsThreadCommentPanel } from '../SheetsThreadCommentPanel';

function MobileSheetsThreadCommentPanelContent(props: IThreadCommentPanelProps) {
    const draftService = useDependency(MobileSheetCommentDraftService);
    const userManagerService = useDependency(UserManagerService);
    const draft = useObservable(draftService.draft$, draftService.draft);
    const tempCellComment: IThreadComment | null = draft?.unitId === props.unitId
        ? {
            id: '',
            threadId: '',
            unitId: draft.unitId,
            subUnitId: draft.subUnitId,
            ref: `${Tools.chatAtABC(draft.column)}${draft.row + 1}`,
            dT: '',
            personId: userManagerService.getCurrentUser().userID,
            text: { dataStream: '\r\n' },
        }
        : null;

    const handleTempCommentClose = () => {
        draftService.cancel();
        props.onTempCommentClose?.();
    };

    return (
        <MobileThreadCommentPanel
            {...props}
            tempComment={props.tempComment ?? tempCellComment}
            onTempCommentClose={handleTempCommentClose}
            autoFocusActiveComment
        />
    );
}

export function MobileSheetsThreadCommentPanel() {
    return <SheetsThreadCommentPanel ThreadCommentPanelComponent={MobileSheetsThreadCommentPanelContent} />;
}
