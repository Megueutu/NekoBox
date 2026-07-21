package com.example.marketplaceproject.Repository;

import com.example.marketplaceproject.Entity.BibliotecaUsuario;
import com.example.marketplaceproject.Entity.BibliotecaUsuarioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BibliotecaUsuarioRepository extends JpaRepository<BibliotecaUsuario, BibliotecaUsuarioId> {

    List<BibliotecaUsuario> findByUsuario_Id(Integer usuarioId);

    boolean existsByUsuario_IdAndProduto_Id(Integer usuarioId, Integer produtoId);

    boolean existsByProduto_Id(Integer produtoId);
}
