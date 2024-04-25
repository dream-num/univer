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

import { useDependency } from '@wendellhu/redi/react-bindings';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import React from 'react';
import { DeleteSingle, MoreSingle } from '@univerjs/icons';
import type { UniverInstanceType } from '@univerjs/core';
import styles from './index.module.less';

export interface IThreadCommentThreeProps {
    id: string;
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
}

export const ThreadCommentThree = (props: IThreadCommentThreeProps) => {
    const { id, unitId, subUnitId } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    const comments = threadCommentModel.getCommentWithChildren(unitId, subUnitId, id);

    if (!comments) {
        return null;
    }
    const renderComments = [comments.root, ...comments.children ?? []];

    return (
        <div className={styles.threadComment}>
            <div className={styles.threadCommentTitle}>
                <div className={styles.threadCommentTitlePosition}>
                    <div className={styles.threadCommentTitleHighlight} />
                    {comments.root.ref}
                </div>
                <div>
                    <div className={styles.threadCommentIcon}>
                        <DeleteSingle />
                    </div>
                </div>
            </div>
            {renderComments.map(
                (item) => (
                    <div className={styles.threadCommentItem} key={item.id}>
                        <img className={styles.threadCommentItemHead} />
                        <div className={styles.threadCommentItemTitle}>
                            {item.personId}
                            <div className={styles.threadCommentIcon}>
                                <MoreSingle />
                            </div>
                        </div>
                        <div className={styles.threadCommentItemTime}>{item.dT}</div>
                        <div className={styles.threadCommentItemContent}>{item.text}</div>
                    </div>
                )
            )}
        </div>
    );
};
