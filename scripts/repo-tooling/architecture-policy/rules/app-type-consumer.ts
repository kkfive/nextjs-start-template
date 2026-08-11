import type { ImportReference } from '../parser.ts'

const appTypeConsumerFile = /^apps\/(?:admin|client)\/src\/service\/rpc-[^/]+\.ts$/u
const appTypeConsumerManifest = /^apps\/(?:admin|client)\/package\.json$/u

export function isAllowedAppTypeImport(source: string, reference: ImportReference): boolean {
  return appTypeConsumerFile.test(source)
    && reference.kind === 'import'
    && reference.isTypeOnly
    && reference.specifier === 'api'
    && reference.importedNames.length === 1
    && reference.importedNames[0] === 'AppType'
}

export function isAllowedAppTypeManifest(
  source: string,
  section: string,
  dependency: string,
  specifier: unknown,
): boolean {
  return appTypeConsumerManifest.test(source)
    && section === 'devDependencies'
    && dependency === 'api'
    && specifier === 'workspace:*'
}
