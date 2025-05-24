import { serverAuth } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  return serverAuth.handler(toWebRequest(event))
})
