import type { UserConfig } from 'tsdown';

export interface IBuildOptions {
    skipUMD?: boolean;
    cleanup?: boolean;
    ignorePackages?: string[];
    nodeFirst?: boolean;
    tsdownConfigPath?: string;
    obfuscatorIgnorePatterns?: RegExp[];
}

export type TEntryType = 'facade' | 'index' | 'locale' | 'worker';

export interface IEntryConfig {
    key: string;
    path: string;
    type: TEntryType;
}

export interface IPackageJson {
    [key: string]: unknown;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    name: string;
    peerDependencies?: Record<string, string>;
}

export interface IBuildContext {
    entries: IEntryConfig[];
    externalPackages: string[];
    facadeExternalPackages: string[];
    inputOptions?: NonNullable<UserConfig['inputOptions']>;
    packageDir: string;
    packageJson: IPackageJson;
    plugins: any[];
}
