package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    List<Avaliacao> findByProduto_Id(Integer produtoId);

    List<Avaliacao> findByUsuario_Id(Integer usuarioId);

    Optional<Avaliacao> findByUsuario_IdAndProduto_Id(Integer usuarioId, Integer produtoId);
}
