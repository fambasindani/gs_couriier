import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx'

/** Génère un fichier Word .docx (blob) de la lettre. */
export async function genererLettreDocxBlob(objet: string | null, corps: string): Promise<Blob> {
  const paragraphes = corps.split('\n').map(
    (ligne) =>
      new Paragraph({
        children: [new TextRun({ text: ligne, size: 22 })],
        spacing: { after: 60 },
      }),
  )

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'SGEC', bold: true, color: '000091', size: 26 })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'République Démocratique du Congo', color: '666666', size: 18 }),
            ],
            spacing: { after: 200 },
          }),
          ...(objet
            ? [
                new Paragraph({
                  children: [new TextRun({ text: objet, bold: true, size: 24 })],
                  spacing: { after: 200 },
                }),
              ]
            : []),
          ...paragraphes,
        ],
      },
    ],
  })

  return Packer.toBlob(doc)
}
