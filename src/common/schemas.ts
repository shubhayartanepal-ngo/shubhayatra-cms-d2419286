import * as z from "zod";


/**
 * Reusable Messages for Validation Errors
 * These messages can be used across different validation schemas to maintain consistency in error reporting.
 */
const messages = {
  required: {
    email: "Email is required!",
    username: "Username is required!",
    address: "Address is required!",
    contactNumber: "Please enter contact number!",
    phoneNumber: "Contact number is required!",
    password: "Password is required!",
    title: "Title is required!",
    subtitle: "Subtitle is required!",
    description: "Description is required!",
  },
  email: "Please enter a valid email!",
  username: {
    min: "Username should consist of at least 3 character(s)",
    max: "Username should consist of at most 20 character(s)",
  },
  password: {
    min: "Password should consist of at least 8 character(s)",
    complexity:
      "Password must include at least one uppercase letter, one number, and one special character!",
    uppercase: "Password must include at least one uppercase letter!",
    specialChar:
      "Password must include at least one special character (!@#$%^&*)",
    number: "Password must include at least one number!",
  },
  address: {
    min: "Address should consist of at least 3 character(s)",
    max: "Address should consist of at most 20 character(s)",
  },
  contactNumber: {
    min: "Contact number should be at least 10 digits!",
    invalid: "Invalid phone number or mobile number!",
    topBarInvalid:
      "Please enter a valid phone number (e.g., 071-590150 or 9812123434)",
  },
  confirmPassword: "Password does not match!",
  title: "Title should consist of at least 3 character(s)",
  subtitle: "Subtitle should consist of at least 3 character(s)",
  description: "Description should consist of at least 3 character(s)",
};