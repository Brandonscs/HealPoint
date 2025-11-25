package com.healpoint.service;

import com.healpoint.entity.Disponibilidad;
import com.healpoint.repository.DisponibilidadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class DisponibilidadService {

    private final DisponibilidadRepository disponibilidadRepository;

    public DisponibilidadService(DisponibilidadRepository disponibilidadRepository) {
        this.disponibilidadRepository = disponibilidadRepository;
    }

    public boolean medicoDisponible(Integer idMedico, LocalDate fecha, LocalTime hora) {

        List<Disponibilidad> disponibilidades =
                disponibilidadRepository.findByMedico(idMedico);

        return disponibilidades.stream().anyMatch(d ->
                d.getFecha().equals(fecha)
                        && ( !hora.isBefore(d.getHora_inicio()) )
                        && ( !hora.isAfter(d.getHora_fin()) )
        );
    }
}
