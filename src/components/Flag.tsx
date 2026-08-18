interface FlagProps {
  code: string
  label?: string
}

export function Flag({ code, label }: FlagProps) {
  return (
    <span
      className={`fi fi-${code} mx-auto rounded-lg shadow-lg`}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '24rem',
        aspectRatio: '4 / 3',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="img"
      aria-label={label ?? `Flag of ${code}`}
    />
  )
}
