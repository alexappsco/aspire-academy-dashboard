"use client";

import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

type SelectFieldProps = TextFieldProps;

export default function SelectField(props: SelectFieldProps) {
  // Wrapper around TextField with select mode enabled
  // Ensures MenuItem children are used instead of native option elements
  return <TextField select {...props} />;
}
