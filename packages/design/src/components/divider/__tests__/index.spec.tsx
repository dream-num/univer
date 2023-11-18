import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Divider } from '../Divider';

describe('Divider', () => {
    test('should display initial Divider', () => {
        const { container } = render(<Divider></Divider>);

        const $div = container.querySelector('div')!;

        expect($div.style.width).toMatch('1px');
    });
});
