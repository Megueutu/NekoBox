package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Sessao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    Optional<Sessao> findByTokenHashAndExpiraEmAfter(String tokenHash, LocalDateTime agora);
    void deleteByTokenHash(String tokenHash);
}
