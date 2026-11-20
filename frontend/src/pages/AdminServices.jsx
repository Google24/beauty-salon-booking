import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createService, deleteService, getAdminCategories, getAdminServices, updateService } from '../api/admin'
import { useAuth } from '../context/AuthContext.jsx'

const emptyForm = {
  name: '',
  price: '',
  duration_min: '',
  description: '',
  category: '',
}

function getServicesList(data) {
  return Array.isArray(data) ? data : data?.results || []
}

function AdminServices() {
  const { token } = useAuth()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          getAdminServices(token),
          getAdminCategories(token),
        ])
        if (isMounted) {
          setServices(getServicesList(servicesData))
          setCategories(getServicesList(categoriesData))
        }
      } catch {
        if (isMounted) setError('Не удалось загрузить услуги')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadServices()
    return () => {
      isMounted = false
    }
  }, [token])

  function openCreateModal() {
    setForm(emptyForm)
    setEditingService({ id: null })
  }

  function openEditModal(service) {
    setForm({
      name: service.name || '',
      price: service.price || '',
      duration_min: service.duration_min || '',
      description: service.description || '',
      category: service.category || '',
    })
    setEditingService(service)
  }

  function closeModal() {
    if (!submitting) setEditingService(null)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function getPayload() {
    return {
      name: form.name.trim(),
      price: Number(form.price),
      duration_min: Number(form.duration_min),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.category ? { category: Number(form.category) } : {}),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload = getPayload()
      const savedService = editingService.id
        ? await updateService(editingService.id, payload, token)
        : await createService(payload, token)

      setServices((current) =>
        editingService.id
          ? current.map((service) => (service.id === editingService.id ? savedService : service))
          : [savedService, ...current],
      )
      setEditingService(null)
      toast.success(editingService.id ? 'Услуга обновлена' : 'Услуга добавлена')
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось сохранить услугу'
      toast.error(serverError)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(service) {
    if (!window.confirm(`Удалить услугу «${service.name}»?`)) return

    try {
      await deleteService(service.id, token)
      setServices((current) => current.filter((item) => item.id !== service.id))
      toast.success('Услуга удалена')
    } catch (requestError) {
      toast.error(requestError.data?.detail || 'Не удалось удалить услугу')
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
            Администрирование
          </p>
          <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Услуги</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] hover:bg-[var(--color-plum-deep)]"
        >
          Добавить услугу
        </button>
      </div>

      {loading && <p className="mt-8 text-[var(--color-muted)]">Загрузка услуг...</p>}
      {error && <p className="mt-8 text-[#8e3f4a]" role="alert">{error}</p>}
      {!loading && !error && (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-[var(--color-white)] shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-[var(--color-sand)]/80 text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">
              <tr>
                <th className="px-5 py-4 font-medium">Название</th>
                <th className="px-5 py-4 font-medium">Цена</th>
                <th className="px-5 py-4 font-medium">Длительность</th>
                <th className="px-5 py-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-sand)]/60">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-5 py-4 font-medium">{service.name}</td>
                  <td className="px-5 py-4">{service.price} ₽</td>
                  <td className="px-5 py-4">{service.duration_min} мин.</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => openEditModal(service)} className="rounded-lg border border-[var(--color-plum)] px-3 py-2 text-xs font-medium text-[var(--color-plum)]">Редактировать</button>
                      <button type="button" onClick={() => handleDelete(service)} className="rounded-lg border border-[#8e3f4a] px-3 py-2 text-xs font-medium text-[#8e3f4a]">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="px-5 py-8 text-center text-[var(--color-muted)]">Услуги не найдены</p>}
        </div>
      )}

      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl">
            <h2 id="service-modal-title" className="text-2xl font-semibold text-[var(--color-plum-deep)]">
              {editingService.id ? 'Редактировать услугу' : 'Добавить услугу'}
            </h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[var(--color-plum)]">Название<input name="name" value={form.name} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] px-4" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-[var(--color-plum)]">Цена<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] px-4" /></label>
                <label className="block text-sm font-medium text-[var(--color-plum)]">Минуты<input name="duration_min" type="number" min="1" value={form.duration_min} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] px-4" /></label>
              </div>
              <label className="block text-sm font-medium text-[var(--color-plum)]">Категория<select name="category" value={form.category} onChange={handleChange} required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] px-4"><option value="">Выберите категорию</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="block text-sm font-medium text-[var(--color-plum)]">Описание<textarea name="description" value={form.description} onChange={handleChange} rows="3" className="mt-2 w-full rounded-xl border border-[var(--color-sand)] px-4 py-3" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} disabled={submitting} className="rounded-xl border border-[var(--color-plum)] px-4 py-2 text-sm text-[var(--color-plum)]">Отмена</button>
              <button type="submit" disabled={submitting} className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-white)] disabled:opacity-60">{submitting ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default AdminServices