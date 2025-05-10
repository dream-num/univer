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
import { BuildTextUtils, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { BreakLineCommand, IEditorService, RichTextEditor } from '@univerjs/docs-ui';
import { KeyCode, useDependency } from '@univerjs/ui';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';

export interface IThreadCommentEditorProps {
    id?: string;
    comment?: Pick<IThreadComment, 'attachments' | 'text' | 'mentions'>;
    onSave?: (comment: Pick<IThreadComment, 'attachments' | 'text'>) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
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
    const { comment, onSave, id, onCancel, autoFocus, unitId, type } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [editing, setEditing] = useState(false);
    const editorService = useDependency(IEditorService);
    const editor = useRef<Editor>(null);
    const rootEditorId = type === UniverInstanceType.UNIVER_SHEET ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY : unitId;
    const [canSubmit, setCanSubmit] = useState(() => BuildTextUtils.transform.getPlainText(editor.current?.getDocumentData().body?.dataStream ?? ''));
    useEffect(() => {
        setCanSubmit(BuildTextUtils.transform.getPlainText(editor.current?.getDocumentData().body?.dataStream ?? ''));

        const sub = editor.current?.selectionChange$.subscribe(() => {
            setCanSubmit(BuildTextUtils.transform.getPlainText(editor.current?.getDocumentData().body?.dataStream ?? ''));
        });

        return () => sub?.unsubscribe();
    }, [editor.current?.selectionChange$]);

    const keyboardEventConfig: IKeyboardEventConfig = useMemo(() => (
        {
            keyCodes: [{ keyCode: KeyCode.ENTER }],
            handler: (keyCode) => {
                if (keyCode === KeyCode.ENTER) {
                    commandService.executeCommand(
                        BreakLineCommand.id
                    );
                }
            },
        }
    ), [commandService]);

    useImperativeHandle(ref, () => ({
        reply(text) {
            if (!editor.current) {
                return;
            }
            editorService.focus(editor.current!.getEditorId() ?? '');
            const documentData = getSnapshot(text);
            editor.current?.setDocumentData(documentData, [{
                startOffset: documentData.body!.dataStream.length - 2,
                endOffset: documentData.body!.dataStream.length - 2,
                collapsed: true,
            }]);
        },
    }));

    const handleSave = () => {
        if (editor.current) {
            const newText = Tools.deepClone(editor.current.getDocumentData().body);
            setEditing(false);
            onSave?.({
                ...comment,
                text: newText!,
            });
            editor.current.replaceText('');
            setTimeout(() => {
                editor.current?.setSelectionRanges([]);
                editor.current?.blur();
            }, 10);
        }
    };

    return (
        <div onClick={(e) => e.preventDefault()}>
            <RichTextEditor
                className="univer-w-full"
                editorRef={editor}
                autoFocus={autoFocus}
                keyboardEventConfig={keyboardEventConfig}
                placeholder={localeService.t('threadCommentUI.editor.placeholder')}
                initialValue={comment?.text && getSnapshot(comment.text)}
                onFocusChange={(isFocus) => isFocus && setEditing(isFocus)}
                isSingle={false}
                maxHeight={64}
                onClickOutside={() => {
                    setTimeout(() => {
                        editorService.focus(rootEditorId);
                    }, 30);
                }}
            />
            {editing
                ? (
                    <div className="univer-mt-3 univer-flex univer-flex-row univer-justify-end">
                        <Button
                            style={{ marginRight: 12 }}
                            onClick={() => {
                                onCancel?.();
                                setEditing(false);
                                editor.current?.replaceText('', true);
                                commandService.executeCommand(SetActiveCommentOperation.id);
                            }}
                        >
                            {localeService.t('threadCommentUI.editor.cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!canSubmit}
                            onClick={handleSave}
                        >
                            {localeService.t(id ? 'threadCommentUI.editor.save' : 'threadCommentUI.editor.reply')}
                        </Button>
                    </div>
                )
                : null}
        </div>
    );
});

export const ThreadCommentSuggestion = ({ active, user }: { active: boolean; user: IUser }) => (
    <div
        className={clsx(
            `
              univer-flex univer-items-center univer-text-sm univer-text-gray-900
              dark:univer-text-white
            `,
            { 'univer-bg-gray-50 dark:univer-bg-gray-900': active }
        )}
    >
        <img
            className="univer-mr-1.5 univer-h-6 univer-w-6 univer-rounded-full"
            src={user.avatar}
            draggable={false}
        />
        <span>{user.name}</span>
    </div>
);
