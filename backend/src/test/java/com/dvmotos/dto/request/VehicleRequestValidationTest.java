package com.dvmotos.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleRequestValidationTest {

  private static ValidatorFactory validatorFactory;
  private static Validator validator;

  @BeforeAll
  static void setUpValidator() {
    validatorFactory = Validation.buildDefaultValidatorFactory();
    validator = validatorFactory.getValidator();
  }

  @AfterAll
  static void closeValidator() {
    validatorFactory.close();
  }

  private VehicleRequest requestWithPlate(String licensePlate) {
    VehicleRequest request = new VehicleRequest();
    request.setClientId(1L);
    request.setLicensePlate(licensePlate);
    request.setBrand("Honda");
    request.setModel("CG 160");
    return request;
  }

  @ParameterizedTest
  @ValueSource(strings = { "ABC-1234", "ABC1234", "ABC1D23" })
  @DisplayName("should accept the old format (with/without hyphen) and the Mercosul format")
  void shouldAcceptValidPlates(String plate) {
    Set<ConstraintViolation<VehicleRequest>> violations = validator.validate(requestWithPlate(plate));

    assertThat(violations).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = { "abc-1234", "abc1d23" })
  @DisplayName("should accept lowercase plates (normalized to uppercase by the service layer)")
  void shouldAcceptLowercasePlates(String plate) {
    Set<ConstraintViolation<VehicleRequest>> violations = validator.validate(requestWithPlate(plate));

    assertThat(violations).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = { "ABCD123", "AB-1234", "1234-ABC", "ABC12345", "ABC-123", "" })
  @DisplayName("should reject malformed plates")
  void shouldRejectInvalidPlates(String plate) {
    Set<ConstraintViolation<VehicleRequest>> violations = validator.validate(requestWithPlate(plate));

    assertThat(violations).isNotEmpty();
  }

  @Test
  @DisplayName("should report the expected message for a malformed plate")
  void shouldReportExpectedMessage() {
    Set<ConstraintViolation<VehicleRequest>> violations = validator.validate(requestWithPlate("ABCD123"));

    assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("licensePlate")
        && v.getMessage().equals("Invalid license plate format. Use ABC-1234 or ABC1D23"));
  }
}
