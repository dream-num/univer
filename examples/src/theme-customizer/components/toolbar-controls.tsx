import type { ReactNode } from 'react';
import { clsx } from '@univerjs/design';

export function ToolbarField(props: { label: string; children: ReactNode }) {
    const { label, children } = props;

    return (
        <div className="univer-inline-flex univer-items-center univer-gap-2">
            <div
                className="
                  univer-shrink-0 univer-text-[11px] univer-font-medium univer-uppercase univer-tracking-[0.06em]
                  univer-text-slate-500
                  dark:!univer-text-gray-400
                "
            >
                {label}
            </div>
            {children}
        </div>
    );
}

export function ToolbarToggleGroup(props: {
    items: Array<{ label: string; value: string }>;
    value: string;
    onChange: (value: string) => void;
}) {
    const { items, value, onChange } = props;

    return (
        <div className="univer-inline-flex univer-items-center univer-gap-1">
            {items.map((item) => {
                const active = item.value === value;

                return (
                    <button
                        key={item.value}
                        type="button"
                        className={clsx(`
                          univer-cursor-pointer univer-rounded-md univer-border-none univer-bg-transparent univer-px-2.5
                          univer-py-1 univer-text-sm univer-font-medium univer-transition-colors
                        `, active
                            ? ''
                            : `
                              univer-text-slate-600
                              hover:univer-bg-slate-100 hover:univer-text-slate-900
                              dark:!univer-text-gray-300
                              dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-white
                            `)}
                        style={active
                            ? {
                                backgroundColor: 'var(--univer-primary-600)',
                                color: '#FFFFFF',
                            }
                            : undefined}
                        onClick={() => onChange(item.value)}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
