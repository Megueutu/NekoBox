package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Pagamento;
import com.example.marketplaceproject.Service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public record PagamentoResponse(
            Integer id, Integer produtoId, String tituloProduto, BigDecimal valorPago, String status) {
    }

    @PostMapping("/checkout")
    public ResponseEntity<List<PagamentoResponse>> checkout(@RequestParam Integer usuarioId) {
        List<Pagamento> pagamentos = pagamentoService.checkout(usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pagamentos.stream().map(this::paraResponse).toList());
    }

    @GetMapping
    public ResponseEntity<List<PagamentoResponse>> listar(@RequestParam Integer usuarioId) {
        List<PagamentoResponse> pagamentos = pagamentoService.listarPorUsuario(usuarioId).stream()
                .map(this::paraResponse)
                .toList();
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoResponse> buscarPorId(
            @RequestParam Integer usuarioId, @PathVariable Integer id) {
        Pagamento pagamento = pagamentoService.buscarPorId(id);
        if (!pagamento.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Voce nao tem permissao para visualizar este pagamento.");
        }
        return ResponseEntity.ok(paraResponse(pagamento));
    }

    private PagamentoResponse paraResponse(Pagamento pagamento) {
        return new PagamentoResponse(
                pagamento.getId(), pagamento.getProduto().getId(), pagamento.getProduto().getTitulo(),
                pagamento.getValorPago(), pagamento.getStatus().getValor());
    }
}
