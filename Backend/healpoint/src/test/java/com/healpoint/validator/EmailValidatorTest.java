package com.healpoint.validator;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailValidatorTest {

    @Test
    void testCorreoValido() {
        assertTrue(EmailValidator.esCorreoValido("usuario@example.com"));
    }

    @Test
    void testCorreoSinArroba() {
        assertFalse(EmailValidator.esCorreoValido("usuarioexample.com"));
    }

    @Test
    void testCorreoSinDominio() {
        assertFalse(EmailValidator.esCorreoValido("usuario@"));
    }

    @Test
    void testCorreoVacio() {
        assertFalse(EmailValidator.esCorreoValido(""));
    }

    @Test
    void testCorreoNulo() {
        assertFalse(EmailValidator.esCorreoValido(null));
    }

    @Test
    void testCorreoConEspacios() {
        assertFalse(EmailValidator.esCorreoValido("usua rio@mail.com"));
    }

    @Test
    void testCorreoConCaracteresInvalidos() {
        assertFalse(EmailValidator.esCorreoValido("user!@mail.com"));
    }
}
