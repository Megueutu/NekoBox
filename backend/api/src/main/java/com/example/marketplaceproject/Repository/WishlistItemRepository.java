package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Integer> {
    List<WishlistItem> findByUsuario_IdOrderByCriadoEmDesc(Integer usuarioId);
    Optional<WishlistItem> findByUsuario_IdAndProduto_Id(Integer usuarioId, Integer produtoId);
    boolean existsByUsuario_IdAndProduto_Id(Integer usuarioId, Integer produtoId);
}
