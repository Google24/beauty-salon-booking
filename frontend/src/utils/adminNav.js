export const ADMIN_NAV_GROUPS = [
  {
    title: 'Основное',
    items: [
      { to: '/admin', label: 'Обзор', icon: '◈', end: true, keywords: 'дашборд сводка главная' },
      { to: '/admin/bookings', label: 'Записи', icon: '▤', keywords: 'записи статус история клиенты' },
      { to: '/admin/reviews', label: 'Отзывы', icon: '★', keywords: 'отзывы оценки рейтинг' },
    ],
  },
  {
    title: 'Каталог',
    items: [
      { to: '/admin/categories', label: 'Категории', icon: '▦', keywords: 'категории услуги' },
      { to: '/admin/services', label: 'Услуги', icon: '✂', keywords: 'услуги цена длительность буфер' },
      { to: '/admin/workplaces', label: 'Рабочие места', icon: '▣', keywords: 'столы кресла места' },
    ],
  },
  {
    title: 'Сотрудники',
    items: [
      { to: '/admin/users', label: 'Пользователи', icon: '◉', keywords: 'пользователи роли доступ staff' },
      { to: '/admin/masters', label: 'Мастера', icon: '☺', keywords: 'мастера фото профили' },
      { to: '/admin/schedules', label: 'Расписания', icon: '◷', keywords: 'расписание смены дни недели' },
      { to: '/admin/absences', label: 'Отсутствия', icon: '◌', keywords: 'отпуск больничный отсутствие' },
    ],
  },
]

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title })),
)
