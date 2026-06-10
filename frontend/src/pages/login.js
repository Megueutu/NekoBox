import { Button } from '../components/button.js'

export function loginApp() {
    const app = document.createElement('div')
    
    const googleBtn = Button('Sign in with Google', 'auth', null, 'google')
    const facebookBtn = Button('Sign in with Facebook', 'auth', null, 'facebook')

    const html = `
        <h1>Login</h1>
        <div>
            <div></div>
            <div></div>
        </div>
    `
}