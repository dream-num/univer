import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ResizeDialog } from '../ResizeDialog';

describe('ResizeDialog', () => {
    test('renders correctly', () => {
        const { container } = render(
            <ResizeDialog>
                <div>test resize dialog</div>
            </ResizeDialog>
        );
        expect(container);
    });
});
