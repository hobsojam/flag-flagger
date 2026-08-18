import type { Country } from '../data/countries'

interface FlagProps {
  flag: Country
  label?: string
}

export function Flag({ flag, label }: FlagProps) {
  const w = flag.flagRatioW
  const h = flag.flagRatioH
  const isSquare = w === h

  // flag-icons only hand-draws correct art for exactly-square flags (its
  // `fis` variant) — every other ratio still comes from the 4:3 rectangular
  // set, resized to the country's real proportions via background-size:
  // contain. cover was tried first, but several flags (e.g. Grenada) place
  // design elements right at the top/bottom edge of the canvas, and cover's
  // crop chopped through them — contain never crops, just letterboxes.
  const className = flag.imageUrl
    ? 'mx-auto rounded-lg shadow-lg'
    : ['fi', `fi-${flag.code}`, isSquare && 'fis', 'mx-auto rounded-lg shadow-lg'].filter(Boolean).join(' ')

  return (
    <span
      className={className}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '24rem',
        aspectRatio: `${w} / ${h}`,
        backgroundImage: flag.imageUrl ? `url(${import.meta.env.BASE_URL}${flag.imageUrl})` : undefined,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      role="img"
      aria-label={label ?? `Flag of ${flag.name}`}
    />
  )
}
