export function translateValidationsDtos(
  code: string,
  property: string,
): string {
  const traducciones: Record<string, string> = {
    // === Reglas básicas ===
    isNotEmpty: `El campo ${property} es obligatorio.`,
    isEmpty: `El campo ${property} debe estar vacío.`,
    isDefined: `El campo ${property} debe estar definido.`,
    equals: `El campo ${property} no coincide con el valor esperado.`,
    notEquals: `El campo ${property} no debe coincidir con el valor especificado.`,

    // === Tipos ===
    isString: `El campo ${property} debe ser una cadena de texto.`,
    isNumber: `El campo ${property} debe ser un número.`,
    isInt: `El campo ${property} debe ser un número entero.`,
    isBoolean: `El campo ${property} debe ser verdadero o falso.`,
    isArray: `El campo ${property} debe ser una lista (array).`,
    arrayNotEmpty: `El campo ${property} no puede estar vacío.`,
    isEnum: `El campo ${property} no tiene un valor permitido.`,
    isObject: `El campo ${property} debe ser un objeto.`,
    isDate: `El campo ${property} debe ser una fecha.`,
    isDateString: `El campo ${property} debe ser una fecha válida.`,
    isUUID: `El campo ${property} debe ser un UUID válido.`,

    // === Texto y longitud ===
    minLength: `El campo ${property} es demasiado corto.`,
    maxLength: `El campo ${property} excede la longitud permitida.`,
    length: `El campo ${property} debe tener una longitud específica.`,
    matches: `El campo ${property} no cumple con el formato requerido.`,
    isAlpha: `El campo ${property} solo debe contener letras.`,
    isAlphanumeric: `El campo ${property} solo debe contener letras y números.`,
    isAscii: `El campo ${property} contiene caracteres no permitidos.`,
    isLowercase: `El campo ${property} debe estar en minúsculas.`,
    isUppercase: `El campo ${property} debe estar en mayúsculas.`,

    // === Números y rangos ===
    min: `El campo ${property} debe ser mayor o igual al valor mínimo permitido.`,
    max: `El campo ${property} debe ser menor o igual al valor máximo permitido.`,
    isPositive: `El campo ${property} debe ser un número positivo.`,
    isNegative: `El campo ${property} debe ser un número negativo.`,

    // === Formatos ===
    isEmail: `El campo ${property} debe ser un correo electrónico válido.`,
    isUrl: `El campo ${property} debe ser una URL válida.`,
    isPhoneNumber: `El campo ${property} debe ser un número de teléfono válido.`,
    isPostalCode: `El campo ${property} debe ser un código postal válido.`,
    isCreditCard: `El campo ${property} debe ser una tarjeta de crédito válida.`,

    // === Comparaciones ===
    minDate: `El campo ${property} debe ser una fecha posterior o igual a la mínima permitida.`,
    maxDate: `El campo ${property} debe ser una fecha anterior o igual a la máxima permitida.`,
    isBefore: `El campo ${property} debe ser una fecha anterior.`,
    isAfter: `El campo ${property} debe ser una fecha posterior.`,
    equalsToProperty: `El campo ${property} debe coincidir con otro campo.`,

    // === Personalizadas / otras ===
    isJSON: `El campo ${property} debe ser un JSON válido.`,
    isBase64: `El campo ${property} debe estar en formato Base64.`,
    isOptional: `El campo ${property} es opcional.`,
  };

  return traducciones[code] ?? `El campo ${property} no es válido.`;
}
