package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.CarrinhoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarrinhoItemRepository extends JpaRepository<CarrinhoItem, Integer> {

    List<CarrinhoItem> findByCarrinho_Id(Integer carrinhoId);

    Optional<CarrinhoItem> findByCarrinho_IdAndProduto_Id(Integer carrinhoId, Integer produtoId);
}
