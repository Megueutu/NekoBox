package com.example.marketplaceproject.Exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErroResposta(
            LocalDateTime timestamp, int status, String erro, String mensagem, String caminho) {
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> tratarNaoEncontrado(
            RecursoNaoEncontradoException ex, HttpServletRequest request) {
        return construir(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResposta> tratarAcessoNegado(
            AccessDeniedException ex, HttpServletRequest request) {
        return construir(HttpStatus.FORBIDDEN, "Voce nao tem permissao para executar esta acao.", request);
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroResposta> tratarCredenciaisInvalidas(
            CredenciaisInvalidasException ex, HttpServletRequest request) {
        return construir(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(SaldoInsuficienteException.class)
    public ResponseEntity<ErroResposta> tratarSaldoInsuficiente(
            SaldoInsuficienteException ex, HttpServletRequest request) {
        return construir(HttpStatus.PAYMENT_REQUIRED, ex.getMessage(), request);
    }

    @ExceptionHandler(ConflitoDeDadosException.class)
    public ResponseEntity<ErroResposta> tratarConflito(
            ConflitoDeDadosException ex, HttpServletRequest request) {
        return construir(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler({CampoInvalidoException.class, RegraNegocioException.class, IllegalArgumentException.class})
    public ResponseEntity<ErroResposta> tratarRequisicaoInvalida(
            RuntimeException ex, HttpServletRequest request) {
        return construir(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErroResposta> tratarArquivoGrande(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return construir(HttpStatus.CONTENT_TOO_LARGE, "Arquivo excede o tamanho maximo permitido.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> tratarErroGenerico(Exception ex, HttpServletRequest request) {
        return construir(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno inesperado.", request);
    }

    private ResponseEntity<ErroResposta> construir(HttpStatus status, String mensagem, HttpServletRequest request) {
        ErroResposta corpo = new ErroResposta(
                LocalDateTime.now(), status.value(), status.getReasonPhrase(), mensagem, request.getRequestURI());
        return ResponseEntity.status(status).body(corpo);
    }
}
