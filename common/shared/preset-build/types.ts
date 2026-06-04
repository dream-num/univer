export interface IPresetBuildOptions {
    cleanup?: boolean;
    skipUMD?: boolean;
    tsdownConfigPath?: string;
    umdAdditionalFiles?: string[];
    umdDeps?: string[];
}

export interface IPresetPackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    name: string;
    peerDependencies?: Record<string, string>;
}

export interface IGeneratePresetLocalesOptions {
    packageDir: string;
}

export interface IPrependPresetUmdOptions {
    packageDir: string;
    umdAdditionalFiles?: string[];
    umdDeps?: string[];
}
