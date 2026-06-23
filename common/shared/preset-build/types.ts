export interface IPresetBuildOptions {
    cleanup?: boolean;
    tsdownConfigPath?: string;
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
