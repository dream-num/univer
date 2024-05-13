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

import type { IThreadComment, IThreadCommentMention, TextNode } from '@univerjs/thread-comment';
import type { MentionProps } from '@univerjs/design';
import { Button, Mention, Mentions } from '@univerjs/design';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { IConfigService, LocaleService } from '@univerjs/core';
import { PLUGIN_NAME } from '../../types/const';
import type { IThreadCommentUIConfig } from '../../types/interfaces/i-thread-comment-mention';
import styles from './index.module.less';


export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
}

const parseMentions = (text: string): TextNode[] => {
    const regex = /@\[(.*?)\]\((.*?)\)|(\w+)/g;
    let match;
    let lastIndex = 0;
    const result: TextNode[] = [];

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            // Add the text between two user mentions or before the first user mention
            result.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
            });
        }

        if (match[1] && match[2]) {
            // User mention found
            const [type, id] = match[2].split('-');
            result.push({
                type: 'mention',
                content: {
                    label: match[1],
                    type,
                    id,
                },
            });
        } else if (match[3]) {
            // Text (numbers) found
            result.push({
                type: 'text',
                content: match[3],
            });
        }
        lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last mention (if any)
    if (lastIndex < text.length) {
        result.push({
            type: 'text',
            content: text.substring(lastIndex),
        });
    }

    return result;
};
const transformTextNode2Text = (nodes: TextNode[]) => {
    return nodes.map((item) => {
        switch (item.type) {
            case 'mention':
                return `@[${item.content.label}](${item.content.type}-${item.content.id})`;
            default:
                return item.content;
        }
    }).join('');
};


const transformMention = (mention: IThreadCommentMention) => ({
    display: mention.label,
    id: `${mention.type}-${mention.id}`,
    raw: mention,
});

export interface IThreadCommentEditorInstance {
    reply: (text: TextNode[]) => void;
}

const defaultRenderSuggestion: MentionProps['renderSuggestion'] = (mention, search, highlightedDisplay, index, focused) => {
    const icon = (mention as any).raw?.icon;
    return (
        <div className={styles.threadCommentEditorSuggestion}>
            {icon ? <img className={styles.threadCommentEditorSuggestionIcon} src={icon} /> : null}
            <div>
                {mention.display ?? mention.id}
            </div>
        </div>
    );
};

export const ThreadCommentEditor = forwardRef<IThreadCommentEditorInstance, IThreadCommentEditorProps>((props, ref) => {
    const { comment, onSave, id, onCancel, autoFocus } = props;
    const configService = useDependency(IConfigService);
    const localeService = useDependency(LocaleService);
    const [localComment, setLocalComment] = useState({ text: [], ...comment });
    const [editing, setEditing] = useState(false);
    const mentions = configService.getConfig<IThreadCommentUIConfig>(PLUGIN_NAME)?.mentions ?? [];
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        reply(text) {
            setLocalComment({
                ...comment,
                text,
                attachments: [],
            });
            (inputRef.current as any)?.inputElement.focus();
        },
    }));

    return (
        <div className={styles.threadCommentEditor} onClick={(e) => e.preventDefault()}>
            <Mentions
                ref={inputRef}
                autoFocus={autoFocus}
                style={{ width: '100%' }}
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                value={transformTextNode2Text(localComment?.text ?? [])}
                onChange={(e) => {
                    setLocalComment?.({ ...comment, text: parseMentions(e.target.value) });
                }}
                onFocus={() => {
                    setEditing(true);
                }}
            >
                {mentions.map((mention) => (
                    <Mention
                        key={mention.trigger}
                        trigger={mention.trigger}
                        data={mention.getMentions ?
                            (query, callback) => mention.getMentions!(query)
                                .then((res) => res.map(transformMention)).then(callback) as any
                            : (mention.mentions ?? []).map(transformMention)}
                        displayTransform={(id, label) => `@${label} `}
                        renderSuggestion={mention.renderSuggestion ?? defaultRenderSuggestion}
                    />
                ))}
            </Mentions>
            {editing
                ? (
                    <div className={styles.threadCommentEditorButtons}>
                        <Button
                            style={{ marginRight: 12 }}
                            onClick={() => {
                                onCancel?.();
                                setEditing(false);
                                setLocalComment({ text: [] });
                            }}
                        >
                            {localeService.t('threadCommentUI.editor.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            disabled={!localComment.text.length}
                            onClick={() => {
                                onSave?.(localComment);
                                setEditing(false);
                                setLocalComment({ text: [] });
                            }}
                        >
                            {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                        </Button>
                    </div>
                )
                : null}
        </div>
    );
});
