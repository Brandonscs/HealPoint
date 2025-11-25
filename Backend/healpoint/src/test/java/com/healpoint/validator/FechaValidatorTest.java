package com.healpoint.validator;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class FechaValidatorTest {

    @Test
    void testFechaValidaFutura() {
        LocalDate futuro = LocalDate.now().plusDays(1);
        assertTrue(FechaValidator.esFechaValida(futuro));
    }

    @Test
    void testFechaHoyEsValida() {
        assertTrue(FechaValidator.esFechaValida(LocalDate.now()));
    }

    @Test
    void testFechaPasadaEsInvalida() {
        LocalDate pasada = LocalDate.now().minusDays(1);
        assertFalse(FechaValidator.esFechaValida(pasada));
    }

    @Test
    void testFechaNulaEsInvalida() {
        assertFalse(FechaValidator.esFechaValida(null));
    }
}
