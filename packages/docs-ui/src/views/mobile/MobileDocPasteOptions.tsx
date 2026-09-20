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

import type { IPopupWithExtraProps, MobileDrawerSnap } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import type { DocPasteMode } from '../../services/clipboard/paste-options';
import type { MobileDocSelectionRenderService } from '../../services/mobile/doc-selection-render.service';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';

import { CheckMarkIcon, DocPasteOptionsIcon } from '@univerjs/icons';
import { MobileDrawer, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { DocChangePasteModeCommand } from '../../commands/commands/clipboard.command';
import { IDocClipboardService } from '../../services/clipboard/clipboard.service';
import { DOC_PASTE_OPTIONS } from '../../services/clipboard/paste-options';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export function MobileDocPasteOptions({ popup }: { popup: IPopupWithExtraProps<{ unitId: string }> }) {
    const { unitId } = popup.extraProps;
    const clipboard = useDependency(IDocClipboardService);
    const commands = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const renders = useDependency(IRenderManagerService);
    const selection = renders.getRenderUnitById(unitId)?.with(DocSelectionRenderService) as MobileDocSelectionRenderService | undefined;
    const state = useObservable(clipboard.pasteOptions$, null);
    const keyboard = useObservable(selection?.mobileKeyboardState$, { visible: false, inset: 0 });
    useObservable(localeService.currentLocale$);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [snap, setSnap] = useState<MobileDrawerSnap>('compact');

    const changeMode = async (value: DocPasteMode) => {
        setBusy(true);
        try {
            await commands.executeCommand(DocChangePasteModeCommand.id, { value });
            setOpen(false);
        } finally {
            setBusy(false);
        }
    };

    if (!state || state.unitId !== unitId) {
        return null;
    }

    return (
        <>
            <Button
                aria-label={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                className="
                  univer-min-h-11 univer-min-w-11 univer-shadow-sm
                  [&_svg]:!univer-size-6
                "
                style={keyboard.visible
                    ? {
                        position: 'fixed',
                        bottom: keyboard.inset + 56,
                        insetInlineEnd: 12,
                    }
                    : undefined}
                onClick={() => {
                    selection?.suspendMobileEditingInput();
                    setOpen(true);
                }}
            >
                <DocPasteOptionsIcon aria-hidden="true" />
            </Button>
            {open && (
                <div
                    className="univer-pointer-events-none univer-fixed univer-inset-x-0 univer-top-0"
                    style={{ bottom: keyboard.inset }}
                >
                    <MobileDrawer
                        componentName="mobile-doc-paste-options"
                        panelClassName="univer-max-h-full"
                        snap={snap}
                        onSnapChange={setSnap}
                        onClose={() => setOpen(false)}
                        expandLabel={localeService.t<LocaleKey>('docs-ui.mobile.expand')}
                        collapseLabel={localeService.t<LocaleKey>('docs-ui.mobile.collapse')}
                        ariaLabel={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                        header={(
                            <div
                                className="
                                  univer-flex univer-w-full univer-items-center univer-justify-between univer-gap-2
                                  univer-px-4
                                "
                            >
                                <span>{localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}</span>
                                <Button variant="text" className="univer-min-h-11" onClick={() => setOpen(false)}>
                                    {localeService.t<LocaleKey>('docs-ui.mobile.done')}
                                </Button>
                            </div>
                        )}
                    >
                        <div
                            role="menu"
                            aria-label={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                            className="univer-flex univer-flex-col univer-gap-1 univer-p-3"
                        >
                            {DOC_PASTE_OPTIONS.map((option) => (
                                <Button
                                    key={option.value}
                                    role="menuitemradio"
                                    aria-checked={state.mode === option.value}
                                    disabled={busy}
                                    variant="text"
                                    className="
                                      !univer-h-auto univer-min-h-11 univer-justify-start univer-whitespace-normal
                                      univer-py-3 univer-text-start
                                    "
                                    onClick={() => changeMode(option.value)}
                                >
                                    <span
                                        className="univer-inline-flex univer-size-5 univer-shrink-0 univer-items-center"
                                    >
                                        {state.mode === option.value && <CheckMarkIcon />}
                                    </span>
                                    {localeService.t<LocaleKey>(option.label)}
                                </Button>
                            ))}
                        </div>
                    </MobileDrawer>
                </div>
            )}
        </>
    );
}
