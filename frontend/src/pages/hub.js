import { Button } from '../components/button.js'
import { auth } from '../core/firebase.js'
import { logout } from '../core/login/logout.js'

export function hubApp() {
    const app = document.createElement('section')
    app.className = 'page page-hub'

    const title = document.createElement('h1')
    title.textContent = 'Hub'

    const description = document.createElement('p')
    const user = auth.currentUser
    description.textContent = user
        ? `Você está autenticado como ${user.email || user.displayName || 'usuário'}.`
        : 'Esta é a página principal depois do login.'

    const logoutBtn = Button('Logout')
    logoutBtn.addEventListener('click', async () => {
        await logout()
    })

    app.append(title, description, logoutBtn)

    return app
}

import { HeroSlider } from '../components/hero-slider.js';
const app = document.getElementById('app');

app.innerHTML = `
    ${HeroSlider()}
`;