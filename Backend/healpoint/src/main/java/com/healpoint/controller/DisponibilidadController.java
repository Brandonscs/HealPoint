package com.healpoint.controller;

import com.healpoint.entity.Disponibilidad;
import com.healpoint.repository.DisponibilidadRepository;
import com.healpoint.repository.MedicoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disponibilidad")
public class DisponibilidadController {

    private final DisponibilidadRepository disponibilidadRepository;
    private final MedicoRepository medicoRepository;

    public DisponibilidadController(DisponibilidadRepository disponibilidadRepository,
                                    MedicoRepository medicoRepository) {
        this.disponibilidadRepository = disponibilidadRepository;
        this.medicoRepository = medicoRepository;
    }

    // GET → Listar todas las disponibilidades
    @GetMapping("/mostrarDisponibilidades")
    public List<Disponibilidad> getDisponibilidades() {
        return disponibilidadRepository.findAll();
    }

    // GET → Buscar por médico usando id_medico
    @GetMapping("/mostrarDisponibilidad")
    public List<Disponibilidad> getDisponibilidadByMedico(@RequestParam Integer id_medico) {
        return disponibilidadRepository.findByMedico(id_medico);
    }

    // POST → Crear disponibilidad (solo RequestBody)
    @PostMapping("/crearDisponibilidad")
    public Disponibilidad crearDisponibilidad(@RequestBody Disponibilidad disponibilidad) {

        // Validar que el médico exista usando id_medico
        medicoRepository.findById(disponibilidad.getMedico().getId_medico())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        return disponibilidadRepository.save(disponibilidad);
    }

    // PUT → Actualizar disponibilidad (solo RequestBody)
    @PutMapping("/actualizarDisponibilidad")
    public Disponibilidad actualizarDisponibilidad(@RequestBody Disponibilidad nuevaData) {

        return disponibilidadRepository.findById(nuevaData.getId_disponibilidad()).map(d -> {

            d.setFecha(nuevaData.getFecha());
            d.setHora_inicio(nuevaData.getHora_inicio());
            d.setHora_fin(nuevaData.getHora_fin());
            d.setMedico(nuevaData.getMedico());

            return disponibilidadRepository.save(d);

        }).orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));
    }

    // DELETE → Eliminar
    @DeleteMapping("/eliminarDisponibilidad")
    public String eliminarDisponibilidad(@RequestParam Integer id) {
        disponibilidadRepository.deleteById(id);
        return "Disponibilidad eliminada exitosamente.";
    }
}

