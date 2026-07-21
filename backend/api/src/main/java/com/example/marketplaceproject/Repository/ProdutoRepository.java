package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    @Query("""
            SELECT DISTINCT p FROM Produto p
            LEFT JOIN ProdutoCategoria pc ON pc.produto = p
            WHERE (:titulo IS NULL OR LOWER(p.titulo) LIKE LOWER(CONCAT('%', CAST(:titulo AS string), '%')))
              AND (:categoriaId IS NULL OR pc.categoria.id = :categoriaId)
              AND (:precoMinimo IS NULL OR p.preco >= :precoMinimo)
              AND (:precoMaximo IS NULL OR p.preco <= :precoMaximo)
            """)
    Page<Produto> buscar(
            @Param("titulo") String titulo,
            @Param("categoriaId") Integer categoriaId,
            @Param("precoMinimo") BigDecimal precoMinimo,
            @Param("precoMaximo") BigDecimal precoMaximo,
            Pageable pageable);
}
