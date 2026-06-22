import { clsx } from '@univerjs/design';
import { defaultTheme } from '@univerjs/themes';
import { SidebarHeader } from './components/sidebar-header';
import { JsonEditorPanel } from './components/theme-sections';
import { TokenEditorPanel } from './components/token-editor-panel';
import { UniverPreview } from './components/univer-preview';
import { useThemeCustomizerState } from './hooks/use-theme-customizer-state';
import { cloneTheme, formatTheme } from './theme-utils';

export function ThemeCustomizerApp() {
    const {
        copyLabel,
        darkMode,
        editorMode,
        jsonDraft,
        jsonError,
        theme,
        tokenDensity,
        visibleScaleKeys,
        setDarkMode,
        setEditorMode,
        setJsonDraft,
        setTokenDensity,
        handleCopyTheme,
        handleJsonChange,
        handleLoopColorChange,
        handlePresetApply,
        handleRootColorChange,
        handleScaleColorChange,
    } = useThemeCustomizerState();

    return (
        <main
            className={clsx(`
              univer-box-border univer-h-screen univer-overflow-hidden univer-p-2.5 univer-text-slate-900
              lg:univer-p-3
            `, darkMode
                ? 'univer-bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] univer-text-slate-100'
                : 'univer-bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]')}
        >
            <div className="univer-mx-auto univer-h-full univer-max-w-[1680px]">
                <section
                    className="
                      univer-grid univer-h-full univer-gap-3
                      xl:univer-grid-cols-[400px_minmax(0,1fr)]
                    "
                >
                    <aside
                        className={clsx(`
                          univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-overflow-hidden
                          univer-rounded-[28px] univer-bg-white univer-shadow-[0_16px_48px_rgba(15,23,42,0.08)]
                          dark:!univer-bg-gray-900
                        `)}
                    >
                        <SidebarHeader
                            darkMode={darkMode}
                            editorMode={editorMode}
                            tokenDensity={tokenDensity}
                            onDarkModeChange={setDarkMode}
                            onEditorModeChange={setEditorMode}
                            onPresetApply={handlePresetApply}
                            onTokenDensityChange={setTokenDensity}
                        />

                        <div className="univer-flex-1 univer-overflow-y-auto univer-p-4">
                            {editorMode === 'tokens'
                                ? (
                                    <TokenEditorPanel
                                        copyLabel={copyLabel}
                                        theme={theme}
                                        visibleScaleKeys={visibleScaleKeys}
                                        onCopy={handleCopyTheme}
                                        onLoopColorChange={handleLoopColorChange}
                                        onRootColorChange={handleRootColorChange}
                                        onScaleColorChange={handleScaleColorChange}
                                    />
                                )
                                : (
                                    <div className="univer-flex univer-h-full univer-flex-col univer-gap-4">
                                        <JsonEditorPanel
                                            copyLabel={copyLabel}
                                            jsonDraft={jsonDraft}
                                            jsonError={jsonError}
                                            onCopy={handleCopyTheme}
                                            onFormatCurrent={() => setJsonDraft(formatTheme(theme))}
                                            onJsonChange={handleJsonChange}
                                            onSyncCurrent={() => setJsonDraft(formatTheme(theme))}
                                            onViewDefault={() => setJsonDraft(formatTheme(cloneTheme(defaultTheme)))}
                                        />
                                    </div>
                                )}
                        </div>
                    </aside>

                    <section
                        className={clsx(`
                          univer-flex univer-h-full univer-min-h-0 univer-flex-col univer-overflow-hidden
                          univer-rounded-[28px] univer-bg-white univer-shadow-[0_18px_56px_rgba(15,23,42,0.16)]
                          dark:!univer-bg-gray-900
                        `)}
                    >
                        <div
                            className="
                              univer-bg-white univer-p-4
                              dark:!univer-bg-gray-900
                            "
                        >
                            <h2
                                className="
                                  univer-m-0 univer-text-base univer-font-semibold univer-text-slate-950
                                  dark:!univer-text-white
                                "
                            >
                                Live Preview
                            </h2>
                        </div>

                        <div className="univer-min-h-[640px] univer-flex-1 univer-overflow-hidden">
                            <UniverPreview theme={theme} darkMode={darkMode} />
                        </div>
                    </section>
                </section>
            </div>
        </main>
    );
}
