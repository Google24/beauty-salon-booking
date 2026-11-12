import './App.css'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <section className="flex flex-1 flex-col justify-center py-12 sm:py-20">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase">
          Салон красоты
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-plum-deep)] sm:text-6xl">
          Забота о красоте начинается с удобной записи
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
          Скоро здесь появится каталог услуг, выбор мастера и удобное онлайн-бронирование.
        </p>
      </section>
    </Layout>
  )
}

export default App