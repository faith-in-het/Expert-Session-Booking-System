import mongoose from 'mongoose'

const AvailabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    slots: { type: [String], default: [] },
  },
  { _id: false },
)

const ExpertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    bio: { type: String, required: true },
    languages: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    availability: { type: [AvailabilitySchema], default: [] },
  },
  { timestamps: true },
)

export default mongoose.model('Expert', ExpertSchema)
