import { countries } from '../data/countries'

interface FlagProps {
  code: string
  label?: string
}

export function Flag({ code, label }: FlagProps) {
  const country = countries.find((c) => c.code === code)
  const w = country?.flagRatioW ?? 4
  const h = country?.flagRatioH ?? 3
  // flag-icons only hand-draws correct art for exactly-square flags (its
  // `fis` variant) — every other ratio still comes from the 4:3 rectangular
  // set, just cropped to the country's real proportions via background-size:
  // cover, which fixes the outer silhouette without distorting the artwork.
  const isSquare = w === h

  const className = ['fi', `fi-${code}`, isSquare && 'fis', 'mx-auto rounded-lg shadow-lg']
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={className}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '24rem',
        aspectRatio: `${w} / ${h}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="img"
      aria-label={label ?? `Flag of ${code}`}
    />
  )
}
