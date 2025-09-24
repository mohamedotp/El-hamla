"use client";
import { setLocale } from "yup";
import { ar } from "yup-locales";

export default function YupLocale() {
  setLocale(ar);

  return null;
}
