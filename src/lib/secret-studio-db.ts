"use client";

export type SavedStudioShot = {
  id: string;
  createdAt: string;
  provider: string;
  providerLabel: string;
  prompt: string;
  notes: string;
  aspectRatio: string;
  imageUrl: string;
  recipe: Record<string, string>;
};

const DB_NAME = "robeanny-secret-studio";
const STORE_NAME = "saved_shots";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB no está disponible en este navegador."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("No se pudo abrir IndexedDB."));
  });
}

export async function listSavedStudioShots() {
  const db = await openDb();

  return new Promise<SavedStudioShot[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result as SavedStudioShot[]).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );

      resolve(items);
    };
    request.onerror = () =>
      reject(request.error || new Error("No se pudieron leer las fotos guardadas."));
  });
}

export async function saveStudioShot(item: SavedStudioShot) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("No se pudo guardar la foto."));
  });
}

export async function deleteStudioShot(id: string) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("No se pudo borrar la foto."));
  });
}
