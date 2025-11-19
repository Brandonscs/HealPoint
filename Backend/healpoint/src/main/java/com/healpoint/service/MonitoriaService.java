package com.healpoint.service;

import com.healpoint.entity.Monitoria;
import com.healpoint.entity.Usuario;
import com.healpoint.repository.MonitoriaRepository;
import com.healpoint.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MonitoriaService {

    @Autowired
    private MonitoriaRepository monitoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public void registrarAccion(String tabla, String accion, Integer idUsuario, String descripcion) {

        Monitoria monitoria = new Monitoria();
        monitoria.setTablaAfectada(tabla);
        monitoria.setAccion(accion);
        monitoria.setDescripcion(descripcion);

        if (idUsuario != null) {
            Usuario u = usuarioRepository.findById(idUsuario).orElse(null);
            monitoria.setUsuarioResponsable(u);
        }

        monitoriaRepository.save(monitoria);
    }
}
