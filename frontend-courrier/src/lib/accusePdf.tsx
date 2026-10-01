import { Document, Image, Page, Path, Rect, StyleSheet, Svg, Text, View, pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'

export interface AccuseData {
  numero: string
  reference_externe?: string | null
  objet: string
  expediteur?: string | null
  destinataire?: string | null
  type?: string | null
  confidentialite?: string | null
  date_reception?: string | null
  verifyUrl?: string
}

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
    marginBottom: 24,
  },
  logo: { width: 36, height: 36, marginRight: 10 },
  brand: { color: '#000091', fontSize: 13, fontFamily: 'Helvetica-Bold' },
  sub: { color: '#666666', fontSize: 9 },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000091',
  },
  field: { flexDirection: 'row', marginBottom: 6 },
  label: { width: '38%', color: '#666666', fontSize: 10 },
  value: { flex: 1, fontSize: 11 },
  separator: { borderTopWidth: 1, borderTopColor: '#e5e5e5', marginVertical: 16 },
  qrBlock: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qr: { width: 96, height: 96 },
  qrCaption: { marginLeft: 12, fontSize: 9, color: '#888888', flex: 1 },
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

function Logo() {
  return (
    <Svg style={styles.logo} viewBox="0 0 64 64">
      <Rect x="0" y="0" width="64" height="64" rx="14" fill="#000091" />
      <Path d="M14 20h36v24a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V20z" fill="#ffffff" />
      <Path d="M14 21l18 13 18-13" fill="none" stroke="#000091" strokeWidth={3} />
    </Svg>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  )
}

function AccuseDocument({ data, qrDataUrl }: { data: AccuseData; qrDataUrl: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Logo />
          <View>
            <Text style={styles.brand}>SGEC</Text>
            <Text style={styles.sub}>République Démocratique du Congo</Text>
          </View>
        </View>

        <Text style={styles.title}>ACCUSÉ DE RÉCEPTION</Text>

        <Row label="Numéro d'enregistrement" value={data.numero} />
        <Row label="Référence externe" value={data.reference_externe} />
        <Row label="Objet" value={data.objet} />
        <Row label="Expéditeur" value={data.expediteur} />
        <Row label="Destinataire" value={data.destinataire} />
        <Row label="Type" value={data.type} />
        <Row label="Confidentialité" value={data.confidentialite} />
        <Row label="Date de réception" value={data.date_reception} />

        <View style={styles.separator} />

        <View style={styles.qrBlock}>
          <Image style={styles.qr} src={qrDataUrl} />
          <Text style={styles.qrCaption}>
            Scannez ce QR code pour vérifier l'authenticité et accéder au courrier dans l'application SGEC.
          </Text>
        </View>

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Accusé de réception — Réf. ${data.numero} · Page ${pageNumber}/${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}

/** Génère l'accusé de réception (blob PDF) avec QR code. */
export async function genererAccusePdfBlob(data: AccuseData): Promise<Blob> {
  const contenuQr = data.verifyUrl || `SGEC|${data.numero}|${data.reference_externe ?? ''}`
  const qrDataUrl = await QRCode.toDataURL(contenuQr, {
    width: 256,
    margin: 1,
    color: { dark: '#000091', light: '#ffffff' },
  })

  return pdf(<AccuseDocument data={data} qrDataUrl={qrDataUrl} />).toBlob()
}
