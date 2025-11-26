package com.healpoint.validator;

import java.time.LocalDate;

public class FechaValidator {

    public static boolean esFechaValida(LocalDate fecha) {
        if (fecha == null) return false;

        return !fecha.isBefore(LocalDate.now());
    }
}
