import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import nodemailer from "nodemailer"
import path from "path"
const options = {
    // @link https://next-auth.js.org/configuration/providers
    providers: [
        Providers.Email({
            // SMTP connection string or nodemailer configuration object https://nodemailer.com/
            server: {
                host: process.env.EMAIL_SERVER_SMTP,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    type: 'login',
                    user: process.env.EMAIL_USER, // generated ethereal user
                    pass: process.env.EMAIL_PWD, // generated ethereal password
                },
            },
            // Email services often only allow sending email from a valid/verified address
            from: process.env.EMAIL_USER,
            sendVerificationRequest: ({ identifier: email, url, token, site, provider }) => {
                return new Promise((resolve, reject) => {
                    console.log(email, url, token, site)
                    const { server, from } = provider
                    nodemailer.createTransport(server).sendMail({
                            to: email,
                            from,
                            subject: `Sign in to ${site}`,
                            text: text({ url, site, email }),
                            html: html({ url, site, email })
                        }
                        // Strip protocol from URL and use domain as site name
                        //site = site.replace(/^https?:\/\//, '')
                    ).then((info) => {
                        console.log("email successfully sent")

                        return resolve();
                    }).catch(error => {
                        console.log('SEND_VERIFICATION_EMAIL_ERROR', email, error)
                        return reject(new Error('SEND_VERIFICATION_EMAIL_ERROR', error))
                    })
                })
            }
        }),
        // When configuring oAuth providers make sure you enabling requesting
        // permission to get the users email address (required to sign in)
        /*Providers.Google({
            clientId: process.env.NEXTAUTH_GOOGLE_ID,
            clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET,
        }),
        Providers.Facebook({
            clientId: process.env.NEXTAUTH_FACEBOOK_ID,
            clientSecret: process.env.NEXTAUTH_FACEBOOK_SECRET,
        }),
        Providers.Twitter({
            clientId: process.env.NEXTAUTH_TWITTER_ID,
            clientSecret: process.env.NEXTAUTH_TWITTER_SECRET,
        }),
        Providers.GitHub({
            clientId: process.env.NEXTAUTH_GITHUB_ID,
            clientSecret: process.env.NEXTAUTH_GITHUB_SECRET,
        }),*/
    ],

    // @link https://next-auth.js.org/configuration/databases
    database: process.env.NEXTAUTH_DATABASE_URL,
    // @link https://next-auth.js.org/configuration/options#session
    session: {
        // Use JSON Web Tokens for session instead of database sessions.
        // This option can be used with or without a database for users/accounts.
        // Note: `jwt` is automatically set to `true` if no database is specified.
        // jwt: true,
        // Seconds - How long until an idle session expires and is no longer valid.
        // maxAge: 30 * 24 * 60 * 60, // 30 days
        // Seconds - Throttle how frequently to write to database to extend a session.
        // Use it to limit write operations. Set to 0 to always update the database.
        // Note: This option is ignored if using JSON Web Tokens
        // updateAge: 24 * 60 * 60, // 24 hours
    },

    // @link https://next-auth.js.org/configuration/options#jwt
    jwt: {
        // A secret to use for key generation - you should set this explicitly
        // Defaults to NextAuth.js secret if not explicitly specified.
        // secret: 'INp8IvdIyeMcoGAgFGoA61DdBglwwSqnXJZkgz8PSnw',
        // Set to true to use encryption. Defaults to false (signing only).
        // encryption: true,
        // You can define your own encode/decode functions for signing and encryption
        // if you want to override the default behaviour.
        // encode: async ({ secret, token, maxAge }) => {},
        // decode: async ({ secret, token, maxAge }) => {},
    },

    // @link https://next-auth.js.org/configuration/callbacks
    callbacks: {
        /**
         * Intercept signIn request and return true if the user is allowed.
         *
         * @link https://next-auth.js.org/configuration/callbacks#sign-in-callback
         * @param  {object} user     User object
         * @param  {object} account  Provider account
         * @param  {object} profile  Provider profile
         * @return {boolean}         Return `true` (or a modified JWT) to allow sign in
         *                           Return `false` to deny access
         */
        signIn: async(user, account, profile) => {
            return true
        },

        /**
         * @link https://next-auth.js.org/configuration/callbacks#session-callback
         * @param  {object} session      Session object
         * @param  {object} user         User object    (if using database sessions)
         *                               JSON Web Token (if not using database sessions)
         * @return {object}              Session that will be returned to the client
         */
        session: async(session, user) => {
            //session.customSessionProperty = 'bar'
            return Promise.resolve(session)
        },

        /**
         * @link https://next-auth.js.org/configuration/callbacks#jwt-callback
         * @param  {object}  token     Decrypted JSON Web Token
         * @param  {object}  user      User object      (only available on sign in)
         * @param  {object}  account   Provider account (only available on sign in)
         * @param  {object}  profile   Provider profile (only available on sign in)
         * @param  {boolean} isNewUser True if new user (only available on sign in)
         * @return {object}            JSON Web Token that will be saved
         */
        jwt: async(token, user, account, profile, isNewUser) => {
            //const isSignIn = (user) ? true : false
            // Add auth_time to token on signin in
            //if (isSignIn) { token.auth_time = Math.floor(Date.now() / 1000) }
            return Promise.resolve(token)
        },
    },

    // You can define custom pages to override the built-in pages
    // The routes shown here are the default URLs that will be used.
    // @link https://next-auth.js.org/configuration/pages
    pages: {
        //signIn: '/api/auth/signin',
        //signOut: '/api/auth/signout',
        //error: '/api/auth/error', // Error code passed in query string as ?error=
        //verifyRequest: '/api/auth/verify-request', // (used for check email message)
        //newUser: null // If set, new users will be directed here on first sign in
    },

    // Additional options
    // secret: 'abcdef123456789' // Recommended (but auto-generated if not specified)
    //debug: true, // Use this option to enable debug messages in the console
}

// Email HTML body
const html = ({ url, site, email }) => {
    // Insert invisible space into domains and email address to prevent both the
    // email address and the domain from being turned into a hyperlink by email
    // clients like Outlook and Apple mail, as this is confusing because it seems
    // like they are supposed to click on their email address to sign in.
    const escapedEmail = `${email?email.replace(/\./g, '&#8203;.'):''}`
    const escapedSite = `${site?site.replace(/\./g, '&#8203;.'):''}`

    // Some simple styling options111
    const backgroundColor = '#f9f9f9'
    const textColor = '#444444'
    const mainBackgroundColor = '#ffffff'
    const buttonBackgroundColor = '#346df1'
    const buttonBorderColor = '#346df1'
    const buttonTextColor = '#ffffff'

    // Uses tables for layout and inline CSS due to email client limitations
    return `
  <body style="background: ${backgroundColor};">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          <strong>${escapedSite}</strong>
        </td>
      </tr>
    </table>
    <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          Sign in as <strong>${escapedEmail}</strong>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Sign in</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `
}

// Email text body – fallback for email clients that don't render HTML
const text = ({ url, site }) => `Sign in to ${site}\n${url}\n\n`

export default (req, res) => NextAuth(req, res, options)