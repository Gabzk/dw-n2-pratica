import { useState } from 'react'
import { ChevronLeft, ChevronRight, Cake, CalendarDays, Phone, Mail } from 'lucide-react'
import type { Contact } from './ContactCard'

interface CalendarProps {
  contacts: Contact[]
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Calendar({ contacts }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed (Jan = 0)

  // Get total days in month
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  
  // Get starting day of month (0 = Sunday, 1 = Monday...)
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const totalDays = getDaysInMonth(year, month)
  const firstDayIndex = getFirstDayOfMonth(year, month)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  // Get contacts celebrating their birthday on a specific day of the CURRENT month
  const getBirthdaysOnDay = (dayNum: number) => {
    return contacts.filter((contact) => {
      if (!contact.birthday) return false
      const [, bMonth, bDay] = contact.birthday.split('-').map(Number)
      return bMonth === (month + 1) && bDay === dayNum
    })
  }

  // Get all birthdays in the current month
  const getBirthdaysInMonth = () => {
    return contacts
      .filter((contact) => {
        if (!contact.birthday) return false
        const [, bMonth] = contact.birthday.split('-').map(Number)
        return bMonth === (month + 1)
      })
      .sort((a, b) => {
        const dayA = Number(a.birthday.split('-')[2])
        const dayB = Number(b.birthday.split('-')[2])
        return dayA - dayB
      })
  }

  const birthdaysInMonth = getBirthdaysInMonth()
  const selectedDayBirthdays = selectedDay ? getBirthdaysOnDay(selectedDay) : []

  // Create calendar grid items
  const daysArray = []
  
  // Previous month padded days
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthTotalDays = getDaysInMonth(prevYear, prevMonth)
  
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateKey: `${prevYear}-${prevMonth + 1}-${prevMonthTotalDays - i}`
    })
  }

  // Current month days
  const today = new Date()
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: true,
      isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
      dateKey: `${year}-${month + 1}-${i}`
    })
  }

  // Next month padded days to fill 42 cells (6 rows)
  const remainingCells = 42 - daysArray.length
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: false,
      dateKey: `${month === 11 ? year + 1 : year}-${month === 11 ? 1 : month + 2}-${i}`
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg text-neutral-800 dark:text-neutral-100">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid Wrapper */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm">
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {WEEKDAYS.map((day) => (
            <span key={day} className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((cell, idx) => {
            const birthdays = cell.isCurrentMonth ? getBirthdaysOnDay(cell.day) : []
            const hasBirthdays = birthdays.length > 0
            const isSelected = cell.isCurrentMonth && selectedDay === cell.day

            return (
              <button
                key={idx}
                disabled={!cell.isCurrentMonth}
                onClick={() => cell.isCurrentMonth && setSelectedDay(cell.day)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'text-neutral-300 dark:text-neutral-600 cursor-default opacity-40'
                    : isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : cell.isToday
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/30'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/40'
                }`}
              >
                <span className="text-sm">{cell.day}</span>
                {/* Birthday Indicators */}
                {hasBirthdays && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected ? 'bg-white' : 'bg-rose-500 dark:bg-rose-400'
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Birthdays list */}
      {selectedDay && (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm flex flex-col gap-3">
          <h4 className="font-bold text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            Dia {selectedDay} de {MONTHS[month]}
          </h4>
          {selectedDayBirthdays.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedDayBirthdays.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Cake className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{contact.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/\D/g, '')}`}
                        className="p-1.5 bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="p-1.5 bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-2">
              Nenhum aniversariante neste dia.
            </p>
          )}
        </div>
      )}

      {/* Month's Birthdays List */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm flex flex-col gap-3">
        <h4 className="font-bold text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Cake className="w-4 h-4 text-rose-500" />
          Aniversariantes de {MONTHS[month]}
        </h4>
        {birthdaysInMonth.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700/30 max-h-48 overflow-y-auto pr-1">
            {birthdaysInMonth.map((contact) => {
              const bday = parseInt(contact.birthday.split('-')[2])
              return (
                <div key={contact.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300 truncate pr-4">
                    {contact.name}
                  </span>
                  <span className="text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full font-bold">
                    Dia {bday}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-2">
            Nenhum aniversário cadastrado para este mês.
          </p>
        )}
      </div>
    </div>
  )
}
