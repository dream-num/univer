import { describe, it } from 'vitest';
import { expectRemoveRowsOfFilterRowsResultMatchesSnapshot } from '../__testing__/test-remove-rows-of-filter-rows';

describe('Test remove rows', () => {
    it('of filter rows', async () => {
        await expectRemoveRowsOfFilterRowsResultMatchesSnapshot();
    });
});
