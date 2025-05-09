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

import type { IMention, ITypeMentionList } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { useRef, useState } from 'react';

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
        <div
            ref={ref}
            data-editorid={editorId}
            tabIndex={0}
            className={clsx(`
              univer-max-h-72 univer-w-72 univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-2
              univer-shadow-md
            `, borderClassName)}
            onClick={onClick}
        >
            {mentions.map((typeMentions) => (
                <div key={typeMentions.type}>
                    <div className="univer-mb-2 univer-font-medium">{typeMentions.title}</div>

                    {typeMentions.mentions.map((mention) => (
                        <div
                            key={mention.objectId}
                            data-editorid={editorId}
                            className={clsx(`
                              univer-flex univer-cursor-pointer univer-items-center univer-rounded-md univer-p-2
                            `, {
                                'univer-bg-gray-50': activeId === mention.objectId,
                            })}
                            onClick={() => handleSelect(mention)}
                            onMouseEnter={() => setActiveId(mention.objectId)}
                        >
                            <img
                                className={`
                                  univer-pointer-events-none univer-mr-1.5 univer-size-6 univer-flex-[0_0_auto]
                                  univer-rounded-md
                                  hover:univer-bg-gray-50
                                `}
                                src={mention.metadata?.icon as string}
                            />
                            <div className="univer-pointer-events-none univer-flex-1 univer-truncate">{mention.label}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
