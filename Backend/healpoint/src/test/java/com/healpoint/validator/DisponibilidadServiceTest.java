package com.healpoint.service;

import com.healpoint.entity.Disponibilidad;
import com.healpoint.repository.DisponibilidadRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DisponibilidadServiceTest {

    private DisponibilidadRepository disponibilidadRepository;
    private DisponibilidadService disponibilidadService;

    @BeforeEach
    void setUp() {
        disponibilidadRepository = Mockito.mock(DisponibilidadRepository.class);
        disponibilidadService = new DisponibilidadService(disponibilidadRepository);
    }

    @Test
    void medicoDisponible_CuandoHoraDentroDelRango() {

        Disponibilidad d = new Disponibilidad();
        d.setFecha(LocalDate.of(2025, 1, 10));
        d.setHora_inicio(LocalTime.of(8, 0));
        d.setHora_fin(LocalTime.of(12, 0));

        when(disponibilidadRepository.findByMedico(1))
                .thenReturn(List.of(d));

        boolean disponible = disponibilidadService.medicoDisponible(
                1,
                LocalDate.of(2025, 1, 10),
                LocalTime.of(9, 0)
        );

        assertTrue(disponible);
    }

    @Test
    void medicoNoDisponible_CuandoHoraFueraDelRango() {

        Disponibilidad d = new Disponibilidad();
        d.setFecha(LocalDate.of(2025, 1, 10));
        d.setHora_inicio(LocalTime.of(8, 0));
        d.setHora_fin(LocalTime.of(12, 0));

        when(disponibilidadRepository.findByMedico(1))
                .thenReturn(List.of(d));

        boolean disponible = disponibilidadService.medicoDisponible(
                1,
                LocalDate.of(2025, 1, 10),
                LocalTime.of(13, 0)
        );

        assertFalse(disponible);
    }

    @Test
    void medicoNoDisponible_SiNoHayDisponibilidades() {

        when(disponibilidadRepository.findByMedico(1))
                .thenReturn(List.of());

        boolean disponible = disponibilidadService.medicoDisponible(
                1,
                LocalDate.of(2025, 1, 10),
                LocalTime.of(9, 0)
        );

        assertFalse(disponible);
    }

    @Test
    void medicoDisponible_VariosRangos() {

        Disponibilidad manana = new Disponibilidad();
        manana.setFecha(LocalDate.of(2025, 1, 10));
        manana.setHora_inicio(LocalTime.of(8, 0));
        manana.setHora_fin(LocalTime.of(12, 0));

        Disponibilidad tarde = new Disponibilidad();
        tarde.setFecha(LocalDate.of(2025, 1, 10));
        tarde.setHora_inicio(LocalTime.of(14, 0));
        tarde.setHora_fin(LocalTime.of(18, 0));

        when(disponibilidadRepository.findByMedico(1))
                .thenReturn(List.of(manana, tarde));

        boolean disponible = disponibilidadService.medicoDisponible(
                1,
                LocalDate.of(2025, 1, 10),
                LocalTime.of(16, 0)
        );

        assertTrue(disponible);
    }

    @Test
    void medicoNoDisponible_CuandoFechaNoCoincide() {

        Disponibilidad d = new Disponibilidad();
        d.setFecha(LocalDate.of(2025, 1, 11)); // fecha distinta
        d.setHora_inicio(LocalTime.of(8, 0));
        d.setHora_fin(LocalTime.of(12, 0));

        when(disponibilidadRepository.findByMedico(1))
                .thenReturn(List.of(d));

        boolean disponible = disponibilidadService.medicoDisponible(
                1,
                LocalDate.of(2025, 1, 10),
                LocalTime.of(9, 0)
        );

        assertFalse(disponible);
    }
}
