package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Service.CarteiraService;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/carteira")
@RequiredArgsConstructor
public class CarteiraController {

    private final CarteiraService carteiraService;
    private final SessaoService sessaoService;

    public record SaldoResponse(BigDecimal saldo) {
    }

    public record ResgatarGiftCardRequest(String codigo) {
    }

    public record ResgateGiftCardResponse(BigDecimal valorCreditado, BigDecimal saldo) {
    }

    public record RecargaRequest(BigDecimal valor) {
    }

    public record RecargaResponse(BigDecimal valorAdicionado, BigDecimal saldo) {
    }

    @GetMapping
    public ResponseEntity<SaldoResponse> consultarSaldo(
            @RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        return ResponseEntity.ok(new SaldoResponse(carteiraService.consultarSaldo(usuarioId)));
    }

    @PostMapping("/recargas")
    public ResponseEntity<RecargaResponse> adicionarSaldo(
            @RequestHeader("Authorization") String authorization,
            @RequestBody RecargaRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        CarteiraService.Recarga recarga = carteiraService.adicionarSaldo(usuarioId, request.valor());
        return ResponseEntity.ok(new RecargaResponse(recarga.valorAdicionado(), recarga.saldo()));
    }

    @PostMapping("/gift-cards/resgates")
    public ResponseEntity<ResgateGiftCardResponse> resgatarGiftCard(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ResgatarGiftCardRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        CarteiraService.Resgate resgate = carteiraService.resgatar(usuarioId, request.codigo());
        return ResponseEntity.ok(new ResgateGiftCardResponse(resgate.valorCreditado(), resgate.saldo()));
    }
}
