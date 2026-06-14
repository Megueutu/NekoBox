package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {

    List<Foto> findByProduto_Id(Integer produtoId);
}
