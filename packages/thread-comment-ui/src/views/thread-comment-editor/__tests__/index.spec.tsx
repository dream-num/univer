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

import type { Root } from 'react-dom/client';
import { UniverInstanceType } from '@univerjs/core';
import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreadCommentEditor } from '../index';

const { commandService, localeService, editorService, coreTokens, docsUiTokens, editorHandle } = vi.hoisted(() => {
    const commandService = {
        executeCommand: vi.fn(),
    };
    const localeService = {
        t: vi.fn((key: string) => key),
    };
    const editorService = {
        focus: vi.fn(),
    };
    const coreTokens = {
        ICommandService: Symbol('ICommandService'),
        LocaleService: Symbol('LocaleService'),
    };
    const docsUiTokens = {
        IEditorService: Symbol('IEditorService'),
    };
    const editorHandle = {
        getDocumentData: vi.fn(() => ({
            body: {
                dataStream: 'reply body',
            },
        })),
        replaceText: vi.fn(),
        setSelectionRanges: vi.fn(),
        blur: vi.fn(),
        focus: vi.fn(),
        getEditorId: vi.fn(() => 'editor-id'),
        setDocumentData: vi.fn(),
        selectionChange$: {
            subscribe: vi.fn(() => ({
                unsubscribe: vi.fn(),
            })),
        },
    };

    return {
        commandService,
        localeService,
        editorService,
        coreTokens,
        docsUiTokens,
        editorHandle,
    };
});

vi.mock('@univerjs/core', () => ({
    BuildTextUtils: {
        transform: {
            getPlainText: (value: string) => value,
        },
    },
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY: 'doc-editor-id',
    ICommandService: coreTokens.ICommandService,
    LocaleService: coreTokens.LocaleService,
    Tools: {
        deepClone: <T,>(value: T) => value,
    },
    UniverInstanceType: {
        UNIVER_DOC: 'UNIVER_DOC',
    },
}));

vi.mock('@univerjs/docs-ui', () => ({
    BreakLineCommand: {
        id: 'break-line',
    },
    IEditorService: docsUiTokens.IEditorService,
    RichTextEditor: ({ autoFocus, editorRef, onFocusChange, placeholder }: any) => {
        React.useEffect(() => {
            editorRef.current = editorHandle;
            if (autoFocus) {
                onFocusChange?.(true);
            }

            return () => {
                editorRef.current = null;
            };
        }, [autoFocus, editorRef, onFocusChange]);

        return <div aria-label={placeholder} data-testid="thread-comment-editor-input" />;
    },
}));

vi.mock('../../../commands/operations/comment.operations', () => ({
    SetActiveCommentOperation: {
        id: 'set-active-comment',
    },
}));

