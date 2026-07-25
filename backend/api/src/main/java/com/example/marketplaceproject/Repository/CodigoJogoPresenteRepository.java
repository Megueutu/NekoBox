package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.CodigoJogoPresente;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CodigoJogoPresenteRepository extends JpaRepository<CodigoJogoPresente, Long> {

    boolean existsByCodigoHash(String codigoHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select codigo
            from CodigoJogoPresente codigo
            join fetch codigo.produto
            join fetch codigo.comprador
            where codigo.codigoHash = :codigoHash
            """)
    Optional<CodigoJogoPresente> buscarParaResgate(@Param("codigoHash") String codigoHash);

    @Query("""
            select codigo
            from CodigoJogoPresente codigo
            join fetch codigo.produto
            left join fetch codigo.resgatadoPor
            where codigo.comprador.id = :compradorId
            order by codigo.criadoEm desc, codigo.id desc
            """)
    List<CodigoJogoPresente> listarPorComprador(@Param("compradorId") Integer compradorId);
}
