package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {

    List<Pagamento> findByUsuario_Id(Integer usuarioId);

    List<Pagamento> findByProduto_Id(Integer produtoId);

    List<Pagamento> findByStatus(String status);
}
