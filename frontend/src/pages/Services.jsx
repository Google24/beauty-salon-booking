const draftServices = [
  'Стрижка',
  'Маникюр',
  'Педикюр',
  'Дизайн ногтей',
]

function Services() {
  return (
    <section>
      <h1>Каталог услуг</h1>
      <ul>
        {draftServices.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </section>
  )
}

export default Services