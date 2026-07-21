package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Pagamento;
import com.example.marketplaceproject.Entity.Enuns.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {

    List<Pagamento> findByUsuario_Id(Integer usuarioId);

    boolean existsByUsuario_IdAndProduto_IdAndStatus(
            Integer usuarioId, Integer produtoId, StatusPagamento status);

    boolean existsByProduto_Id(Integer produtoId);

}
