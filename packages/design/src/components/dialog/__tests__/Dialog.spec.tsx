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

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Dialog } from '../Dialog';

afterEach(cleanup);

describe('Dialog focus recovery', () => {
    it('returns focus through the parent modal before returning to the editor', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        try {
            editor.focus();
            const { rerender, getByRole } = render(
                <Dialog open title="Parent">
                    <button>Parent action</button>
                    <Dialog open={false} title="Child"><button>Child action</button></Dialog>
                </Dialog>
            );
            const parentAction = getByRole('button', { name: 'Parent action' });
            await waitFor(() => expect(document.activeElement).toBe(parentAction));
            rerender(
                <Dialog open title="Parent">
                    <button>Parent action</button>
                    <Dialog open title="Child"><button>Child action</button></Dialog>
                </Dialog>
            );
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'Child action' })));
            rerender(
                <Dialog open title="Parent">
                    <button>Parent action</button>
                    <Dialog open={false} title="Child"><button>Child action</button></Dialog>
                </Dialog>
            );
            await waitFor(() => expect(document.activeElement).toBe(parentAction));
            rerender(<Dialog open={false} title="Parent"><button>Parent action</button></Dialog>);
            await waitFor(() => expect(document.activeElement).toBe(editor));
        } finally {
            editor.remove();
        }
    });

    it('captures the current editor separately on each open', async () => {
        const first = document.createElement('input');
        const second = document.createElement('input');
        document.body.append(first, second);
        try {
            const { rerender, getByRole } = render(<Dialog open={false} title="Validation"><button>OK</button></Dialog>);
            for (const editor of [first, second]) {
                editor.focus();
                rerender(<Dialog open title="Validation"><button>OK</button></Dialog>);
                await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
                rerender(<Dialog open={false} title="Validation"><button>OK</button></Dialog>);
                await waitFor(() => expect(document.activeElement).toBe(editor));
            }
        } finally {
            first.remove();
            second.remove();
        }
    });

    it('does not focus a removed editor when closing', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        editor.focus();
        const { rerender, getByRole, queryByRole } = render(<Dialog open title="Validation"><button>OK</button></Dialog>);
        await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
        editor.remove();
        rerender(<Dialog open={false} title="Validation"><button>OK</button></Dialog>);
        await waitFor(() => expect(queryByRole('dialog')).toBeNull());
        expect(document.activeElement).toBe(document.body);
    });

    it('returns focus to the editor after a programmatically opened modal closes', async () => {
        const editor = document.createElement('input');
        document.body.appendChild(editor);
        try {
            editor.focus();
            const { rerender, getByRole } = render(<Dialog open title="Validation"><button>OK</button></Dialog>);
            await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'OK' })));
            rerender(<Dialog open={false} title="Validation"><button>OK</button></Dialog>);
            await waitFor(() => expect(document.activeElement).toBe(editor));
        } finally {
            editor.remove();
        }
    });
});
