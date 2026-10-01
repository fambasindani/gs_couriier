/** Nom de fichier sûr à partir de l'objet de la lettre. */
export function nomFichierLettre(base: string | null | undefined, extension: string): string {
  const nettoye = (base ?? '')
    .replace(/[^\p{L}\p{N}\- ]/gu, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80)
  return `${nettoye || 'lettre'}.${extension}`
}

/** Déclenche le téléchargement d'un blob. */
export function telechargerBlob(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomFichier
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
