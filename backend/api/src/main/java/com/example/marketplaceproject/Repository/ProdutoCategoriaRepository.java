package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.ProdutoCategoria;
import com.example.marketplaceproject.Entity.ProdutoCategoriaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoCategoriaRepository extends JpaRepository<ProdutoCategoria, ProdutoCategoriaId> {

    List<ProdutoCategoria> findByProduto_Id(Integer produtoId);

    List<ProdutoCategoria> findByCategoria_Id(Integer categoriaId);
}
