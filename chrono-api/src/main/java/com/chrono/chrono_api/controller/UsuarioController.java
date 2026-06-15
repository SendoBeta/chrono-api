package com.chrono.chrono_api.controller;

import com.chrono.chrono_api.model.Usuario;
import com.chrono.chrono_api.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            logger.info("Intento de registro para usuario: {}", usuario.getNombre());

            if (usuarioService.existeNombre(usuario.getNombre())) {
                logger.warn("Intento de registro fallido - Usuario ya existe: {}", usuario.getNombre());
                return ResponseEntity.badRequest().body("El nombre de usuario ya existe.");
            }
            if (usuario.getCorreo() != null && usuarioService.existeCorreo(usuario.getCorreo())) {
                logger.warn("Intento de registro fallido - Correo ya registrado: {}", usuario.getCorreo());
                return ResponseEntity.badRequest().body("El correo ya está registrado.");
            }
            Usuario nuevo = usuarioService.registrar(usuario);
            logger.info("Usuario registrado exitosamente: {}", nuevo.getNombre());
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            logger.error("Error en registro de usuario: {}", usuario.getNombre(), e);
            return ResponseEntity.status(500).body("Error al registrar usuario: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        try {
            logger.info("Intento de login para usuario: {}", usuario.getNombre());

            var resultado = usuarioService.login(usuario.getNombre(), usuario.getContrasena());

            if (resultado.isPresent()) {
                logger.info("Login exitoso para usuario: {}", usuario.getNombre());
                return ResponseEntity.ok((Object) resultado.get());
            } else {
                logger.warn("Login fallido - Credenciales incorrectas para usuario: {}", usuario.getNombre());
                return ResponseEntity.status(401).body("Credenciales incorrectas.");
            }
        } catch (Exception e) {
            logger.error("Error en login para usuario: {}", usuario.getNombre(), e);
            return ResponseEntity.status(500).body("Error en el proceso de login: " + e.getMessage());
        }
    }
}