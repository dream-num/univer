import type { PathLike } from 'node:fs';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { discoverUniverUiLocales } from '@univerjs-infra/shared/locale';

interface IEmojiItem {
    emoji: string;
    title: string;
}

interface ICldrAnnotationsData {
    annotations?: {
        annotations?: Record<string, {
            default?: string[];
            tts?: string[];
        }>;
    };
    annotationsDerived?: {
        annotations?: Record<string, {
            default?: string[];
            tts?: string[];
        }>;
    };
}

interface IGeneratedEmojiLocale {
    emojiSearchIndex: Record<string, string>;
    emojiTitles: Record<string, string>;
}

type EmojiCategory = 'people' | 'nature' | 'foods' | 'activity' | 'places' | 'objects' | 'symbols';
type EmojiGroups = Record<'frequent' | EmojiCategory, IEmojiItem[]>;
type UnicodeEmojiGroup =
    | 'Activities'
    | 'Animals & Nature'
    | 'Flags'
    | 'Food & Drink'
    | 'Objects'
    | 'People & Body'
    | 'Smileys & Emotion'
    | 'Symbols'
    | 'Travel & Places';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const outputPath = path.resolve(__dirname, '../src/views/emoji-picker/emojis.generated.ts');
const emojiLocaleOutputDir = path.resolve(__dirname, '../src/locale/emoji-locale');
const unicodeEmojiTestUrl = 'https://www.unicode.org/Public/17.0.0/emoji/emoji-test.txt';
const cldrJsonVersion = '48.2.0';
const cldrJsonBaseUrl = `https://cdn.jsdelivr.net/gh/unicode-org/cldr-json@${cldrJsonVersion}/cldr-json`;
const cldrJsonDownloadConcurrency = 4;
const envProxyNodeArg = '--use-env-proxy';
const envProxyRelaunchEnv = 'UNIVER_UI_EMOJI_ENV_PROXY_REEXEC';
const emojiCategories: EmojiCategory[] = ['people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols'];
const cldrLocaleMap: Record<string, string> = {
    'ar-SA': 'ar',
    'ca-ES': 'ca',
    'de-DE': 'de',
    'en-US': 'en',
    'es-ES': 'es',
    'fa-IR': 'fa',
    'fr-FR': 'fr',
    'id-ID': 'id',
    'it-IT': 'it',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'pl-PL': 'pl',
    'pt-BR': 'pt',
    'ru-RU': 'ru',
    'sk-SK': 'sk',
    'vi-VN': 'vi',
    'zh-CN': 'zh',
    'zh-HK': 'zh-Hant-HK',
    'zh-TW': 'zh-Hant',
};
const localeFiles = discoverUniverUiLocales({ rootDir: root }).map((locale) => {
    const cldrLocale = cldrLocaleMap[locale];
    if (!cldrLocale) {
        throw new Error(`Missing CLDR locale mapping for ${locale}`);
    }

    return [locale, cldrLocale] as const;
});
const frequentEmojis = [
    '👍',
    '😀',
    '😘',
    '😍',
    '😆',
    '😜',
    '😅',
    '😂',
    '😱',
    '😞',
    '😒',
];

const groupCategoryMap: Partial<Record<UnicodeEmojiGroup, EmojiCategory>> = {
    Activities: 'activity',
    'Animals & Nature': 'nature',
    'Food & Drink': 'foods',
    Objects: 'objects',
    'People & Body': 'people',
    'Smileys & Emotion': 'people',
    Symbols: 'symbols',
    'Travel & Places': 'places',
};

