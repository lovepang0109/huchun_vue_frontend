import { DefaultSession } from 'next-auth'

declare module 'next-auth/jwt' {
  interface JWT {
    userRole?: string
    accessToken?: string
    accessTokenExpires?: number
    userInfo?: any
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    instanceKey?: string,
    user: {
      userRole?: string
      info?: any
      answersOfUser?: any
    } & DefaultSession['user']
  }

  interface User {
    token?: string
    role?: string
    userId?: string
    tokenExpires?: number
  }
}
