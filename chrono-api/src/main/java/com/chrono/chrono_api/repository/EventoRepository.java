package com.chrono.chrono_api.repository;

import com.chrono.chrono_api.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByUsuarioId(Long usuarioId);
}