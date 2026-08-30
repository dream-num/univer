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

import type { ITextStyle, Nullable } from '@univerjs/core';
import type { ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import type { Editor } from '../../services/editor/editor';
import { BooleanNumber, BuildTextUtils, ICommandService, LocaleService, PresetListType, ThemeService } from '@univerjs/core';
import { clsx, resetButtonClassName } from '@univerjs/design';
import {
    BoldIcon,
    ColorWheelMultiIcon,
    FontColorDoubleIcon,
    ItalicIcon,
    MoreLeftIcon,
    NoColorDoubleIcon,
    OrderIcon,
    StrikethroughIcon,
    UnderlineIcon,
    UnorderIcon,
} from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { merge } from 'rxjs';
import {
    getStyleInTextRange,
    ResetInlineFormatTextColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import {
    BulletListCommand,
    OrderListCommand,
} from '../../commands/commands/list.command';
import { IEditorService } from '../../services/editor/editor-manager.service';

const COLOR_TOKENS = ['gray.900', 'red.500', 'yellow.500', 'green.500', 'blue.500'] as const;
const mobileButtonClassName = `
  univer-flex univer-min-w-0 univer-items-center univer-justify-center univer-rounded-lg univer-text-lg
  univer-text-gray-800 active:univer-scale-95 active:univer-bg-primary-100
  dark:!univer-text-gray-100 dark:active:!univer-bg-gray-700
`;
const activeButtonClassName = 'univer-bg-primary-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-400';

export interface IMobileRichTextToolbarProps {
    editorId: string;
    className?: string;
}

export function MobileRichTextToolbar({ editorId, className }: IMobileRichTextToolbarProps) {
    const commandService = useDependency(ICommandService);
    const editorService = useDependency(IEditorService);
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const [, setRevision] = useState(0);
    const [colorsVisible, setColorsVisible] = useState(false);

    useObservable(() => themeService.currentTheme$, undefined, false, [themeService]);
    const editor = editorService.getEditor(editorId);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setRevision((value) => value + 1));
        return () => cancelAnimationFrame(frame);
    }, [editorId, editorService]);

    useEffect(() => {
        if (!editor) return undefined;
        const subscription = merge(editor.input$, editor.selectionChange$).subscribe(() => setRevision((value) => value + 1));
        return () => subscription.unsubscribe();
    }, [editor]);

    const defaultTextColor = themeService.getColorFromTheme('gray.900');
    const state = resolveToolbarState(editor, defaultTextColor);
    const colors = COLOR_TOKENS.map((token) => themeService.getColorFromTheme(token));

    async function execute(commandId: string, params?: object) {
        const activeEditor = editorService.getEditor(editorId);
        if (editorService.getFocusId() !== editorId) {
            editorService.focus(editorId);
        } else {
            // Full-screen mobile editors can keep their editor id while the canvas focus is
            // recreated. Restore the real doc focus before applying a toolbar command.
            activeEditor?.focus();
        }

        if (activeEditor && activeEditor.getSelectionRanges().length === 0) {
            const end = Math.max(0, (activeEditor.getDocumentData().body?.dataStream.length ?? 2) - 2);
            activeEditor.setSelectionRanges([{ startOffset: end, endOffset: end }]);
        }
        await commandService.executeCommand(commandId, params);
        setRevision((value) => value + 1);
    }

    return (
        <div
            data-u-comp="mobile-rich-text-toolbar"
            className={clsx(`
              univer-box-border univer-bg-gray-0 univer-shadow-[0_1px_0_rgba(0,0,0,0.06)]
              dark:!univer-bg-gray-800
            `, className)}
            onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            {!colorsVisible
                ? (
                    <div className="univer-grid univer-h-11 univer-grid-cols-7 univer-gap-1 univer-px-2">
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.bold')} active={state.bold} icon={<BoldIcon />} onClick={() => execute(SetInlineFormatBoldCommand.id)} />
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.italic')} active={state.italic} icon={<ItalicIcon />} onClick={() => execute(SetInlineFormatItalicCommand.id)} />
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.underline')} active={state.underline} icon={<UnderlineIcon />} onClick={() => execute(SetInlineFormatUnderlineCommand.id)} />
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.strikethrough')} active={state.strike} icon={<StrikethroughIcon />} onClick={() => execute(SetInlineFormatStrikethroughCommand.id)} />
                        <button
                            type="button"
                            aria-label={localeService.t<LocaleKey>('docs-ui.toolbar.textColor.main')}
                            className={clsx(resetButtonClassName, mobileButtonClassName)}
                            onClick={() => setColorsVisible(true)}
                        >
                            <FontColorDoubleIcon className="univer-size-5" extend={{ colorChannel1: state.color }} />
                        </button>
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.unorder')} active={state.bulletList} icon={<UnorderIcon />} onClick={() => execute(BulletListCommand.id)} />
                        <FormatButton label={localeService.t<LocaleKey>('docs-ui.toolbar.order')} active={state.orderList} icon={<OrderIcon />} onClick={() => execute(OrderListCommand.id)} />
                    </div>
                )
                : (
                    <div
                        className="
                          univer-grid univer-h-11 univer-grid-cols-8 univer-items-center univer-gap-1 univer-px-2
                        "
                    >
                        <button
                            type="button"
                            aria-label={localeService.t<LocaleKey>('docs-ui.toolbar.textColor.main')}
                            className={clsx(resetButtonClassName, mobileButtonClassName, 'univer-size-9')}
                            onClick={() => setColorsVisible(false)}
                        >
                            <MoreLeftIcon className="univer-size-5" />
                        </button>
                        <button
                            type="button"
                            aria-label={localeService.t<LocaleKey>('docs-ui.toolbar.resetColor')}
                            className={clsx(resetButtonClassName, `
                              univer-flex univer-size-7 univer-items-center univer-justify-center
                              univer-justify-self-center univer-rounded-md univer-bg-gray-100 univer-text-xs
                              univer-text-gray-600
                              active:univer-scale-95
                              dark:!univer-bg-gray-700 dark:!univer-text-gray-200
                            `)}
                            onClick={() => execute(ResetInlineFormatTextColorCommand.id)}
                        >
                            <NoColorDoubleIcon className="univer-size-4" />
                        </button>
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                aria-label={`${localeService.t<LocaleKey>('docs-ui.toolbar.textColor.main')} ${color}`}
                                aria-pressed={state.color.toLowerCase() === color.toLowerCase()}
                                className={clsx(resetButtonClassName, `
                                  univer-size-7 univer-justify-self-center univer-rounded-md univer-border-2
                                  univer-border-solid
                                  active:univer-scale-95
                                `, state.color.toLowerCase() === color.toLowerCase()
                                    ? 'univer-border-primary-500'
                                    : 'univer-border-transparent')}
                                style={{ backgroundColor: color }}
                                onClick={() => execute(SetInlineFormatTextColorCommand.id, { value: color })}
                            />
                        ))}
                        <label
                            aria-label={localeService.t<LocaleKey>('docs-ui.toolbar.textColor.main')}
                            className={clsx(resetButtonClassName, `
                              univer-relative univer-flex univer-size-7 univer-items-center univer-justify-center
                              univer-justify-self-center univer-overflow-hidden univer-rounded-md univer-border-2
                              univer-border-solid univer-border-transparent
                              active:univer-scale-95
                            `)}
                        >
                            <ColorWheelMultiIcon className="univer-size-6" />
                            <input
                                aria-label={localeService.t<LocaleKey>('docs-ui.toolbar.textColor.main')}
                                className="
                                  univer-absolute univer-inset-0 univer-size-full univer-cursor-pointer univer-opacity-0
                                "
                                type="color"
                                defaultValue={defaultTextColor}
                                onChange={(event) => {
                                    execute(SetInlineFormatTextColorCommand.id, { value: event.target.value });
                                }}
                            />
                        </label>
                    </div>
                )}
        </div>
    );
}

