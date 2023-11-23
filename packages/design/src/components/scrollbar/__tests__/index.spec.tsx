import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Scrollbar } from '../Scrollbar';

describe('Scrollbar', () => {
    test('should not render thumb', () => {
        const { container } = render(
            <section style={{ height: '100px' }}>
                <Scrollbar>
                    <div>foo</div>
                    <div>foo</div>
                </Scrollbar>
            </section>
        );

        const scrollbar = container.querySelector('[role=scrollbar]');

        console.log(scrollbar?.innerHTML);

        expect(scrollbar).toBeNull();
    });
});
