package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Carrinho;
import com.example.marketplaceproject.Entity.CarrinhoItem;
import com.example.marketplaceproject.Entity.Enuns.StatusPagamento;
import com.example.marketplaceproject.Entity.Pagamento;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.CarrinhoVazioException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Exception.SaldoInsuficienteException;
import com.example.marketplaceproject.Repository.CarrinhoItemRepository;
import com.example.marketplaceproject.Repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final UsuarioService usuarioService;
    private final CarrinhoService carrinhoService;
    private final CarrinhoItemRepository carrinhoItemRepository;
    private final BibliotecaUsuarioService bibliotecaUsuarioService;

    @Transactional
    public List<Pagamento> checkout(Integer usuarioId) {
        Usuario comprador = usuarioService.buscarPorId(usuarioId);
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        List<CarrinhoItem> itens = carrinhoItemRepository.findByCarrinho_Id(carrinho.getId());

        if (itens.isEmpty()) {
            throw new CarrinhoVazioException("Nao e possivel iniciar o pagamento de um carrinho vazio.");
        }

        BigDecimal total = itens.stream()
                .map(item -> item.getProduto().getPreco())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);

        if (comprador.getSaldo().compareTo(total) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente para concluir a compra.");
        }

        List<Pagamento> pagamentos = new ArrayList<>();
        for (CarrinhoItem item : itens) {
            pagamentos.add(processarItem(comprador, item.getProduto()));
        }

        usuarioService.salvar(comprador);
        carrinhoItemRepository.deleteAll(itens);
        return pagamentos;
    }

    public Pagamento buscarPorId(Integer pagamentoId) {
        if (pagamentoId == null || pagamentoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Pagamento nao encontrado para o identificador informado."));
    }

    public List<Pagamento> listarPorUsuario(Integer usuarioId) {
        usuarioService.buscarPorId(usuarioId);
        return pagamentoRepository.findByUsuario_Id(usuarioId);
    }

    private Pagamento processarItem(Usuario comprador, Produto produto) {
        if (produto.getUsuario().getId().equals(comprador.getId())) {
            throw new RegraNegocioException("O vendedor nao pode comprar o proprio produto.");
        }

        Usuario vendedor = usuarioService.buscarPorId(produto.getUsuario().getId());
        BigDecimal preco = produto.getPreco().setScale(2, RoundingMode.HALF_EVEN);

        comprador.setSaldo(comprador.getSaldo().subtract(preco).setScale(2, RoundingMode.HALF_EVEN));
        vendedor.setSaldo(vendedor.getSaldo().add(preco).setScale(2, RoundingMode.HALF_EVEN));
        usuarioService.salvar(vendedor);

        Pagamento pagamento = pagamentoRepository.save(Pagamento.builder()
                .usuario(comprador)
                .produto(produto)
                .valorPago(preco)
                .status(StatusPagamento.APROVADO)
                .build());

        bibliotecaUsuarioService.adicionarProduto(comprador.getId(), produto.getId());
        return pagamento;
    }
}
