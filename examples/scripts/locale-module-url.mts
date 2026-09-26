/**
 * Resolve a locale module specifier to a `file://` URL for dynamic import.
 *
 * The dev locale exporter used to pass the bare specifier straight to
 * `import()`. Under tsx on Windows that resolves to a raw absolute path like
 * `C:\...`, which Node's ESM loader rejects with
 * `ERR_UNSUPPORTED_ESM_URL_SCHEME` ("Received protocol 'c:'"). The failure
 * surfaces in the workbench as "Could not load <product> locale <tag>" on
 * every tab. Importing the resolved `file://` URL works on all platforms.
 */
export function resolveLocaleModuleUrl(specifier: string): string {
    return import.meta.resolve(specifier);
}
