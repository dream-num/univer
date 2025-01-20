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

import type { IMention, ITypeMentionList } from '@univerjs/core';
import cs from 'clsx';
import React, { useRef, useState } from 'react';
import styles from './index.module.less';

export interface IMentionListProps {
    mentions: ITypeMentionList[];
    active?: string;
    onSelect?: (item: IMention) => void;
    onClick?: () => void;
    editorId: string;
}

export const MentionList = (props: IMentionListProps) => {
    const { mentions, active, onSelect, onClick, editorId } = props;
    const ref = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState(active ?? mentions[0]?.mentions[0]?.objectId);
    const handleSelect = (item: IMention) => {
        onSelect?.(item);
    };

    return (
        <div ref={ref} data-editorid={editorId} tabIndex={0} className={styles.docMentionPanel} onClick={onClick}>
            {mentions.map((typeMentions) => (
                <div key={typeMentions.type}>
                    <div className={styles.docMentionType}>{typeMentions.title}</div>
                    {typeMentions.mentions.map((mention) => (
                        <div
                            data-editorid={editorId}
                            key={mention.objectId}
                            className={cs(styles.docMention, { [styles.docMentionActive]: activeId === mention.objectId })}
                            onClick={() => handleSelect(mention)}
                            onMouseEnter={() => setActiveId(mention.objectId)}
                        >
                            <img className={styles.docMentionIcon} src={mention.metadata?.icon as string} />
                            <div className={styles.docMentionLabel}>{mention.label}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
