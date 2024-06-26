import { IRange } from '@univerjs/core';

import { afterAll, describe, expect, it } from 'vitest';
import { BranchCoverage, setEndForRange } from '../selection-utils';

describe('test setEndForRange function', () => {
    const range: IRange = {
      startRow: 0,
      startColumn: 0,
      endRow: 0,
      endColumn: 0,
    };

    afterAll(() => {
      BranchCoverage.coverage.printCoverage();
    });

  describe('test correct run', () => {
    it('correct situation: ', () => {
      expect(setEndForRange(range, 1, 1) == range);
    });
  });

  describe('test with NaN startRow', () => {
    it('correct situation: ', () => {
      const testRange: IRange = {
        startRow: NaN,
        startColumn: 0,
        endRow: 0,
        endColumn: 0,
      };

      expect(setEndForRange(testRange, 1, 1) == range);
    });
  });

  describe('test with NaN endRow', () => {
    it('correct situation: ', () => {
      const testRange: IRange = {
        startRow: 0,
        startColumn: 0,
        endRow: NaN,
        endColumn: 0,
      };

      expect(setEndForRange(testRange, 1, 1) == range);
    });
  });

  describe('test with NaN startColumn', () => {
    it('correct situation: ', () => {
      const testRange: IRange = {
        startRow: 0,
        startColumn: NaN,
        endRow: 0,
        endColumn: 0,
      };

      expect(setEndForRange(testRange, 1, 1) == range);
    });
  });

  describe('test with NaN endColumn', () => {
    it('correct situation: ', () => {
      const testRange: IRange = {
        startRow: 0,
        startColumn: 0,
        endRow: 0,
        endColumn: NaN,
      };

      expect(setEndForRange(testRange, 1, 1) == range);
    });
  });
});
