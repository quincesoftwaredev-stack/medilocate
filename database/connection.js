import mongoose from 'mongoose'
import { MONGODB_URI } from '@/config'

// Reuse one connection promise across hot reloads and warm serverless invocations.
const globalCache = globalThis.__MEDILOCATE_MONGOOSE__ || {
  connection: null,
  promise: null
}

globalThis.__MEDILOCATE_MONGOOSE__ = globalCache

async function connect () {
  if (globalCache.connection && mongoose.connection.readyState === 1) {
    return globalCache.connection
  }

  if (!globalCache.promise || mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000
    }).catch((error) => {
      globalCache.promise = null
      throw error
    })
  }

  globalCache.connection = await globalCache.promise
  return globalCache.connection
}

async function disconnect () {
  // API routes intentionally keep the pool open for the next warm invocation.
  return Promise.resolve()
}

function convertDocToObj (doc) {
  doc._id = doc._id.toString()
  doc.createdAt = doc.createdAt.toString()
  doc.updatedAt = doc.updatedAt.toString()
  return doc
}

const db = { connect, disconnect, convertDocToObj }
export default db
