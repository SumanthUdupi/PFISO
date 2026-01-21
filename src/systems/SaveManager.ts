
const DB_NAME = 'PFISO_DB';
const DB_VERSION = 1;
const STORE_NAME = 'save_data';
const CURRENT_SAVE_VERSION = 2; // SYS-036: Versioning

class SaveManager {
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.initDB();
    }

    private initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('SaveManager: Database error', event);
                reject((event.target as IDBOpenDBRequest).error);
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    public async save(key: string, data: any): Promise<void> {
        window.dispatchEvent(new Event('SAVE_START')); // UX-040
        try {
            const db = await this.dbPromise;
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // SYS-036: Save wrapper
                const versionedData = {
                    version: CURRENT_SAVE_VERSION,
                    timestamp: Date.now(),
                    content: data
                };

                const request = store.put(versionedData, key);

                request.onsuccess = () => {
                    window.dispatchEvent(new Event('SAVE_END')); // UX-040
                    resolve();
                };
                request.onerror = (e) => {
                    window.dispatchEvent(new Event('SAVE_END')); // UX-040
                    reject((e.target as IDBRequest).error);
                };
            });
        } catch (error) {
            window.dispatchEvent(new Event('SAVE_END')); // UX-040
            console.error('SaveManager: Save failed', error);
            throw error;
        }
    }

    public async load<T>(key: string): Promise<T | null> {
        try {
            const db = await this.dbPromise;
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result;
                    if (!result) {
                        resolve(null);
                        return;
                    }

                    // SYS-036: Version Check
                    if (result.version !== undefined) {
                        if (result.version !== CURRENT_SAVE_VERSION) {
                            console.warn(`Save version mismatch: Expected ${CURRENT_SAVE_VERSION}, got ${result.version}. Attempting to load anyway (migration not implemented).`);
                            // In a real scenario, we would migrate data here.
                        }
                        resolve(result.content as T);
                    } else {
                        // Legacy save (no version wrapper)
                        console.warn('Loading legacy save format.');
                        resolve(result as T);
                    }
                };
                request.onerror = (e) => reject((e.target as IDBRequest).error);
            });
        } catch (error) {
            console.error('SaveManager: Load failed', error);
            return null;
        }
    }

    public async delete(key: string): Promise<void> {
        try {
            const db = await this.dbPromise;
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(key);

                request.onsuccess = () => resolve();
                request.onerror = (e) => reject((e.target as IDBRequest).error);
            });
        } catch (error) {
            console.error('SaveManager: Delete failed', error);
            throw error;
        }
    }
}

export const saveManager = new SaveManager();
