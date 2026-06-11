import { Phone, Mail, Trash2, Edit2, Cake } from 'lucide-react'

export interface Contact {
  id: string
  name: string
  phone: string
  email: string
  birthday: string // 'YYYY-MM-DD'
}

interface ContactCardProps {
  contact: Contact
  onDelete: (id: string) => void
  onEdit: (contact: Contact) => void
}

// Generates a beautiful gradient avatar background based on contact name
function getAvatarGradient(name: string) {
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-emerald-500 to-green-500',
    'from-orange-500 to-amber-500',
    'from-violet-500 to-purple-500',
    'from-sky-500 to-indigo-500'
  ]
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  return gradients[sum % gradients.length]
}

// Calculates days remaining until the next birthday, or if it is today
function getBirthdayStatus(birthdayStr: string) {
  if (!birthdayStr) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [, bMonth, bDay] = birthdayStr.split('-').map(Number)
  const bDate = new Date(today.getFullYear(), bMonth - 1, bDay)
  
  if (bDate < today) {
    bDate.setFullYear(today.getFullYear() + 1)
  }

  const diffTime = bDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0 || (today.getMonth() === bMonth - 1 && today.getDate() === bDay)) {
    return { isToday: true, text: 'Hoje! 🎉', daysLeft: 0 }
  }

  return { isToday: false, text: `Em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`, daysLeft: diffDays }
}

export default function ContactCard({ contact, onDelete, onEdit }: ContactCardProps) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const bdayStatus = getBirthdayStatus(contact.birthday)
  const gradient = getAvatarGradient(contact.name)

  // Format date to local readable format (e.g. "25 de Outubro")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [, month, day] = dateStr.split('-')
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return `${parseInt(day)} de ${months[parseInt(month) - 1]}`
  }

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 relative group">
      
      {/* Top Section: Avatar & Info */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 truncate pr-14">
            {contact.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {contact.phone}
          </p>
        </div>
      </div>

      {/* Birthday Indicator */}
      {contact.birthday && bdayStatus && (
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
          bdayStatus.isToday
            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 animate-pulse'
            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-100 dark:border-neutral-800'
        }`}>
          <div className="flex items-center gap-1.5">
            <Cake className="w-4 h-4 shrink-0" />
            <span>Niver: {formatDate(contact.birthday)}</span>
          </div>
          <span className={`font-bold ${bdayStatus.isToday ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {bdayStatus.text}
          </span>
        </div>
      )}

      {/* Actions and details */}
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700/30 pt-3 mt-1">
        <div className="flex items-center gap-2">
          {contact.phone && (
            <a
              href={`tel:${contact.phone.replace(/\D/g, '')}`}
              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-neutral-700/50 dark:hover:bg-neutral-700 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer"
              title="Ligar"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-neutral-700/50 dark:hover:bg-neutral-700 text-blue-600 dark:text-blue-400 rounded-xl transition-colors cursor-pointer"
              title="Enviar e-mail"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-700/50 rounded-xl transition-all cursor-pointer"
            title="Editar contato"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-700/50 rounded-xl transition-all cursor-pointer"
            title="Excluir contato"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  )
}
