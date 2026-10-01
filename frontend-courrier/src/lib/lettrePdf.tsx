import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#161616',
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000091',
    paddingBottom: 8,
    marginBottom: 20,
  },
  brand: { color: '#000091', fontSize: 13, fontFamily: 'Helvetica-Bold' },
  sub: { color: '#666666', fontSize: 9 },
  objet: { fontFamily: 'Helvetica-Bold', marginBottom: 16 },
  ligne: { marginBottom: 2 },
})

interface LettreDocumentProps {
  objet: string | null
  corps: string
}

function LettreDocument({ objet, corps }: LettreDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>SGEC</Text>
          <Text style={styles.sub}>République Démocratique du Congo</Text>
        </View>
        {objet ? <Text style={styles.objet}>{objet}</Text> : null}
        {corps.split('\n').map((ligne, index) => (
          <Text key={index} style={styles.ligne}>
            {ligne.length > 0 ? ligne : ' '}
          </Text>
        ))}
      </Page>
    </Document>
  )
}

/** Génère un PDF (blob) de la lettre via @react-pdf/renderer. */
export async function genererLettrePdfBlob(objet: string | null, corps: string): Promise<Blob> {
  return pdf(<LettreDocument objet={objet} corps={corps} />).toBlob()
}
