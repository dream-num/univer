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

import type { DocumentDataModel } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';
import { Observable } from 'rxjs';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';

export const DocThreadCommentPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const subUnitId$ = useMemo(() => new Observable<string>((sub) => sub.next(DEFAULT_DOC_SUBUNIT_ID)), []);

    if (!doc) {
        return null;
    }

    const unitId = doc.getUnitId();

    return (
        <ThreadCommentPanel
            unitId={unitId}
            subUnitId$={subUnitId$}
            type={UniverInstanceType.UNIVER_DOC}
            onAdd={() => {}}
            getSubUnitName={() => ''}
        />
    );
};

DocThreadCommentPanel.componentKey = 'univer.doc.thread-comment-panel';
