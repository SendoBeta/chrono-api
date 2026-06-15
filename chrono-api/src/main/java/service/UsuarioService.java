package com.chrono.chrono_api.service;

import com.chrono.chrono_api.model.Usuario;
import com.chrono.chrono_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario registrar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> login(String nombre, String contrasena) {
        Optional<Usuario> usuario = usuarioRepository.findByNombre(nombre);
        if (usuario.isPresent() && usuario.get().getContrasena().equals(contrasena)) {
            return usuario;
        }
        return Optional.empty();
    }

    public boolean existeNombre(String nombre) {
        return usuarioRepository.findByNombre(nombre).isPresent();
    }

    public boolean existeCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo).isPresent();
    }
}