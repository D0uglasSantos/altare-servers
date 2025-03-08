"use client";

import { useState } from "react";

interface FormData {
  nome: string;
  funcao: string;
  idade: string;
}

export function useServidorForm(
  initialData: FormData = { nome: "", funcao: "", idade: "" }
) {
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ nome: "", funcao: "", idade: "" });
  };

  return { formData, handleInputChange, resetForm, setFormData };
}
