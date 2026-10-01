import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const BASE = '#e9edf4'
const HIGHLIGHT = '#f6f8fc'

const common = { baseColor: BASE, highlightColor: HIGHLIGHT }

/** Squelette d'une carte KPI (StatCard). */
export function StatCardSkeleton() {
  return (
    <div className="card-custom stat-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton {...common} width={120} height={12} />
          <div className="mt-3">
            <Skeleton {...common} width={72} height={26} />
          </div>
          <div className="mt-3">
            <Skeleton {...common} width={96} height={10} />
          </div>
        </div>
        <Skeleton {...common} circle width={52} height={52} />
      </div>
    </div>
  )
}

/** Squelette d'une zone de graphique. */
export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton {...common} height={height} borderRadius={12} />
}

/** Lignes <tr> squelettes à insérer dans un <tbody>. */
export function TableBodySkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: cols }).map((__, colIndex) => (
            <td key={colIndex}>
              <Skeleton {...common} height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/** Squelette de lignes (hors tableau) : listes, cartes. */
export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton {...common} width="25%" height={14} />
          <Skeleton {...common} width="45%" height={14} />
          <Skeleton {...common} width="20%" height={14} />
        </div>
      ))}
    </div>
  )
}

/** Squelette d'une timeline (activité / circuit). */
export function TimelineSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton {...common} circle width={32} height={32} />
          <div className="flex-1">
            <Skeleton {...common} width="45%" height={12} />
            <div className="mt-2">
              <Skeleton {...common} width="75%" height={10} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Squelette d'une liste avec barres de progression (catégories). */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index}>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton {...common} width={160} height={12} />
            <Skeleton {...common} width={40} height={12} />
          </div>
          <Skeleton {...common} height={8} borderRadius={999} />
        </div>
      ))}
    </div>
  )
}
