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

import { cva, Tooltip } from '@univerjs/design';

export type TinyMenuSizeVariant = 'default' | 'paragraph-t';
export type TinyMenuLayoutVariant = 'default' | 'compact';
type TinyMenuVariant = 'default' | 'paragraphT' | 'compactParagraph';

interface ITinyMenuItem {
    onClick: () => void;
    className: string;
    Icon: any;
    iconClassName?: string;
    key: string;
    active?: boolean;
    tooltip?: string;
}

interface ITinyMenuGroupProps {
    items: ITinyMenuItem[];
    columns?: number;
    sizeVariant?: TinyMenuSizeVariant;
    layoutVariant?: TinyMenuLayoutVariant;
    hoverSuppressed?: boolean;
}

const tinyMenuGroupVariants = cva('univer-menu-item-group univer-px-0', {
    variants: {
        variant: {
            default: 'univer-gap-1.5 univer-p-0.5',
            paragraphT: 'univer-gap-2 univer-p-1',
            compactParagraph: 'univer-gap-0.5 univer-p-0',
        },
        layout: {
            grid: 'univer-grid',
            wrap: 'univer-flex univer-flex-wrap',
        },
        columnsSix: {
            true: 'univer-grid-cols-6',
            false: '',
        },
    },
    compoundVariants: [
        {
            variant: 'compactParagraph',
            layout: 'grid',
            class: 'univer-justify-items-start',
        },
        {
            variant: ['default', 'paragraphT'],
            layout: 'grid',
            class: 'univer-justify-items-center',
        },
    ],
    defaultVariants: {
        variant: 'default',
        layout: 'wrap',
        columnsSix: false,
    },
});

const tinyMenuButtonVariants = cva(
    `
      univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-border-none
      univer-bg-transparent univer-p-0
      focus:univer-bg-gray-50 focus:univer-outline-none
      dark:focus:!univer-bg-gray-900
    `,
    {
        variants: {
            variant: {
                default: 'univer-size-6 univer-rounded-md',
                paragraphT: 'univer-size-8 univer-rounded-lg',
                compactParagraph: 'univer-size-6 univer-rounded-sm',
            },
            hoverSuppressed: {
                true: '',
                false: `
                  hover:univer-bg-gray-50
                  dark:hover:!univer-bg-gray-900
                `,
            },
            active: {
                true: `
                  univer-bg-gray-50
                  dark:!univer-bg-gray-900
                `,
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            hoverSuppressed: false,
            active: false,
        },
    }
);

const tinyMenuIconVariants = cva(
    `
      univer-text-gray-900
      dark:!univer-text-gray-200
    `,
    {
        variants: {
            variant: {
                default: 'univer-size-4',
                paragraphT: 'univer-size-5',
                compactParagraph: 'univer-size-5',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

function getTinyMenuVariant(sizeVariant: TinyMenuSizeVariant, layoutVariant: TinyMenuLayoutVariant): TinyMenuVariant {
    if (sizeVariant === 'paragraph-t' && layoutVariant === 'compact') {
        return 'compactParagraph';
    }

    if (sizeVariant === 'paragraph-t') {
        return 'paragraphT';
    }

    return 'default';
}

function getTinyMenuGridTemplateColumns(columns: number | undefined, variant: TinyMenuVariant) {
    if (!columns || (columns === 6 && variant !== 'compactParagraph')) {
        return undefined;
    }

    return `repeat(${columns}, max-content)`;
}

export function DesignTinyMenuGroup({
    items,
    columns,
    sizeVariant = 'default',
    layoutVariant = 'default',
    hoverSuppressed = false,
}: ITinyMenuGroupProps) {
    const variant = getTinyMenuVariant(sizeVariant, layoutVariant);
    const isParagraphTVariant = variant !== 'default';
    const gridTemplateColumns = getTinyMenuGridTemplateColumns(columns, variant);

    return (
        <div
            className={tinyMenuGroupVariants({
                variant,
                layout: columns ? 'grid' : 'wrap',
                columnsSix: columns === 6 && variant !== 'compactParagraph',
            })}
            style={gridTemplateColumns
                ? { gridTemplateColumns }
                : undefined}
        >
            {items.map((item) => {
                const showTooltip = !isParagraphTVariant && item.tooltip;
                const ele = (
                    <button
                        key={item.key}
                        type="button"
                        aria-label={item.tooltip ?? item.key}
                        title={showTooltip ? item.tooltip : undefined}
                        className={tinyMenuButtonVariants({
                            variant,
                            hoverSuppressed,
                            active: item.active,
                            className: item.className,
                        })}
                        onClick={() => item.onClick()}
                    >
                        <item.Icon
                            className={tinyMenuIconVariants({
                                variant,
                                className: item.iconClassName,
                            })}
                            extend={{ colorChannel1: 'var(--univer-primary-600)' }}
                        />
                    </button>
                );
                return showTooltip
                    ? (
                        <Tooltip key={item.key} title={item.tooltip}>
                            {ele}
                        </Tooltip>
                    )
                    : ele;
            })}
        </div>
    );
}
