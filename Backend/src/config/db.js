import mongoose from 'mongoose'

const connectDb = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error('MONGO_URI is not set in the environment variables.')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('✅ MongoDB Connected Successfully')
  console.log(`   Host: ${mongoose.connection.host}`)
  console.log(`   Database: ${mongoose.connection.name}`)
}

export default connectDb
