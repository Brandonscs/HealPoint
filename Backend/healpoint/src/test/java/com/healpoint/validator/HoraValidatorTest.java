package com.healpoint.validator;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class HoraValidatorTest {

    @Test
    void testHoraDentroDeRango() {
        LocalTime hora = LocalTime.of(10, 30);
        assertTrue(HoraValidator.esHoraEnRango(hora));
    }

    @Test
    void testHoraExactamenteLimiteInferior() {
        LocalTime hora = LocalTime.of(6, 0);
        assertTrue(HoraValidator.esHoraEnRango(hora));
    }

    @Test
    void testHoraExactamenteLimiteSuperior() {
        LocalTime hora = LocalTime.of(20, 0);
        assertTrue(HoraValidator.esHoraEnRango(hora));
    }

    @Test
    void testHoraAntesDeHorario() {
        LocalTime hora = LocalTime.of(5, 59);
        assertFalse(HoraValidator.esHoraEnRango(hora));
    }

    @Test
    void testHoraDespuesDeHorario() {
        LocalTime hora = LocalTime.of(20, 1);
        assertFalse(HoraValidator.esHoraEnRango(hora));
    }

    @Test
    void testHoraNulaEsInvalida() {
        assertFalse(HoraValidator.esHoraEnRango(null));
    }

    @Test
    void testHoraDelPasadoCuandoFechaEsHoy() {
        LocalDate hoy = LocalDate.now();
        LocalTime horaPasada = LocalTime.now().minusMinutes(10);

        assertTrue(HoraValidator.esHoraDelPasado(hoy, horaPasada));
    }

    @Test
    void testHoraFuturaCuandoFechaEsHoy() {
        LocalDate hoy = LocalDate.now();
        LocalTime horaFutura = LocalTime.now().plusMinutes(30);

        assertFalse(HoraValidator.esHoraDelPasado(hoy, horaFutura));
    }

    @Test
    void testHoraDelPasadoCuandoFechaEsFutura() {
        LocalDate futura = LocalDate.now().plusDays(1);
        LocalTime cualquiera = LocalTime.of(8, 0);

        assertFalse(HoraValidator.esHoraDelPasado(futura, cualquiera));
    }
}
