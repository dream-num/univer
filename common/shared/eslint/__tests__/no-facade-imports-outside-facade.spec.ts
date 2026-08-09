import type { Rule } from 'eslint';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import rule from '../plugins/no-facade-imports-outside-facade';

function runRule(cwd: string, filename: string): Rule.ReportDescriptor[] {
    const reports: Rule.ReportDescriptor[] = [];
    const context = {
        cwd,
        filename,
        options: [],
        report: vi.fn((descriptor: Rule.ReportDescriptor) => reports.push(descriptor)),
    } as unknown as Rule.RuleContext;
    const listeners = rule.create(context);

    listeners.ImportDeclaration?.({
        source: { value: '@univerjs/core/facade' },
    } as never);

    return reports;
}

describe('no-facade-imports-outside-facade', () => {
    const cwd = path.join('/workspace', 'parent', 'packages', 'univer');

    it('does not treat a parent packages directory as repository package source', () => {
        expect(runRule(cwd, path.join(cwd, 'examples/src/demo/main.ts'))).toHaveLength(0);
    });

    it('still rejects facade imports from repository packages', () => {
        expect(runRule(cwd, path.join(cwd, 'packages/core/src/main.ts'))).toHaveLength(1);
    });
});
