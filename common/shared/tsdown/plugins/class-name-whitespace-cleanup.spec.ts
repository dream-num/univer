import { describe, expect, it } from 'vitest';
import { cleanupClassNameTemplateWhitespace } from './class-name-whitespace-cleanup';

describe('cleanupClassNameTemplateWhitespace', () => {
    it('should normalize whitespace for clsx template arguments', () => {
        const sourceCode = `
            const value = clsx(\`
              univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center
              univer-justify-self-center univer-rounded
              hover:univer-bg-gray-100
              dark:hover:!univer-bg-gray-700
            \`, {
                active: true,
            });
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'clsx("univer-flex univer-size-6 univer-cursor-pointer univer-items-center univer-justify-center univer-justify-self-center univer-rounded hover:univer-bg-gray-100 dark:hover:!univer-bg-gray-700", {'
        );
    });

    it('should normalize whitespace for conditional clsx template arguments', () => {
        const sourceCode = `
            const value = clsx(
                "univer-relative univer-transition-all univer-duration-150",
                isDraggingItem && "univer-opacity-0",
                dragOverId === itemId && !isDraggingItem && \`
                  univer-bg-primary-50/60
                  dark:!univer-bg-primary-900/20
                  univer-rounded univer-border univer-border-primary-200
                  dark:!univer-border-primary-700
                \`
            );
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'dragOverId === itemId && !isDraggingItem && "univer-bg-primary-50/60 dark:!univer-bg-primary-900/20 univer-rounded univer-border univer-border-primary-200 dark:!univer-border-primary-700"'
        );
    });

    it('should normalize whitespace for className template literals', () => {
        const sourceCode = `
            const value = (
                <div
                    className={\`
                      univer-box-border univer-grid univer-grid-cols-5 univer-gap-2 univer-text-gray-600
                      dark:!univer-text-gray-200
                    \`}
                />
            );
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'className={"univer-box-border univer-grid univer-grid-cols-5 univer-gap-2 univer-text-gray-600 dark:!univer-text-gray-200"}'
        );
    });

    it('should normalize whitespace for className string literals', () => {
        const sourceCode = `
            const value = (
                <button
                    className="
                      univer-flex univer-cursor-pointer univer-items-center univer-justify-center
                      univer-border-none
                      hover:univer-opacity-70
                    "
                />
            );
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx')).toContain(
            'className="univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-border-none hover:univer-opacity-70"'
        );
    });

    it('should normalize whitespace for compiled className properties', () => {
        const sourceCode = `
            jsx("button", {
                className: "\\n                  univer-flex univer-cursor-pointer univer-items-center univer-justify-center\\n                  univer-border-none\\n                  hover:univer-opacity-70\\n                ",
                type: "button",
            });
        `;

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.js')).toContain(
            'className: "univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-border-none hover:univer-opacity-70"'
        );
    });

    it('should normalize whitespace inside cva definitions', () => {
        const sourceCode = `
            const buttonVariants = cva(
                \`
                  univer-box-border univer-inline-flex univer-cursor-pointer
                  disabled:univer-pointer-events-none
                \`,
                {
                    variants: {
                        variant: {
                            primary: \`
                              univer-border-primary-600 univer-bg-primary-600 univer-text-white
                              hover:univer-bg-primary-500
                            \`,
                        },
                    },
                    compoundVariants: [{
                        className: \`
                          univer-gap-1 univer-rounded
                          dark:!univer-bg-gray-700
                        \`,
                    }],
                }
            );
        `;

        const cleanedCode = cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.tsx');

        expect(cleanedCode).toContain(
            'cva(\n                "univer-box-border univer-inline-flex univer-cursor-pointer disabled:univer-pointer-events-none",'
        );
        expect(cleanedCode).toContain(
            'primary: "univer-border-primary-600 univer-bg-primary-600 univer-text-white hover:univer-bg-primary-500"'
        );
        expect(cleanedCode).toContain(
            'className: "univer-gap-1 univer-rounded dark:!univer-bg-gray-700"'
        );
    });

    it('should not touch unrelated template literals', () => {
        const sourceCode = 'const message = ` hello\\n  world `;';

        expect(cleanupClassNameTemplateWhitespace(sourceCode, '/tmp/example.ts')).toBe(sourceCode);
    });
});
