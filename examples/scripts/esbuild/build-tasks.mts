import esbuild from 'esbuild';
import cleanPlugin from 'esbuild-plugin-clean';

export function monacoBuildTask() {
    const monacoEditorEntryPoints = [
        'vs/language/json/json.worker.js',
        'vs/language/css/css.worker.js',
        'vs/language/html/html.worker.js',
        'vs/language/typescript/ts.worker.js',
        'vs/editor/editor.worker.js',
    ];

    return esbuild.build({
        entryPoints: monacoEditorEntryPoints.map((entry) => `./node_modules/monaco-editor/esm/${entry}`),
        bundle: true,
        color: true,
        target: 'chrome70',
        format: 'iife',
        outbase: './node_modules/monaco-editor/esm/',
        outdir: './local',
        plugins: [
            cleanPlugin({
                patterns: ['./local'],
            }),
        ],
    });
}

export function nodeBuildTask() {
    return esbuild.build({
        bundle: true,
        color: true,
        minify: false,
        target: 'chrome70',
        entryPoints: [
            './src/node/cases/basic.ts',
            './src/node/sdk/worker.ts',
        ],
        platform: 'node',
        outdir: './dist',
        define: {
            'process.env.NODE_ENV': '"production"',
        },
    });
}
