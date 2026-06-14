package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    List<Produto> findByUsuario_Id(Integer usuarioId);

    List<Produto> findByTituloContainingIgnoreCase(String titulo);
}
