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

import type { IDocumentBody, IDocumentData, IUser } from '@univerjs/core';
import type { Editor, IKeyboardEventConfig } from '@univerjs/docs-ui';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { LocaleKey } from '../locale/types';
import {
    BuildTextUtils,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    LocaleService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { ActionRow, Button, clsx } from '@univerjs/design';
import { BreakLineCommand, DeleteLeftCommand, DeleteRightCommand, IEditorService, RichTextEditor } from '@univerjs/docs-ui';
import { KeyCode, useDependency } from '@univerjs/ui';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../commands/operations/comment.operations';
import { focusThreadCommentEditor } from './thread-comment-editor/util';

export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => boolean | void | Promise<boolean | void>;
    onCancel?: () => void;
    autoFocus?: boolean;
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
    editorId: string;
}

export interface IThreadCommentEditorInstance {
    reply: (text: IDocumentBody) => void;
}

function getSnapshot(body: IDocumentBody): IDocumentData {
    return {
        id: 'd',
        body,
        documentStyle: {},
    };
}

export const ThreadCommentEditor = forwardRef<IThreadCommentEditorInstance, IThreadCommentEditorProps>((props, ref) => {
    const { comment, onSave, id, onCancel, autoFocus, unitId, type, editorId } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const mountedRef = useRef(true);
    const editorService = useDependency(IEditorService);
    const editorRef = useRef<Editor>(null);
    const rootEditorId = type === UniverInstanceType.UNIVER_DOC ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY : unitId;
    const [canSubmit, setCanSubmit] = useState(() => (
        BuildTextUtils.transform.getPlainText(comment?.text?.dataStream ?? '')
    ));

    const keyboardEventConfig: IKeyboardEventConfig = useMemo(() => (
        {
            keyCodes: [
                { keyCode: KeyCode.ENTER },
                { keyCode: KeyCode.BACKSPACE },
                { keyCode: KeyCode.DELETE },
            ],
            handler: (keyCode) => {
                let commandId: string;
                switch (keyCode) {
                    case KeyCode.ENTER:
                        commandId = BreakLineCommand.id;
                        break;
                    case KeyCode.BACKSPACE:
                        commandId = DeleteLeftCommand.id;
                        break;
                    case KeyCode.DELETE:
                        commandId = DeleteRightCommand.id;
                        break;
                    default:
                        return;
                }

                focusThreadCommentEditor(editorService, editorId, editorRef.current);
                commandService.executeCommand(commandId).then(() => {
                    if (keyCode !== KeyCode.ENTER && mountedRef.current) {
                        const dataStream = editorRef.current?.getDocumentData().body?.dataStream ?? '';
                        setCanSubmit(BuildTextUtils.transform.getPlainText(dataStream));
                    }
                });
            },
        }
    ), [commandService, editorId, editorService]);

    useImperativeHandle(ref, () => ({
        reply(text) {
            if (!editorRef.current) {
                return;
            }
            focusThreadCommentEditor(editorService, editorId, editorRef.current);
            const documentData = getSnapshot(text);
            editorRef.current?.setDocumentData(documentData, [{
                startOffset: documentData.body!.dataStream.length - 2,
                endOffset: documentData.body!.dataStream.length - 2,
                collapsed: true,
            }]);
            setCanSubmit(BuildTextUtils.transform.getPlainText(documentData.body!.dataStream));
            setEditing(true);
        },
    }));

    const handleSave = async () => {
        const currentEditor = editorRef.current;
        if (!currentEditor || submittingRef.current) {
            return;
        }

        const newText = Tools.deepClone(currentEditor.getDocumentData().body);
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const success = await onSave?.({
                ...comment,
                text: newText!,
            });
            if (success === false) {
                return;
            }
            if (!mountedRef.current) {
                return;
            }

            currentEditor.blur();
            currentEditor.replaceText('', false);
            currentEditor.setSelectionRanges([], false);
            setCanSubmit('');
            setEditing(false);
        } catch {
            return;
        } finally {
            submittingRef.current = false;
            if (mountedRef.current) {
                setSubmitting(false);
            }
        }
    };

    const handleEditorMouseDown = () => {
        focusThreadCommentEditor(editorService, editorId, editorRef.current);
        setEditing(true);
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!autoFocus) {
            return;
        }

        const timer = setTimeout(() => {
            focusThreadCommentEditor(editorService, editorId, editorRef.current);
        });

        return () => clearTimeout(timer);
    }, [autoFocus, editorId, editorService]);

    return (
        <div onClick={(e) => e.preventDefault()}>
            <div onMouseDown={handleEditorMouseDown}>
                {/* Comments are hosted by Sheets/Docs, so editing should not replace the host's global focus. */}
                <RichTextEditor
                    className="univer-w-full"
                    editorRef={editorRef}
                    editorId={editorId}
                    preserveHostFocus
                    autoFocus={autoFocus}
                    keyboardEventConfig={keyboardEventConfig}
                    placeholder={localeService.t<LocaleKey>('thread-comment-ui.editor.placeholder')}
                    initialValue={comment?.text && getSnapshot(comment.text)}
                    onChange={(data) => setCanSubmit(BuildTextUtils.transform.getPlainText(data.body?.dataStream ?? ''))}
                    onFocusChange={(isFocus) => isFocus && setEditing(isFocus)}
                    isSingle={false}
                    maxHeight={64}
                    onClickOutside={() => {
                        setTimeout(() => {
                            editorService.focus(rootEditorId);
                        }, 30);
                    }}
                />
            </div>
            {editing
                ? (
                    <ActionRow
                        className="univer-mt-3 univer-flex univer-flex-row univer-justify-end univer-gap-2"
                    >
                        <Button
                            type="button"
                            onClick={() => {
                                const currentEditor = editorRef.current;
                                currentEditor?.blur();
                                currentEditor?.replaceText('', false);
                                currentEditor?.setSelectionRanges([], false);
                                setCanSubmit('');
                                onCancel?.();
                                setEditing(false);
                                commandService.executeCommand(SetActiveCommentOperation.id);
                            }}
                        >
                            {localeService.t<LocaleKey>('thread-comment-ui.editor.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            disabled={!canSubmit || submitting}
                            onClick={handleSave}
                        >
                            {localeService.t<LocaleKey>(id ? 'thread-comment-ui.editor.save' : 'thread-comment-ui.editor.reply')}
                        </Button>
                    </ActionRow>
                )
                : null}
        </div>
    );
});

export const ThreadCommentSuggestion = ({ active, user }: { active: boolean; user: IUser }) => (
    <div
        className={clsx(`
          univer-flex univer-items-center univer-text-sm univer-text-gray-900
          dark:!univer-text-gray-0
        `, {
            'univer-bg-gray-50 dark:!univer-bg-gray-900': active,
        })}
    >
        <img
            className="univer-mr-1.5 univer-size-6 univer-rounded-full"
            src={user.avatar}
            draggable={false}
        />
        <span>{user.name}</span>
    </div>
);
