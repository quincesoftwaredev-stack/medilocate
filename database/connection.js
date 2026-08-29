import mongoose from 'mongoose'
import { MONGODB_URI } from '@/config'
const connection = {}

async function connect () {
  const readyState = mongoose.connection.readyState

  if (connection.isConnected && readyState === 1) {
    console.log('already connected')
    return
  }

  connection.isConnected = false

  if (readyState === 1) {
    connection.isConnected = true
    console.log('use previous connection')
    return
  }

  if (readyState === 2) {
    await mongoose.connection.asPromise()
    connection.isConnected = mongoose.connection.readyState === 1
    return
  }

  if (readyState === 3) {
    await mongoose.disconnect()
  }

  const db = await mongoose.connect(MONGODB_URI, {})
  console.log('new connection')
  connection.isConnected = db.connections[0].readyState
}

async function disconnect () {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect()
      connection.isConnected = false
    } else {
      console.log('not disconnected')
    }
  }
}

function convertDocToObj (doc) {
  doc._id = doc._id.toString()
  doc.createdAt = doc.createdAt.toString()
  doc.updatedAt = doc.updatedAt.toString()
  return doc
}

const db = { connect, disconnect, convertDocToObj }
export default db
