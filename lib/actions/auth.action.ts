'use server'

import { auth, db } from "@/firebase/admin"
import { cookies } from "next/headers"

const ONE_WEEK = 60 * 60 * 24 * 7

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params

    try {
        const userRecord = await db.collection('users').doc(uid).get()

        if(userRecord.exists) {
            return {
                success: false, 
                message: 'User already exists, Sign in instead'
            }
        }

        await db.collection('users').doc(uid).set({
            name, 
            email
        })

        return {
            success: true, 
            message: "Account created Successfully, Please Sign in"
        }

    } catch (error: any) {
        console.error('Error creating an User', error)

        if(error.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: 'This email is already in use'
            }
        }

        return {
            success: false, 
            message: 'Failed to create an Account'
        }
    }
}


// This function:
// 1. Takes a Firebase ID token.
// 2. Exchanges it for a **secure session cookie** using Firebase Admin SDK.
// 3. Sets it on the client with strong options (`httpOnly`, `secure`, `sameSite`)
export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies(); 

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000, // in miliseconds 
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK, // in seconds 
        httpOnly: true, // js can't access the cookie 
        secure: process.env.NODE_ENV === 'production',  // cookie only sent over https (enabled in production)
        path: '/',  // cookie valid for the entire site 
        sameSite: 'lax',  // Helps prevent CSRF, while allowing some external redirects 
    })
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params

    try {
        const userRecord = await auth.getUserByEmail(email)
        if(!userRecord) {
            return {
                success: false, 
                message: "User doesn't exist. Create an Account"   
            }
        }
        await setSessionCookie(idToken)

    } catch (error) {
        console.log("Error signing in: ", error)

        return {
            success: false, 
            message: 'Failed to log into an account'
        }
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies(); 
    const sessionCookie = cookieStore.get('session')?.value // if the session cookie exists then store to sessionCookie
    if(!sessionCookie) return null;  // cookie doesn't exists -> user doesn't exist 
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);  // true -> the sessionCookie is revoked or not 
        const userRecord = await db.collection('users')
                                    .doc(decodedClaims.uid)
                                    .get(); 
        if(!userRecord.exists) return null;

        return {
            ...userRecord.data(), 
            id: userRecord.id, 
        } as User

    } catch (error) {
        console.error(error)
        return null; 
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser(); 
    
    // if we don't get any use in return ('' -> empty string)
    // then the isAuthenticated will return false; 

    // but if we get an user ('gourav') 
    // then the isAuthenticated will return true; 
    return !!user; // '' -> !'' -> true -> !true -> false

    
    // { name: 'gourav} -> !{} -> false -> !false -> true 
 }