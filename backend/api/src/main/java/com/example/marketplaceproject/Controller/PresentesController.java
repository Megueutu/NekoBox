package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Service.CodigoJogoPresenteService;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/presentes")
@RequiredArgsConstructor
public class PresentesController {

    private final CodigoJogoPresenteService codigoJogoPresenteService;
    private final SessaoService sessaoService;

    public record CodigoPresenteResponse(
            Long id, Integer produtoId, String tituloProduto, String codigo,
            boolean resgatado, LocalDateTime criadoEm, LocalDateTime resgatadoEm) {
    }

    @GetMapping
    public ResponseEntity<List<CodigoPresenteResponse>> listar(
            @RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        List<CodigoPresenteResponse> codigos = codigoJogoPresenteService
                .listarPorComprador(usuarioId)
                .stream()
                .map(codigo -> new CodigoPresenteResponse(
                        codigo.id(), codigo.produtoId(), codigo.tituloProduto(),
                        codigo.codigo(), codigo.resgatado(), codigo.criadoEm(),
                        codigo.resgatadoEm()))
                .toList();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(codigos);
    }
}
