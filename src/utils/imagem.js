// Comprime uma imagem escolhida para JPEG com no máximo max x max px (dataURL).
export function comprimirImagem(ficheiro, max = 256) {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(ficheiro)
    const img = new Image()
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(img.width * r))
      c.height = Math.max(1, Math.round(img.height * r))
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolver(c.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rejeitar(new Error('Imagem inválida'))
    }
    img.src = url
  })
}
