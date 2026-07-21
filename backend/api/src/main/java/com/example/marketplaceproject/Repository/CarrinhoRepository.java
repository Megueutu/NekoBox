package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarrinhoRepository extends JpaRepository<Carrinho, Integer> {

    Optional<Carrinho> findByUsuario_Id(Integer usuarioId);
}
