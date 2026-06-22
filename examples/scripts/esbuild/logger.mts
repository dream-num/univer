import process from 'node:process';

const supportsColor = !!process.stdout.isTTY && process.env.NO_COLOR == null;

const ansi = {
    reset: '\x1B[0m',
    bold: '\x1B[1m',
    dim: '\x1B[2m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    cyan: '\x1B[36m',
    gray: '\x1B[90m',
    underline: '\x1B[4m',
} as const;

type TLogLevel = 'error' | 'info' | 'ready' | 'recover' | 'watch';

const levelStyleMap: Record<TLogLevel, string[]> = {
    error: [ansi.bold, ansi.red],
    info: [ansi.bold, ansi.blue],
    ready: [ansi.bold, ansi.green],
    recover: [ansi.bold, ansi.cyan],
    watch: [ansi.bold, ansi.yellow],
};

function colorize(text: string, styles: string[]) {
    if (!supportsColor || styles.length === 0) {
        return text;
    }
    return `${styles.join('')}${text}${ansi.reset}`;
}

function formatLabel(level: TLogLevel) {
    return colorize(`[${level}]`, levelStyleMap[level]);
}

export function formatDuration(durationMs: number) {
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }
    return `${(durationMs / 1000).toFixed(durationMs < 10_000 ? 1 : 0)}s`;
}

export function createLogger() {
    function write(level: TLogLevel, message: string, method: 'error' | 'log' = 'log') {
        console[method](`${formatLabel(level)} ${message}`);
    }

    return {
        error(message: string) {
            write('error', message, 'error');
        },
        info(message: string) {
            write('info', message);
        },
        ready(message: string) {
            write('ready', message);
        },
        recover(message: string) {
            write('recover', message);
        },
        watch(message: string) {
            write('watch', message);
        },
        muted(message: string) {
            console.log(colorize(message, [ansi.dim, ansi.gray]));
        },
        url(url: string) {
            return colorize(url, [ansi.bold, ansi.underline, ansi.cyan]);
        },
    };
}
