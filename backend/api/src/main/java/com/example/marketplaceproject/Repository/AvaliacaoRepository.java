package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    List<Avaliacao> findByProduto_Id(Integer produtoId);
}
