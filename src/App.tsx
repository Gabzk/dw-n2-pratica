import { useState, useEffect } from 'react'
import { Plus, Search, Calendar, Users, Cake, ArrowLeft } from 'lucide-react'
import { Preferences } from '@capacitor/preferences'
import Input from './components/input'
import Button from './components/button'
import ContactCard from './components/ContactCard'
import type { Contact } from './components/ContactCard'
import CustomCalendar from './components/Calendar'

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState<'contacts' | 'calendar' | 'register'>('contacts')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form State
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formBirthday, setFormBirthday] = useState('')
  
  // Editing state
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      const { value } = await Preferences.get({ key: 'phonebook_contacts' })
      if (value) {
        try {
          setContacts(JSON.parse(value))
        } catch (e) {
          setContacts([])
        }
      } else {
        setContacts([])
      }
    }
    loadContacts()
  }, [])

  // Save contacts
  const saveContactsToStorage = async (updatedList: Contact[]) => {
    setContacts(updatedList)
    await Preferences.set({
      key: 'phonebook_contacts',
      value: JSON.stringify(updatedList)
    })
  }

  // Handle delete
  const handleDeleteContact = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      const filtered = contacts.filter((c) => c.id !== id)
      saveContactsToStorage(filtered)
    }
  }

  // Handle Edit click
  const handleEditContactClick = (contact: Contact) => {
    setEditingContact(contact)
    setFormName(contact.name)
    setFormPhone(contact.phone)
    setFormEmail(contact.email)
    setFormBirthday(contact.birthday)
    setActiveTab('register')
  }

  // Helper to auto-format phone numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // remove all non-digits
    if (value.length > 11) value = value.slice(0, 11)
    
    // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 0) {
      value = `(${value}`
    }
    setFormPhone(value)
  }

  // Form submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formName.trim()) {
      alert('Por favor, insira o nome do contato.')
      return
    }

    if (editingContact) {
      // Edit mode
      const updated = contacts.map((c) =>
        c.id === editingContact.id
          ? {
              ...c,
              name: formName.trim(),
              phone: formPhone.trim(),
              email: formEmail.trim(),
              birthday: formBirthday
            }
          : c
      )
      saveContactsToStorage(updated)
      setEditingContact(null)
    } else {
      // Create mode
      const newContact: Contact = {
        id: Date.now().toString(),
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        birthday: formBirthday
      }
      saveContactsToStorage([newContact, ...contacts])
    }

    // Reset form & redirect
    clearForm()
    setActiveTab('contacts')
  }

  const clearForm = () => {
    setFormName('')
    setFormPhone('')
    setFormEmail('')
    setFormBirthday('')
    setEditingContact(null)
  }

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    )
  })

  // Sort and group contacts alphabetically
  const groupedContacts: { [key: string]: Contact[] } = {}
  filteredContacts
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase()
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#'
      if (!groupedContacts[key]) {
        groupedContacts[key] = []
      }
      groupedContacts[key].push(contact)
    })

  const letterHeaders = Object.keys(groupedContacts).sort()

  // Calculate upcoming birthdays (next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return contacts
      .filter((c) => c.birthday)
      .map((c) => {
        const [, bMonth, bDay] = c.birthday.split('-').map(Number)
        const bDate = new Date(today.getFullYear(), bMonth - 1, bDay)
        
        // If already passed this year, check next year
        if (bDate < today) {
          bDate.setFullYear(today.getFullYear() + 1)
        }
        
        const diffTime = bDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return { contact: c, daysLeft: diffDays, targetDate: bDate }
      })
      .filter((item) => item.daysLeft <= 30) // Only next 30 days
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }

  const upcomingBirthdays = getUpcomingBirthdays()

  return (
    <div className="w-full h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col relative font-sans overflow-hidden">
      
      {/* APP MAIN CONTENT AREA (Scrollable) */}
      <div className="flex-1 overflow-y-auto pt-[env(safe-area-inset-top,0px)] pb-[calc(110px+env(safe-area-inset-bottom,0px))] bg-neutral-50 dark:bg-neutral-900 scrollbar-none px-4">
          
          {/* TAB 1: CONTACTS LIST */}
          {activeTab === 'contacts' && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">
                  Contatos
                </h1>
                <button
                  onClick={() => {
                    clearForm()
                    setActiveTab('register')
                  }}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Novo Contato"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Search input wrapper */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar contato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 pl-11 pr-4 py-3 text-sm rounded-2xl border border-neutral-200 dark:border-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Upcoming birthdays banner if any exist today */}
              {contacts.some(c => {
                if (!c.birthday) return false
                const [, m, d] = c.birthday.split('-').map(Number)
                const today = new Date()
                return today.getMonth() + 1 === m && today.getDate() === d
              }) && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">Aniversariante hoje!</h4>
                    <p className="text-xs text-rose-600/90 dark:text-rose-400/90">Confira a lista abaixo e envie os parabéns! 🎉</p>
                  </div>
                </div>
              )}

              {/* Alphabetical list */}
              {letterHeaders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {letterHeaders.map((letter) => (
                    <div key={letter} className="flex flex-col gap-2">
                      <h2 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 sticky top-0 bg-neutral-50 dark:bg-neutral-900 py-1 pl-1">
                        {letter}
                      </h2>
                      <div className="flex flex-col gap-3">
                        {groupedContacts[letter].map((contact) => (
                          <ContactCard
                            key={contact.id}
                            contact={contact}
                            onDelete={handleDeleteContact}
                            onEdit={handleEditContactClick}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-3" />
                  <p className="font-medium text-neutral-500 dark:text-neutral-400">
                    {searchQuery ? 'Nenhum contato encontrado' : 'Sua lista de contatos está vazia'}
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Criar um contato
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALENDAR & BIRTHDAYS */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-4 pt-2">
              <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-1">
                Calendário
              </h1>
              
              <CustomCalendar contacts={contacts} />

              {/* Upcoming birthdays summary */}
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50 shadow-sm flex flex-col gap-3 mt-1">
                <h3 className="font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-rose-500" />
                  Próximos 30 dias
                </h3>
                {upcomingBirthdays.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {upcomingBirthdays.map(({ contact, daysLeft }) => (
                      <div key={contact.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{contact.name}</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">{contact.phone}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          daysLeft === 0 
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-blue-50 dark:bg-neutral-700 text-blue-600 dark:text-blue-400'
                        }`}>
                          {daysLeft === 0 ? 'Hoje 🎉' : `${daysLeft}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-2">
                    Nenhum aniversário nos próximos 30 dias.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER / EDIT FORM */}
          {activeTab === 'register' && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    clearForm()
                    setActiveTab('contacts')
                  }}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">
                  {editingContact ? 'Editar Contato' : 'Novo Contato'}
                </h1>
              </div>

              {/* Dynamic Photo/Initials Placeholder */}
              <div className="flex flex-col items-center justify-center my-4">
                <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600">
                  {formName ? (
                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 animate-fade-in uppercase">
                      {formName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  ) : (
                    <Users className="w-8 h-8" />
                  )}
                </div>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-2 font-medium">
                  {editingContact ? 'Editando Perfil' : 'Novo Contato'}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                <Input
                  label="Nome Completo *"
                  type="text"
                  placeholder="Nome do contato"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                
                <Input
                  label="Telefone *"
                  type="tel"
                  placeholder="(99) 99999-9999"
                  value={formPhone}
                  onChange={handlePhoneChange}
                  required
                />

                <Input
                  label="E-mail"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />

                <Input
                  label="Data de Aniversário"
                  type="date"
                  value={formBirthday}
                  onChange={(e) => setFormBirthday(e.target.value)}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    title="Cancelar"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      clearForm()
                      setActiveTab('contacts')
                    }}
                  />
                  <Button
                    title={editingContact ? 'Salvar' : 'Cadastrar'}
                    type="submit"
                    variant="primary"
                  />
                </div>
              </form>
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <div className="absolute bottom-0 left-0 right-0 h-auto py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-around px-4 z-40">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 cursor-pointer transition-all ${
              activeTab === 'contacts'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Contatos</span>
          </button>

          <button
            onClick={() => {
              clearForm()
              setActiveTab('register')
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 cursor-pointer transition-all ${
              activeTab === 'register'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 -translate-y-2.5">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] -translate-y-2">Cadastrar</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 cursor-pointer transition-all ${
              activeTab === 'calendar'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Calendário</span>
          </button>
        </div>

    </div>
  )
}
