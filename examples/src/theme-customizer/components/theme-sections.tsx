import type { Theme } from '@univerjs/themes';
import type { ReactNode } from 'react';
import type { LoopColorKey, ThemeGrayEndpointKey, ThemeScaleKey, ThemeShadeKey } from '../types';
import { Button, clsx, ColorPicker, Dropdown, FormLayout, Input, Select, Textarea } from '@univerjs/design';
import { useEffect, useState } from 'react';
import { COLOR_SHADE_KEYS, LOOP_COLOR_KEYS, LOOP_COLOR_OPTIONS } from '../constants';
import { normalizeHexColor } from '../theme-utils';

export function ThemeCodeBlock({ children }: { children: ReactNode }) {
    return (
        <pre
            className={clsx(`
              univer-m-0 univer-overflow-x-auto univer-rounded-xl univer-bg-slate-950 univer-p-4 univer-font-mono
              univer-text-xs univer-leading-6 univer-text-slate-100
            `)}
        >
            {children}
        </pre>
    );
}

export function ThemeColorField(props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const { label, value, onChange } = props;
    const [draftValue, setDraftValue] = useState(value);

    useEffect(() => {
        setDraftValue(value);
    }, [value]);

    const error = draftValue.trim().length > 0 && !normalizeHexColor(draftValue) ? 'Enter a valid HEX value, for example #466AF7.' : undefined;

    function handleInputChange(nextValue: string) {
        setDraftValue(nextValue);

        const normalizedValue = normalizeHexColor(nextValue);

        if (normalizedValue) {
            onChange(normalizedValue);
        }
    }

    function handleBlur() {
        const normalizedValue = normalizeHexColor(draftValue);
        setDraftValue(normalizedValue ?? value);
    }

    return (
        <FormLayout label={label} error={error} className="univer-mb-0">
            <Input
                value={draftValue}
                onBlur={handleBlur}
                onChange={handleInputChange}
                placeholder="#000000"
                slot={(
                    <Dropdown
                        align="end"
                        side="bottom"
                        overlay={(
                            <div className="univer-p-2">
                                <ColorPicker
                                    value={value}
                                    onChange={(nextValue) => {
                                        const normalizedValue = normalizeHexColor(nextValue);

                                        if (normalizedValue) {
                                            setDraftValue(normalizedValue);
                                            onChange(normalizedValue);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    >
                        <button
                            type="button"
                            aria-label={`Choose ${label} color`}
                            className={clsx(`
                              univer-size-5 univer-cursor-pointer univer-rounded-full univer-border univer-border-solid
                              univer-border-slate-300 univer-bg-transparent univer-p-0
                              focus:univer-outline-none focus:univer-ring-2 focus:univer-ring-primary-50
                            `)}
                            style={{ backgroundColor: value }}
                        />
                    </Dropdown>
                )}
            />
        </FormLayout>
    );
}

export function ThemeScaleSection(props: {
    title: string;
    scale: ThemeScaleKey;
    theme: Theme;
    defaultExpanded?: boolean;
    onChange: (scale: ThemeScaleKey, shade: ThemeShadeKey, value: string) => void;
}) {
    const { title, scale, theme, defaultExpanded = false, onChange } = props;
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <section
            className={clsx(`
              univer-rounded-2xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            `)}
        >
            <button
                type="button"
                className={clsx(`
                  univer-flex univer-w-full univer-items-center univer-justify-between univer-border-none
                  univer-bg-transparent univer-px-4 univer-py-3 univer-text-left
                `)}
                onClick={() => setExpanded((value) => !value)}
            >
                <div>
                    <div
                        className="
                          univer-text-sm univer-font-semibold univer-text-slate-900
                          dark:!univer-text-gray-0
                        "
                    >
                        {title}
                    </div>
                    <div
                        className="
                          univer-mt-1 univer-text-xs univer-text-slate-500
                          dark:!univer-text-gray-300
                        "
                    >
                        {scale}
                        .500
                        {' = '}
                        {theme[scale][500]}
                    </div>
                </div>
                <div className="univer-flex univer-items-center univer-gap-2">
                    <span
                        className="
                          univer-inline-flex univer-size-6 univer-rounded-full univer-border univer-border-solid
                          univer-border-slate-200
                        "
                        style={{ backgroundColor: theme[scale][500] }}
                    />
                    <span
                        className="
                          univer-text-xs univer-text-slate-500
                          dark:!univer-text-gray-300
                        "
                    >
                        {expanded ? 'Collapse' : 'Expand'}
                    </span>
                </div>
            </button>

            {expanded && (
                <div
                    className="
                      univer-grid univer-gap-3 univer-p-4
                      sm:univer-grid-cols-2
                    "
                >
                    {COLOR_SHADE_KEYS.map((shade) => (
                        <ThemeColorField
                            key={shade}
                            label={shade}
                            value={theme[scale][shade]}
                            onChange={(value) => onChange(scale, shade, value)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export function ThemeGrayEndpointsSection(props: {
    theme: Theme;
    onChange: (key: ThemeGrayEndpointKey, value: string) => void;
}) {
    const { theme, onChange } = props;

    return (
        <section
            className={clsx(`
              univer-rounded-2xl univer-bg-gray-0 univer-p-4
              dark:!univer-bg-gray-800
            `)}
        >
            <div
                className="
                  univer-mb-3 univer-text-sm univer-font-semibold univer-text-slate-900
                  dark:!univer-text-gray-0
                "
            >
                Gray Endpoints
            </div>
            <div
                className="
                  univer-grid univer-gap-3
                  sm:univer-grid-cols-2
                "
            >
                <ThemeColorField label="gray.0" value={theme.gray[0]} onChange={(value) => onChange('0', value)} />
                <ThemeColorField label="gray.1000" value={theme.gray[1000]} onChange={(value) => onChange('1000', value)} />
            </div>
        </section>
    );
}

export function ThemeLoopColorSection(props: {
    theme: Theme;
    onChange: (key: LoopColorKey, value: string) => void;
}) {
    const { theme, onChange } = props;

    return (
        <section
            className={clsx(`
              univer-rounded-2xl univer-bg-gray-0 univer-p-4
              dark:!univer-bg-gray-800
            `)}
        >
            <div
                className="
                  univer-mb-3 univer-text-sm univer-font-semibold univer-text-slate-900
                  dark:!univer-text-gray-0
                "
            >
                loop-color
            </div>
            <div
                className="
                  univer-grid univer-gap-3
                  sm:univer-grid-cols-2
                "
            >
                {LOOP_COLOR_KEYS.map((key) => (
                    <FormLayout key={key} label={key} className="univer-mb-0">
                        <Select
                            value={(theme['loop-color'] as Record<string, string>)[key]}
                            options={LOOP_COLOR_OPTIONS}
                            onChange={(value) => onChange(key, value)}
                        />
                    </FormLayout>
                ))}
            </div>
        </section>
    );
}

export function IntegrationExampleSection(props: {
    copyLabel: string;
    onCopy: () => void;
}) {
    const { copyLabel, onCopy } = props;

    return (
        <section
            className={clsx(`
              univer-rounded-2xl univer-bg-slate-50 univer-p-4
              dark:!univer-bg-gray-800
            `)}
        >
            <div className="univer-mb-3 univer-flex univer-items-center univer-justify-between">
                <div
                    className="
                      univer-text-sm univer-font-semibold univer-text-slate-900
                      dark:!univer-text-gray-0
                    "
                >
                    Integration Example
                </div>
                <Button size="middle" onClick={onCopy}>
                    {copyLabel}
                </Button>
            </div>

            <ThemeCodeBlock>
                {`import { Univer } from '@univerjs/core';
import { customTheme } from './custom-theme';

const univer = new Univer({
    theme: customTheme,
    locale: LocaleType.EN_US,
});`}
            </ThemeCodeBlock>
        </section>
    );
}

export function JsonEditorPanel(props: {
    copyLabel: string;
    jsonDraft: string;
    jsonError: string | null;
    onCopy: () => void;
    onFormatCurrent: () => void;
    onJsonChange: (value: string) => void;
    onSyncCurrent: () => void;
    onViewDefault: () => void;
}) {
    const { copyLabel, jsonDraft, jsonError, onCopy, onFormatCurrent, onJsonChange, onSyncCurrent, onViewDefault } = props;

    return (
        <section
            className={clsx(`
              univer-rounded-2xl univer-bg-slate-50 univer-p-4
              dark:!univer-bg-gray-800
            `)}
        >
            <div className="univer-flex univer-flex-wrap univer-items-center univer-justify-between univer-gap-3">
                <div>
                    <div
                        className="
                          univer-text-sm univer-font-semibold univer-text-slate-900
                          dark:!univer-text-gray-0
                        "
                    >
                        Theme JSON
                    </div>
                    <p
                        className="
                          univer-m-0 univer-mt-1 univer-text-xs univer-leading-5 univer-text-slate-500
                          dark:!univer-text-gray-300
                        "
                    >
                        A valid JSON patch is merged and applied to the running `ThemeService` immediately.
                    </p>
                </div>

                <div className="univer-flex univer-flex-wrap univer-gap-2">
                    <Button size="middle" onClick={onSyncCurrent}>
                        Sync Current Theme
                    </Button>
                    <Button size="middle" onClick={onViewDefault}>
                        View Default
                    </Button>
                    <Button size="middle" onClick={onCopy}>
                        {copyLabel}
                    </Button>
                </div>
            </div>

            <div className="univer-mt-4">
                <Textarea
                    value={jsonDraft}
                    spellCheck={false}
                    className={clsx(`
                      univer-h-[640px] univer-rounded-2xl univer-bg-slate-950 univer-p-4 univer-font-mono univer-text-sm
                      univer-leading-6 univer-text-slate-100
                    `, jsonError ? 'univer-border-red-500' : 'univer-border-slate-700')}
                    style={{
                        color: '#E2E8F0',
                        backgroundColor: '#020617',
                        caretColor: '#F8FAFC',
                    }}
                    onValueChange={onJsonChange}
                />
                <div
                    className="
                      univer-mt-3 univer-flex univer-flex-wrap univer-items-center univer-justify-between univer-gap-3
                    "
                >
                    <div
                        className={clsx('univer-text-xs univer-leading-5', jsonError
                            ? 'univer-text-red-500'
                            : `
                              univer-text-slate-500
                              dark:!univer-text-gray-300
                            `)}
                    >
                        {jsonError}
                    </div>
                    <Button size="middle" variant="primary" onClick={onFormatCurrent}>
                        Format Current Result
                    </Button>
                </div>
            </div>
        </section>
    );
}
