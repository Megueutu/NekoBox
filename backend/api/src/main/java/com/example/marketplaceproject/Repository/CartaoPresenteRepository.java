package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.CartaoPresente;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartaoPresenteRepository extends JpaRepository<CartaoPresente, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CartaoPresente> findWithLockByCodigoHash(String codigoHash);
}
