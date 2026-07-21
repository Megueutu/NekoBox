package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Categoria;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.CategoriaRepository;
import com.example.marketplaceproject.Repository.ProdutoCategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoCategoriaRepository produtoCategoriaRepository;

    public Categoria criarCategoria(String nome) {
        String nomeNormalizado = normalizarNome(nome);
        try {
            return categoriaRepository.saveAndFlush(Categoria.builder().nome(nomeNormalizado).build());
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("Ja existe uma categoria com este nome.");
        }
    }

    public void excluirCategoria(Integer categoriaId) {
        Categoria categoria = buscarPorId(categoriaId);
        produtoCategoriaRepository.findByCategoria_Id(categoria.getId())
                .forEach(produtoCategoriaRepository::delete);
        categoriaRepository.delete(categoria);
    }

    public Categoria buscarPorId(Integer categoriaId) {
        if (categoriaId == null || categoriaId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Categoria nao encontrada para o identificador informado."));
    }

    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll(Sort.by(Sort.Direction.ASC, "nome"));
    }

    private String normalizarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new RegraNegocioException("O nome da categoria e obrigatorio.");
        }
        String nomeNormalizado = nome.trim();
        if (nomeNormalizado.length() > 100) {
            throw new RegraNegocioException("O nome da categoria deve ter no maximo 100 caracteres.");
        }
        return nomeNormalizado;
    }
}
