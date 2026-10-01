import {
  AlignmentType,
  Document as DocxDocument,
  Footer,
  PageNumber,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'

/** Génère un fichier Word .docx (blob) de la lettre, avec pied de page. */
export async function genererLettreDocxBlob(
  objet: string | null,
  corps: string,
  reference?: string,
): Promise<Blob> {
  const paragraphes = corps.split('\n').map(
    (ligne) =>
      new Paragraph({
        children: [new TextRun({ text: ligne, size: 22 })],
        spacing: { after: 60 },
      }),
  )

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: 'single', size: 4, color: 'E5E5E5', space: 6 } },
        children: [
          new TextRun({ text: `SGEC — Réf. ${reference ?? '—'} · Page `, size: 16, color: '888888' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' }),
          new TextRun({ text: ' / ', size: 16, color: '888888' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '888888' }),
        ],
      }),
    ],
  })

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        footers: { default: footer },
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
