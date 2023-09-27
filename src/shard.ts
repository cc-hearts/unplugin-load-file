export function getFileExtension(path: string) {
  return path.split('.').slice(-1)[0]
}
