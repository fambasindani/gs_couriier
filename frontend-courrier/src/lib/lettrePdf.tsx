import { Document, Page, Path, Rect, StyleSheet, Svg, Text, View, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#161616',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#000091',
    paddingBottom: 8,
    marginBottom: 20,
  },
  logo: { width: 36, height: 36, marginRight: 10 },
  brandBlock: { flexDirection: 'column' },
  brand: { color: '#000091', fontSize: 13, fontFamily: 'Helvetica-Bold' },
  sub: { color: '#666666', fontSize: 9 },
  objet: { fontFamily: 'Helvetica-Bold', marginBottom: 16 },
  ligne: { marginBottom: 2 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    fontSize: 8,
    color: '#888888',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 6,
  },
})

interface LettreDocumentProps {
  objet: string | null
  corps: string
  reference?: string
}

function Logo() {
  return (
    <Svg style={styles.logo} viewBox="0 0 64 64">
      <Rect x="0" y="0" width="64" height="64" rx="14" fill="#000091" />
      <Path d="M14 20h36v24a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V20z" fill="#ffffff" />
      <Path d="M14 21l18 13 18-13" fill="none" stroke="#000091" strokeWidth={3} />
    </Svg>
  )
}

function LettreDocument({ objet, corps, reference }: LettreDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Logo />
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>SGEC</Text>
            <Text style={styles.sub}>République Démocratique du Congo</Text>
          </View>
        </View>
        {objet ? <Text style={styles.objet}>{objet}</Text> : null}
        {corps.split('\n').map((ligne, index) => (
          <Text key={index} style={styles.ligne}>
            {ligne.length > 0 ? ligne : ' '}
          </Text>
        ))}
        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `SGEC — Réf. ${reference ?? '—'} · Page ${pageNumber}/${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}

/** Génère un PDF (blob) de la lettre via @react-pdf/renderer. */
export async function genererLettrePdfBlob(
  objet: string | null,
  corps: string,
  reference?: string,
): Promise<Blob> {
  return pdf(<LettreDocument objet={objet} corps={corps} reference={reference} />).toBlob()
}
