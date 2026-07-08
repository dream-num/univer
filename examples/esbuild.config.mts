import type { Plugin, PluginBuild } from 'esbuild';
import process from 'node:process';
import detect from 'detect-port';
import esbuild from 'esbuild';
import minimist from 'minimist';
import { createBuildConfig } from './scripts/esbuild/build-config.mts';
import { nodeBuildTask } from './scripts/esbuild/build-tasks.mts';
import { createLogger, formatDuration } from './scripts/esbuild/logger.mts';

const args = minimist(process.argv.slice(2));
const isE2E = !!args.e2e;

const logger = createLogger();

function createWatchStatusPlugin() {
    let serverUrl: string | null = null;
    let hasSuccessfulBuild = false;
    let lastBuildFailed = false;
    let buildStartedAt = 0;

    return {
        plugin: {
            name: 'watch-status',
            setup(build: PluginBuild) {
                build.onStart(() => {
                    buildStartedAt = Date.now();
                });

                build.onEnd((result) => {
                    const duration = formatDuration(Math.max(Date.now() - buildStartedAt, 0));

                    if (result.errors.length > 0) {
                        lastBuildFailed = true;
                        logger.error(`Build failed in ${duration} with ${result.errors.length} error(s). Waiting for changes...`);
                        return;
                    }

                    if (lastBuildFailed) {
                        lastBuildFailed = false;
                        hasSuccessfulBuild = true;
                        logger.recover(
                            serverUrl
                                ? `Build recovered in ${duration}. Local server: ${logger.url(serverUrl)}`
                                : `Build recovered in ${duration}.`
                        );
                        return;
                    }

                    if (!hasSuccessfulBuild) {
                        hasSuccessfulBuild = true;
                        logger.watch(`Initial build completed in ${duration}. Watching for changes...`);
                        return;
                    }

                    logger.watch(`Rebuilt in ${duration}.`);
                });
            },
        } satisfies Plugin,
        setServerUrl(url: string) {
            serverUrl = url;
        },
    };
}

/**
 * Build the project
 */
async function main() {
    if (args.watch) {
        logger.info('Starting examples dev server...');
    }

    const config = await createBuildConfig({
        watch: !!args.watch,
        e2e: isE2E,
        all: !!args.all,
    });

    if (args.watch) {
        const watchStatus = createWatchStatusPlugin();
        config.plugins?.push(watchStatus.plugin);

        const ctx = await esbuild.context(config);
        await nodeBuildTask();
        await ctx.watch();

        const port = isE2E ? 3000 : await detect(3002);
        await ctx.serve({
            servedir: './local',
            port,
        });

        const url = `http://localhost:${port}`;
        watchStatus.setServerUrl(url);
        logger.ready(`Local server: ${logger.url(url)}`);
        logger.muted('Watching for file changes. Press Ctrl+C to stop.');
    } else {
        await esbuild.build(config);
    }
}

main().catch((error: unknown) => {
    logger.error('Examples build exited unexpectedly.');
    console.error(error);
    process.exitCode = 1;
});