vi.mock('@univerjs/design', () => ({
    Button: ({ children, disabled, onClick, type }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button disabled={disabled} onClick={onClick} type={type}>
            {children}
        </button>
    ),
    clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@univerjs/ui', () => ({
    KeyCode: {
        ENTER: 13,
    },
    useDependency: (token: symbol) => {
        if (token === coreTokens.ICommandService) {
            return commandService;
        }

        if (token === coreTokens.LocaleService) {
            return localeService;
        }

        if (token === docsUiTokens.IEditorService) {
            return editorService;
        }

        throw new Error(`Unexpected dependency token: ${String(token)}`);
    },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('ThreadCommentEditor', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        commandService.executeCommand.mockReset();
        localeService.t.mockImplementation((key: string) => key);
        editorService.focus.mockReset();
        editorHandle.getDocumentData.mockImplementation(() => ({
            body: {
                dataStream: 'reply body',
            },
        }));
        editorHandle.replaceText.mockReset();
        editorHandle.setSelectionRanges.mockReset();
        editorHandle.blur.mockReset();
        editorHandle.focus.mockReset();
        editorHandle.getEditorId.mockImplementation(() => 'editor-id');
        editorHandle.setDocumentData.mockReset();
        editorHandle.selectionChange$.subscribe.mockImplementation(() => ({
            unsubscribe: vi.fn(),
        }));
    });

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        vi.clearAllMocks();
    });

    it('uses non-submit buttons so replying does not submit an outer form', () => {
        const onSave = vi.fn();
        const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <form onSubmit={onSubmit}>
                    <ThreadCommentEditor
                        autoFocus
                        editorId="thread-comment-editor"
                        onSave={onSave}
                        subUnitId="subUnit"
                        type={UniverInstanceType.UNIVER_DOC}
                        unitId="unit"
                    />
                </form>
            );
        });

        const buttons = Array.from(container.querySelectorAll('button'));
        const cancelButton = buttons.find((button) => button.textContent === 'thread-comment-ui.editor.cancel');
        const replyButton = buttons.find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        expect(cancelButton?.getAttribute('type')).toBe('button');
        expect(replyButton?.getAttribute('type')).toBe('button');

        act(() => {
            replyButton?.click();
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('blurs the editor before save callbacks can unmount it', () => {
        const onSave = vi.fn(() => {
            editorHandle.blur.mockImplementation(() => {
                throw new Error('blur after save');
            });
        });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <ThreadCommentEditor
                    autoFocus
                    editorId="thread-comment-editor"
                    onSave={onSave}
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_DOC}
                    unitId="unit"
                />
            );
        });

        const replyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        expect(() => {
            act(() => {
                replyButton?.click();
            });
        }).not.toThrow();
        expect(editorHandle.blur).toHaveBeenCalledBefore(onSave);
    });

    it('blurs the editor before clearing content so active popups are disposed first', () => {
        const onSave = vi.fn();

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <ThreadCommentEditor
                    autoFocus
                    editorId="thread-comment-editor"
                    onSave={onSave}
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_DOC}
                    unitId="unit"
                />
            );
        });

        const replyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        act(() => {
            replyButton?.click();
        });

        expect(editorHandle.blur).toHaveBeenCalledBefore(editorHandle.replaceText);
    });

    it('shows action buttons after reply inserts mention text without a focus change event', () => {
        const ref = React.createRef<{ reply: (text: { dataStream: string }) => void }>();

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <ThreadCommentEditor
                    ref={ref as any}
                    autoFocus={false}
                    editorId="thread-comment-editor"
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_SHEET}
                    unitId="unit"
                />
            );
        });

        expect(container.querySelectorAll('button').length).toBe(0);

        act(() => {
            ref.current?.reply({ dataStream: '@Owner asdas\r\n' });
        });

        const replyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        expect(replyButton).toBeTruthy();
        expect(replyButton?.disabled).toBe(false);
    });

    it('shows action buttons after the editor is clicked without a focus change event', () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <ThreadCommentEditor
                    autoFocus={false}
                    editorId="thread-comment-editor"
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_SHEET}
                    unitId="unit"
                />
            );
        });

        expect(container.querySelectorAll('button').length).toBe(0);

        act(() => {
            container.querySelector('[data-testid="thread-comment-editor-input"]')?.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });

        const replyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        expect(replyButton).toBeTruthy();
    });

    it('resets submit state after saving and clearing the editor', () => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root.render(
                <ThreadCommentEditor
                    autoFocus
                    editorId="thread-comment-editor"
                    subUnitId="subUnit"
                    type={UniverInstanceType.UNIVER_SHEET}
                    unitId="unit"
                />
            );
        });

        const firstReplyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        act(() => {
            firstReplyButton?.click();
        });

        act(() => {
            container.querySelector('[data-testid="thread-comment-editor-input"]')?.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true })
            );
        });

        const secondReplyButton = Array.from(container.querySelectorAll('button'))
            .find((button) => button.textContent === 'thread-comment-ui.editor.reply');

        expect(secondReplyButton?.disabled).toBe(true);
    });
});