function FormatButton(props: {
    label: string;
    active: boolean;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-label={props.label}
            aria-pressed={props.active}
            className={clsx(resetButtonClassName, mobileButtonClassName, props.active && activeButtonClassName)}
            onClick={props.onClick}
        >
            <span className="univer-flex univer-size-5 univer-items-center univer-justify-center">{props.icon}</span>
        </button>
    );
}

function resolveToolbarState(editor: Readonly<Nullable<Editor>>, defaultTextColor: string): {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    color: string;
    bulletList: boolean;
    orderList: boolean;
} {
    const body = editor?.getDocumentData().body;
    const ranges = editor?.getSelectionRanges() ?? [];
    const range = ranges.find((item) => item.isActive) ?? ranges[0];
    if (!body || !range) {
        return { bold: false, italic: false, underline: false, strike: false, color: defaultTextColor, bulletList: false, orderList: false };
    }

    const style: ITextStyle = getStyleInTextRange(body, range, {});
    const paragraphs = BuildTextUtils.range.getParagraphsInRanges([range], body.paragraphs ?? [], body.dataStream);
    const listTypes = paragraphs
        .map((paragraph) => paragraph.bullet?.listType)
        .filter((listType): listType is string => typeof listType === 'string');
    return {
        bold: style.bl === BooleanNumber.TRUE,
        italic: style.it === BooleanNumber.TRUE,
        underline: style.ul?.s === BooleanNumber.TRUE,
        strike: style.st?.s === BooleanNumber.TRUE,
        color: style.cl?.rgb ?? defaultTextColor,
        bulletList: Boolean(listTypes.length && listTypes.every((listType) => listType.startsWith(PresetListType.BULLET_LIST))),
        orderList: Boolean(listTypes.length && listTypes.every((listType) => listType.startsWith(PresetListType.ORDER_LIST))),
    };
}
