package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Enuns.TipoFoto;
import com.example.marketplaceproject.Entity.Foto;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.FotoRepository;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FotoService {

    private final FotoRepository fotoRepository;
    private final ProdutoRepository produtoRepository;

    public Foto adicionarFoto(Integer produtoId, String url, String publicId, TipoFoto tipo) {
        Produto produto = buscarProduto(produtoId);
        if (url == null || url.isBlank()) {
            throw new CampoInvalidoException("URL da foto invalida.");
        }
        if (tipo == null) {
            throw new RegraNegocioException("O tipo da foto deve ser informado.");
        }
        if (!tipo.permiteMultiplas() && fotoRepository.existsByProduto_IdAndTipo(produtoId, tipo)) {
            throw new ConflitoDeDadosException("O produto ja possui uma foto deste tipo.");
        }

        return fotoRepository.save(Foto.builder()
                .produto(produto)
                .url(url.trim())
                .publicId(publicId)
                .tipo(tipo)
                .build());
    }

    public Foto buscarPorId(Integer produtoId, Integer fotoId) {
        Foto foto = buscarPorId(fotoId);
        if (!foto.getProduto().getId().equals(produtoId)) {
            throw new RecursoNaoEncontradoException("Foto nao encontrada para o produto informado.");
        }
        return foto;
    }

    public void removerFoto(Integer fotoId) {
        fotoRepository.delete(buscarPorId(fotoId));
    }

    public List<Foto> listarFotosDoProduto(Integer produtoId) {
        buscarProduto(produtoId);
        return fotoRepository.findByProduto_Id(produtoId);
    }

    public Map<String, Object> obterFotosParaFrontend(Integer produtoId) {
        Map<String, Object> fotos = new LinkedHashMap<>();
        fotos.put(TipoFoto.BANNER.getValor(), null);
        fotos.put(TipoFoto.POSTER.getValor(), null);
        fotos.put(TipoFoto.DEMO.getValor(), new ArrayList<String>());

        for (Foto foto : listarFotosDoProduto(produtoId)) {
            if (foto.getTipo().permiteMultiplas()) {
                @SuppressWarnings("unchecked")
                List<String> demos = (List<String>) fotos.get(TipoFoto.DEMO.getValor());
                demos.add(foto.getUrl());
            } else {
                fotos.put(foto.getTipo().getValor(), foto.getUrl());
            }
        }
        return fotos;
    }

    private Foto buscarPorId(Integer fotoId) {
        if (fotoId == null || fotoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return fotoRepository.findById(fotoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Foto nao encontrada para o identificador informado."));
    }

    private Produto buscarProduto(Integer produtoId) {
        if (produtoId == null || produtoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado para o identificador informado."));
    }
}
