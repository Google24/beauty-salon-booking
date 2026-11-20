function About() {
  return (
    <section>
      <div className="overflow-hidden rounded-[2rem] bg-[var(--color-plum-deep)] text-[var(--color-white)] shadow-[0_18px_50px_rgba(74,48,71,0.18)]">
        <div className="grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-16">
          <div>
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase">
              Наша история
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              О салоне Atelier Beauté
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--color-sand)] sm:text-lg">
              Atelier Beauté — камерное пространство для заботы о себе и красивых
              перемен. Мы объединили мастерство, спокойную атмосферу и внимание к
              деталям, чтобы каждый визит становился приятным ритуалом.
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--color-white)]/10 p-6 ring-1 ring-[var(--color-sand)]/20">
            <dl className="space-y-5 text-sm sm:text-base">
              <div>
                <dt className="text-[var(--color-sand)]/70">Адрес</dt>
                <dd className="mt-1 font-medium">Москва, ул. Тверская, 12</dd>
              </div>
              <div>
                <dt className="text-[var(--color-sand)]/70">Телефон</dt>
                <dd className="mt-1 font-medium">
                  <a href="tel:+74951234567" className="transition hover:text-[var(--color-gold)]">
                    +7 (495) 123-45-67
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-sand)]/70">График работы</dt>
                <dd className="mt-1 font-medium">Ежедневно, 10:00–21:00</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
        <div className="px-6 pt-6 sm:px-8">
          <h2 className="text-2xl font-semibold text-[var(--color-plum-deep)]">Как нас найти</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Будем рады видеть вас в самом центре Москвы.
          </p>
        </div>
        <iframe
          title="Карта расположения Atelier Beauté"
          src="https://yandex.ru/map-widget/v1/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%A2%D0%B2%D0%B5%D1%80%D1%81%D0%BA%D0%B0%D1%8F%2012&z=15"
          className="mt-6 h-80 w-full border-0 sm:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}

export default About