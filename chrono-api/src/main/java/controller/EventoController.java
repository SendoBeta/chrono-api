package com.chrono.chrono_api.controller;

import com.chrono.chrono_api.model.Evento;
import com.chrono.chrono_api.model.Usuario;
import com.chrono.chrono_api.service.EventoService;
import com.chrono.chrono_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Evento evento) {
        if (evento.getUsuario() == null || evento.getUsuario().getId() == null) {
            return ResponseEntity.badRequest().body("Se requiere el id del usuario.");
        }
        Evento nuevo = eventoService.crear(evento);
        return ResponseEntity.ok(nuevo);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Evento>> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(eventoService.obtenerPorUsuario(usuarioId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Evento evento) {
        return eventoService.obtenerPorId(id)
                .map(e -> {
                    evento.setId(id);
                    return ResponseEntity.ok(eventoService.actualizar(evento));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        return eventoService.obtenerPorId(id)
                .map(e -> {
                    eventoService.eliminar(id);
                    return ResponseEntity.ok().body("Evento eliminado.");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}