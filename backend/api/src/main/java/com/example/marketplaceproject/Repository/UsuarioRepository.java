package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Entity.Enuns.PapelUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByNomeUsuarioIgnoreCase(String nomeUsuario);

    List<Usuario> findAllByOrderByIdAsc();

    long countByPapel(PapelUsuario papel);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Usuario> findWithLockById(Integer id);

}
