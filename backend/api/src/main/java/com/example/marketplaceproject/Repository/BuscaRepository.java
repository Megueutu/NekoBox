package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Busca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuscaRepository extends JpaRepository<Busca, Integer> {

    List<Busca> findTop5ByUsuario_IdOrderByCriadoEmDesc(Integer usuarioId);

}
