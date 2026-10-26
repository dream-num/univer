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

import type { IDisposable, LocaleService } from '@univerjs/core';
import type { OleConversionStage } from '@univerjs/drawing';
import type { INotificationService } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import { useObservable } from '@univerjs/ui';
import { createElement } from 'react';
import { BehaviorSubject } from 'rxjs';

const STAGE_KEYS: Record<OleConversionStage, LocaleKey> = {
    reading: 'drawing-ui.ole.progressReading',
    uploading: 'drawing-ui.ole.progressUploading',
    converting: 'drawing-ui.ole.converting',
    creating: 'drawing-ui.ole.progressCreating',
    saving: 'drawing-ui.ole.progressSaving',
};

function OleConversionProgress({ stage$, locale, name }: {
    stage$: BehaviorSubject<OleConversionStage>;
    locale: LocaleService;
    name: string;
}) {
    const stage = useObservable(stage$) ?? 'reading';
    return (
        <div className="univer-flex univer-w-60 univer-min-w-0 univer-flex-col univer-gap-2" role="status">
            <span className="univer-truncate">{name}</span>
            <span>{locale.t<LocaleKey>(STAGE_KEYS[stage])}</span>
            <progress className="univer-h-1 univer-w-full" aria-label={locale.t<LocaleKey>(STAGE_KEYS[stage])} />
        </div>
    );
}

/** Keep feedback visible when the drawing menu closes or the reserved tab gains focus. */
export function createOleConversionProgress(
    notifications: INotificationService,
    locale: LocaleService,
    name: string,
    tab: Window | null
): IDisposable & { update: (stage: OleConversionStage) => void } {
    const stage$ = new BehaviorSubject<OleConversionStage>('reading');
    const notification = notifications.show({
        title: createElement(OleConversionProgress, { stage$, locale, name }),
        position: 'bottom-right',
        duration: Infinity,
        closable: false,
        dismissible: false,
    });
    let label: HTMLElement | undefined;
    if (tab && !tab.closed) {
        const document = tab.document;
        document.title = name;
        const root = document.createElement('main');
        root.style.cssText = 'max-width:32rem;margin:20vh auto;padding:2rem;font-family:system-ui;overflow-wrap:anywhere';
        const title = document.createElement('h1');
        title.textContent = name;
        label = document.createElement('p');
        label.setAttribute('role', 'status');
        const bar = document.createElement('progress');
        bar.style.width = '100%';
        root.append(title, label, bar);
        document.body.replaceChildren(root);
        document.documentElement.style.colorScheme = 'light dark';
    }
    let disposed = false;
    const update = (stage: OleConversionStage): void => {
        if (disposed) return;
        stage$.next(stage);
        if (label) label.textContent = locale.t<LocaleKey>(STAGE_KEYS[stage]);
    };
    update('reading');
    return { update, dispose: () => {
        if (disposed) return;
        disposed = true;
        notification.dispose();
        stage$.complete();
    } };
}
