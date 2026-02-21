import dotenv from 'dotenv'
import connectDb from './config/db.js'
import Expert from './models/Expert.js'

dotenv.config()

const slotSet = ['09:00', '11:00', '14:00', '16:00']

const getDates = (count = 7) => {
  const today = new Date()
  const days = []

  for (let i = 0; i < count; i += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push(date.toISOString().slice(0, 10))
  }

  return days
}

const buildAvailability = () =>
  getDates().map((date) => ({ date, slots: slotSet }))

const experts = [
  {
    name: 'Amina Rahman',
    title: 'Product Strategy Lead',
    category: 'Product',
    experienceYears: 10,
    rating: 4.9,
    bio: 'Guides teams through discovery, validation, and launch strategy for modern digital products.',
    languages: ['English', 'Urdu'],
    skills: ['Roadmapping', 'Pricing', 'User Research'],
    availability: buildAvailability(),
  },
  {
    name: 'Leo Carter',
    title: 'Growth Marketing Advisor',
    category: 'Marketing',
    experienceYears: 8,
    rating: 4.8,
    bio: 'Specializes in acquisition strategy, lifecycle messaging, and retention programs.',
    languages: ['English'],
    skills: ['Lifecycle', 'Paid Ads', 'Analytics'],
    availability: buildAvailability(),
  },
  {
    name: 'Keiko Tanaka',
    title: 'UX Researcher',
    category: 'Design',
    experienceYears: 9,
    rating: 4.95,
    bio: 'Turns qualitative insights into actionable design direction and testing plans.',
    languages: ['English', 'Japanese'],
    skills: ['Interviews', 'Service Design', 'Prototyping'],
    availability: buildAvailability(),
  },
  {
    name: 'Mateo Cruz',
    title: 'Engineering Manager',
    category: 'Engineering',
    experienceYears: 12,
    rating: 4.85,
    bio: 'Helps teams scale delivery, improve quality, and plan sustainable roadmaps.',
    languages: ['English', 'Spanish'],
    skills: ['Team Leadership', 'System Design', 'Mentoring'],
    availability: buildAvailability(),
  },
  {
    name: 'Priya Desai',
    title: 'Data Science Consultant',
    category: 'Data',
    experienceYears: 11,
    rating: 4.9,
    bio: 'Focuses on data strategy, modeling, and insights for growth teams.',
    languages: ['English', 'Hindi'],
    skills: ['Forecasting', 'Machine Learning', 'BI'],
    availability: buildAvailability(),
  },
  {
    name: 'Noah Kim',
    title: 'Sales Enablement Coach',
    category: 'Sales',
    experienceYears: 7,
    rating: 4.75,
    bio: 'Builds playbooks, messaging frameworks, and performance enablement plans.',
    languages: ['English', 'Korean'],
    skills: ['Pitching', 'Enablement', 'Discovery'],
    availability: buildAvailability(),
  },
]

const seed = async () => {
  await connectDb()
  await Expert.deleteMany({})
  await Expert.insertMany(experts)
  console.log('Seed data inserted.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
