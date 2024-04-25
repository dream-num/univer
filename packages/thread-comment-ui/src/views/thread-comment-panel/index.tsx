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

import React, { useEffect, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import type { UniverInstanceType } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import { ThreadCommentThree } from '../thread-comment-tree';
import styles from './index.module.less';

export interface IThreadCommentPanelProps {
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
}

export const ThreadCommentPanel = (props: IThreadCommentPanelProps) => {
    const { unitId, subUnitId, type } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    const [rootCommentIds$, setRootCommentIds$] = useState(() => threadCommentModel.getRootCommentIds$(unitId, subUnitId));
    const rootCommentIds = useObservable(rootCommentIds$, threadCommentModel.getRootCommentIds(unitId, subUnitId));

    useEffect(() => {
        setRootCommentIds$(
            threadCommentModel.getRootCommentIds$(unitId, subUnitId)
        );
    }, [unitId, subUnitId, threadCommentModel]);

    return (
        <div className={styles.ThreadCommentPanel}>
            {rootCommentIds.map((id) => (
                <ThreadCommentThree
                    key={id}
                    id={id}
                    unitId={unitId}
                    subUnitId={subUnitId}
                    type={type}
                />
            ))}
        </div>
    );
};
