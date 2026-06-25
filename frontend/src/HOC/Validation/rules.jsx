//rules.js
import * as Yup from "yup";
// import { useLanguage } from "../../Context/LanguageContext";

// Regular expressions for validations
const phoneRegExp = /^[6-9]\d{9}$/; // Indian mobile number validation
const nameRegExp = /^[a-zA-Z\u0900-\u097F\u00C0-\u024F\u1E00-\u1EFF ]+$/;
const dateRegExp = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY format
const time24hrRegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Common field validations
export const getValidationRules = (translate) => ({
  name: Yup.string()
    .matches(nameRegExp, translate("Only letters allowed"))
    .required(translate("This field is required")),
  optionalName: Yup.string().matches(
    nameRegExp,
    translate("Only letters allowed")
  ),
  phone: Yup.string()
    .matches(phoneRegExp, translate("Invalid mobile number"))
    .required(translate("Mobile Number is required")),
  chequeNo: Yup.string()
    .matches(/^[0-9]{6}$/, translate("Cheque number must be 6 digits"))
    .required(translate("Cheque number is required")),
  time: Yup.string()
    .matches(
      time24hrRegExp,
      translate(
        "Invalid format, please input time in 24hr format (e.g., 15:30)"
      )
    )
    .required(translate("Time is required")),
  date: Yup.string().required(translate("Date is required")),
  age: Yup.number()
    .typeError(translate("Age must be a number"))
    .min(18, translate("Must be at least 18 years old"))
    .required(translate("Age is required"))
    .max(120, "Age must be realistic"),
  address: Yup.string().required(translate("Address is required")),
  amount: Yup.number()
    .positive(translate("Amount must be greater than 0"))
    .required(translate("Amount is required")),
  aadharNo: Yup.string()
    .matches(/^[0-9]{12}$/, translate("Aadhar number must be 12 digits"))
    .required(translate("Aadhar Number is required")),
  email: Yup.string()
    .email(translate("Invalid email format"))
    .required(translate("Email is required")),
  image: Yup.mixed()
    .test("required-or-existing-url", "Image upload is required", (value) => {
      return value && (typeof value === "string" || value instanceof File);
    })
    .test("fileType", "Only PNG, JPG, or JPEG files are allowed", (value) => {
      if (typeof value === "string") return true; // already uploaded
      return (
        value && ["image/png", "image/jpeg", "image/jpg"].includes(value.type)
      );
    })
    .test("fileSize", "File must be less than 5MB", (value) => {
      if (typeof value === "string") return true; // already uploaded
      return value && value.size <= 5 * 1024 * 1024;
    }),

  documentType: Yup.string().required(translate("Document type is required")),
  requiredFile: Yup.mixed()
    .required(translate("File upload is required")) // Required validation
    .test(
      "fileType",
      translate("Only PDF files are allowed"),
      (value) =>
        !value || // Allows empty value (so required() handles missing files)
        ["application/pdf"].includes(value.type)
    ),
  appNo: Yup.string().required(translate("This field is required")),
  formNo: Yup.string()
    .matches(/^\d+$/, translate("Only numbers allowed"))
    .required(translate("This field is required")),
  selectedOption: Yup.string().required(translate("This field is required")),
  radioOption: Yup.string().required(translate("Please select an option")),
  oldPassword: Yup.string().required(translate("Old password is required")),
  password: Yup.string()
    .min(8, translate("Password must be at least 8 characters"))
    .matches(
      /[A-Z]/,
      translate("Password must include at least one uppercase letter")
    )
    .matches(
      /[a-z]/,
      translate("Password must include at least one lowercase letter")
    )
    .matches(/[0-9]/, translate("Password must include at least one number"))
    .matches(
      /[!@#$%^&*]/,
      translate(
        "Password must include at least one special character (!@#$%^&*)"
      )
    )
    .required(translate("Password is required")),

  //Confirm Password Rule (Must match 'password' field)
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], translate("Passwords must match"))
    .required(translate("Confirm Password is required")),

  text: Yup.string()
  .required(translate("This field is required")),
});
