import * as Yup from "yup";
import { getValidationRules } from "./rules";
//import { useLanguage } from "../../Context/LanguageProvider";

export const ValidationSchemas = (translate) => {
  const validationRules = getValidationRules(translate);

  return {
    FrmTradeMst: Yup.object().shape({
      in_PageTitle: validationRules.selectedOption,
      in_status: validationRules.selectedOption,
      mainmenu: validationRules.selectedOption,
    }),

    FrmDepartmentConfig: Yup.object().shape({
      municipality: validationRules.selectedOption,
    }),

    FrmDesignationConfig: Yup.object().shape({
      municipality: validationRules.selectedOption,
    }),

    FrmSmsSimularor: Yup.object().shape({
      ULBName: validationRules.selectedOption,
      SmsCode: validationRules.selectedOption,
      MobileNo: validationRules.phone,
    }),

    FrmBlockMst: Yup.object({
      Name: validationRules.selectedOption,
      txtPrabhga: validationRules.selectedOption,
      txtVibhag: validationRules.selectedOption,
      BlockName: validationRules.selectedOption,
      BlockCode: validationRules.selectedOption,
      Sequence: validationRules.text,
      acessible: validationRules.radioOption,
    }),

    FrmZoneMst: Yup.object({
      Name: validationRules.selectedOption,
      txtPrabhga: validationRules.selectedOption,
      txtVibhag: validationRules.selectedOption,
      VibhagCode: validationRules.selectedOption,
      Sequence: validationRules.text,
      acessible: validationRules.radioOption,
    }),
    FrmWardMst: Yup.object({
      Name: validationRules.selectedOption,
      txtPrabhga: validationRules.selectedOption,
      PrabhagCode: validationRules.selectedOption,
      Sequence: validationRules.text,
      acessible: validationRules.radioOption,
    }),
    FrmDeparmentMst: Yup.object({
      Name: validationRules.text,
      department: validationRules.text,
      search: validationRules.text,
    }),

    FrmDesignationMst: Yup.object({
      DesignationEng: validationRules.text,
      DesignationMar: validationRules.text,
    }),
    applicationSchedule: Yup.object().shape({
      Sdate: validationRules.date,
      Stime: validationRules.time,
      user: validationRules.selectedOption,
    }),

    visitSchedule: Yup.object().shape({
      radiobtn: validationRules.radioOption,
      address: Yup.string().required(translate("This field is required")),
    }),

    viewappdet: Yup.object().shape({
      fpfee: validationRules.formNo,
      ipefee: validationRules.formNo,
      dsize: validationRules.formNo,
      Purpose: Yup.string().required(translate("This field is required")),
      Amount: validationRules.formNo,
      upletter: validationRules.requiredFile,
      radiobtn: validationRules.radioOption,
    }),

    generatecerti: Yup.object().shape({
      radiobtn: validationRules.radioOption,
    }),

    receiptsearch: Yup.object().shape({
      appNo: validationRules.name,
      receiptNo: validationRules.name,
      receiptDate: validationRules.date,
      appName: validationRules.name,
      division: validationRules.selectedOption,
      price: validationRules.name,
      bankName: validationRules.selectedOption,
      paymentno: validationRules.name,
      paymentDate: validationRules.date,
    }),

    AppliForFinalCertList: Yup.object().shape({
      appNo: validationRules.appNo,
    }),

    // transaction verification page validation
    FrmAppliVerificationMst: Yup.object().shape({
      AAdharNo: validationRules.aadharNo,
      SanchalakName: validationRules.name,
      LicenseNo: validationRules.appNo,
      ContactNo: validationRules.phone,
      Email: validationRules.email,
      Gender: validationRules.radioOption,
      Address: validationRules.address,
      ApplicantType: validationRules.selectedOption,
    }),

    // FrmGeneralReceiptChallanGen
    FrmGeneralReceiptChallanGen: Yup.object().shape({
      ChallanDate: validationRules.selectedOption,
      FromDate: validationRules.selectedOption,
      ToDate: validationRules.selectedOption,
      Prabhag: validationRules.selectedOption,
      PaymentMode: validationRules.selectedOption,
    }),
    FrmAppliVerificationMst: Yup.object().shape({
      AAdharNo: validationRules.aadharNo,
      SanchalakName: validationRules.name,
      LicenseNo: validationRules.appNo,
      ContactNo: validationRules.phone,
      Email: validationRules.email,
      Gender: validationRules.radioOption,
      Address: validationRules.address,
      ApplicantType: validationRules.selectedOption,
    }),
  };

};
