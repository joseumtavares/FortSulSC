const categories = [
  { number: '01', label: 'Aviário' },
  { number: '02', label: 'Secadores' },
  { number: '03', label: 'Fumageiro' },
  { number: '04', label: 'Piscicultura' },
  { number: '05', label: 'Equipamentos' },
]

export function CategoryStrip() {
  return (
    <section className="category-strip" aria-label="Áreas de atuação">
      <div className="container category-grid">
        {categories.map((category) => (
          <a key={category.number} href="#solucoes">
            <span>{category.number}</span>
            {category.label}
          </a>
        ))}
      </div>
    </section>
  )
}
