
/**
 * Resolves an asset path relative to the application base URL.
 * Useful for ensuring assets load correctly when deployed to a subdirectory (e.g. GitHub Pages).
 *
 * @param path The relative path to the asset (e.g., "./assets/img.png")
 * @returns The resolved absolute path (e.g., "/PFISO/assets/img.png")
 */
export const resolveAssetPath = (path: string): string => {
    if (!path) return path;

    // If path starts with ./, replace with BASE_URL
    if (path.startsWith('./')) {
        // import.meta.env.BASE_URL ends with / usually (e.g. /PFISO/)
        // We remove the . and keep / or not?
        // path.substring(2) gives "assets/img.png"
        // BASE_URL + "assets/img.png" -> "/PFISO/assets/img.png"
        return import.meta.env.BASE_URL + path.substring(2);
    }

    return path;
}
