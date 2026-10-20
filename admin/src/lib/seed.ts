import { syncCatalog } from './catalog'

let running: Promise<void> | null = null

/** Pri pokretanju (i kad sajt dobije novi katalog) usklađuje proizvode sa sajtom. */
export function seedCatalogOnce() {
  running ??= syncCatalog()
    .then(() => undefined)
    .catch((e) => console.error('Katalog nije usklađen', e))
  return running
}
