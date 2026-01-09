import { treaty } from '@elysiajs/eden'
import { App as Server } from 'rin-server/src/server'

export const endpoint = process.env.API_URL || 'http://localhost:3001'
export const oauth_url = process.env.API_URL + '/user/github'

// @ts-ignore elysia 版本不一致导致的类型问题，运行时正常
export const client = treaty<Server>(endpoint)
