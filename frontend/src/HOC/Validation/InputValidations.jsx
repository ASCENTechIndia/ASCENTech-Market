export const inputHandlers = {
  name: (e, setFieldValue, fieldName) => {
    const value = e.target.value;
    if (/^[a-zA-Z\u0900-\u097F\u00C0-\u024F\u1E00-\u1EFF ]*$/.test(value)) {
      setFieldValue(fieldName, value);
    }
  },

  phone: (e, setFieldValue, fieldName) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setFieldValue(fieldName, value);
    }
  },

  integer: (e, setFieldValue, fieldName) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFieldValue(fieldName, value);
    }
  },

  amount: (e, setFieldValue, fieldName) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts[1];
    }
    if (parts[1]?.length > 2) {
      value = parts[0] + "." + parts[1].slice(0, 2);
    }
    setFieldValue(fieldName, value);
  },
  aadhaar: (e, setFieldValue, fieldName) => {
    const value = e.target.value;
    if (/^\d{0,12}$/.test(value)) {
      setFieldValue(fieldName, value);
    }
  },
    noSpecialChar: (e, setFieldValue, fieldName) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^a-zA-Z0-9\u0900-\u097F ]/g, "");
    setFieldValue(fieldName, cleaned);
  }
};