export function buildEmojisFromEmojiTest(emojiTest: string, options: { supportedEmojis?: Set<string> } = {}): EmojiGroups {
    const groups = createEmptyEmojiGroups();
    let currentGroup: UnicodeEmojiGroup | null = null;
    const titleByEmoji = new Map<string, string>();

    emojiTest.split(/\r?\n/).forEach((line) => {
        const group = line.match(/^# group: (.+)$/);
        if (group) {
            currentGroup = group[1] as UnicodeEmojiGroup;
            return;
        }

        const category = currentGroup ? groupCategoryMap[currentGroup] : undefined;
        if (!category) {
            return;
        }

        const item = parseEmojiTestLine(line);
        if (!item || (options.supportedEmojis && !options.supportedEmojis.has(item.emoji))) {
            return;
        }

        titleByEmoji.set(item.emoji, item.title);
        groups[category].push(item);
    });

    groups.frequent = frequentEmojis
        .map((emoji) => {
            const title = titleByEmoji.get(emoji);
            return title ? { emoji, title } : null;
        })
        .filter(isEmojiItem);

    return groups;
}

export function buildEmojiSearchIndexFromCldrAnnotations(emojis: Array<string | IEmojiItem>, ...sources: ICldrAnnotationsData[]): IGeneratedEmojiLocale {
    const emojiTitles: Record<string, string> = {};
    const emojiSearchIndex: Record<string, string> = {};

    emojis.forEach((entry) => {
        const emoji = typeof entry === 'string' ? entry : entry.emoji;
        const fallbackTitle = typeof entry === 'string' ? undefined : entry.title;
        const annotations = sources
            .map((source) => getCldrAnnotation(source, emoji))
            .filter((annotation): annotation is NonNullable<ReturnType<typeof getCldrAnnotation>> => Boolean(annotation));

        const title = annotations.find((annotation) => annotation.tts?.[0])?.tts?.[0] ?? fallbackTitle;
        const keywords = [...new Set(annotations.flatMap((annotation) => [
            ...(annotation.tts ?? []),
            ...(annotation.default ?? []),
        ]).filter(Boolean))];
        if (!keywords.length && fallbackTitle) {
            keywords.push(fallbackTitle);
        }

        if (title) {
            emojiTitles[emoji] = title;
        }
        if (keywords.length) {
            emojiSearchIndex[emoji] = keywords.join(' ');
        }
    });

    return {
        emojiSearchIndex,
        emojiTitles,
    };
}

function createEmptyEmojiGroups(): EmojiGroups {
    return Object.fromEntries([
        ['frequent', []],
        ...emojiCategories.map((category) => [category, []]),
    ]) as EmojiGroups;
}

function parseEmojiTestLine(line: string): IEmojiItem | null {
    const match = line.match(/^\S(?:.+?)\s+;\s+fully-qualified\s+#\s+(\S+)\s+E[\d.]+\s+(.+)$/);
    if (!match) {
        return null;
    }

    return {
        emoji: match[1],
        title: toTitleCase(match[2]),
    };
}

function isEmojiItem(item: IEmojiItem | null): item is IEmojiItem {
    return item !== null;
}

function getCldrAnnotation(source: ICldrAnnotationsData, emoji: string) {
    const normalizedEmoji = stripEmojiVariationSelectors(emoji);
    const annotations = source.annotations?.annotations ?? source.annotationsDerived?.annotations;
    return annotations?.[emoji] ?? annotations?.[normalizedEmoji];
}

function stripEmojiVariationSelectors(emoji: string): string {
    return emoji.replace(/\uFE0F/g, '');
}

function toTitleCase(value: string): string {
    return value
        .split(' ')
        .map((word) => word ? `${word[0].toUpperCase()}${word.slice(1)}` : word)
        .join(' ');
}

interface IShouldRelaunchWithEnvProxyOptions {
    allowedFlags: ReadonlySet<string>;
    env: NodeJS.ProcessEnv | Record<string, string | undefined>;
    execArgv: readonly string[];
}

export function shouldRelaunchWithEnvProxy(options: IShouldRelaunchWithEnvProxyOptions): boolean {
    const proxyConfigured = [
        'HTTP_PROXY',
        'HTTPS_PROXY',
        'ALL_PROXY',
        'http_proxy',
        'https_proxy',
        'all_proxy',
    ].some((name) => Boolean(options.env[name]));

    if (!proxyConfigured || options.env[envProxyRelaunchEnv] || !options.allowedFlags.has(envProxyNodeArg)) {
        return false;
    }

    return !options.execArgv.includes(envProxyNodeArg) && !options.env.NODE_OPTIONS?.split(/\s+/).includes(envProxyNodeArg);
}

function relaunchWithEnvProxyIfNeeded(): boolean {
    if (!shouldRelaunchWithEnvProxy({
        allowedFlags: process.allowedNodeEnvironmentFlags,
        env: process.env,
        execArgv: process.execArgv,
    })) {
        return false;
    }

    const result = spawnSync(process.execPath, [
        envProxyNodeArg,
        ...process.execArgv,
        ...process.argv.slice(1),
    ], {
        env: {
            ...process.env,
            [envProxyRelaunchEnv]: '1',
        },
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }

    process.exitCode = result.status ?? 1;
    return true;
}

function getCldrAnnotationsUrl(cldrLocale: string, type: 'annotations' | 'annotationsDerived'): string {
    if (type === 'annotations') {
        return `${cldrJsonBaseUrl}/cldr-annotations-full/annotations/${cldrLocale}/annotations.json`;
    }

    return `${cldrJsonBaseUrl}/cldr-annotations-derived-full/annotationsDerived/${cldrLocale}/annotations.json`;
}

export function getEmojiSourceUrls(): string[] {
    return [
        unicodeEmojiTestUrl,
        ...localeFiles.flatMap(([, cldrLocale]) => [
            getCldrAnnotationsUrl(cldrLocale, 'annotations'),
            getCldrAnnotationsUrl(cldrLocale, 'annotationsDerived'),
        ]),
    ];
}

async function downloadText(url: string): Promise<string> {
    let response: Response;
    try {
        response = await fetch(url);
    } catch (error) {
        throw new Error(`Failed to download ${url}`, { cause: error });
    }

    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

async function downloadUnicodeEmojiTest(): Promise<string> {
    return downloadText(unicodeEmojiTestUrl);
}

async function downloadJson<T>(url: string): Promise<T> {
    return JSON.parse(await downloadText(url)) as T;
}

export async function mapWithConcurrencyLimit<T, R>(
    values: readonly T[],
    limit: number,
    mapper: (value: T, index: number) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(values.length);
    let nextIndex = 0;
    const workerCount = Math.min(Math.max(1, limit), values.length);

    await Promise.all(Array.from({ length: workerCount }, async () => {
        while (nextIndex < values.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            results[currentIndex] = await mapper(values[currentIndex], currentIndex);
        }
    }));

    return results;
}

function serializeEmojis(groups: EmojiGroups): string {
    return [
        '/* eslint-disable */',
        '// Generated by scripts/generate-emojis.mts. Do not edit manually.',
        '',
        `export const emojis = ${JSON.stringify(groups, null, 4)};`,
        '',
    ].join('\n');
}

function writeGeneratedEmojis(filePath: PathLike, groups: EmojiGroups): void {
    fs.mkdirSync(path.dirname(filePath.toString()), { recursive: true });
    fs.writeFileSync(filePath, serializeEmojis(groups));
}

function serializeEmojiLocale(data: IGeneratedEmojiLocale): string {
    return [
        '/* eslint-disable */',
        '// Generated by scripts/generate-emojis.mts. Do not edit manually.',
        '',
        `const emojiLocale: { emojiSearchIndex: Record<string, string>; emojiTitles: Record<string, string> } = ${JSON.stringify(data, null, 4)};`,
        '',
        'export default emojiLocale;',
        '',
    ].join('\n');
}

function writeGeneratedEmojiLocale(locale: string, data: IGeneratedEmojiLocale): void {
    fs.mkdirSync(emojiLocaleOutputDir, { recursive: true });
    fs.writeFileSync(path.resolve(emojiLocaleOutputDir, `${locale}.generated.ts`), serializeEmojiLocale(data));
}

async function generate(): Promise<void> {
    const emojiTest = await downloadUnicodeEmojiTest();
    const emojis = buildEmojisFromEmojiTest(emojiTest);
    const allEmojis = [
        ...new Map(Object.values(emojis).flat().map((item) => [item.emoji, item])).values(),
    ];

    writeGeneratedEmojis(outputPath, emojis);

    await mapWithConcurrencyLimit(localeFiles, cldrJsonDownloadConcurrency, async ([locale, cldrLocale]) => {
        const annotations = await downloadJson<ICldrAnnotationsData>(getCldrAnnotationsUrl(cldrLocale, 'annotations'));
        const annotationsDerived = await downloadJson<ICldrAnnotationsData>(getCldrAnnotationsUrl(cldrLocale, 'annotationsDerived'));

        writeGeneratedEmojiLocale(locale, buildEmojiSearchIndexFromCldrAnnotations(allEmojis, annotations, annotationsDerived));
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const task = relaunchWithEnvProxyIfNeeded()
        ? Promise.resolve()
        : generate();

    task.catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
