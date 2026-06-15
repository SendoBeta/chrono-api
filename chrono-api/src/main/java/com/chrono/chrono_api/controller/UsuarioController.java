package com.chrono.chrono_api.controller;

import com.chrono.chrono_api.model.Usuario;
import com.chrono.chrono_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        if (usuarioService.existeNombre(usuario.getNombre())) {
            return ResponseEntity.badRequest().body("El nombre de usuario ya existe.");
        }
        if (usuario.getCorreo() != null && usuarioService.existeCorreo(usuario.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado.");
        }
        Usuario nuevo = usuarioService.registrar(usuario);
        return ResponseEntity.ok(nuevo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        return usuarioService.login(usuario.getNombre(), usuario.getContrasena())
                .map(u -> ResponseEntity.ok((Object) u))
                .orElse(ResponseEntity.status(401).body("Credenciales incorrectas."));
    }
}