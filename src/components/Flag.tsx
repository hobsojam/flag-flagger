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
  // set, resized to the country's real proportions via background-size:
  // contain. cover was tried first, but several flags (e.g. Grenada) place
  // design elements right at the top/bottom edge of the canvas, and cover's
  // crop chopped through them — contain never crops, just letterboxes.
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
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      role="img"
      aria-label={label ?? `Flag of ${code}`}
    />
  )
}
