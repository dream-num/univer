import type { Meta, StoryObj } from '@storybook/react';
import { LocaleService, ThemeService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';

import { zhCN } from '../../locale';
import type { ISheetNumfmtPanelProps } from '../index';
import { SheetNumfmtPanel } from '../index';

const Index = (props: any) => {
    const inject = useMemo(() => new Injector([[LocaleService], [ThemeService]]), []);
    const Wrap = useMemo(() => connectInjector(SheetNumfmtPanel, inject), []) as any;

    useMemo(() => {
        const localeService = inject.get(LocaleService);
        localeService.load({ zhCN });
    }, []);

    return <Wrap {...props} />;
};
const meta: Meta = {
    title: 'numfmt',
    component: Index,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

export const Test: StoryObj<ISheetNumfmtPanelProps> = {
    args: {
        value: { defaultPattern: '', defaultValue: 123123, row: 2, col: 3 },
        onChange(pattern) {
            console.log(pattern);
        },
    },
};
