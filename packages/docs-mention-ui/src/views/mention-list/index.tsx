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

import React, { useEffect, useRef, useState } from 'react';
import cs from 'clsx';
import { KeyCode } from '@univerjs/ui';
import type { IMention } from '../../types/interfaces/i-mention';
import styles from './index.module.less';

export interface IMentionListProps {
    mentions: IMention[];
    active?: string;
    onSelect?: (item: IMention) => void;
    onClick?: () => void;
}

export const MentionList = (props: IMentionListProps) => {
    const { mentions, active, onSelect, onClick } = props;
    const ref = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState(active ?? mentions[0]?.objectId);
    const handleSelect = (item: IMention) => {
        onSelect?.(item);
    };

    useEffect(() => {
        ref.current?.focus();
    }, []);

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        const index = mentions.findIndex((i) => i.objectId === activeId);
        if (evt.keyCode === KeyCode.ARROW_UP) {
            setActiveId(mentions[index - 1]?.objectId);
        }

        if (evt.keyCode === KeyCode.ARROW_DOWN) {
            setActiveId(mentions[index + 1]?.objectId);
        }

        if (evt.keyCode === KeyCode.ENTER && mentions[index]) {
            handleSelect(mentions[index]);
        }
    };

    return (
        <div ref={ref} tabIndex={0} className={styles.docMentionPanel} onKeyDown={handleKeyDown} onClick={onClick}>
            {mentions.map((mention) => (
                <div
                    key={mention.objectId}
                    className={cs(styles.docMention, { [styles.docMentionActive]: activeId === mention.objectId })}
                    onClick={() => handleSelect(mention)}
                >
                    <img className={styles.docMentionIcon} src={mention.extra?.icon} />
                    <div className={styles.docMentionLabel}>{mention.label}</div>
                </div>
            ))}
        </div>
    );
};
