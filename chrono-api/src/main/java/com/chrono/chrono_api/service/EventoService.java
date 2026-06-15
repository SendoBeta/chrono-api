package com.chrono.chrono_api.service;

import com.chrono.chrono_api.model.Evento;
import com.chrono.chrono_api.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    public Evento crear(Evento evento) {
        return eventoRepository.save(evento);
    }

    public List<Evento> obtenerPorUsuario(Long usuarioId) {
        return eventoRepository.findByUsuarioId(usuarioId);
    }

    public Optional<Evento> obtenerPorId(Long id) {
        return eventoRepository.findById(id);
    }

    public Evento actualizar(Evento evento) {
        return eventoRepository.save(evento);
    }

    public void eliminar(Long id) {
        eventoRepository.deleteById(id);
    }
}