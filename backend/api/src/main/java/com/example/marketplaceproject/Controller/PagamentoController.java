package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Pagamento;
import com.example.marketplaceproject.Service.PagamentoService;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;
    private final SessaoService sessaoService;

    public record PagamentoResponse(
            Integer id, Integer produtoId, String tituloProduto, Integer quantidade,
            Boolean paraPresente, BigDecimal valorPago, String status) {
    }

    public record CodigoPresenteResponse(
            Integer produtoId, String tituloProduto, String codigo) {
    }

    public record CheckoutResponse(
            List<PagamentoResponse> pagamentos, List<CodigoPresenteResponse> codigosPresente) {
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        PagamentoService.ResultadoCheckout resultado = pagamentoService.checkout(usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(new CheckoutResponse(
                        resultado.pagamentos().stream().map(this::paraResponse).toList(),
                        resultado.codigosPresente().stream()
                                .map(codigo -> new CodigoPresenteResponse(
                                        codigo.produtoId(), codigo.tituloProduto(), codigo.codigo()))
                                .toList()));
    }

    @GetMapping
    public ResponseEntity<List<PagamentoResponse>> listar(@RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        List<PagamentoResponse> pagamentos = pagamentoService.listarPorUsuario(usuarioId).stream()
                .map(this::paraResponse)
                .toList();
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoResponse> buscarPorId(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        Pagamento pagamento = pagamentoService.buscarPorId(id);
        if (!pagamento.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Voce nao tem permissao para visualizar este pagamento.");
        }
        return ResponseEntity.ok(paraResponse(pagamento));
    }

    private PagamentoResponse paraResponse(Pagamento pagamento) {
        return new PagamentoResponse(
                pagamento.getId(), pagamento.getProduto().getId(), pagamento.getProduto().getTitulo(),
                pagamento.getQuantidade(), pagamento.getParaPresente(),
                pagamento.getValorPago(), pagamento.getStatus().getValor());
    }
}
