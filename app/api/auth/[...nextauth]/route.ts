import { getDataBasic, login, postDataBasic, refreshAuthToken } from "@/lib/api";
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { NextApiRequest, NextApiResponse } from "next";
import { headers } from "next/headers";

async function loginAfterOauth(profile: any) {
  return await postDataBasic('/users/loginAfterOauth', profile)
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'email',
      credentials: {
        username: {
          label: 'Email or Phone number',
          type: 'text',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const user = await login({
            email: credentials?.username,
            password: credentials?.password,
          })

          const res = await getDataBasic('/users/me?token=' + user.token)

          res.token = user.token
          res.tokenExpires = user.tokenExpires
          return res
        } catch (ex) {
          const error = ex.response.data.message || 'Wrong username or password'
          return Promise.reject(new Error(error))
        }
      },
    }),
  ],
  pages: {
    signIn: '/',
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider == 'google' || account?.provider == 'facebook') {
        return !!(user && user.userId)
      }
      if (user?.token) {
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    // The arguments user, account, profile and isNewUser are only passed the first time this callback is called on a new session
    async jwt({ token, user, account, profile, trigger, session }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      // tokenExpires is in second
      if (trigger === 'update' && token.accessToken) {
        token.userInfo = await getDataBasic('/users/me?token=' + token.accessToken)
      } else {
        if (account?.provider == 'google' || account?.provider == 'facebook') {
          const userData: any = await loginAfterOauth(user)
          token.accessToken = userData.token
          token.accessTokenExpires = userData.tokenExpires
          token.userRole = userData.role
          token.userInfo = await getDataBasic(
            '/users/me?token=' + userData.token,
          )
        } else if (user) {
          token.accessToken = user.token
          token.accessTokenExpires = user.tokenExpires
          token.userRole = user.role
          token.userInfo = user
        }

        // refresh token if it is not yet refresh and about to expire in 1 hour
        if (token.accessTokenExpires) {
          const dif = token.accessTokenExpires - Date.now() / 1000
          if (dif > 0 && dif < 1 * 60 * 60) {
            const refreshedData = await refreshAuthToken()

            token.accessToken = refreshedData.token
            token.accessTokenExpires = refreshedData.tokenExpires
          }
        }
      }

      return token
    },
    async session({ session, token, user, trigger, newSession }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.user.userRole = token.userRole
      session.user.info = token.userInfo
      session.user.info = token.userInfo

      let clientHeaders = headers()
      session.instanceKey = clientHeaders.get('instancekey') || ""

      return session
    },
  },
}

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  authOptions.providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      // required fields to return: id
      profile(profile, tokens) {
        return {
          id: profile.sub,
          userId: profile.email,
          email: profile.email,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          avatar: { fileUrl: profile.picture },
        }
      },
    }),
  )
}

if (process.env.FACEBOOK_ID && process.env.FACEBOOK_SECRET) {
  authOptions.providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      profile(profile, tokens) {
        return {
          id: profile.id,
          userId: profile.email,
          name: profile.name,
          email: profile.email,
          avatar: { fileUrl: profile.picture.data.url },
        }
      },
    }),
  )
}

let nextAuth = NextAuth(authOptions);

// const providers: string[] = ['master'];

// function addNewProvider(realm: string) {
//   const isNew = providers.indexOf(realm);
//   if (isNew >= 0) return;
//   providers.push(realm);

//   nextAuth = NextAuth({
//     secret: process.env.NEXTAUTH_SECRET,
//     debug: true,
//     providers: providers.map((realm) => KeycloakProvider({
//       id: realm,
//       name: realm,
//       clientId: process.env.KEYCLOAK_ID,
//       clientSecret: 'ignore',
//       issuer: process.env.KEYCLOAK_ISSUER + '/' + realm,
//     })),
//     callbacks: callback,
//   });
// }

const handler = (req: NextApiRequest, res: NextApiResponse) => {

  // if (req?.query.nextauth && req.query.nextauth[0] === 'signin' && req.query.nextauth[1]) {
  //   const realm = req.query.nextauth[1];
  //   addNewProvider(realm);
  // }

  return nextAuth(req, res);
}

export { handler as GET, handler as POST }
