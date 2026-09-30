// Foto (dataURL) ou iniciais do nome.
export default function Avatar({ foto, nome = '', tamanho = 48, aoClicar, children }) {
  const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
  const Tag = aoClicar ? 'button' : 'div'
  return (
    <Tag
      onClick={aoClicar}
      aria-label={aoClicar ? 'Alterar foto' : undefined}
      style={{ width: tamanho, height: tamanho }}
      className="relative flex shrink-0 items-center justify-center overflow-visible rounded-full bg-gradient-to-br from-rosa to-dourado font-sora font-bold text-white"
    >
      {foto ? (
        <img src={foto} alt={nome ? `Foto de ${nome}` : 'Foto de perfil'} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span style={{ fontSize: tamanho * 0.36 }}>{iniciais}</span>
      )}
      {children}
    </Tag>
  )
}
