export function Footer() {
  return `
    <footer class="bg-zinc-900 border-t border-zinc-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">

        <div class="col-span-2 md:col-span-1">
          <p class="text-white font-black text-lg mb-2">GameStore</p>
          <p class="text-zinc-400 text-sm leading-relaxed">
            Marketplace de jogos digitais.<br>
            Compre, jogue e gerencie sua biblioteca.
          </p>
        </div>

        <div>
          <p class="text-zinc-300 font-semibold text-sm mb-3">Navegação</p>
          <ul class="space-y-2">
            <li><a href="/hub" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Catálogo</a></li>
            <li><a href="/cart" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Carrinho</a></li>
            <li><a href="/wishlist" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Lista de Desejos</a></li>
            <li><a href="/library" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Biblioteca</a></li>
          </ul>
        </div>

        <div>
          <p class="text-zinc-300 font-semibold text-sm mb-3">Conta</p>
          <ul class="space-y-2">
            <li><a href="/profile" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Meu Perfil</a></li>
            <li><a href="/library" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Minha Biblioteca</a></li>
            <li><a href="/login" data-link class="text-zinc-400 hover:text-white text-sm transition-colors">Entrar / Cadastrar</a></li>
          </ul>
        </div>

        <div>
          <p class="text-zinc-300 font-semibold text-sm mb-3">Suporte</p>
          <ul class="space-y-2">
            <li><span class="text-zinc-500 text-sm">Central de Ajuda</span></li>
            <li><span class="text-zinc-500 text-sm">Termos de Uso</span></li>
            <li><span class="text-zinc-500 text-sm">Privacidade</span></li>
          </ul>
        </div>

      </div>

      <div class="border-t border-zinc-800 px-4 py-4">
        <p class="text-zinc-500 text-xs text-center">
          © ${new Date().getFullYear()} GameStore — Marketplace de Jogos Digitais. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  `;
}
