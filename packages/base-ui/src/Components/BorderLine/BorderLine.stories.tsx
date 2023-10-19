import type { Meta } from '@storybook/react';

import {
    BorderDashDot,
    BorderDashDotDot,
    BorderDashed,
    BorderDotted,
    BorderHair,
    BorderMedium,
    BorderMediumDashDot,
    BorderMediumDashDotDot,
    BorderMediumDashed,
    BorderThick,
    BorderThin,
} from './BorderLine';

const meta: Meta = {
    title: 'Components / BorderLine',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <section style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
                <code>BorderDashDot</code>
                <BorderDashDot />

                <code>BorderDashDotDot</code>
                <BorderDashDotDot />

                <code>BorderDashed</code>
                <BorderDashed />

                <code>BorderDotted</code>
                <BorderDotted />

                <code>BorderHair</code>
                <BorderHair />

                <code>BorderMedium</code>
                <BorderMedium />

                <code>BorderMediumDashDot</code>
                <BorderMediumDashDot />

                <code>BorderMediumDashDotDot</code>
                <BorderMediumDashDotDot />

                <code>BorderMediumDashed</code>
                <BorderMediumDashed />

                <code>BorderThick</code>
                <BorderThick />

                <code>BorderThin</code>
                <BorderThin />
            </section>
        );
    },
};
