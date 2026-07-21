package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByNomeUsuarioIgnoreCase(String nomeUsuario);

}
