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

import type { IDialogProps } from '@univerjs/design';
import type { IDialogPartMethodOptions } from './interface';
import { Dialog } from '@univerjs/design';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { useDependency, useObservable } from '../../../utils/di';
import { getEmbedBoundaryOwner } from '../../../utils/embed-boundary';
import { CustomLabel } from '../../custom-label/CustomLabel';

function DialogItem(props: IDialogProps) {
    const dialogRef = useRef<Element | null>(null);
    const openRef = useRef(false);
    const handleContentRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            dialogRef.current = node.closest('[role="dialog"]');
        }
    }, []);

    useLayoutEffect(() => {
        openRef.current = !!props.open;
        if (!props.open) {
            return;
        }
        // Capture before the portal mounts and its focus scope moves focus into the dialog.
        const ownerDocument = document;
        const opener = ownerDocument.activeElement;
        const owner = getEmbedBoundaryOwner(opener);
        const ownerWindow = ownerDocument?.defaultView;
        const handleCompositionEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && event.isComposing &&
                event.target instanceof Element && event.target.closest('[role="dialog"]') === dialogRef.current) {
                // The candidate window owns Escape before the dialog's document-level listener sees it.
                event.preventDefault();
                event.stopPropagation();
            }
        };
        ownerWindow?.addEventListener('keydown', handleCompositionEscape, true);
        return () => {
            openRef.current = false;
            const content = dialogRef.current;
            ownerWindow?.removeEventListener('keydown', handleCompositionEscape, true);
            if (props.mask === false) {
                return;
            }
            queueMicrotask(() => {
                if (openRef.current) {
                    return;
                }
                if (dialogRef.current === content) {
                    dialogRef.current = null;
                }
                const active = ownerDocument?.activeElement;
                if (opener instanceof HTMLElement && opener.isConnected && getEmbedBoundaryOwner(opener) === owner &&
                    (active === ownerDocument?.body || (active && content?.contains(active)))) {
                    opener.focus({ preventScroll: true });
                }
            });
        };
    }, [props.open, props.mask]);

    return (
        <Dialog {...props}>
            <div ref={handleContentRef} className="univer-contents">{props.children}</div>
        </Dialog>
    );
}

export function DialogPart() {
    const dialogService = useDependency(IDialogService);

    const dialogOptions = useObservable(dialogService.getDialogs$(), []);

    const attrs = useMemo(() => dialogOptions.map((options) => {
        const { children, title, footer, ...restProps } = options;

        const dialogProps = restProps as IDialogProps & { id: string };
        for (const key of ['children', 'title', 'footer']) {
            const k = key as keyof IDialogPartMethodOptions;
            const props = options[k] as any;

            if (props) {
                const { key: itemKey, ...customLabelProps } = props;

                (dialogProps as any)[k] = <CustomLabel key={itemKey} {...customLabelProps} />;
            }
        }

        return dialogProps;
    }), [dialogOptions]);

    return attrs?.map((options) => (
        <DialogItem key={options.id} {...options} />
    ));
}
