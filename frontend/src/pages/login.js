import { Button } from '../components/button.js'
import { cadastrar } from '../core/login/register.js'
import { login, loginWithGoogle } from '../core/login/login.js'

export function loginApp() {
    const app = document.createElement('section')
    app.className = 'page page-login'

    const title = document.createElement('h1')
    title.textContent = 'Login'

    const form = document.createElement('form')
    form.className = 'login-form'

    const emailInput = document.createElement('input')
    emailInput.type = 'email'
    emailInput.placeholder = 'Email'
    emailInput.required = true

    const passwordInput = document.createElement('input')
    passwordInput.type = 'password'
    passwordInput.placeholder = 'Senha'
    passwordInput.required = true

    const feedback = document.createElement('p')
    feedback.className = 'login-feedback'

    const loginBtn = Button('Entrar')
    const registerBtn = Button('Criar conta')
    const googleBtn = Button('Entrar com Google')

    loginBtn.type = 'submit'

    loginBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        feedback.textContent = ''

        try {
            await login(emailInput.value, passwordInput.value)
        } catch (error) {
            feedback.textContent = error.message
        }
    })

    registerBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        feedback.textContent = ''

        try {
            await cadastrar(emailInput.value, passwordInput.value)
        } catch (error) {
            feedback.textContent = error.message
        }
    })

    googleBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        feedback.textContent = ''

        try {
            await loginWithGoogle()
        } catch (error) {
            feedback.textContent = error.message
        }
    })

    form.append(emailInput, passwordInput, feedback, loginBtn, registerBtn, googleBtn)
    app.append(title, form)

    return app
}